/**
 * Sync GSA CONUS per diem rates into Supabase.
 *
 * Requires:
 *   GSA_API_KEY — https://open.gsa.gov/api/perdiem/ (free registration)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (never expose to the browser)
 *
 * Usage:
 *   node scripts/sync-gsa-rates.mjs
 *   node scripts/sync-gsa-rates.mjs --years=2025,2026
 */

import { createClient } from "@supabase/supabase-js";
import { loadDotenv } from "./load-dotenv.mjs";

loadDotenv();

const MONTH_KEYS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MIE_TIERS = {
  2025: [
    [68, 16, 19, 28, 5],
    [74, 18, 20, 31, 5],
    [80, 20, 22, 33, 5],
    [86, 22, 23, 36, 5],
    [92, 23, 26, 38, 5]
  ],
  2026: [
    [68, 16, 19, 28, 5],
    [74, 18, 20, 31, 5],
    [80, 20, 22, 33, 5],
    [86, 22, 23, 36, 5],
    [92, 23, 26, 38, 5]
  ]
};

function parseYearsArg() {
  const arg = process.argv.find((a) => a.startsWith("--years="));
  if (!arg) return [2025, 2026];
  return arg
    .slice("--years=".length)
    .split(",")
    .map((y) => Number(y.trim()))
    .filter(Boolean);
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function gsaFetch(path, apiKey) {
  const url = `https://api.gsa.gov/travel/perdiem/v2${path}`;
  const res = await fetch(url, { headers: { "x-api-key": apiKey } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GSA ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function fiscalYearBounds(year) {
  return {
    start_date: `${year - 1}-10-01`,
    end_date: `${year}-09-30`
  };
}

async function upsertMieTiers(supabase, year) {
  const tiers = MIE_TIERS[year];
  if (!tiers) {
    console.warn(`No embedded MIE tiers for FY ${year}; skipping tier rows.`);
    return;
  }
  const rows = tiers.map(([total, breakfast, lunch, dinner, incidentals]) => ({
    fiscal_year: year,
    total,
    breakfast,
    lunch,
    dinner,
    incidentals
  }));
  const { error } = await supabase.from("mie_tiers").upsert(rows, { onConflict: "fiscal_year,total" });
  if (error) throw error;
}

/** Flat lodging rows from GET /rates/conus/lodging/{year} (includes DID + monthly caps). */
function parseConusLodgingRows(data) {
  if (Array.isArray(data)) {
    return data.filter((r) => r && (r.DID ?? r.did) && (r.State ?? r.state));
  }
  if (data && typeof data === "object") {
    return Object.values(data).filter(
      (r) => r && typeof r === "object" && (r.DID ?? r.did) && (r.State ?? r.state)
    );
  }
  return [];
}

async function syncConusLodging(supabase, year, apiKey) {
  const data = await gsaFetch(`/rates/conus/lodging/${year}`, apiKey);
  const rows = parseConusLodgingRows(data);
  if (!rows.length) {
    throw new Error("No lodging rows returned (GSA API format may have changed)");
  }

  let count = 0;
  for (const row of rows) {
    const did = String(row.DID ?? row.did ?? "");
    const st = String(row.State ?? row.state ?? "").toUpperCase();
    const city = String(row.City ?? row.city ?? "Standard");
    const county = row.County ?? row.county ?? null;
    const mieTotal = Number(row.Meals ?? row.meals ?? row.M_IE ?? 0);
    const isStandard = did === "10000" || city.toLowerCase().includes("standard");
    if (!did || !st) continue;

    const { data: locality, error: locErr } = await supabase
      .from("localities")
      .upsert(
        {
          did,
          state: st,
          city,
          county,
          is_standard: isStandard,
          fiscal_year: year,
          mie_total: mieTotal,
          synced_at: new Date().toISOString()
        },
        { onConflict: "did,state,fiscal_year" }
      )
      .select("id")
      .single();

    if (locErr) throw locErr;

    const lodgingRows = MONTH_KEYS.map((key, idx) => ({
      locality_id: locality.id,
      month: idx + 1,
      max_lodging: Number(row[key] ?? 0)
    }));

    const { error: lodErr } = await supabase
      .from("locality_lodging")
      .upsert(lodgingRows, { onConflict: "locality_id,month" });
    if (lodErr) throw lodErr;
    count++;
  }
  return count;
}

async function syncZipcodes(supabase, year, apiKey) {
  const data = await gsaFetch(`/rates/conus/zipcodes/${year}`, apiKey);
  const rows = Array.isArray(data) ? data : data?.rates ?? [];
  if (!rows.length) return 0;

  const byZip = new Map();
  for (const row of rows) {
    const zip = String(row.Zip ?? row.zip ?? "")
      .padStart(5, "0")
      .slice(0, 5);
    const did = String(row.DID ?? row.did ?? "");
    const state = String(row.ST ?? row.state ?? "").toUpperCase();
    if (zip.length !== 5 || !did || !state) continue;
    byZip.set(zip, { zip, did, state, fiscal_year: year });
  }
  const batch = [...byZip.values()];

  const chunk = 500;
  for (let i = 0; i < batch.length; i += chunk) {
    const slice = batch.slice(i, i + chunk);
    const { error } = await supabase.from("zip_locality").upsert(slice, { onConflict: "zip,fiscal_year" });
    if (error) throw error;
    const done = Math.min(i + chunk, batch.length);
    if (done % 5000 === 0 || done === batch.length) {
      process.stdout.write(`\n    zips ${done}/${batch.length} `);
    }
  }
  return batch.length;
}

async function main() {
  const apiKey = requireEnv("GSA_API_KEY");
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() || process.env.PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL (or PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, serviceKey);
  const years = parseYearsArg();

  console.log(`Syncing FY: ${years.join(", ")}`);

  for (const year of years) {
    const bounds = fiscalYearBounds(year);
    await supabase.from("fiscal_years").upsert({ year, ...bounds });
    await upsertMieTiers(supabase, year);

    process.stdout.write(`  CONUS lodging FY${year}... `);
    let localityCount = 0;
    try {
      localityCount = await syncConusLodging(supabase, year, apiKey);
      console.log(`${localityCount} localities`);
    } catch (e) {
      console.log(`failed: ${e.message}`);
    }

    process.stdout.write(`  ZIP index FY${year}... `);
    try {
      const z = await syncZipcodes(supabase, year, apiKey);
      console.log(`${z} unique zips`);
    } catch (e) {
      console.log(`failed: ${e.message}`);
    }

    console.log(`FY ${year}: ${localityCount} locality rows.`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

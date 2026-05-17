/**
 * Build crew airport search index from OurAirports (IATA codes).
 * https://ourairports.com/data/
 *
 * Usage: node scripts/sync-crew-airports.mjs
 */

import { createWriteStream } from "node:fs";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "data", "crew-airports.json");
const URL = "https://davidmegginson.github.io/ourairports-data/airports.csv";

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const COUNTRY_NAMES = {
  US: "USA",
  CA: "Canada",
  GB: "UK",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  JP: "Japan",
  KR: "South Korea",
  SG: "Singapore",
  AU: "Australia",
  AE: "UAE",
  MX: "Mexico",
  BR: "Brazil",
  IE: "Ireland",
  CH: "Switzerland",
  IT: "Italy",
  ES: "Spain",
  PT: "Portugal",
  CN: "China",
  HK: "Hong Kong",
  TW: "Taiwan",
  IN: "India",
  IL: "Israel",
  NZ: "New Zealand",
  PH: "Philippines",
  TH: "Thailand",
  CO: "Colombia",
  CR: "Costa Rica",
  PA: "Panama",
  DO: "Dominican Republic",
  PR: "Puerto Rico",
  GU: "Guam",
  VI: "US Virgin Islands"
};

async function main() {
  console.log("Downloading OurAirports CSV…");
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const idx = (n) => header.indexOf(n);
  const iType = idx("type");
  const iIata = idx("iata_code");
  const iName = idx("name");
  const iMuni = idx("municipality");
  const iCountry = idx("iso_country");
  const iRegion = idx("iso_region");

  const allowed = new Set(["large_airport", "medium_airport", "small_airport"]);
  const airports = [];
  const seen = new Set();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const code = (cols[iIata] ?? "").trim().toUpperCase();
    if (!code || code.length !== 3 || seen.has(code)) continue;
    const type = cols[iType];
    if (!allowed.has(type)) continue;

    const country = cols[iCountry] ?? "";
    const region = cols[iRegion] ?? "";
    let state;
    if (country === "US" && region.startsWith("US-")) {
      state = region.slice(3);
    }
    const city =
      (cols[iMuni] ?? "").trim() ||
      (cols[iName] ?? "").replace(/ Airport$/i, "").replace(/ Intl\.?$/i, "").trim();

    airports.push({
      code,
      city: city || code,
      state: state || undefined,
      country: COUNTRY_NAMES[country] ?? country,
      region: country === "US" ? "us" : "intl"
    });
    seen.add(code);
  }

  airports.sort((a, b) => a.code.localeCompare(b.code));

  mkdirSync(join(ROOT, "public", "data"), { recursive: true });
  const { writeFileSync } = await import("node:fs");
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        version: 1,
        source: "OurAirports",
        updated: new Date().toISOString().slice(0, 10),
        count: airports.length,
        airports
      },
      null,
      0
    )
  );
  console.log(`Wrote ${airports.length} airports to public/data/crew-airports.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

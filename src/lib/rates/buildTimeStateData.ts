import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  GSA_STANDARD_LODGING,
  GSA_STANDARD_MIE
} from "../../data/gsaCalculatorFaqs";
import { uniqueLocalitySlugs } from "../seo/localitySlug";

export type StateLocalitySummary = {
  city: string;
  county: string | null;
  isStandard: boolean;
  mieTotal: number;
  /** Highest monthly lodging cap in the fiscal year (peak season proxy). */
  peakLodging: number | null;
  /** GSA destination ID — used for calculator deep links. */
  did?: string;
  /** URL slug for NSA pages (`/states/ca/los-angeles/`). Omitted for standard CONUS. */
  slug?: string;
  /** Calendar-month lodging caps (1–12). Present on NSA pages. */
  lodgingByMonth?: Record<number, number>;
};

export type ZipDidMapping = {
  did: string;
  state: string;
};

function readSupabaseEnv(): { url: string; key: string } {
  const fromProcess =
    typeof process !== "undefined"
      ? {
          url: process.env.PUBLIC_SUPABASE_URL?.trim() ?? "",
          key: process.env.PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ""
        }
      : { url: "", key: "" };

  if (fromProcess.url && fromProcess.key) return fromProcess;

  return {
    url: import.meta.env.PUBLIC_SUPABASE_URL?.trim() ?? "",
    key: import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ""
  };
}

function canFetchAtBuild(): boolean {
  const { url, key } = readSupabaseEnv();
  if (!url || !key) return false;
  if (url.includes("YOUR_PROJECT") || url.includes("placeholder.supabase.co")) return false;
  if (key === "placeholder-anon-key" || key.includes("...")) return false;
  return url.includes("supabase.co");
}

async function fetchAllLodgingByLocality(
  supabase: SupabaseClient
): Promise<Map<string, Record<number, number>>> {
  const byId = new Map<string, Record<number, number>>();
  const pageSize = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("locality_lodging")
      .select("locality_id, month, max_lodging")
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn("[state-pages] locality_lodging fetch failed:", error.message);
      break;
    }
    if (!data?.length) break;

    for (const row of data) {
      const id = row.locality_id as string;
      const month = Number(row.month);
      const amount = Number(row.max_lodging);
      const months = byId.get(id) ?? {};
      months[month] = amount;
      byId.set(id, months);
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return byId;
}

function peakFromMonths(months: Record<number, number> | undefined): number | null {
  if (!months) return null;
  const values = Object.values(months);
  if (!values.length) return null;
  return Math.max(...values);
}

function assignNsaSlugs(list: StateLocalitySummary[]): void {
  const nsas = list.filter((l) => !l.isStandard);
  const slugs = uniqueLocalitySlugs(
    nsas.map((l) => ({ city: l.city, county: l.county, did: l.did }))
  );
  nsas.forEach((loc, i) => {
    loc.slug = slugs[i];
  });
}

let cachedByFy = new Map<number, Promise<Map<string, StateLocalitySummary[]>>>();

/** Load all CONUS localities for a fiscal year, grouped by state (build-time SEO pages). */
export async function fetchLocalitiesByStateForBuild(
  fiscalYear: number
): Promise<Map<string, StateLocalitySummary[]>> {
  const existing = cachedByFy.get(fiscalYear);
  if (existing) return existing;
  const pending = loadLocalitiesByState(fiscalYear);
  cachedByFy.set(fiscalYear, pending);
  return pending;
}

async function loadLocalitiesByState(
  fiscalYear: number
): Promise<Map<string, StateLocalitySummary[]>> {
  const map = new Map<string, StateLocalitySummary[]>();
  if (!canFetchAtBuild()) {
    console.warn(
      "[state-pages] Skipping Supabase fetch — set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY for build."
    );
    return map;
  }

  const { url, key } = readSupabaseEnv();
  const supabase = createClient(url, key);

  const { data: locs, error: locErr } = await supabase
    .from("localities")
    .select("id, did, state, city, county, is_standard, mie_total")
    .eq("fiscal_year", fiscalYear)
    .order("is_standard", { ascending: true })
    .order("city");

  if (locErr) {
    console.warn("[state-pages] localities fetch failed:", locErr.message);
    return map;
  }
  if (!locs?.length) {
    console.warn(`[state-pages] No localities for FY ${fiscalYear}.`);
    return map;
  }

  const lodgingById = await fetchAllLodgingByLocality(supabase);

  for (const loc of locs) {
    const st = loc.state as string;
    const list = map.get(st) ?? [];

    if (loc.is_standard && list.some((l) => l.isStandard)) continue;

    const lodgingByMonth = lodgingById.get(loc.id as string);
    const parsedMie = Number(loc.mie_total);
    const parsedPeak = peakFromMonths(lodgingByMonth);
    const isStandard = Boolean(loc.is_standard);
    list.push({
      city: (loc.city as string).trim(),
      county: loc.county as string | null,
      isStandard,
      mieTotal:
        isStandard && (!Number.isFinite(parsedMie) || parsedMie <= 0)
          ? GSA_STANDARD_MIE
          : parsedMie,
      peakLodging:
        isStandard && (parsedPeak == null || parsedPeak <= 0)
          ? GSA_STANDARD_LODGING
          : parsedPeak,
      did: (loc.did as string | undefined) ?? undefined,
      lodgingByMonth
    });
    map.set(st, list);
  }

  for (const list of map.values()) {
    assignNsaSlugs(list);
  }

  return map;
}

let cachedZipsByFy = new Map<number, Promise<Map<string, ZipDidMapping>>>();

/** ZIP → GSA DID for a fiscal year (build-time city pages). */
export async function fetchZipDidMapForBuild(
  fiscalYear: number
): Promise<Map<string, ZipDidMapping>> {
  const existing = cachedZipsByFy.get(fiscalYear);
  if (existing) return existing;
  const pending = loadZipDidMap(fiscalYear);
  cachedZipsByFy.set(fiscalYear, pending);
  return pending;
}

async function loadZipDidMap(fiscalYear: number): Promise<Map<string, ZipDidMapping>> {
  const map = new Map<string, ZipDidMapping>();
  if (!canFetchAtBuild()) return map;

  const { url, key } = readSupabaseEnv();
  const supabase = createClient(url, key);
  const pageSize = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("zip_locality")
      .select("zip, did, state")
      .eq("fiscal_year", fiscalYear)
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn("[state-pages] zip_locality fetch failed:", error.message);
      break;
    }
    if (!data?.length) break;

    for (const row of data) {
      const zip = String(row.zip ?? "").padStart(5, "0").slice(0, 5);
      const did = String(row.did ?? "");
      const state = String(row.state ?? "").toUpperCase();
      if (zip.length === 5 && did && state) {
        map.set(zip, { did, state });
      }
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return map;
}

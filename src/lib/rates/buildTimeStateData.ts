import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type StateLocalitySummary = {
  city: string;
  county: string | null;
  isStandard: boolean;
  mieTotal: number;
  /** Highest monthly lodging cap in the fiscal year (peak season proxy). */
  peakLodging: number | null;
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

async function fetchAllLodgingPeaks(supabase: SupabaseClient): Promise<Map<string, number>> {
  const peakById = new Map<string, number>();
  const pageSize = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("locality_lodging")
      .select("locality_id, max_lodging")
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn("[state-pages] locality_lodging fetch failed:", error.message);
      break;
    }
    if (!data?.length) break;

    for (const row of data) {
      const n = Number(row.max_lodging);
      const id = row.locality_id as string;
      const cur = peakById.get(id);
      if (cur === undefined || n > cur) peakById.set(id, n);
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return peakById;
}

/** Load all CONUS localities for a fiscal year, grouped by state (build-time SEO pages). */
export async function fetchLocalitiesByStateForBuild(
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
    .select("id, state, city, county, is_standard, mie_total")
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

  const peakById = await fetchAllLodgingPeaks(supabase);

  for (const loc of locs) {
    const st = loc.state as string;
    const list = map.get(st) ?? [];

    if (loc.is_standard && list.some((l) => l.isStandard)) continue;

    list.push({
      city: (loc.city as string).trim(),
      county: loc.county as string | null,
      isStandard: loc.is_standard,
      mieTotal: Number(loc.mie_total),
      peakLodging: peakById.get(loc.id) ?? null
    });
    map.set(st, list);
  }

  return map;
}

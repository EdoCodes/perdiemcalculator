import { getSupabaseBrowserClient } from "../supabase";
import type { LocalityRate } from "../perdiem/types";

export type LocalityListItem = {
  id: string;
  did: string;
  state: string;
  city: string;
  county: string | null;
  isStandard: boolean;
  fiscalYear: number;
  mieTotal: number;
};

export async function fetchLocalitiesForState(
  state: string,
  fiscalYear: number
): Promise<LocalityListItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("localities")
    .select("id, did, state, city, county, is_standard, fiscal_year, mie_total")
    .eq("state", state.toUpperCase())
    .eq("fiscal_year", fiscalYear)
    .order("is_standard", { ascending: true })
    .order("city");

  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    did: r.did,
    state: r.state,
    city: r.city,
    county: r.county,
    isStandard: r.is_standard,
    fiscalYear: r.fiscal_year,
    mieTotal: Number(r.mie_total)
  }));
}

export async function fetchLocalityWithLodging(
  localityId: string
): Promise<LocalityRate | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: loc, error: locErr } = await supabase
    .from("localities")
    .select("id, did, state, city, county, is_standard, fiscal_year, mie_total")
    .eq("id", localityId)
    .maybeSingle();

  if (locErr) throw locErr;
  if (!loc) return null;

  const { data: lodging, error: lodErr } = await supabase
    .from("locality_lodging")
    .select("month, max_lodging")
    .eq("locality_id", localityId);

  if (lodErr) throw lodErr;

  const lodgingByMonth: Record<number, number> = {};
  for (const row of lodging ?? []) {
    lodgingByMonth[row.month] = Number(row.max_lodging);
  }

  return {
    id: loc.id,
    did: loc.did,
    state: loc.state,
    city: loc.city,
    county: loc.county,
    isStandard: loc.is_standard,
    fiscalYear: loc.fiscal_year,
    mieTotal: Number(loc.mie_total),
    lodgingByMonth
  };
}

export async function resolveLocalityByZip(
  zip: string,
  fiscalYear: number
): Promise<LocalityListItem | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const normalized = zip.replace(/\D/g, "").slice(0, 5);
  if (normalized.length !== 5) return null;

  const { data: mapping, error: mapErr } = await supabase
    .from("zip_locality")
    .select("did, state")
    .eq("zip", normalized)
    .eq("fiscal_year", fiscalYear)
    .maybeSingle();

  if (mapErr) throw mapErr;
  if (!mapping) return null;

  const { data: loc, error: locErr } = await supabase
    .from("localities")
    .select("id, did, state, city, county, is_standard, fiscal_year, mie_total")
    .eq("did", mapping.did)
    .eq("state", mapping.state)
    .eq("fiscal_year", fiscalYear)
    .maybeSingle();

  if (locErr) throw locErr;
  if (!loc) return null;

  return {
    id: loc.id,
    did: loc.did,
    state: loc.state,
    city: loc.city,
    county: loc.county,
    isStandard: loc.is_standard,
    fiscalYear: loc.fiscal_year,
    mieTotal: Number(loc.mie_total)
  };
}

export async function fetchLocalityRatesForTripByDid(
  did: string,
  state: string,
  fiscalYears: number[]
): Promise<Map<number, LocalityRate>> {
  const supabase = getSupabaseBrowserClient();
  const map = new Map<number, LocalityRate>();
  if (!supabase) return map;

  for (const fy of [...new Set(fiscalYears)]) {
    const { data: loc, error: locErr } = await supabase
      .from("localities")
      .select("id, did, state, city, county, is_standard, fiscal_year, mie_total")
      .eq("did", did)
      .eq("state", state.toUpperCase())
      .eq("fiscal_year", fy)
      .maybeSingle();

    if (locErr) throw locErr;
    if (!loc) continue;

    const { data: lodging, error: lodErr } = await supabase
      .from("locality_lodging")
      .select("month, max_lodging")
      .eq("locality_id", loc.id);

    if (lodErr) throw lodErr;

    const lodgingByMonth: Record<number, number> = {};
    for (const row of lodging ?? []) {
      lodgingByMonth[row.month] = Number(row.max_lodging);
    }

    map.set(fy, {
      id: loc.id,
      did: loc.did,
      state: loc.state,
      city: loc.city,
      county: loc.county,
      isStandard: loc.is_standard,
      fiscalYear: loc.fiscal_year,
      mieTotal: Number(loc.mie_total),
      lodgingByMonth
    });
  }
  return map;
}

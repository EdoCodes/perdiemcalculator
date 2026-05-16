import { isSupabaseConfigured, supabaseRest } from "../supabaseRest";
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

type LocalityRow = {
  id: string;
  did: string;
  state: string;
  city: string;
  county: string | null;
  is_standard: boolean;
  fiscal_year: number;
  mie_total: number;
};

type LodgingRow = { month: number; max_lodging: number };

function mapLocality(r: LocalityRow): LocalityListItem {
  return {
    id: r.id,
    did: r.did,
    state: r.state,
    city: r.city,
    county: r.county,
    isStandard: r.is_standard,
    fiscalYear: r.fiscal_year,
    mieTotal: Number(r.mie_total)
  };
}

export async function fetchLocalitiesForState(
  state: string,
  fiscalYear: number
): Promise<LocalityListItem[]> {
  if (!isSupabaseConfigured()) return [];

  const st = state.toUpperCase();
  const data = await supabaseRest<LocalityRow[]>(
    `localities?state=eq.${encodeURIComponent(st)}&fiscal_year=eq.${fiscalYear}&select=id,did,state,city,county,is_standard,fiscal_year,mie_total&order=is_standard.asc,city.asc`
  );

  return (data ?? []).map(mapLocality);
}

async function fetchLodgingByMonth(localityId: string): Promise<Record<number, number>> {
  const lodging = await supabaseRest<LodgingRow[]>(
    `locality_lodging?locality_id=eq.${encodeURIComponent(localityId)}&select=month,max_lodging`
  );
  const lodgingByMonth: Record<number, number> = {};
  for (const row of lodging ?? []) {
    lodgingByMonth[row.month] = Number(row.max_lodging);
  }
  return lodgingByMonth;
}

export async function fetchLocalityWithLodging(localityId: string): Promise<LocalityRate | null> {
  if (!isSupabaseConfigured()) return null;

  const rows = await supabaseRest<LocalityRow[]>(
    `localities?id=eq.${encodeURIComponent(localityId)}&select=id,did,state,city,county,is_standard,fiscal_year,mie_total&limit=1`
  );
  const loc = rows[0];
  if (!loc) return null;

  const lodgingByMonth = await fetchLodgingByMonth(localityId);

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
  if (!isSupabaseConfigured()) return null;

  const normalized = zip.replace(/\D/g, "").slice(0, 5);
  if (normalized.length !== 5) return null;

  const mappings = await supabaseRest<{ did: string; state: string }[]>(
    `zip_locality?zip=eq.${encodeURIComponent(normalized)}&fiscal_year=eq.${fiscalYear}&select=did,state&limit=1`
  );
  const mapping = mappings[0];
  if (!mapping) return null;

  const locs = await supabaseRest<LocalityRow[]>(
    `localities?did=eq.${encodeURIComponent(mapping.did)}&state=eq.${encodeURIComponent(mapping.state)}&fiscal_year=eq.${fiscalYear}&select=id,did,state,city,county,is_standard,fiscal_year,mie_total&limit=1`
  );
  const loc = locs[0];
  if (!loc) return null;

  return mapLocality(loc);
}

export async function fetchLocalityRatesForTripByDid(
  did: string,
  state: string,
  fiscalYears: number[]
): Promise<Map<number, LocalityRate>> {
  const map = new Map<number, LocalityRate>();
  if (!isSupabaseConfigured()) return map;

  const st = state.toUpperCase();

  for (const fy of [...new Set(fiscalYears)]) {
    const locs = await supabaseRest<LocalityRow[]>(
      `localities?did=eq.${encodeURIComponent(did)}&state=eq.${encodeURIComponent(st)}&fiscal_year=eq.${fy}&select=id,did,state,city,county,is_standard,fiscal_year,mie_total&limit=1`
    );
    const loc = locs[0];
    if (!loc) continue;

    const lodgingByMonth = await fetchLodgingByMonth(loc.id);

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

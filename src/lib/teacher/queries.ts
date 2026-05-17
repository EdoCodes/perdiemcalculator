import { getStateEducationRule, type StateEducationRule } from "../../data/stateEducationRules";
import { isSupabaseConfigured, supabaseRest } from "../supabaseRest";

type RuleRow = {
  state: string;
  name: string;
  uses_gsa_destination: boolean;
  source_url: string;
  source_label: string;
  mie_cap: number | null;
  lodging_cap: number | null;
  day_trip_mie: number | null;
  travel_day_fraction: number;
  partial_travel_days: boolean;
  notes: string | null;
};

function mapRow(r: RuleRow): StateEducationRule {
  return {
    state: r.state,
    name: r.name,
    usesGsaDestination: r.uses_gsa_destination,
    sourceUrl: r.source_url,
    sourceLabel: r.source_label,
    mieCap: r.mie_cap != null ? Number(r.mie_cap) : null,
    lodgingCap: r.lodging_cap != null ? Number(r.lodging_cap) : null,
    dayTripMie: r.day_trip_mie != null ? Number(r.day_trip_mie) : null,
    travelDayFraction: Number(r.travel_day_fraction),
    partialTravelDays: r.partial_travel_days,
    notes: r.notes ?? undefined
  };
}

/** State overlay for teacher travel; falls back to bundled rules if DB unavailable. */
export async function fetchStateEducationRule(stateAbbr: string): Promise<StateEducationRule> {
  const fallback = getStateEducationRule(stateAbbr);
  if (!isSupabaseConfigured()) return fallback;

  const st = stateAbbr.toUpperCase();
  try {
    const rows = await supabaseRest<RuleRow[]>(
      `state_education_travel_rules?state=eq.${encodeURIComponent(st)}&select=state,name,uses_gsa_destination,source_url,source_label,mie_cap,lodging_cap,day_trip_mie,travel_day_fraction,partial_travel_days,notes&limit=1`
    );
    if (rows?.[0]) return mapRow(rows[0]);
  } catch {
    /* use bundled */
  }
  return fallback;
}

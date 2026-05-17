import { fiscalYearForDate } from "../perdiem/fiscalYear";
import { fetchLocalitiesForState, fetchLocalityRatesForTripByDid } from "../rates/queries";
import { pickLocalityForCity } from "./localityMatch";
import { eachTripDayIso } from "./assignDays";
import { calculateCrewFullTrip } from "./calculateTrip";
import type {
  CrewCalculationInput,
  CrewCalculationResult,
  CrewContractOptions,
  CrewCalcMode,
  CrewLayoverLeg
} from "./types";

function formatLocalityLabel(city: string, isStandard: boolean): string {
  return isStandard ? `${city} (standard rate)` : city;
}

/** Attach GSA did/state (and intl M&IE) to legs before calculation. */
export async function enrichLegsWithGsa(
  legs: CrewLayoverLeg[],
  tripStart: string,
  defaultIntlMie: number
): Promise<CrewLayoverLeg[] | { error: string }> {
  const fy = fiscalYearForDate(new Date(tripStart + "T12:00:00"));
  const out: CrewLayoverLeg[] = [];

  for (const leg of legs) {
    if (leg.region === "intl") {
      out.push({
        ...leg,
        intlMieRate: leg.intlMieRate ?? defaultIntlMie
      });
      continue;
    }
    if (leg.gsaDid && leg.gsaState) {
      out.push(leg);
      continue;
    }
    if (!leg.state) {
      return { error: `${leg.airportCode}: US layover needs a state for GSA lookup.` };
    }
    const localities = await fetchLocalitiesForState(leg.state, fy);
    const match = pickLocalityForCity(localities, leg.city);
    if (!match) {
      return { error: `No GSA locality found for ${leg.city}, ${leg.state}.` };
    }
    out.push({
      ...leg,
      gsaDid: match.did,
      gsaState: match.state,
      gsaLocalityLabel: formatLocalityLabel(match.city, match.isStandard)
    });
  }
  return out;
}

export async function resolveGsaMieByLegFy(
  legs: CrewLayoverLeg[],
  tripStart: string,
  tripEnd: string
): Promise<Map<string, Map<number, number>> | { error: string }> {
  const out = new Map<string, Map<number, number>>();
  const days = eachTripDayIso(tripStart, tripEnd);
  const fys = [...new Set(days.map((iso) => fiscalYearForDate(new Date(iso + "T12:00:00"))))];

  for (const leg of legs) {
    if (leg.region === "intl") continue;
    if (!leg.gsaDid || !leg.gsaState) {
      return { error: `Select GSA locality for ${leg.airportCode}.` };
    }
    const rates = await fetchLocalityRatesForTripByDid(leg.gsaDid, leg.gsaState, fys);
    if (rates.size === 0) {
      return { error: `Could not load GSA rates for ${leg.airportCode}.` };
    }
    const byFy = new Map<number, number>();
    for (const [fy, loc] of rates) {
      byFy.set(fy, loc.mieTotal);
    }
    out.set(leg.id, byFy);
  }
  return out;
}

export async function runCrewCalculation(params: {
  calcMode: CrewCalcMode;
  tripStart: string;
  tripEnd: string;
  legs: CrewLayoverLeg[];
  contract?: CrewContractOptions;
  defaultIntlMie?: number;
}): Promise<CrewCalculationResult | { error: string }> {
  const { calcMode, tripStart, tripEnd, contract, defaultIntlMie = 68 } = params;
  const showGsa = calcMode === "gsa" || calcMode === "both";

  let legs = params.legs;
  if (showGsa) {
    const enriched = await enrichLegsWithGsa(legs, tripStart, defaultIntlMie);
    if ("error" in enriched) return enriched;
    legs = enriched;
  }

  let gsaMieByLegFy = new Map<string, Map<number, number>>();
  if (showGsa) {
    const resolved = await resolveGsaMieByLegFy(legs, tripStart, tripEnd);
    if ("error" in resolved) return resolved;
    gsaMieByLegFy = resolved;
  }

  const input: CrewCalculationInput = {
    calcMode,
    tripStart,
    tripEnd,
    legs,
    contract,
    gsaMieByLegFy
  };

  const result = calculateCrewFullTrip(input);
  if ("error" in result) return result;
  return { ...result, enrichedLegs: legs };
}

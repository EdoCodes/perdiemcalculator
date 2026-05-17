import { calculateCrewTrip } from "./calculate";
import { fiscalYearForDate } from "../perdiem/fiscalYear";
import type { CrewCalculationInput, CrewCalculationResult, CrewDaySegment } from "./types";
import { eachTripDayIso, legForDate } from "./assignDays";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function contractRateForLeg(
  leg: { region: "us" | "intl" },
  contract: NonNullable<CrewCalculationInput["contract"]>
): number {
  if (contract.tripType === "domestic") return contract.domesticRate;
  if (contract.tripType === "international") return contract.internationalRate;
  return leg.region === "intl" ? contract.internationalRate : contract.domesticRate;
}

export function calculateCrewFullTrip(
  input: CrewCalculationInput
): CrewCalculationResult | { error: string } {
  const { tripStart, tripEnd, legs, contract, gsaMieByLegFy, calcMode } = input;
  const days = eachTripDayIso(tripStart, tripEnd);
  if (!days.length) return { error: "Return date must be on or after departure date." };

  const showContract = calcMode === "contract" || calcMode === "both";
  const showGsa = calcMode === "gsa" || calcMode === "both";

  if (showContract && contract?.rateMode === "per-hour") {
    const trip = calculateCrewTrip(
      tripStart,
      tripEnd,
      contract.startTime,
      contract.endTime,
      {
        rateMode: contract.rateMode,
        tripType: contract.tripType,
        domesticRate: contract.domesticRate,
        internationalRate: contract.internationalRate,
        partialTravelDays: contract.partialTravelDays
      }
    );
    if ("error" in trip) return trip;
    return {
      contractTotal: trip.total,
      gsaTotal: 0,
      daySegments: [],
      contractDays: trip.days
    };
  }

  const segments: CrewDaySegment[] = [];
  let contractTotal = 0;
  let gsaTotal = 0;

  for (let i = 0; i < days.length; i++) {
    const iso = days[i]!;
    const leg = legForDate(iso, legs);
    if (!leg) continue;

    const isFirstDay = i === 0;
    const isLastDay = i === days.length - 1;
    const isTravelDay = isFirstDay || isLastDay;
    const travelMult =
      days.length > 1 && isTravelDay ? 0.75 : 1;

    let contractAmount = 0;
    let gsaAmount = 0;
    let contractMult = 1;
    let gsaMult = 1;

    if (showContract && contract) {
      const rate = contractRateForLeg(leg, contract);
      contractMult =
        contract.partialTravelDays && isTravelDay && days.length > 1 ? 0.75 : 1;
      contractAmount = round2(rate * contractMult);
      contractTotal += contractAmount;
    }

    if (showGsa) {
      const fy = fiscalYearForDate(new Date(iso + "T12:00:00"));
      const mie =
        leg.region === "intl"
          ? (leg.intlMieRate ?? 68)
          : (gsaMieByLegFy.get(leg.id)?.get(fy) ?? null);
      if (mie == null) {
        return {
          error: `No GSA M&IE rate for ${leg.airportCode} (FY ${fy}).`
        };
      }
      gsaMult = travelMult;
      gsaAmount = round2(mie * gsaMult);
      gsaTotal += gsaAmount;
    }

    segments.push({
      date: iso,
      airportCode: leg.airportCode,
      city: leg.city,
      legId: leg.id,
      contractAmount,
      gsaAmount,
      contractMultiplier: contractMult,
      gsaMultiplier: gsaMult,
      isTravelDay
    });
  }

  return {
    contractTotal: round2(contractTotal),
    gsaTotal: round2(gsaTotal),
    daySegments: segments
  };
}

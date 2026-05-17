import { eachTripDay, fiscalYearForDate, formatIsoDate } from "../perdiem/fiscalYear";

export type CrewGsaDayBreakdown = {
  date: string;
  fiscalYear: number;
  airportCode?: string;
  localityLabel?: string;
  mieRate: number;
  multiplier: number;
  isTravelDay: boolean;
  dailyTotal: number;
};

export type CrewGsaTripResult = {
  days: CrewGsaDayBreakdown[];
  totalMie: number;
  dayCount: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** IRS-style M&IE total: 75% on first and last calendar day when trip spans 2+ days. */
export function calculateCrewGsaMieTrip(
  startIso: string,
  endIso: string,
  mieRateForDate: (iso: string, fy: number) => number | null,
  options: {
    partialTravelDays: boolean;
    airportCode?: string;
    localityLabel?: string;
  }
): CrewGsaTripResult | { error: string } {
  const tripDays = eachTripDay(startIso, endIso);
  if (tripDays.length === 0) {
    return { error: "Return date must be on or after departure date." };
  }

  const breakdown: CrewGsaDayBreakdown[] = [];
  let totalMie = 0;

  for (let i = 0; i < tripDays.length; i++) {
    const date = tripDays[i];
    const iso = formatIsoDate(date);
    const fy = fiscalYearForDate(date);
    const mieRate = mieRateForDate(iso, fy);
    if (mieRate == null || mieRate < 0) {
      return { error: `No GSA M&IE rate for ${iso} (fiscal year ${fy}).` };
    }

    const isFirstDay = i === 0;
    const isLastDay = i === tripDays.length - 1;
    const isTravelDay = isFirstDay || isLastDay;
    const multiplier =
      options.partialTravelDays && isTravelDay && tripDays.length > 1 ? 0.75 : 1;
    const dailyTotal = round2(mieRate * multiplier);

    breakdown.push({
      date: iso,
      fiscalYear: fy,
      airportCode: options.airportCode,
      localityLabel: options.localityLabel,
      mieRate,
      multiplier,
      isTravelDay,
      dailyTotal
    });
    totalMie += dailyTotal;
  }

  return {
    days: breakdown,
    totalMie: round2(totalMie),
    dayCount: tripDays.length
  };
}

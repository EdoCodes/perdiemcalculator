import { eachTripDay, formatIsoDate } from "../perdiem/fiscalYear";

export type CrewRateMode = "per-day" | "per-hour";
export type CrewTripType = "domestic" | "international" | "mixed";

export type CrewCalculatorOptions = {
  rateMode: CrewRateMode;
  tripType: CrewTripType;
  domesticRate: number;
  internationalRate: number;
  /** When true, first and last calendar days pay 75% (common travel-day convention). */
  partialTravelDays: boolean;
  /** For mixed trips: ISO dates that use the international rate. */
  internationalDates?: Set<string>;
};

export type CrewDayBreakdown = {
  date: string;
  isFirstDay: boolean;
  isLastDay: boolean;
  isTravelDay: boolean;
  rateApplied: number;
  multiplier: number;
  dailyTotal: number;
  tripSegment: "domestic" | "international";
};

export type CrewTripResult = {
  days: CrewDayBreakdown[];
  total: number;
  totalHours?: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function rateForDay(
  iso: string,
  options: CrewCalculatorOptions
): { rate: number; segment: "domestic" | "international" } {
  if (options.tripType === "domestic") {
    return { rate: options.domesticRate, segment: "domestic" };
  }
  if (options.tripType === "international") {
    return { rate: options.internationalRate, segment: "international" };
  }
  const intl = options.internationalDates?.has(iso) ?? false;
  return intl
    ? { rate: options.internationalRate, segment: "international" }
    : { rate: options.domesticRate, segment: "domestic" };
}

export function calculateCrewTrip(
  startIso: string,
  endIso: string,
  startTime: string,
  endTime: string,
  options: CrewCalculatorOptions
): CrewTripResult | { error: string } {
  if (options.domesticRate < 0 || options.internationalRate < 0) {
    return { error: "Rates must be zero or positive." };
  }

  if (options.rateMode === "per-hour") {
    const start = new Date(`${startIso}T${startTime}`);
    const end = new Date(`${endIso}T${endTime}`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { error: "Invalid date or time." };
    }
    if (end <= start) {
      return { error: "End must be after start." };
    }
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const rate =
      options.tripType === "international"
        ? options.internationalRate
        : options.domesticRate;
    return {
      days: [],
      total: round2(hours * rate),
      totalHours: round2(hours)
    };
  }

  const tripDays = eachTripDay(startIso, endIso);
  if (tripDays.length === 0) {
    return { error: "Return date must be on or after departure date." };
  }

  const breakdown: CrewDayBreakdown[] = [];
  let total = 0;

  for (let i = 0; i < tripDays.length; i++) {
    const date = tripDays[i];
    const iso = formatIsoDate(date);
    const isFirstDay = i === 0;
    const isLastDay = i === tripDays.length - 1;
    const isTravelDay = isFirstDay || isLastDay;
    const { rate, segment } = rateForDay(iso, options);
    const multiplier =
      options.partialTravelDays && isTravelDay && tripDays.length > 1 ? 0.75 : 1;
    const dailyTotal = round2(rate * multiplier);

    breakdown.push({
      date: iso,
      isFirstDay,
      isLastDay,
      isTravelDay,
      rateApplied: rate,
      multiplier,
      dailyTotal,
      tripSegment: segment
    });
    total += dailyTotal;
  }

  return { days: breakdown, total: round2(total) };
}

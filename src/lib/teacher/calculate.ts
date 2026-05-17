import { eachTripDay, formatIsoDate } from "../perdiem/fiscalYear";

export type TeacherTripPurpose =
  | "conference"
  | "field-trip"
  | "professional-development"
  | "other";

export type TeacherCalculatorOptions = {
  dailyMealsRate: number;
  lodgingPerNight: number;
  /** Number of overnight stays; 0 skips lodging. */
  lodgingNights: number;
  partialTravelDays: boolean;
};

export type TeacherDayBreakdown = {
  date: string;
  isFirstDay: boolean;
  isLastDay: boolean;
  isTravelDay: boolean;
  multiplier: number;
  mealsTotal: number;
};

export type TeacherCustomTripResult = {
  mode: "custom";
  days: TeacherDayBreakdown[];
  mealsSubtotal: number;
  lodgingSubtotal: number;
  total: number;
  lodgingNights: number;
};

export type TeacherTripResult = TeacherCustomTripResult;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateTeacherTrip(
  startIso: string,
  endIso: string,
  options: TeacherCalculatorOptions
): TeacherCustomTripResult | { error: string } {
  if (options.dailyMealsRate < 0 || options.lodgingPerNight < 0) {
    return { error: "Rates must be zero or positive." };
  }
  if (options.lodgingNights < 0) {
    return { error: "Lodging nights cannot be negative." };
  }

  const tripDays = eachTripDay(startIso, endIso);
  if (tripDays.length === 0) {
    return { error: "Return date must be on or after departure date." };
  }

  const breakdown: TeacherDayBreakdown[] = [];
  let mealsSubtotal = 0;

  for (let i = 0; i < tripDays.length; i++) {
    const date = tripDays[i];
    const iso = formatIsoDate(date);
    const isFirstDay = i === 0;
    const isLastDay = i === tripDays.length - 1;
    const isTravelDay = isFirstDay || isLastDay;
    const multiplier =
      options.partialTravelDays && isTravelDay && tripDays.length > 1 ? 0.75 : 1;
    const mealsTotal = round2(options.dailyMealsRate * multiplier);

    breakdown.push({
      date: iso,
      isFirstDay,
      isLastDay,
      isTravelDay,
      multiplier,
      mealsTotal
    });
    mealsSubtotal += mealsTotal;
  }

  const lodgingSubtotal = round2(options.lodgingPerNight * options.lodgingNights);

  return {
    mode: "custom",
    days: breakdown,
    mealsSubtotal: round2(mealsSubtotal),
    lodgingSubtotal,
    total: round2(mealsSubtotal + lodgingSubtotal),
    lodgingNights: options.lodgingNights
  };
}

/** Default overnight count: trip length minus one (no lodging on single-day trips). */
export function defaultLodgingNights(startIso: string, endIso: string): number {
  const days = eachTripDay(startIso, endIso).length;
  return days > 1 ? days - 1 : 0;
}

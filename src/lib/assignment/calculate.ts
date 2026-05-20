import type { LocalityRate } from "../perdiem/types";
import { eachTripDay, fiscalYearForDate, formatIsoDate } from "../perdiem/fiscalYear";

export type AssignmentDayBreakdown = {
  date: string;
  fiscalYear: number;
  isTravelDay: boolean;
  gsaMie: number;
  mieAllowed: number;
  gsaLodging: number;
  lodgingAllowed: number;
  dailyTotal: number;
};

export type StipendCapStatus = "under" | "within" | "over";

export type EmployerCapCompare = {
  compareMode: "weekly" | "daily";
  weeklyHousing: number;
  weeklyMeals: number;
  dailyLodging: number;
  dailyMie: number;
  assignmentWeeks: number;
  employerHousingTotal: number;
  employerMealsTotal: number;
  employerTotal: number;
  gsaLodgingCap: number;
  gsaMieCap: number;
  housingStatus: StipendCapStatus;
  mealsStatus: StipendCapStatus;
  housingOverAmount: number;
  mealsOverAmount: number;
};

export type AssignmentResult = {
  destinationLabel: string;
  days: AssignmentDayBreakdown[];
  mealsSubtotal: number;
  lodgingSubtotal: number;
  gsaTotal: number;
  lodgingNights: number;
  dayCount: number;
  employerCompare: EmployerCapCompare | null;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function capStatus(employer: number, cap: number): StipendCapStatus {
  const delta = round2(employer - cap);
  if (Math.abs(delta) < 0.01) return "within";
  return delta > 0 ? "over" : "under";
}

function lodgingForDate(locality: LocalityRate, date: Date): number {
  const month = date.getMonth() + 1;
  return locality.lodgingByMonth[month] ?? locality.lodgingByMonth[1] ?? 0;
}

export function defaultLodgingNights(startIso: string, endIso: string): number {
  return Math.max(0, eachTripDay(startIso, endIso).length - 1);
}

export function calculateAssignment(input: {
  startIso: string;
  endIso: string;
  localityByFy: Map<number, LocalityRate>;
  destinationLabel: string;
  partialTravelDays: boolean;
  weeklyHousingStipend?: number;
  weeklyMealsStipend?: number;
  dailyLodgingRate?: number;
  dailyMieRate?: number;
}): AssignmentResult | { error: string } {
  const tripDays = eachTripDay(input.startIso, input.endIso);
  if (tripDays.length === 0) {
    return { error: "End date must be on or after start date." };
  }

  const breakdown: AssignmentDayBreakdown[] = [];
  let mealsSubtotal = 0;
  let lodgingSubtotal = 0;

  for (let i = 0; i < tripDays.length; i++) {
    const date = tripDays[i];
    const iso = formatIsoDate(date);
    const fy = fiscalYearForDate(date);
    const locality = input.localityByFy.get(fy);
    if (!locality) {
      return {
        error: `No GSA rate data for fiscal year ${fy}. Run the GSA sync or pick another destination.`
      };
    }

    const gsaMie = locality.mieTotal;
    const gsaLodging = lodgingForDate(locality, date);
    const isFirstDay = i === 0;
    const isLastDay = i === tripDays.length - 1;
    const isTravelDay = isFirstDay || isLastDay;
    const mieMult =
      input.partialTravelDays && isTravelDay && tripDays.length > 1 ? 0.75 : 1;
    const mieAllowed = round2(gsaMie * mieMult);
    const lodgingAllowed = i < tripDays.length - 1 ? round2(gsaLodging) : 0;
    const dailyTotal = round2(mieAllowed + lodgingAllowed);

    breakdown.push({
      date: iso,
      fiscalYear: fy,
      isTravelDay,
      gsaMie,
      mieAllowed,
      gsaLodging,
      lodgingAllowed,
      dailyTotal
    });

    mealsSubtotal += mieAllowed;
    lodgingSubtotal += lodgingAllowed;
  }

  const dayCount = tripDays.length;
  const lodgingNights = defaultLodgingNights(input.startIso, input.endIso);
  const mealsSubtotalR = round2(mealsSubtotal);
  const lodgingSubtotalR = round2(lodgingSubtotal);
  const gsaTotal = round2(mealsSubtotalR + lodgingSubtotalR);

  let employerCompare: EmployerCapCompare | null = null;
  const weeklyHousing = Math.max(0, input.weeklyHousingStipend ?? 0);
  const weeklyMeals = Math.max(0, input.weeklyMealsStipend ?? 0);
  const dailyLodging = Math.max(0, input.dailyLodgingRate ?? 0);
  const dailyMie = Math.max(0, input.dailyMieRate ?? 0);

  if (dailyLodging > 0 || dailyMie > 0) {
    const employerHousingTotal = round2(dailyLodging * lodgingNights);
    const employerMealsTotal = round2(dailyMie * dayCount);
    employerCompare = {
      compareMode: "daily",
      weeklyHousing: 0,
      weeklyMeals: 0,
      dailyLodging,
      dailyMie,
      assignmentWeeks: 0,
      employerHousingTotal,
      employerMealsTotal,
      employerTotal: round2(employerHousingTotal + employerMealsTotal),
      gsaLodgingCap: lodgingSubtotalR,
      gsaMieCap: mealsSubtotalR,
      housingStatus: capStatus(employerHousingTotal, lodgingSubtotalR),
      mealsStatus: capStatus(employerMealsTotal, mealsSubtotalR),
      housingOverAmount: Math.max(0, round2(employerHousingTotal - lodgingSubtotalR)),
      mealsOverAmount: Math.max(0, round2(employerMealsTotal - mealsSubtotalR))
    };
  } else if (weeklyHousing > 0 || weeklyMeals > 0) {
    const assignmentWeeks = Math.max(1, Math.ceil(dayCount / 7));
    const employerHousingTotal = round2(weeklyHousing * assignmentWeeks);
    const employerMealsTotal = round2(weeklyMeals * assignmentWeeks);
    employerCompare = {
      compareMode: "weekly",
      weeklyHousing,
      weeklyMeals,
      dailyLodging: 0,
      dailyMie: 0,
      assignmentWeeks,
      employerHousingTotal,
      employerMealsTotal,
      employerTotal: round2(employerHousingTotal + employerMealsTotal),
      gsaLodgingCap: lodgingSubtotalR,
      gsaMieCap: mealsSubtotalR,
      housingStatus: capStatus(employerHousingTotal, lodgingSubtotalR),
      mealsStatus: capStatus(employerMealsTotal, mealsSubtotalR),
      housingOverAmount: Math.max(0, round2(employerHousingTotal - lodgingSubtotalR)),
      mealsOverAmount: Math.max(0, round2(employerMealsTotal - mealsSubtotalR))
    };
  }

  return {
    destinationLabel: input.destinationLabel,
    days: breakdown,
    mealsSubtotal: mealsSubtotalR,
    lodgingSubtotal: lodgingSubtotalR,
    gsaTotal,
    lodgingNights,
    dayCount,
    employerCompare
  };
}

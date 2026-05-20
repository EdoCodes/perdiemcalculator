import type { LocalityRate } from "../perdiem/types";
import { eachTripDay, fiscalYearForDate, formatIsoDate } from "../perdiem/fiscalYear";

export type NurseDayBreakdown = {
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

export type NurseStipendCompare = {
  weeklyHousing: number;
  weeklyMeals: number;
  assignmentWeeks: number;
  agencyHousingTotal: number;
  agencyMealsTotal: number;
  agencyTotal: number;
  gsaLodgingCap: number;
  gsaMieCap: number;
  housingStatus: StipendCapStatus;
  mealsStatus: StipendCapStatus;
  housingOverAmount: number;
  mealsOverAmount: number;
};

function stipendCapStatus(agency: number, cap: number): StipendCapStatus {
  const delta = round2(agency - cap);
  if (Math.abs(delta) < 0.01) return "within";
  return delta > 0 ? "over" : "under";
}

export type NurseAssignmentResult = {
  destinationLabel: string;
  days: NurseDayBreakdown[];
  mealsSubtotal: number;
  lodgingSubtotal: number;
  gsaTotal: number;
  lodgingNights: number;
  dayCount: number;
  stipendCompare: NurseStipendCompare | null;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function lodgingForDate(locality: LocalityRate, date: Date): number {
  const month = date.getMonth() + 1;
  return locality.lodgingByMonth[month] ?? locality.lodgingByMonth[1] ?? 0;
}

export function defaultLodgingNights(startIso: string, endIso: string): number {
  return Math.max(0, eachTripDay(startIso, endIso).length - 1);
}

export function calculateNurseAssignment(input: {
  startIso: string;
  endIso: string;
  localityByFy: Map<number, LocalityRate>;
  destinationLabel: string;
  partialTravelDays: boolean;
  weeklyHousingStipend: number;
  weeklyMealsStipend: number;
}): NurseAssignmentResult | { error: string } {
  const tripDays = eachTripDay(input.startIso, input.endIso);
  if (tripDays.length === 0) {
    return { error: "Assignment end date must be on or after start date." };
  }

  const breakdown: NurseDayBreakdown[] = [];
  let mealsSubtotal = 0;
  let lodgingSubtotal = 0;

  for (let i = 0; i < tripDays.length; i++) {
    const date = tripDays[i];
    const iso = formatIsoDate(date);
    const fy = fiscalYearForDate(date);
    const locality = input.localityByFy.get(fy);
    if (!locality) {
      return {
        error: `No GSA rate data for fiscal year ${fy}. Run the GSA sync or pick another assignment city.`
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

  let stipendCompare: NurseStipendCompare | null = null;
  const weeklyHousing = Math.max(0, input.weeklyHousingStipend);
  const weeklyMeals = Math.max(0, input.weeklyMealsStipend);
  if (weeklyHousing > 0 || weeklyMeals > 0) {
    const assignmentWeeks = Math.max(1, Math.ceil(dayCount / 7));
    const agencyHousingTotal = round2(weeklyHousing * assignmentWeeks);
    const agencyMealsTotal = round2(weeklyMeals * assignmentWeeks);
    const gsaLodgingCap = lodgingSubtotalR;
    const gsaMieCap = mealsSubtotalR;
    stipendCompare = {
      weeklyHousing,
      weeklyMeals,
      assignmentWeeks,
      agencyHousingTotal,
      agencyMealsTotal,
      agencyTotal: round2(agencyHousingTotal + agencyMealsTotal),
      gsaLodgingCap,
      gsaMieCap,
      housingStatus: stipendCapStatus(agencyHousingTotal, gsaLodgingCap),
      mealsStatus: stipendCapStatus(agencyMealsTotal, gsaMieCap),
      housingOverAmount: Math.max(0, round2(agencyHousingTotal - gsaLodgingCap)),
      mealsOverAmount: Math.max(0, round2(agencyMealsTotal - gsaMieCap))
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
    stipendCompare
  };
}

import type { StateEducationRule } from "../../data/stateEducationRules";
import type { LocalityRate } from "../perdiem/types";
import { eachTripDay, fiscalYearForDate, formatIsoDate } from "../perdiem/fiscalYear";
import { defaultLodgingNights } from "./calculate";

export type TeacherGsaDayBreakdown = {
  date: string;
  fiscalYear: number;
  isFirstDay: boolean;
  isLastDay: boolean;
  isTravelDay: boolean;
  gsaMie: number;
  mieAllowed: number;
  gsaLodging: number;
  lodgingAllowed: number;
  dailyTotal: number;
};

export type TeacherGsaTripResult = {
  mode: "gsa";
  stateRule: StateEducationRule;
  destinationLabel: string;
  days: TeacherGsaDayBreakdown[];
  mealsSubtotal: number;
  lodgingSubtotal: number;
  total: number;
  lodgingNights: number;
  dayCount: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function lodgingForDate(locality: LocalityRate, date: Date): number {
  const month = date.getMonth() + 1;
  return locality.lodgingByMonth[month] ?? locality.lodgingByMonth[1] ?? 0;
}

function capMie(gsaMie: number, rule: StateEducationRule): number {
  if (rule.mieCap == null) return gsaMie;
  return Math.min(gsaMie, rule.mieCap);
}

function capLodging(gsaLodging: number, rule: StateEducationRule): number {
  if (rule.lodgingCap == null) return gsaLodging;
  return Math.min(gsaLodging, rule.lodgingCap);
}

function mieMultiplier(
  isTravelDay: boolean,
  tripLength: number,
  rule: StateEducationRule
): number {
  if (tripLength <= 1) return 1;
  if (!rule.partialTravelDays || !isTravelDay) return 1;
  return rule.travelDayFraction;
}

export function calculateTeacherGsaTrip(
  startIso: string,
  endIso: string,
  localityByFy: Map<number, LocalityRate>,
  stateRule: StateEducationRule,
  destinationLabel: string
): TeacherGsaTripResult | { error: string } {
  const tripDays = eachTripDay(startIso, endIso);
  if (tripDays.length === 0) {
    return { error: "Return date must be on or after departure date." };
  }

  const isSingleDay = tripDays.length === 1;
  const breakdown: TeacherGsaDayBreakdown[] = [];
  let mealsSubtotal = 0;
  let lodgingSubtotal = 0;

  for (let i = 0; i < tripDays.length; i++) {
    const date = tripDays[i];
    const iso = formatIsoDate(date);
    const fy = fiscalYearForDate(date);
    const locality = localityByFy.get(fy);
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
    const mult = mieMultiplier(isTravelDay, tripDays.length, stateRule);

    let mieAllowed: number;
    if (isSingleDay && stateRule.dayTripMie != null) {
      mieAllowed = stateRule.dayTripMie;
    } else {
      mieAllowed = round2(capMie(gsaMie, stateRule) * mult);
    }

    const lodgingAllowed =
      i < tripDays.length - 1 ? round2(capLodging(gsaLodging, stateRule)) : 0;

    const dailyTotal = round2(mieAllowed + lodgingAllowed);

    breakdown.push({
      date: iso,
      fiscalYear: fy,
      isFirstDay,
      isLastDay,
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

  const lodgingNights = defaultLodgingNights(startIso, endIso);

  return {
    mode: "gsa",
    stateRule,
    destinationLabel,
    days: breakdown,
    mealsSubtotal: round2(mealsSubtotal),
    lodgingSubtotal: round2(lodgingSubtotal),
    total: round2(mealsSubtotal + lodgingSubtotal),
    lodgingNights,
    dayCount: tripDays.length
  };
}

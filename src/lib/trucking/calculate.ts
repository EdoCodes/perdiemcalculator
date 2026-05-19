import {
  DOT_MEAL_DEDUCTIBLE_FRACTION,
  getTruckerRatesForDate,
  splitDaysByRatePeriod,
  STANDARD_MEAL_DEDUCTIBLE_FRACTION,
  type TruckerRatePeriod
} from "../../data/truckerPerDiemRates";
import { eachTripDay, formatIsoDate } from "../perdiem/fiscalYear";

export type TruckerCalcInput = {
  tripStart: string;
  tripEnd: string;
  /** Calendar days outside CONUS (remainder assumed CONUS). */
  oconusDays: number;
  /** Subject to DOT hours-of-service limits → 80% meal deduction vs 50%. */
  dotHoursOfService: boolean;
};

export type TruckerPeriodBreakdown = {
  period: TruckerRatePeriod;
  conusDays: number;
  oconusDays: number;
  grossConus: number;
  grossOconus: number;
  grossSubtotal: number;
};

export type TruckerCalcResult = {
  tripDays: number;
  conusDays: number;
  oconusDays: number;
  ratePeriods: TruckerPeriodBreakdown[];
  grossTotal: number;
  mealDeductibleFraction: number;
  estimatedTaxDeduction: number;
  primaryRatePeriod: TruckerRatePeriod;
  dayIsos: string[];
};

export function calculateTruckerPerDiem(
  input: TruckerCalcInput
): TruckerCalcResult | { error: string } {
  const days = eachTripDay(input.tripStart, input.tripEnd);
  if (days.length === 0) {
    return { error: "End date must be on or after start date." };
  }

  const tripDays = days.length;
  const oconusDays = Math.min(Math.max(0, Math.floor(input.oconusDays)), tripDays);
  const conusDays = tripDays - oconusDays;

  const dayIsos = days.map(formatIsoDate);
  const periodBuckets = splitDaysByRatePeriod(dayIsos);

  /** Assign OCONUS days from the end of the trip (common for runs to Canada/Mexico). */
  const oconusSet = new Set(dayIsos.slice(tripDays - oconusDays));

  const ratePeriods: TruckerPeriodBreakdown[] = periodBuckets.map(({ period, days: periodDays }) => {
    let pConus = 0;
    let pOconus = 0;
    for (const iso of periodDays) {
      if (oconusSet.has(iso)) pOconus++;
      else pConus++;
    }
    const grossConus = Math.round(pConus * period.conusMie * 100) / 100;
    const grossOconus = Math.round(pOconus * period.oconusMie * 100) / 100;
    return {
      period,
      conusDays: pConus,
      oconusDays: pOconus,
      grossConus,
      grossOconus,
      grossSubtotal: Math.round((grossConus + grossOconus) * 100) / 100
    };
  });

  const grossTotal = Math.round(ratePeriods.reduce((s, p) => s + p.grossSubtotal, 0) * 100) / 100;
  const mealDeductibleFraction = input.dotHoursOfService
    ? DOT_MEAL_DEDUCTIBLE_FRACTION
    : STANDARD_MEAL_DEDUCTIBLE_FRACTION;
  const estimatedTaxDeduction = Math.round(grossTotal * mealDeductibleFraction * 100) / 100;
  const primaryRatePeriod = getTruckerRatesForDate(input.tripStart);

  return {
    tripDays,
    conusDays,
    oconusDays,
    ratePeriods,
    grossTotal,
    mealDeductibleFraction,
    estimatedTaxDeduction,
    primaryRatePeriod,
    dayIsos
  };
}

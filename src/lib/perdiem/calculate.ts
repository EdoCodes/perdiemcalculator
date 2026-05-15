import { getMieTier, type MieTier } from "../../data/mieTiers";
import { eachTripDay, fiscalYearForDate, formatIsoDate } from "./fiscalYear";
import type {
  CalculatorOptions,
  DayBreakdown,
  LocalityRate,
  ProvidedMeals,
  TripResult,
  TravelDayPolicy
} from "./types";

function lodgingForDate(locality: LocalityRate, date: Date, fiscalYear: number): number {
  const month = date.getMonth() + 1;
  const rate = locality.lodgingByMonth[month];
  if (rate != null) return rate;
  return locality.lodgingByMonth[1] ?? 0;
}

function applyTravelDayMie(
  mieTotal: number,
  tier: MieTier | undefined,
  policy: TravelDayPolicy,
  isTravelDay: boolean
): number {
  if (!isTravelDay || policy === "full-mie") return mieTotal;

  if (policy === "75-percent-mie") {
    return Math.round(mieTotal * 0.75 * 100) / 100;
  }

  // Pro-rate incidentals only (common agency interpretation on travel days).
  if (!tier) return Math.round(mieTotal * 0.75 * 100) / 100;
  const mealsPortion = tier.breakfast + tier.lunch + tier.dinner;
  const adjustedIncidentals = Math.round(tier.incidentals * 0.75 * 100) / 100;
  return Math.round((mealsPortion + adjustedIncidentals) * 100) / 100;
}

function mealDeduction(
  tier: MieTier | undefined,
  meals: ProvidedMeals,
  isTravelDay: boolean,
  mode: CalculatorOptions["mealDeductionMode"]
): number {
  if (!tier) return 0;
  let deduction = 0;
  if (meals.breakfast) deduction += tier.breakfast;
  if (meals.lunch) deduction += tier.lunch;
  if (meals.dinner) deduction += tier.dinner;

  if (!isTravelDay) return deduction;

  if (mode === "full-on-travel-days") return deduction;

  // On travel days with pro-rate mode, deduct full meal amounts but incidentals were already reduced.
  return deduction;
}

export function calculateTrip(
  startIso: string,
  endIso: string,
  localityByFy: Map<number, LocalityRate>,
  providedMealsByDate: Map<string, ProvidedMeals> | undefined,
  options: CalculatorOptions
): TripResult | { error: string } {
  const days = eachTripDay(startIso, endIso);
  if (days.length === 0) {
    return { error: "End date must be on or after start date." };
  }

  const breakdown: DayBreakdown[] = [];
  let totalLodging = 0;
  let totalMie = 0;

  for (let i = 0; i < days.length; i++) {
    const date = days[i];
    const iso = formatIsoDate(date);
    const fy = fiscalYearForDate(date);
    const locality = localityByFy.get(fy);
    if (!locality) {
      return {
        error: `No rate data for fiscal year ${fy}. Run the GSA sync for that year.`
      };
    }

    const lodging = lodgingForDate(locality, date, fy);
    const mieTotal = locality.mieTotal;
    const tier = getMieTier(fy, mieTotal);
    const isFirstDay = i === 0;
    const isLastDay = i === days.length - 1;
    const isTravelDay = isFirstDay || isLastDay;

    const mieAfterTravel = applyTravelDayMie(
      mieTotal,
      tier,
      options.travelDayPolicy,
      isTravelDay
    );

    const provided =
      providedMealsByDate?.get(iso) ?? { breakfast: false, lunch: false, dinner: false };
    const mealDed = mealDeduction(tier, provided, isTravelDay, options.mealDeductionMode);
    const mieNet = Math.max(0, Math.round((mieAfterTravel - mealDed) * 100) / 100);
    const dailyTotal = Math.round((lodging + mieNet) * 100) / 100;

    breakdown.push({
      date: iso,
      fiscalYear: fy,
      isFirstDay,
      isLastDay,
      isTravelDay,
      lodging,
      lodging150: Math.round(lodging * 1.5 * 100) / 100,
      mieTotal,
      mieAfterTravelAdjustment: mieAfterTravel,
      mealDeduction: mealDed,
      mieNet,
      dailyTotal,
      providedMeals: provided
    });

    totalLodging += lodging;
    totalMie += mieNet;
  }

  return {
    days: breakdown,
    totalLodging: Math.round(totalLodging * 100) / 100,
    totalMie: Math.round(totalMie * 100) / 100,
    grandTotal: Math.round((totalLodging + totalMie) * 100) / 100,
    nightCount: Math.max(0, days.length - 1),
    dayCount: days.length
  };
}

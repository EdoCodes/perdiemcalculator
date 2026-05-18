/**
 * Corporate travel & per diem savings model (planning estimates only).
 * Inspired by enterprise ROI calculators; uses published industry ranges, not vendor claims.
 */

export type TravelRoiInputs = {
  annualTravelSpend: number;
  annualExpenseSpend: number;
  activeTravelers: number;
  domesticPercent: number;
  internationalPercent: number;
  tripsPerEmployeeYear: number;
  /** Optional overrides */
  avgTripDays?: number;
  adminHourlyRate?: number;
  /** Annual T&E / per diem software spend (for ROI & payback) */
  softwareCostAnnual?: number;
};

export type TravelRoiLineItem = {
  id: string;
  label: string;
  description: string;
  annualAmount: number;
};

export type TravelRoiResult = {
  totalTrips: number;
  estimatedTravelDays: number;
  estimatedAnnualPerDiem: number;
  blendedDailyPerDiem: number;
  avgTripSpend: number;
  domesticTravelSpend: number;
  internationalTravelSpend: number;
  lineItems: TravelRoiLineItem[];
  totalAnnualSavings: number;
  monthlySavings: number;
  roiPercent: number | null;
  paybackMonths: number | null;
};

/** Rough CONUS / international daily per diem (lodging + M&IE) for portfolio estimates. */
const DOMESTIC_DAILY_PER_DIEM = 159;
const INTL_DAILY_PER_DIEM = 245;
const DEFAULT_AVG_TRIP_DAYS = 3.5;
const ADMIN_HOURS_PER_TRIP = 0.75;
const DEFAULT_ADMIN_RATE = 45;

export function calculateTravelRoi(
  raw: TravelRoiInputs
): TravelRoiResult | { error: string } {
  const annualTravelSpend = raw.annualTravelSpend;
  const annualExpenseSpend = raw.annualExpenseSpend;
  const activeTravelers = raw.activeTravelers;
  const tripsPerEmployeeYear = raw.tripsPerEmployeeYear;
  const domesticPercent = raw.domesticPercent;
  const internationalPercent = raw.internationalPercent;
  const avgTripDays = raw.avgTripDays ?? DEFAULT_AVG_TRIP_DAYS;
  const adminHourlyRate = raw.adminHourlyRate ?? DEFAULT_ADMIN_RATE;
  const softwareCostAnnual = raw.softwareCostAnnual ?? 0;

  if (annualTravelSpend < 0 || annualExpenseSpend < 0) {
    return { error: "Spend amounts cannot be negative." };
  }
  if (activeTravelers <= 0) {
    return { error: "Enter at least one active traveler." };
  }
  if (tripsPerEmployeeYear <= 0) {
    return { error: "Enter average trips per employee per year." };
  }
  if (domesticPercent < 0 || internationalPercent < 0) {
    return { error: "Domestic and international percentages cannot be negative." };
  }
  const pctSum = domesticPercent + internationalPercent;
  if (pctSum <= 0) {
    return { error: "Domestic and international percentages must add up to more than 0%." };
  }

  const domesticShare = domesticPercent / pctSum;
  const intlShare = internationalPercent / pctSum;

  const totalTrips = Math.round(activeTravelers * tripsPerEmployeeYear);
  const estimatedTravelDays = Math.round(totalTrips * avgTripDays);
  const blendedDailyPerDiem =
    domesticShare * DOMESTIC_DAILY_PER_DIEM + intlShare * INTL_DAILY_PER_DIEM;
  const estimatedAnnualPerDiem = Math.round(estimatedTravelDays * blendedDailyPerDiem);

  const domesticTravelSpend = annualTravelSpend * domesticShare;
  const internationalTravelSpend = annualTravelSpend * intlShare;
  const avgTripSpend = annualTravelSpend / totalTrips;

  const perDiemAccuracy = estimatedAnnualPerDiem * 0.035;
  const travelPolicyDomestic = domesticTravelSpend * 0.025;
  const travelPolicyIntl = internationalTravelSpend * 0.04;
  const expenseLeakage = annualExpenseSpend * 0.02;
  const adminTime = totalTrips * ADMIN_HOURS_PER_TRIP * adminHourlyRate;
  const complianceSavings = estimatedAnnualPerDiem * 0.012;

  const lineItems: TravelRoiLineItem[] = [
    {
      id: "per-diem-accuracy",
      label: "Per diem accuracy",
      description:
        "~3.5% of estimated per diem from using official locality rates (e.g. GSA) instead of flat estimates.",
      annualAmount: Math.round(perDiemAccuracy)
    },
    {
      id: "travel-policy",
      label: "Travel spend optimization",
      description:
        "~2.5% domestic / ~4% international portion of airfare & lodging from policy-aware booking.",
      annualAmount: Math.round(travelPolicyDomestic + travelPolicyIntl)
    },
    {
      id: "expense-leakage",
      label: "Expense program leakage",
      description: "~2% of general T&E spend from fewer duplicates, late submissions, and out-of-policy claims.",
      annualAmount: Math.round(expenseLeakage)
    },
    {
      id: "admin-time",
      label: "Finance & traveler admin time",
      description: `${ADMIN_HOURS_PER_TRIP} hr saved per trip × ${formatNumber(activeTravelers)} travelers' trips at $${adminHourlyRate}/hr.`,
      annualAmount: Math.round(adminTime)
    },
    {
      id: "compliance",
      label: "Meal & lodging compliance",
      description: "~1.2% of per diem from consistent travel-day and meal deduction rules.",
      annualAmount: Math.round(complianceSavings)
    }
  ];

  const totalAnnualSavings = lineItems.reduce((s, i) => s + i.annualAmount, 0);
  const monthlySavings = Math.round((totalAnnualSavings / 12) * 100) / 100;

  let roiPercent: number | null = null;
  let paybackMonths: number | null = null;
  if (softwareCostAnnual > 0 && totalAnnualSavings > 0) {
    roiPercent = Math.round((totalAnnualSavings / softwareCostAnnual) * 100);
    paybackMonths = Math.round((softwareCostAnnual / (totalAnnualSavings / 12)) * 10) / 10;
  }

  return {
    totalTrips,
    estimatedTravelDays,
    estimatedAnnualPerDiem,
    blendedDailyPerDiem: Math.round(blendedDailyPerDiem),
    avgTripSpend: Math.round(avgTripSpend),
    domesticTravelSpend: Math.round(domesticTravelSpend),
    internationalTravelSpend: Math.round(internationalTravelSpend),
    lineItems,
    totalAnnualSavings,
    monthlySavings,
    roiPercent,
    paybackMonths
  };
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export const TRAVEL_ROI_DEFAULTS: TravelRoiInputs = {
  annualTravelSpend: 500_000,
  annualExpenseSpend: 200_000,
  activeTravelers: 50,
  domesticPercent: 80,
  internationalPercent: 20,
  tripsPerEmployeeYear: 4,
  avgTripDays: DEFAULT_AVG_TRIP_DAYS,
  adminHourlyRate: DEFAULT_ADMIN_RATE,
  softwareCostAnnual: 0
};

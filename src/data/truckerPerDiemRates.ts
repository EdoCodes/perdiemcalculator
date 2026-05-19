/**
 * IRS special transportation industry M&IE rates (Rev. Proc. 2019-48 / annual notices).
 * Not GSA federal employee per diem — see Notice 2025-54 and prior IRB notices.
 */

export type TruckerRatePeriod = {
  /** First calendar day this period applies (inclusive). */
  effectiveFrom: string;
  /** Last calendar day (inclusive), if superseded. */
  effectiveTo?: string;
  label: string;
  sourceLabel: string;
  sourceUrl: string;
  conusMie: number;
  oconusMie: number;
  incidentalOnly: number;
};

export const TRUCKER_RATE_PERIODS: TruckerRatePeriod[] = [
  {
    effectiveFrom: "2025-10-01",
    label: "Oct 2025 – Sep 2026",
    sourceLabel: "IRS Notice 2025-54",
    sourceUrl: "https://www.irs.gov/pub/irs-drop/n-25-54.pdf",
    conusMie: 80,
    oconusMie: 86,
    incidentalOnly: 5
  },
  {
    effectiveFrom: "2024-10-01",
    effectiveTo: "2025-09-30",
    label: "Oct 2024 – Sep 2025",
    sourceLabel: "IRS Notice 2024-68",
    sourceUrl: "https://www.irs.gov/pub/irs-drop/n-24-68.pdf",
    conusMie: 69,
    oconusMie: 74,
    incidentalOnly: 5
  },
  {
    effectiveFrom: "2023-10-01",
    effectiveTo: "2024-09-30",
    label: "Oct 2023 – Sep 2024",
    sourceLabel: "IRS Notice 2023-68",
    sourceUrl: "https://www.irs.gov/pub/irs-drop/n-23-68.pdf",
    conusMie: 69,
    oconusMie: 74,
    incidentalOnly: 5
  }
];

export function getTruckerRatesForDate(isoDate: string): TruckerRatePeriod {
  const d = isoDate;
  for (const period of TRUCKER_RATE_PERIODS) {
    if (d < period.effectiveFrom) continue;
    if (period.effectiveTo && d > period.effectiveTo) continue;
    return period;
  }
  return TRUCKER_RATE_PERIODS[TRUCKER_RATE_PERIODS.length - 1]!;
}

/** When a trip spans a rate change (Oct 1), return per-period day counts. */
export function splitDaysByRatePeriod(
  dayIsos: string[]
): { period: TruckerRatePeriod; days: string[] }[] {
  const buckets = new Map<string, { period: TruckerRatePeriod; days: string[] }>();
  for (const iso of dayIsos) {
    const period = getTruckerRatesForDate(iso);
    const key = period.effectiveFrom;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { period, days: [] };
      buckets.set(key, bucket);
    }
    bucket.days.push(iso);
  }
  return [...buckets.values()].sort(
    (a, b) => a.period.effectiveFrom.localeCompare(b.period.effectiveFrom)
  );
}

export const DOT_MEAL_DEDUCTIBLE_FRACTION = 0.8;
export const STANDARD_MEAL_DEDUCTIBLE_FRACTION = 0.5;

/** GSA CONUS M&IE tier meal breakdowns by fiscal year (for meal deductions). */
export type MieTier = {
  readonly total: number;
  readonly breakfast: number;
  readonly lunch: number;
  readonly dinner: number;
  readonly incidentals: number;
};

/** Source: GSA CONUS M&IE tiers (matches published tier tables). */
export const MIE_TIERS_BY_FY: Readonly<Record<number, readonly MieTier[]>> = {
  2024: [
    { total: 59, breakfast: 13, lunch: 15, dinner: 26, incidentals: 5 },
    { total: 64, breakfast: 14, lunch: 16, dinner: 29, incidentals: 5 },
    { total: 69, breakfast: 16, lunch: 17, dinner: 31, incidentals: 5 },
    { total: 74, breakfast: 17, lunch: 18, dinner: 34, incidentals: 5 },
    { total: 79, breakfast: 18, lunch: 20, dinner: 36, incidentals: 5 }
  ],
  2025: [
    { total: 68, breakfast: 16, lunch: 19, dinner: 28, incidentals: 5 },
    { total: 74, breakfast: 18, lunch: 20, dinner: 31, incidentals: 5 },
    { total: 80, breakfast: 20, lunch: 22, dinner: 33, incidentals: 5 },
    { total: 86, breakfast: 22, lunch: 23, dinner: 36, incidentals: 5 },
    { total: 92, breakfast: 23, lunch: 26, dinner: 38, incidentals: 5 }
  ],
  2026: [
    { total: 68, breakfast: 16, lunch: 19, dinner: 28, incidentals: 5 },
    { total: 74, breakfast: 18, lunch: 20, dinner: 31, incidentals: 5 },
    { total: 80, breakfast: 20, lunch: 22, dinner: 33, incidentals: 5 },
    { total: 86, breakfast: 22, lunch: 23, dinner: 36, incidentals: 5 },
    { total: 92, breakfast: 23, lunch: 26, dinner: 38, incidentals: 5 }
  ]
};

export function getMieTier(fiscalYear: number, mieTotal: number): MieTier | undefined {
  const tiers = MIE_TIERS_BY_FY[fiscalYear];
  if (!tiers) return undefined;
  return tiers.find((t) => t.total === mieTotal) ?? tiers.reduce((best, t) =>
    Math.abs(t.total - mieTotal) < Math.abs(best.total - mieTotal) ? t : best
  );
}

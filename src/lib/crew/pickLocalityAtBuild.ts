import type { StateLocalitySummary } from "../rates/buildTimeStateData";

/** Best-effort GSA locality match for hub SEO pages (build-time). */
export function pickLocalityForHub(
  localities: StateLocalitySummary[],
  city: string
): StateLocalitySummary | null {
  if (!localities.length) return null;
  const c = city.trim().toLowerCase();
  if (!c) return null;

  const exact = localities.find((l) => l.city.toLowerCase() === c);
  if (exact) return exact;

  const starts = localities.find(
    (l) =>
      l.city.toLowerCase().startsWith(c) ||
      c.startsWith(l.city.toLowerCase().split("/")[0] ?? "")
  );
  if (starts) return starts;

  const contains = localities.find(
    (l) =>
      l.city.toLowerCase().includes(c) ||
      c.includes(l.city.toLowerCase().split(",")[0] ?? "")
  );
  if (contains) return contains;

  const nonStandard = localities.find((l) => !l.isStandard);
  return nonStandard ?? localities[0];
}

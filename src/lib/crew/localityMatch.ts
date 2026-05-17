import type { LocalityListItem } from "../rates/queries";

/** Best-effort GSA locality for a layover city name. */
export function pickLocalityForCity(
  localities: LocalityListItem[],
  city: string
): LocalityListItem | null {
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

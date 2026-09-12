/** URL slugs and display names for GSA locality SEO pages. */

export function localityShortName(city: string): string {
  const primary = city.split("/")[0]?.trim() ?? city.trim();
  return primary.replace(/\s+/g, " ");
}

export function slugifyLocalityName(city: string): string {
  const base = localityShortName(city)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "locality";
}

export type LocalitySlugInput = {
  city: string;
  county: string | null;
  did?: string;
};

function countySlug(county: string | null): string {
  if (!county?.trim()) return "";
  return slugifyLocalityName(county);
}

/**
 * Assign unique slugs in input order. Collisions append county, then DID.
 */
export function uniqueLocalitySlugs(items: readonly LocalitySlugInput[]): string[] {
  const used = new Set<string>();
  return items.map((item) => {
    const candidates = [
      slugifyLocalityName(item.city),
      [slugifyLocalityName(item.city), countySlug(item.county)].filter(Boolean).join("-"),
      [slugifyLocalityName(item.city), countySlug(item.county), item.did?.toLowerCase()]
        .filter(Boolean)
        .join("-")
    ].filter((s) => s.length > 0);

    for (const candidate of candidates) {
      if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
    }

    let i = 2;
    const fallbackBase = slugifyLocalityName(item.city);
    while (used.has(`${fallbackBase}-${i}`)) i += 1;
    const fallback = `${fallbackBase}-${i}`;
    used.add(fallback);
    return fallback;
  });
}

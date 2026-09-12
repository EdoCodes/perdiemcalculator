import { slugifyLocalityName } from "./localitySlug.ts";

export type CityPlaceRecord = {
  name: string;
  county: string;
  zip: string;
  state: string;
};

export type CityPlacePage = CityPlaceRecord & {
  slug: string;
};

const PLACE_SUFFIX =
  /\s+(city|town|village|borough|cdp|municipality|consolidated government|metro township|urban county|ut)\s*$/i;

/** Census Gazetteer names look like "Los Angeles city" / "East Los Angeles CDP". */
export function stripCensusPlaceSuffix(name: string): string {
  return name.replace(PLACE_SUFFIX, "").replace(/\s+/g, " ").trim();
}

export function cityPageQualifies(place: Pick<CityPlaceRecord, "county" | "zip">): boolean {
  const zip = place.zip.replace(/\D/g, "").slice(0, 5);
  const county = place.county.trim();
  if (zip.length !== 5) return false;
  if (!county || county.includes("/") || county.length > 40) return false;
  return true;
}

/**
 * Assign slugs for city pages. Returns null for rows that collide with a GSA NSA
 * key-city URL (that NSA page already covers the place).
 */
export function uniqueCitySlugs(
  places: readonly Pick<CityPlaceRecord, "name" | "county">[],
  reservedNsaSlugs: ReadonlySet<string>
): (string | null)[] {
  const used = new Set<string>(reservedNsaSlugs);
  return places.map((place) => {
    const base = slugifyLocalityName(place.name);
    if (reservedNsaSlugs.has(base)) return null;

    const withCounty = [base, slugifyLocalityName(place.county)].filter(Boolean).join("-");
    for (const candidate of [base, withCounty]) {
      if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
    }

    let i = 2;
    while (used.has(`${base}-${i}`)) i += 1;
    const fallback = `${base}-${i}`;
    used.add(fallback);
    return fallback;
  });
}

export function buildCityPlacePages(
  places: readonly CityPlaceRecord[],
  reservedNsaSlugs: ReadonlySet<string>,
  zipHasLocality: (zip: string) => boolean
): CityPlacePage[] {
  const eligible = places.filter(
    (p) => cityPageQualifies(p) && zipHasLocality(p.zip.replace(/\D/g, "").slice(0, 5))
  );
  const slugs = uniqueCitySlugs(eligible, reservedNsaSlugs);
  const pages: CityPlacePage[] = [];
  eligible.forEach((place, i) => {
    const slug = slugs[i];
    if (!slug) return;
    pages.push({
      ...place,
      zip: place.zip.replace(/\D/g, "").slice(0, 5),
      county: place.county.trim(),
      slug
    });
  });
  return pages;
}

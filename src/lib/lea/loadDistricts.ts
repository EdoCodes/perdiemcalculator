import type { LeaManifest, SchoolDistrict } from "./types";

const cache = new Map<string, SchoolDistrict[]>();
let manifestPromise: Promise<LeaManifest | null> | null = null;

export async function fetchLeaManifest(): Promise<LeaManifest | null> {
  if (!manifestPromise) {
    manifestPromise = fetch("/data/lea/manifest.json")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return manifestPromise;
}

/** NCES open districts for a state (from bundled public/data/lea). */
export async function fetchDistrictsForState(stateAbbr: string): Promise<SchoolDistrict[]> {
  const st = stateAbbr.toUpperCase();
  if (cache.has(st)) return cache.get(st)!;

  const res = await fetch(`/data/lea/${st}.json`);
  if (!res.ok) {
    cache.set(st, []);
    return [];
  }
  const data = (await res.json()) as SchoolDistrict[];
  cache.set(st, data);
  return data;
}

export function filterDistricts(
  districts: SchoolDistrict[],
  query: string,
  limit = 40
): SchoolDistrict[] {
  const q = query.trim().toLowerCase();
  if (!q) return districts.slice(0, limit);
  const out: SchoolDistrict[] = [];
  for (const d of districts) {
    const hay = `${d.name} ${d.city ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      out.push(d);
      if (out.length >= limit) break;
    }
  }
  return out;
}

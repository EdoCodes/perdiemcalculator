import type { CrewAirport } from "../../data/crewAirports";
import { CREW_AIRPORTS_FALLBACK } from "../../data/crewAirports";

type AirportIndex = {
  version: number;
  count: number;
  airports: CrewAirport[];
};

let cache: CrewAirport[] | null = null;
let loadPromise: Promise<CrewAirport[]> | null = null;

export async function loadCrewAirports(): Promise<CrewAirport[]> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = fetch("/data/crew-airports.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AirportIndex | null) => {
        if (data?.airports?.length) {
          cache = data.airports;
          return cache;
        }
        cache = CREW_AIRPORTS_FALLBACK;
        return cache;
      })
      .catch(() => {
        cache = CREW_AIRPORTS_FALLBACK;
        return cache;
      });
  }
  return loadPromise;
}

export function filterCrewAirports(
  airports: CrewAirport[],
  query: string,
  limit = 30
): CrewAirport[] {
  const q = query.trim().toLowerCase();
  if (!q) return airports.slice(0, limit);

  const scored: { a: CrewAirport; score: number }[] = [];

  for (const a of airports) {
    const code = a.code.toLowerCase();
    const city = a.city.toLowerCase();
    const state = (a.state ?? "").toLowerCase();
    const country = a.country.toLowerCase();
    let score = 0;
    if (code === q) score = 100;
    else if (code.startsWith(q)) score = 80;
    else if (city.startsWith(q)) score = 60;
    else if (`${code} ${city}`.includes(q)) score = 40;
    else if (`${city} ${state} ${country}`.includes(q)) score = 20;
    else continue;
    scored.push({ a, score });
  }

  scored.sort((x, y) => y.score - x.score || x.a.code.localeCompare(y.a.code));
  const out: CrewAirport[] = [];
  const seen = new Set<string>();
  for (const { a } of scored) {
    if (seen.has(a.code)) continue;
    seen.add(a.code);
    out.push(a);
    if (out.length >= limit) break;
  }
  return out;
}

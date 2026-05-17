import type { CrewSavedTrip } from "./types";

export const STORAGE_KEY_CREW_TRIPS = "perdiem-crew-trips-v1";

export type CrewTripLog = {
  version: 1;
  trips: CrewSavedTrip[];
};

function emptyLog(): CrewTripLog {
  return { version: 1, trips: [] };
}

export function loadCrewTripLog(): CrewTripLog {
  if (typeof localStorage === "undefined") return emptyLog();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CREW_TRIPS);
    if (!raw) return emptyLog();
    const parsed = JSON.parse(raw) as CrewTripLog;
    if (parsed?.version !== 1 || !Array.isArray(parsed.trips)) return emptyLog();
    return parsed;
  } catch {
    return emptyLog();
  }
}

export function saveCrewTripLog(log: CrewTripLog): void {
  localStorage.setItem(STORAGE_KEY_CREW_TRIPS, JSON.stringify(log));
}

export function upsertCrewTrip(trip: CrewSavedTrip): CrewTripLog {
  const log = loadCrewTripLog();
  const idx = log.trips.findIndex((t) => t.id === trip.id);
  if (idx >= 0) log.trips[idx] = trip;
  else log.trips.unshift(trip);
  log.trips.sort(
    (a, b) => new Date(b.tripStart).getTime() - new Date(a.tripStart).getTime()
  );
  saveCrewTripLog(log);
  window.dispatchEvent(new CustomEvent("crew-trips-updated"));
  return log;
}

export function deleteCrewTrip(id: string): CrewTripLog {
  const log = loadCrewTripLog();
  log.trips = log.trips.filter((t) => t.id !== id);
  saveCrewTripLog(log);
  window.dispatchEvent(new CustomEvent("crew-trips-updated"));
  return log;
}

export function getCrewTrip(id: string): CrewSavedTrip | undefined {
  return loadCrewTripLog().trips.find((t) => t.id === id);
}

/** Sum GSA or contract amounts by calendar month (0–11). */
export function monthlyTotals(
  trips: CrewSavedTrip[],
  year: number,
  field: "gsaAmount" | "contractAmount"
): number[] {
  const sums = Array.from({ length: 12 }, () => 0);
  for (const trip of trips) {
    for (const seg of trip.daySegments) {
      const d = new Date(seg.date + "T12:00:00");
      if (d.getFullYear() !== year) continue;
      sums[d.getMonth()]! += seg[field];
    }
  }
  return sums.map(round2);
}

export function yearlyTotal(
  trips: CrewSavedTrip[],
  year: number,
  field: "gsaTotal" | "contractTotal"
): number {
  let sum = 0;
  for (const trip of trips) {
    const y = new Date(trip.tripStart + "T12:00:00").getFullYear();
    if (y === year) sum += trip[field];
  }
  return round2(sum);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

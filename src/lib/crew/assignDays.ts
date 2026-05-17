import { eachTripDay, formatIsoDate } from "../perdiem/fiscalYear";
import type { CrewLayoverLeg } from "./types";

function compareIso(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Which layover leg owns this calendar day (departure day → next leg per IRS layover convention). */
export function legForDate(iso: string, legs: CrewLayoverLeg[]): CrewLayoverLeg | null {
  const sorted = [...legs].sort((a, b) => a.sequence - b.sequence);
  if (!sorted.length) return null;

  for (let i = 0; i < sorted.length; i++) {
    const leg = sorted[i];
    if (compareIso(iso, leg.arrivalDate) < 0) return null;
    if (compareIso(iso, leg.departureDate) > 0) continue;

    if (
      compareIso(iso, leg.departureDate) === 0 &&
      i < sorted.length - 1
    ) {
      const next = sorted[i + 1];
      if (compareIso(iso, next.arrivalDate) <= 0) return next;
    }
    return leg;
  }

  return null;
}

export function tripBounds(legs: CrewLayoverLeg[]): { start: string; end: string } | null {
  if (!legs.length) return null;
  const sorted = [...legs].sort((a, b) => a.sequence - b.sequence);
  return {
    start: sorted[0]!.arrivalDate,
    end: sorted[sorted.length - 1]!.departureDate
  };
}

export function validateLegs(legs: CrewLayoverLeg[], tripStart: string, tripEnd: string): string | null {
  if (!legs.length) return "Add at least one layover.";
  const sorted = [...legs].sort((a, b) => a.sequence - b.sequence);
  for (const leg of sorted) {
    if (compareIso(leg.arrivalDate, leg.departureDate) > 0) {
      return `${leg.airportCode}: arrival must be on or before departure.`;
    }
    if (compareIso(leg.arrivalDate, tripStart) < 0 || compareIso(leg.departureDate, tripEnd) > 0) {
      return `${leg.airportCode}: dates must fall within the trip.`;
    }
  }
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    if (compareIso(cur.arrivalDate, prev.departureDate) < 0) {
      return `Leg ${cur.airportCode} overlaps ${prev.airportCode}.`;
    }
  }
  return null;
}

export function eachTripDayIso(startIso: string, endIso: string): string[] {
  return eachTripDay(startIso, endIso).map(formatIsoDate);
}

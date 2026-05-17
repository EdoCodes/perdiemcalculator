import { CREW_AIRPORTS_FALLBACK, type CrewAirport } from "../../data/crewAirports";
import { loadCrewAirports } from "./loadAirports";
import type { CrewLayoverLeg } from "./types";
import { newLegId } from "./types";

export type ParsedScheduleLeg = {
  airportCode: string;
  arrivalDate: string;
  departureDate: string;
  airport?: CrewAirport;
  warning?: string;
};

export type ParseScheduleResult =
  | { ok: true; legs: ParsedScheduleLeg[]; warnings: string[] }
  | { ok: false; error: string };

let airportByCode: Map<string, CrewAirport> | null = null;

export async function ensureAirportIndex(): Promise<void> {
  if (airportByCode) return;
  const list = await loadCrewAirports();
  airportByCode = new Map(list.map((a) => [a.code, a]));
}

export function attachAirportsToParsed(legs: ParsedScheduleLeg[]): ParsedScheduleLeg[] {
  return legs.map((l) => {
    const airport = findAirport(l.airportCode);
    return {
      ...l,
      airport,
      warning: airport ? l.warning : `Unknown airport ${l.airportCode}`
    };
  });
}

function findAirport(code: string): CrewAirport | undefined {
  const c = code.trim().toUpperCase();
  return airportByCode?.get(c) ?? CREW_AIRPORTS_FALLBACK.find((a) => a.code === c);
}

function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const mdy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (mdy) {
    let y = parseInt(mdy[3]!, 10);
    if (y < 100) y += 2000;
    const mo = String(parseInt(mdy[1]!, 10)).padStart(2, "0");
    const d = String(parseInt(mdy[2]!, 10)).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    const dt = new Date(parsed);
    const y = dt.getFullYear();
    const mo = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }
  return null;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQ = !inQ;
    else if ((c === "," || c === "\t") && !inQ) {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
}

/** Parse CSV: airport, arrival, departure (header optional). */
export function parseScheduleCsv(text: string): ParseScheduleResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { ok: false, error: "File is empty." };

  const warnings: string[] = [];
  const legs: ParsedScheduleLeg[] = [];
  let startIdx = 0;
  const firstCols = parseCsvLine(lines[0]!).map((c) => c.toLowerCase());
  if (firstCols.some((c) => c.includes("airport") || c.includes("arrival"))) {
    startIdx = 1;
  }

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    if (cols.length < 3) {
      warnings.push(`Skipped line ${i + 1}: need airport, arrival, departure.`);
      continue;
    }
    const code = cols[0]!.replace(/[^A-Za-z]/g, "").toUpperCase();
    const arrival = normalizeDate(cols[1]!);
    const departure = normalizeDate(cols[2]!);
    if (!code || !arrival || !departure) {
      warnings.push(`Skipped line ${i + 1}: invalid airport or dates.`);
      continue;
    }
    const airport = findAirport(code);
    legs.push({
      airportCode: code,
      arrivalDate: arrival,
      departureDate: departure,
      airport,
      warning: airport ? undefined : `Unknown airport ${code}`
    });
  }

  if (!legs.length) return { ok: false, error: "No valid rows found." };
  return { ok: true, legs, warnings };
}

/** Free-text lines: `DFW 2026-05-17 2026-05-19` or `DFW 5/17/26 - 5/19/26`. */
export function parseScheduleText(text: string): ParseScheduleResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { ok: false, error: "Paste at least one trip line." };

  const warnings: string[] = [];
  const legs: ParsedScheduleLeg[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const codeMatch = line.match(/\b([A-Za-z]{3})\b/);
    if (!codeMatch) {
      warnings.push(`Line ${i + 1}: no airport code found.`);
      continue;
    }
    const code = codeMatch[1]!.toUpperCase();
    const dateMatches = line.match(
      /\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/g
    );
    if (!dateMatches || dateMatches.length < 2) {
      warnings.push(`Line ${i + 1}: need arrival and departure dates.`);
      continue;
    }
    const arrival = normalizeDate(dateMatches[0]!);
    const departure = normalizeDate(dateMatches[1]!);
    if (!arrival || !departure) {
      warnings.push(`Line ${i + 1}: could not parse dates.`);
      continue;
    }
    const airport = findAirport(code);
    legs.push({
      airportCode: code,
      arrivalDate: arrival,
      departureDate: departure,
      airport,
      warning: airport ? undefined : `Unknown airport ${code}`
    });
  }

  if (!legs.length) return { ok: false, error: "No valid lines parsed." };
  return { ok: true, legs, warnings };
}

export function parsedToLayoverLegs(parsed: ParsedScheduleLeg[]): CrewLayoverLeg[] {
  return parsed.map((p, i) => ({
    id: newLegId(),
    sequence: i + 1,
    airportCode: p.airportCode,
    city: p.airport?.city ?? p.airportCode,
    state: p.airport?.state,
    country: p.airport?.country ?? "Unknown",
    region: p.airport?.region ?? "us",
    arrivalDate: p.arrivalDate,
    departureDate: p.departureDate
  }));
}

export function tripBoundsFromParsed(legs: ParsedScheduleLeg[]): {
  start: string;
  end: string;
} {
  let start = legs[0]!.arrivalDate;
  let end = legs[0]!.departureDate;
  for (const l of legs) {
    if (l.arrivalDate < start) start = l.arrivalDate;
    if (l.departureDate > end) end = l.departureDate;
  }
  return { start, end };
}

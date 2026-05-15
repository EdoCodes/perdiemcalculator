/** Federal fiscal year for a calendar date (FY starts Oct 1). */
export function fiscalYearForDate(date: Date): number {
  const month = date.getMonth(); // 0 = Jan
  const calendarYear = date.getFullYear();
  return month >= 9 ? calendarYear + 1 : calendarYear;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function eachTripDay(startIso: string, endIso: string): Date[] {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (end < start) return [];

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

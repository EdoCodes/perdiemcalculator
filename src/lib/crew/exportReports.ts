import { formatUsd, formatShortDate } from "../format";
import type { CrewSavedTrip } from "./types";

function escapeCsv(val: string): string {
  if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
  return val;
}

export function tripsForYear(trips: CrewSavedTrip[], year: number): CrewSavedTrip[] {
  return trips.filter((t) => new Date(t.tripStart + "T12:00:00").getFullYear() === year);
}

export function downloadTripsCsv(trips: CrewSavedTrip[], year: number): void {
  const rows = tripsForYear(trips, year);
  const lines = [
    "trip_label,start_date,end_date,airports,contract_total,gsa_mie_total,days"
  ];
  for (const t of rows) {
    const codes = t.legs.map((l) => l.airportCode).join(" / ");
    lines.push(
      [
        escapeCsv(t.label),
        t.tripStart,
        t.tripEnd,
        escapeCsv(codes),
        t.contractTotal.toFixed(2),
        t.gsaTotal.toFixed(2),
        String(t.daySegments.length)
      ].join(",")
    );
  }
  lines.push("");
  lines.push("date,airport,city,contract,gsa_mie,is_travel_day");
  for (const t of rows) {
    for (const d of t.daySegments) {
      lines.push(
        [
          d.date,
          d.airportCode,
          escapeCsv(d.city),
          d.contractAmount.toFixed(2),
          d.gsaAmount.toFixed(2),
          d.isTravelDay ? "yes" : "no"
        ].join(",")
      );
    }
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `crew-per-diem-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function openPrintableReport(trips: CrewSavedTrip[], year: number): void {
  const rows = tripsForYear(trips, year);
  const contractSum = rows.reduce((s, t) => s + t.contractTotal, 0);
  const gsaSum = rows.reduce((s, t) => s + t.gsaTotal, 0);

  const tripRows = rows
    .map(
      (t) => `<tr>
      <td>${t.label}</td>
      <td>${formatShortDate(t.tripStart)} – ${formatShortDate(t.tripEnd)}</td>
      <td>${t.legs.map((l) => l.airportCode).join(", ")}</td>
      <td class="num">${formatUsd(t.contractTotal)}</td>
      <td class="num">${formatUsd(t.gsaTotal)}</td>
    </tr>`
    )
    .join("");

  const dayRows = rows
    .flatMap((t) =>
      t.daySegments.map(
        (d) => `<tr>
      <td>${d.date}</td>
      <td><strong>${d.airportCode}</strong> ${d.city}</td>
      <td class="num">${formatUsd(d.contractAmount)}</td>
      <td class="num">${formatUsd(d.gsaAmount)}</td>
      <td>${d.isTravelDay ? "75%" : "100%"}</td>
    </tr>`
      )
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<title>Crew per diem report ${year}</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  .meta { color: #555; margin-bottom: 1.5rem; }
  .summary { display: flex; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .summary div { padding: 1rem 1.25rem; background: #f4f4f5; border-radius: 8px; min-width: 8rem; }
  .summary span { display: block; font-size: 0.75rem; text-transform: uppercase; color: #666; }
  .summary strong { display: block; font-size: 1.25rem; margin-top: 0.25rem; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-size: 0.875rem; }
  th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #f4f4f5; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  @media print { body { margin: 0.75rem; } }
</style>
</head><body>
<h1>Airline crew per diem — ${year}</h1>
<p class="meta">Generated ${new Date().toLocaleString()} · perdiemcalculator.com</p>
<div class="summary">
  <div><span>Trips</span><strong>${rows.length}</strong></div>
  <div><span>Contract pay (est.)</span><strong>${formatUsd(contractSum)}</strong></div>
  <div><span>GSA M&IE (est.)</span><strong>${formatUsd(gsaSum)}</strong></div>
</div>
<h2>Trips</h2>
<table>
  <thead><tr><th>Trip</th><th>Dates</th><th>Airports</th><th>Contract</th><th>GSA M&IE</th></tr></thead>
  <tbody>${tripRows || '<tr><td colspan="5">No trips</td></tr>'}</tbody>
</table>
<h2>Daily detail</h2>
<table>
  <thead><tr><th>Date</th><th>Layover</th><th>Contract</th><th>GSA M&IE</th><th>Multiplier</th></tr></thead>
  <tbody>${dayRows || '<tr><td colspan="5">No days</td></tr>'}</tbody>
</table>
<p class="meta">Planning estimate only — not tax or payroll advice.</p>
<script>window.onload = () => window.print();</script>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("Allow pop-ups to print or save as PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
}

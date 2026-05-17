import { useEffect, useMemo, useRef, useState } from "react";
import type { CrewCalcMode, CrewSavedTrip } from "../../lib/crew/types";
import { newLegId } from "../../lib/crew/types";
import { formatUsd, formatShortDate } from "../../lib/format";
import {
  downloadTripsCsv,
  openPrintableReport,
  tripsForYear
} from "../../lib/crew/exportReports";
import { useCrewTripLog } from "../../hooks/useCrewTripLog";
import { formatLocalityLabel, useCrewTripForm } from "../../hooks/useCrewTripForm";
import type { CrewImportPrefill } from "./CrewScheduleImport";
import { CrewScheduleDialog } from "./CrewScheduleDialog";
import { AirportPicker } from "./AirportPicker";
import { MultiLegEditor } from "./MultiLegEditor";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { US_STATES } from "../../data/usStates";
import { calcInput, calcPill, calcPillActive, calcSelect } from "../../lib/calcUi";

const MODE_TABS: { id: CrewCalcMode; label: string }[] = [
  { id: "gsa", label: "IRS / GSA" },
  { id: "contract", label: "Contract" },
  { id: "both", label: "Compare both" }
];

type Props = {
  year: number;
  onYearChange: (y: number) => void;
  prefill?: CrewImportPrefill | null;
  onPrefillConsumed?: () => void;
};

export function CrewHome({ year, onYearChange, prefill, onPrefillConsumed }: Props) {
  const { trips, saveTrip, removeTrip } = useCrewTripLog();
  const form = useCrewTripForm(saveTrip);
  const historyRef = useRef<HTMLDivElement>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    for (const t of trips) {
      set.add(new Date(t.tripStart + "T12:00:00").getFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [trips]);

  const yearTrips = useMemo(() => tripsForYear(trips, year), [trips, year]);
  const yearGsa = yearTrips.reduce((s, t) => s + t.gsaTotal, 0);
  const yearContract = yearTrips.reduce((s, t) => s + t.contractTotal, 0);

  useEffect(() => {
    if (!prefill) return;
    form.applyPrefill(prefill);
    onPrefillConsumed?.();
  }, [prefill, form.applyPrefill, onPrefillConsumed]);

  const onAddTrip = async () => {
    setFlash(null);
    const wasEdit = Boolean(form.editingId);
    const saved = await form.addTripToLog();
    if (!saved) return;
    const gsa = saved.gsaTotal;
    const contract = saved.contractTotal;
    const parts: string[] = [];
    if (gsa > 0) parts.push(`GSA ${formatUsd(gsa)}`);
    if (contract > 0) parts.push(`contract ${formatUsd(contract)}`);
    setFlash(
      parts.length
        ? `${wasEdit ? "Updated" : "Added"} ${saved.label} — ${parts.join(", ")}`
        : `${wasEdit ? "Updated" : "Added"} ${saved.label} to your log`
    );
    form.resetForm();
    historyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const onEdit = (trip: CrewSavedTrip) => {
    form.loadEditTrip(trip);
    setFlash(`Editing ${trip.label} — change fields and tap Add trip to log again`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showMultiCityHint = form.dayCount >= 3;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-[var(--color-border)] border-l-4 border-l-[var(--color-accent)] bg-[var(--color-surface-muted)]/60 px-4 py-3 text-sm text-[var(--color-ink-muted)]">
        <strong className="font-medium text-[var(--color-ink)]">Guest mode</strong> — trips are
        saved in this browser only. No account required. Clearing site data removes your log.
      </div>

      <Card padding="lg" className="border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <h2 className="calc-section-title">Add new trip</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Enter dates and layover city, then add to your log in one step.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="calc-rubric">Trip dates</span>
            <span className="block text-sm font-semibold text-[var(--color-ink)]">Start</span>
            <input
              type="date"
              className={calcInput}
              value={form.start}
              onChange={(e) => form.setStart(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="calc-rubric">Away from base</span>
            <span className="block text-sm font-semibold text-[var(--color-ink)]">End</span>
            <input
              type="date"
              className={calcInput}
              value={form.end}
              onChange={(e) => form.setEnd(e.target.value)}
            />
          </label>
        </div>

        {form.dayCount > 0 && (
          <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
            {form.dayCount} calendar day{form.dayCount === 1 ? "" : "s"} away from base
          </p>
        )}

        {!form.multiCity && (
          <div className="mt-6">
            <AirportPicker value={form.airport} onChange={form.setAirport} />
            {form.airport && form.localityLabel && form.showGsa && (
              <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                GSA locality: {form.localityLabel}
              </p>
            )}
          </div>
        )}

        {form.error && (
          <p className="mt-4 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]">
            {form.error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="action" onClick={() => void onAddTrip()} disabled={form.calculating}>
            {form.calculating
              ? "Adding…"
              : form.editingId
                ? "Update trip in log"
                : "Add trip to log"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setScheduleOpen(true)}>
            Upload schedule
          </Button>
          {form.editingId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.resetForm();
                setFlash(null);
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>

        {flash && (
          <p className="mt-3 text-sm font-medium text-[var(--color-accent)]" role="status">
            {flash}
          </p>
        )}

        <details className="mt-8 group">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)] marker:content-none">
            <span className="inline-flex items-center gap-2">
              <span className="text-[var(--color-ink-muted)] group-open:rotate-90 transition-transform">
                ▸
              </span>
              Advanced options
            </span>
          </summary>

          <div className="mt-5 space-y-6 border-t border-[var(--color-border)] pt-6">
            <fieldset>
              <legend className="calc-rubric">What to calculate</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MODE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => form.setCalcMode(tab.id)}
                    className={form.calcMode === tab.id ? calcPillActive : calcPill}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="calc-rubric">Role</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["pilot", "Pilot"],
                    ["cabin", "Cabin crew"],
                    ["other", "Other"]
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => form.setRole(id)}
                    className={
                      form.role === id ? `${calcPill} calc-pill--active-accent` : calcPill
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            {(showMultiCityHint || form.multiCity) && (
              <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  checked={form.multiCity}
                  onChange={(e) => {
                    const on = e.target.checked;
                    form.setMultiCity(on);
                    if (on && form.legs.length === 0 && form.start && form.end) {
                      form.setLegs([
                        {
                          id: newLegId(),
                          sequence: 1,
                          airportCode: form.airport?.code ?? "",
                          city: form.airport?.city ?? "",
                          state: form.airport?.state,
                          country: form.airport?.country ?? "USA",
                          region: form.airport?.region ?? "us",
                          arrivalDate: form.start,
                          departureDate: form.end
                        }
                      ]);
                    }
                  }}
                  className="h-4 w-4 rounded border-[var(--color-border)]"
                />
                Multiple layover cities
              </label>
            )}

            {form.showGsa && form.multiCity && (
              <MultiLegEditor
                legs={form.legs}
                onChange={form.setLegs}
                tripStart={form.start}
                tripEnd={form.end}
              />
            )}

            {form.showGsa && !form.multiCity && form.airport?.region === "intl" && (
              <label className="block text-sm font-medium text-[var(--color-ink)]">
                International daily M&IE (USD)
                <input
                  type="number"
                  className={calcInput}
                  value={form.intlMie}
                  onChange={(e) => form.setIntlMie(e.target.value)}
                />
              </label>
            )}

            {form.showGsa && !form.multiCity && form.airport?.region !== "intl" && form.airport && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[var(--color-ink)]">
                  GSA state
                  <select
                    className={calcInput}
                    value={form.layoverState}
                    onChange={(e) => {
                      form.setLayoverState(e.target.value);
                      form.setLocalityId("");
                    }}
                  >
                    {US_STATES.map((s) => (
                      <option key={s.abbr} value={s.abbr}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-[var(--color-ink)]">
                  GSA locality
                  <select
                    className={calcInput}
                    value={form.localityId}
                    onChange={(e) => {
                      const id = e.target.value;
                      form.setLocalityId(id);
                      const loc = form.localities.find((l) => l.id === id);
                      if (loc) {
                        form.setDid(loc.did);
                        form.setLocalityLabel(formatLocalityLabel(loc));
                      }
                    }}
                    disabled={form.loadingLocalities}
                  >
                    {form.localities.map((l) => (
                      <option key={l.id} value={l.id}>
                        {formatLocalityLabel(l)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {form.showContract && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[var(--color-ink)]">
                  Domestic rate ($/day)
                  <input
                    type="number"
                    step="0.01"
                    className={calcInput}
                    value={form.domesticRate}
                    onChange={(e) => form.setDomesticRate(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-medium text-[var(--color-ink)]">
                  International rate ($/day)
                  <input
                    type="number"
                    step="0.01"
                    className={calcInput}
                    value={form.internationalRate}
                    onChange={(e) => form.setInternationalRate(e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        </details>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card padding="md" className="calc-stat-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="calc-stat-label">Estimated total for {year}</p>
            <select
              className={`${calcSelect} !mt-0 w-auto px-2 py-1`}
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              aria-label="Tax year"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <p className="calc-stat-value mt-2 text-3xl font-bold tabular-nums">
            {formatUsd(yearGsa)}
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            GSA M&IE · {yearTrips.length} trip{yearTrips.length === 1 ? "" : "s"}
            {yearContract > 0 && (
              <span className="ml-2">· Contract {formatUsd(yearContract)}</span>
            )}
          </p>
        </Card>

        <Card padding="md">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
            Export
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!yearTrips.length}
              onClick={() => downloadTripsCsv(trips, year)}
            >
              CSV
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!yearTrips.length}
              onClick={() => openPrintableReport(trips, year)}
            >
              Print / PDF
            </Button>
          </div>
        </Card>
      </div>

      <div ref={historyRef}>
        <h2 className="calc-section-title">Trip history</h2>

        {!trips.length ? (
          <Card padding="lg" className="mt-4 text-center">
            <p className="text-sm text-[var(--color-ink-muted)]">
              No trips yet. Add a trip above or upload a schedule to get started.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button type="button" variant="action" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Add trip
              </Button>
              <Button type="button" variant="secondary" onClick={() => setScheduleOpen(true)}>
                Upload schedule
              </Button>
            </div>
          </Card>
        ) : (
          <ul className="mt-4 space-y-3">
            {[...trips]
              .sort(
                (a, b) =>
                  new Date(b.tripStart).getTime() - new Date(a.tripStart).getTime()
              )
              .map((trip) => {
                const inYear = new Date(trip.tripStart + "T12:00:00").getFullYear() === year;
                return (
                  <li key={trip.id} className={inYear ? "" : "opacity-55"}>
                    <Card padding="md" className="border-[var(--color-border)]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--color-ink)]">{trip.label}</p>
                          <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">
                            {formatShortDate(trip.tripStart)} – {formatShortDate(trip.tripEnd)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            {trip.gsaTotal > 0 && (
                              <span>
                                <span className="text-[var(--color-ink-muted)]">GSA </span>
                                <span className="font-semibold tabular-nums text-[var(--color-primary)]">
                                  {formatUsd(trip.gsaTotal)}
                                </span>
                              </span>
                            )}
                            {trip.contractTotal > 0 && (
                              <span>
                                <span className="text-[var(--color-ink-muted)]">Contract </span>
                                <span className="font-semibold tabular-nums">
                                  {formatUsd(trip.contractTotal)}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(trip)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this trip?")) removeTrip(trip.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <TaxAccordion
          title="IRS 75% rule (first & last day)"
          body="On trips of 2+ days away from base, many crew use 75% of the full daily M&IE rate on the first and last calendar days of the trip. Middle days use 100%. This tool applies that convention to GSA totals unless you change settings in advanced mode."
        />
        <TaxAccordion
          title="GSA vs contract pay"
          body="Contract per diem is what your airline pays under your CBA—it is not the same as the federal GSA M&IE allowance used for tax planning. Comparing both helps you see pay vs a common worksheet approach; this is not tax or payroll advice."
        />
        <TaxAccordion
          title="Multi-city layovers"
          body="For trips with several layover cities, each calendar day is assigned to the city you were in (departure day counts at the layover you left). Enable multiple cities in advanced options or import a schedule."
        />
      </div>

      <CrewScheduleDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onImport={(data) => {
          form.applyPrefill(data);
        }}
      />
    </div>
  );
}

function TaxAccordion({ title, body }: { title: string; body: string }) {
  return (
    <details className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
        {title}
      </summary>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{body}</p>
    </details>
  );
}

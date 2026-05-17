import { formatUsd, formatShortDate } from "../../lib/format";
import { downloadTripsCsv, openPrintableReport, tripsForYear } from "../../lib/crew/exportReports";
import type { CrewSavedTrip } from "../../lib/crew/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type Props = {
  trips: CrewSavedTrip[];
  year: number;
  onNewTrip: () => void;
  onImport: () => void;
  onViewLog: () => void;
  onEdit: (trip: CrewSavedTrip) => void;
};

export function CrewOverview({ trips, year, onNewTrip, onImport, onViewLog, onEdit }: Props) {
  const yearTrips = tripsForYear(trips, year);
  const recent = yearTrips.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction
          title="Calculate a trip"
          description="Contract pay, GSA M&IE, or compare both with multi-city layovers."
          cta="Open calculator"
          onClick={onNewTrip}
          highlight
        />
        <QuickAction
          title="Import schedule"
          description="CSV, paste, or AI screenshot — faster than typing each leg."
          cta="Import"
          onClick={onImport}
        />
        <QuickAction
          title="Export for taxes"
          description="Free CSV and print-ready PDF — no paywall."
          cta="Export below"
          onClick={() => {
            if (yearTrips.length) downloadTripsCsv(trips, year);
            else onImport();
          }}
        />
      </div>

      <Card padding="lg" className="border-[var(--color-border)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Reports</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {yearTrips.length} trip{yearTrips.length === 1 ? "" : "s"} in {year}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!yearTrips.length}
              onClick={() => downloadTripsCsv(trips, year)}
            >
              Download CSV
            </Button>
            <Button
              type="button"
              disabled={!yearTrips.length}
              onClick={() => openPrintableReport(trips, year)}
            >
              Print / PDF
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
          Competitors often charge for exports. Yours are free — use Print → Save as PDF in the
          dialog.
        </p>
      </Card>

      <Card padding="lg">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Recent trips</h2>
          {trips.length > 0 && (
            <button
              type="button"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              onClick={onViewLog}
            >
              View all
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            No trips yet. Calculate one and tap &quot;Save to trip log&quot;.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--color-border)]">
            {recent.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{t.label}</p>
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {formatShortDate(t.tripStart)} – {formatShortDate(t.tripEnd)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm tabular-nums text-[var(--color-ink-muted)]">
                    {t.gsaTotal > 0 && (
                      <span className="text-[var(--color-primary)]">{formatUsd(t.gsaTotal)} GSA</span>
                    )}
                    {t.contractTotal > 0 && t.gsaTotal > 0 && " · "}
                    {t.contractTotal > 0 && formatUsd(t.contractTotal)}
                  </span>
                  <Button type="button" variant="ghost" onClick={() => onEdit(t)}>
                    Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padding="lg" className="border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5">
        <h3 className="font-semibold text-[var(--color-ink)]">Why crews use this over basic calculators</h3>
        <ul className="mt-3 grid gap-2 text-sm text-[var(--color-ink-muted)] sm:grid-cols-2">
          <li>✓ Live GSA rates (not a stale 2025 table in JavaScript)</li>
          <li>✓ Contract + tax M&IE side-by-side</li>
          <li>✓ 8,800+ airports searchable</li>
          <li>✓ Multi-city layover rules</li>
          <li>✓ Trip log, calendar, free exports</li>
          <li>✓ CSV & AI schedule import</li>
        </ul>
      </Card>
    </div>
  );
}

function QuickAction({
  title,
  description,
  cta,
  onClick,
  highlight
}: {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition hover:scale-[1.01] ${
        highlight
          ? "border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 shadow-md shadow-[var(--color-primary)]/10"
          : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-ink-muted)]"
      }`}
    >
      <p className="font-semibold text-[var(--color-ink)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{description}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-[var(--color-primary)]">
        {cta} →
      </span>
    </button>
  );
}

import { useMemo } from "react";
import { formatUsd } from "../../lib/format";
import { tripsForYear } from "../../lib/crew/exportReports";
import type { CrewSavedTrip } from "../../lib/crew/types";

type Props = {
  trips: CrewSavedTrip[];
  year: number;
  onYearChange: (y: number) => void;
};

export function CrewYearStats({ trips, year, onYearChange }: Props) {
  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    for (const t of trips) {
      set.add(new Date(t.tripStart + "T12:00:00").getFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [trips]);

  const yearTrips = useMemo(() => tripsForYear(trips, year), [trips, year]);
  const contract = yearTrips.reduce((s, t) => s + t.contractTotal, 0);
  const gsa = yearTrips.reduce((s, t) => s + t.gsaTotal, 0);
  const days = yearTrips.reduce((s, t) => s + t.daySegments.length, 0);

  return (
    <div className="crew-stats-bar rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-muted)]/40 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Your {year} crew totals
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Saved in this browser · free exports included
          </p>
        </div>
        <label className="text-sm">
          <span className="sr-only">Tax year</span>
          <select
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--color-ink)]"
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Trips logged" value={String(yearTrips.length)} />
        <StatCard label="Away days" value={String(days)} />
        <StatCard label="Contract pay" value={formatUsd(contract)} accent={false} />
        <StatCard label="GSA M&IE" value={formatUsd(gsa)} accent />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)]/80 bg-[var(--color-surface-elevated)]/90 px-4 py-3.5">
      <p className="text-xs font-medium text-[var(--color-ink-muted)]">{label}</p>
      <p
        className={`mt-1 text-xl font-bold tracking-tight ${
          accent ? "text-[var(--color-primary)]" : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

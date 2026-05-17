import { formatUsd, formatShortDate } from "../../lib/format";
import { downloadTripsCsv, openPrintableReport, tripsForYear } from "../../lib/crew/exportReports";
import type { CrewSavedTrip } from "../../lib/crew/types";
import { useCrewTripLog } from "../../hooks/useCrewTripLog";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type Props = {
  year: number;
  onEdit: (trip: CrewSavedTrip) => void;
};

export function CrewTripLogPanel({ year, onEdit }: Props) {
  const { trips, removeTrip } = useCrewTripLog();
  const yearTrips = tripsForYear(trips, year);

  if (!trips.length) {
    return (
      <Card padding="lg" className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Trip log</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-ink-muted)]">
          Calculate a trip, then tap <strong className="text-[var(--color-ink)]">Save to trip log</strong>.
          Data stays in this browser until you clear site data.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!yearTrips.length}
          onClick={() => downloadTripsCsv(trips, year)}
        >
          Export CSV ({year})
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!yearTrips.length}
          onClick={() => openPrintableReport(trips, year)}
        >
          Print / PDF
        </Button>
      </div>

      <ul className="space-y-3">
        {trips.map((trip) => {
          const inYear = new Date(trip.tripStart + "T12:00:00").getFullYear() === year;
          return (
            <li key={trip.id} className={inYear ? "" : "opacity-50"}>
              <Card
                padding="md"
                className="group border-[var(--color-border)] transition hover:border-[var(--color-primary)]/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--color-ink)]">{trip.label}</p>
                      {trip.legs.length > 1 && (
                        <span className="rounded-md bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-muted)]">
                          {trip.legs.length} cities
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {formatShortDate(trip.tripStart)} – {formatShortDate(trip.tripEnd)}
                      <span className="ml-2 font-mono text-xs">
                        {trip.legs.map((l) => l.airportCode).join(" → ")}
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      {trip.contractTotal > 0 && (
                        <span>
                          <span className="text-[var(--color-ink-muted)]">Contract </span>
                          <span className="font-semibold tabular-nums text-[var(--color-ink)]">
                            {formatUsd(trip.contractTotal)}
                          </span>
                        </span>
                      )}
                      {trip.gsaTotal > 0 && (
                        <span>
                          <span className="text-[var(--color-ink-muted)]">GSA </span>
                          <span className="font-semibold tabular-nums text-[var(--color-primary)]">
                            {formatUsd(trip.gsaTotal)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="secondary" onClick={() => onEdit(trip)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
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
    </div>
  );
}

import type { CrewAirport } from "../../data/crewAirports";
import type { CrewLayoverLeg } from "../../lib/crew/types";
import { newLegId } from "../../lib/crew/types";
import { AirportPicker } from "./AirportPicker";

import { calcInput } from "../../lib/calcUi";

type Props = {
  legs: CrewLayoverLeg[];
  onChange: (legs: CrewLayoverLeg[]) => void;
  tripStart: string;
  tripEnd: string;
};

export function MultiLegEditor({ legs, onChange, tripStart, tripEnd }: Props) {
  const addLeg = () => {
    const seq = legs.length + 1;
    const arrival = tripStart || "";
    const departure = tripEnd || arrival;
    onChange([
      ...legs,
      {
        id: newLegId(),
        sequence: seq,
        airportCode: "",
        city: "",
        country: "USA",
        region: "us",
        arrivalDate: arrival,
        departureDate: departure
      }
    ]);
  };

  const updateLeg = (id: string, patch: Partial<CrewLayoverLeg>) => {
    onChange(legs.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const setAirport = (id: string, airport: CrewAirport | null) => {
    if (!airport) return;
    updateLeg(id, {
      airportCode: airport.code,
      city: airport.city,
      state: airport.state,
      country: airport.country,
      region: airport.region
    });
  };

  const removeLeg = (id: string) => {
    onChange(
      legs
        .filter((l) => l.id !== id)
        .map((l, i) => ({ ...l, sequence: i + 1 }))
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--color-ink-muted)]">
        Departure day from one city counts toward the next layover (IRS layover convention). Legs must
        fit within trip dates {tripStart && tripEnd ? `(${tripStart} → ${tripEnd})` : ""}.
      </p>

      {legs.map((leg) => (
        <div
          key={leg.id}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
              Leg {leg.sequence}
              {leg.airportCode ? ` · ${leg.airportCode}` : ""}
            </span>
            {legs.length > 1 && (
              <button
                type="button"
                className="text-xs font-medium text-[var(--color-error-text)] hover:underline"
                onClick={() => removeLeg(leg.id)}
              >
                Remove
              </button>
            )}
          </div>

          <AirportPicker
            value={
              leg.airportCode
                ? {
                    code: leg.airportCode,
                    city: leg.city,
                    state: leg.state,
                    country: leg.country,
                    region: leg.region
                  }
                : null
            }
            onChange={(a) => setAirport(leg.id, a)}
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Arrival (first day here)
              <input
                type="date"
                className={calcInput}
                value={leg.arrivalDate}
                min={tripStart}
                max={tripEnd}
                onChange={(e) => updateLeg(leg.id, { arrivalDate: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Departure (last day here)
              <input
                type="date"
                className={calcInput}
                value={leg.departureDate}
                min={tripStart}
                max={tripEnd}
                onChange={(e) => updateLeg(leg.id, { departureDate: e.target.value })}
              />
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        onClick={addLeg}
      >
        + Add layover city
      </button>
    </div>
  );
}

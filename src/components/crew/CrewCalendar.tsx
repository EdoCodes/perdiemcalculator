import { useEffect, useMemo, useState } from "react";
import { formatUsd } from "../../lib/format";
import { useCrewTripLog } from "../../hooks/useCrewTripLog";
import { Card } from "../ui/Card";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = { year: number };

export function CrewCalendar({ year: statsYear }: Props) {
  const { trips } = useCrewTripLog();
  const [cursor, setCursor] = useState(() => new Date(statsYear, new Date().getMonth(), 1));
  const [view, setView] = useState<"gsa" | "contract">("gsa");

  useEffect(() => {
    setCursor((c) => new Date(statsYear, c.getMonth(), 1));
  }, [statsYear]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const dayMap = useMemo(() => {
    const map = new Map<
      string,
      { airportCode: string; amount: number; contract: number; gsa: number }
    >();
    for (const trip of trips) {
      for (const seg of trip.daySegments) {
        const prev = map.get(seg.date);
        const amount =
          view === "gsa" ? seg.gsaAmount : seg.contractAmount;
        if (prev) {
          map.set(seg.date, {
            airportCode: seg.airportCode,
            amount: prev.amount + amount,
            contract: prev.contract + seg.contractAmount,
            gsa: prev.gsa + seg.gsaAmount
          });
        } else {
          map.set(seg.date, {
            airportCode: seg.airportCode,
            amount,
            contract: seg.contractAmount,
            gsa: seg.gsaAmount
          });
        }
      }
    }
    return map;
  }, [trips, view]);

  const monthTotal = useMemo(() => {
    let sum = 0;
    for (const [iso, v] of dayMap) {
      const d = new Date(iso + "T12:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) sum += v.amount;
    }
    return Math.round(sum * 100) / 100;
  }, [dayMap, year, month]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: { iso: string | null; inMonth: boolean }[] = [];
    for (let i = 0; i < startPad; i++) grid.push({ iso: null, inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      grid.push({ iso, inMonth: true });
    }
    while (grid.length % 7 !== 0) grid.push({ iso: null, inMonth: false });
    return grid;
  }, [year, month]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const shiftMonth = (delta: number) => {
    setCursor(new Date(year, month + delta, 1));
  };

  if (!trips.length) {
    return (
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Trip calendar</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Save trips from the calculator to see per-day amounts on the calendar.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Trip calendar</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {monthLabel} · {formatUsd(monthTotal)} {view === "gsa" ? "GSA M&IE" : "contract"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
            value={view}
            onChange={(e) => setView(e.target.value as "gsa" | "contract")}
          >
            <option value="gsa">GSA M&IE</option>
            <option value="contract">Contract pay</option>
          </select>
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
            onClick={() => shiftMonth(-1)}
          >
            ←
          </button>
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
            onClick={() => shiftMonth(1)}
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2 font-medium text-[var(--color-ink-muted)]">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell.iso) {
            return <div key={`pad-${i}`} className="min-h-[4.5rem] rounded-lg bg-transparent" />;
          }
          const data = dayMap.get(cell.iso);
          const dayNum = parseInt(cell.iso.slice(8), 10);
          const isToday =
            cell.iso ===
            new Date().toISOString().slice(0, 10);
          return (
            <div
              key={cell.iso}
              className={`min-h-[4.5rem] rounded-lg border p-1.5 text-left ${
                isToday
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)]/60 bg-[var(--color-surface-muted)]/30"
              }`}
            >
              <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">
                {dayNum}
              </span>
              {data && data.amount > 0 && (
                <div className="mt-1">
                  <span className="block font-mono text-[10px] font-semibold text-[var(--color-ink)]">
                    {data.airportCode}
                  </span>
                  <span className="block text-[10px] text-[var(--color-ink-muted)]">
                    {formatUsd(data.amount)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

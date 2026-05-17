import { useEffect, useMemo, useState } from "react";
import type { CrewAirport } from "../../data/crewAirports";
import { filterCrewAirports, loadCrewAirports } from "../../lib/crew/loadAirports";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] shadow-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20";

type Props = {
  value: CrewAirport | null;
  onChange: (airport: CrewAirport | null) => void;
};

export function AirportPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [airports, setAirports] = useState<CrewAirport[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    loadCrewAirports().then((list) => {
      setAirports(list);
      setTotalCount(list.length);
      setLoading(false);
    });
  }, []);

  const matches = useMemo(
    () => filterCrewAirports(airports, query),
    [airports, query]
  );

  const displayValue = value
    ? `${value.code} — ${value.city}${value.state ? `, ${value.state}` : ` (${value.country})`}`
    : "";

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[var(--color-ink)]">
        Layover airport
        <input
          type="search"
          className={inputClass}
          placeholder={loading ? "Loading airports…" : "Search code or city (e.g. DFW, Miami)…"}
          value={open ? query : displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          disabled={loading}
          autoComplete="off"
        />
      </label>
      <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
        {loading
          ? "Loading airport directory…"
          : totalCount
            ? `${totalCount.toLocaleString()} airports · US layovers use live GSA M&IE`
            : "Search by IATA code or city"}
      </p>

      {open && !loading && matches.length > 0 && (
        <ul
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-xl ring-1 ring-black/10"
          role="listbox"
        >
          {matches.map((a) => (
            <li key={a.code}>
              <button
                type="button"
                role="option"
                className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-[var(--color-surface-muted)]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(a);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="font-mono font-semibold text-[var(--color-primary)]">
                  {a.code}
                </span>
                <span className="ml-2 text-[var(--color-ink)]">{a.city}</span>
                <span className="ml-2 text-[var(--color-ink-muted)]">
                  {a.state ? `${a.state} · USA` : a.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query && matches.length === 0 && (
        <p className="absolute z-20 mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-ink-muted)] shadow-lg">
          No airports match &quot;{query}&quot;
        </p>
      )}

      {value && (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-[var(--color-primary)] hover:underline"
          onClick={() => onChange(null)}
        >
          Clear airport
        </button>
      )}
    </div>
  );
}

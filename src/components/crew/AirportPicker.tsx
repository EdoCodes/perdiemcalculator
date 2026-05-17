import { useEffect, useMemo, useState } from "react";
import type { CrewAirport } from "../../data/crewAirports";
import { filterCrewAirports, loadCrewAirports } from "../../lib/crew/loadAirports";
import { calcInput } from "../../lib/calcUi";

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
      <label className="block">
        <span className="calc-rubric">Layover search</span>
        <span className="mt-1 block text-sm font-semibold text-[var(--color-ink)]">
          Airport or city
        </span>
        <div className="calc-search-field">
          <input
            type="search"
            className={calcInput}
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
        </div>
      </label>
      <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
        {loading
          ? "Loading airport directory…"
          : totalCount
            ? `${totalCount.toLocaleString()} airports · US layovers use live GSA M&IE`
            : "Search by IATA code or city"}
      </p>

      {open && !loading && matches.length > 0 && (
        <ul
          className="calc-dropdown absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl py-1"
          role="listbox"
        >
          {matches.map((a) => (
            <li key={a.code}>
              <button
                type="button"
                role="option"
                className="w-full px-3.5 py-2.5 text-left text-sm transition hover:bg-[var(--color-surface-muted)]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(a);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="font-mono font-bold text-[var(--color-accent)]">{a.code}</span>
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
        <p className="calc-dropdown absolute z-20 mt-2 w-full rounded-xl px-3 py-2.5 text-sm text-[var(--color-ink-muted)]">
          No airports match &quot;{query}&quot;
        </p>
      )}

      {value && (
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          onClick={() => onChange(null)}
        >
          Clear airport
        </button>
      )}
    </div>
  );
}

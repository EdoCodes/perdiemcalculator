import { useEffect, useMemo, useState } from "react";
import type { SchoolDistrict } from "../../lib/lea/types";
import { fetchDistrictsForState, filterDistricts } from "../../lib/lea/loadDistricts";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] shadow-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20";

type Props = {
  state: string;
  value: SchoolDistrict | null;
  onChange: (district: SchoolDistrict | null) => void;
};

export function DistrictPicker({ state, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [districts, setDistricts] = useState<SchoolDistrict[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setQuery("");
    fetchDistrictsForState(state)
      .then((rows) => {
        if (!cancelled) setDistricts(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state]);

  const matches = useMemo(() => filterDistricts(districts, query), [districts, query]);

  const displayValue = value
    ? value.city
      ? `${value.name} — ${value.city}`
      : value.name
    : "";

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[var(--color-ink)]">
        School district (optional)
        <input
          type="search"
          className={inputClass}
          placeholder={loading ? "Loading districts…" : "Search your district…"}
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
          disabled={loading || districts.length === 0}
          autoComplete="off"
        />
      </label>
      <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
        {loading
          ? "Loading NCES directory…"
          : `${districts.length.toLocaleString()} districts in ${state}. Sets employer state rules.`}
      </p>

      {open && !loading && matches.length > 0 && (
        <ul
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-lg"
          role="listbox"
        >
          {matches.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                role="option"
                className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-[var(--color-surface-muted)]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(d);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="font-medium text-[var(--color-ink)]">{d.name}</span>
                {d.city && (
                  <span className="ml-2 text-[var(--color-ink-muted)]">{d.city}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {value && (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-[var(--color-primary)] hover:underline"
          onClick={() => onChange(null)}
        >
          Clear district
        </button>
      )}
    </div>
  );
}

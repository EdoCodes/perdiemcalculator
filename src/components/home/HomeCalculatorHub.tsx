import { useEffect, useMemo, useState } from "react";
import {
  PROFESSIONS,
  STORAGE_KEY_PROFESSION,
  type Profession
} from "../../data/professions";
import { ProfessionLogo } from "../profession/ProfessionLogo";

/** Extra tools shown on the home grid (not in PROFESSIONS). */
const EXTRA_CALCULATORS = [
  {
    id: "travel-roi",
    name: "Travel program ROI",
    shortLabel: "Corporate ROI",
    description: "Annual spend, savings, and payback for travel programs.",
    href: "/calculator/roi/",
    available: true
  }
] as const;

type HubItem =
  | (Profession & { kind: "profession" })
  | (typeof EXTRA_CALCULATORS)[number] & { kind: "extra" };

function toHubItems(): HubItem[] {
  const professions = PROFESSIONS.map((p) => ({ ...p, kind: "profession" as const }));
  const extras = EXTRA_CALCULATORS.map((e) => ({ ...e, kind: "extra" as const }));
  return [...professions.filter((p) => p.available), ...extras];
}

function CalculatorTile({
  item,
  onSelect
}: {
  item: HubItem;
  onSelect: () => void;
}) {
  const disabled = !item.available;
  const label = item.kind === "profession" ? item.shortName : item.shortLabel;
  const sub =
    item.kind === "profession"
      ? item.badges[0] ?? "Calculator"
      : "Finance teams";

  const className = [
    "home-calc-card group flex flex-col items-center rounded-xl border px-4 py-6 text-center transition",
    disabled
      ? "cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 opacity-60"
      : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-accent)] hover:shadow-md"
  ].join(" ");

  const inner = (
    <>
      {item.kind === "profession" ? (
        <ProfessionLogo professionId={item.id} size="lg" available={item.available} />
      ) : (
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-muted)] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20"
          aria-hidden
        >
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19V5M4 19h16M8 15l3-4 3 3 4-6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      <p className="mt-3.5 text-base font-semibold leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
        {label}
      </p>
      <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{sub}</p>
    </>
  );

  if (disabled) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <a href={item.href} className={className} onClick={onSelect}>
      {inner}
    </a>
  );
}

export function HomeCalculatorHub() {
  const [query, setQuery] = useState("");
  const [lastId, setLastId] = useState<string | null>(null);

  const allItems = useMemo(() => toHubItems(), []);

  useEffect(() => {
    try {
      setLastId(localStorage.getItem(STORAGE_KEY_PROFESSION));
    } catch {
      /* ignore */
    }
  }, []);

  const remember = (id: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFESSION, id);
      setLastId(id);
    } catch {
      /* ignore */
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) => {
      const hay =
        item.kind === "profession"
          ? `${item.name} ${item.shortName} ${item.description} ${item.badges.join(" ")}`
          : `${item.name} ${item.shortLabel} ${item.description}`;
      return hay.toLowerCase().includes(q);
    });
  }, [query, allItems]);

  const availableCount = allItems.length;
  const lastProfession = lastId
    ? PROFESSIONS.find((p) => p.id === lastId && p.available)
    : undefined;

  return (
    <div className="home-hero">
      <div className="home-hero__top">
        <div className="home-hero__copy">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">perdiemcalculator.com</p>
          <h1 className="home-hero__title font-display mt-2 text-[var(--color-ink)]">
            <span className="block text-2xl font-semibold sm:text-3xl">Your trip in</span>
            <span className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-4xl font-bold text-[var(--color-accent)] sm:text-5xl lg:text-6xl">
                {availableCount}
              </span>
              <span className="text-3xl font-bold sm:text-4xl lg:text-5xl">free calculators</span>
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
            GSA federal, airline crew, teachers, truck drivers, and corporate travel ROI—pick a
            calculator tuned to how you get paid.
          </p>
        </div>

        <label className="home-hero__search block shrink-0">
          <span className="sr-only">Search calculators</span>
          <div className="home-search-pill relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-ink-muted)]"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M16 16l5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search calculator…"
              className="w-full rounded-full border-0 bg-transparent py-3.5 pl-12 pr-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none"
            />
          </div>
        </label>
      </div>

      {lastProfession && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm sm:justify-start">
          <ProfessionLogo professionId={lastProfession.id} size="sm" />
          <span className="text-[var(--color-ink-muted)]">
            Continue with{" "}
            <span className="font-semibold text-[var(--color-ink)]">{lastProfession.shortName}</span>
          </span>
          <a
            href={lastProfession.href}
            onClick={() => remember(lastProfession.id)}
            className="font-semibold text-[var(--color-accent)] hover:underline"
          >
            Open →
          </a>
        </div>
      )}

      <div className="home-calc-panel mt-8">
        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-[var(--color-ink-muted)]">
            No calculators match &ldquo;{query}&rdquo;. Try &ldquo;federal&rdquo;, &ldquo;crew&rdquo;, or
            &ldquo;teacher&rdquo;.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((item) => (
              <li key={item.id}>
                <CalculatorTile
                  item={item}
                  onSelect={() => {
                    if (item.kind === "profession") remember(item.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}

        {PROFESSIONS.some((p) => !p.available) && !query.trim() && (
          <p className="border-t border-[var(--color-border)] px-5 py-4 text-center text-xs text-[var(--color-ink-muted)]">
            Travel nurse and field sales calculators coming soon.
          </p>
        )}
      </div>
    </div>
  );
}

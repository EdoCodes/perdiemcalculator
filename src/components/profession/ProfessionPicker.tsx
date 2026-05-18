import { useEffect, useMemo, useState } from "react";
import {
  PROFESSION_CATEGORIES,
  PROFESSIONS,
  STORAGE_KEY_PROFESSION,
  type Profession,
  type ProfessionCategory
} from "../../data/professions";
import { Badge } from "../ui/Badge";
import { ProfessionLogo } from "./ProfessionLogo";

const QUICK_LINKS: { id: Profession["id"]; label: string }[] = [
  { id: "government-federal", label: "Federal GSA" },
  { id: "aviation-crew", label: "Airline crew" },
  { id: "education-teacher", label: "Teachers" }
];

function ProfessionCardTitle({ profession }: { profession: Profession }) {
  return (
    <div className="flex items-start gap-3">
      <ProfessionLogo professionId={profession.id} size="md" available={profession.available} />
      <div>
        <h3 className="font-semibold text-[var(--color-ink)]">{profession.name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {profession.badges.map((b) => (
            <Badge key={b} variant={profession.available ? "primary" : "muted"}>
              {b}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfessionCard({
  profession,
  onSelect
}: {
  profession: Profession;
  onSelect: (p: Profession) => void;
}) {
  const disabled = !profession.available;
  const cardClass = [
    "group relative flex h-full flex-col rounded-xl border p-5 text-left transition",
    disabled
      ? "cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 opacity-65"
      : "cursor-pointer border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-accent)]"
  ].join(" ");

  const body = (
    <>
      <ProfessionCardTitle profession={profession} />
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)] line-clamp-2">
        {profession.description}
      </p>
      {profession.highlights.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {profession.highlights.map((h) => (
            <li
              key={h}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-xs text-[var(--color-ink-muted)]"
            >
              {h}
            </li>
          ))}
        </ul>
      )}
      {profession.available && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)]">
          Open calculator
          <span aria-hidden>→</span>
        </span>
      )}
    </>
  );

  if (disabled) {
    return (
      <div aria-disabled className={cardClass}>
        {body}
      </div>
    );
  }

  return (
    <a href={profession.href} className={cardClass} onClick={() => onSelect(profession)}>
      {body}
    </a>
  );
}

function LastProfessionBanner({
  profession,
  remember
}: {
  profession: Profession;
  remember: (p: Profession) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <ProfessionLogo professionId={profession.id} size="sm" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
            Continue where you left off
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{profession.shortName}</p>
        </div>
      </div>
      <a
        href={profession.href}
        onClick={() => remember(profession)}
        className="profession-chip shrink-0 font-semibold"
      >
        Continue
      </a>
    </div>
  );
}

function ProfessionQuickNav({
  activeId,
  onPick
}: {
  activeId: string | null;
  onPick: (p: Profession) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      role="navigation"
      aria-label="Popular professions"
    >
      {QUICK_LINKS.map(({ id, label }) => {
        const profession = PROFESSIONS.find((p) => p.id === id);
        if (!profession?.available) return null;
        const active = activeId === id;
        return (
          <a
            key={id}
            href={profession.href}
            onClick={() => onPick(profession)}
            className={`profession-chip ${active ? "profession-chip--active" : ""}`}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}

function CategoryTabs({
  category,
  setCategory
}: {
  category: ProfessionCategory | "all";
  setCategory: (c: ProfessionCategory | "all") => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter by category">
      {PROFESSION_CATEGORIES.map((cat) => {
        const active = category === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setCategory(cat.id)}
            className={`profession-chip text-sm ${active ? "profession-chip--active" : ""}`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProfessionPicker({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProfessionCategory | "all">("all");
  const [lastId, setLastId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLastId(localStorage.getItem(STORAGE_KEY_PROFESSION));
    } catch {
      /* ignore */
    }
  }, []);

  const remember = (p: Profession) => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFESSION, p.id);
      setLastId(p.id);
    } catch {
      /* ignore */
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROFESSIONS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.description} ${p.badges.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, category]);

  const available = filtered.filter((p) => p.available);
  const upcoming = filtered.filter((p) => !p.available);
  const lastProfession = lastId ? PROFESSIONS.find((p) => p.id === lastId && p.available) : undefined;

  return (
    <div className={compact ? "space-y-5" : "space-y-8"}>
      {lastProfession && <LastProfessionBanner profession={lastProfession} remember={remember} />}

      <div className={compact ? "space-y-4" : "space-y-6"}>
        <ProfessionQuickNav activeId={lastId} onPick={remember} />

        <label className="mx-auto block max-w-xl">
          <span className="sr-only">Search professions</span>
          <SearchInput query={query} setQuery={setQuery} />
        </label>

        <CategoryTabs category={category} setCategory={setCategory} />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border-strong)] px-6 py-10 text-center text-sm text-[var(--color-ink-muted)]">
          No professions match your search. Try &ldquo;teacher&rdquo;, &ldquo;government&rdquo;, or
          &ldquo;airline&rdquo;.
        </p>
      ) : (
        <>
          {available.length > 0 && (
            <section>
              {!compact && (
                <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                  Available now
                </h2>
              )}
              <ul className="grid gap-4 sm:grid-cols-2">
                {available.map((p) => (
                  <li key={p.id}>
                    <ProfessionCard profession={p} onSelect={remember} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Coming soon
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((p) => (
                  <li key={p.id}>
                    <ProfessionCard profession={p} onSelect={remember} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SearchInput({
  query,
  setQuery
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-ink-muted)]"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by role, industry, or keyword…"
        className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] py-3 pl-11 pr-4 text-sm text-[var(--color-ink)] transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
      />
    </div>
  );
}


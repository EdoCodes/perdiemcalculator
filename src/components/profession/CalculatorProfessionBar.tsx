import { useEffect } from "react";
import { getProfessionById, STORAGE_KEY_PROFESSION } from "../../data/professions";

type Props = {
  professionId: string;
};

export function CalculatorProfessionBar({ professionId }: Props) {
  const profession = getProfessionById(professionId);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFESSION, professionId);
    } catch {
      /* ignore */
    }
  }, [professionId]);

  if (!profession) return null;

  return (
    <nav
      className="calc-step-bar mb-8 flex flex-col gap-4 rounded-2xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Calculator steps"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        <li>
          <a
            href="/calculator/"
            className="font-medium text-[var(--color-ink-muted)] transition hover:text-[var(--color-primary)]"
          >
            1. Profession
          </a>
        </li>
        <li className="text-[var(--color-ink-muted)]" aria-hidden>
          /
        </li>
        <li className="font-semibold text-[var(--color-accent)]" aria-current="step">
          2. {profession.shortName}
        </li>
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-[var(--color-ink-muted)]">
          Calculating for <strong className="text-[var(--color-ink)]">{profession.shortName}</strong>
        </span>
        <a
          href="/calculator/"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-primary)]/40"
        >
          Change profession
        </a>
      </div>
    </nav>
  );
}

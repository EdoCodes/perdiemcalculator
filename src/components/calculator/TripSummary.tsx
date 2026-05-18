import { formatUsd } from "../../lib/format";
import type { TripResult } from "../../lib/perdiem/types";

export function TripSummary({
  result,
  showLodging150
}: {
  result: TripResult;
  showLodging150: boolean;
}) {
  const lodgingMax = showLodging150
    ? result.days.reduce((s, d) => s + d.lodging150, 0)
    : result.totalLodging;
  const miePct = result.grandTotal > 0 ? (result.totalMie / result.grandTotal) * 100 : 0;
  const lodgingPct = 100 - miePct;

  return (
    <div className="sticky top-6 space-y-4 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] p-6 shadow-lg shadow-black/35">
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-muted)]">Estimated trip total</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--color-ink)]">
          {formatUsd(result.grandTotal)}
        </p>
        <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
          {result.dayCount} day{result.dayCount !== 1 ? "s" : ""} · {result.nightCount} night
          {result.nightCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
        <div
          className="flex h-full"
          title={`Lodging ${lodgingPct.toFixed(0)}% · M&IE ${miePct.toFixed(0)}%`}
        >
          <div
            className="bg-[var(--color-ink)] transition-all duration-500"
            style={{ width: `${lodgingPct}%` }}
          />
          <div
            className="bg-[var(--color-accent)] transition-all duration-500"
            style={{ width: `${miePct}%` }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-[var(--color-surface-muted)] p-3">
          <dt className="text-[var(--color-ink-muted)]">Lodging</dt>
          <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">
            {formatUsd(result.totalLodging)}
          </dd>
        </div>
        <div className="rounded-xl bg-[var(--color-surface-muted)] p-3">
          <dt className="text-[var(--color-ink-muted)]">M&IE</dt>
          <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">{formatUsd(result.totalMie)}</dd>
        </div>
      </dl>

      {showLodging150 ? (
        <p className="text-xs text-[var(--color-ink-muted)]">
          At 150% lodging cap (if approved): {formatUsd(lodgingMax + result.totalMie)}
        </p>
      ) : null}
    </div>
  );
}

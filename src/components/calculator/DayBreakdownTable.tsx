import { formatShortDate, formatUsd } from "../../lib/format";
import type { DayBreakdown } from "../../lib/perdiem/types";
import { Badge } from "../ui/Badge";

export function DayBreakdownTable({
  days,
  showLodging150
}: {
  days: DayBreakdown[];
  showLodging150: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
            <th className="px-4 py-3 font-semibold text-[var(--color-ink)]">Date</th>
            <th className="px-4 py-3 font-semibold text-[var(--color-ink)]">FY</th>
            <th className="px-4 py-3 font-semibold text-[var(--color-ink)]">Lodging</th>
            <th className="px-4 py-3 font-semibold text-[var(--color-ink)]">M&IE</th>
            <th className="px-4 py-3 font-semibold text-[var(--color-ink)]">Deductions</th>
            <th className="px-4 py-3 text-right font-semibold text-[var(--color-ink)]">Daily</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr
              key={day.date}
              className="border-b border-[var(--color-border)] last:border-0 odd:bg-[var(--color-surface-elevated)] even:bg-[var(--color-surface-muted)]/40"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-[var(--color-ink)]">{formatShortDate(day.date)}</div>
                {day.isTravelDay ? (
                  <Badge variant="accent">
                    {day.isFirstDay && day.isLastDay
                      ? "Travel day"
                      : day.isFirstDay
                        ? "First day"
                        : "Last day"}
                  </Badge>
                ) : null}
              </td>
              <td className="px-4 py-3 text-[var(--color-ink-muted)]">{day.fiscalYear}</td>
              <td className="px-4 py-3">
                <span className="font-medium">{formatUsd(day.lodging)}</span>
                {showLodging150 ? (
                  <span className="ml-1 text-xs text-[var(--color-ink-muted)]">
                    (150%: {formatUsd(day.lodging150)})
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <span className="font-medium">{formatUsd(day.mieNet)}</span>
                {day.mieAfterTravelAdjustment !== day.mieTotal ? (
                  <span className="block text-xs text-[var(--color-ink-muted)]">
                    from {formatUsd(day.mieTotal)}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                {day.mealDeduction > 0 ? `−${formatUsd(day.mealDeduction)}` : "—"}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-[var(--color-ink)]">
                {formatUsd(day.dailyTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

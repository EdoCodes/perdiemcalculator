import { useCallback, useEffect, useMemo, useState } from "react";
import { US_STATES } from "../../data/usStates";
import {
  calculateAssignment,
  defaultLodgingNights,
  type AssignmentResult,
  type StipendCapStatus
} from "../../lib/assignment/calculate";
import { eachTripDay, fiscalYearForDate } from "../../lib/perdiem/fiscalYear";
import {
  fetchLocalitiesForState,
  fetchLocalityRatesForTripByDid,
  resolveLocalityByZip,
  type LocalityListItem
} from "../../lib/rates/queries";
import { isSupabaseConfigured } from "../../lib/supabaseRest";
import { STORAGE_KEY_PROFESSION } from "../../data/professions";
import { formatUsd } from "../../lib/format";
import { calcInput, calcPill, calcPillActive } from "../../lib/calcUi";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { AssignmentCalculatorConfig } from "./assignmentCalculatorConfig";

function CapLabel({
  status,
  overAmount,
  overMessage
}: {
  status: StipendCapStatus;
  overAmount: number;
  overMessage: string;
}) {
  if (status === "over") {
    return (
      <span className="text-[var(--color-error-text)]">
        {overMessage.replace("{amount}", formatUsd(overAmount))}
      </span>
    );
  }
  if (status === "within") {
    return <span className="text-[var(--color-ink)]">Within GSA cap</span>;
  }
  return <span className="text-[var(--color-ink-muted)]">Under GSA cap</span>;
}

function formatLocalityLabel(l: LocalityListItem): string {
  if (l.isStandard) return `${l.state} — Standard rate`;
  const place = l.county ? `${l.city} (${l.county})` : l.city;
  return `${place}, ${l.state}`;
}

type Props = {
  config: AssignmentCalculatorConfig;
};

export function AssignmentPerDiemCalculator({ config }: Props) {
  const [destState, setDestState] = useState("TX");
  const [zip, setZip] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [did, setDid] = useState("");
  const [localityLabel, setLocalityLabel] = useState("");
  const [localities, setLocalities] = useState<LocalityListItem[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [partialTravelDays, setPartialTravelDays] = useState(false);
  const [compareHousing, setCompareHousing] = useState("");
  const [compareMeals, setCompareMeals] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssignmentResult | null>(null);

  const supabaseReady = isSupabaseConfigured();
  const pickerFy = useMemo(() => {
    if (start) return fiscalYearForDate(new Date(start + "T12:00:00"));
    return fiscalYearForDate(new Date());
  }, [start]);

  useEffect(() => {
    if (!supabaseReady) return;
    let cancelled = false;
    setLoadingLocalities(true);
    fetchLocalitiesForState(destState, pickerFy)
      .then((rows) => {
        if (!cancelled) {
          setLocalities(rows);
          if (rows.length && !rows.some((r) => r.id === localityId)) {
            const first = rows[0];
            setLocalityId(first.id);
            setDid(first.did);
            setLocalityLabel(formatLocalityLabel(first));
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLocalities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [destState, pickerFy, supabaseReady, localityId]);

  useEffect(() => {
    if (!localityId) return;
    const loc = localities.find((l) => l.id === localityId);
    if (loc) {
      setDid(loc.did);
      setLocalityLabel(formatLocalityLabel(loc));
    }
  }, [localityId, localities]);

  const resolveZip = useCallback(async () => {
    setError(null);
    if (!supabaseReady) {
      setError("GSA lookup needs rate data configured on this site.");
      return;
    }
    const z = zip.replace(/\D/g, "").slice(0, 5);
    if (z.length !== 5) {
      setError("Enter a 5-digit ZIP code.");
      return;
    }
    const resolved = await resolveLocalityByZip(z, pickerFy);
    if (resolved) {
      setDestState(resolved.state);
      setLocalityId(resolved.id);
      setDid(resolved.did);
      setLocalityLabel(formatLocalityLabel(resolved));
      return;
    }
    setError("ZIP not mapped—pick state and locality below.");
  }, [zip, pickerFy, supabaseReady]);

  const run = useCallback(async () => {
    setError(null);
    setResult(null);
    if (!start || !end) {
      setError("Enter start and end dates.");
      return;
    }
    if (!supabaseReady) {
      setError("Live GSA rates require Supabase configuration on this deployment.");
      return;
    }
    if (!did || !destState) {
      setError("Select a destination location.");
      return;
    }

    const tripDays = eachTripDay(start, end);
    const fiscalYears = [...new Set(tripDays.map((d) => fiscalYearForDate(d)))];

    const housingVal = parseFloat(compareHousing) || 0;
    const mealsVal = parseFloat(compareMeals) || 0;

    setCalculating(true);
    try {
      const localityByFy = await fetchLocalityRatesForTripByDid(did, destState, fiscalYears);
      const computed = calculateAssignment({
        startIso: start,
        endIso: end,
        localityByFy,
        destinationLabel: localityLabel || `${destState} destination`,
        partialTravelDays,
        ...(config.compareMode === "weekly"
          ? { weeklyHousingStipend: housingVal, weeklyMealsStipend: mealsVal }
          : { dailyLodgingRate: housingVal, dailyMieRate: mealsVal })
      });
      if ("error" in computed) {
        setError(computed.error);
        return;
      }
      setResult(computed);
      try {
        localStorage.setItem(STORAGE_KEY_PROFESSION, config.storageProfessionId);
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed.");
    } finally {
      setCalculating(false);
    }
  }, [
    start,
    end,
    did,
    destState,
    localityLabel,
    partialTravelDays,
    compareHousing,
    compareMeals,
    supabaseReady,
    config.compareMode,
    config.storageProfessionId
  ]);

  const lodgingNightsPreview =
    start && end ? defaultLodgingNights(start, end) : null;

  const cmp = result?.employerCompare;

  return (
    <div className="space-y-8">
      <Card padding="lg" className="border-[var(--color-border-strong)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{config.primaryBadge}</Badge>
          <Badge variant="muted">GSA benchmark</Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {config.intro}{" "}
          <a href={config.guidesHref} className="font-medium text-[var(--color-accent)] hover:underline">
            {config.guidesLinkText}
          </a>
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">{config.zipLabel}</span>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="e.g. 30303"
                className={`${calcInput} min-w-[10rem] flex-1`}
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={() => void resolveZip()}>
                Look up
              </Button>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-ink)]">State</span>
            <select
              className={calcInput}
              value={destState}
              onChange={(e) => setDestState(e.target.value)}
            >
              {US_STATES.map((s) => (
                <option key={s.abbr} value={s.abbr}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-ink)]">GSA locality</span>
            <select
              className={calcInput}
              value={localityId}
              disabled={loadingLocalities || !localities.length}
              onChange={(e) => setLocalityId(e.target.value)}
            >
              {localities.map((l) => (
                <option key={l.id} value={l.id}>
                  {formatLocalityLabel(l)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-ink)]">{config.startDateLabel}</span>
            <input type="date" className={calcInput} value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-ink)]">{config.endDateLabel}</span>
            <input type="date" className={calcInput} value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>

        {lodgingNightsPreview != null && start && end && (
          <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
            {eachTripDay(start, end).length} calendar day
            {eachTripDay(start, end).length === 1 ? "" : "s"} · {lodgingNightsPreview} lodging night
            {lodgingNightsPreview === 1 ? "" : "s"}
          </p>
        )}

        <fieldset className="mt-6">
          <legend className="calc-rubric">Travel days (M&amp;IE)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPartialTravelDays(false)}
              className={!partialTravelDays ? calcPillActive : calcPill}
            >
              Full M&amp;IE every day
            </button>
            <button
              type="button"
              onClick={() => setPartialTravelDays(true)}
              className={partialTravelDays ? calcPillActive : calcPill}
            >
              75% first &amp; last day
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-muted)]">{config.travelDayHelp}</p>
        </fieldset>

        <p className="mt-6 text-sm font-semibold text-[var(--color-ink)]">{config.compareSectionTitle}</p>
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-[var(--color-ink-muted)]">{config.compareHousingLabel}</span>
            <input
              type="number"
              min={0}
              step={1}
              className={calcInput}
              value={compareHousing}
              onChange={(e) => setCompareHousing(e.target.value)}
              placeholder={config.compareHousingPlaceholder}
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-ink-muted)]">{config.compareMealsLabel}</span>
            <input
              type="number"
              min={0}
              step={1}
              className={calcInput}
              value={compareMeals}
              onChange={(e) => setCompareMeals(e.target.value)}
              placeholder={config.compareMealsPlaceholder}
            />
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]"
          >
            {error}
          </p>
        )}

        <Button type="button" variant="action" className="mt-6" disabled={calculating} onClick={() => void run()}>
          {calculating ? "Calculating…" : config.calculateLabel}
        </Button>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="calc-stat-card rounded-lg px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                GSA M&amp;IE
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">
                {formatUsd(result.mealsSubtotal)}
              </p>
            </div>
            <div className="calc-stat-card rounded-lg px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                GSA lodging
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">
                {formatUsd(result.lodgingSubtotal)}
              </p>
            </div>
            <div className="calc-stat-card rounded-lg px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                GSA total
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-accent)]">
                {formatUsd(result.gsaTotal)}
              </p>
            </div>
          </div>

          {cmp && (
            <Card padding="lg">
              <h3 className="font-display text-lg text-[var(--color-ink)]">{config.compareCardTitle}</h3>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                {cmp.compareMode === "weekly" ? (
                  <>
                    Roughly {cmp.assignmentWeeks} week
                    {cmp.assignmentWeeks === 1 ? "" : "s"} ({result.dayCount} calendar days, rounded up from days ÷
                    7—not your contract week count) at {formatUsd(cmp.weeklyHousing)}/wk housing +{" "}
                    {formatUsd(cmp.weeklyMeals)}/wk meals.
                  </>
                ) : (
                  <>
                    {result.dayCount} day{result.dayCount === 1 ? "" : "s"} · {result.lodgingNights} lodging night
                    {result.lodgingNights === 1 ? "" : "s"} at {formatUsd(cmp.dailyLodging)}/night +{" "}
                    {formatUsd(cmp.dailyMie)}/day M&amp;IE.
                  </>
                )}
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-4">
                  <h4 className="text-sm font-semibold text-[var(--color-ink)]">{config.housingCompareHeading}</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-muted)]">{config.employerHousingRowLabel}</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">
                        {formatUsd(cmp.employerHousingTotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-muted)]">GSA lodging cap</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">{formatUsd(cmp.gsaLodgingCap)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs font-medium">
                    <CapLabel
                      status={cmp.housingStatus}
                      overAmount={cmp.housingOverAmount}
                      overMessage={config.overCapMessage}
                    />
                  </p>
                </div>

                <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-4">
                  <h4 className="text-sm font-semibold text-[var(--color-ink)]">{config.mealsCompareHeading}</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-muted)]">{config.employerMealsRowLabel}</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">{formatUsd(cmp.employerMealsTotal)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-muted)]">GSA M&amp;IE cap</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">{formatUsd(cmp.gsaMieCap)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs font-medium">
                    <CapLabel
                      status={cmp.mealsStatus}
                      overAmount={cmp.mealsOverAmount}
                      overMessage={config.overCapMessage}
                    />
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-3 border-t border-[var(--color-border)] pt-4 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-ink-muted)]">Employer total (est.)</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">{formatUsd(cmp.employerTotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-ink-muted)]">GSA benchmark total</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">{formatUsd(result.gsaTotal)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-[var(--color-ink-muted)]">
                {config.compareFooterNote}{" "}
                <a
                  href={config.compareGuideHref}
                  className="font-medium text-[var(--color-accent)] hover:underline"
                >
                  {config.compareGuideText}
                </a>
                —not tax advice.
              </p>
            </Card>
          )}

          <Card padding="lg">
            <h3 className="font-display text-lg text-[var(--color-ink)]">
              Daily breakdown — {result.destinationLabel}
            </h3>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-border-strong)]">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]">
                    <th className="px-3 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 font-semibold">M&amp;IE</th>
                    <th className="px-3 py-2 font-semibold">Lodging</th>
                    <th className="px-3 py-2 text-right font-semibold">Daily</th>
                  </tr>
                </thead>
                <tbody>
                  {result.days.map((d) => (
                    <tr key={d.date} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="px-3 py-2">
                        {d.date}
                        {d.isTravelDay && result.dayCount > 1 && partialTravelDays ? (
                          <span className="ml-2 text-xs text-[var(--color-accent)]">75%</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">{formatUsd(d.mieAllowed)}</td>
                      <td className="px-3 py-2">{formatUsd(d.lodgingAllowed)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatUsd(d.dailyTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

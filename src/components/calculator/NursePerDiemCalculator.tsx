import { useCallback, useEffect, useMemo, useState } from "react";
import { US_STATES } from "../../data/usStates";
import {
  calculateNurseAssignment,
  defaultLodgingNights,
  type NurseAssignmentResult,
  type StipendCapStatus
} from "../../lib/nurse/calculate";
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

function StipendCapLabel({ status, overAmount }: { status: StipendCapStatus; overAmount: number }) {
  if (status === "over") {
    return (
      <span className="text-[var(--color-error-text)]">
        Over GSA cap by {formatUsd(overAmount)} — may be taxable
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

export function NursePerDiemCalculator() {
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
  const [weeklyHousing, setWeeklyHousing] = useState("");
  const [weeklyMeals, setWeeklyMeals] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NurseAssignmentResult | null>(null);

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
      setError("Enter a 5-digit assignment ZIP code.");
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
      setError("Enter assignment start and end dates.");
      return;
    }
    if (!supabaseReady) {
      setError("Live GSA rates require Supabase configuration on this deployment.");
      return;
    }
    if (!did || !destState) {
      setError("Select an assignment location.");
      return;
    }

    const tripDays = eachTripDay(start, end);
    const fiscalYears = [...new Set(tripDays.map((d) => fiscalYearForDate(d)))];

    setCalculating(true);
    try {
      const localityByFy = await fetchLocalityRatesForTripByDid(did, destState, fiscalYears);
      const computed = calculateNurseAssignment({
        startIso: start,
        endIso: end,
        localityByFy,
        destinationLabel: localityLabel || `${destState} assignment`,
        partialTravelDays,
        weeklyHousingStipend: parseFloat(weeklyHousing) || 0,
        weeklyMealsStipend: parseFloat(weeklyMeals) || 0
      });
      if ("error" in computed) {
        setError(computed.error);
        return;
      }
      setResult(computed);
      try {
        localStorage.setItem(STORAGE_KEY_PROFESSION, "travel-nurse");
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
    weeklyHousing,
    weeklyMeals,
    supabaseReady
  ]);

  const lodgingNightsPreview =
    start && end ? defaultLodgingNights(start, end) : null;

  return (
    <div className="space-y-8">
      <Card padding="lg" className="border-[var(--color-border-strong)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Travel nurse & allied health</Badge>
          <Badge variant="muted">GSA benchmark</Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Estimate <strong className="text-[var(--color-ink)]">GSA lodging and M&amp;IE</strong> for
          your assignment city—useful when comparing agency housing and meal stipends to federal
          per-diem caps. Tax-free treatment depends on your tax home, assignment length, and
          substantiation; verify with your agency and tax preparer.{" "}
          <a href="/guides/nursing/" className="font-medium text-[var(--color-accent)] hover:underline">
            Nurse guides
          </a>
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              Assignment ZIP (hospital area)
            </span>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="e.g. 77030"
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
            <span className="text-sm font-semibold text-[var(--color-ink)]">Assignment start</span>
            <input type="date" className={calcInput} value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Assignment end</span>
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
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-muted)]">
            Most travel-nurse stipend benchmarks use <strong className="text-[var(--color-ink)]">full daily M&amp;IE</strong>.
            Choose 75% on first and last days only if your agency or tax preparer follows federal travel-day rules (common
            for government-style itineraries).
          </p>
        </fieldset>

        <p className="mt-6 text-sm font-semibold text-[var(--color-ink)]">
          Agency stipends (optional — for comparison)
        </p>
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-[var(--color-ink-muted)]">Weekly housing stipend ($)</span>
            <input
              type="number"
              min={0}
              step={1}
              className={calcInput}
              value={weeklyHousing}
              onChange={(e) => setWeeklyHousing(e.target.value)}
              placeholder="e.g. 1200"
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-ink-muted)]">Weekly meals / incidentals ($)</span>
            <input
              type="number"
              min={0}
              step={1}
              className={calcInput}
              value={weeklyMeals}
              onChange={(e) => setWeeklyMeals(e.target.value)}
              placeholder="e.g. 450"
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
          {calculating ? "Calculating…" : "Calculate assignment per diem"}
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

          {result.stipendCompare && (
            <Card padding="lg">
              <h3 className="font-display text-lg text-[var(--color-ink)]">Agency stipend comparison</h3>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Roughly {result.stipendCompare.assignmentWeeks} week
                {result.stipendCompare.assignmentWeeks === 1 ? "" : "s"} (
                {result.dayCount} calendar days, rounded up from days ÷ 7—not your contract week count) at{" "}
                {formatUsd(result.stipendCompare.weeklyHousing)}/wk housing +{" "}
                {formatUsd(result.stipendCompare.weeklyMeals)}/wk meals.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-4">
                  <h4 className="text-sm font-semibold text-[var(--color-ink)]">Housing stipend vs GSA lodging</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-muted)]">Agency housing (est.)</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">
                        {formatUsd(result.stipendCompare.agencyHousingTotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-muted)]">GSA lodging cap</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">
                        {formatUsd(result.stipendCompare.gsaLodgingCap)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs font-medium">
                    <StipendCapLabel
                      status={result.stipendCompare.housingStatus}
                      overAmount={result.stipendCompare.housingOverAmount}
                    />
                  </p>
                </div>

                <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-4">
                  <h4 className="text-sm font-semibold text-[var(--color-ink)]">Meals stipend vs GSA M&amp;IE</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-muted)]">Agency meals (est.)</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">
                        {formatUsd(result.stipendCompare.agencyMealsTotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-ink-muted)]">GSA M&amp;IE cap</dt>
                      <dd className="font-semibold text-[var(--color-ink)]">
                        {formatUsd(result.stipendCompare.gsaMieCap)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs font-medium">
                    <StipendCapLabel
                      status={result.stipendCompare.mealsStatus}
                      overAmount={result.stipendCompare.mealsOverAmount}
                    />
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-3 border-t border-[var(--color-border)] pt-4 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-ink-muted)]">Agency total (est.)</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">
                    {formatUsd(result.stipendCompare.agencyTotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-ink-muted)]">GSA benchmark total</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">{formatUsd(result.gsaTotal)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-[var(--color-ink-muted)]">
                Compare each stipend to its own federal cap—housing to lodging, meals to M&amp;IE. Amounts over a cap
                may be taxable when other rules are met.{" "}
                <a href="/guides/nursing/stipends-vs-gsa/" className="font-medium text-[var(--color-accent)] hover:underline">
                  Stipends vs GSA guide
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
                        {d.isTravelDay && result.dayCount > 1 ? (
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

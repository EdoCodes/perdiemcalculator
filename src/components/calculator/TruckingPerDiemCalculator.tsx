import { useCallback, useState } from "react";
import { US_STATES } from "../../data/usStates";
import { calculateTruckerPerDiem, type TruckerCalcResult } from "../../lib/trucking/calculate";
import { formatUsd } from "../../lib/format";
import { fiscalYearForDate, parseIsoDate } from "../../lib/perdiem/fiscalYear";
import {
  fetchLocalitiesForState,
  resolveLocalityByZip
} from "../../lib/rates/queries";
import { isSupabaseConfigured } from "../../lib/supabaseRest";
import { STORAGE_KEY_PROFESSION } from "../../data/professions";
import { calcInput, calcPill, calcPillActive } from "../../lib/calcUi";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function TruckingPerDiemCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [oconusDays, setOconusDays] = useState("0");
  const [dotHos, setDotHos] = useState(true);
  const [result, setResult] = useState<TruckerCalcResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [compareOpen, setCompareOpen] = useState(false);
  const [zip, setZip] = useState("");
  const [state, setState] = useState("TX");
  const [gsaMie, setGsaMie] = useState<number | null>(null);
  const [gsaLabel, setGsaLabel] = useState("");
  const [gsaLoading, setGsaLoading] = useState(false);
  const [gsaError, setGsaError] = useState<string | null>(null);

  const supabaseReady = isSupabaseConfigured();

  const run = useCallback(() => {
    setError(null);
    setResult(null);
    const computed = calculateTruckerPerDiem({
      tripStart: start,
      tripEnd: end,
      oconusDays: parseInt(oconusDays, 10) || 0,
      dotHoursOfService: dotHos
    });
    if ("error" in computed) {
      setError(computed.error);
      return;
    }
    setResult(computed);
    try {
      localStorage.setItem(STORAGE_KEY_PROFESSION, "trucking");
    } catch {
      /* ignore */
    }
  }, [start, end, oconusDays, dotHos]);

  const lookupGsa = useCallback(async () => {
    setGsaError(null);
    setGsaMie(null);
    setGsaLabel("");
    if (!supabaseReady) {
      setGsaError("GSA compare needs Supabase rates on this site.");
      return;
    }
    const z = zip.replace(/\D/g, "").slice(0, 5);
    if (z.length !== 5) {
      setGsaError("Enter a 5-digit ZIP.");
      return;
    }
    const fy = start ? fiscalYearForDate(parseIsoDate(start)) : fiscalYearForDate(new Date());
    setGsaLoading(true);
    try {
      const resolved = await resolveLocalityByZip(z, fy);
      if (!resolved) {
        const list = await fetchLocalitiesForState(state, fy);
        const standard = list.find((l) => l.isStandard);
        if (standard) {
          setGsaMie(standard.mieTotal);
          setGsaLabel(`${standard.city}, ${standard.state} (standard rate)`);
        } else {
          setGsaError("No GSA locality found for that ZIP.");
        }
        return;
      }
      setGsaMie(resolved.mieTotal);
      setGsaLabel(`${resolved.city}, ${resolved.state}`);
    } catch (e) {
      setGsaError(e instanceof Error ? e.message : "GSA lookup failed");
    } finally {
      setGsaLoading(false);
    }
  }, [zip, state, start, supabaseReady]);

  const tripDayCount =
    start && end
      ? (() => {
          const r = calculateTruckerPerDiem({
            tripStart: start,
            tripEnd: end,
            oconusDays: 0,
            dotHoursOfService: dotHos
          });
          return "error" in r ? 0 : r.tripDays;
        })()
      : 0;

  return (
    <div className="space-y-8">
      <Card padding="lg" className="border-[var(--color-border-strong)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">IRS transportation</Badge>
          <Badge variant="muted">Rev. Proc. 2019-48</Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Estimates <strong className="text-[var(--color-ink)]">M&amp;IE only</strong> using IRS special
          transportation industry rates—not GSA federal employee per diem. You must be away from your tax
          home and meet substantiation rules.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Trip start</span>
            <input
              type="date"
              className={calcInput}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Trip end</span>
            <input
              type="date"
              className={calcInput}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>

        {tripDayCount > 0 && (
          <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
            {tripDayCount} calendar day{tripDayCount === 1 ? "" : "s"} in range
          </p>
        )}

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Days outside CONUS (Canada, Mexico, etc.)
          </span>
          <span className="mt-0.5 block text-xs text-[var(--color-ink-muted)]">
            Remaining days use the CONUS transportation rate. Assigned from the end of your date range.
          </span>
          <input
            type="number"
            min={0}
            max={tripDayCount || undefined}
            className={calcInput}
            value={oconusDays}
            onChange={(e) => setOconusDays(e.target.value)}
          />
        </label>

        <fieldset className="mt-6">
          <legend className="calc-rubric">Driver type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDotHos(true)}
              className={dotHos ? calcPillActive : calcPill}
            >
              DOT hours-of-service (80% meals)
            </button>
            <button
              type="button"
              onClick={() => setDotHos(false)}
              className={!dotHos ? calcPillActive : calcPill}
            >
              Other / 50% meals
            </button>
          </div>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]"
          >
            {error}
          </p>
        )}

        <Button type="button" variant="action" className="mt-6" onClick={run}>
          Calculate per diem
        </Button>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="calc-stat-card rounded-lg px-5 py-4 text-center">
              <p className="calc-stat-label">Gross M&amp;IE</p>
              <p className="calc-stat-value mt-2 text-2xl">{formatUsd(result.grossTotal)}</p>
            </div>
            <div className="calc-stat-card rounded-lg px-5 py-4 text-center">
              <p className="calc-stat-label">
                Est. deduction ({Math.round(result.mealDeductibleFraction * 100)}%)
              </p>
              <p className="calc-stat-value mt-2 text-2xl text-[var(--color-accent)]">
                {formatUsd(result.estimatedTaxDeduction)}
              </p>
            </div>
            <div className="calc-stat-card rounded-lg px-5 py-4 text-center">
              <p className="calc-stat-label">CONUS / OCONUS days</p>
              <p className="calc-stat-value mt-2 text-2xl">
                {result.conusDays} / {result.oconusDays}
              </p>
            </div>
          </div>

          <Card padding="lg" className="border-[var(--color-border-strong)]">
            <h2 className="calc-section-title">Rate breakdown</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Source:{" "}
              <a
                href={result.primaryRatePeriod.sourceUrl}
                className="font-semibold text-[var(--color-accent)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {result.primaryRatePeriod.sourceLabel}
              </a>
              {result.ratePeriods.length > 1 && " (trip crosses Oct 1 rate change)"}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="calc-breakdown-table w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 font-semibold">Period</th>
                    <th className="px-3 py-2 font-semibold">CONUS days</th>
                    <th className="px-3 py-2 font-semibold">OCONUS days</th>
                    <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ratePeriods.map((row) => (
                    <tr key={row.period.effectiveFrom}>
                      <td className="px-3 py-2">
                        <span className="font-medium">{row.period.label}</span>
                        <span className="mt-0.5 block text-xs text-[var(--color-ink-muted)]">
                          ${row.period.conusMie} CONUS · ${row.period.oconusMie} OCONUS / day
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{row.conusDays}</td>
                      <td className="px-3 py-2 tabular-nums">{row.oconusDays}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        {formatUsd(row.grossSubtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Card padding="lg" className="border-[var(--color-border-strong)]">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left text-sm font-semibold text-[var(--color-ink)]"
          onClick={() => setCompareOpen((o) => !o)}
          aria-expanded={compareOpen}
        >
          Compare to GSA federal M&amp;IE (optional)
          <span className="text-[var(--color-ink-muted)]">{compareOpen ? "▾" : "▸"}</span>
        </button>
        {compareOpen && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <p className="text-sm text-[var(--color-ink-muted)]">
              GSA rates are for federal travelers—not the default for OTR drivers—but useful to see how
              a layover city compares to the IRS transportation rate.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block sm:col-span-1">
                <span className="text-sm font-semibold text-[var(--color-ink)]">State</span>
                <select className={calcInput} value={state} onChange={(e) => setState(e.target.value)}>
                  {US_STATES.map((s) => (
                    <option key={s.abbr} value={s.abbr}>
                      {s.abbr}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-[var(--color-ink)]">ZIP (optional city)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={calcInput}
                  placeholder="75201"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </label>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={() => void lookupGsa()}
              disabled={gsaLoading}
            >
              {gsaLoading ? "Looking up…" : "Look up GSA M&IE"}
            </Button>
            {gsaError && <p className="mt-2 text-sm text-[var(--color-error-text)]">{gsaError}</p>}
            {gsaMie != null && (
              <p className="mt-3 text-sm">
                <strong className="text-[var(--color-ink)]">{gsaLabel}:</strong> GSA M&amp;IE{" "}
                <span className="font-semibold text-[var(--color-accent)]">{formatUsd(gsaMie)}</span>
                / day vs IRS transportation CONUS{" "}
                <span className="font-semibold">
                  {formatUsd(result?.primaryRatePeriod.conusMie ?? 80)}
                </span>
                / day
              </p>
            )}
          </div>
        )}
      </Card>

      <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
        Planning aid only—not tax or legal advice. Verify eligibility (tax home, overnight travel,
        transportation worker status) with a qualified preparer. See our{" "}
        <a href="/guides/trucking/" className="font-semibold text-[var(--color-accent)] hover:underline">
          trucker guides
        </a>{" "}
        and <a href="/methodology/" className="hover:underline">methodology</a>.
      </p>
    </div>
  );
}

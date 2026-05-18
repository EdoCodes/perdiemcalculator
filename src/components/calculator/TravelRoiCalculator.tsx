import { useCallback, useMemo, useState } from "react";
import {
  calculateTravelRoi,
  TRAVEL_ROI_DEFAULTS,
  type TravelRoiResult
} from "../../lib/roi/calculateTravelRoi";
import { formatUsd } from "../../lib/format";
import { calcInput } from "../../lib/calcUi";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

function parseMoney(raw: string): number {
  const n = parseFloat(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function MoneyField({
  id,
  label,
  hint,
  value,
  onChange
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-[var(--color-ink)]">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-[var(--color-ink-muted)]">{hint}</span> : null}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        className={calcInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  min = 0,
  step = 1
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-[var(--color-ink)]">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-[var(--color-ink-muted)]">{hint}</span> : null}
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        className={calcInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function PercentSlider({
  id,
  label,
  value,
  onChange
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-[var(--color-ink)]">
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-[var(--color-accent)]">{value}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-accent)]"
      />
    </div>
  );
}

function ResultStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="calc-stat-card rounded-lg px-5 py-4 text-center">
      <p className="calc-stat-label">{label}</p>
      <p className="calc-stat-value mt-2 text-2xl sm:text-3xl">{value}</p>
      {sub ? <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{sub}</p> : null}
    </div>
  );
}

export function TravelRoiCalculator() {
  const [annualTravelSpend, setAnnualTravelSpend] = useState("500000");
  const [annualExpenseSpend, setAnnualExpenseSpend] = useState("200000");
  const [activeTravelers, setActiveTravelers] = useState("50");
  const [domesticPercent, setDomesticPercent] = useState(80);
  const [internationalPercent, setInternationalPercent] = useState(20);
  const [tripsPerEmployee, setTripsPerEmployee] = useState("4");
  const [softwareCost, setSoftwareCost] = useState("0");
  const [result, setResult] = useState<TravelRoiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const syncDomestic = (v: number) => {
    const d = Math.min(100, Math.max(0, v));
    setDomesticPercent(d);
    setInternationalPercent(100 - d);
  };

  const syncInternational = (v: number) => {
    const i = Math.min(100, Math.max(0, v));
    setInternationalPercent(i);
    setDomesticPercent(100 - i);
  };

  const run = useCallback(() => {
    setError(null);
    const computed = calculateTravelRoi({
      annualTravelSpend: parseMoney(annualTravelSpend),
      annualExpenseSpend: parseMoney(annualExpenseSpend),
      activeTravelers: parseInt(activeTravelers, 10) || 0,
      domesticPercent,
      internationalPercent,
      tripsPerEmployeeYear: parseFloat(tripsPerEmployee) || 0,
      softwareCostAnnual: parseMoney(softwareCost)
    });
    if ("error" in computed) {
      setError(computed.error);
      setResult(null);
      setShowReport(false);
      return;
    }
    setResult(computed);
    setShowReport(true);
  }, [
    annualTravelSpend,
    annualExpenseSpend,
    activeTravelers,
    domesticPercent,
    internationalPercent,
    tripsPerEmployee,
    softwareCost
  ]);

  const reset = useCallback(() => {
    setAnnualTravelSpend(String(TRAVEL_ROI_DEFAULTS.annualTravelSpend));
    setAnnualExpenseSpend(String(TRAVEL_ROI_DEFAULTS.annualExpenseSpend));
    setActiveTravelers(String(TRAVEL_ROI_DEFAULTS.activeTravelers));
    setDomesticPercent(TRAVEL_ROI_DEFAULTS.domesticPercent);
    setInternationalPercent(TRAVEL_ROI_DEFAULTS.internationalPercent);
    setTripsPerEmployee(String(TRAVEL_ROI_DEFAULTS.tripsPerEmployeeYear));
    setSoftwareCost("0");
    setResult(null);
    setError(null);
    setShowReport(false);
  }, []);

  const roiDisplay = useMemo(() => {
    if (!result) return "—";
    if (result.roiPercent == null) return "N/A";
    return `${result.roiPercent.toLocaleString()}%`;
  }, [result]);

  const paybackDisplay = useMemo(() => {
    if (!result) return "—";
    if (result.paybackMonths == null) return "Add software cost";
    return `${result.paybackMonths} mo`;
  }, [result]);

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <Card padding="lg" className="border-[var(--color-border-strong)]">
          <h2 className="calc-section-title">Program inputs</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Model your travel program like an enterprise ROI calculator—then see estimated per diem
            exposure and savings from accurate rates and tighter T&amp;E controls.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <MoneyField
              id="annual-travel"
              label="Annual travel spend"
              hint="Flights, hotels, rail—booked travel"
              value={annualTravelSpend}
              onChange={setAnnualTravelSpend}
            />
            <MoneyField
              id="annual-expense"
              label="Annual expense spend"
              hint="Meals, mileage, other T&E outside central travel"
              value={annualExpenseSpend}
              onChange={setAnnualExpenseSpend}
            />
            <NumberField
              id="travelers"
              label="Average active travellers"
              value={activeTravelers}
              onChange={setActiveTravelers}
              min={1}
            />
            <NumberField
              id="trips-per"
              label="Avg flight trips per employee (per yr)"
              value={tripsPerEmployee}
              onChange={setTripsPerEmployee}
              min={0.5}
              step={0.5}
            />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <PercentSlider
              id="domestic-pct"
              label="Domestic %"
              value={domesticPercent}
              onChange={syncDomestic}
            />
            <PercentSlider
              id="intl-pct"
              label="International %"
              value={internationalPercent}
              onChange={syncInternational}
            />
          </div>

          <details className="mt-6 group">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
              Advanced assumptions
            </summary>
            <div className="mt-4">
              <MoneyField
                id="software-cost"
                label="Annual T&E / per diem software cost (optional)"
                hint="Used for ROI % and payback months"
                value={softwareCost}
                onChange={setSoftwareCost}
              />
            </div>
          </details>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="action" onClick={run}>
              Get result
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              Reset
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
            {result ? "The results are below" : "Enter your program data"}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <ResultStat label="ROI" value={roiDisplay} sub="vs. software cost (if entered)" />
            <ResultStat label="Payback" value={paybackDisplay} sub="months to break even" />
            <ResultStat
              label="Saving / month"
              value={result ? formatUsd(result.monthlySavings) : "—"}
              sub="estimated program benefit"
            />
          </div>

          {result ? (
            <Card padding="lg" className="border-[var(--color-border-strong)]">
              <h3 className="font-display text-xl">Portfolio snapshot</h3>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--color-ink-muted)]">Trips per year</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-ink)]">
                    {result.totalTrips.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-ink-muted)]">Est. travel days</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-ink)]">
                    {result.estimatedTravelDays.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-ink-muted)]">Est. annual per diem</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-accent)]">
                    {formatUsd(result.estimatedAnnualPerDiem)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-ink-muted)]">Blended daily per diem</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-ink)]">
                    {formatUsd(result.blendedDailyPerDiem)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-ink-muted)]">Avg spend per trip</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-ink)]">
                    {formatUsd(result.avgTripSpend)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-ink-muted)]">Total annual savings</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-ink)]">
                    {formatUsd(result.totalAnnualSavings)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                Use our{" "}
                <a href="/calculator/gsa/" className="font-semibold text-[var(--color-accent)] hover:underline">
                  federal GSA calculator
                </a>{" "}
                for trip-level accuracy instead of portfolio averages.
              </p>
            </Card>
          ) : (
            <Card padding="lg" className="border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]">
              <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Results include estimated per diem exposure plus savings from rate accuracy, policy
                compliance, and admin time—similar to corporate ROI tools like{" "}
                <a
                  href="https://tripgain.com/roi#tripgaincalculator"
                  className="font-semibold text-[var(--color-accent)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TripGain&rsquo;s ROI calculator
                </a>
                , adapted for per diem planning.
              </p>
            </Card>
          )}
        </div>
      </div>

      {result && showReport ? (
        <Card padding="lg" className="border-[var(--color-border-strong)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="calc-section-title">Detailed report</h2>
            <Button type="button" variant="ghost" onClick={() => setShowReport(false)}>
              Hide report
            </Button>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="calc-breakdown-table w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 font-semibold text-[var(--color-ink)]">Category</th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-ink)]">Assumption</th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-ink)]">
                    Annual savings
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lineItems.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{row.label}</td>
                    <td className="max-w-md px-4 py-3 text-[var(--color-ink-muted)]">
                      {row.description}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--color-ink)]">
                      {formatUsd(row.annualAmount)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-3 font-bold text-[var(--color-ink)]" colSpan={2}>
                    Total estimated benefit
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--color-accent)]">
                    {formatUsd(result.totalAnnualSavings)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-[var(--color-ink-muted)]">
            Planning estimates only—not tax, payroll, or procurement advice. Percentages are
            illustrative ranges for finance teams benchmarking a travel program; adjust assumptions
            in your own models before budgeting.
          </p>
        </Card>
      ) : result ? (
        <div className="text-center">
          <Button type="button" variant="secondary" onClick={() => setShowReport(true)}>
            Detailed report
          </Button>
        </div>
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Calculate instant ROI",
            body: "See annual and monthly savings from your travel volume in seconds."
          },
          {
            title: "Estimate per diem exposure",
            body: "Blend domestic and international days using portfolio-level daily rates."
          },
          {
            title: "Justify program investment",
            body: "Enter software cost to show ROI % and payback months for finance review."
          },
          {
            title: "Compare travel mix",
            body: "Slide domestic vs international share to match your company footprint."
          },
          {
            title: "Reduce admin burden",
            body: "Includes time saved when travelers and AP use consistent calculators."
          },
          {
            title: "Forecast before you buy",
            body: "Use the detailed report line items to build an internal business case."
          }
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] p-5"
          >
            <h3 className="font-semibold text-[var(--color-ink)]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}


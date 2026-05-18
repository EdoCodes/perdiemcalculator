import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { US_STATES } from "../../data/usStates";
import { calculateTrip } from "../../lib/perdiem/calculate";
import { eachTripDay, fiscalYearForDate } from "../../lib/perdiem/fiscalYear";
import type { CalculatorOptions, TripResult } from "../../lib/perdiem/types";
import { checkSupabaseHealth, type SupabaseHealth } from "../../lib/supabaseHealth";
import { isSupabaseConfigured } from "../../lib/supabaseRest";
import {
  fetchLocalitiesForState,
  fetchLocalityRatesForTripByDid,
  resolveLocalityByZip,
  type LocalityListItem
} from "../../lib/rates/queries";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { DayBreakdownTable } from "./DayBreakdownTable";
import { TripSummary } from "./TripSummary";

import { calcInput } from "../../lib/calcUi";

export function PerDiemCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [state, setState] = useState("CA");
  const [localityId, setLocalityId] = useState("");
  const [did, setDid] = useState("");
  const [localityLabel, setLocalityLabel] = useState("");
  const [zip, setZip] = useState("");
  const [locationTab, setLocationTab] = useState<"picker" | "zip">("picker");

  const [localities, setLocalities] = useState<LocalityListItem[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TripResult | null>(null);

  const [travelDayPolicy, setTravelDayPolicy] =
    useState<CalculatorOptions["travelDayPolicy"]>("75-percent-mie");
  const [mealDeductionMode, setMealDeductionMode] =
    useState<CalculatorOptions["mealDeductionMode"]>("pro-rate-incidentals-on-travel-days");
  const [showLodging150, setShowLodging150] = useState(false);
  const [mealsAllDays, setMealsAllDays] = useState({
    breakfast: false,
    lunch: false,
    dinner: false
  });

  const pickerFy = useMemo(() => {
    if (start) return fiscalYearForDate(new Date(start + "T12:00:00"));
    return fiscalYearForDate(new Date());
  }, [start]);

  const envConfigured = isSupabaseConfigured();
  const [dbBanner, setDbBanner] = useState<SupabaseHealth | null>(null);

  const supabaseReady = envConfigured;
  const fetchContextRef = useRef({ state, pickerFy });
  fetchContextRef.current = { state, pickerFy };

  useEffect(() => {
    if (!envConfigured) return;
    let cancelled = false;
    checkSupabaseHealth()
      .then((health) => {
        if (!cancelled && health.status !== "ok") setDbBanner(health);
      })
      .catch((e) => {
        if (!cancelled) {
          setDbBanner({
            status: "error",
            message: e instanceof Error ? e.message : "Could not verify database",
            hint: "Try incognito or disable ad blockers. The form below may still work."
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [envConfigured]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const st = params.get("state");
    if (st) setState(st.toUpperCase());
  }, []);

  useEffect(() => {
    if (!supabaseReady) return;
    let cancelled = false;
    const reqState = state;
    const reqFy = pickerFy;
    setLoadingLocalities(true);
    fetchLocalitiesForState(reqState, reqFy)
      .then((rows) => {
        if (cancelled) return;
        const latest = fetchContextRef.current;
        if (latest.state !== reqState || latest.pickerFy !== reqFy) return;
        setLocalities(rows);
        setLocalityId((currentId) => {
          const stillValid = rows.some((r) => r.id === currentId);
          if (rows.length && (!currentId || !stillValid)) {
            return (rows.find((r) => r.isStandard) ?? rows[0]).id;
          }
          return currentId;
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load localities");
      })
      .finally(() => {
        if (!cancelled) setLoadingLocalities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state, pickerFy, supabaseReady]);

  useEffect(() => {
    if (!localityId) {
      setDid("");
      setLocalityLabel("");
      return;
    }
    const loc = localities.find((l) => l.id === localityId);
    if (!loc) return;
    setDid(loc.did);
    setLocalityLabel(formatLocalityLabel(loc));
  }, [localityId, localities]);

  const onLocalityChange = (id: string) => {
    setLocalityId(id);
  };

  const runCalculation = useCallback(async () => {
    setError(null);
    setResult(null);
    if (!start || !end) {
      setError("Select departure and return dates.");
      return;
    }
    if (!did) {
      setError("Select a destination locality or look up a ZIP code.");
      return;
    }
    if (!supabaseReady) {
      setError("Connect Supabase to load official GSA rates.");
      return;
    }

    const days = eachTripDay(start, end);
    const fiscalYears = [...new Set(days.map((d) => fiscalYearForDate(d)))];

    setCalculating(true);
    try {
      const rates = await fetchLocalityRatesForTripByDid(did, state, fiscalYears);
      if (rates.size === 0) {
        setError(
          `No rates found for ${state} (DID ${did}) in fiscal year(s) ${fiscalYears.join(", ")}. Run the GSA sync.`
        );
        return;
      }

      const mealsMap = new Map<string, typeof mealsAllDays>();
      for (const d of days) {
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        mealsMap.set(iso, { ...mealsAllDays });
      }

      const options: CalculatorOptions = {
        travelDayPolicy,
        mealDeductionMode,
        showLodging150
      };

      const trip = calculateTrip(start, end, rates, mealsMap, options);
      if ("error" in trip) {
        setError(trip.error);
        return;
      }
      setResult(trip);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
    } finally {
      setCalculating(false);
    }
  }, [
    start,
    end,
    did,
    state,
    supabaseReady,
    travelDayPolicy,
    mealDeductionMode,
    showLodging150,
    mealsAllDays
  ]);

  const lookupZip = async () => {
    setError(null);
    if (!zip.trim()) return;
    if (!supabaseReady) {
      setError("Connect Supabase to look up ZIP codes.");
      return;
    }
    setCalculating(true);
    try {
      const loc = await resolveLocalityByZip(zip, pickerFy);
      if (!loc) {
        setError(`ZIP ${zip} not found for FY ${pickerFy}.`);
        return;
      }
      setState(loc.state);
      setLocalityId(loc.id);
      setDid(loc.did);
      setLocalityLabel(formatLocalityLabel(loc));
      setLocationTab("picker");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ZIP lookup failed");
    } finally {
      setCalculating(false);
    }
  };

  if (!envConfigured) {
    return <ConnectionHelp health={{ status: "missing_env" }} />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="space-y-6">
        {dbBanner ? (
          <ConnectionHelp
            health={dbBanner}
            onRetry={() => {
              setDbBanner(null);
              checkSupabaseHealth()
                .then((h) => {
                  if (h.status !== "ok") setDbBanner(h);
                })
                .catch(() => undefined);
            }}
          />
        ) : null}
        <Card>
          <StepHeader n={1} title="Trip dates" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Departure
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={calcInput}
              />
            </label>
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Return
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={calcInput} />
            </label>
          </div>
          {start ? (
            <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
              Fiscal year for start date: <Badge variant="primary">FY {pickerFy}</Badge>
            </p>
          ) : null}
        </Card>

        <Card>
          <StepHeader n={2} title="Destination" />
          <div className="mt-4 flex flex-wrap gap-2">
            {(["picker", "zip"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLocationTab(tab)}
                className={`profession-chip flex-1 sm:flex-none ${
                  locationTab === tab ? "profession-chip--active" : ""
                }`}
              >
                {tab === "picker" ? "Locality" : "ZIP code"}
              </button>
            ))}
          </div>

          {locationTab === "picker" ? (
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-[var(--color-ink)]">
                State
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setLocalityId("");
                  }}
                  className={calcInput}
                >
                  {US_STATES.map((s) => (
                    <option key={s.abbr} value={s.abbr}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-[var(--color-ink)]">
                Locality
                <select
                  value={localityId}
                  onChange={(e) => onLocalityChange(e.target.value)}
                  disabled={loadingLocalities}
                  className={calcInput}
                >
                  {loadingLocalities ? (
                    <option>Loading…</option>
                  ) : localities.length === 0 ? (
                    <option>No localities — run GSA sync</option>
                  ) : (
                    localities.map((l) => (
                      <option key={l.id} value={l.id}>
                        {formatLocalityLabel(l)}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="min-w-[140px] flex-1 text-sm font-medium text-[var(--color-ink)]">
                ZIP
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="90210"
                  className={calcInput}
                />
              </label>
              <div className="flex items-end">
                <Button variant="secondary" onClick={lookupZip} disabled={calculating}>
                  Look up
                </Button>
              </div>
            </div>
          )}

          {localityLabel ? (
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              Selected: <span className="font-medium text-[var(--color-ink)]">{localityLabel}</span>
            </p>
          ) : null}
        </Card>

        <Card>
          <StepHeader n={3} title="Options" />
          <details className="mt-4 group">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--color-primary)]">
              Travel day & meal rules
            </summary>
            <div className="mt-4 space-y-4 border-t border-[var(--color-border)] pt-4">
              <label className="block text-sm font-medium text-[var(--color-ink)]">
                First / last day M&IE
                <select
                  value={travelDayPolicy}
                  onChange={(e) =>
                    setTravelDayPolicy(e.target.value as CalculatorOptions["travelDayPolicy"])
                  }
                  className={calcInput}
                >
                  <option value="75-percent-mie">75% of M&IE (FTR default)</option>
                  <option value="pro-rate-incidentals">Pro-rate incidentals only</option>
                  <option value="full-mie">Full M&IE</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  checked={showLodging150}
                  onChange={(e) => setShowLodging150(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
                />
                Show 150% lodging column (with approval)
              </label>
              <fieldset>
                <legend className="text-sm font-medium text-[var(--color-ink)]">
                  Government-provided meals (all days)
                </legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                    <label key={meal} className="flex items-center gap-2 text-sm capitalize text-[var(--color-ink-muted)]">
                      <input
                        type="checkbox"
                        checked={mealsAllDays[meal]}
                        onChange={(e) =>
                          setMealsAllDays((m) => ({ ...m, [meal]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded"
                      />
                      {meal}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </details>
        </Card>

        <Button
          variant="action"
          className="w-full sm:w-auto"
          onClick={runCalculation}
          disabled={calculating}
        >
          {calculating ? "Calculating…" : "Calculate per diem"}
        </Button>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]"
          >
            {error}
          </div>
        ) : null}

        {result ? (
          <Card padding="none" className="overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <h3 className="font-semibold text-[var(--color-ink)]">Day-by-day breakdown</h3>
            </div>
            <DayBreakdownTable days={result.days} showLodging150={showLodging150} />
          </Card>
        ) : null}
      </div>

      <aside className="lg:sticky lg:top-24">
        {result ? (
          <TripSummary result={result} showLodging150={showLodging150} />
        ) : (
          <Card className="text-center">
            <p className="text-sm font-medium text-[var(--color-ink-muted)]">
              Your trip total will appear here after you calculate.
            </p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-border-strong)]">—</p>
          </Card>
        )}
      </aside>
    </div>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-muted)] text-sm font-bold text-[var(--color-primary)]">
        {n}
      </span>
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h2>
    </div>
  );
}

function formatLocalityLabel(l: LocalityListItem): string {
  if (l.isStandard) return `${l.state} — Standard CONUS rate`;
  const county = l.county ? ` (${l.county})` : "";
  return `${l.city}${county}`;
}

function ConnectionHelp({
  health,
  onRetry
}: {
  health: Exclude<SupabaseHealth, { status: "ok" }>;
  onRetry?: () => void;
}) {
  if (health.status === "missing_env") {
    return (
      <Card className="border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary-muted)]/30">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Supabase not configured in this build</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Set these in <strong>Netlify → Environment variables</strong>, then{" "}
          <strong>trigger a new deploy</strong> (Astro embeds them at build time):
        </p>
        <ul className="mt-3 list-inside list-disc text-sm text-[var(--color-ink-muted)]">
          <li>
            <code className="text-xs">PUBLIC_SUPABASE_URL</code> — Project URL (ends with{" "}
            <code className="text-xs">.supabase.co</code>)
          </li>
          <li>
            <code className="text-xs">PUBLIC_SUPABASE_ANON_KEY</code> — anon public key (not service_role)
          </li>
        </ul>
      </Card>
    );
  }

  if (health.status === "empty") {
    return (
      <Card className="border-dashed border-[var(--color-accent)]/50 bg-[var(--color-accent-muted)]/20">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Database connected — no rates yet</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Tables exist but <code className="text-xs">localities</code> is empty. On your computer, add{" "}
          <code className="text-xs">GSA_API_KEY</code> and <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          to <code className="text-xs">.env</code>, then run:{" "}
          <code className="text-xs">npm run sync:gsa</code>
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-[var(--color-error-border)] bg-[var(--color-error-bg)]">
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">Database connection failed</h2>
      <p className="mt-2 text-sm font-medium text-[var(--color-error-text)]">
        {health.message || "Unknown error"}
      </p>
      {health.hint ? (
        <p className="mt-1 text-sm text-[var(--color-error-text)]/80">{health.hint}</p>
      ) : null}
      <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
        Your Netlify keys are probably fine if <code className="text-xs">npm run test:supabase</code> works on
        your PC. Try <strong>Ctrl+Shift+R</strong>, a private window, or turn off ad blockers for this site.
      </p>
      {onRetry && health.status === "error" ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </Card>
  );
}

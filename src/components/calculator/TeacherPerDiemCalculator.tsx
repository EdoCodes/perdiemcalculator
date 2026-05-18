import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { US_STATES } from "../../data/usStates";
import { getStateEducationRule, STATES_WITH_CURATED_RULES } from "../../data/stateEducationRules";
import {
  calculateTeacherTrip,
  defaultLodgingNights,
  type TeacherCustomTripResult,
  type TeacherTripPurpose
} from "../../lib/teacher/calculate";
import { calculateTeacherGsaTrip, type TeacherGsaTripResult } from "../../lib/teacher/calculateGsa";
import { fetchStateEducationRule } from "../../lib/teacher/queries";
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
import type { SchoolDistrict } from "../../lib/lea/types";
import { DistrictPicker } from "../teacher/DistrictPicker";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

import { calcInput, calcPill, calcPillActive } from "../../lib/calcUi";

type RateMode = "gsa" | "custom";
type AnyResult = TeacherGsaTripResult | TeacherCustomTripResult;

const PRESETS: Record<string, { label: string; daily: number; lodging: number }> = {
  district: { label: "Typical district M&IE (~$50/day)", daily: 50, lodging: 120 },
  conference: { label: "Conference / training (~$59/day)", daily: 59, lodging: 150 },
  custom: { label: "Custom — enter your policy rates", daily: 0, lodging: 0 }
};

function formatLocalityLabel(l: LocalityListItem): string {
  if (l.isStandard) return `${l.state} — Standard rate`;
  const place = l.county ? `${l.city} (${l.county})` : l.city;
  return `${place}, ${l.state}`;
}

export function TeacherPerDiemCalculator() {
  const [rateMode, setRateMode] = useState<RateMode>("gsa");
  const [role, setRole] = useState<"k12" | "college" | "admin">("k12");
  const [purpose, setPurpose] = useState<TeacherTripPurpose>("conference");
  const [employerState, setEmployerState] = useState("TX");
  const [destState, setDestState] = useState("TX");
  const [zip, setZip] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [did, setDid] = useState("");
  const [localityLabel, setLocalityLabel] = useState("");
  const [localities, setLocalities] = useState<LocalityListItem[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [stateRule, setStateRule] = useState(() => getStateEducationRule("TX"));
  const [district, setDistrict] = useState<SchoolDistrict | null>(null);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [dailyRate, setDailyRate] = useState("50");
  const [lodgingRate, setLodgingRate] = useState("120");
  const [lodgingNights, setLodgingNights] = useState("");
  const [autoLodgingNights, setAutoLodgingNights] = useState(true);
  const [partialTravelDays, setPartialTravelDays] = useState(true);
  const [preset, setPreset] = useState("district");

  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnyResult | null>(null);

  const supabaseReady = isSupabaseConfigured();
  const pickerFy = useMemo(() => {
    if (start) return fiscalYearForDate(new Date(start + "T12:00:00"));
    return fiscalYearForDate(new Date());
  }, [start]);

  useEffect(() => {
    fetchStateEducationRule(employerState).then(setStateRule);
  }, [employerState]);

  useEffect(() => {
    setDistrict(null);
  }, [employerState]);

  useEffect(() => {
    if (!autoLodgingNights || !start || !end) return;
    setLodgingNights(String(defaultLodgingNights(start, end)));
  }, [start, end, autoLodgingNights]);

  useEffect(() => {
    if (rateMode !== "gsa" || !supabaseReady) return;
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
  }, [destState, pickerFy, supabaseReady, rateMode]);

  useEffect(() => {
    if (!localityId) return;
    const loc = localities.find((l) => l.id === localityId);
    if (loc) {
      setDid(loc.did);
      setLocalityLabel(formatLocalityLabel(loc));
    }
  }, [localityId, localities]);

  const applyPreset = (key: string) => {
    setPreset(key);
    if (key === "custom") return;
    const p = PRESETS[key];
    if (!p) return;
    setDailyRate(String(p.daily));
    setLodgingRate(String(p.lodging));
  };

  const purposeLabel = useMemo(() => {
    const map: Record<TeacherTripPurpose, string> = {
      conference: "Conference",
      "field-trip": "Field trip / chaperone",
      "professional-development": "Professional development",
      other: "Other school travel"
    };
    return map[purpose];
  }, [purpose]);

  const roleLabel = useMemo(() => {
    if (role === "k12") return "K–12 teacher";
    if (role === "college") return "College instructor";
    return "Administrator";
  }, [role]);

  const lookupZip = async () => {
    setError(null);
    if (!zip.trim() || !supabaseReady) return;
    setCalculating(true);
    try {
      const loc = await resolveLocalityByZip(zip, pickerFy);
      if (!loc) {
        setError(`ZIP ${zip} not found for FY ${pickerFy}.`);
        return;
      }
      setDestState(loc.state);
      setLocalityId(loc.id);
      setDid(loc.did);
      setLocalityLabel(formatLocalityLabel(loc));
    } catch (e) {
      setError(e instanceof Error ? e.message : "ZIP lookup failed");
    } finally {
      setCalculating(false);
    }
  };

  const run = useCallback(async () => {
    setError(null);
    setResult(null);
    if (!start || !end) {
      setError("Enter trip start and end dates.");
      return;
    }

    setCalculating(true);
    try {
      localStorage.setItem(STORAGE_KEY_PROFESSION, "education-teacher");

      if (rateMode === "gsa") {
        if (!supabaseReady) {
          setError("Connect Supabase to load GSA destination rates.");
          return;
        }
        if (!did) {
          setError("Select a destination or look up a ZIP code.");
          return;
        }
        const days = eachTripDay(start, end);
        const fiscalYears = [...new Set(days.map((d) => fiscalYearForDate(d)))];
        const rates = await fetchLocalityRatesForTripByDid(did, destState, fiscalYears);
        if (rates.size === 0) {
          setError(`No GSA rates for this destination in FY ${fiscalYears.join(", ")}.`);
          return;
        }
        const rule = await fetchStateEducationRule(employerState);
        const trip = calculateTeacherGsaTrip(
          start,
          end,
          rates,
          rule,
          localityLabel || `${destState} destination`
        );
        if ("error" in trip) {
          setError(trip.error);
          return;
        }
        setResult(trip);
        return;
      }

      const daily = parseFloat(dailyRate);
      const lodging = parseFloat(lodgingRate);
      const nights = autoLodgingNights
        ? defaultLodgingNights(start, end)
        : parseInt(lodgingNights, 10);
      if (Number.isNaN(daily) || Number.isNaN(lodging)) {
        setError("Enter valid numeric rates.");
        return;
      }
      if (!autoLodgingNights && (Number.isNaN(nights) || nights < 0)) {
        setError("Enter a valid number of lodging nights.");
        return;
      }

      const trip = calculateTeacherTrip(start, end, {
        dailyMealsRate: daily,
        lodgingPerNight: lodging,
        lodgingNights: nights,
        partialTravelDays
      });
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
    rateMode,
    supabaseReady,
    did,
    destState,
    employerState,
    localityLabel,
    dailyRate,
    lodgingRate,
    lodgingNights,
    autoLodgingNights,
    partialTravelDays
  ]);

  const curatedHint = STATES_WITH_CURATED_RULES.includes(employerState);
  const hasDetailedCaps =
    stateRule.mieCap != null || stateRule.lodgingCap != null || stateRule.dayTripMie != null;

  return (
    <div className="space-y-6">
      <Card padding="lg" className="border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <motionTeacherHeader roleLabel={roleLabel} purposeLabel={purposeLabel} rateMode={rateMode} />

        <div className="mt-6 flex flex-wrap gap-2">
          <ModeButton active={rateMode === "gsa"} onClick={() => setRateMode("gsa")}>
            GSA + state rules
          </ModeButton>
          <ModeButton active={rateMode === "custom"} onClick={() => setRateMode("custom")}>
            Custom rates
          </ModeButton>
        </div>

        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          {rateMode === "gsa"
            ? "Recommended: federal GSA rates for your trip destination, with state caps where we have official education guidance (e.g. Texas TEA)."
            : "Enter rates from your district handbook when they differ from GSA."}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[var(--color-ink)]">Your role</legend>
            <RoleButtons role={role} setRole={setRole} />
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[var(--color-ink)]">Trip purpose</legend>
            <PurposeSelect purpose={purpose} setPurpose={setPurpose} />
          </fieldset>
        </div>

        {rateMode === "gsa" ? (
          <GsaFields
            employerState={employerState}
            setEmployerState={setEmployerState}
            district={district}
            setDistrict={setDistrict}
            destState={destState}
            setDestState={setDestState}
            zip={zip}
            setZip={setZip}
            localityId={localityId}
            setLocalityId={setLocalityId}
            localities={localities}
            loadingLocalities={loadingLocalities}
            localityLabel={localityLabel}
            stateRule={stateRule}
            curatedHint={hasDetailedCaps}
            supabaseReady={supabaseReady}
            onLookupZip={lookupZip}
            start={start}
            setStart={setStart}
            end={end}
            setEnd={setEnd}
          />
        ) : (
          <CustomFields
            preset={preset}
            applyPreset={applyPreset}
            start={start}
            setStart={setStart}
            end={end}
            setEnd={setEnd}
            dailyRate={dailyRate}
            setDailyRate={setDailyRate}
            lodgingRate={lodgingRate}
            setLodgingRate={setLodgingRate}
            lodgingNights={lodgingNights}
            setLodgingNights={setLodgingNights}
            autoLodgingNights={autoLodgingNights}
            setAutoLodgingNights={setAutoLodgingNights}
            partialTravelDays={partialTravelDays}
            setPartialTravelDays={setPartialTravelDays}
          />
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]">
            {error}
          </p>
        )}

        <motionTeacherActions calculating={calculating} onRun={run} />
      </Card>

      {result && <TeacherResultPanel result={result} />}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? `${calcPill} calc-pill--active` : calcPill}
    >
      {children}
    </button>
  );
}

function motionTeacherHeader({
  roleLabel,
  purposeLabel,
  rateMode
}: {
  roleLabel: string;
  purposeLabel: string;
  rateMode: RateMode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="primary">{rateMode === "gsa" ? "GSA + state" : "Custom"}</Badge>
      <Badge variant="muted">{roleLabel}</Badge>
      <Badge variant="muted">{purposeLabel}</Badge>
    </div>
  );
}

function RoleButtons({
  role,
  setRole
}: {
  role: "k12" | "college" | "admin";
  setRole: (r: "k12" | "college" | "admin") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(
        [
          ["k12", "K–12"],
          ["college", "College"],
          ["admin", "Administrator"]
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setRole(id)}
          className={role === id ? calcPillActive : calcPill}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PurposeSelect({
  purpose,
  setPurpose
}: {
  purpose: TeacherTripPurpose;
  setPurpose: (p: TeacherTripPurpose) => void;
}) {
  return (
    <select
      className={calcInput}
      value={purpose}
      onChange={(e) => setPurpose(e.target.value as TeacherTripPurpose)}
    >
      <option value="conference">Conference or workshop</option>
      <option value="field-trip">Field trip / overnight chaperone</option>
      <option value="professional-development">Professional development</option>
      <option value="other">Other approved travel</option>
    </select>
  );
}

function GsaFields(props: {
  employerState: string;
  setEmployerState: (s: string) => void;
  district: SchoolDistrict | null;
  setDistrict: (d: SchoolDistrict | null) => void;
  destState: string;
  setDestState: (s: string) => void;
  zip: string;
  setZip: (z: string) => void;
  localityId: string;
  setLocalityId: (id: string) => void;
  localities: LocalityListItem[];
  loadingLocalities: boolean;
  localityLabel: string;
  stateRule: ReturnType<typeof getStateEducationRule>;
  curatedHint: boolean;
  supabaseReady: boolean;
  onLookupZip: () => void;
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
}) {
  return (
    <div className="mt-8 space-y-6">
      <DistrictPicker
        state={props.employerState}
        value={props.district}
        onChange={props.setDistrict}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          School / employer state
          <select
            className={calcInput}
            value={props.employerState}
            onChange={(e) => props.setEmployerState(e.target.value)}
          >
            {US_STATES.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Trip destination state
          <select
            className={calcInput}
            value={props.destState}
            onChange={(e) => props.setDestState(e.target.value)}
          >
            {US_STATES.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <StateRuleCard rule={props.stateRule} curated={props.curatedHint} district={props.district} />

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Destination ZIP (GSA lookup)
          <input
            className={calcInput}
            value={props.zip}
            onChange={(e) => props.setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="e.g. 73301"
            maxLength={5}
          />
        </label>
        <Button type="button" variant="secondary" onClick={props.onLookupZip} disabled={!props.supabaseReady}>
          Look up
        </Button>
      </div>

      <label className="block text-sm font-medium text-[var(--color-ink)]">
        GSA locality
        <select
          className={calcInput}
          value={props.localityId}
          onChange={(e) => props.setLocalityId(e.target.value)}
          disabled={props.loadingLocalities || !props.localities.length}
        >
          {props.loadingLocalities && <option>Loading…</option>}
          {!props.loadingLocalities &&
            props.localities.map((l) => (
              <option key={l.id} value={l.id}>
                {formatLocalityLabel(l)} — M&IE {formatUsd(l.mieTotal)}
              </option>
            ))}
        </select>
      </label>
      {props.localityLabel && (
        <p className="text-xs text-[var(--color-ink-muted)]">Selected: {props.localityLabel}</p>
      )}

      <TripDates start={props.start} setStart={props.setStart} end={props.end} setEnd={props.setEnd} />
    </div>
  );
}

function StateRuleCard({
  rule,
  curated,
  district
}: {
  rule: ReturnType<typeof getStateEducationRule>;
  curated: boolean;
  district: SchoolDistrict | null;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 px-4 py-3 text-sm">
      <p className="font-semibold text-[var(--color-ink)]">
        {rule.name} rules {curated ? "(published caps)" : ""}
      </p>
      {district && (
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          District: {district.name}
          {district.city ? ` · ${district.city}` : ""} (NCES {district.id})
        </p>
      )}
      {rule.notes && <p className="mt-1 text-[var(--color-ink-muted)]">{rule.notes}</p>}
      <ul className="mt-2 list-inside list-disc text-xs text-[var(--color-ink-muted)]">
        {rule.mieCap != null && <li>M&IE cap: {formatUsd(rule.mieCap)}/day</li>}
        {rule.lodgingCap != null && <li>Lodging cap: {formatUsd(rule.lodgingCap)}/night</li>}
        {rule.dayTripMie != null && <li>Same-day trip meals: {formatUsd(rule.dayTripMie)}</li>}
        {rule.partialTravelDays && (
          <li>First/last day: {Math.round(rule.travelDayFraction * 100)}% of daily M&IE</li>
        )}
      </ul>
      <a
        href={rule.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs font-medium text-[var(--color-primary)] hover:underline"
      >
        {rule.sourceLabel} →
      </a>
    </div>
  );
}

function CustomFields(props: {
  preset: string;
  applyPreset: (k: string) => void;
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
  dailyRate: string;
  setDailyRate: (v: string) => void;
  lodgingRate: string;
  setLodgingRate: (v: string) => void;
  lodgingNights: string;
  setLodgingNights: (v: string) => void;
  autoLodgingNights: boolean;
  setAutoLodgingNights: (v: boolean) => void;
  partialTravelDays: boolean;
  setPartialTravelDays: (v: boolean) => void;
}) {
  return (
    <div className="mt-8 space-y-6">
      <label className="block text-sm font-semibold text-[var(--color-ink)]">
        Rate preset
        <select
          className={calcInput}
          value={props.preset}
          onChange={(e) => props.applyPreset(e.target.value)}
        >
          {Object.entries(PRESETS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <TripDates start={props.start} setStart={props.setStart} end={props.end} setEnd={props.setEnd} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Meals & incidentals / day
          <input
            type="number"
            min="0"
            step="0.01"
            className={calcInput}
            value={props.dailyRate}
            onChange={(e) => props.setDailyRate(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Lodging / night
          <input
            type="number"
            min="0"
            step="0.01"
            className={calcInput}
            value={props.lodgingRate}
            onChange={(e) => props.setLodgingRate(e.target.value)}
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={props.partialTravelDays}
            onChange={(e) => props.setPartialTravelDays(e.target.checked)}
          />
          75% first & last day
        </label>
      </div>
      <LodgingNightsFields
        lodgingNights={props.lodgingNights}
        setLodgingNights={props.setLodgingNights}
        autoLodgingNights={props.autoLodgingNights}
        setAutoLodgingNights={props.setAutoLodgingNights}
      />
    </div>
  );
}

function TripDates({
  start,
  setStart,
  end,
  setEnd
}: {
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <label className="block text-sm font-medium text-[var(--color-ink)]">
        Trip start
        <input type="date" className={calcInput} value={start} onChange={(e) => setStart(e.target.value)} />
      </label>
      <label className="block text-sm font-medium text-[var(--color-ink)]">
        Trip end
        <input type="date" className={calcInput} value={end} onChange={(e) => setEnd(e.target.value)} />
      </label>
    </div>
  );
}

function LodgingNightsFields(props: {
  lodgingNights: string;
  setLodgingNights: (v: string) => void;
  autoLodgingNights: boolean;
  setAutoLodgingNights: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block flex-1 text-sm font-medium text-[var(--color-ink)]">
        Lodging nights
        <input
          type="number"
          min="0"
          className={calcInput}
          value={props.lodgingNights}
          onChange={(e) => props.setLodgingNights(e.target.value)}
          disabled={props.autoLodgingNights}
        />
      </label>
      <label className="flex items-center gap-2 pb-2.5 text-sm">
        <input
          type="checkbox"
          checked={props.autoLodgingNights}
          onChange={(e) => props.setAutoLodgingNights(e.target.checked)}
        />
        Auto (trip days − 1)
      </label>
    </div>
  );
}

function motionTeacherActions({
  calculating,
  onRun
}: {
  calculating: boolean;
  onRun: () => void;
}) {
  return (
    <div className="mt-6">
      <Button type="button" onClick={onRun} disabled={calculating}>
        {calculating ? "Calculating…" : "Calculate trip per diem"}
      </Button>
    </div>
  );
}

function TeacherResultPanel({ result }: { result: AnyResult }) {
  if (result.mode === "gsa") {
    return <GsaResult result={result} />;
  }
  return <CustomResult result={result} />;
}

function GsaResult({ result }: { result: TeacherGsaTripResult }) {
  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">Trip estimate (GSA + {result.stateRule.name})</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{result.destinationLabel}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{formatUsd(result.total)}</p>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        M&IE {formatUsd(result.mealsSubtotal)}
        {result.lodgingSubtotal > 0 && (
          <>
            {" "}
            · Lodging ({result.lodgingNights} night{result.lodgingNights === 1 ? "" : "s"}){" "}
            {formatUsd(result.lodgingSubtotal)}
          </>
        )}
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]">
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium">GSA M&IE</th>
              <th className="py-2 pr-3 font-medium">Allowed M&IE</th>
              <th className="py-2 pr-3 font-medium">Lodging</th>
              <th className="py-2 text-right font-medium">Day total</th>
            </tr>
          </thead>
          <tbody>
            {result.days.map((d) => (
              <tr key={d.date} className="border-b border-[var(--color-border)]/60">
                <td className="py-2.5 pr-3">
                  {d.date}
                  {d.isTravelDay && (
                    <span className="ml-1 text-xs text-[var(--color-ink-muted)]">travel</span>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-[var(--color-ink-muted)]">{formatUsd(d.gsaMie)}</td>
                <td className="py-2.5 pr-3">{formatUsd(d.mieAllowed)}</td>
                <td className="py-2.5 pr-3">
                  {d.lodgingAllowed > 0 ? formatUsd(d.lodgingAllowed) : "—"}
                </td>
                <td className="py-2.5 text-right font-medium">{formatUsd(d.dailyTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CustomResult({ result }: { result: TeacherCustomTripResult }) {
  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">Trip estimate (custom rates)</h2>
      <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{formatUsd(result.total)}</p>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        M&IE {formatUsd(result.mealsSubtotal)}
        {result.lodgingSubtotal > 0 && (
          <>
            {" "}
            · Lodging ({result.lodgingNights} nights) {formatUsd(result.lodgingSubtotal)}
          </>
        )}
      </p>
      {result.days.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Multiplier</th>
                <th className="py-2 text-right font-medium">M&IE</th>
              </tr>
            </thead>
            <tbody>
              {result.days.map((d) => (
                <tr key={d.date} className="border-b border-[var(--color-border)]/60">
                  <td className="py-2.5 pr-4">{d.date}</td>
                  <td className="py-2.5 pr-4">{d.multiplier === 1 ? "100%" : "75%"}</td>
                  <td className="py-2.5 text-right font-medium">{formatUsd(d.mealsTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

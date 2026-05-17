import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CrewAirport } from "../../data/crewAirports";
import type { CrewRateMode, CrewTripType } from "../../lib/crew/calculate";
import { validateLegs } from "../../lib/crew/assignDays";
import { pickLocalityForCity } from "../../lib/crew/localityMatch";
import { runCrewCalculation } from "../../lib/crew/runCalculation";
import type {
  CrewCalculationResult,
  CrewCalcMode,
  CrewLayoverLeg,
  CrewRole,
  CrewSavedTrip
} from "../../lib/crew/types";
import { legFromAirport, newLegId } from "../../lib/crew/types";
import { formatUsd } from "../../lib/format";
import { fiscalYearForDate } from "../../lib/perdiem/fiscalYear";
import {
  fetchLocalitiesForState,
  fetchLocalityRatesForTripByDid,
  resolveLocalityByZip,
  type LocalityListItem
} from "../../lib/rates/queries";
import { isSupabaseConfigured } from "../../lib/supabaseRest";
import { STORAGE_KEY_PROFESSION } from "../../data/professions";
import { useCrewTripLog } from "../../hooks/useCrewTripLog";
import { getCrewTrip } from "../../lib/crew/tripLogStorage";
import type { CrewImportPrefill } from "./CrewScheduleImport";
import { AirportPicker } from "./AirportPicker";
import { MultiLegEditor } from "./MultiLegEditor";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { US_STATES } from "../../data/usStates";

import { calcInput } from "../../lib/calcUi";

type CalcMode = CrewCalcMode;

export type CrewCalculatorPanelProps = {
  prefill?: CrewImportPrefill | null;
  onPrefillConsumed?: () => void;
  editTrip?: CrewSavedTrip | null;
  onEditConsumed?: () => void;
};

const PRESETS: Record<
  string,
  { label: string; domestic: number; international: number; mode: CrewRateMode }
> = {
  "per-day": { label: "Per calendar day (typical)", domestic: 2.5, international: 3.5, mode: "per-day" },
  "per-hour": { label: "Per hour away (typical)", domestic: 2.5, international: 3.5, mode: "per-hour" },
  custom: { label: "Custom — enter your rates", domestic: 0, international: 0, mode: "per-day" }
};

const MODE_TABS: { id: CalcMode; label: string; hint: string }[] = [
  {
    id: "contract",
    label: "Contract pay",
    hint: "Union / employer per diem"
  },
  {
    id: "gsa",
    label: "IRS / GSA",
    hint: "Tax M&IE by layover"
  },
  {
    id: "both",
    label: "Compare both",
    hint: "Pay vs federal allowance"
  }
];

function formatLocalityLabel(l: LocalityListItem): string {
  return l.isStandard ? `${l.city} (standard rate)` : l.city;
}

export function CrewCalculatorPanel({
  prefill,
  onPrefillConsumed,
  editTrip,
  onEditConsumed
}: CrewCalculatorPanelProps) {
  const { saveTrip } = useCrewTripLog();
  const [calcMode, setCalcMode] = useState<CalcMode>("both");
  const [role, setRole] = useState<CrewRole>("pilot");
  const [multiCity, setMultiCity] = useState(false);
  const [legs, setLegs] = useState<CrewLayoverLeg[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("18:00");

  const [rateMode, setRateMode] = useState<CrewRateMode>("per-day");
  const [tripType, setTripType] = useState<CrewTripType>("domestic");
  const [domesticRate, setDomesticRate] = useState("2.50");
  const [internationalRate, setInternationalRate] = useState("3.50");
  const [partialTravelDays, setPartialTravelDays] = useState(true);
  const [preset, setPreset] = useState("per-day");

  const [airport, setAirport] = useState<CrewAirport | null>(null);
  const [layoverState, setLayoverState] = useState("TX");
  const [localityId, setLocalityId] = useState("");
  const [did, setDid] = useState("");
  const [localityLabel, setLocalityLabel] = useState("");
  const [zip, setZip] = useState("");
  const [intlMie, setIntlMie] = useState("68");
  const [localities, setLocalities] = useState<LocalityListItem[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [calcResult, setCalcResult] = useState<CrewCalculationResult | null>(null);
  const [lastLegs, setLastLegs] = useState<CrewLayoverLeg[]>([]);
  const [calculating, setCalculating] = useState(false);

  const supabaseReady = isSupabaseConfigured();
  const showContract = calcMode === "contract" || calcMode === "both";
  const showGsa = calcMode === "gsa" || calcMode === "both";

  const pickerFy = useMemo(() => {
    if (start) return fiscalYearForDate(new Date(start + "T12:00:00"));
    return fiscalYearForDate(new Date());
  }, [start]);

  const fetchContextRef = useRef({ layoverState, pickerFy });
  fetchContextRef.current = { layoverState, pickerFy };

  useEffect(() => {
    if (!airport?.state) return;
    setLayoverState(airport.state);
  }, [airport]);

  useEffect(() => {
    if (!supabaseReady || !showGsa) return;
    let cancelled = false;
    const reqState = layoverState;
    const reqFy = pickerFy;
    setLoadingLocalities(true);
    fetchLocalitiesForState(reqState, reqFy)
      .then((rows) => {
        if (cancelled) return;
        const latest = fetchContextRef.current;
        if (latest.layoverState !== reqState || latest.pickerFy !== reqFy) return;
        setLocalities(rows);
        if (airport?.region === "us" && airport.state === reqState) {
          const match = pickLocalityForCity(rows, airport.city);
          if (match) {
            setLocalityId(match.id);
            setDid(match.did);
            setLocalityLabel(formatLocalityLabel(match));
            return;
          }
        }
        const current = rows.find((l) => l.id === localityId);
        if (!current && rows.length) {
          const first = rows[0];
          setLocalityId(first.id);
          setDid(first.did);
          setLocalityLabel(formatLocalityLabel(first));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLocalities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [layoverState, pickerFy, supabaseReady, showGsa, airport]);

  const applyPreset = (key: string) => {
    setPreset(key);
    if (key === "custom") return;
    const p = PRESETS[key];
    if (!p) return;
    setRateMode(p.mode);
    setDomesticRate(String(p.domestic));
    setInternationalRate(String(p.international));
  };

  const lookupZip = useCallback(async () => {
    if (!zip.trim()) return;
    const loc = await resolveLocalityByZip(zip, pickerFy);
    if (!loc) {
      setError("ZIP not found in GSA data for this fiscal year.");
      return;
    }
    setLayoverState(loc.state);
    setLocalityId(loc.id);
    setDid(loc.did);
    setLocalityLabel(formatLocalityLabel(loc));
    setError(null);
  }, [zip, pickerFy]);

  useEffect(() => {
    if (!prefill) return;
    setStart(prefill.tripStart);
    setEnd(prefill.tripEnd);
    setMultiCity(prefill.multiCity);
    setLegs(prefill.legs);
    if (prefill.legs[0]) {
      setAirport({
        code: prefill.legs[0].airportCode,
        city: prefill.legs[0].city,
        state: prefill.legs[0].state,
        country: prefill.legs[0].country,
        region: prefill.legs[0].region
      });
    }
    onPrefillConsumed?.();
  }, [prefill, onPrefillConsumed]);

  useEffect(() => {
    if (!editTrip) return;
    setEditingId(editTrip.id);
    setCalcMode(editTrip.calcMode);
    setRole(editTrip.role);
    setStart(editTrip.tripStart);
    setEnd(editTrip.tripEnd);
    setMultiCity(editTrip.legs.length > 1);
    setLegs(editTrip.legs);
    setCalcResult({
      contractTotal: editTrip.contractTotal,
      gsaTotal: editTrip.gsaTotal,
      daySegments: editTrip.daySegments
    });
    setLastLegs(editTrip.legs);
    if (editTrip.contract) {
      setRateMode(editTrip.contract.rateMode);
      setTripType(editTrip.contract.tripType);
      setDomesticRate(String(editTrip.contract.domesticRate));
      setInternationalRate(String(editTrip.contract.internationalRate));
      setPartialTravelDays(editTrip.contract.partialTravelDays);
      setStartTime(editTrip.contract.startTime);
      setEndTime(editTrip.contract.endTime);
    }
    onEditConsumed?.();
  }, [editTrip, onEditConsumed]);

  const buildLegsForRun = useCallback((): CrewLayoverLeg[] | { error: string } => {
    if (multiCity) {
      if (!legs.length) return { error: "Add at least one layover leg." };
      return legs;
    }
    if (!airport?.code) return { error: "Select a layover airport." };
    const intlRate = parseFloat(intlMie);
    return [
      {
        ...legFromAirport(airport, start, end, 1),
        gsaDid: airport.region === "us" ? did || undefined : undefined,
        gsaState: airport.region === "us" ? layoverState : undefined,
        gsaLocalityLabel: airport.region === "us" ? localityLabel : undefined,
        intlMieRate:
          airport.region === "intl"
            ? Number.isNaN(intlRate)
              ? 68
              : intlRate
            : undefined
      }
    ];
  }, [multiCity, legs, airport, start, end, did, layoverState, localityLabel, intlMie]);

  const run = useCallback(async () => {
    setError(null);
    setCalcResult(null);
    setSaveNotice(null);

    if (!start || !end) {
      setError("Enter trip start and end dates.");
      return;
    }

    const built = buildLegsForRun();
    if ("error" in built) {
      setError(built.error);
      return;
    }

    const legErr = validateLegs(built, start, end);
    if (legErr) {
      setError(legErr);
      return;
    }

    if (showGsa && !supabaseReady) {
      setError("GSA mode needs Supabase rates configured (see README).");
      return;
    }

    setCalculating(true);
    try {
      let contract;
      if (showContract) {
        const domestic = parseFloat(domesticRate);
        const international = parseFloat(internationalRate);
        if (Number.isNaN(domestic) || Number.isNaN(international)) {
          setError("Enter valid contract rates.");
          return;
        }
        contract = {
          rateMode,
          tripType,
          domesticRate: domestic,
          internationalRate: international,
          partialTravelDays,
          startTime,
          endTime
        };
      }

      const result = await runCrewCalculation({
        calcMode,
        tripStart: start,
        tripEnd: end,
        legs: built,
        contract,
        defaultIntlMie: parseFloat(intlMie) || 68
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setCalcResult(result);
      setLastLegs(result.enrichedLegs ?? built);

      try {
        localStorage.setItem(STORAGE_KEY_PROFESSION, "aviation-crew");
      } catch {
        /* ignore */
      }
    } finally {
      setCalculating(false);
    }
  }, [
    start,
    end,
    buildLegsForRun,
    showContract,
    showGsa,
    supabaseReady,
    calcMode,
    rateMode,
    tripType,
    domesticRate,
    internationalRate,
    partialTravelDays,
    startTime,
    endTime,
    intlMie
  ]);

  const handleSave = useCallback(() => {
    if (!calcResult || !start || !end) return;
    const id = editingId ?? crypto.randomUUID();
    const tripLegs = lastLegs.length ? lastLegs : buildLegsForRun();
    if ("error" in tripLegs) return;

    const label =
      tripLegs.length > 1
        ? `${tripLegs[0]!.airportCode} → ${tripLegs[tripLegs.length - 1]!.airportCode}`
        : `${tripLegs[0]!.airportCode} layover`;

    const now = new Date().toISOString();
    const trip: CrewSavedTrip = {
      id,
      label,
      role,
      calcMode,
      tripStart: start,
      tripEnd: end,
      legs: tripLegs,
      contract: showContract
        ? {
            rateMode,
            tripType,
            domesticRate: parseFloat(domesticRate),
            internationalRate: parseFloat(internationalRate),
            partialTravelDays,
            startTime,
            endTime
          }
        : undefined,
      contractTotal: calcResult.contractTotal,
      gsaTotal: calcResult.gsaTotal,
      daySegments: calcResult.daySegments,
      createdAt: (editingId && getCrewTrip(editingId)?.createdAt) ?? now,
      updatedAt: now
    };

    saveTrip(trip);
    setEditingId(id);
    setSaveNotice("Trip saved to your log.");
  }, [
    calcResult,
    start,
    end,
    editingId,
    lastLegs,
    buildLegsForRun,
    role,
    calcMode,
    showContract,
    rateMode,
    tripType,
    domesticRate,
    internationalRate,
    partialTravelDays,
    startTime,
    endTime,
    saveTrip
  ]);

  const roleLabel =
    role === "pilot" ? "Pilot" : role === "cabin" ? "Cabin crew" : "Other crew";
  const rateUnit = rateMode === "per-hour" ? "/ hour" : "/ day";

  return (
    <CrewLayout>
      <Card padding="lg" className="border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Airline crew</Badge>
          <Badge variant="muted">{roleLabel}</Badge>
        </div>

        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          Compare what your airline pays (contract) with the federal M&IE allowance crews often use
          for tax planning—same IRS 75% first/last-day rule on multi-day trips.
        </p>

        <fieldset className="mt-6">
          <legend className="sr-only">Calculation mode</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCalcMode(tab.id)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  calcMode === tab.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 hover:border-[var(--color-ink-muted)]"
                }`}
              >
                <span className="block text-sm font-semibold text-[var(--color-ink)]">
                  {tab.label}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--color-ink-muted)]">
                  {tab.hint}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[var(--color-ink)]">Your role</legend>
            <RoleButtons role={role} setRole={setRole} />
          </fieldset>
        </div>

        <div className="mt-8 space-y-6">
          <TripDates
            start={start}
            setStart={setStart}
            end={end}
            setEnd={setEnd}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            showTimes={showContract && rateMode === "per-hour"}
          />

          <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={multiCity}
              onChange={(e) => {
                const on = e.target.checked;
                setMultiCity(on);
                if (on && legs.length === 0 && start && end) {
                  setLegs([
                    {
                      id: newLegId(),
                      sequence: 1,
                      airportCode: airport?.code ?? "",
                      city: airport?.city ?? "",
                      state: airport?.state,
                      country: airport?.country ?? "USA",
                      region: airport?.region ?? "us",
                      arrivalDate: start,
                      departureDate: end
                    }
                  ]);
                }
              }}
              className="h-4 w-4 rounded border-[var(--color-border)]"
            />
            Multiple layover cities (3+ day trips)
          </label>

          {showGsa && multiCity && (
            <MultiLegEditor legs={legs} onChange={setLegs} tripStart={start} tripEnd={end} />
          )}

          {showGsa && !multiCity && (
            <GsaLayoverFields
              airport={airport}
              setAirport={setAirport}
              layoverState={layoverState}
              setLayoverState={setLayoverState}
              localityId={localityId}
              setLocalityId={setLocalityId}
              setDid={setDid}
              setLocalityLabel={setLocalityLabel}
              localities={localities}
              loadingLocalities={loadingLocalities}
              localityLabel={localityLabel}
              zip={zip}
              setZip={setZip}
              intlMie={intlMie}
              setIntlMie={setIntlMie}
              supabaseReady={supabaseReady}
              onLookupZip={lookupZip}
            />
          )}

          {showContract && (
            <ContractFields
              preset={preset}
              applyPreset={applyPreset}
              rateMode={rateMode}
              setRateMode={setRateMode}
              tripType={tripType}
              setTripType={setTripType}
              partialTravelDays={partialTravelDays}
              setPartialTravelDays={setPartialTravelDays}
              domesticRate={domesticRate}
              setDomesticRate={setDomesticRate}
              internationalRate={internationalRate}
              setInternationalRate={setInternationalRate}
              rateUnit={rateUnit}
            />
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={run} disabled={calculating}>
            {calculating ? "Calculating…" : "Calculate"}
          </Button>
          {calcResult && (
            <Button type="button" variant="secondary" onClick={handleSave}>
              Save to trip log
            </Button>
          )}
        </div>
        {saveNotice && (
          <p className="mt-3 text-sm font-medium text-[var(--color-primary)]">{saveNotice}</p>
        )}
      </Card>

      {calcResult && (
        <ResultsSection calcMode={calcMode} result={calcResult} rateMode={rateMode} />
      )}
    </CrewLayout>
  );
}

function CrewLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

function RoleButtons({
  role,
  setRole
}: {
  role: CrewRole;
  setRole: (r: CrewRole) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(
        [
          ["pilot", "Pilot"],
          ["cabin", "Cabin crew"],
          ["other", "Other"]
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setRole(id)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            role === id
              ? "bg-[var(--color-primary)] text-white"
              : "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function TripDates(props: {
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  showTimes: boolean;
}) {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Away from base — start
          <input
            type="date"
            className={calcInput}
            value={props.start}
            onChange={(e) => props.setStart(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Away from base — end
          <input
            type="date"
            className={calcInput}
            value={props.end}
            onChange={(e) => props.setEnd(e.target.value)}
          />
        </label>
      </div>
      {props.showTimes && (
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[var(--color-ink)]">
            Start time
            <input
              type="time"
              className={calcInput}
              value={props.startTime}
              onChange={(e) => props.setStartTime(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-[var(--color-ink)]">
            End time
            <input
              type="time"
              className={calcInput}
              value={props.endTime}
              onChange={(e) => props.setEndTime(e.target.value)}
            />
          </label>
        </div>
      )}
    </>
  );
}

function GsaLayoverFields(props: {
  airport: CrewAirport | null;
  setAirport: (a: CrewAirport | null) => void;
  layoverState: string;
  setLayoverState: (s: string) => void;
  localityId: string;
  setLocalityId: (id: string) => void;
  setDid: (did: string) => void;
  setLocalityLabel: (label: string) => void;
  localities: LocalityListItem[];
  loadingLocalities: boolean;
  localityLabel: string;
  zip: string;
  setZip: (z: string) => void;
  intlMie: string;
  setIntlMie: (v: string) => void;
  supabaseReady: boolean;
  onLookupZip: () => void;
}) {
  const isIntl = props.airport?.region === "intl";

  return (
    <div className="space-y-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">Layover location (GSA M&IE)</h3>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Federal rates for meals & incidentals. First and last trip days use 75% when the trip is
          2+ days (IRS convention).
        </p>
      </div>

      {!props.supabaseReady && (
        <p className="text-sm text-[var(--color-warning-text, var(--color-ink-muted))]">
          Connect Supabase with synced GSA rates to use this mode.
        </p>
      )}

      <AirportPicker value={props.airport} onChange={props.setAirport} />

      {isIntl ? (
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Daily M&IE rate (USD)
          <input
            type="number"
            min="0"
            step="1"
            className={calcInput}
            value={props.intlMie}
            onChange={(e) => props.setIntlMie(e.target.value)}
          />
          <span className="mt-1 block text-xs text-[var(--color-ink-muted)]">
            GSA CONUS does not cover this layover—enter your worksheet or State Dept rate.
          </span>
        </label>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              State
              <select
                className={calcInput}
                value={props.layoverState}
                onChange={(e) => {
                  props.setLayoverState(e.target.value);
                  props.setLocalityId("");
                }}
              >
                {US_STATES.map((s) => (
                  <option key={s.abbr} value={s.abbr}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Or find by ZIP
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="75201"
                  className={calcInput + " mt-0 flex-1"}
                  value={props.zip}
                  onChange={(e) => props.setZip(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={props.onLookupZip}>
                  Lookup
                </Button>
              </div>
            </label>
          </div>

          <label className="block text-sm font-medium text-[var(--color-ink)]">
            GSA locality
            <select
              className={calcInput}
              value={props.localityId}
              onChange={(e) => {
                const id = e.target.value;
                props.setLocalityId(id);
                const loc = props.localities.find((l) => l.id === id);
                if (loc) {
                  props.setDid(loc.did);
                  props.setLocalityLabel(formatLocalityLabel(loc));
                }
              }}
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
        </>
      )}
    </div>
  );
}

function ContractFields(props: {
  preset: string;
  applyPreset: (key: string) => void;
  rateMode: CrewRateMode;
  setRateMode: (v: CrewRateMode) => void;
  tripType: CrewTripType;
  setTripType: (v: CrewTripType) => void;
  partialTravelDays: boolean;
  setPartialTravelDays: (v: boolean) => void;
  domesticRate: string;
  setDomesticRate: (v: string) => void;
  internationalRate: string;
  setInternationalRate: (v: string) => void;
  rateUnit: string;
}) {
  return (
    <div className="space-y-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">Contract per diem</h3>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Rates from your CBA or employer—not GSA. Defaults are placeholders only.
        </p>
      </div>

      <label className="block text-sm font-medium text-[var(--color-ink)]">
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Pay mode
          <select
            className={calcInput}
            value={props.rateMode}
            onChange={(e) => props.setRateMode(e.target.value as CrewRateMode)}
          >
            <option value="per-day">Per calendar day</option>
            <option value="per-hour">Per hour away</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Trip type
          <select
            className={calcInput}
            value={props.tripType}
            onChange={(e) => props.setTripType(e.target.value as CrewTripType)}
          >
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            checked={props.partialTravelDays}
            onChange={(e) => props.setPartialTravelDays(e.target.checked)}
            disabled={props.rateMode === "per-hour"}
            className="h-4 w-4 rounded border-[var(--color-border)]"
          />
          75% on first & last day
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Domestic rate {props.rateUnit}
          <input
            type="number"
            min="0"
            step="0.01"
            className={calcInput}
            value={props.domesticRate}
            onChange={(e) => props.setDomesticRate(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          International rate {props.rateUnit}
          <input
            type="number"
            min="0"
            step="0.01"
            className={calcInput}
            value={props.internationalRate}
            onChange={(e) => props.setInternationalRate(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

function ResultsSection({
  calcMode,
  result,
  rateMode
}: {
  calcMode: CalcMode;
  result: CrewCalculationResult;
  rateMode: CrewRateMode;
}) {
  const showContract = calcMode === "contract" || calcMode === "both";
  const showGsa = calcMode === "gsa" || calcMode === "both";
  const perHour = rateMode === "per-hour" && result.daySegments.length === 0;

  return (
    <div className="space-y-6">
      {calcMode === "both" && (
        <Card padding="lg" className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Side by side</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Contract pay
              </p>
              <p className="text-2xl font-bold text-[var(--color-ink)]">
                {formatUsd(result.contractTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                GSA M&IE (tax basis)
              </p>
              <p className="text-2xl font-bold text-[var(--color-primary)]">
                {formatUsd(result.gsaTotal)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {showContract && (
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Contract pay estimate</h2>
          <p className="mt-2 text-3xl font-bold text-[var(--color-ink)]">
            {formatUsd(result.contractTotal)}
            {perHour && (
              <span className="ml-2 text-base font-normal text-[var(--color-ink-muted)]">
                (per-hour trip)
              </span>
            )}
          </p>
        </Card>
      )}

      {showGsa && result.gsaTotal > 0 && (
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">GSA M&IE estimate</h2>
          <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
            {formatUsd(result.gsaTotal)}
          </p>
        </Card>
      )}

      {result.daySegments.length > 0 && (
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Day by day</h2>
          <DayTable segments={result.daySegments} calcMode={calcMode} />
        </Card>
      )}
    </div>
  );
}

function DayTable({
  segments,
  calcMode
}: {
  segments: import("../../lib/crew/types").CrewDaySegment[];
  calcMode: CalcMode;
}) {
  const showBoth = calcMode === "both";
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]">
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Layover</th>
            {showBoth ? (
              <>
                <th className="py-2 pr-4 font-medium text-right">Contract</th>
                <th className="py-2 text-right font-medium">GSA M&IE</th>
              </>
            ) : (
              <th className="py-2 text-right font-medium">Amount</th>
            )}
          </tr>
        </thead>
        <tbody>
          {segments.map((d) => (
            <tr key={d.date} className="border-b border-[var(--color-border)]/60">
              <td className="py-2.5 pr-4 text-[var(--color-ink)]">
                {d.date}
                {d.isTravelDay && (
                  <span className="ml-2 text-xs text-[var(--color-ink-muted)]">75% day</span>
                )}
              </td>
              <td className="py-2.5 pr-4 text-[var(--color-ink-muted)]">
                <span className="font-mono font-medium text-[var(--color-ink)]">{d.airportCode}</span>
                {" · "}
                {d.city}
              </td>
              {showBoth ? (
                <>
                  <td className="py-2.5 pr-4 text-right font-medium">
                    {formatUsd(d.contractAmount)}
                  </td>
                  <td className="py-2.5 text-right font-medium text-[var(--color-primary)]">
                    {formatUsd(d.gsaAmount)}
                  </td>
                </>
              ) : (
                <td className="py-2.5 text-right font-medium">
                  {formatUsd(calcMode === "gsa" ? d.gsaAmount : d.contractAmount)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

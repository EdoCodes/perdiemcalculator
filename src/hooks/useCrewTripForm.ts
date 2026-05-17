import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CrewAirport } from "../data/crewAirports";
import type { CrewRateMode, CrewTripType } from "../lib/crew/calculate";
import { validateLegs } from "../lib/crew/assignDays";
import { pickLocalityForCity } from "../lib/crew/localityMatch";
import { runCrewCalculation } from "../lib/crew/runCalculation";
import type {
  CrewCalculationResult,
  CrewCalcMode,
  CrewLayoverLeg,
  CrewRole,
  CrewSavedTrip
} from "../lib/crew/types";
import { legFromAirport, newLegId } from "../lib/crew/types";
import { eachTripDay, fiscalYearForDate } from "../lib/perdiem/fiscalYear";
import {
  fetchLocalitiesForState,
  resolveLocalityByZip,
  type LocalityListItem
} from "../lib/rates/queries";
import { isSupabaseConfigured } from "../lib/supabaseRest";
import { STORAGE_KEY_PROFESSION } from "../data/professions";
import { getCrewTrip } from "../lib/crew/tripLogStorage";
import type { CrewImportPrefill } from "../components/crew/CrewScheduleImport";

export function formatLocalityLabel(l: LocalityListItem): string {
  return l.isStandard ? `${l.city} (standard rate)` : l.city;
}

export function useCrewTripForm(saveTrip: (trip: CrewSavedTrip) => void) {
  const [calcMode, setCalcMode] = useState<CrewCalcMode>("both");
  const [role, setRole] = useState<CrewRole>("pilot");
  const [multiCity, setMultiCity] = useState(false);
  const [legs, setLegs] = useState<CrewLayoverLeg[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("18:00");
  const [rateMode, setRateMode] = useState<CrewRateMode>("per-day");
  const [tripType, setTripType] = useState<CrewTripType>("domestic");
  const [domesticRate, setDomesticRate] = useState("2.50");
  const [internationalRate, setInternationalRate] = useState("3.50");
  const [partialTravelDays, setPartialTravelDays] = useState(true);
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
  const [lastResult, setLastResult] = useState<CrewCalculationResult | null>(null);
  const [lastLegs, setLastLegs] = useState<CrewLayoverLeg[]>([]);
  const [calculating, setCalculating] = useState(false);

  const supabaseReady = isSupabaseConfigured();
  const showContract = calcMode === "contract" || calcMode === "both";
  const showGsa = calcMode === "gsa" || calcMode === "both";

  const dayCount = useMemo(() => {
    if (!start || !end) return 0;
    return eachTripDay(start, end).length;
  }, [start, end]);

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
          const first = rows[0]!;
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
  }, [layoverState, pickerFy, supabaseReady, showGsa, airport, localityId]);

  const buildLegsForRun = useCallback((): CrewLayoverLeg[] | { error: string } => {
    if (multiCity) {
      if (!legs.length) return { error: "Add at least one layover city." };
      return legs;
    }
    if (!airport?.code) return { error: "Select a layover city (airport)." };
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

  const runCalculation = useCallback(async (): Promise<
    CrewCalculationResult | { error: string }
  > => {
    if (!start || !end) return { error: "Select trip start and end dates." };

    const built = buildLegsForRun();
    if ("error" in built) return built;

    const legErr = validateLegs(built, start, end);
    if (legErr) return { error: legErr };

    if (showGsa && !supabaseReady) {
      return { error: "GSA rates need Supabase — check site configuration." };
    }

    let contract;
    if (showContract) {
      const domestic = parseFloat(domesticRate);
      const international = parseFloat(internationalRate);
      if (Number.isNaN(domestic) || Number.isNaN(international)) {
        return { error: "Enter valid contract rates in advanced options." };
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

    if ("error" in result) return result;
    return result;
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

  const saveFromResult = useCallback(
    (result: CrewCalculationResult, tripLegs: CrewLayoverLeg[]) => {
      const id = editingId ?? crypto.randomUUID();
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
        contractTotal: result.contractTotal,
        gsaTotal: result.gsaTotal,
        daySegments: result.daySegments,
        createdAt: (editingId && getCrewTrip(editingId)?.createdAt) ?? now,
        updatedAt: now
      };

      saveTrip(trip);
      setEditingId(id);
      setLastResult(result);
      setLastLegs(tripLegs);

      try {
        localStorage.setItem(STORAGE_KEY_PROFESSION, "aviation-crew");
      } catch {
        /* ignore */
      }

      return trip;
    },
    [
      editingId,
      start,
      end,
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
    ]
  );

  const addTripToLog = useCallback(async (): Promise<CrewSavedTrip | null> => {
    setError(null);
    setCalculating(true);
    try {
      const result = await runCalculation();
      if ("error" in result) {
        setError(result.error);
        return null;
      }
      const built = buildLegsForRun();
      if ("error" in built) {
        setError(built.error);
        return null;
      }
      const enriched = result.enrichedLegs ?? built;
      return saveFromResult(result, enriched);
    } finally {
      setCalculating(false);
    }
  }, [runCalculation, buildLegsForRun, saveFromResult]);

  const resetForm = useCallback(() => {
    setStart("");
    setEnd("");
    setAirport(null);
    setMultiCity(false);
    setLegs([]);
    setEditingId(null);
    setError(null);
    setLastResult(null);
    setZip("");
  }, []);

  const applyPrefill = useCallback((prefill: CrewImportPrefill) => {
    setStart(prefill.tripStart);
    setEnd(prefill.tripEnd);
    setMultiCity(prefill.multiCity);
    setLegs(prefill.legs);
    if (prefill.legs[0]) {
      const l = prefill.legs[0];
      setAirport({
        code: l.airportCode,
        city: l.city,
        state: l.state,
        country: l.country,
        region: l.region
      });
    }
    setError(null);
  }, []);

  const loadEditTrip = useCallback((trip: CrewSavedTrip) => {
    setEditingId(trip.id);
    setCalcMode(trip.calcMode);
    setRole(trip.role);
    setStart(trip.tripStart);
    setEnd(trip.tripEnd);
    setMultiCity(trip.legs.length > 1);
    setLegs(trip.legs);
    setLastResult({
      contractTotal: trip.contractTotal,
      gsaTotal: trip.gsaTotal,
      daySegments: trip.daySegments
    });
    setLastLegs(trip.legs);
    if (trip.legs[0]) {
      const l = trip.legs[0];
      setAirport({
        code: l.airportCode,
        city: l.city,
        state: l.state,
        country: l.country,
        region: l.region
      });
    }
    if (trip.contract) {
      setRateMode(trip.contract.rateMode);
      setTripType(trip.contract.tripType);
      setDomesticRate(String(trip.contract.domesticRate));
      setInternationalRate(String(trip.contract.internationalRate));
      setPartialTravelDays(trip.contract.partialTravelDays);
      setStartTime(trip.contract.startTime);
      setEndTime(trip.contract.endTime);
    }
    setError(null);
  }, []);

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

  return {
    calcMode,
    setCalcMode,
    role,
    setRole,
    multiCity,
    setMultiCity,
    legs,
    setLegs,
    editingId,
    start,
    setStart,
    end,
    setEnd,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    rateMode,
    setRateMode,
    tripType,
    setTripType,
    domesticRate,
    setDomesticRate,
    internationalRate,
    setInternationalRate,
    partialTravelDays,
    setPartialTravelDays,
    airport,
    setAirport,
    layoverState,
    setLayoverState,
    localityId,
    setLocalityId,
    setDid,
    setLocalityLabel,
    zip,
    setZip,
    intlMie,
    setIntlMie,
    localities,
    loadingLocalities,
    localityLabel,
    error,
    setError,
    lastResult,
    calculating,
    dayCount,
    supabaseReady,
    showContract,
    showGsa,
    addTripToLog,
    resetForm,
    applyPrefill,
    loadEditTrip,
    lookupZip
  };
}

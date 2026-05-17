import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  calculateCrewTrip,
  type CrewRateMode,
  type CrewTripResult,
  type CrewTripType
} from "../../lib/crew/calculate";
import { STORAGE_KEY_PROFESSION } from "../../data/professions";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] shadow-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20";

const PRESETS: Record<
  string,
  { label: string; domestic: number; international: number; mode: CrewRateMode }
> = {
  "per-day": { label: "Per calendar day (typical)", domestic: 2.5, international: 3.5, mode: "per-day" },
  "per-hour": { label: "Per hour away (typical)", domestic: 2.5, international: 3.5, mode: "per-hour" },
  custom: { label: "Custom — enter your rates", domestic: 0, international: 0, mode: "per-day" }
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function CrewPerDiemCalculator() {
  const [role, setRole] = useState<"pilot" | "cabin" | "other">("pilot");
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
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrewTripResult | null>(null);

  const applyPreset = (key: string) => {
    setPreset(key);
    if (key === "custom") return;
    const p = PRESETS[key];
    if (!p) return;
    setRateMode(p.mode);
    setDomesticRate(String(p.domestic));
    setInternationalRate(String(p.international));
  };

  const run = useCallback(() => {
    setError(null);
    setResult(null);
    if (!start || !end) {
      setError("Enter trip start and end dates.");
      return;
    }
    const domestic = parseFloat(domesticRate);
    const international = parseFloat(internationalRate);
    if (Number.isNaN(domestic) || Number.isNaN(international)) {
      setError("Enter valid numeric rates.");
      return;
    }

    const trip = calculateCrewTrip(start, end, startTime, endTime, {
      rateMode,
      tripType,
      domesticRate: domestic,
      internationalRate: international,
      partialTravelDays
    });

    if ("error" in trip) {
      setError(trip.error);
      return;
    }
    setResult(trip);
    try {
      localStorage.setItem(STORAGE_KEY_PROFESSION, "aviation-crew");
    } catch {
      /* ignore */
    }
  }, [
    start,
    end,
    startTime,
    endTime,
    rateMode,
    tripType,
    domesticRate,
    internationalRate,
    partialTravelDays
  ]);

  const roleLabel = useMemo(() => {
    if (role === "pilot") return "Pilot";
    if (role === "cabin") return "Cabin crew";
    return "Other crew";
  }, [role]);

  const rateUnit = rateMode === "per-hour" ? "/ hour" : "/ day";

  return (
    <CrewLayout>
      <Card padding="lg" className="border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Contract-based</Badge>
          <Badge variant="muted">{roleLabel}</Badge>
        </div>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          Enter your union or employer per diem rates. Amounts vary by airline and CBA—defaults are
          placeholders only.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[var(--color-ink)]">Your role</legend>
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
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[var(--color-ink)]">Rate structure</legend>
            <select
              className={inputClass}
              value={preset}
              onChange={(e) => applyPreset(e.target.value)}
            >
              {Object.entries(PRESETS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Away from base — start date
              <input
                type="date"
                className={inputClass}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Away from base — end date
              <input
                type="date"
                className={inputClass}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>

          {rateMode === "per-hour" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[var(--color-ink)]">
                Start time
                <input
                  type="time"
                  className={inputClass}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
              <label className="block text-sm font-medium text-[var(--color-ink)]">
                End time
                <input
                  type="time"
                  className={inputClass}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </label>
            </div>
          )}

          <motionCrewOptions
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
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]">
            {error}
          </p>
        )}

        <motionCrewActions run={run} />
      </Card>

      {result && (
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Trip estimate</h2>
          {result.totalHours != null ? (
            <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
              {formatMoney(result.total)}
              <span className="ml-2 text-base font-normal text-[var(--color-ink-muted)]">
                ({result.totalHours} hours)
              </span>
            </p>
          ) : (
            <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
              {formatMoney(result.total)}
            </p>
          )}

          {result.days.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Segment</th>
                    <th className="py-2 pr-4 font-medium">Rate</th>
                    <th className="py-2 pr-4 font-medium">Multiplier</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.days.map((d) => (
                    <tr key={d.date} className="border-b border-[var(--color-border)]/60">
                      <td className="py-2.5 pr-4 text-[var(--color-ink)]">
                        {d.date}
                        {d.isTravelDay && (
                          <span className="ml-2 text-xs text-[var(--color-ink-muted)]">travel day</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 capitalize text-[var(--color-ink-muted)]">
                        {d.tripSegment}
                      </td>
                      <td className="py-2.5 pr-4">{formatMoney(d.rateApplied)}</td>
                      <td className="py-2.5 pr-4">{d.multiplier === 1 ? "100%" : "75%"}</td>
                      <td className="py-2.5 text-right font-medium">{formatMoney(d.dailyTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </CrewLayout>
  );
}

function CrewLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

function motionCrewOptions(props: {
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
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm font-medium text-[var(--color-ink)]">
          Pay mode
          <select
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
            value={props.internationalRate}
            onChange={(e) => props.setInternationalRate(e.target.value)}
          />
        </label>
      </div>
    </>
  );
}

function motionCrewActions({ run }: { run: () => void }) {
  return (
    <div className="mt-6">
      <Button type="button" onClick={run}>
        Calculate trip per diem
      </Button>
    </div>
  );
}

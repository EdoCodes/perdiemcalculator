import { useState } from "react";
import {
  attachAirportsToParsed,
  ensureAirportIndex,
  parseScheduleCsv,
  parseScheduleText,
  parsedToLayoverLegs,
  tripBoundsFromParsed,
  type ParsedScheduleLeg
} from "../../lib/crew/parseSchedule";
import type { CrewLayoverLeg } from "../../lib/crew/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export type CrewImportPrefill = {
  tripStart: string;
  tripEnd: string;
  legs: CrewLayoverLeg[];
  multiCity: boolean;
};

type Props = {
  onImport: (prefill: CrewImportPrefill) => void;
  submitLabel?: string;
};

const CSV_TEMPLATE = `airport,arrival,departure
DFW,2026-05-17,2026-05-19
LAX,2026-05-19,2026-05-21`;

export function CrewScheduleImport({ onImport, submitLabel = "Send to calculator" }: Props) {
  const [tab, setTab] = useState<"csv" | "text" | "ai">("csv");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preview, setPreview] = useState<ParsedScheduleLeg[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const runParse = async () => {
    setError(null);
    setWarnings([]);
    setPreview(null);
    await ensureAirportIndex();
    const result = tab === "csv" ? parseScheduleCsv(text) : parseScheduleText(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPreview(result.legs);
    setWarnings([
      ...result.warnings,
      ...result.legs.filter((l) => l.warning).map((l) => l.warning!)
    ]);
  };

  const applyImport = () => {
    if (!preview?.length) return;
    const bounds = tripBoundsFromParsed(preview);
    onImport({
      tripStart: bounds.start,
      tripEnd: bounds.end,
      legs: parsedToLayoverLegs(preview),
      multiCity: preview.length > 1
    });
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ""));
      setTab("csv");
    };
    reader.readAsText(file);
  };

  const runAiParse = async (file?: File) => {
    setError(null);
    setWarnings([]);
    setPreview(null);
    setAiLoading(true);
    try {
      let body: Record<string, string>;
      if (file) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
        body = {
          imageBase64: btoa(binary),
          mimeType: file.type || "image/png"
        };
      } else {
        if (!text.trim()) {
          setError("Paste schedule text or upload an image.");
          return;
        }
        body = { text };
      }

      const res = await fetch("/.netlify/functions/parse-crew-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI parse failed.");
        return;
      }
      const legs: ParsedScheduleLeg[] = (data.legs ?? []).map(
        (l: { airportCode: string; arrivalDate: string; departureDate: string }) => ({
          airportCode: l.airportCode.toUpperCase(),
          arrivalDate: l.arrivalDate,
          departureDate: l.departureDate
        })
      );
      if (!legs.length) {
        setError("No layovers found in schedule.");
        return;
      }
      await ensureAirportIndex();
      setPreview(attachAirportsToParsed(legs));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Import schedule</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Upload a CSV export, paste roster lines, or use AI on a screenshot (when configured on
          Netlify with <code className="text-xs">OPENAI_API_KEY</code>).
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ["csv", "CSV / file"],
              ["text", "Paste text"],
              ["ai", "AI (image/text)"]
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`profession-chip ${tab === id ? "profession-chip--active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "csv" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Upload CSV or Excel (saved as CSV)
              <input
                type="file"
                accept=".csv,.txt,text/csv"
                className="mt-2 block w-full text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
            </label>
            <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
              Template: airport, arrival, departure (ISO or M/D/YY dates).
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--color-surface-muted)] p-3 text-xs">
              {CSV_TEMPLATE}
            </pre>
          </div>
        )}

        {tab === "ai" && (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Schedule screenshot (PNG/JPG)
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void runAiParse(f);
                }}
              />
            </label>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Or paste raw roster text below and use AI parse.
            </p>
          </div>
        )}

        <label className="mt-4 block text-sm font-medium text-[var(--color-ink)]">
          {tab === "csv" ? "CSV content" : "Schedule text"}
          <textarea
            className="mt-2 min-h-[8rem] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 font-mono text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              tab === "text" || tab === "ai"
                ? "DFW 2026-05-17 2026-05-19\nLAX 2026-05-19 2026-05-21"
                : CSV_TEMPLATE
            }
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {tab !== "ai" && (
            <Button type="button" onClick={runParse}>
              Preview import
            </Button>
          )}
          {tab === "ai" && (
            <Button type="button" onClick={() => void runAiParse()} disabled={aiLoading}>
              {aiLoading ? "Parsing…" : "AI parse"}
            </Button>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-text)]">
            {error}
          </p>
        )}

        {warnings.length > 0 && (
          <ul className="mt-4 list-inside list-disc text-sm text-[var(--color-ink-muted)]">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}

        {preview && preview.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Preview ({preview.length} leg{preview.length === 1 ? "" : "s"})
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-ink-muted)]">
              {preview.map((l, i) => (
                <li key={i}>
                  <span className="font-mono font-medium text-[var(--color-ink)]">
                    {l.airportCode}
                  </span>{" "}
                  {l.arrivalDate} → {l.departureDate}
                </li>
              ))}
            </ul>
            <Button type="button" className="mt-4" onClick={applyImport}>
              {submitLabel}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

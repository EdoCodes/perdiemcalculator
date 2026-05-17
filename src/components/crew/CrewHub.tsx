import { useCallback, useEffect, useState } from "react";
import { useCrewTripLog } from "../../hooks/useCrewTripLog";
import type { CrewImportPrefill } from "./CrewScheduleImport";
import { CrewScheduleImport } from "./CrewScheduleImport";
import { CrewTripLogPanel } from "./CrewTripLogPanel";
import { CrewCalendar } from "./CrewCalendar";
import { CrewCalculatorPanel } from "./CrewCalculatorPanel";
import { CrewOverview } from "./CrewOverview";
import { CrewYearStats } from "./CrewYearStats";
import type { CrewSavedTrip } from "../../lib/crew/types";

type HubTab = "overview" | "calculator" | "log" | "calendar" | "import";

const TABS: { id: HubTab; label: string; short: string }[] = [
  { id: "overview", label: "Overview", short: "Home" },
  { id: "calculator", label: "Calculator", short: "Calc" },
  { id: "log", label: "Trip log", short: "Log" },
  { id: "calendar", label: "Calendar", short: "Cal" },
  { id: "import", label: "Import", short: "Import" }
];

function tabFromHash(): HubTab {
  if (typeof window === "undefined") return "overview";
  const h = window.location.hash.replace("#", "");
  if (h === "calculator" || h === "log" || h === "calendar" || h === "import") return h;
  if (h === "overview" || h === "") return "overview";
  return "overview";
}

export function CrewHub() {
  const { trips } = useCrewTripLog();
  const [tab, setTab] = useState<HubTab>("overview");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [prefill, setPrefill] = useState<CrewImportPrefill | null>(null);
  const [editTrip, setEditTrip] = useState<CrewSavedTrip | null>(null);

  useEffect(() => {
    setTab(tabFromHash());
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goTab = useCallback((next: HubTab) => {
    setTab(next);
    window.location.hash = next === "overview" ? "" : next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="crew-hub mx-auto max-w-5xl space-y-6">
      <CrewYearStats trips={trips} year={year} onYearChange={setYear} />

      <nav
        className="crew-nav flex gap-1 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-1.5"
        aria-label="Crew tools"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => goTab(t.id)}
            className={`min-w-[4.5rem] flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition sm:min-w-0 ${
              tab === t.id
                ? "bg-[var(--color-surface-elevated)] text-[var(--color-ink)] shadow-sm ring-1 ring-[var(--color-border)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.short}</span>
          </button>
        ))}
      </nav>

      <div key={tab} className="crew-panel min-h-[20rem]">
        {tab === "overview" && (
          <CrewOverview
            trips={trips}
            year={year}
            onNewTrip={() => goTab("calculator")}
            onImport={() => goTab("import")}
            onViewLog={() => goTab("log")}
            onEdit={(trip) => {
              setEditTrip(trip);
              goTab("calculator");
            }}
          />
        )}
        {tab === "calculator" && (
          <CrewCalculatorPanel
            prefill={prefill}
            onPrefillConsumed={() => setPrefill(null)}
            editTrip={editTrip}
            onEditConsumed={() => setEditTrip(null)}
          />
        )}
        {tab === "log" && (
          <CrewTripLogPanel
            year={year}
            onEdit={(trip) => {
              setEditTrip(trip);
              goTab("calculator");
            }}
          />
        )}
        {tab === "calendar" && <CrewCalendar year={year} />}
        {tab === "import" && (
          <CrewScheduleImport
            onImport={(data) => {
              setPrefill(data);
              goTab("calculator");
            }}
          />
        )}
      </div>
    </div>
  );
}

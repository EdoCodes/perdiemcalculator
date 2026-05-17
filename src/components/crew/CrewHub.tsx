import { useCallback, useEffect, useState } from "react";
import type { CrewImportPrefill } from "./CrewScheduleImport";
import { CrewScheduleImport } from "./CrewScheduleImport";
import { CrewCalendar } from "./CrewCalendar";
import { CrewHome } from "./CrewHome";
import { calcNavTab, calcNavTabActive } from "../../lib/calcUi";

type HubTab = "home" | "calendar" | "import";

const TABS: { id: HubTab; label: string; short: string }[] = [
  { id: "home", label: "Trips", short: "Trips" },
  { id: "calendar", label: "Calendar", short: "Cal" },
  { id: "import", label: "Import", short: "Import" }
];

function tabFromHash(): HubTab {
  if (typeof window === "undefined") return "home";
  const h = window.location.hash.replace("#", "");
  if (h === "calendar" || h === "import") return h;
  if (
    h === "home" ||
    h === "overview" ||
    h === "calculator" ||
    h === "log" ||
    h === ""
  ) {
    return "home";
  }
  return "home";
}

export function CrewHub() {
  const [tab, setTab] = useState<HubTab>("home");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [prefill, setPrefill] = useState<CrewImportPrefill | null>(null);

  useEffect(() => {
    setTab(tabFromHash());
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goTab = useCallback((next: HubTab) => {
    setTab(next);
    window.location.hash = next === "home" ? "" : next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="crew-hub mx-auto max-w-5xl space-y-6">
      <nav className="crew-nav flex overflow-x-auto rounded-2xl" aria-label="Crew tools">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => goTab(t.id)}
            className={tab === t.id ? calcNavTabActive : calcNavTab}
          >
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.short}</span>
          </button>
        ))}
      </nav>

      <div key={tab} className="crew-panel min-h-[20rem]">
        {tab === "home" && (
          <CrewHome
            year={year}
            onYearChange={setYear}
            prefill={prefill}
            onPrefillConsumed={() => setPrefill(null)}
          />
        )}
        {tab === "calendar" && <CrewCalendar year={year} />}
        {tab === "import" && (
          <CrewScheduleImport
            submitLabel="Fill trip form"
            onImport={(data) => {
              setPrefill(data);
              goTab("home");
            }}
          />
        )}
      </div>
    </div>
  );
}

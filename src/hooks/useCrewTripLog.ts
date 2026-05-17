import { useCallback, useEffect, useState } from "react";
import {
  deleteCrewTrip,
  loadCrewTripLog,
  upsertCrewTrip,
  type CrewTripLog
} from "../lib/crew/tripLogStorage";
import type { CrewSavedTrip } from "../lib/crew/types";

export function useCrewTripLog() {
  const [log, setLog] = useState<CrewTripLog>(() =>
    typeof window !== "undefined" ? loadCrewTripLog() : { version: 1, trips: [] }
  );

  const refresh = useCallback(() => {
    setLog(loadCrewTripLog());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("crew-trips-updated", onUpdate);
    return () => window.removeEventListener("crew-trips-updated", onUpdate);
  }, [refresh]);

  const saveTrip = useCallback((trip: CrewSavedTrip) => {
    upsertCrewTrip(trip);
    setLog(loadCrewTripLog());
  }, []);

  const removeTrip = useCallback((id: string) => {
    deleteCrewTrip(id);
    setLog(loadCrewTripLog());
  }, []);

  return { trips: log.trips, saveTrip, removeTrip, refresh };
}

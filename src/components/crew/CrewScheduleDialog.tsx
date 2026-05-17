import { useEffect } from "react";
import type { CrewImportPrefill } from "./CrewScheduleImport";
import { CrewScheduleImport } from "./CrewScheduleImport";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (prefill: CrewImportPrefill) => void;
};

export function CrewScheduleDialog({ open, onClose, onImport }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crew-schedule-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[min(90vh,52rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2
            id="crew-schedule-dialog-title"
            className="text-lg font-semibold text-[var(--color-ink)]"
          >
            Upload schedule
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
          >
            Close
          </button>
        </div>
        <div className="p-4 sm:p-5">
          <CrewScheduleImport
            submitLabel="Fill trip form"
            onImport={(data) => {
              onImport(data);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

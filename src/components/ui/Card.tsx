import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = "md"
}: {
  children: ReactNode;
  className?: string;
  padding?: "none" | "md" | "lg";
}) {
  const pad = padding === "none" ? "" : padding === "lg" ? "p-8" : "p-6";
  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm shadow-black/5 dark:shadow-black/20 ${pad} ${className}`}
    >
      {children}
    </div>
  );
}

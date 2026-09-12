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
      className={`rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] shadow-[0_8px_24px_-12px_rgba(0,33,71,0.14)] dark:shadow-black/30 ${pad} ${className}`}
    >
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

type Variant = "default" | "primary" | "accent" | "muted";

const variants: Record<Variant, string> = {
  default:
    "bg-[var(--color-surface-muted)] text-[var(--color-ink)] ring-1 ring-[var(--color-border)]",
  primary: "bg-[var(--color-primary-muted)] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20",
  accent: "bg-[var(--color-accent-muted)] text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/25",
  muted: "bg-transparent text-[var(--color-ink-muted)] ring-1 ring-[var(--color-border)]"
};

export function Badge({
  children,
  variant = "default"
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

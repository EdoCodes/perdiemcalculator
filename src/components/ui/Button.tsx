import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "action" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/25 hover:bg-[var(--color-primary-hover)]",
  action:
    "bg-[var(--color-action)] text-[var(--color-action-fg)] shadow-md shadow-[var(--color-action)]/30 hover:bg-[var(--color-action-hover)] focus-visible:outline-[var(--color-action)]",
  secondary:
    "bg-[var(--color-surface-elevated)] text-[var(--color-ink)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface-muted)]",
  ghost: "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

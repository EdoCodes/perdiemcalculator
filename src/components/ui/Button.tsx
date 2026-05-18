import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "action" | "secondary" | "ghost";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] text-[var(--color-ink)] shadow-sm hover:border-[var(--color-accent)]",
  primary:
    "border border-[var(--color-accent)] bg-[var(--color-surface-elevated)] font-semibold text-[var(--color-ink)] shadow-sm hover:bg-[var(--color-accent-muted)]",
  action:
    "border border-[var(--color-accent)] bg-[var(--color-surface-elevated)] font-semibold text-[var(--color-ink)] shadow-sm hover:bg-[var(--color-accent-muted)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--color-ink-muted)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-ink)]"
};

const sizes: Record<Size, string> = {
  sm: "rounded-lg px-3 py-1.5 text-xs",
  md: "rounded-lg px-4 py-2.5 text-sm"
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

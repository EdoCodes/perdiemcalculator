import type { Profession } from "../../data/professions";
import { getProfessionById } from "../../data/professions";
import { ProfessionIcon, type ProfessionIconId } from "./ProfessionIcon";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { box: string; icon: string }> = {
  sm: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  md: { box: "h-12 w-12 rounded-xl", icon: "h-7 w-7" },
  lg: { box: "h-14 w-14 rounded-2xl", icon: "h-9 w-9" },
  xl: { box: "h-16 w-16 rounded-2xl", icon: "h-11 w-11" }
};

/** Circular app-badge sizing (airline crew & education). */
const circularSizeMap: Record<Size, { box: string; icon: string }> = {
  sm: { box: "h-10 w-10 rounded-full", icon: "h-[1.125rem] w-[1.125rem]" },
  md: { box: "h-12 w-12 rounded-full", icon: "h-7 w-7" },
  lg: { box: "h-14 w-14 rounded-full", icon: "h-8 w-8" },
  xl: { box: "h-16 w-16 rounded-full", icon: "h-10 w-10" }
};

const toneByProfession: Record<
  string,
  { bg: string; fg: string; ring?: string }
> = {
  "government-federal": {
    bg: "bg-[var(--color-primary-muted)]",
    fg: "text-[var(--color-primary)]",
    ring: "ring-[var(--color-primary)]/25"
  },
  "aviation-crew": {
    bg: "bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/35",
    fg: "text-white",
    ring: "ring-blue-400/50"
  },
  "education-teacher": {
    bg: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-900/30",
    fg: "text-white",
    ring: "ring-amber-400/45"
  },
  trucking: {
    bg: "bg-gradient-to-br from-emerald-600 to-slate-700 shadow-lg shadow-slate-900/30",
    fg: "text-white",
    ring: "ring-emerald-400/45"
  },
  "travel-nurse": {
    bg: "bg-gradient-to-br from-rose-500/20 to-pink-500/15",
    fg: "text-rose-300"
  },
  "field-sales": {
    bg: "bg-[var(--color-surface-muted)]",
    fg: "text-[var(--color-ink-muted)]"
  }
};

const defaultTone = {
  bg: "bg-[var(--color-surface-muted)]",
  fg: "text-[var(--color-ink-muted)]"
};

type Props = {
  professionId: ProfessionIconId;
  size?: Size;
  className?: string;
  /** Show subtle ring (cards, headers). */
  framed?: boolean;
  available?: boolean;
};

export function ProfessionLogo({
  professionId,
  size = "md",
  className = "",
  framed = true,
  available = true
}: Props) {
  const isCircularBadge =
    available &&
    (professionId === "aviation-crew" ||
      professionId === "education-teacher" ||
      professionId === "trucking");
  const dims = isCircularBadge ? circularSizeMap[size] : sizeMap[size];
  const tone = toneByProfession[professionId] ?? defaultTone;
  const muted = !available;

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center",
        dims.box,
        isCircularBadge ? "shadow-md" : "",
        muted ? "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]" : tone.bg,
        muted ? "" : tone.fg,
        framed && !muted ? `ring-2 ring-inset ${tone.ring ?? "ring-white/10"}` : "",
        className
      ].join(" ")}
      aria-hidden
    >
      <ProfessionIcon id={professionId} className={dims.icon} />
    </span>
  );
}

type PageBrandProps = {
  professionId: Profession["id"];
  title?: string;
  subtitle?: string;
};

/** Calculator page header: logo + title row. */
export function ProfessionPageBrand({ professionId, title, subtitle }: PageBrandProps) {
  const profession = getProfessionById(professionId);
  if (!profession) return null;

  return (
    <div className="flex items-start gap-4">
      <ProfessionLogo professionId={professionId} size="xl" available={profession.available} />
      <div className="min-w-0">
        {title ? (
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {title}
          </h1>
        ) : (
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {profession.name}
          </h1>
        )}
        <p className="mt-2 text-[var(--color-ink-muted)]">
          {subtitle ?? profession.description}
        </p>
      </div>
    </div>
  );
}

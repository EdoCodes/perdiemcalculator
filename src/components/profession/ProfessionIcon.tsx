import type { Profession } from "../../data/professions";

export type ProfessionIconId = Profession["id"] | (string & {});

type Props = {
  id: ProfessionIconId;
  className?: string;
};

/** Recognizable profession marks (airplane, school, capitol, etc.). */
export function ProfessionIcon({ id, className = "h-8 w-8" }: Props) {
  switch (id) {
    case "government-federal":
      return <GovernmentCapitolIcon className={className} />;
    case "aviation-crew":
      return <AirplaneIcon className={className} />;
    case "education-teacher":
      return <SchoolBuildingIcon className={className} />;
    case "trucking":
      return <SemiTruckIcon className={className} />;
    case "travel-nurse":
      return <HealthcareIcon className={className} />;
    case "field-sales":
      return <BriefcaseRouteIcon className={className} />;
    default:
      return <GenericTravelIcon className={className} />;
  }
}

/**
 * Angled jet silhouette (Material “flight” style) — matches common crew-app marks
 * like CrewPerDiem: solid plane, nose up-right, single path.
 */
function AirplaneIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8-2.5z" />
    </svg>
  );
}

function SchoolBuildingIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 6 6 16v22h36V16L24 6Z"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 6v32M6 16l18 10 18-10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="20" y="28" width="8" height="10" rx="1" fill="currentColor" fillOpacity={0.35} />
      <rect x="11" y="22" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="31" y="22" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M24 2v4M24 2l3 2M24 2l-3 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

function GovernmentCapitolIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M8 38h32M10 38V22l14-10 14 10v16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 12v8M18 20h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 38h36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="14"
        y="26"
        width="5"
        height="12"
        fill="currentColor"
        fillOpacity={0.2}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="21.5"
        y="22"
        width="5"
        height="16"
        fill="currentColor"
        fillOpacity={0.3}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="29"
        y="26"
        width="5"
        height="12"
        fill="currentColor"
        fillOpacity={0.2}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M24 4a4 4 0 0 1 0 8 4 4 0 0 1 0-8Z"
        fill="currentColor"
        fillOpacity={0.25}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SemiTruckIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="4"
        y="16"
        width="22"
        height="16"
        rx="2"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M26 20h12l6 6v6H26V20Z"
        fill="currentColor"
        fillOpacity={0.2}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="34" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="36" cy="34" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function HealthcareIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="10"
        y="8"
        width="28"
        height="32"
        rx="4"
        fill="currentColor"
        fillOpacity={0.12}
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M24 16v16M16 24h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M32 12c2 3 2 7 0 10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BriefcaseRouteIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="8"
        y="14"
        width="32"
        height="24"
        rx="3"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M8 22h32M18 14V10a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="38" r="2" fill="currentColor" />
      <circle cx="32" cy="38" r="2" fill="currentColor" />
      <path
        d="M30 8l4 4-4 4M34 12H22"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GenericTravelIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      <path
        d="M24 14v10l6 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

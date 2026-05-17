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

/** Angled jet with soft wing highlight (crew-app style). */
function AirplaneIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <g transform="translate(24 24) rotate(-12) translate(-12 -12)">
        <path
          fill="currentColor"
          fillOpacity={0.28}
          d="M22.2 16.4v-1.9l-7.6-4.7c-.7-.4-1.6.1-1.6.9v4.3l-7.6 4.7v1.9l7.6-2.4v4.7l-1.9 1.4v1.9l3.3-1 3.3 1v-1.6l-1.9-1.4v-4.3l7.6 2.4z"
        />
        <path
          fill="currentColor"
          d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8-2.5z"
        />
        <path fill="currentColor" fillOpacity={0.5} d="M14.5 11.2 19.8 9.6 21.5 11.8 18.8 13z" />
      </g>
    </svg>
  );
}

/** Schoolhouse with roof, bell tower, door, and windows. */
function SchoolBuildingIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 4v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        fill="currentColor"
        d="M22 7h4a1 1 0 0 1 1 1v3.2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
      />
      <path fill="currentColor" fillOpacity={0.35} d="M24 7.8 9 17.5V39h30V17.5L24 7.8Z" />
      <path fill="currentColor" d="M24 9 10 17.8V38h28V17.8L24 9Z" />
      <path fill="currentColor" fillOpacity={0.4} d="M24 9 10 17.8 24 24.2 38 17.8 24 9Z" />
      <path
        fill="currentColor"
        fillOpacity={0.55}
        d="M20 28h8a1.2 1.2 0 0 1 1.2 1.2V38H18.8V29.2A1.2 1.2 0 0 1 20 28Z"
      />
      <rect x="13" y="22" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity={0.35} />
      <rect x="29.5" y="22" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity={0.35} />
      <path
        d="M8 39h32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity={0.35}
      />
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

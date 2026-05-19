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

/** Top-down commercial jet (plan view, nose toward top-right). */
function AirplaneIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <g transform="rotate(45 24 24)">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M24 7.5c1.1 0 2 .9 2 2v7.35M24 16.85H7.75M24 16.85h16.5M7.75 19.75v4.5M40.25 19.75v4.5M24 24.25V33.75M19.25 33.75h9.5M24 33.75v6"
        />
        <circle cx="11.25" cy="21.25" r="1.9" fill="currentColor" stroke="none" />
        <circle cx="11.25" cy="25.75" r="1.9" fill="currentColor" stroke="none" />
        <circle cx="36.75" cy="21.25" r="1.9" fill="currentColor" stroke="none" />
        <circle cx="36.75" cy="25.75" r="1.9" fill="currentColor" stroke="none" />
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
        d="M6 39h36"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeOpacity={0.35}
      />
      <path
        fill="currentColor"
        fillOpacity={0.12}
        d="M9 39V24.5l15-11L39 24.5V39H9Z"
      />
      <path
        fill="currentColor"
        d="M11 39V25.2L24 15.5 37 25.2V39H11Z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.35}
        d="M24 15.5 11 25.2 24 31.8 37 25.2 24 15.5Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M24 8.5V14M21 11h6"
      />
      <ellipse cx="24" cy="8" rx="4.5" ry="3.2" fill="currentColor" fillOpacity={0.28} />
      <path
        fill="currentColor"
        d="M24 5.2a2.8 2.8 0 0 1 2.8 2.8v.2H21.2v-.2A2.8 2.8 0 0 1 24 5.2Z"
      />
      <rect x="14.5" y="28" width="4.5" height="11" rx="0.6" fill="currentColor" fillOpacity={0.45} />
      <rect x="21.75" y="24.5" width="4.5" height="14.5" rx="0.6" fill="currentColor" fillOpacity={0.65} />
      <rect x="29" y="28" width="4.5" height="11" rx="0.6" fill="currentColor" fillOpacity={0.45} />
      <path
        d="M17.5 28h13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity={0.4}
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

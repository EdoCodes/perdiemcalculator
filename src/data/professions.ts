export type ProfessionCategory = "government" | "aviation" | "education" | "field";

export type Profession = {
  id: string;
  name: string;
  shortName: string;
  category: ProfessionCategory;
  description: string;
  href: string;
  available: boolean;
  badges: string[];
  highlights: string[];
};

export const PROFESSION_CATEGORIES: {
  id: ProfessionCategory | "all";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "government", label: "Government" },
  { id: "aviation", label: "Aviation" },
  { id: "education", label: "Education" },
  { id: "field", label: "More soon" }
];

export const PROFESSIONS: Profession[] = [
  {
    id: "government-federal",
    name: "Federal government employee",
    shortName: "Federal employee",
    category: "government",
    description:
      "Civilian and military-adjacent travelers using GSA CONUS lodging and M&IE with FTR-style travel-day rules.",
    href: "/calculator/gsa/",
    available: true,
    badges: ["GSA rates", "FTR options"],
    highlights: ["ZIP & locality lookup", "Meal deductions", "State hubs"]
  },
  {
    id: "aviation-crew",
    name: "Airline pilot or cabin crew",
    shortName: "Airline crew",
    category: "aviation",
    description:
      "Contract pay, live GSA M&IE, trip log, calendar, free exports, and 8,800+ airports—built for airline crew.",
    href: "/calculator/crew/",
    available: true,
    badges: ["Free exports", "Live GSA"],
    highlights: [
      "8,800+ airport search",
      "Trip log & calendar",
      "CSV / AI import"
    ]
  },
  {
    id: "education-teacher",
    name: "Teacher or school staff",
    shortName: "Teacher",
    category: "education",
    description:
      "District or college travel for conferences, field trips, and PD—daily M&IE plus optional lodging from your school policy.",
    href: "/calculator/teacher/",
    available: true,
    badges: ["GSA + state rules", "M&IE + lodging"],
    highlights: ["ZIP destination lookup", "State caps (TX, NJ, …)", "Custom rates fallback"]
  },
  {
    id: "trucking",
    name: "Over-the-road truck driver",
    shortName: "Truck driver",
    category: "field",
    description:
      "IRS special transportation M&IE ($80 CONUS / $86 OCONUS), DOT 80% meal deduction estimate, and optional GSA compare.",
    href: "/calculator/trucking/",
    available: true,
    badges: ["IRS transport rates", "DOT 80%"],
    highlights: ["CONUS / OCONUS split", "Oct 1 rate updates", "GSA compare"]
  },
  {
    id: "travel-nurse",
    name: "Travel nurse or healthcare traveler",
    shortName: "Travel nurse",
    category: "field",
    description:
      "13-week assignments: GSA lodging and M&IE at the hospital city, optional 75% travel days, and weekly stipend compare.",
    href: "/calculator/nurse/",
    available: true,
    badges: ["GSA stipend compare", "Assignment dates"],
    highlights: ["Hospital ZIP lookup", "Weekly stipend vs GSA", "Travel-day toggle"]
  },
  {
    id: "field-sales",
    name: "Field sales representative",
    shortName: "Field sales",
    category: "field",
    description: "Company policy and IRS accountable-plan per diem.",
    href: "#",
    available: false,
    badges: ["Coming soon"],
    highlights: []
  }
];

export const STORAGE_KEY_PROFESSION = "perdiem-profession-id";

export function getProfessionById(id: string): Profession | undefined {
  return PROFESSIONS.find((p) => p.id === id);
}

export function getProfessionForPath(pathname: string): Profession | undefined {
  if (pathname.startsWith("/calculator/gsa")) return getProfessionById("government-federal");
  if (pathname.startsWith("/calculator/crew")) return getProfessionById("aviation-crew");
  if (pathname.startsWith("/calculator/teacher")) return getProfessionById("education-teacher");
  if (pathname.startsWith("/calculator/trucking")) return getProfessionById("trucking");
  if (pathname.startsWith("/calculator/nurse")) return getProfessionById("travel-nurse");
  return undefined;
}

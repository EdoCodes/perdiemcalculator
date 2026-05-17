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
      "Estimate trip per diem from your contract daily or hourly rates—domestic and international.",
    href: "/calculator/crew/",
    available: true,
    badges: ["Contract rates", "Trip planner"],
    highlights: ["Per day or per hour", "Domestic / intl", "Day-by-day breakdown"]
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
    description: "DOT and employer per diem for long-haul trips.",
    href: "#",
    available: false,
    badges: ["Coming soon"],
    highlights: []
  },
  {
    id: "travel-nurse",
    name: "Travel nurse or healthcare traveler",
    shortName: "Travel nurse",
    category: "field",
    description: "Agency stipends and tax-free per diem for assignment travel.",
    href: "#",
    available: false,
    badges: ["Coming soon"],
    highlights: []
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
  return undefined;
}

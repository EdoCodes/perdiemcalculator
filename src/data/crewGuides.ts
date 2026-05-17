export type CrewGuideMeta = {
  slug: string;
  title: string;
  description: string;
  shortLabel: string;
};

export const CREW_CALCULATOR_HREF = "/calculator/crew/";
export const CREW_GUIDES_INDEX = "/guides/crew/";

export const CREW_GUIDES: CrewGuideMeta[] = [
  {
    slug: "per-diem-tax-basics",
    title: "Airline crew per diem & GSA M&IE (tax basics)",
    description:
      "How airline pilots and flight attendants use GSA meals and incidental (M&IE) rates for layovers, what contract per diem is, and how a trip log helps at tax time.",
    shortLabel: "Crew per diem tax basics"
  },
  {
    slug: "75-percent-first-last-day",
    title: "75% rule for first and last travel days (airline crew)",
    description:
      "Why many crew use 75% of the daily GSA M&IE rate on the first and last day of a multi-day trip away from base, and how to apply it in a calculator.",
    shortLabel: "75% first & last day"
  },
  {
    slug: "multi-city-layovers",
    title: "Multi-city layovers: assigning per diem by day",
    description:
      "How to assign each calendar day of a trip to the correct layover city for GSA M&IE when you overnight in DFW, LAX, and other hubs on the same rotation.",
    shortLabel: "Multi-city layovers"
  },
  {
    slug: "contract-vs-gsa",
    title: "Contract per diem vs GSA M&IE for airline crew",
    description:
      "The difference between what your airline pays under your contract and the federal GSA M&IE allowance crews often use for tax worksheets—with a free compare tool.",
    shortLabel: "Contract vs GSA"
  }
];

export function crewGuideHref(slug: string): string {
  return `/guides/crew/${slug}/`;
}

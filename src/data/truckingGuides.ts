export const TRUCKING_CALCULATOR_HREF = "/calculator/trucking/";
export const TRUCKING_GUIDES_INDEX = "/guides/trucking/";

export type TruckingGuideMeta = {
  slug: string;
  title: string;
  description: string;
  shortLabel: string;
};

export const TRUCKING_GUIDES: TruckingGuideMeta[] = [
  {
    slug: "irs-transportation-rates",
    title: "IRS transportation industry per diem rates (truck drivers)",
    description:
      "How the federal $80 CONUS and $86 OCONUS M&IE rates for transportation workers differ from GSA per diem, and when OTR drivers can use them.",
    shortLabel: "IRS transport rates"
  },
  {
    slug: "dot-80-percent-meals",
    title: "DOT hours-of-service & 80% meal deduction for truckers",
    description:
      "Why many over-the-road drivers use an 80% meal deduction instead of 50%, and what substantiation you still need under Rev. Proc. 2019-48.",
    shortLabel: "DOT 80% meals"
  },
  {
    slug: "per-diem-vs-gsa",
    title: "Trucker per diem vs GSA federal rates",
    description:
      "When to use IRS special transportation M&IE versus GSA locality tables—and why our calculator shows both.",
    shortLabel: "Trucker vs GSA"
  }
];

export function truckingGuideHref(slug: string): string {
  return `/guides/trucking/${slug}/`;
}

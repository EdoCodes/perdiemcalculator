export const LOCUM_CALCULATOR_HREF = "/calculator/locum/";
export const LOCUM_GUIDES_INDEX = "/guides/locum/";

export type LocumGuideMeta = {
  slug: string;
  title: string;
  description: string;
  shortLabel: string;
};

export const LOCUM_GUIDES: LocumGuideMeta[] = [
  {
    slug: "stipends-vs-gsa",
    title: "Locum tenens stipends vs GSA per diem caps",
    description:
      "How locum housing and meal stipends are benchmarked against federal GSA lodging and M&IE for the practice city.",
    shortLabel: "Stipends vs GSA"
  },
  {
    slug: "tax-home-basics",
    title: "Tax home basics for locum physicians",
    description:
      "Temporary assignments, duplicate expenses, and when locum stipends may qualify for tax-free treatment.",
    shortLabel: "Tax home basics"
  }
];

export function locumGuideHref(slug: string): string {
  return `/guides/locum/${slug}/`;
}

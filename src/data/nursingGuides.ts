export const NURSING_CALCULATOR_HREF = "/calculator/nurse/";
export const NURSING_GUIDES_INDEX = "/guides/nursing/";

export type NursingGuideMeta = {
  slug: string;
  title: string;
  description: string;
  shortLabel: string;
};

export const NURSING_GUIDES: NursingGuideMeta[] = [
  {
    slug: "stipends-vs-gsa",
    title: "Travel nurse stipends vs GSA per diem caps",
    description:
      "Why agencies benchmark housing and meal stipends separately against federal GSA lodging and M&IE—and how to read over-cap amounts on your assignment.",
    shortLabel: "Stipends vs GSA"
  },
  {
    slug: "tax-home-basics",
    title: "Tax home basics for travel nurses and allied health travelers",
    description:
      "What a tax home means for temporary assignments, duplicate expenses, and when housing and meal stipends may qualify for tax-free treatment.",
    shortLabel: "Tax home basics"
  }
];

export function nursingGuideHref(slug: string): string {
  return `/guides/nursing/${slug}/`;
}

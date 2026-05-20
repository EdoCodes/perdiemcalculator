export const SALES_CALCULATOR_HREF = "/calculator/sales/";
export const SALES_GUIDES_INDEX = "/guides/sales/";

export type SalesGuideMeta = {
  slug: string;
  title: string;
  description: string;
  shortLabel: string;
};

export const SALES_GUIDES: SalesGuideMeta[] = [
  {
    slug: "accountable-plan-gsa",
    title: "Field sales accountable plans and GSA per diem",
    description:
      "How IRS accountable plans use GSA caps for overnight territory travel—and what happens when employer reimbursement exceeds federal limits.",
    shortLabel: "Accountable plan & GSA"
  },
  {
    slug: "territory-trip-basics",
    title: "Territory trip per diem basics for sales reps",
    description:
      "Multi-day customer visits, nightly lodging, daily M&IE, and what to document when your company pays per diem.",
    shortLabel: "Territory trips"
  }
];

export function salesGuideHref(slug: string): string {
  return `/guides/sales/${slug}/`;
}

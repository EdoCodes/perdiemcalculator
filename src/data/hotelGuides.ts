export const HOTEL_CALCULATOR_HREF = "/calculator/hotel/";
export const HOTEL_GUIDES_INDEX = "/guides/hotel/";

export type HotelGuideMeta = {
  slug: string;
  title: string;
  description: string;
  shortLabel: string;
};

export const HOTEL_GUIDES: HotelGuideMeta[] = [
  {
    slug: "corporate-travel-gsa",
    title: "Hotel management corporate travel and GSA per diem",
    description:
      "How GMs, area managers, and corporate hospitality staff use federal per diem benchmarks for openings, audits, and conferences.",
    shortLabel: "Corporate travel & GSA"
  },
  {
    slug: "multi-property-trips",
    title: "Multi-property and conference trip per diem basics",
    description:
      "Estimating lodging and M&IE for multi-day hotel industry travel and comparing company reimbursement to GSA caps.",
    shortLabel: "Multi-property trips"
  }
];

export function hotelGuideHref(slug: string): string {
  return `/guides/hotel/${slug}/`;
}

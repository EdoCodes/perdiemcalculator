export const POLICE_CALCULATOR_HREF = "/calculator/police/";
export const POLICE_GUIDES_INDEX = "/guides/police/";

export type PoliceGuideMeta = {
  slug: string;
  title: string;
  description: string;
  shortLabel: string;
};

export const POLICE_GUIDES: PoliceGuideMeta[] = [
  {
    slug: "gsa-vs-department-policy",
    title: "Police travel per diem: GSA rates vs department policy",
    description:
      "When law enforcement travelers use federal GSA CONUS caps versus local agency schedules for training, court, and deployment travel.",
    shortLabel: "GSA vs department policy"
  },
  {
    slug: "when-per-diem-applies",
    title: "When police officers receive per diem",
    description:
      "Training academies, out-of-town court, mutual aid, federal task forces, and other trips away from your duty station.",
    shortLabel: "When per diem applies"
  }
];

export function policeGuideHref(slug: string): string {
  return `/guides/police/${slug}/`;
}

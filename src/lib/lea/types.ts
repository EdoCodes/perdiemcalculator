export type SchoolDistrict = {
  id: string;
  name: string;
  city: string | null;
};

export type LeaManifest = {
  schoolYear: string;
  source: string;
  sourceUrl: string;
  generatedAt: string;
  states: Record<string, number>;
};

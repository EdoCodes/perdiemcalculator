/** Custom profession logos under /public/icons/professions/ */
export type ProfessionAsset = {
  src: string;
  /** Image already includes background/frame — render full tile, no badge fill. */
  fullTile?: boolean;
};

export const PROFESSION_ASSETS: Partial<Record<string, ProfessionAsset>> = {
  "government-federal": {
    src: "/icons/professions/federal.png",
    fullTile: true
  },
  "aviation-crew": {
    src: "/icons/professions/airplane.png",
    fullTile: true
  },
  "education-teacher": {
    src: "/icons/professions/teacher.png",
    fullTile: true
  },
  "travel-nurse": {
    src: "/icons/professions/nurse.png",
    fullTile: true
  }
};

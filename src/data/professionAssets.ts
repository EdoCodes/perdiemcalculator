/** Custom profession logos under /public/icons/professions/ */
export type ProfessionAsset = {
  src: string;
  /** Image already includes background/frame — render full tile, no badge fill. */
  fullTile?: boolean;
};

export const PROFESSION_ASSETS: Partial<Record<string, ProfessionAsset>> = {
  "aviation-crew": {
    src: "/icons/professions/airplane.png",
    fullTile: true
  }
};

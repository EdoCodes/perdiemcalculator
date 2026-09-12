import { US_STATES, type UsState } from "../../data/usStates";
import caCitiesFile from "../../data/places/ca-cities.json";
import {
  fetchLocalitiesByStateForBuild,
  fetchZipDidMapForBuild,
  type StateLocalitySummary,
  type ZipDidMapping
} from "../rates/buildTimeStateData";
import { buildCityPlacePages, type CityPlacePage } from "./cityPlaces";

export type NsaPageProps = {
  kind: "nsa";
  state: UsState;
  locality: StateLocalitySummary;
  fiscalYear: number;
  nearby: StateLocalitySummary[];
  standard: StateLocalitySummary | null;
};

export type CityPageProps = {
  kind: "city";
  state: UsState;
  locality: StateLocalitySummary;
  fiscalYear: number;
  nearby: StateLocalitySummary[];
  standard: StateLocalitySummary | null;
  place: CityPlacePage;
  nearbyCities: { name: string; slug: string }[];
};

export type LocalityPageProps = NsaPageProps | CityPageProps;

type CityFile = {
  places: { name: string; county: string; zip: string; state: string }[];
};

const CITY_FILES: Record<string, CityFile> = {
  CA: caCitiesFile as CityFile
};

function localityForDid(
  list: StateLocalitySummary[],
  did: string
): StateLocalitySummary | undefined {
  return list.find((l) => l.did === did) ?? list.find((l) => l.isStandard);
}

export async function buildLocalityStaticPaths(fiscalYear: number): Promise<
  { params: { abbr: string; locality: string }; props: LocalityPageProps }[]
> {
  const localitiesByState = await fetchLocalitiesByStateForBuild(fiscalYear);
  const zipDid = await fetchZipDidMapForBuild(fiscalYear);
  const paths: {
    params: { abbr: string; locality: string };
    props: LocalityPageProps;
  }[] = [];

  for (const state of US_STATES) {
    const list = localitiesByState.get(state.abbr) ?? [];
    const standard = list.find((l) => l.isStandard) ?? null;
    const nsas = list.filter((l) => !l.isStandard && l.slug);

    for (const loc of nsas) {
      paths.push({
        params: { abbr: state.abbr.toLowerCase(), locality: loc.slug as string },
        props: {
          kind: "nsa",
          state,
          locality: loc,
          fiscalYear,
          nearby: nsas.filter((n) => n.slug !== loc.slug).slice(0, 8),
          standard
        }
      });
    }

    appendCityPaths({
      state,
      list,
      nsas,
      standard,
      fiscalYear,
      zipDid,
      paths
    });
  }

  return paths;
}

export function cityPlacePagesForState(
  stateAbbr: string,
  list: StateLocalitySummary[],
  zipDid: Map<string, ZipDidMapping>
): CityPlacePage[] {
  const file = CITY_FILES[stateAbbr];
  if (!file?.places.length) return [];
  const reserved = new Set(
    list
      .filter((l) => !l.isStandard && l.slug)
      .map((n) => n.slug)
      .filter((s): s is string => Boolean(s))
  );
  return buildCityPlacePages(file.places, reserved, (zip) => {
    const mapped = zipDid.get(zip);
    return Boolean(mapped && mapped.state === stateAbbr);
  });
}

function appendCityPaths(opts: {
  state: UsState;
  list: StateLocalitySummary[];
  nsas: StateLocalitySummary[];
  standard: StateLocalitySummary | null;
  fiscalYear: number;
  zipDid: Map<string, ZipDidMapping>;
  paths: { params: { abbr: string; locality: string }; props: LocalityPageProps }[];
}): void {
  const file = CITY_FILES[opts.state.abbr];
  if (!file?.places.length) return;

  const pages = cityPlacePagesForState(opts.state.abbr, opts.list, opts.zipDid);

  const byCounty = new Map<string, CityPlacePage[]>();
  for (const page of pages) {
    const key = page.county.toLowerCase();
    const group = byCounty.get(key) ?? [];
    group.push(page);
    byCounty.set(key, group);
  }

  for (const place of pages) {
    const mapped = opts.zipDid.get(place.zip);
    if (!mapped) continue;
    const assigned = localityForDid(opts.list, mapped.did);
    if (!assigned) continue;

    const nearbyCities = (byCounty.get(place.county.toLowerCase()) ?? [])
      .filter((c) => c.slug !== place.slug)
      .slice(0, 8)
      .map((c) => ({ name: c.name, slug: c.slug }));

    opts.paths.push({
      params: { abbr: opts.state.abbr.toLowerCase(), locality: place.slug },
      props: {
        kind: "city",
        state: opts.state,
        locality: assigned,
        fiscalYear: opts.fiscalYear,
        nearby: opts.nsas.slice(0, 8),
        standard: opts.standard,
        place,
        nearbyCities
      }
    });
  }
}

export type CrewAirport = {
  code: string;
  city: string;
  /** US state/territory abbreviation; omitted for international layovers. */
  state?: string;
  country: string;
  region: "us" | "intl";
};

/** Offline fallback if JSON index fails to load. */
export const CREW_AIRPORTS_FALLBACK: CrewAirport[] = [
  { code: "ATL", city: "Atlanta", state: "GA", country: "USA", region: "us" },
  { code: "BOS", city: "Boston", state: "MA", country: "USA", region: "us" },
  { code: "ORD", city: "Chicago", state: "IL", country: "USA", region: "us" },
  { code: "DFW", city: "Dallas-Fort Worth", state: "TX", country: "USA", region: "us" },
  { code: "DEN", city: "Denver", state: "CO", country: "USA", region: "us" },
  { code: "DTW", city: "Detroit", state: "MI", country: "USA", region: "us" },
  { code: "LAX", city: "Los Angeles", state: "CA", country: "USA", region: "us" },
  { code: "MIA", city: "Miami", state: "FL", country: "USA", region: "us" },
  { code: "JFK", city: "New York", state: "NY", country: "USA", region: "us" },
  { code: "EWR", city: "Newark", state: "NJ", country: "USA", region: "us" },
  { code: "SFO", city: "San Francisco", state: "CA", country: "USA", region: "us" },
  { code: "SEA", city: "Seattle", state: "WA", country: "USA", region: "us" },
  { code: "LHR", city: "London", country: "UK", region: "intl" },
  { code: "CDG", city: "Paris", country: "France", region: "intl" },
  { code: "FRA", city: "Frankfurt", country: "Germany", region: "intl" }
];

/** Top US layover hubs for SEO landing pages (build-time GSA M&IE when Supabase is configured). */
export type CrewHubAirport = {
  code: string;
  city: string;
  state: string;
  /** Short unique blurb for the hub page intro. */
  intro: string;
};

export const CREW_HUB_AIRPORTS: CrewHubAirport[] = [
  {
    code: "ATL",
    city: "Atlanta",
    state: "GA",
    intro:
      "Hartsfield-Jackson is one of the busiest crew layover hubs in the U.S., with GSA M&IE tied to the Atlanta locality or Georgia standard CONUS rate depending on destination mapping."
  },
  {
    code: "ORD",
    city: "Chicago",
    state: "IL",
    intro:
      "O'Hare and Midway layovers typically map to the Chicago GSA locality—often higher M&IE than the Illinois standard rate."
  },
  {
    code: "DFW",
    city: "Dallas-Fort Worth",
    state: "TX",
    intro:
      "DFW layovers use Dallas-area GSA rates. Texas also publishes state travel rules for some public employees; airline contract pay is separate from GSA M&IE."
  },
  {
    code: "DEN",
    city: "Denver",
    state: "CO",
    intro:
      "Denver International layovers align with the Denver GSA destination for meals and incidental expenses on federal-style worksheets."
  },
  {
    code: "LAX",
    city: "Los Angeles",
    state: "CA",
    intro:
      "Los Angeles area layovers—including LAX—often use elevated California GSA localities with higher daily M&IE than standard CONUS."
  },
  {
    code: "PHX",
    city: "Phoenix",
    state: "AZ",
    intro:
      "Phoenix Sky Harbor layovers map to the Phoenix GSA locality for M&IE when building a tax-year trip log."
  },
  {
    code: "LAS",
    city: "Las Vegas",
    state: "NV",
    intro:
      "Las Vegas layovers use Nevada GSA localities; crew on multi-day trips still apply first/last-day 75% rules on qualifying itineraries."
  },
  {
    code: "MCO",
    city: "Orlando",
    state: "FL",
    intro:
      "Orlando International is a common leisure and connecting hub for cabin crew and pilots, with Florida GSA M&IE for worksheet planning."
  },
  {
    code: "SEA",
    city: "Seattle",
    state: "WA",
    intro:
      "Seattle-Tacoma layovers use the Seattle GSA locality, which is typically above the Washington standard CONUS rate."
  },
  {
    code: "SFO",
    city: "San Francisco",
    state: "CA",
    intro:
      "SFO layovers are among the higher CONUS M&IE destinations—important when comparing contract per diem pay to GSA allowances."
  },
  {
    code: "EWR",
    city: "Newark",
    state: "NJ",
    intro:
      "Newark layovers map to New York/Newark area GSA rates, often significantly higher than the New Jersey standard rate."
  },
  {
    code: "JFK",
    city: "New York",
    state: "NY",
    intro:
      "JFK and other NYC-area layovers use high-cost GSA localities—useful when logging multi-day trips that start or end in the Northeast."
  },
  {
    code: "IAH",
    city: "Houston",
    state: "TX",
    intro:
      "Houston Bush Intercontinental layovers use Houston-area GSA M&IE for federal-style per diem worksheets."
  },
  {
    code: "CLT",
    city: "Charlotte",
    state: "NC",
    intro:
      "Charlotte Douglas is a major connecting hub for regional and mainline crew, with North Carolina GSA localities for M&IE."
  },
  {
    code: "MIA",
    city: "Miami",
    state: "FL",
    intro:
      "Miami International layovers use South Florida GSA rates; international turns from MIA may need a separate daily M&IE entry."
  },
  {
    code: "BOS",
    city: "Boston",
    state: "MA",
    intro:
      "Boston Logan layovers map to the Boston GSA locality, typically above the Massachusetts standard CONUS rate."
  },
  {
    code: "MSP",
    city: "Minneapolis",
    state: "MN",
    intro:
      "Minneapolis-Saint Paul layovers use the Minneapolis GSA destination for daily M&IE on crew trip logs."
  },
  {
    code: "DTW",
    city: "Detroit",
    state: "MI",
    intro:
      "Detroit Metro layovers align with Detroit-area GSA M&IE caps for meals and incidental expenses."
  },
  {
    code: "PHL",
    city: "Philadelphia",
    state: "PA",
    intro:
      "Philadelphia International layovers use Philadelphia GSA localities for worksheet and trip-log planning."
  },
  {
    code: "DCA",
    city: "Washington",
    state: "DC",
    intro:
      "Reagan National and the DC metro area use high-cost GSA rates—common for east-coast trip chains and multi-city assignments."
  }
];

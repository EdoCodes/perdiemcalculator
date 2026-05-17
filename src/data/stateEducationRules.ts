/**
 * Curated state education / school travel reimbursement overlays.
 * Destination lodging & M&IE typically follow GSA; states add caps and day-trip rules.
 */
export type StateEducationRule = {
  state: string;
  name: string;
  usesGsaDestination: boolean;
  sourceUrl: string;
  sourceLabel: string;
  mieCap: number | null;
  lodgingCap: number | null;
  dayTripMie: number | null;
  travelDayFraction: number;
  partialTravelDays: boolean;
  notes?: string;
};

type RuleOverrides = Partial<
  Pick<
    StateEducationRule,
    | "mieCap"
    | "lodgingCap"
    | "dayTripMie"
    | "travelDayFraction"
    | "partialTravelDays"
    | "notes"
    | "sourceUrl"
    | "sourceLabel"
  >
>;

function gsaState(
  abbr: string,
  name: string,
  sourceUrl: string,
  sourceLabel: string,
  overrides: RuleOverrides = {}
): StateEducationRule {
  return {
    state: abbr,
    name,
    usesGsaDestination: true,
    sourceUrl,
    sourceLabel,
    mieCap: null,
    lodgingCap: null,
    dayTripMie: null,
    travelDayFraction: 0.75,
    partialTravelDays: true,
    notes: overrides.notes ?? "Many districts use federal CONUS rates for out-of-town travel.",
    ...overrides
  };
}

const DEFAULT_RULE: StateEducationRule = {
  state: "_default",
  name: "Default (GSA destination rates)",
  usesGsaDestination: true,
  sourceUrl: "https://www.gsa.gov/travel/plan-book/per-diem-rates",
  sourceLabel: "GSA per diem rates",
  mieCap: null,
  lodgingCap: null,
  dayTripMie: null,
  travelDayFraction: 0.75,
  partialTravelDays: true,
  notes: "Many districts adopt federal CONUS rates. Confirm with your district business office."
};

/** States with published education-agency travel guidance (caps where known). */
const CURATED: StateEducationRule[] = [
  gsaState("AL", "Alabama", "https://www.alsde.edu/", "Alabama State Department of Education"),
  gsaState("AK", "Alaska", "https://education.alaska.gov/", "Alaska Department of Education"),
  gsaState("AZ", "Arizona", "https://www.azed.gov/", "Arizona Department of Education"),
  gsaState("AR", "Arkansas", "https://dese.ade.arkansas.gov/", "Arkansas Division of Elementary and Secondary Education"),
  {
    ...gsaState(
      "CA",
      "California",
      "https://benefits.calhr.ca.gov/state-employees/work-resources/travel-reimbursements-2/",
      "CalHR (state employee travel)"
    ),
    mieCap: 68,
    notes: "K–12 districts vary; many align with GSA. State employees use CalHR caps (~$68 full day)."
  },
  gsaState("CO", "Colorado", "https://www.cde.state.co.us/", "Colorado Department of Education"),
  gsaState("CT", "Connecticut", "https://portal.ct.gov/sde", "Connecticut State Department of Education"),
  gsaState("DE", "Delaware", "https://education.delaware.gov/", "Delaware Department of Education"),
  gsaState("DC", "District of Columbia", "https://osse.dc.gov/", "DC Office of the State Superintendent"),
  gsaState("FL", "Florida", "https://www.fldoe.org/", "Florida Department of Education", {
    notes: "District policies often reference federal rates for out-of-county travel."
  }),
  gsaState("GA", "Georgia", "https://www.gadoe.org/", "Georgia Department of Education"),
  gsaState("HI", "Hawaii", "https://www.hawaiipublicschools.org/", "Hawaii State Department of Education"),
  gsaState("ID", "Idaho", "https://www.sde.idaho.gov/", "Idaho State Department of Education"),
  gsaState("IL", "Illinois", "https://www.isbe.net/", "Illinois State Board of Education"),
  gsaState("IN", "Indiana", "https://www.in.gov/doe/", "Indiana Department of Education"),
  gsaState("IA", "Iowa", "https://educateiowa.gov/", "Iowa Department of Education"),
  gsaState("KS", "Kansas", "https://www.ksde.org/", "Kansas State Department of Education"),
  gsaState("KY", "Kentucky", "https://www.education.ky.gov/", "Kentucky Department of Education"),
  gsaState("LA", "Louisiana", "https://www.louisianabelieves.com/", "Louisiana Department of Education"),
  gsaState("ME", "Maine", "https://www.maine.gov/doe", "Maine Department of Education"),
  gsaState("MD", "Maryland", "https://marylandpublicschools.org/", "Maryland State Department of Education"),
  gsaState("MA", "Massachusetts", "https://www.doe.mass.edu/", "Massachusetts Department of Elementary and Secondary Education"),
  gsaState("MI", "Michigan", "https://www.michigan.gov/mde", "Michigan Department of Education"),
  gsaState("MN", "Minnesota", "https://education.mn.gov/", "Minnesota Department of Education"),
  gsaState("MS", "Mississippi", "https://www.mdek12.org/", "Mississippi Department of Education"),
  gsaState("MO", "Missouri", "https://dese.mo.gov/", "Missouri Department of Elementary and Secondary Education"),
  gsaState("MT", "Montana", "https://opi.mt.gov/", "Montana Office of Public Instruction"),
  gsaState("NE", "Nebraska", "https://www.education.ne.gov/", "Nebraska Department of Education"),
  gsaState("NV", "Nevada", "https://doe.nv.gov/", "Nevada Department of Education"),
  gsaState("NH", "New Hampshire", "https://www.education.nh.gov/", "New Hampshire Department of Education"),
  gsaState("NJ", "New Jersey", "https://www.nj.gov/education/", "NJ Department of Education", {
    mieCap: 46,
    lodgingCap: 83,
    sourceUrl:
      "https://www.nj.gov/education/finance/fp/psd/audit/1415/AppendixEGuidance.pdf",
    sourceLabel: "NJ Department of Education audit guidance",
    notes: "When destination is not listed in the Federal Register, Appendix E caps apply."
  }),
  gsaState("NM", "New Mexico", "https://webnew.ped.state.nm.us/", "New Mexico Public Education Department"),
  gsaState("NY", "New York", "https://www.nysed.gov/", "NY State Education Department", {
    sourceUrl:
      "https://osc.ny.gov/state-agencies/gfo/chapter-xiii/xiii4d-meals-and-incidental-expenses-breakdown",
    sourceLabel: "NY State Comptroller (OSC)",
    notes: "Many NY schools follow GSA or OSC schedules; check your BOCES or district."
  }),
  gsaState("NC", "North Carolina", "https://www.dpi.nc.gov/", "NC Department of Public Instruction"),
  gsaState("ND", "North Dakota", "https://www.nd.gov/dpi/", "North Dakota Department of Public Instruction"),
  gsaState("OH", "Ohio", "https://education.ohio.gov/", "Ohio Department of Education"),
  gsaState("OK", "Oklahoma", "https://sde.ok.gov/", "Oklahoma State Department of Education"),
  gsaState("OR", "Oregon", "https://www.oregon.gov/ode/", "Oregon Department of Education"),
  gsaState("PA", "Pennsylvania", "https://www.education.pa.gov/", "Pennsylvania Department of Education"),
  gsaState("RI", "Rhode Island", "https://ride.ri.gov/", "Rhode Island Department of Education"),
  gsaState("SC", "South Carolina", "https://ed.sc.gov/", "South Carolina Department of Education"),
  gsaState("SD", "South Dakota", "https://doe.sd.gov/", "South Dakota Department of Education"),
  gsaState("TN", "Tennessee", "https://www.tn.gov/education/", "Tennessee Department of Education"),
  {
    ...gsaState(
      "TX",
      "Texas",
      "https://tea.texas.gov/about-tea/news-and-multimedia/correspondence/taa-letters/state-fiscal-year-2026-travel-reimbursement-rates",
      "Texas Education Agency (TEA)"
    ),
    mieCap: 68,
    lodgingCap: 110,
    dayTripMie: 36,
    notes: "TEA grant travel: federal per diem map for overnight; $36 meals on non-overnight days."
  },
  gsaState("UT", "Utah", "https://www.schools.utah.gov/", "Utah State Board of Education"),
  gsaState("VT", "Vermont", "https://education.vermont.gov/", "Vermont Agency of Education"),
  gsaState("VA", "Virginia", "https://www.doe.virginia.gov/", "Virginia Department of Education"),
  gsaState("WA", "Washington", "https://ospi.k12.wa.us/", "Washington Office of Superintendent of Public Instruction"),
  gsaState("WV", "West Virginia", "https://wvde.us/", "West Virginia Department of Education"),
  gsaState("WI", "Wisconsin", "https://dpi.wi.gov/", "Wisconsin Department of Public Instruction"),
  gsaState("WY", "Wyoming", "https://edu.wyoming.gov/", "Wyoming Department of Education")
];

export const STATE_EDUCATION_RULES: Record<string, StateEducationRule> = {
  _default: DEFAULT_RULE,
  ...Object.fromEntries(CURATED.map((r) => [r.state, r]))
};

export function getStateEducationRule(stateAbbr: string): StateEducationRule {
  const key = stateAbbr.toUpperCase();
  return (
    STATE_EDUCATION_RULES[key] ?? {
      ...DEFAULT_RULE,
      state: key,
      name: key
    }
  );
}

export const STATES_WITH_CURATED_RULES = CURATED.map((r) => r.state);

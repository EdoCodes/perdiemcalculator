import type { CrewAirport } from "../../data/crewAirports";
import type { CrewRateMode, CrewTripType } from "./calculate";
import type { CrewGsaDayBreakdown } from "./calculateGsa";

export type CrewCalcMode = "contract" | "gsa" | "both";

export type CrewRole = "pilot" | "cabin" | "other";

/** One layover city segment (arrival through departure, inclusive). */
export type CrewLayoverLeg = {
  id: string;
  sequence: number;
  airportCode: string;
  city: string;
  state?: string;
  country: string;
  region: "us" | "intl";
  arrivalDate: string;
  departureDate: string;
  gsaDid?: string;
  gsaState?: string;
  gsaLocalityLabel?: string;
  intlMieRate?: number;
};

export type CrewContractOptions = {
  rateMode: CrewRateMode;
  tripType: CrewTripType;
  domesticRate: number;
  internationalRate: number;
  partialTravelDays: boolean;
  startTime: string;
  endTime: string;
};

export type CrewDaySegment = {
  date: string;
  airportCode: string;
  city: string;
  legId: string;
  contractAmount: number;
  gsaAmount: number;
  contractMultiplier: number;
  gsaMultiplier: number;
  isTravelDay: boolean;
};

export type CrewSavedTrip = {
  id: string;
  label: string;
  role: CrewRole;
  calcMode: CrewCalcMode;
  tripStart: string;
  tripEnd: string;
  legs: CrewLayoverLeg[];
  contract?: CrewContractOptions;
  contractTotal: number;
  gsaTotal: number;
  daySegments: CrewDaySegment[];
  createdAt: string;
  updatedAt: string;
};

export type CrewCalculationInput = {
  calcMode: CrewCalcMode;
  tripStart: string;
  tripEnd: string;
  legs: CrewLayoverLeg[];
  contract?: CrewContractOptions;
  /** Resolved M&IE daily rate per leg id and fiscal year. */
  gsaMieByLegFy: Map<string, Map<number, number>>;
};

export type CrewCalculationResult = {
  contractTotal: number;
  gsaTotal: number;
  daySegments: CrewDaySegment[];
  enrichedLegs?: CrewLayoverLeg[];
  contractDays?: import("./calculate").CrewDayBreakdown[];
  gsaDays?: CrewGsaDayBreakdown[];
};

export function legFromAirport(
  airport: CrewAirport,
  arrivalDate: string,
  departureDate: string,
  sequence: number
): CrewLayoverLeg {
  return {
    id: crypto.randomUUID(),
    sequence,
    airportCode: airport.code,
    city: airport.city,
    state: airport.state,
    country: airport.country,
    region: airport.region,
    arrivalDate,
    departureDate
  };
}

export function newLegId(): string {
  return crypto.randomUUID();
}

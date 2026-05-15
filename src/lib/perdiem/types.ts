export type TravelDayPolicy = "full-mie" | "75-percent-mie" | "pro-rate-incidentals";

export type MealDeductionMode = "full-on-travel-days" | "pro-rate-incidentals-on-travel-days";

export type ProvidedMeals = {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

export type CalculatorOptions = {
  travelDayPolicy: TravelDayPolicy;
  mealDeductionMode: MealDeductionMode;
  showLodgingAt150Percent: boolean;
};

export type DayBreakdown = {
  date: string;
  fiscalYear: number;
  isFirstDay: boolean;
  isLastDay: boolean;
  isTravelDay: boolean;
  lodging: number;
  lodging150: number;
  mieTotal: number;
  mieAfterTravelAdjustment: number;
  mealDeduction: number;
  mieNet: number;
  dailyTotal: number;
  providedMeals: ProvidedMeals;
};

export type TripResult = {
  days: DayBreakdown[];
  totalLodging: number;
  totalMie: number;
  grandTotal: number;
  nightCount: number;
  dayCount: number;
};

export type LocalityRate = {
  id: string;
  did: string;
  state: string;
  city: string;
  county: string | null;
  isStandard: boolean;
  fiscalYear: number;
  mieTotal: number;
  lodgingByMonth: Record<number, number>;
};

import { AssignmentPerDiemCalculator } from "./AssignmentPerDiemCalculator";
import { HOTEL_ASSIGNMENT_CONFIG } from "./assignmentCalculatorConfig";

export function HotelPerDiemCalculator() {
  return <AssignmentPerDiemCalculator config={HOTEL_ASSIGNMENT_CONFIG} />;
}

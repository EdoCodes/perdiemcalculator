import { AssignmentPerDiemCalculator } from "./AssignmentPerDiemCalculator";
import { SALES_ASSIGNMENT_CONFIG } from "./assignmentCalculatorConfig";

export function SalesPerDiemCalculator() {
  return <AssignmentPerDiemCalculator config={SALES_ASSIGNMENT_CONFIG} />;
}

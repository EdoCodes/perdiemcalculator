import { AssignmentPerDiemCalculator } from "./AssignmentPerDiemCalculator";
import { LOCUM_ASSIGNMENT_CONFIG } from "./assignmentCalculatorConfig";

export function LocumPerDiemCalculator() {
  return <AssignmentPerDiemCalculator config={LOCUM_ASSIGNMENT_CONFIG} />;
}

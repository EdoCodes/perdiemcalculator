import { AssignmentPerDiemCalculator } from "./AssignmentPerDiemCalculator";
import { NURSE_ASSIGNMENT_CONFIG } from "./assignmentCalculatorConfig";

export function NursePerDiemCalculator() {
  return <AssignmentPerDiemCalculator config={NURSE_ASSIGNMENT_CONFIG} />;
}

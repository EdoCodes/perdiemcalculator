import { AssignmentPerDiemCalculator } from "./AssignmentPerDiemCalculator";
import { POLICE_ASSIGNMENT_CONFIG } from "./assignmentCalculatorConfig";

export function PolicePerDiemCalculator() {
  return <AssignmentPerDiemCalculator config={POLICE_ASSIGNMENT_CONFIG} />;
}

import type { ReactNode } from "react";

export type AssignmentCompareMode = "weekly" | "daily";

export type AssignmentCalculatorConfig = {
  storageProfessionId: string;
  primaryBadge: string;
  intro: ReactNode;
  zipLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  travelDayHelp: ReactNode;
  compareMode: AssignmentCompareMode;
  compareSectionTitle: string;
  compareHousingLabel: string;
  compareMealsLabel: string;
  compareHousingPlaceholder: string;
  compareMealsPlaceholder: string;
  compareCardTitle: string;
  housingCompareHeading: string;
  mealsCompareHeading: string;
  employerHousingRowLabel: string;
  employerMealsRowLabel: string;
  compareGuideHref: string;
  compareGuideText: string;
  compareFooterNote: ReactNode;
  guidesHref: string;
  guidesLinkText: string;
  calculateLabel: string;
  overCapMessage: string;
};

export const NURSE_ASSIGNMENT_CONFIG: AssignmentCalculatorConfig = {
  storageProfessionId: "travel-nurse",
  primaryBadge: "Travel nurse & allied health",
  intro: (
    <>
      Estimate <strong className="text-[var(--color-ink)]">GSA lodging and M&amp;IE</strong> for your
      assignment city—useful when comparing agency housing and meal stipends to federal per-diem caps.
      Tax-free treatment depends on your tax home, assignment length, and substantiation; verify with
      your agency and tax preparer.
    </>
  ),
  zipLabel: "Assignment ZIP (hospital area)",
  startDateLabel: "Assignment start",
  endDateLabel: "Assignment end",
  travelDayHelp: (
    <>
      Most travel-nurse stipend benchmarks use{" "}
      <strong className="text-[var(--color-ink)]">full daily M&amp;IE</strong>. Choose 75% on first and
      last days only if your agency or tax preparer follows federal travel-day rules.
    </>
  ),
  compareMode: "weekly",
  compareSectionTitle: "Agency stipends (optional — for comparison)",
  compareHousingLabel: "Weekly housing stipend ($)",
  compareMealsLabel: "Weekly meals / incidentals ($)",
  compareHousingPlaceholder: "e.g. 1200",
  compareMealsPlaceholder: "e.g. 450",
  compareCardTitle: "Agency stipend comparison",
  housingCompareHeading: "Housing stipend vs GSA lodging",
  mealsCompareHeading: "Meals stipend vs GSA M&IE",
  employerHousingRowLabel: "Agency housing (est.)",
  employerMealsRowLabel: "Agency meals (est.)",
  compareGuideHref: "/guides/nursing/stipends-vs-gsa/",
  compareGuideText: "Stipends vs GSA guide",
  compareFooterNote: (
    <>
      Compare each stipend to its own federal cap—housing to lodging, meals to M&amp;IE. Amounts over a
      cap may be taxable when other rules are met.
    </>
  ),
  guidesHref: "/guides/nursing/",
  guidesLinkText: "Nurse guides",
  calculateLabel: "Calculate assignment per diem",
  overCapMessage: "Over GSA cap by {amount} — may be taxable"
};

export const LOCUM_ASSIGNMENT_CONFIG: AssignmentCalculatorConfig = {
  storageProfessionId: "locum-tenens",
  primaryBadge: "Locum tenens",
  intro: (
    <>
      Estimate <strong className="text-[var(--color-ink)]">GSA lodging and M&amp;IE</strong> for your
      locum assignment—compare agency or staffing-company housing and meal stipends to federal caps.
      Rules mirror travel nursing; confirm tax home and contract terms with your recruiter and preparer.
    </>
  ),
  zipLabel: "Facility ZIP (practice location)",
  startDateLabel: "Assignment start",
  endDateLabel: "Assignment end",
  travelDayHelp: (
    <>
      Most locum stipend benchmarks use <strong className="text-[var(--color-ink)]">full daily M&amp;IE</strong>.
      Use 75% travel days only if your agency follows federal first/last-day conventions.
    </>
  ),
  compareMode: "weekly",
  compareSectionTitle: "Agency stipends (optional — for comparison)",
  compareHousingLabel: "Weekly housing stipend ($)",
  compareMealsLabel: "Weekly meals / incidentals ($)",
  compareHousingPlaceholder: "e.g. 2500",
  compareMealsPlaceholder: "e.g. 500",
  compareCardTitle: "Locum stipend comparison",
  housingCompareHeading: "Housing stipend vs GSA lodging",
  mealsCompareHeading: "Meals stipend vs GSA M&IE",
  employerHousingRowLabel: "Agency housing (est.)",
  employerMealsRowLabel: "Agency meals (est.)",
  compareGuideHref: "/guides/locum/stipends-vs-gsa/",
  compareGuideText: "Locum stipends vs GSA",
  compareFooterNote: (
    <>
      Housing and meals are capped separately under typical locum tax planning—amounts over GSA may be
      taxable when other tests are met.
    </>
  ),
  guidesHref: "/guides/locum/",
  guidesLinkText: "Locum guides",
  calculateLabel: "Calculate locum assignment per diem",
  overCapMessage: "Over GSA cap by {amount} — may be taxable"
};

export const SALES_ASSIGNMENT_CONFIG: AssignmentCalculatorConfig = {
  storageProfessionId: "field-sales",
  primaryBadge: "Field sales",
  intro: (
    <>
      Estimate <strong className="text-[var(--color-ink)]">GSA per diem</strong> for territory trips—then
      compare your employer&apos;s accountable-plan reimbursement (lodging per night and M&amp;IE per day) to
      federal caps. Amounts above GSA may be taxable wages.
    </>
  ),
  zipLabel: "Destination ZIP (customer / territory)",
  startDateLabel: "Trip start",
  endDateLabel: "Trip end",
  travelDayHelp: (
    <>
      Many sales policies use <strong className="text-[var(--color-ink)]">full GSA M&amp;IE</strong> as the
      accountable-plan limit. Use 75% first/last days only if your company mirrors federal travel-day rules.
    </>
  ),
  compareMode: "daily",
  compareSectionTitle: "Employer per diem (optional — accountable plan compare)",
  compareHousingLabel: "Nightly lodging reimbursement ($)",
  compareMealsLabel: "Daily M&IE reimbursement ($)",
  compareHousingPlaceholder: "e.g. 180",
  compareMealsPlaceholder: "e.g. 68",
  compareCardTitle: "Employer reimbursement vs GSA",
  housingCompareHeading: "Lodging reimbursement vs GSA lodging",
  mealsCompareHeading: "M&IE reimbursement vs GSA M&IE",
  employerHousingRowLabel: "Employer lodging (est.)",
  employerMealsRowLabel: "Employer M&IE (est.)",
  compareGuideHref: "/guides/sales/accountable-plan-gsa/",
  compareGuideText: "Accountable plan & GSA guide",
  compareFooterNote: (
    <>
      Under a typical accountable plan, reimbursement up to GSA is excludable; excess may be wages on your
      W-2. Your company policy controls what you actually receive.
    </>
  ),
  guidesHref: "/guides/sales/",
  guidesLinkText: "Sales guides",
  calculateLabel: "Calculate trip per diem",
  overCapMessage: "Over GSA cap by {amount} — excess may be taxable wages"
};

export const POLICE_ASSIGNMENT_CONFIG: AssignmentCalculatorConfig = {
  storageProfessionId: "police-officer",
  primaryBadge: "Law enforcement travel",
  intro: (
    <>
      Estimate <strong className="text-[var(--color-ink)]">GSA per diem</strong> for out-of-town{" "}
      training, court, mutual aid, or deployment travel—then compare your department&apos;s nightly lodging
      and daily M&amp;IE rates to federal CONUS caps.
    </>
  ),
  zipLabel: "Destination ZIP (training, court, or assignment)",
  startDateLabel: "Travel start",
  endDateLabel: "Travel end",
  travelDayHelp: (
    <>
      Many agencies use <strong className="text-[var(--color-ink)]">full GSA M&amp;IE</strong> as a benchmark.
      Use 75% first/last days only if your department or state policy follows federal travel-day rules.
    </>
  ),
  compareMode: "daily",
  compareSectionTitle: "Department per diem (optional — policy compare)",
  compareHousingLabel: "Nightly lodging rate ($)",
  compareMealsLabel: "Daily M&IE rate ($)",
  compareHousingPlaceholder: "e.g. 150",
  compareMealsPlaceholder: "e.g. 59",
  compareCardTitle: "Department reimbursement vs GSA",
  housingCompareHeading: "Lodging vs GSA lodging cap",
  mealsCompareHeading: "M&IE vs GSA M&IE cap",
  employerHousingRowLabel: "Department lodging (est.)",
  employerMealsRowLabel: "Department M&IE (est.)",
  compareGuideHref: "/guides/police/gsa-vs-department-policy/",
  compareGuideText: "GSA vs department policy",
  compareFooterNote: (
    <>
      Policies vary by agency and state. Amounts above GSA may be taxable or require receipts—confirm with
      your department and union contract.
    </>
  ),
  guidesHref: "/guides/police/",
  guidesLinkText: "Police guides",
  calculateLabel: "Calculate travel per diem",
  overCapMessage: "Over GSA cap by {amount} — verify with department policy"
};

export const HOTEL_ASSIGNMENT_CONFIG: AssignmentCalculatorConfig = {
  storageProfessionId: "hotel-manager",
  primaryBadge: "Hotel management travel",
  intro: (
    <>
      Estimate <strong className="text-[var(--color-ink)]">GSA per diem</strong> for corporate trips—property
      openings, audits, brand conferences—then compare company nightly lodging and daily M&amp;IE to federal
      caps.
    </>
  ),
  zipLabel: "Destination ZIP (property or meeting city)",
  startDateLabel: "Trip start",
  endDateLabel: "Trip end",
  travelDayHelp: (
    <>
      Hospitality corporate policies often mirror <strong className="text-[var(--color-ink)]">full GSA M&amp;IE</strong>.
      Use 75% travel days only if your employer follows federal first/last-day conventions.
    </>
  ),
  compareMode: "daily",
  compareSectionTitle: "Company per diem (optional — policy compare)",
  compareHousingLabel: "Nightly lodging reimbursement ($)",
  compareMealsLabel: "Daily M&IE reimbursement ($)",
  compareHousingPlaceholder: "e.g. 175",
  compareMealsPlaceholder: "e.g. 64",
  compareCardTitle: "Company reimbursement vs GSA",
  housingCompareHeading: "Lodging reimbursement vs GSA lodging",
  mealsCompareHeading: "M&IE reimbursement vs GSA M&IE",
  employerHousingRowLabel: "Company lodging (est.)",
  employerMealsRowLabel: "Company M&IE (est.)",
  compareGuideHref: "/guides/hotel/corporate-travel-gsa/",
  compareGuideText: "Corporate travel & GSA guide",
  compareFooterNote: (
    <>
      Hotel brands and management companies set their own travel policies. Reimbursement above GSA may be
      taxable under accountable-plan rules.
    </>
  ),
  guidesHref: "/guides/hotel/",
  guidesLinkText: "Hotel guides",
  calculateLabel: "Calculate trip per diem",
  overCapMessage: "Over GSA cap by {amount} — excess may be taxable wages"
};

export const GSA_STANDARD_FY = 2026;
export const GSA_STANDARD_LODGING = 110;
export const GSA_STANDARD_MIE = 68;

export const GSA_CALCULATOR_FAQS: { q: string; a: string }[] = [
  {
    q: `What is the GSA per diem rate for FY${GSA_STANDARD_FY}?`,
    a: `For most CONUS locations the standard rate is $${GSA_STANDARD_LODGING} lodging plus $${GSA_STANDARD_MIE} M&IE ($${GSA_STANDARD_LODGING + GSA_STANDARD_MIE} per full day). About 300 higher-cost localities have their own lodging caps and M&IE tiers.`
  },
  {
    q: "How does the 75% first and last day rule work?",
    a: "On the first and last calendar day of a trip, GSA reimburses 75% of the daily M&IE rate. Lodging is never prorated. A three-night trip is four travel days: two at 75% M&IE and two at 100%."
  },
  {
    q: "What if my city is not on the GSA list?",
    a: "Use the standard CONUS rate for that state. GSA publishes localities (usually a key city plus county), not every town. Enter a ZIP in the calculator to map to the correct destination."
  },
  {
    q: "Is this an official GSA website?",
    a: "No. PerDiemCalculator is an independent planning tool that uses published GSA CONUS tables. Verify amounts with your agency and the Federal Travel Regulation."
  }
];

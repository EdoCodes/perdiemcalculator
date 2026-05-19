import type { BlogBlock } from "./blogTypes";
import { PER_DIEM_VS_RECEIPTS_BLOCKS } from "./blog/per-diem-vs-itemized-receipts";

export type { BlogBlock } from "./blogTypes";

export const BLOG_CONTENT: Record<string, BlogBlock[]> = {
  "per-diem-vs-itemized-receipts": PER_DIEM_VS_RECEIPTS_BLOCKS,
  "what-is-per-diem": [
    {
      type: "p",
      text: "Per diem (Latin for “per day”) is a daily allowance for meals and incidental expenses when you travel away from home for work. Instead of saving every receipt, many travelers use federal rate tables or employer policies to estimate a reasonable daily amount."
    },
    {
      type: "h2",
      text: "Who sets the rates?"
    },
    {
      type: "ul",
      items: [
        "Federal employees and many contractors reference GSA CONUS per diem (lodging + M&IE by city).",
        "Airline crew often track GSA M&IE by layover city for tax worksheets while contract pay is separate income.",
        "Over-the-road truckers who qualify typically use IRS special transportation industry M&IE amounts—not GSA locality tables.",
        "Teachers and school staff may use GSA destination rates plus state or district caps."
      ]
    },
    {
      type: "h2",
      text: "Per diem is not automatic income"
    },
    {
      type: "p",
      text: "Employer reimbursements may be tax-free under an accountable plan; per diem used on a tax return still requires you to be away from your tax home and to substantiate time, place, and business purpose. Our calculators are planning tools—verify rules with your agency, employer, or tax preparer."
    },
    {
      type: "h2",
      text: "Try a calculator"
    },
    {
      type: "ul",
      items: [
        "Federal GSA — /calculator/gsa/",
        "Airline crew — /calculator/crew/",
        "Teachers — /calculator/teacher/",
        "Truck drivers — /calculator/trucking/"
      ]
    }
  ],
  "choose-the-right-calculator": [
    {
      type: "p",
      text: "PerDiemCalculator.com hosts profession-specific tools because “per diem” means different things on your paycheck, your tax worksheet, and your employer’s policy."
    },
    {
      type: "h2",
      text: "Federal government travelers"
    },
    {
      type: "p",
      text: "Use the federal GSA calculator with ZIP or locality lookup, travel-day options, and meal deductions. Browse state hubs for FY lodging and M&IE caps by destination."
    },
    {
      type: "h2",
      text: "Airline pilots and cabin crew"
    },
    {
      type: "p",
      text: "Use the crew calculator for trip logs, GSA M&IE by airport, contract compare, schedule import, and free CSV/PDF exports—not the same as contract per diem pay."
    },
    {
      type: "h2",
      text: "Teachers and school staff"
    },
    {
      type: "p",
      text: "Use the teacher calculator for conference and field-trip travel with GSA rates plus state education rules, or enter custom district rates."
    },
    {
      type: "h2",
      text: "Truck drivers"
    },
    {
      type: "p",
      text: "Use the trucker calculator for IRS transportation industry rates ($80 CONUS / $86 OCONUS for the current period), CONUS vs OCONUS days, and an optional DOT 80% meal deduction estimate."
    },
    {
      type: "h2",
      text: "Corporate travel teams"
    },
    {
      type: "p",
      text: "Finance and travel managers can model program-level savings with our travel ROI calculator at /calculator/roi/—separate from individual trip per diem."
    }
  ]
};

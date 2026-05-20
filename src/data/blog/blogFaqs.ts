import type { BlogFaq } from "../blogTypes";
import { LOCUM_VS_PER_DIEM_FAQS } from "./locum-vs-per-diem";
import { PER_DIEM_VS_RECEIPTS_FAQS } from "./per-diem-vs-itemized-receipts";

const WHAT_IS_PER_DIEM_FAQS: BlogFaq[] = [
  {
    question: "How is per diem calculated?",
    answer:
      "Multiply the approved daily rate by each eligible travel day. Federal GSA tables list separate lodging and M&IE amounts by locality; IRS transportation rates use a single daily M&IE figure for qualifying over-the-road drivers."
  },
  {
    question: "Who qualifies for per diem?",
    answer:
      "Employees and contractors who travel away from home overnight for business may receive per diem when their employer or client policy allows it. Tax deductibility has separate IRS rules about tax home and substantiation."
  },
  {
    question: "Is per diem the same as a travel stipend?",
    answer:
      "Not always. A stipend can be a fixed payment regardless of trip length. Per diem is usually tied to specific travel dates and destinations—and may follow accountable-plan or GSA-style caps."
  },
  {
    question: "What is the difference between GSA and IRS per diem?",
    answer:
      "GSA publishes federal CONUS locality rates used for government travel and many private accountable plans. The IRS sets special transportation industry meal amounts for eligible truck drivers—different tables and eligibility rules."
  },
  {
    question: "What is the difference between lodging and M&IE?",
    answer:
      "Lodging per diem covers overnight accommodation up to the locality cap. M&IE (meals and incidental expenses) is a separate daily amount for food and small incidentals. Employers may reimburse one, both, or actual costs per policy."
  },
  {
    question: "Is business per diem taxable?",
    answer:
      "Reimbursements under a qualifying accountable plan are often tax-free when you substantiate time, place, and business purpose. Amounts above policy limits or paid without required documentation may be taxable wages."
  }
];

const CHOOSE_CALCULATOR_FAQS: BlogFaq[] = [
  {
    question: "Which calculator should federal employees use?",
    answer:
      "Use the federal GSA calculator at /calculator/gsa/ for CONUS lodging and M&IE by ZIP or locality, travel-day options, and meal deductions. State hubs list FY caps by destination."
  },
  {
    question: "Are the calculators on this site free?",
    answer:
      "Yes. All profession calculators and the travel ROI tool are free planning aids. They use published federal rate data; verify final amounts with your employer, agency, or tax preparer."
  },
  {
    question: "What is the difference between the crew and GSA calculators?",
    answer:
      "The crew calculator is built for airline trip logs, airport lookup, contract compare, and exports. The GSA calculator is the general federal traveler tool—crew members often use both for different purposes."
  },
  {
    question: "Should travel nurses use the nurse calculator or the GSA calculator?",
    answer:
      "Use the travel nurse calculator for assignment dates, hospital ZIP lookup, and weekly housing vs meals stipend compare against GSA caps. The GSA calculator alone does not model agency stipend splits."
  },
  {
    question: "When should I use the travel ROI calculator?",
    answer:
      "Use /calculator/roi/ when you manage a corporate travel program and want to estimate payback and monthly savings from policy changes—not for individual trip per diem on a single itinerary."
  },
  {
    question: "Do police, hotel, and sales calculators use the same GSA data?",
    answer:
      "Yes. They share the same federal locality lookup for lodging and M&IE, with profession-specific labels and optional daily employer reimbursement compare fields."
  }
];

/** Per-post FAQ accordion (distinct from People also ask where both exist). */
export const BLOG_FAQS: Record<string, BlogFaq[]> = {
  "locum-vs-per-diem": LOCUM_VS_PER_DIEM_FAQS,
  "per-diem-vs-itemized-receipts": PER_DIEM_VS_RECEIPTS_FAQS,
  "what-is-per-diem": WHAT_IS_PER_DIEM_FAQS,
  "choose-the-right-calculator": CHOOSE_CALCULATOR_FAQS
};

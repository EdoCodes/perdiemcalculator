import type { BlogFaq } from "../blogTypes";

/** Per-post “People also ask” Q&A (shown in the orange rubric on article pages). */
export const BLOG_PEOPLE_ALSO_ASK: Record<string, BlogFaq[]> = {
  "per-diem-vs-itemized-receipts": [
    {
      question: "Can you mix per diem and itemized receipts on one trip?",
      answer:
        "Most employers choose one method per trip or per policy. Mixing is uncommon unless lodging is reimbursed separately from a meal per diem."
    },
    {
      question: "Is employee per diem taxable?",
      answer:
        "Reimbursements under an accountable plan are often tax-free when you substantiate time, place, and business purpose. Taxable treatment varies if amounts exceed policy or rules are not met."
    },
    {
      question: "What does per diem usually cover?",
      answer:
        "Business per diem typically covers meals and incidental expenses. Lodging may be a separate per diem line or reimbursed on its own, depending on employer policy."
    },
    {
      question: "How do companies set per diem rates?",
      answer:
        "Many employers mirror federal GSA locality tables, use a flat daily rate, or follow industry benchmarks. Private companies are not required to use GSA amounts."
    }
  ],
  "what-is-per-diem": [
    {
      question: "How is per diem calculated?",
      answer:
        "You multiply the approved daily rate by each eligible travel day. Federal GSA tables split lodging and M&IE by city; IRS transportation rates use a single daily M&IE amount for qualifying drivers."
    },
    {
      question: "Who qualifies for per diem?",
      answer:
        "Employees and contractors who travel away from home overnight for business may receive per diem if their employer or client policy allows it. Tax deductibility has separate IRS rules."
    },
    {
      question: "Is per diem the same as a travel stipend?",
      answer:
        "Not always. A stipend can be a fixed payment regardless of travel days. Per diem is usually tied to specific trip dates and destinations."
    },
    {
      question: "What is the difference between GSA and IRS per diem?",
      answer:
        "GSA publishes federal CONUS locality rates for government travel. The IRS sets special transportation industry meal amounts for eligible over-the-road drivers—different tables and rules."
    }
  ],
  "choose-the-right-calculator": [
    {
      question: "Should pilots use the federal GSA calculator?",
      answer:
        "Pilots and flight attendants often use GSA M&IE by layover city for tax worksheets, but contract per diem pay on a paycheck is separate. Use the crew calculator for trip logs and GSA M&IE estimates."
    },
    {
      question: "Can teachers use GSA per diem rates?",
      answer:
        "Yes, for many conference and overnight school travel scenarios. The teacher calculator applies GSA destination rates and optional state or district caps."
    },
    {
      question: "Why do truck drivers not use GSA tables?",
      answer:
        "Qualified over-the-road drivers who meet IRS rules generally use transportation industry M&IE rates ($80 CONUS / $86 OCONUS for the current period), not federal locality per diem."
    },
    {
      question: "Is crew contract per diem the same as GSA M&IE?",
      answer:
        "No. Airline contract per diem is wages; GSA M&IE is a federal benchmark often used for expense tracking and tax planning—not a substitute for your pay scale."
    }
  ]
};

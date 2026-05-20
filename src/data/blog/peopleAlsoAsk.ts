import type { BlogFaq } from "../blogTypes";

/** Per-post “People also ask” Q&A (shown in the orange rubric on article pages). */
export const BLOG_PEOPLE_ALSO_ASK: Record<string, BlogFaq[]> = {
  "locum-vs-per-diem": [
    {
      question: "What does locum tenens mean in healthcare?",
      answer:
        "Locum tenens means a clinician temporarily fills a role for another provider or facility, usually on a contract lasting weeks or months."
    },
    {
      question: "What does per diem mean for doctors or nurses?",
      answer:
        "In staffing, per diem usually means working shift-by-shift as needed. It is different from a federal daily travel allowance, which is also called per diem."
    },
    {
      question: "Is locum work the same as travel nursing?",
      answer:
        "Not exactly. Both may involve travel, but locum tenens traditionally refers to physicians and similar contracts; travel nursing is its own agency assignment model with similar stipend structures."
    },
    {
      question: "Why do hospitals hire locum doctors?",
      answer:
        "Hospitals hire locums to cover leaves, fill shortages, and keep services open during peak demand without permanent hires."
    },
    {
      question: "Is per diem the same as PRN?",
      answer:
        "They are similar; many employers use the terms interchangeably for as-needed shifts, though policies vary by facility and role."
    }
  ],
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
      question: "What does it mean to be paid by per diem?",
      answer:
        "Your employer pays a fixed daily amount for eligible travel expenses—usually meals and incidentals, and sometimes lodging—instead of reimbursing every receipt. You keep any unused portion only if your plan allows it; many policies require returning excess amounts."
    },
    {
      question: "What does $100 a day per diem mean?",
      answer:
        "You may receive up to $100 for each eligible travel day toward covered costs (often M&IE, or a combined allowance if your policy rolls categories together). Compare that figure to federal GSA M&IE for your destination and to your actual meal costs."
    },
    {
      question: "What does $30 per diem mean?",
      answer:
        "A $30 daily rate is usually a partial meal allowance or one meal tier (for example dinner only), not full federal M&IE for a city. Check whether the amount is per day, per meal, or before taxes."
    },
    {
      question: "What does $200 a day per diem mean?",
      answer:
        "That often signals a generous combined lodging-and-meals cap or a high-cost market policy. Compare it to GSA lodging plus M&IE for your trip ZIP—$200 may be below, at, or above federal benchmarks depending on the city and season."
    },
    {
      question: "Is it good to get paid per diem?",
      answer:
        "Per diem simplifies expense reporting and can improve cash flow when rates match real costs. Downsides: if the daily rate is low you pay out of pocket, and tax treatment depends on whether your employer uses an accountable plan and whether amounts exceed policy limits."
    },
    {
      question: "Does per diem get added to your paycheck?",
      answer:
        "It may appear as a separate reimbursement line, advance, or expense payout—not always mixed with hourly wages. Reimbursements under a qualifying accountable plan are often not taxable wages; amounts paid without substantiation or above policy may be taxable and reported on your W-2."
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
    },
    {
      question: "How do travel nurse stipends relate to GSA per diem?",
      answer:
        "Agencies often benchmark tax-free housing and meal stipends separately against GSA lodging and M&IE for the assignment city. Use the travel nurse calculator to compare each stipend to its own federal cap."
    },
    {
      question: "Do locum physicians use the same per diem rules as travel nurses?",
      answer:
        "Many locum contracts use the same GSA lodging and M&IE benchmarks for stipends. Use the locum calculator for facility ZIP and weekly stipend compare; rules still depend on tax home and assignment facts."
    },
    {
      question: "How does field sales per diem work with GSA?",
      answer:
        "Employers with accountable plans often reimburse lodging and M&IE up to GSA locality rates. The field sales calculator compares nightly lodging and daily M&IE reimbursement to those federal caps."
    }
  ]
};

import type { BlogBlock } from "../blogTypes";

/** Full article body for /blog/per-diem-vs-itemized-receipts/ */
export const PER_DIEM_VS_RECEIPTS_BLOCKS: BlogBlock[] = [
  {
    type: "callout",
    title: "Key takeaways",
    items: [
      "Per diem is a fixed daily allowance; itemized reimbursement pays back actual approved costs from receipts.",
      "Per diem reduces paperwork and speeds reimbursement—ideal for frequent travelers and sales reps.",
      "Itemized receipts give finance teams line-by-line control and stronger audit trails.",
      "Federal GSA per diem and IRS per diem rules are separate from employer reimbursement policy—know which applies to you."
    ]
  },
  {
    type: "html",
    html: `When consultants and sales reps travel for work, companies usually reimburse expenses in one of two ways: <strong>per diem</strong> or <strong>itemized receipts</strong>. Per diem pays a flat daily allowance; itemized reimbursement pays back actual approved expenses supported by receipts. This guide explains the difference, when each method works best, and what travelers should document—whether you use a <a href="/calculator/roi/">corporate travel program</a> or file expenses as an individual.`
  },
  {
    type: "h2",
    id: "what-is-per-diem",
    text: "What per diem means"
  },
  {
    type: "html",
    html: `Per diem means “per day.” In business travel, it usually refers to a fixed daily allowance for meals, lodging, and incidental expenses while you are away from home on business. Instead of collecting receipts for every coffee or meal, the traveler receives a set amount for each eligible travel day—making <strong>per diem travel reimbursement</strong> faster for employees and AP teams alike.`
  },
  {
    type: "html",
    html: `Government travelers often follow <a href="https://www.gsa.gov/travel/plan-book/per-diem-rates" target="_blank" rel="noopener noreferrer">GSA per diem rates</a> by city. Private employers may set their own caps or mirror federal tables. Our <a href="/calculator/gsa/">federal GSA calculator</a> and <a href="/states/">state rate hubs</a> help estimate official CONUS lodging and M&amp;IE; your company policy may still differ.`
  },
  {
    type: "h2",
    id: "itemized-receipts",
    text: "What itemized receipts mean"
  },
  {
    type: "html",
    html: `Itemized reimbursement works the opposite way. The traveler pays during the trip, keeps receipts, and submits them for approval. The employer reimburses only allowed categories—often meals, lodging, mileage, and transport—up to policy limits. This is sometimes called <strong>per diem vs actual expenses</strong>: actual-expense (receipt-based) reimbursement tracks what was really spent.`
  },
  {
    type: "html",
    html: `Under an <a href="https://www.irs.gov/taxtopics/tc514" target="_blank" rel="noopener noreferrer">IRS accountable plan</a>, reimbursements can be tax-free to the employee when expenses are business-related and properly substantiated. Receipt-based plans substantiate <em>amount</em>; per diem plans substantiate <em>rate × days</em> when rules are met. See <a href="https://www.irs.gov/publications/p463" target="_blank" rel="noopener noreferrer">IRS Publication 463 (Travel, Gift, and Car Expenses)</a> for tax concepts—not employer policy.`
  },
  {
    type: "h2",
    id: "main-difference",
    text: "The main difference: per diem vs itemized receipts"
  },
  {
    type: "table",
    headers: ["", "Per diem", "Itemized receipts"],
    rows: [
      ["How you get paid", "Fixed amount per eligible day", "Sum of approved actual costs"],
      ["Receipts for meals", "Usually not required for covered items", "Typically required"],
      ["Best for", "Frequent travel, predictable budgets", "Variable costs, strict audit needs"],
      ["Speed", "Faster for traveler and AP", "Slower; more review"]
    ]
  },
  {
    type: "p",
    text: "Per diem is usually faster and easier. Itemized receipts are usually more precise and more audit-friendly."
  },
  {
    type: "h2",
    id: "when-per-diem",
    text: "When per diem works best"
  },
  {
    type: "p",
    text: "Per diem is often the better choice when:"
  },
  {
    type: "ul",
    items: [
      "Travel happens frequently (consultants, <strong>sales rep travel expenses</strong>, regional managers).",
      "The company wants less paperwork and faster close each month.",
      "The traveler needs flexibility in how they spend the daily amount.",
      "Finance wants predictable budgeting by headcount and trip days."
    ]
  },
  {
    type: "html",
    html: `Field teams comparing policy options can model volume with our <a href="/calculator/roi/">travel ROI calculator</a>. Pilots and cabin crew often track federal M&amp;IE separately from contract pay—see our <a href="/guides/crew/per-diem-tax-basics/">crew per diem tax basics guide</a>.`
  },
  {
    type: "h2",
    id: "when-itemized",
    text: "When itemized receipts work best"
  },
  {
    type: "p",
    text: "Itemized reimbursement is often the better choice when:"
  },
  {
    type: "ul",
    items: [
      "Trip costs vary widely (luxury client dinners, last-minute lodging).",
      "The company wants exact expense tracking by category.",
      "Policy requires detailed records for compliance or grants.",
      "The destination is high-cost and a flat rate would be unfair."
    ]
  },
  {
    type: "h2",
    id: "pros-cons",
    text: "Pros and cons"
  },
  {
    type: "h3",
    text: "Per diem pros"
  },
  {
    type: "ul",
    items: [
      "Less paperwork for travelers.",
      "Faster reimbursement cycles.",
      "Predictable budgeting for finance.",
      "Easier for frequent travelers and mobile sales forces."
    ]
  },
  {
    type: "h3",
    text: "Per diem cons"
  },
  {
    type: "ul",
    items: [
      "May not match actual costs in expensive cities.",
      "Traveler may spend less than the allowance (policy-dependent).",
      "Less line-item detail for accounting without extra reporting."
    ]
  },
  {
    type: "h3",
    text: "Itemized receipt pros"
  },
  {
    type: "ul",
    items: [
      "Reimburses actual spending—fair for unusual trips.",
      "Stronger documentation for audits.",
      "Clear category breakdown (meals vs lodging vs transport).",
      "Works well for <strong>consultant travel reimbursement</strong> on client-billable projects."
    ]
  },
  {
    type: "h3",
    text: "Itemized receipt cons"
  },
  {
    type: "ul",
    items: [
      "More paperwork and receipt chasing.",
      "Slower approval and reimbursement.",
      "Higher administrative load on AP and managers.",
      "Lost receipts can mean lost reimbursement."
    ]
  },
  {
    type: "h2",
    id: "example",
    text: "Example: three-day sales trip"
  },
  {
    type: "html",
    html: `A sales rep travels Tuesday–Thursday for client meetings. The company policy allows either method.`
  },
  {
    type: "h3",
    text: "With per diem"
  },
  {
    type: "ol",
    items: [
      "Finance pays a fixed daily amount (e.g., based on GSA M&amp;IE or an internal table) × 3 days.",
      "The rep does not submit meal receipts for covered expenses.",
      "Reimbursement is simple; the rep still documents dates and business purpose."
    ]
  },
  {
    type: "h3",
    text: "With itemized receipts"
  },
  {
    type: "ol",
    items: [
      "The rep submits receipts for meals, hotel, rideshare, and parking.",
      "Finance reimburses approved actual costs, possibly capped per category.",
      "Total reimbursement equals approved spend—not a preset daily rate."
    ]
  },
  {
    type: "callout",
    title: "Planning tip",
    items: [
      "Estimate federal per diem for a destination with our /calculator/gsa/ before negotiating client budgets.",
      "Read /methodology/ for how we source GSA data on this site."
    ]
  },
  {
    type: "h2",
    id: "related-tools",
    text: "Related calculators and guides"
  },
  {
    type: "ul",
    items: [
      "<a href=\"/blog/what-is-per-diem/\">What is per diem?</a> — plain-language overview",
      "<a href=\"/calculator/gsa/\">Federal GSA per diem calculator</a>",
      "<a href=\"/calculator/crew/\">Airline crew calculator</a> (contract vs GSA M&amp;IE)",
      "<a href=\"/calculator/trucking/\">Truck driver IRS transportation rates</a>",
      "<a href=\"/methodology/\">Rate methodology</a>"
    ]
  }
];

export const PER_DIEM_VS_RECEIPTS_FAQS = [
  {
    question: "What is the difference between per diem and itemized receipts?",
    answer:
      "Per diem is a fixed daily allowance for eligible travel days. Itemized reimbursement pays back actual approved expenses supported by receipts. Per diem favors speed; itemized favors precision and audit detail."
  },
  {
    question: "Do consultants get per diem?",
    answer:
      "Many consulting firms pay per diem or a fixed daily rate for client-site travel, especially when consultants are on the road every week. Others require itemized expenses for client billing—check your engagement letter and expense policy."
  },
  {
    question: "Do sales reps get per diem?",
    answer:
      "Yes. Sales organizations with frequent overnight travel often use per diem or a company per-day rate to reduce receipt volume. Some teams use itemized reimbursement for strategic accounts or executive travel."
  },
  {
    question: "Do you need receipts for per diem?",
    answer:
      "Usually not for expenses covered by the per diem amount itself, but employers and the IRS still expect documentation of travel dates, places, and business purpose. Keep a calendar or trip log even without meal receipts."
  },
  {
    question: "Is per diem better than receipts?",
    answer:
      "Neither is universally better. Per diem is better for simplicity and speed. Itemized receipts are better for exact expense tracking and audits. Policy and trip type should drive the choice."
  },
  {
    question: "Is per diem the same as GSA per diem?",
    answer:
      "Not always. GSA publishes federal CONUS per diem rates for government travel. Private employers may use GSA as a benchmark, set their own rates, or use itemized reimbursement instead."
  },
  {
    question: "Can you use per diem and actual expenses on the same trip?",
    answer:
      "Employer policy usually picks one method per trip or category. Tax rules also restrict mixing methods for the same expense type in many cases—ask your preparer if you are deducting travel on your own return."
  }
];

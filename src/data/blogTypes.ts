export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "html"; html: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title: string; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

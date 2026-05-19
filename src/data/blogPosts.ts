export type BlogCategory = "general" | "federal" | "crew" | "education" | "trucking";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: BlogCategory;
  /** Full article at /blog/{slug}/; omit when href is set. */
  kind: "article" | "guide";
  href?: string;
};

export const BLOG_INDEX = "/blog/";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-is-per-diem",
    title: "What is per diem? A plain-language guide for business travelers",
    description:
      "Per diem pays for meals and incidentals when you travel for work. Learn how federal GSA rates, IRS transportation rates, and employer policies differ.",
    publishedAt: "2026-05-18",
    category: "general",
    kind: "article"
  },
  {
    slug: "choose-the-right-calculator",
    title: "Which per diem calculator should you use?",
    description:
      "Federal employees, airline crew, teachers, and truck drivers follow different rate systems. Match your profession to the right free tool on this site.",
    publishedAt: "2026-05-18",
    category: "general",
    kind: "article"
  },
  {
    slug: "crew-per-diem-tax-basics",
    title: "Airline crew per diem & GSA M&IE (tax basics)",
    description:
      "Contract pay vs GSA M&IE for pilots and flight attendants—and why a trip log matters.",
    publishedAt: "2026-04-01",
    category: "crew",
    kind: "guide",
    href: "/guides/crew/per-diem-tax-basics/"
  },
  {
    slug: "trucker-irs-transportation-rates",
    title: "IRS transportation industry per diem for truck drivers",
    description:
      "$80 CONUS and $86 OCONUS M&IE for qualified OTR drivers—not the same as GSA federal tables.",
    publishedAt: "2026-04-01",
    category: "trucking",
    kind: "guide",
    href: "/guides/trucking/irs-transportation-rates/"
  },
  {
    slug: "federal-gsa-by-state",
    title: "Browse GSA per diem rates by state",
    description:
      "CONUS locality hubs for federal travelers—lodging caps and M&IE by destination.",
    publishedAt: "2026-03-15",
    category: "federal",
    kind: "guide",
    href: "/states/"
  }
];

export const BLOG_ARTICLES = BLOG_POSTS.filter((p) => p.kind === "article");

export function blogPostHref(post: BlogPost): string {
  return post.href ?? `/blog/${post.slug}/`;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

const CATEGORY_LABELS: Record<BlogCategory, string> = {
  general: "General",
  federal: "Federal GSA",
  crew: "Airline crew",
  education: "Teachers",
  trucking: "Truck drivers"
};

export function blogCategoryLabel(category: BlogCategory): string {
  return CATEGORY_LABELS[category];
}

export function formatBlogDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

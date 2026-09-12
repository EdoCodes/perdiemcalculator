export type FooterLink = { href: string; label: string; external?: boolean };

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export const SITE_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "About us",
    links: [
      { href: "/about/", label: "About PerDiemCalculator" },
      { href: "/methodology/", label: "Methodology & sources" },
      { href: "/blog/", label: "Blog" }
    ]
  },
  {
    title: "Sitemap",
    links: [
      { href: "/sitemap/", label: "Sitemap" },
      { href: "/calculator/", label: "All calculators" },
      { href: "/widget/", label: "Free calculator widget" },
      { href: "/guides/", label: "Guides" },
      { href: "/states/", label: "GSA rates by state" }
    ]
  },
  {
    title: "Contact us",
    links: [{ href: "/contact/", label: "Send a message" }]
  },
  {
    title: "Calculator Suite",
    links: [
      {
        href: "https://www.mybenefitscalculator.com",
        label: "Visit our calculator suite for more useful free calculators",
        external: true
      }
    ]
  }
];

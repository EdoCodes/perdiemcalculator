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
      { href: "/sitemap/", label: "HTML sitemap" },
      { href: "/calculator/", label: "All calculators" },
      { href: "/states/", label: "GSA rates by state" },
      { href: "/sitemap-index.xml", label: "XML sitemap (for search engines)", external: true }
    ]
  },
  {
    title: "Contact us",
    links: [
      { href: "/contact/", label: "Contact" },
      {
        href: "mailto:hello@perdiemcalculator.com",
        label: "hello@perdiemcalculator.com",
        external: true
      }
    ]
  }
];

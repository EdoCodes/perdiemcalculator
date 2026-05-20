import { CONTACT_EMAIL } from "./siteContact";

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
      { href: "/states/", label: "GSA rates by state" }
    ]
  },
  {
    title: "Contact us",
    links: [
      { href: "/contact/", label: "Contact" },
      {
        href: `mailto:${CONTACT_EMAIL}`,
        label: CONTACT_EMAIL,
        external: true
      }
    ]
  }
];

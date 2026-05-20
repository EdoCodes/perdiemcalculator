import { BLOG_ARTICLES } from "./blogPosts";
import { CREW_HUB_AIRPORTS } from "./crewHubAirports";
import { HOTEL_GUIDES, hotelGuideHref } from "./hotelGuides";
import { POLICE_GUIDES, policeGuideHref } from "./policeGuides";
import { PROFESSIONS } from "./professions";
import { US_STATES } from "./usStates";

export type HtmlSitemapLink = { href: string; label: string };

export type HtmlSitemapSection = {
  title: string;
  links: HtmlSitemapLink[];
};

const CREW_GUIDE_LINKS: HtmlSitemapLink[] = [
  { href: "/guides/crew/", label: "Crew guides hub" },
  { href: "/guides/crew/per-diem-tax-basics/", label: "Per diem tax basics" },
  { href: "/guides/crew/contract-vs-gsa/", label: "Contract vs GSA" },
  { href: "/guides/crew/75-percent-first-last-day/", label: "75% first & last day" },
  { href: "/guides/crew/multi-city-layovers/", label: "Multi-city layovers" }
];

const TRUCKING_GUIDE_LINKS: HtmlSitemapLink[] = [
  { href: "/guides/trucking/", label: "Trucker guides hub" },
  { href: "/guides/trucking/irs-transportation-rates/", label: "IRS transportation rates" },
  { href: "/guides/trucking/dot-80-percent-meals/", label: "DOT 80% meals" },
  { href: "/guides/trucking/per-diem-vs-gsa/", label: "Per diem vs GSA" }
];

const NURSING_GUIDE_LINKS: HtmlSitemapLink[] = [
  { href: "/guides/nursing/", label: "Nursing guides hub" },
  { href: "/guides/nursing/stipends-vs-gsa/", label: "Stipends vs GSA" },
  { href: "/guides/nursing/tax-home-basics/", label: "Tax home basics" }
];

const LOCUM_GUIDE_LINKS: HtmlSitemapLink[] = [
  { href: "/guides/locum/", label: "Locum guides hub" },
  { href: "/guides/locum/stipends-vs-gsa/", label: "Stipends vs GSA" },
  { href: "/guides/locum/tax-home-basics/", label: "Tax home basics" }
];

const SALES_GUIDE_LINKS: HtmlSitemapLink[] = [
  { href: "/guides/sales/", label: "Sales guides hub" },
  { href: "/guides/sales/accountable-plan-gsa/", label: "Accountable plan & GSA" },
  { href: "/guides/sales/territory-trip-basics/", label: "Territory trip basics" }
];

/** Human-readable sitemap sections (mirrors XML chunk strategy). */
export const HTML_SITEMAP_SECTIONS: HtmlSitemapSection[] = [
  {
    title: "Main",
    links: [
      { href: "/", label: "Home" },
      { href: "/calculator/", label: "Choose a calculator" },
      { href: "/states/", label: "GSA rates by state" },
      { href: "/methodology/", label: "Methodology" },
      { href: "/blog/", label: "Blog" }
    ]
  },
  {
    title: "Calculators",
    links: [
      ...PROFESSIONS.filter((p) => p.available).map((p) => ({
        href: p.href,
        label: p.shortName
      })),
      { href: "/calculator/roi/", label: "Travel ROI" }
    ]
  },
  {
    title: "Blog articles",
    links: BLOG_ARTICLES.map((post) => ({
      href: `/blog/${post.slug}/`,
      label: post.title
    }))
  },
  {
    title: "Guides — crew & trucking",
    links: [...CREW_GUIDE_LINKS, ...TRUCKING_GUIDE_LINKS]
  },
  {
    title: "Guides — healthcare & sales",
    links: [...NURSING_GUIDE_LINKS, ...LOCUM_GUIDE_LINKS, ...SALES_GUIDE_LINKS]
  },
  {
    title: "Guides — police & hotel",
    links: [
      { href: "/guides/police/", label: "Police guides hub" },
      ...POLICE_GUIDES.map((g) => ({
        href: policeGuideHref(g.slug),
        label: g.shortLabel
      })),
      { href: "/guides/hotel/", label: "Hotel guides hub" },
      ...HOTEL_GUIDES.map((g) => ({
        href: hotelGuideHref(g.slug),
        label: g.shortLabel
      }))
    ]
  },
  {
    title: "Crew & layover hubs",
    links: [
      { href: "/calculator/crew/", label: "Crew calculator" },
      { href: "/crew/pilots/", label: "Pilots" },
      { href: "/crew/flight-attendants/", label: "Flight attendants" },
      { href: "/crew/layover/", label: "Layover hub index" },
      ...CREW_HUB_AIRPORTS.map((a) => ({
        href: `/crew/layover/${a.code.toLowerCase()}/`,
        label: `${a.city} (${a.code})`
      }))
    ]
  },
  {
    title: "State rate hubs",
    links: US_STATES.map((s) => ({
      href: `/states/${s.abbr.toLowerCase()}/`,
      label: s.name
    }))
  }
];

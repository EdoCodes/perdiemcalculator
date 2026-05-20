import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapUrl: string) => `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? "https://www.perdiemcalculator.com";
  const sitemapURL = new URL("sitemap-index.xml", base).href;
  return new Response(getRobotsTxt(sitemapURL), {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
};

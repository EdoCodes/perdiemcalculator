import { ChangeFreqEnum, type SitemapItem } from "@astrojs/sitemap";
import { BLOG_ARTICLES } from "../data/blogPosts";

/** Production default when PUBLIC_SITE_URL is unset (local builds still emit a sitemap). */
export const DEFAULT_SITE_URL = "https://www.perdiemcalculator.com";

type PageMeta = {
  priority: number;
  changefreq: (typeof ChangeFreqEnum)[keyof typeof ChangeFreqEnum];
  lastmod?: string;
};

const blogLastModByPath = new Map(
  BLOG_ARTICLES.map((post) => [`/blog/${post.slug}/`, post.publishedAt] as const)
);

function pathname(url: string): string {
  try {
    const path = new URL(url).pathname;
    return path.endsWith("/") ? path : `${path}/`;
  } catch {
    return url;
  }
}

function metaForPath(path: string): PageMeta {
  if (path === "/") {
    return { priority: 1, changefreq: ChangeFreqEnum.WEEKLY };
  }
  if (path === "/methodology/") {
    return { priority: 0.5, changefreq: ChangeFreqEnum.YEARLY };
  }
  if (path === "/sitemap/") {
    return { priority: 0.4, changefreq: ChangeFreqEnum.MONTHLY };
  }
  if (path === "/calculator/") {
    return { priority: 0.9, changefreq: ChangeFreqEnum.WEEKLY };
  }
  if (path.startsWith("/calculator/") && path !== "/calculator/") {
    return { priority: 0.85, changefreq: ChangeFreqEnum.MONTHLY };
  }
  if (path === "/blog/") {
    return { priority: 0.75, changefreq: ChangeFreqEnum.WEEKLY };
  }
  if (path.startsWith("/blog/") && path !== "/blog/") {
    const published = blogLastModByPath.get(path);
    return {
      priority: 0.8,
      changefreq: ChangeFreqEnum.MONTHLY,
      lastmod: published ? new Date(published).toISOString() : undefined
    };
  }
  if (path === "/states/") {
    return { priority: 0.85, changefreq: ChangeFreqEnum.WEEKLY };
  }
  if (path.startsWith("/states/") && path !== "/states/") {
    return { priority: 0.7, changefreq: ChangeFreqEnum.MONTHLY };
  }
  if (path.startsWith("/guides/")) {
    const depth = path.split("/").filter(Boolean).length;
    return {
      priority: depth <= 2 ? 0.75 : 0.7,
      changefreq: ChangeFreqEnum.MONTHLY
    };
  }
  if (path.startsWith("/crew/")) {
    const isLayoverHub = /^\/crew\/layover\/[a-z]{3}\/$/.test(path);
    return {
      priority: isLayoverHub ? 0.65 : 0.7,
      changefreq: ChangeFreqEnum.MONTHLY
    };
  }
  return { priority: 0.6, changefreq: ChangeFreqEnum.MONTHLY };
}

/** Apply priority, changefreq, and lastmod for a single sitemap entry. */
export function enrichSitemapItem(item: SitemapItem): SitemapItem {
  const path = pathname(item.url);
  const meta = metaForPath(path);
  item.priority = meta.priority;
  item.changefreq = meta.changefreq;
  if (meta.lastmod) {
    item.lastmod = meta.lastmod;
  }
  return item;
}

function chunkMatcher(prefix: string) {
  return (item: SitemapItem) => {
    const path = pathname(item.url);
    if (!path.startsWith(prefix)) return undefined;
    return enrichSitemapItem(item);
  };
}

/**
 * Split XML sitemaps by site section (Search Console–friendly).
 * URLs that match no chunk land in `sitemap-pages-0.xml` (home, methodology, HTML sitemap).
 */
export const sitemapChunks = {
  calculators: chunkMatcher("/calculator"),
  blog: chunkMatcher("/blog"),
  guides: chunkMatcher("/guides"),
  states: chunkMatcher("/states"),
  crew: chunkMatcher("/crew")
};

export function serializeSitemapItem(item: SitemapItem): SitemapItem {
  return enrichSitemapItem(item);
}

/** Publisher iframe snippet — same shape as section8calculator.com/widget/. */

export const WIDGET_IFRAME_HEIGHT = 720;
export const WIDGET_IFRAME_MAX_WIDTH = 680;
export const WIDGET_PATH = "/widget/";
export const EMBED_PATH = "/embed/";

export function normalizeSiteOrigin(siteUrl: string): string {
  return siteUrl.trim().replace(/\/+$/, "");
}

export function widgetEmbedSrc(siteUrl: string): string {
  return `${normalizeSiteOrigin(siteUrl)}${EMBED_PATH}`;
}

export function widgetHomeHref(siteUrl: string): string {
  return `${normalizeSiteOrigin(siteUrl)}/`;
}

/** HTML publishers paste into WordPress / Wix / Squarespace / custom sites. */
export function widgetEmbedSnippet(siteUrl: string): string {
  const src = widgetEmbedSrc(siteUrl);
  const home = widgetHomeHref(siteUrl);
  return `<!-- GSA Per Diem Calculator Widget -->
<iframe
  src="${src}"
  width="100%"
  height="${WIDGET_IFRAME_HEIGHT}"
  frameborder="0"
  style="border:0; border-radius:12px; max-width:${WIDGET_IFRAME_MAX_WIDTH}px; width:100%; box-shadow:0 4px 20px rgba(0,0,0,0.08);"
  title="GSA per diem calculator"></iframe>
<div style="font-size:12px; color:#666; margin-top:6px; font-family:system-ui, -apple-system, sans-serif;">Powered by <a href="${home}" target="_blank" rel="noopener" style="color:#f26522; text-decoration:none; font-weight:600;">Per Diem Calculator</a></div>`;
}

export function isEmbedPath(pathname: string): boolean {
  return pathname === EMBED_PATH || pathname.startsWith("/embed/");
}

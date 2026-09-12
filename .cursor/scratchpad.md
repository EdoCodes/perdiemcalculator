# Project Status Board

- [done] Scaffold Astro + React + Netlify + Supabase placeholders + CI
- [done] Design pass B (tokens, dark mode, calculator UX, homepage hero)
- [done] Wire calculator + GSA sync (conus/lodging + deduped ZIPs); verify:db OK (790 loc, 40k zips ×2 FY)
- [done] Go-live pass: `PUBLIC_SITE_URL` in netlify.toml, sitemap, OG meta, README checklist, security headers
- [done] Per-day GSA logic connected to calculator UI

## Traffic recovery (2026-09-11) — pending confirmation

- [done locally] Align canonical host with live redirects (apex `https://perdiemcalculator.com`) — **confirm Netlify UI env is also apex, then deploy**
- [done locally] Homepage follows section8calculator pattern (calculator + keyword H1 + how-it-works)
- [done locally] Add crawlable FY2026 GSA explainer + M&IE table on `/calculator/gsa/`
- [done locally] Collapse header nav to Calculators / States / Guides / Blog
- [done locally] Build sitemap/robots/JSON-LD on apex (`dist/sitemap-index.xml` uses apex; no www locs)
- [done locally] Optional analytics via `PUBLIC_GA_MEASUREMENT_ID` (unset until user adds a GA4 ID)
- [ ] After deploy: resubmit sitemap in Google Search Console; request homepage + GSA + a state page indexing
- [ ] Expand thin blog posts (`what-is-per-diem`, `choose-the-right-calculator`) and add an FY2026 rates roundup

## Location-page scale (Planner — 2026-09-11)

- [ ] **Do not generate 40k ZIP URLs.** `zip_locality` is a lookup table, not a page inventory.
- [done] Phase A: ~298 NSA URLs at `/states/[abbr]/[locality-slug]/` (419 total pages). Monthly lodging + M&IE + 75% example + calculator `?did=`. CONUS `$110+$68` fallback; no “X County” suffix. User confirmed 2026-09-11 — shipping to `origin/main` (Netlify should auto-deploy).
- [ ] Phase B: Census places (~32k cities/CDPs, same class of list Section 8 uses) mapped to a GSA locality via ZIP/county. Each page shows that city’s assigned locality, county, sample ZIP, 75% example, nearby NSAs, and a prefilled calculator.
- [ ] Guardrail: if a city only restates statewide standard CONUS with no county/ZIP/nearby-NSA specifics, do not ship it (doorway/duplicate risk).
- [ ] Keep current homepage look unless the user asks to restore the old 10-calculator hub (still in git).

# Executor's Feedback or Assistance Requests

- **Phase A confirmed (2026-09-11).** Shipping to GitHub. After Netlify goes live, resubmit `https://perdiemcalculator.com/sitemap-index.xml` in GSC. Phase B (~32k Census cities) still waiting.
- Standard CONUS rows in Supabase can have `mie_total` / lodging of `0`; display now falls back to FY2026 `$110 + $68`. Worth fixing in the GSA sync later so the DB matches GSA.
- Set `PUBLIC_SITE_URL` in Netlify (and locally via `.env`) so canonical URLs and `@astrojs/sitemap` use your real domain.
- Create a Supabase project and share (or add) `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` in Netlify so the UI can read cached rates.
- Register for a GSA Per Diem API key (free) so the sync script can import official data.

## Traffic recovery notes (2026-09-11)

- **Live host is apex, config said www (fixed in repo).** Netlify 301s `www` → `https://perdiemcalculator.com/`. Code now emits apex canonicals/sitemap/robots. **If Netlify UI still has `PUBLIC_SITE_URL=https://www.perdiemcalculator.com`, change it — UI overrides `netlify.toml`.**
- **Search Console:** Prefer a Domain property (`perdiemcalculator.com`). After deploy, resubmit `https://perdiemcalculator.com/sitemap-index.xml` and request indexing for `/`, `/calculator/gsa/`, `/states/ca/`.
- **Analytics:** Optional `PUBLIC_GA_MEASUREMENT_ID` (GA4). No ID in repo; tag is omitted until set in Netlify.
- **Parity with section8calculator:** Homepage is now the GSA calculator + how-it-works + state directory. Section8 still wins on scale (31k city pages). Next content lever after this ships: city-level GSA pages and thicker blog posts.

# Lessons

- `npm create astro@latest .` refuses a non-empty directory; scaffold into a temp folder and move up, or initialize Astro before adding `.cursor/`.
- Locality list fetch: drop stale responses when `state` / fiscal year changes; default `localityId` via functional `setState` so in-flight responses cannot overwrite a user's selection. Sync `did` / label in a separate `useEffect` tied to `localities` + `localityId`.
- Canonical host must match the live redirect target. A www canonical + apex 301 (or the reverse) creates a Google canonical loop and starves inner pages of indexation.
- Competing per diem calculators (Jupid, PerdiemWorld, Perk) rank because the calculator URL itself has unique crawlable copy: FY rates, 75% first/last-day rule, M&IE breakdown tables. A client-only widget with a short subtitle is not enough.
- `??` does not treat `0` as missing. Standard CONUS `$0 lodging + $0 M&IE` was a real GSA-row with zeros, not a null. Fall back when amounts are `<= 0`.
- GSA `county` is often a coverage string (`Los Angeles / Orange / Ventura / …`), not a county name. Do not append ` County`.

# High-level Task Breakdown

## Previous (complete)

1. Project skeleton: Astro, TypeScript, React, Tailwind (optional minimal styling).
2. Netlify + GitHub Actions: build, preview-ready config.
3. Public pages: home, methodology (static HTML for SEO / AI Overview), dynamic `states/[abbr]`.
4. Supabase: `.env.example`, client helper (no secrets in repo).
5. Calculator: React stub embedded via `client:load` on dedicated route.

## Traffic recovery (new)

1. **Canonical host fix (P0).** Set `PUBLIC_SITE_URL` / `DEFAULT_SITE_URL` to `https://perdiemcalculator.com` (no www) everywhere: `netlify.toml`, `src/config/sitemapSeo.ts`, README, `.env.example`. Success: live `<link rel="canonical">`, sitemap `<loc>`, and robots `Sitemap:` all use apex; www still 301s to apex; no page canonicalizes to www.
2. **Verify XML sitemaps after rebuild.** Hit `/sitemap-index.xml` and each child (`sitemap-calculators-0.xml`, states, guides, blog, crew, pages). Success: all 200, URLs are apex, no www locs.
3. **GSA calculator SEO block (P0).** Add a static Astro section under `/calculator/gsa/` (same pattern as `CrewCalculatorSeo.astro`): FY2026 standard CONUS `$110 + $68`, 75% first/last-day rule, M&IE tier table, FAQ JSON-LD, links to `/states/` and methodology. Success: view-source of `/calculator/gsa/` contains that copy without JavaScript.
4. **Homepage intent (P0).** Change H1/title/meta so the primary phrase is “Per diem calculator” (FY2026 GSA lodging + M&IE), with profession tools as supporting copy—not “Your trip in 10 free calculators.” Success: homepage title + H1 include “per diem calculator”; meta description is specific, not a tagline.
5. **Analytics.** Add one lightweight tag (Plausible preferred, or GA4 if user already has a property). Success: homepage loads the snippet; we can see visits after deploy.
6. **Nav cleanup.** Replace seven “X guides” header links with Calculators / States / Guides / Blog. Success: header has ≤5 primary links; guide hubs still reachable from a Guides menu or footer.
7. **Thin-content pass.** Expand `what-is-per-diem` and `choose-the-right-calculator`; add one FY2026 rates article. Success: each article has unique H2s answering a search query, not just internal tool links.
8. **Post-deploy indexing (user + GSC).** Submit apex sitemap; request indexing for `/`, `/calculator/gsa/`, `/states/ca/`. Success: GSC Coverage shows submitted URLs; no “Alternate page with proper canonical tag” storm from www.

# Background and Motivation

- Utility site: federal GSA CONUS per diem calculator; state hub pages; Netlify + Supabase + GitHub.
- **2026-09-11:** The live site is getting no organic traffic. Goal is not a visual redesign—it is to get Google to index the right host and to put rankable copy on the URLs people actually search (`per diem calculator`, `GSA per diem`, `[state] per diem rates`).

# Key Challenges and Analysis

- Rates must come from official GSA sources (cached in Supabase or build); calculator logic in testable TS modules (future).

## Why there is no traffic (2026-09-11 audit)

1. **Canonical / host split (technical, fix first).** Production 301s www → apex. Build config still treats www as canonical. Sitemap and robots advertise www URLs. This is the most likely reason inner pages are missing from Google while the apex homepage can appear for the brand name.
2. **Money pages are thin.** `/calculator/gsa/` is a React island with almost no unique HTML. Competitors ranking for “per diem calculator” publish the FY table and 75% rule on that same URL. Google has nothing distinctive to rank here vs GSA.gov, Jupid, PerdiemWorld, or Perk.
3. **Homepage does not match the query.** H1 is “Your trip in 10 free calculators.” Title is “Per diem calculator for every profession.” Description leads with a brand tagline. Searchers type “per diem calculator”; GSA.gov wins because it is official, and third-party tools win when they look like a calculator *plus* a rate guide.
4. **Authority is split.** Ten calculators, seven guide nav items, 50 state pages, layover hubs, and four blog posts (two of them stubs). A new domain cannot rank a site-wide keyword cloud; it needs a few strong URLs.
5. **Off-site reality.** “Per diem calculator” is dominated by GSA. Third-party wins are long-tail and page-level (`California per diem rates`, `airline crew per diem calculator`, `FY2026 GSA per diem`). No backlinks and no analytics yet. Fixing indexation + on-page intent is the leverage we control in code.
6. **SSR empty state on GSA calculator.** Crawled HTML includes “No localities — run GSA sync” until client fetch. Even if rates work in the browser, Google’s first look is an empty tool. Worth fixing after the SEO block (preload localities or a static fallback sentence).

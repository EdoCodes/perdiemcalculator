# Project Status Board

- [done] Scaffold Astro + React + Netlify + Supabase placeholders + CI — evidence: `npm run build` OK (55 pages), sitemap emitted when `PUBLIC_SITE_URL` is set.
- [in_progress] Wire calculator island to rate data (Supabase schema + GSA sync pipeline)
- [pending] Implement per-day GSA logic (FY, meals, first/last day) and connect it to the UI

# Executor's Feedback or Assistance Requests

- Set `PUBLIC_SITE_URL` in Netlify (and locally via `.env`) so canonical URLs and `@astrojs/sitemap` use your real domain.
- Create a Supabase project and share (or add) `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` in Netlify so the UI can read cached rates.
- Register for a GSA Per Diem API key (free) so the sync script can import official data.

# Lessons

- `npm create astro@latest .` refuses a non-empty directory; scaffold into a temp folder and move up, or initialize Astro before adding `.cursor/`.

# High-level Task Breakdown

1. Project skeleton: Astro, TypeScript, React, Tailwind (optional minimal styling).
2. Netlify + GitHub Actions: build, preview-ready config.
3. Public pages: home, methodology (static HTML for SEO / AI Overview), dynamic `states/[abbr]`.
4. Supabase: `.env.example`, client helper (no secrets in repo).
5. Calculator: React stub embedded via `client:load` on dedicated route.

# Background and Motivation

- Utility site: federal GSA CONUS per diem calculator; state hub pages; Netlify + Supabase + GitHub.

# Key Challenges and Analysis

- Rates must come from official GSA sources (cached in Supabase or build); calculator logic in testable TS modules (future).

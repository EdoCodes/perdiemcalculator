# Project Status Board

- [done] Scaffold Astro + React + Netlify + Supabase placeholders + CI — evidence: `npm run build` OK (55 pages), sitemap emitted when `PUBLIC_SITE_URL` is set.
- [pending] Wire calculator island to rate data (GSA sync / Supabase schema)
- [pending] Implement per-day GSA logic (FY, meals, first/last day)

# Executor's Feedback or Assistance Requests

- Awaiting your confirmation before picking up the next status-board item (rates wiring).
- Set `PUBLIC_SITE_URL` in Netlify (and locally via `.env`) so canonical URLs and `@astrojs/sitemap` use your real domain.

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

# Per Diem Calculator

Federal **GSA CONUS** per diem calculator (lodging + M&IE), state hub pages, and methodology. Static site on **Netlify**; rates cached in **Supabase** from the [GSA Per Diem API](https://open.gsa.gov/api/perdiem/).

**Live site:** https://perdiemproject.netlify.app

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev at http://localhost:4321 |
| `npm run build` | Production build → `dist/` |
| `npm run test:supabase` | Test anon DB read (needs `.env`) |
| `npm run verify:db` | Check rate/ZIP row counts (needs service role in `.env`) |
| `npm run sync:gsa` | Import GSA rates into Supabase |
| `npm run setup:rates` | `check:env` + full sync FY 2025 & 2026 |

## Go-live checklist

### Netlify (Site configuration → Environment variables)

| Variable | Value |
|----------|--------|
| `PUBLIC_SITE_URL` | `https://perdiemproject.netlify.app` (or your custom domain) |
| `PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon public** key |

Do **not** add `GSA_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to Netlify.

After any env change: **Deploys → Clear cache and deploy**.

### Supabase (one-time)

1. Run SQL in `supabase/migrations/001_gsa_rates.sql` (SQL Editor).
2. Load rates: `npm run setup:rates` locally, or GitHub **Actions → Sync GSA rates** (needs repo secrets: `GSA_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Confirm: `npm run verify:db` → all **(OK)**, sample ZIP found.

### GitHub

- Repo connected to Netlify (`main` branch).
- Optional: enable weekly **Sync GSA rates** workflow after adding Actions secrets.

### SEO / sitemap

- XML: `https://www.perdiemcalculator.com/sitemap-index.xml` (split by calculators, blog, guides, states, crew).
- HTML: `/sitemap/` for humans and internal linking.
- `robots.txt` is generated at build from `PUBLIC_SITE_URL`.
- After deploy, submit the sitemap index in [Google Search Console](https://search.google.com/search-console).

### Contact form (Netlify)

The `/contact/` page uses [Netlify Forms](https://docs.netlify.com/forms/setup/). The public site does not display your inbox—only the form. After deploy:

1. **Netlify → Site configuration → Forms → Form notifications**
2. Add **Email notification** and enter the Gmail inbox you want to receive messages
3. Submit a test on `/contact/` and confirm it arrives (check spam on first send)

## Local setup

Copy `.env.example` → `.env` and fill keys from Supabase + GSA.

## Data model

GSA does **not** publish every U.S. city. You get ~346 **localities** per fiscal year (NSAs + state standard rates) and ~40k **ZIP → locality** mappings. Unlisted towns use the **standard CONUS** rate for that state.

## Disclaimer

Planning aid only. Verify amounts against official GSA tables and your agency’s FTR implementation.

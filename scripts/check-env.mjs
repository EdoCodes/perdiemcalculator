/**
 * Friendly check before sync — no secrets printed.
 * Usage: node scripts/check-env.mjs
 */

import { loadDotenv } from "./load-dotenv.mjs";

loadDotenv();

const url = process.env.PUBLIC_SUPABASE_URL?.trim() ?? "";
const anon = process.env.PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
const gsa = process.env.GSA_API_KEY?.trim() ?? "";

let ok = true;

function fail(msg) {
  console.error("✗", msg);
  ok = false;
}

function pass(msg) {
  console.log("✓", msg);
}

console.log("Checking .env in project folder...\n");

if (!url || url.includes("YOUR_PROJECT")) {
  fail("PUBLIC_SUPABASE_URL is missing or still a placeholder.");
  console.log("  Fix: use your Supabase Project URL, e.g.");
  console.log("  PUBLIC_SUPABASE_URL=https://novoamfzwaxrwaklxhwv.supabase.co\n");
} else if (!url.includes("supabase.co")) {
  fail("PUBLIC_SUPABASE_URL does not look like a Supabase URL.");
} else {
  pass("PUBLIC_SUPABASE_URL looks OK");
}

if (!anon || anon.includes("...") || anon.length < 100) {
  fail("PUBLIC_SUPABASE_ANON_KEY is missing or incomplete.");
  console.log("  Fix: Supabase → Settings → API → anon public key\n");
} else if (anon.toLowerCase().includes("service_role")) {
  fail("PUBLIC_SUPABASE_ANON_KEY looks like service_role — use the anon key instead.");
} else {
  pass("PUBLIC_SUPABASE_ANON_KEY looks OK");
}

const supabaseUrl = process.env.SUPABASE_URL?.trim() ?? url;
if (!supabaseUrl || supabaseUrl.includes("YOUR_PROJECT")) {
  fail("SUPABASE_URL is missing or still a placeholder (can match PUBLIC_SUPABASE_URL).");
} else {
  pass("SUPABASE_URL looks OK");
}

if (!service || service.length < 100) {
  fail("SUPABASE_SERVICE_ROLE_KEY is missing or incomplete.");
  console.log("  Fix: Supabase → Settings → API → service_role secret (Reveal)\n");
} else {
  pass("SUPABASE_SERVICE_ROLE_KEY looks OK");
}

if (!gsa || gsa.length < 10) {
  fail("GSA_API_KEY is missing.");
  console.log("  Fix: get a key at https://open.gsa.gov/api/perdiem/ (signup on that page)\n");
} else {
  pass("GSA_API_KEY is set");
}

if (!ok) {
  console.log("---");
  console.log("Edit the .env file in this project, save, then run: npm run sync:gsa");
  process.exit(1);
}

console.log("\n.env looks good. Next: npm run sync:gsa");

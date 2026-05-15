/**
 * Test Supabase anon read access (same as the browser calculator).
 * Usage: node scripts/test-supabase-connection.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { loadDotenv } from "./load-dotenv.mjs";

loadDotenv();

const url = process.env.PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  console.error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY in .env");
  console.error("Copy .env.example to .env and paste keys from Supabase → Settings → API");
  process.exit(1);
}

if (anonKey.includes("service_role")) {
  console.error("Wrong key: use the anon public key, not service_role.");
  process.exit(1);
}

if (!url.includes("supabase.co")) {
  console.warn("Warning: URL does not look like a Supabase project URL:", url);
}

const supabase = createClient(url, anonKey);

const { count, error } = await supabase
  .from("localities")
  .select("*", { count: "exact", head: true });

if (error) {
  console.error("Connection failed:", error.message);
  if (error.hint) console.error("Hint:", error.hint);
  if (error.code === "PGRST205" || error.message.includes("does not exist")) {
    console.error("Run supabase/migrations/001_gsa_rates.sql in the SQL Editor first.");
  }
  process.exit(1);
}

console.log("OK — Supabase connection works.");
console.log(`localities row count: ${count ?? 0}`);

if (!count) {
  console.warn("Tables exist but localities is empty. Run: npm run sync:gsa");
  process.exit(2);
}

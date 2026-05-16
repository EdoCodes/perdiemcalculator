/**
 * Check whether GSA sync looks complete.
 * Usage: node scripts/verify-db.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { loadDotenv } from "./load-dotenv.mjs";

loadDotenv();

const url = process.env.SUPABASE_URL?.trim() || process.env.PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key) {
  console.error("Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const { count: localities } = await supabase
  .from("localities")
  .select("*", { count: "exact", head: true });

const { count: zips2025 } = await supabase
  .from("zip_locality")
  .select("*", { count: "exact", head: true })
  .eq("fiscal_year", 2025);

const { count: zips2026 } = await supabase
  .from("zip_locality")
  .select("*", { count: "exact", head: true })
  .eq("fiscal_year", 2026);

const { data: sample90501 } = await supabase
  .from("zip_locality")
  .select("zip,did,state")
  .eq("zip", "90501")
  .eq("fiscal_year", 2026)
  .maybeSingle();

const localityOk = (localities ?? 0) >= 600;
console.log(
  "localities:",
  localities ?? 0,
  localityOk ? "(OK)" : "(LOW — run npm run sync:gsa)"
);
console.log("zip_locality FY2025:", zips2025 ?? 0, (zips2025 ?? 0) < 30000 ? "(LOW)" : "(OK)");
console.log("zip_locality FY2026:", zips2026 ?? 0, (zips2026 ?? 0) < 30000 ? "(LOW)" : "(OK)");
console.log("ZIP 90501 FY2026:", sample90501 ? `found → ${sample90501.state} DID ${sample90501.did}` : "NOT FOUND");

const ok = localityOk && (zips2025 ?? 0) >= 30000 && (zips2026 ?? 0) >= 30000 && sample90501;

process.exit(ok ? 0 : 2);

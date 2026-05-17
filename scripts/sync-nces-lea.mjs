/**
 * Build public LEA district index from NCES CCD directory (for teacher district picker).
 *
 * Usage:
 *   node scripts/sync-nces-lea.mjs
 *   node scripts/sync-nces-lea.mjs --supabase   (also upsert into Supabase)
 *
 * Source: NCES CCD LEA directory 2024–25
 * https://nces.ed.gov/ccd/files.asp
 */

import { createClient } from "@supabase/supabase-js";
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { loadDotenv } from "./load-dotenv.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TMP = join(__dirname, ".tmp", "nces-lea");
const OUT_DIR = join(ROOT, "public", "data", "lea");
const ZIP_URL =
  "https://nces.ed.gov/ccd/Data/zip/ccd_lea_029_2425_w_0a_051425.zip";

loadDotenv(ROOT);

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

async function downloadZip(dest) {
  const res = await fetch(ZIP_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${ZIP_URL}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

function extractZip(zipPath, destDir) {
  mkdirSync(destDir, { recursive: true });
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Expand-Archive -Force -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}'"`,
      { stdio: "inherit" }
    );
  } else {
    execSync(`unzip -o -q "${zipPath}" -d "${destDir}"`, { stdio: "inherit" });
  }
}

async function parseDistricts(csvPath) {
  const text = readFileSync(csvPath, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const idx = (name) => header.indexOf(name);
  const iSt = idx("ST");
  const iName = idx("LEA_NAME");
  const iId = idx("LEAID");
  const iCity = idx("LCITY");
  const iStatus = idx("SY_STATUS");

  const byState = new Map();

  for (let li = 1; li < lines.length; li++) {
    const cols = parseCsvLine(lines[li]);
    if (cols[iStatus] !== "1") continue;
    const state = cols[iSt]?.trim().toUpperCase();
    if (!state || state.length !== 2) continue;
    const id = cols[iId]?.trim();
    const name = cols[iName]?.trim();
    if (!id || !name) continue;
    const city = cols[iCity]?.trim() || null;
    const row = { id, name, city };
    if (!byState.has(state)) byState.set(state, []);
    byState.get(state).push(row);
  }

  for (const [, list] of byState) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return byState;
}

async function writePublicFiles(byState) {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {
    schoolYear: "2024-2025",
    source: "NCES CCD LEA directory",
    sourceUrl: "https://nces.ed.gov/ccd/files.asp",
    generatedAt: new Date().toISOString(),
    states: {}
  };

  for (const [state, districts] of [...byState.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const path = join(OUT_DIR, `${state}.json`);
    const payload = JSON.stringify(districts);
    const { writeFileSync } = await import("node:fs");
    writeFileSync(path, payload);
    manifest.states[state] = districts.length;
  }

  const { writeFileSync } = await import("node:fs");
  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  return manifest;
}

async function upsertSupabase(byState) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("Skip Supabase: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    return;
  }
  const supabase = createClient(url, key);
  const rows = [];
  for (const [state, districts] of byState) {
    for (const d of districts) {
      rows.push({
        nces_id: d.id,
        state,
        name: d.name,
        city: d.city
      });
    }
  }

  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("school_districts").upsert(batch, { onConflict: "nces_id" });
    if (error) throw new Error(`Supabase upsert: ${error.message}`);
    console.log(`  Supabase: ${Math.min(i + batchSize, rows.length)} / ${rows.length}`);
  }
}

async function main() {
  const useSupabase = process.argv.includes("--supabase");
  mkdirSync(TMP, { recursive: true });
  const zipPath = join(TMP, "ccd_lea.zip");
  const extractDir = join(TMP, "extract");

  console.log("Downloading NCES LEA directory…");
  await downloadZip(zipPath);
  console.log("Extracting…");
  rmSync(extractDir, { recursive: true, force: true });
  extractZip(zipPath, extractDir);

  const { readdirSync } = await import("node:fs");
  let csvPath = null;
  const stack = [extractDir];
  while (stack.length) {
    const d = stack.pop();
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (ent.name.endsWith(".csv") && ent.name.includes("ccd_lea")) {
        csvPath = p;
        break;
      }
    }
    if (csvPath) break;
  }
  if (!csvPath) throw new Error("LEA CSV not found in archive");

  console.log("Parsing districts…");
  const byState = await parseDistricts(csvPath);
  const total = [...byState.values()].reduce((n, a) => n + a.length, 0);
  console.log(`Open districts: ${total} across ${byState.size} states/areas`);

  const manifest = await writePublicFiles(byState);
  console.log(`Wrote public/data/lea/*.json (${Object.keys(manifest.states).length} files)`);

  if (useSupabase) {
    console.log("Upserting Supabase school_districts…");
    await upsertSupabase(byState);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

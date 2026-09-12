/**
 * Build a California city list (name, county, sample ZIP) from GeoNames USPS
 * postal codes. Run: node scripts/build-ca-places.mjs
 *
 * Source: https://download.geonames.org/export/zip/US.zip (CC-BY GeoNames)
 */
import { execFileSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP = path.join(ROOT, "scripts", ".tmp");
const ZIP_URL = "https://download.geonames.org/export/zip/US.zip";
const OUT = path.join(ROOT, "src", "data", "places", "ca-cities.json");

function slugKey(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function parseUsTxt(filePath) {
  /** @type {Map<string, { name: string, county: string, zip: string, zips: number }>} */
  const byKey = new Map();
  const rl = createInterface({ input: createReadStream(filePath, { encoding: "utf8" }) });
  for await (const line of rl) {
    if (!line || line.startsWith("country")) continue;
    const cols = line.split("\t");
    const zip = (cols[1] ?? "").padStart(5, "0").slice(0, 5);
    const name = (cols[2] ?? "").trim();
    const state = (cols[4] ?? "").toUpperCase();
    const county = (cols[5] ?? "").trim();
    if (state !== "CA" || zip.length !== 5 || !name || !county) continue;
    if (!/^[0-9]{5}$/.test(zip)) continue;
    const key = `${slugKey(name)}|${slugKey(county)}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { name, county, zip, zips: 1 });
    } else {
      existing.zips += 1;
    }
  }
  return [...byKey.values()]
    .map(({ name, county, zip }) => ({ name, county, zip, state: "CA" }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.county.localeCompare(b.county));
}

async function main() {
  await mkdir(TMP, { recursive: true });
  const zipPath = path.join(TMP, "US.zip");
  console.log("Downloading GeoNames US postal codes…");
  await download(ZIP_URL, zipPath);
  console.log("Extracting…");
  execFileSync("tar", ["-xf", zipPath, "-C", TMP], { stdio: "inherit" });
  const txt = path.join(TMP, "US.txt");
  const places = await parseUsTxt(txt);
  await mkdir(path.dirname(OUT), { recursive: true });
  const payload = {
    source: "GeoNames US postal codes (https://download.geonames.org/export/zip/)",
    generatedAt: new Date().toISOString().slice(0, 10),
    state: "CA",
    places
  };
  await writeFile(OUT, `${JSON.stringify(payload)}\n`);
  console.log(`Wrote ${places.length} CA cities → ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

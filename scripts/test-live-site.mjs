const site = "https://perdiemproject.netlify.app/calculator/gsa/";
const html = await fetch(site).then((r) => r.text());
const bundle = html.match(/PerDiemCalculator\.[A-Za-z0-9_-]+\.js/)[0];
const js = await fetch(`https://perdiemproject.netlify.app/_astro/${bundle}`).then((r) =>
  r.text()
);

const url = js.includes("https://novoamfzwaxrwaklxhwv.supabase.co")
  ? "https://novoamfzwaxrwaklxhwv.supabase.co"
  : null;
const key = js.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/)?.[0];

console.log("Bundle:", bundle);
console.log("Full URL in build:", Boolean(url));
console.log("Key length:", key?.length ?? 0);
console.log("Has content-range bug:", js.includes("content-range"));
console.log("Has select=id only count:", js.includes("localities?select=id"));

if (!url || !key) {
  console.error("Could not read credentials from bundle");
  process.exit(1);
}

async function test(label, path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      Origin: "https://perdiemproject.netlify.app"
    }
  });
  const text = await res.text();
  console.log(`${label}: HTTP ${res.status}`, text.slice(0, 150));
}

await test("count all ids", "localities?select=id");
await test("CA localities", "localities?state=eq.CA&fiscal_year=eq.2026&select=id,city&limit=3");

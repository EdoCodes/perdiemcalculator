import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase";

export function PerDiemCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const supabaseStatus = useMemo(() => {
    const client = getSupabaseBrowserClient();
    return client
      ? { ok: true as const, detail: "Supabase browser client ready (anon key)." }
      : {
          ok: false as const,
          detail:
            "Supabase not configured: set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY."
        };
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">GSA CONUS calculator</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Trip dates and rate logic will connect to cached GSA data (Supabase). This is a UI
        shell for wiring.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-800">
          Start date
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-800">
          End date
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </label>
      </div>

      <p className="mt-4 rounded-md bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700">
        Debug: {supabaseStatus.ok ? "OK — " : "Notice — "}
        {supabaseStatus.detail}
      </p>
    </div>
  );
}

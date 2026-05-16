/** Browser reads via Supabase PostgREST (fetch) — avoids supabase-js auth quirks. */

export function readSupabaseConfig(): { url: string; anonKey: string } {
  const url = import.meta.env.PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = readSupabaseConfig();
  if (!url || !anonKey) return false;
  if (url.includes("YOUR_PROJECT") || url.includes("placeholder.supabase.co")) return false;
  if (anonKey === "placeholder-anon-key" || anonKey.includes("...")) return false;
  return url.includes("supabase.co");
}

function authHeaders(): HeadersInit {
  const { anonKey } = readSupabaseConfig();
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: "application/json"
  };
}

export async function supabaseRest<T>(pathWithQuery: string, init?: RequestInit): Promise<T> {
  const { url } = readSupabaseConfig();
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  const res = await fetch(`${url}/rest/v1/${pathWithQuery}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers as Record<string, string> | undefined)
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Supabase HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return [] as T;
  }

  return res.json() as Promise<T>;
}

export async function countLocalities(): Promise<number> {
  const { url } = readSupabaseConfig();
  const res = await fetch(`${url}/rest/v1/localities?select=id`, {
    headers: {
      ...authHeaders(),
      Prefer: "count=exact"
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Supabase HTTP ${res.status}`);
  }

  const range = res.headers.get("content-range");
  const total = range?.split("/")[1];
  return total ? Number(total) : 0;
}

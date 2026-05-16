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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  let res: Response;
  try {
    res = await fetch(`${url}/rest/v1/${pathWithQuery}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...authHeaders(),
        ...(init?.headers as Record<string, string> | undefined)
      }
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out (20s)");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatSupabaseError(res.status, text));
  }

  if (res.status === 204) {
    return [] as T;
  }

  return res.json() as Promise<T>;
}

function formatSupabaseError(status: number, text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return `Supabase HTTP ${status}`;
  try {
    const body = JSON.parse(trimmed) as { message?: string; hint?: string };
    if (body.message) {
      return body.hint ? `${body.message} (${body.hint})` : body.message;
    }
  } catch {
    /* plain text */
  }
  return trimmed.length > 180 ? `${trimmed.slice(0, 180)}…` : trimmed;
}

/** Row count via response body (Content-Range is often blocked in browsers). */
export async function countLocalities(): Promise<number> {
  const data = await supabaseRest<{ id: string }[]>("localities?select=id&limit=1");
  return data?.length ?? 0;
}

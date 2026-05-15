import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

function readPublicEnv() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim();
  return { url, anonKey };
}

/**
 * Browser Supabase client using the public anon key.
 * Returns null when env vars are missing (often: Netlify build ran without PUBLIC_* set).
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const { url, anonKey } = readPublicEnv();

  if (!url || !anonKey) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}

/** For diagnostics in dev tools / support. */
export function getSupabaseConfigStatus(): "ok" | "missing_env" {
  const { url, anonKey } = readPublicEnv();
  return url && anonKey ? "ok" : "missing_env";
}

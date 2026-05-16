import { isSupabaseConfigured, readSupabaseConfig } from "./supabaseRest";

/** @deprecated Browser reads use `supabaseRest` (fetch). Kept for compatibility. */
export function getSupabaseBrowserClient(): null {
  return null;
}

export function getSupabaseConfigStatus(): "ok" | "missing_env" {
  return isSupabaseConfigured() ? "ok" : "missing_env";
}

export { readSupabaseConfig, isSupabaseConfigured };

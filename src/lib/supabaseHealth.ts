import { countLocalities, isSupabaseConfigured } from "./supabaseRest";

export type SupabaseHealth =
  | { status: "missing_env" }
  | { status: "error"; message: string; hint?: string }
  | { status: "empty" }
  | { status: "ok"; localityCount: number };

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  if (!isSupabaseConfigured()) {
    return { status: "missing_env" };
  }

  try {
    const count = await countLocalities();

    if (!count) {
      return { status: "empty" };
    }

    return { status: "ok", localityCount: count };
  } catch (e) {
    let message =
      e instanceof Error ? e.message.trim() : typeof e === "string" ? e : "Could not reach Supabase";
    if (!message) message = "Could not reach Supabase (network or blocked request)";

    const blocked =
      /failed to fetch|networkerror|load failed/i.test(message) ||
      message.includes("NetworkError");

    return {
      status: "error",
      message,
      hint: blocked
        ? "Try a private/incognito window and disable ad blockers for this site."
        : "Check PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY on Netlify, then clear-cache redeploy."
    };
  }
}

import { getSupabaseBrowserClient } from "./supabase";

export type SupabaseHealth =
  | { status: "missing_env" }
  | { status: "error"; message: string; hint?: string }
  | { status: "empty" }
  | { status: "ok"; localityCount: number };

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const url = import.meta.env.PUBLIC_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return { status: "missing_env" };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { status: "missing_env" };
  }

  const { count, error } = await client
    .from("localities")
    .select("*", { count: "exact", head: true });

  if (error) {
    return {
      status: "error",
      message: error.message,
      hint: error.hint ?? undefined
    };
  }

  if (!count) {
    return { status: "empty" };
  }

  return { status: "ok", localityCount: count };
}

import { createClient } from "@supabase/supabase-js";
import { checkSupabaseEnv } from "@/lib/env";

function readEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name];
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, "");
}

export function createSupabaseAdmin() {
  const envCheck = checkSupabaseEnv();
  if (!envCheck.ok) {
    throw new Error(envCheck.message);
  }

  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL")!;
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY")!;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

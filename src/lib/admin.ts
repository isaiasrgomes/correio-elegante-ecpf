import { createSupabaseAdmin } from "./supabase/server";

export async function getSecretRoute() {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("settings")
    .select("secret_route")
    .eq("id", "default")
    .single();

  return data?.secret_route ?? "admin-correio";
}

export async function validateSecretRoute(secret: string) {
  const expected = await getSecretRoute();
  return secret === expected;
}

export async function getSettings() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

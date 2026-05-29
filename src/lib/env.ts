export type EnvCheckResult =
  | { ok: true }
  | { ok: false; missing: string[]; message: string };

function read(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, "");
}

export function checkSupabaseEnv(): EnvCheckResult {
  const missing: string[] = [];
  if (!read("NEXT_PUBLIC_SUPABASE_URL")) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!read("SUPABASE_SERVICE_ROLE_KEY")) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      message: `Variáveis ausentes na Vercel: ${missing.join(", ")}`,
    };
  }

  return { ok: true };
}

export function checkAuthEnv(): EnvCheckResult {
  const secret = read("JWT_SECRET");
  if (!secret || secret.length < 16) {
    return {
      ok: false,
      missing: ["JWT_SECRET"],
      message:
        "JWT_SECRET ausente ou muito curto. Adicione na Vercel uma chave com pelo menos 16 caracteres.",
    };
  }
  return { ok: true };
}

export function getJwtSecret(): Uint8Array {
  const check = checkAuthEnv();
  if (!check.ok) {
    throw new Error(check.message);
  }
  return new TextEncoder().encode(read("JWT_SECRET")!);
}

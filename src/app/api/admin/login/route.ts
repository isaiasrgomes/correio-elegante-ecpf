import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  verifyPassword,
} from "@/lib/auth";
import { checkAuthEnv, checkSupabaseEnv } from "@/lib/env";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const supabaseEnv = checkSupabaseEnv();
    if (!supabaseEnv.ok) {
      console.error("[admin/login]", supabaseEnv.message);
      return NextResponse.json(
        { error: "Servidor sem conexão ao banco. Verifique as variáveis do Supabase na Vercel." },
        { status: 503 }
      );
    }

    const authEnv = checkAuthEnv();
    if (!authEnv.ok) {
      console.error("[admin/login]", authEnv.message);
      return NextResponse.json(
        {
          error:
            "Servidor sem JWT_SECRET configurado. Adicione JWT_SECRET nas variáveis de ambiente da Vercel.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const supabase = createSupabaseAdmin();
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("[admin/login] Supabase:", error.message, error.code);
      const hint =
        error.code === "42P01"
          ? "Tabela admins não existe. Execute supabase/schema.sql no Supabase."
          : "Erro ao consultar o banco.";
      return NextResponse.json({ error: hint }, { status: 500 });
    }

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Credenciais inválidas. Se este é o primeiro deploy, rode o seed no banco de produção (npm run db:seed).",
        },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(parsed.data.password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const token = await createSessionToken(admin.id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    return response;
  } catch (error) {
    console.error("[admin/login]", error);
    const message =
      error instanceof Error ? error.message : "Erro desconhecido ao autenticar.";
    return NextResponse.json(
      { error: message.includes("JWT") || message.includes("Supabase") ? message : "Erro ao autenticar." },
      { status: 500 }
    );
  }
}

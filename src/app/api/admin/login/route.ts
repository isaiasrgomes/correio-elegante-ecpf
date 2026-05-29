import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
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
      console.error("Erro Supabase ao buscar admin:", error.message);
      return NextResponse.json({ error: "Erro ao autenticar." }, { status: 500 });
    }

    if (!admin) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const valid = await verifyPassword(parsed.data.password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    await createSession(admin.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao autenticar." }, { status: 500 });
  }
}

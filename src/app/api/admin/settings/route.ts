import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { settingsSchema } from "@/lib/settings-validation";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  const { data: settings } = await supabase
    .from("settings")
    .select("pix_enabled")
    .eq("id", "default")
    .single();

  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdmin();
  const { data: settings, error } = await supabase
    .from("settings")
    .upsert({
      id: "default",
      pix_enabled: parsed.data.pixEnabled,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
  }

  return NextResponse.json({ settings });
}

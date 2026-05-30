import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { settingsSchema, sanitizeProductRecord } from "@/lib/settings-validation";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data: settings, error } = await supabase
      .from("settings")
      .select("pix_enabled, product_pix_keys, product_qr_codes")
      .eq("id", "default")
      .single();

    if (error) {
      console.error("[admin/settings GET]", error);
      return NextResponse.json({ error: "Erro ao carregar configurações." }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[admin/settings GET]", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar configurações." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();
    const { data: existing } = await supabase
      .from("settings")
      .select("product_pix_keys, product_qr_codes")
      .eq("id", "default")
      .single();

    const productPixKeys =
      parsed.data.productPixKeys !== undefined
        ? sanitizeProductRecord(parsed.data.productPixKeys)
        : (existing?.product_pix_keys as Record<string, string> | null) ?? {};

    const productQrCodes =
      parsed.data.productQrCodes !== undefined
        ? sanitizeProductRecord(parsed.data.productQrCodes)
        : (existing?.product_qr_codes as Record<string, string> | null) ?? {};

    const { data: settings, error } = await supabase
      .from("settings")
      .upsert({
        id: "default",
        pix_enabled: parsed.data.pixEnabled,
        product_pix_keys: productPixKeys,
        product_qr_codes: productQrCodes,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("[admin/settings PUT]", error);
      return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[admin/settings PUT]", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar configurações." },
      { status: 500 }
    );
  }
}

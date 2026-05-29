import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  const supabase = createSupabaseAdmin();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (q) {
    query = query.or(
      `receiver_name.ilike.%${q}%,sender_name.ilike.%${q}%`
    );
  }

  const { data: orders, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Erro ao buscar pedidos." }, { status: 500 });
  }

  return NextResponse.json({ orders });
}

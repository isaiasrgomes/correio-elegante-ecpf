import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();

    const { data: order, error } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ status: order.status });
  } catch (error) {
    console.error("[order-status]", error);
    return NextResponse.json(
      { error: "Erro interno ao consultar status." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(
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

    if (order.status !== "AWAITING_PAYMENT") {
      return NextResponse.json({ status: order.status });
    }

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "AWAITING_PRODUCTION",
        payment_confirmed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("status")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "Erro ao confirmar pagamento." }, { status: 500 });
    }

    return NextResponse.json({ status: updated.status });
  } catch (error) {
    console.error("[confirm-payment]", error);
    return NextResponse.json(
      { error: "Erro interno ao confirmar pagamento." },
      { status: 500 }
    );
  }
}

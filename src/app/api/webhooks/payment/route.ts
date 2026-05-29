import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  const expected = process.env.PAYMENT_WEBHOOK_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, status } = body as { orderId?: string; status?: string };

  if (!orderId) {
    return NextResponse.json({ error: "orderId obrigatório." }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (status === "paid" || status === "confirmed") {
    await supabase
      .from("orders")
      .update({
        status: "AWAITING_PRODUCTION",
        payment_confirmed_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.json({ ok: true, status: "AWAITING_PRODUCTION" });
  }

  return NextResponse.json({ ok: true, status: order.status });
}

import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { checkMercadoPagoPayment } from "@/lib/pix-charge";

async function confirmOrder(orderId: string) {
  const supabase = createSupabaseAdmin();
  await supabase
    .from("orders")
    .update({
      status: "AWAITING_PRODUCTION",
      payment_confirmed_at: new Date().toISOString(),
    })
    .eq("id", orderId);
}

/** Webhook Mercado Pago — configure em: Suas integrações > Webhooks > Pagamentos */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createSupabaseAdmin();

    const paymentId =
      body?.data?.id ??
      body?.id ??
      new URL(request.url).searchParams.get("data.id");

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const { data: settings } = await supabase
      .from("settings")
      .select("mercadopago_access_token")
      .eq("id", "default")
      .single();

    if (!settings?.mercadopago_access_token) {
      return NextResponse.json({ ok: true });
    }

    const paid = await checkMercadoPagoPayment(
      settings.mercadopago_access_token,
      String(paymentId)
    );

    if (!paid) {
      return NextResponse.json({ ok: true });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("payment_id", String(paymentId))
      .maybeSingle();

    if (order) {
      await confirmOrder(order.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Mercado Pago:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(request: Request) {
  const paymentId = new URL(request.url).searchParams.get("data.id");
  if (!paymentId) return NextResponse.json({ ok: true });

  const fakeRequest = new Request(request.url, {
    method: "POST",
    body: JSON.stringify({ data: { id: paymentId } }),
  });
  return POST(fakeRequest);
}

import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { orderSchema, resolveSenderClass } from "@/lib/validations";
import { calculateTotal, getLetterById } from "@/lib/order-utils";
import { getQrCodesForOrder, getPixKeyForOrder } from "@/lib/qr-codes";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const letter = getLetterById(data.letterType);
    if (!letter) {
      return NextResponse.json({ error: "Tipo de carta inválido." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: settings } = await supabase
      .from("settings")
      .select("pix_enabled, product_pix_keys, product_qr_codes")
      .eq("id", "default")
      .single();

    const paymentsAvailable = Boolean(settings?.pix_enabled);
    const paymentConfig = {
      productPixKeys: (settings?.product_pix_keys as Record<string, string> | null) ?? {},
      productQrCodes: (settings?.product_qr_codes as Record<string, string> | null) ?? {},
    };
    const total = calculateTotal(data.letterType, data.extras ?? []);
    const extras = data.extras?.filter((e) => e.quantity > 0) ?? [];

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        letter_type: data.letterType,
        letter_price: letter.price,
        receiver_name: data.receiverName,
        receiver_class: data.receiverClass,
        identification_mode: data.identificationMode,
        sender_name: data.identificationMode === "IDENTIFIED" ? data.senderName : null,
        sender_class: resolveSenderClass(data),
        message: data.message,
        spotify_link: data.spotifyLink || null,
        polaroid_url: data.polaroidUrl || null,
        extras: extras.length ? extras : null,
        total_amount: total,
        status: "AWAITING_PAYMENT",
      })
      .select("id")
      .single();

    if (error || !order) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao criar pedido." }, { status: 500 });
    }

    const qrCodes = paymentsAvailable
      ? getQrCodesForOrder(data.letterType, extras, paymentConfig)
      : [];

    const pixKey = paymentsAvailable
      ? getPixKeyForOrder(
          data.letterType,
          extras,
          paymentConfig.productPixKeys
        )
      : null;

    return NextResponse.json({
      orderId: order.id,
      qrCodes,
      pixKey,
      paymentsAvailable,
      total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno ao criar pedido." }, { status: 500 });
  }
}

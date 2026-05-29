import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/** Webhook OpenPix — evento charge.completed */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const charge = body?.charge;

    if (!charge?.correlationID) {
      return NextResponse.json({ ok: true });
    }

    if (charge.status !== "COMPLETED" && charge.status !== "PAID") {
      return NextResponse.json({ ok: true });
    }

    const supabase = createSupabaseAdmin();
    await supabase
      .from("orders")
      .update({
        status: "AWAITING_PRODUCTION",
        payment_confirmed_at: new Date().toISOString(),
      })
      .eq("id", charge.correlationID);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook OpenPix:", error);
    return NextResponse.json({ ok: true });
  }
}

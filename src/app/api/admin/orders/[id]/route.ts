import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { OrderStatus } from "@/lib/supabase/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error("[admin/orders GET id]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as OrderStatus | undefined;

    if (
      !status ||
      !["AWAITING_PAYMENT", "AWAITING_PRODUCTION", "COMPLETED"].includes(status)
    ) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const update: { status: OrderStatus; payment_confirmed_at?: string } = { status };

    if (status === "AWAITING_PRODUCTION") {
      update.payment_confirmed_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[admin/orders PATCH]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("[admin/orders DELETE]", error);
      return NextResponse.json({ error: "Erro ao excluir pedido." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/orders DELETE]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

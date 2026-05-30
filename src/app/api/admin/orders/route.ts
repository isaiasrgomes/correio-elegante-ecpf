import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

function buildOrderStats(orders: { status: string; total_amount: number }[]) {
  const awaitingPayment = orders.filter((o) => o.status === "AWAITING_PAYMENT").length;
  const awaitingProduction = orders.filter((o) => o.status === "AWAITING_PRODUCTION").length;
  const completed = orders.filter((o) => o.status === "COMPLETED").length;
  const totalRevenue = orders
    .filter((o) => o.status === "AWAITING_PRODUCTION" || o.status === "COMPLETED")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return {
    total: orders.length,
    awaitingPayment,
    awaitingProduction,
    completed,
    totalRevenue,
  };
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status") ?? "active";

    const supabase = createSupabaseAdmin();

    const { data: allOrders, error: statsError } = await supabase
      .from("orders")
      .select("status, total_amount");

    if (statsError) {
      console.error("[admin/orders GET stats]", statsError);
      return NextResponse.json({ error: "Erro ao buscar pedidos." }, { status: 500 });
    }

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (status === "active") {
      query = query.in("status", ["AWAITING_PAYMENT", "AWAITING_PRODUCTION"]);
    } else if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (q) {
      query = query.or(`receiver_name.ilike.%${q}%,sender_name.ilike.%${q}%`);
    }

    const { data: orders, error } = await query;
    if (error) {
      console.error("[admin/orders GET]", error);
      return NextResponse.json({ error: "Erro ao buscar pedidos." }, { status: 500 });
    }

    return NextResponse.json({
      orders,
      stats: buildOrderStats(allOrders ?? []),
    });
  } catch (error) {
    console.error("[admin/orders GET]", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar pedidos." },
      { status: 500 }
    );
  }
}

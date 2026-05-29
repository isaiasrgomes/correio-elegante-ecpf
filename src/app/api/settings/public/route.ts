import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseAdmin();
  const { data: settings } = await supabase
    .from("settings")
    .select("pix_enabled")
    .eq("id", "default")
    .single();

  return NextResponse.json({
    paymentsAvailable: Boolean(settings?.pix_enabled),
  });
}

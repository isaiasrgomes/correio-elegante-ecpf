import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PAYMENT_PRODUCT_ID_SET } from "@/lib/settings-validation";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (!productId || !PAYMENT_PRODUCT_ID_SET.has(productId)) {
      return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
    }

    if (!ACCEPTED.includes(file.type)) {
      return NextResponse.json({ error: "Formato não suportado." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande." }, { status: 400 });
    }

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `${productId}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from("qr-codes")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { error: "Erro no upload. Verifique se o bucket 'qr-codes' existe no Supabase." },
        { status: 500 }
      );
    }

    const { data: publicUrl } = supabase.storage.from("qr-codes").getPublicUrl(filename);
    return NextResponse.json({ url: publicUrl.publicUrl, productId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro no upload." }, { status: 500 });
  }
}

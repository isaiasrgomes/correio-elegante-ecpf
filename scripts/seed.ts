import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@correioelegante.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 12);

  await supabase.from("settings").upsert({
    id: "default",
    pix_enabled: false,
    secret_route: "admin-correio",
  });

  const { data: existing, error: lookupError } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("Erro ao buscar admin:", lookupError.message);
    process.exit(1);
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("admins")
      .update({ password_hash: hash })
      .eq("id", existing.id);
    if (updateError) {
      console.error("Erro ao atualizar admin:", updateError.message);
      process.exit(1);
    }
  } else {
    const { error: insertError } = await supabase
      .from("admins")
      .insert({ email, password_hash: hash });
    if (insertError) {
      console.error("Erro ao criar admin:", insertError.message);
      process.exit(1);
    }
  }

  console.log("Seed concluído.");
  console.log(`Admin: ${email}`);
  console.log(`Senha: ${password}`);
}

main().catch(console.error);

import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsPanel } from "@/components/admin/settings-panel";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  const adminId = await getSessionAdminId();
  if (!adminId) redirect(`/painel/${secret}/login`);

  return (
    <>
      <AdminHeader
        title="Configurações"
        description="Controle a disponibilidade dos pagamentos Pix para os clientes do site."
      />
      <SettingsPanel />
    </>
  );
}

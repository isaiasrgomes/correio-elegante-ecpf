import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrdersPanel } from "@/components/admin/orders-panel";

export default async function AdminDashboardPage({
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
        title="Pedidos"
        description="Acompanhe, filtre e gerencie todas as cartas enviadas pelo Correio Elegante."
      />
      <OrdersPanel />
    </>
  );
}

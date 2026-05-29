import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import AdminLoginForm from "./login-form";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  const adminId = await getSessionAdminId();
  if (adminId) redirect(`/painel/${secret}`);

  return <AdminLoginForm secret={secret} />;
}

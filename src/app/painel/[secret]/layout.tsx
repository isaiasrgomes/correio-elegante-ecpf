import { notFound } from "next/navigation";
import { validateSecretRoute } from "@/lib/admin";
import { getSessionAdminId } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  const valid = await validateSecretRoute(secret);
  if (!valid) notFound();

  const adminId = await getSessionAdminId();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8fa]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-red-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-100/40 blur-3xl" />
      </div>
      {adminId ? (
        <div className="relative lg:flex">
          <AdminSidebar secret={secret} />
          <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:max-w-6xl lg:px-10 lg:pb-10 lg:pt-10 xl:max-w-7xl">
            {children}
          </main>
        </div>
      ) : (
        <div className="relative">{children}</div>
      )}
    </div>
  );
}

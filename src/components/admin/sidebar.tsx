"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, Settings, LogOut, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "", label: "Pedidos", icon: Package },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({ secret }: { secret: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/painel/${secret}`;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push(`${base}/login`);
    router.refresh();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-rose-100/80 lg:bg-white/60 lg:backdrop-blur-xl">
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-300/40">
              <Heart className="h-5 w-5 fill-current" />
            </span>
            <div>
              <p className="font-bold text-[#2a1a1f]">Correio Elegante</p>
              <p className="text-xs text-muted">Painel · EREM Carlos Pena Filho</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            {links.map(({ href, label, icon: Icon }) => {
              const path = `${base}${href}`;
              const active =
                href === ""
                  ? pathname === base || pathname === `${base}/`
                  : pathname.startsWith(path);
              return (
                <Link
                  key={href}
                  href={path}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all",
                    active
                      ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-300/30"
                      : "text-muted-dark hover:bg-rose-50 hover:text-rose-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition",
                      active ? "text-white" : "text-rose-400 group-hover:text-rose-600"
                    )}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          <Button
            variant="ghost"
            className="mt-6 justify-start rounded-2xl text-muted hover:bg-red-50 hover:text-red-700"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-rose-100 bg-white/90 px-2 py-2 backdrop-blur-xl lg:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const path = `${base}${href}`;
          const active =
            href === ""
              ? pathname === base || pathname === `${base}/`
              : pathname.startsWith(path);
          return (
            <Link
              key={href}
              href={path}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition",
                active ? "text-rose-600" : "text-muted"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition",
                  active
                    ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md"
                    : "bg-rose-50 text-rose-400"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={logout}
          className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold text-muted"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-400">
            <LogOut className="h-4 w-4" />
          </span>
          Sair
        </button>
      </nav>
    </>
  );
}

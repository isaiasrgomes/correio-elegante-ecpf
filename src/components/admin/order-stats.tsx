import { Clock, Package, CheckCircle2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderStatsProps {
  total: number;
  awaitingPayment: number;
  awaitingProduction: number;
  completed: number;
  loading?: boolean;
}

const items = [
  {
    key: "total",
    label: "Total de pedidos",
    icon: Package,
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  {
    key: "awaitingPayment",
    label: "Aguardando pagamento",
    icon: Wallet,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-800",
  },
  {
    key: "awaitingProduction",
    label: "Em produção",
    icon: Clock,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-800",
  },
  {
    key: "completed",
    label: "Finalizados",
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
  },
] as const;

export function OrderStats({
  total,
  awaitingPayment,
  awaitingProduction,
  completed,
  loading,
}: OrderStatsProps) {
  const values = { total, awaitingPayment, awaitingProduction, completed };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ key, label, icon: Icon, color, bg, text }) => (
        <div
          key={key}
          className="group relative overflow-hidden rounded-3xl border border-rose-100/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition hover:border-rose-200 hover:shadow-md"
        >
          <div
            className={cn(
              "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl transition group-hover:opacity-60",
              bg
            )}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted">{label}</p>
              {loading ? (
                <div className="mt-2 h-9 w-12 animate-pulse rounded-xl bg-rose-100" />
              ) : (
                <p className={cn("mt-1 text-3xl font-bold tabular-nums", text)}>
                  {values[key]}
                </p>
              )}
            </div>
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                color
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

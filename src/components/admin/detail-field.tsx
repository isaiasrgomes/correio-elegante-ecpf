import { cn } from "@/lib/utils";

export function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-rose-50 bg-rose-50/30 px-4 py-3", className)}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-[#2a1a1f]">{children}</dd>
    </div>
  );
}

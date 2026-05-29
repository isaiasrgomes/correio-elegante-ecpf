interface AdminHeaderProps {
  title: string;
  description: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <header className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">
        Painel administrativo
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2a1a1f] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        {description}
      </p>
    </header>
  );
}

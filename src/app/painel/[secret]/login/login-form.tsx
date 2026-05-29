"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Loader2 } from "lucide-react";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginForm({ secret }: { secret: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erro ao entrar.");
      return;
    }
    router.push(`/painel/${secret}`);
    router.refresh();
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-xl shadow-rose-300/40">
            <Heart className="h-6 w-6 fill-current" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-[#2a1a1f] sm:text-3xl">
            Correio Elegante
          </h1>
          <p className="mt-2 text-sm text-muted">Acesso ao painel administrativo</p>
        </div>

        <div className="rounded-3xl border border-rose-100/80 bg-white/80 p-8 shadow-xl shadow-rose-100/50 backdrop-blur-xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="admin@correioelegante.com"
                className="h-12 rounded-2xl"
                {...form.register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-2xl"
                {...form.register("password")}
              />
            </div>
            {error && (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="h-12 w-full rounded-2xl text-base"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Entrar no painel"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          EREM Carlos Pena Filho · Dia dos Namorados
        </p>
      </div>
    </div>
  );
}

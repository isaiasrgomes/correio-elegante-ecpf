"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { settingsSchema, type SettingsForm } from "@/lib/settings-validation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pixEnabled: false,
    },
  });

  const pixEnabled = form.watch("pixEnabled");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          form.reset({ pixEnabled: data.settings.pix_enabled });
        }
        setLoading(false);
      });
  }, [form]);

  const onSubmit = form.handleSubmit(async (data) => {
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  if (loading) {
    return (
      <div className="max-w-xl animate-pulse space-y-4">
        <div className="h-40 rounded-3xl bg-rose-100/60" />
        <div className="h-12 w-40 rounded-2xl bg-rose-100/60" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-rose-100/80 bg-white/70 shadow-sm backdrop-blur-sm">
        <div className="border-b border-rose-50 bg-gradient-to-r from-rose-50/80 to-white px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-200/50">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#2a1a1f]">Pagamentos Pix</h3>
              <p className="mt-0.5 text-xs text-muted">
                QR Codes estáticos por produto na etapa de pagamento
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
              pixEnabled
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-800"
                : "border-amber-200 bg-amber-50/80 text-amber-900"
            )}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {pixEnabled
              ? "Pagamentos ativos — clientes podem finalizar pedidos."
              : "Pagamentos desativados — a etapa Pix ficará bloqueada."}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-rose-50 bg-rose-50/30 px-4 py-4">
            <div>
              <Label htmlFor="pixEnabled" className="text-base font-medium text-[#2a1a1f]">
                Habilitar pagamentos
              </Label>
              <p className="mt-0.5 text-xs text-muted">
                Exige QR Codes configurados em public/qr-codes
              </p>
            </div>
            <Switch
              id="pixEnabled"
              checked={pixEnabled}
              onCheckedChange={(v) => form.setValue("pixEnabled", v)}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="min-w-[200px]"
      >
        {form.formState.isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          "Salvo com sucesso"
        ) : (
          "Salvar configurações"
        )}
      </Button>
    </form>
  );
}

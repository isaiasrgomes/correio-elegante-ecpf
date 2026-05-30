"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  ImageIcon,
  KeyRound,
  Upload,
} from "lucide-react";
import Image from "next/image";
import {
  settingsSchema,
  type SettingsForm,
} from "@/lib/settings-validation";
import {
  PAYMENT_PRODUCTS,
  PRODUCT_QR_CODES,
  type PaymentProductId,
} from "@/lib/qr-codes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetch-json";

function emptyProductRecord(): Record<PaymentProductId, string> {
  return {
    simples: "",
    pirulito: "",
    spotify: "",
    bombom: "",
    polaroid: "",
    flor: "",
    adicionais: "",
  };
}

function resolveQrPreview(
  productId: PaymentProductId,
  customUrl?: string
): string {
  if (customUrl?.trim()) return customUrl.trim();
  return PRODUCT_QR_CODES[productId];
}

export function SettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploadingId, setUploadingId] = useState<PaymentProductId | null>(null);
  const fileInputRefs = useRef<Partial<Record<PaymentProductId, HTMLInputElement>>>({});

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pixEnabled: false,
      productPixKeys: emptyProductRecord(),
      productQrCodes: emptyProductRecord(),
    },
  });

  const pixEnabled = form.watch("pixEnabled");
  const productPixKeys = form.watch("productPixKeys") ?? emptyProductRecord();
  const productQrCodes = form.watch("productQrCodes") ?? emptyProductRecord();

  useEffect(() => {
    fetchJson<{
      settings: {
        pix_enabled: boolean;
        product_pix_keys?: Record<string, string>;
        product_qr_codes?: Record<string, string>;
      } | null;
    }>("/api/admin/settings").then(({ ok, data, error }) => {
      if (!ok) {
        setLoadError(error ?? "Erro ao carregar configurações.");
        setLoading(false);
        return;
      }

      if (data?.settings) {
        const keys = emptyProductRecord();
        const qrCodes = emptyProductRecord();
        const savedKeys = (data.settings.product_pix_keys ?? {}) as Record<string, string>;
        const savedQr = (data.settings.product_qr_codes ?? {}) as Record<string, string>;

        for (const product of PAYMENT_PRODUCTS) {
          keys[product.id] = savedKeys[product.id] ?? "";
          qrCodes[product.id] = savedQr[product.id] ?? "";
        }

        form.reset({
          pixEnabled: data.settings.pix_enabled,
          productPixKeys: keys,
          productQrCodes: qrCodes,
        });
      }
      setLoading(false);
    });
  }, [form]);

  const onSubmit = form.handleSubmit(async (data) => {
    setSaved(false);
    const { ok } = await fetchJson("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const handleQrUpload = async (productId: PaymentProductId, file: File) => {
    setUploadingId(productId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      const { ok, data: json, error } = await fetchJson<{ url: string; error?: string }>(
        "/api/admin/qr-code",
        { method: "POST", body: formData }
      );
      if (!ok || !json?.url) throw new Error(error ?? json?.error ?? "Erro no upload.");

      const current = form.getValues("productQrCodes") ?? emptyProductRecord();
      const updatedQrCodes = { ...current, [productId]: json.url };
      form.setValue("productQrCodes", updatedQrCodes);

      const { ok: saved } = await fetchJson("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixEnabled: form.getValues("pixEnabled"),
          productPixKeys: form.getValues("productPixKeys"),
          productQrCodes: updatedQrCodes,
        }),
      });
      if (!saved) {
        alert("QR enviado, mas não foi possível salvar. Clique em Salvar configurações.");
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro no upload.");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-4">
        <div className="h-40 rounded-3xl bg-rose-100/60" />
        <div className="h-64 rounded-3xl bg-rose-100/60" />
        <div className="h-12 w-40 rounded-2xl bg-rose-100/60" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-rose-100/80 bg-white/70 shadow-sm backdrop-blur-sm">
        <div className="border-b border-rose-50 bg-gradient-to-r from-rose-50/80 to-white px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-200/50">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#2a1a1f]">Pagamentos Pix</h3>
              <p className="mt-0.5 text-xs text-muted">
                QR Codes e chaves Pix por produto na etapa de pagamento
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
                Configure chaves Pix e QR Codes abaixo para cada produto
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

      <div className="overflow-hidden rounded-3xl border border-rose-100/80 bg-white/70 shadow-sm backdrop-blur-sm">
        <div className="border-b border-rose-50 bg-gradient-to-r from-rose-50/80 to-white px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-md shadow-rose-200/50">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#2a1a1f]">Chaves Pix e QR Codes</h3>
              <p className="mt-0.5 text-xs text-muted">
                Clientes podem pagar pelo QR Code ou copiar a chave Pix
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {PAYMENT_PRODUCTS.map((product) => {
            const previewSrc = resolveQrPreview(
              product.id,
              productQrCodes[product.id]
            );
            const isUploading = uploadingId === product.id;

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-rose-50 bg-rose-50/20 p-4"
              >
                <p className="font-medium text-[#2a1a1f]">{product.name}</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-2">
                      <Image
                        src={previewSrc}
                        alt={`QR Code ${product.name}`}
                        width={120}
                        height={120}
                        className="h-[120px] w-[120px] object-contain"
                        unoptimized={previewSrc.startsWith("http")}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                        </div>
                      )}
                    </div>
                    <input
                      ref={(el) => {
                        if (el) fileInputRefs.current[product.id] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleQrUpload(product.id, file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => fileInputRefs.current[product.id]?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Trocar QR
                        </>
                      )}
                    </Button>
                    {!productQrCodes[product.id]?.trim() && (
                      <p className="flex items-center gap-1 text-[10px] text-muted">
                        <ImageIcon className="h-3 w-3" />
                        Usando imagem padrão
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`pix-${product.id}`}>Chave Pix</Label>
                    <Input
                      id={`pix-${product.id}`}
                      placeholder="E-mail, CPF, telefone ou chave aleatória"
                      value={productPixKeys[product.id] ?? ""}
                      onChange={(e) => {
                        const current = form.getValues("productPixKeys") ?? emptyProductRecord();
                        form.setValue("productPixKeys", {
                          ...current,
                          [product.id]: e.target.value,
                        });
                      }}
                    />
                    <p className="text-xs text-muted">
                      Exibida como opção alternativa ao QR Code no checkout
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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

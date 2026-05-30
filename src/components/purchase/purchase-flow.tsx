"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Loader2, Minus, Plus } from "lucide-react";
import { LETTER_TYPES, EXTRAS, CLASSES, MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { CopyPixKeyButton } from "@/components/purchase/copy-pix-key-button";
import { orderSchema, type OrderFormValues } from "@/lib/validations";
import { calculateTotal } from "@/lib/order-utils";
import { formatCurrency } from "@/lib/utils";
import { LetterCard } from "@/components/shared/letter-card";
import { OrderSummary } from "@/components/purchase/order-summary";
import { ImageUpload } from "@/components/purchase/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetch-json";

const STEPS = ["Tipo", "Detalhes", "Pagamento", "Concluído"] as const;

type ExtraState = { id: "pirulito" | "bombom"; quantity: number };

export function PurchaseFlow() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("tipo");

  const [step, setStep] = useState(0);
  const [letterTypeId, setLetterTypeId] = useState<string | null>(preselected);
  const [extras, setExtras] = useState<ExtraState[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<{ src: string; label: string }[]>([]);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [paymentsAvailable, setPaymentsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [formId] = useState("purchase-form");
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(true);

  const letter = LETTER_TYPES.find((l) => l.id === letterTypeId);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      letterType: (preselected as OrderFormValues["letterType"]) ?? "simples",
      receiverName: "",
      receiverClass: "1°A",
      identificationMode: "ANONYMOUS",
      senderIsStudent: true,
      message: "",
      spotifyLink: "",
      extras: [],
    },
  });

  const identificationMode = form.watch("identificationMode");
  const senderIsStudent = form.watch("senderIsStudent");
  const message = form.watch("message");

  useEffect(() => {
    if (preselected && LETTER_TYPES.some((l) => l.id === preselected)) {
      setLetterTypeId(preselected);
      form.setValue("letterType", preselected as OrderFormValues["letterType"]);
    }
  }, [preselected, form]);

  const total = useMemo(
    () => (letterTypeId ? calculateTotal(letterTypeId, extras) : 0),
    [letterTypeId, extras]
  );

  const toggleExtra = (id: "pirulito" | "bombom") => {
    setExtras((prev) => {
      const exists = prev.find((e) => e.id === id);
      if (exists) return prev.filter((e) => e.id !== id);
      return [...prev, { id, quantity: 1 }];
    });
  };

  const updateExtraQty = (id: string, delta: number) => {
    setExtras((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const qty = Math.max(1, e.quantity + delta);
        return { ...e, quantity: qty };
      })
    );
  };

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const onStep1Next = () => {
    if (!letterTypeId) {
      setGlobalError("Selecione um tipo de carta para continuar.");
      return;
    }
    form.setValue("letterType", letterTypeId as OrderFormValues["letterType"]);
    setGlobalError(null);
    goNext();
  };

  const onStep2Next = form.handleSubmit(async (data) => {
    setGlobalError(null);
    setSubmitting(true);
    try {
      const { ok, data: json, error } = await fetchJson<{
        orderId: string;
        qrCodes?: { src: string; label: string }[];
        pixKey?: string | null;
        paymentsAvailable?: boolean;
        error?: string;
      }>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          letterType: letterTypeId,
          extras: extras.filter((e) => e.quantity > 0),
        }),
      });
      if (!ok || !json) throw new Error(error ?? json?.error ?? "Erro ao criar pedido.");
      setOrderId(json.orderId);
      setQrCodes(json.qrCodes ?? []);
      setPixKey(json.pixKey ?? null);
      setPaymentsAvailable(json.paymentsAvailable ?? true);
      goNext();
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : "Erro ao salvar pedido.");
    } finally {
      setSubmitting(false);
    }
  });

  const confirmPayment = async () => {
    if (!orderId) return;
    setPaymentLoading(true);
    try {
      const { ok, data: json, error } = await fetchJson<{ status: string; error?: string }>(
        `/api/orders/${orderId}/confirm-payment`,
        { method: "POST" }
      );
      if (!ok || !json) throw new Error(error ?? json?.error ?? "Erro ao confirmar.");

      if (json.status === "AWAITING_PRODUCTION") {
        goNext();
      }
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : "Erro na confirmação.");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 2 || !orderId) return;

    const poll = setInterval(async () => {
      const { ok, data: json } = await fetchJson<{ status: string }>(
        `/api/orders/${orderId}/status`
      );
      if (!ok || !json) return;
      if (json.status === "AWAITING_PRODUCTION" || json.status === "COMPLETED") {
        setStep(3);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [step, orderId]);

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0 }),
  };

  const summaryProps = {
    letterTypeId,
    extras,
    paymentStep: step === 2,
    paymentsAvailable,
    qrCodes,
    pixKey,
    paymentLoading,
    onConfirmPayment: confirmPayment,
    showContinue: step === 1,
    continueLoading: submitting,
    onContinue: () => {
      const formEl = document.getElementById(formId) as HTMLFormElement | null;
      formEl?.requestSubmit();
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 to-white pb-6 pt-8 lg:pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-dark transition hover:text-rose-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
          <div className="flex gap-2">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex",
                  i === step
                    ? "bg-rose-600 text-white"
                    : i < step
                      ? "bg-rose-100 text-rose-700"
                      : "bg-rose-50 text-rose-400"
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
          <div className="overflow-hidden">
            {globalError && (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {globalError}
              </p>
            )}

            <AnimatePresence mode="wait" custom={step}>
              {step === 0 && (
                <motion.div
                  key="step0"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <h1 className="text-2xl font-bold text-[#2a1a1f] sm:text-3xl">
                    Escolha sua carta
                  </h1>
                  <p className="mt-2 text-muted">
                    Selecione o presente perfeito para quem você ama.
                  </p>
                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    {LETTER_TYPES.map((l) => (
                      <LetterCard
                        key={l.id}
                        id={l.id}
                        name={l.name}
                        price={l.price}
                        description={l.description}
                        image={l.image}
                        selected={letterTypeId === l.id}
                        compact
                        onSelect={() => setLetterTypeId(l.id)}
                      />
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button onClick={onStep1Next} disabled={!letterTypeId}>
                      Próximo passo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 1 && letter && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <h1 className="text-2xl font-bold text-[#2a1a1f]">Detalhes da carta</h1>
                  <p className="mt-2 text-muted">
                    Preencha com carinho — cada palavra importa.
                  </p>

                  <form id={formId} onSubmit={onStep2Next} className="mt-8 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nome de quem vai receber</Label>
                        <Input
                          {...form.register("receiverName")}
                          placeholder="Nome completo"
                        />
                        {form.formState.errors.receiverName && (
                          <p className="text-xs text-red-600">
                            {form.formState.errors.receiverName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Turma de quem vai receber</Label>
                        <Select
                          value={form.watch("receiverClass")}
                          onValueChange={(v) =>
                            form.setValue("receiverClass", v as OrderFormValues["receiverClass"])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {CLASSES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-rose-100 bg-white/60 p-5">
                      <Label className="mb-3 block">Como deseja enviar?</Label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => {
                            form.setValue("identificationMode", "IDENTIFIED");
                            form.setValue("senderIsStudent", true);
                          }}
                          className={cn(
                            "flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                            identificationMode === "IDENTIFIED"
                              ? "border-rose-400 bg-rose-50 text-rose-800"
                              : "border-rose-100 hover:border-rose-200"
                          )}
                        >
                          Desejo me identificar
                        </button>
                        <button
                          type="button"
                          onClick={() => form.setValue("identificationMode", "ANONYMOUS")}
                          className={cn(
                            "flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                            identificationMode === "ANONYMOUS"
                              ? "border-rose-400 bg-rose-50 text-rose-800"
                              : "border-rose-100 hover:border-rose-200"
                          )}
                        >
                          Enviar anonimamente
                        </button>
                      </div>
                    </div>

                    {identificationMode === "IDENTIFIED" && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-rose-50 bg-white/80 px-4 py-3">
                          <Label className="mb-3 block text-sm">Você é aluno?</Label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => {
                                form.setValue("senderIsStudent", true);
                              }}
                              className={cn(
                                "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition",
                                senderIsStudent !== false
                                  ? "border-rose-400 bg-rose-50 text-rose-800"
                                  : "border-rose-100 hover:border-rose-200"
                              )}
                            >
                              Sim, sou aluno
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                form.setValue("senderIsStudent", false);
                                form.setValue("senderClass", undefined);
                              }}
                              className={cn(
                                "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition",
                                senderIsStudent === false
                                  ? "border-rose-400 bg-rose-50 text-rose-800"
                                  : "border-rose-100 hover:border-rose-200"
                              )}
                            >
                              Não sou aluno
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Seu nome</Label>
                            <Input {...form.register("senderName")} placeholder="Como você se chama" />
                            {form.formState.errors.senderName && (
                              <p className="text-xs text-red-600">
                                {form.formState.errors.senderName.message}
                              </p>
                            )}
                          </div>
                          {senderIsStudent !== false && (
                            <div className="space-y-2">
                              <Label>Sua turma</Label>
                              <Select
                                value={form.watch("senderClass") ?? ""}
                                onValueChange={(v) =>
                                  form.setValue("senderClass", v as OrderFormValues["senderClass"])
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CLASSES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {form.formState.errors.senderClass && (
                                <p className="text-xs text-red-600">
                                  {form.formState.errors.senderClass.message}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Sua mensagem</Label>
                        <span className="text-xs text-muted">
                          {message.length}/{MAX_MESSAGE_LENGTH}
                        </span>
                      </div>
                      <Textarea
                        {...form.register("message")}
                        maxLength={MAX_MESSAGE_LENGTH}
                        placeholder="Escreva o que seu coração quiser dizer..."
                      />
                      {form.formState.errors.message && (
                        <p className="text-xs text-red-600">
                          {form.formState.errors.message.message}
                        </p>
                      )}
                    </div>

                    {letter.features.includes("spotify") && (
                      <div className="space-y-2">
                        <Label>Link da música no Spotify</Label>
                        <Input
                          {...form.register("spotifyLink")}
                          placeholder="https://open.spotify.com/track/..."
                        />
                        {form.formState.errors.spotifyLink && (
                          <p className="text-xs text-red-600">
                            {form.formState.errors.spotifyLink.message}
                          </p>
                        )}
                      </div>
                    )}

                    {letter.features.includes("polaroid") && (
                      <div className="space-y-2">
                        <Label>Foto para polaroid</Label>
                        <ImageUpload
                          value={form.watch("polaroidUrl")}
                          onChange={(url) => form.setValue("polaroidUrl", url)}
                        />
                        {form.formState.errors.polaroidUrl && (
                          <p className="text-xs text-red-600">
                            {form.formState.errors.polaroidUrl.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="rounded-3xl border border-rose-100 bg-white/60 p-5">
                      <Label className="mb-4 block">Adicionais opcionais</Label>
                      <div className="space-y-4">
                        {EXTRAS.map((extra) => {
                          const selected = extras.find((e) => e.id === extra.id);
                          return (
                            <div
                              key={extra.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-50 bg-white/80 px-4 py-3"
                            >
                              <div>
                                <p className="font-medium text-[#2a1a1f]">{extra.name}</p>
                                <p className="text-sm text-rose-600">
                                  {formatCurrency(extra.price)}
                                </p>
                              </div>
                              {selected ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateExtraQty(extra.id, -1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="min-w-[2rem] text-center font-semibold">
                                    {selected.quantity}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateExtraQty(extra.id, 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExtra(extra.id)}
                                  >
                                    Remover
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => toggleExtra(extra.id)}
                                >
                                  Adicionar
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-start lg:hidden">
                      <Button type="button" variant="secondary" onClick={goBack}>
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                      </Button>
                    </div>
                    <div className="hidden justify-between gap-4 lg:flex">
                      <Button type="button" variant="secondary" onClick={goBack}>
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            Ir para pagamento
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <h1 className="text-2xl font-bold text-[#2a1a1f]">Pagamento via Pix</h1>
                  <p className="mt-2 text-muted">
                    Valor total:{" "}
                    <strong className="text-rose-600">{formatCurrency(total)}</strong>
                  </p>

                  {!paymentsAvailable ? (
                    <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/80 p-6 text-center">
                      <p className="font-medium text-amber-900">
                        Os pagamentos ainda não estão disponíveis no momento.
                      </p>
                      <p className="mt-2 text-sm text-amber-800/80">
                        Tente novamente em breve ou entre em contato com a organização.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-8 flex flex-col items-center gap-6">
                      <div className="flex flex-wrap justify-center gap-6">
                        {qrCodes.map((qr) => (
                          <div key={qr.src} className="text-center">
                            <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white p-4 shadow-lg">
                              <Image
                                src={qr.src}
                                alt={`QR Code ${qr.label}`}
                                width={240}
                                height={240}
                                className="h-[200px] w-[200px] object-contain sm:h-[240px] sm:w-[240px]"
                                unoptimized={qr.src.startsWith("http")}
                              />
                            </div>
                            {qr.label ? (
                              <p className="mt-2 text-sm font-medium text-[#2a1a1f]">
                                {qr.label}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <p className="max-w-md text-center text-sm text-muted">
                        Escaneie o QR Code correspondente ao seu pedido. Se houver
                        adicionais, realize também o pagamento do segundo código.
                      </p>
                      {pixKey && (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 px-5 py-4">
                          <p className="text-center text-sm text-muted">
                            Prefere pagar sem QR Code? Copie a chave Pix abaixo:
                          </p>
                          <CopyPixKeyButton pixKey={pixKey} />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-8">
                    <Button type="button" variant="ghost" onClick={goBack}>
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-xl shadow-rose-400/40">
                    <span className="text-3xl font-bold">OK</span>
                  </div>
                  <h1 className="text-3xl font-bold text-[#2a1a1f]">Pedido confirmado</h1>
                  <p className="mx-auto mt-4 max-w-md text-muted">
                    Sua carta foi registrada e em breve será preparada com todo carinho.
                    Obrigado por fazer parte do Correio Elegante.
                  </p>
                  <Button asChild className="mt-8">
                    <Link href="/">Voltar ao início</Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {step < 3 && (
            <OrderSummary
              {...summaryProps}
              className="mt-8 hidden lg:block lg:mt-0"
            />
          )}
        </div>
      </div>

      {step < 3 && step > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
          <OrderSummary
            {...summaryProps}
            collapsible
            expanded={mobileSummaryOpen}
            onExpandedChange={setMobileSummaryOpen}
          />
        </div>
      )}

      {step === 1 && (
        <div
          className={cn("lg:hidden", mobileSummaryOpen ? "h-44" : "h-[4.5rem]")}
          aria-hidden
        />
      )}
      {step === 2 && (
        <div
          className={cn("lg:hidden", mobileSummaryOpen ? "h-56" : "h-[4.5rem]")}
          aria-hidden
        />
      )}
    </div>
  );
}

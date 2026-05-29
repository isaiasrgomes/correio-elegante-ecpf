"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { EXTRAS, LETTER_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { calculateTotal } from "@/lib/order-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QrCodeItem {
  src: string;
  label: string;
}

interface OrderSummaryProps {
  letterTypeId: string | null;
  extras: { id: string; quantity: number }[];
  className?: string;
  paymentStep?: boolean;
  paymentsAvailable?: boolean;
  qrCodes?: QrCodeItem[];
  paymentLoading?: boolean;
  onConfirmPayment?: () => void;
  showContinue?: boolean;
  continueLoading?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function OrderSummary({
  letterTypeId,
  extras,
  className,
  paymentStep,
  paymentsAvailable,
  qrCodes = [],
  paymentLoading,
  onConfirmPayment,
  showContinue,
  continueLoading,
  onContinue,
  continueLabel = "Ir para pagamento",
  collapsible = false,
  expanded: expandedProp,
  onExpandedChange,
}: OrderSummaryProps) {
  const [expandedInternal, setExpandedInternal] = useState(true);
  const expanded = expandedProp ?? expandedInternal;

  const letter = LETTER_TYPES.find((l) => l.id === letterTypeId);
  const total = letterTypeId ? calculateTotal(letterTypeId, extras) : 0;

  const setExpanded = (value: boolean) => {
    setExpandedInternal(value);
    onExpandedChange?.(value);
  };

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <aside
      className={cn(
        "rounded-3xl border border-rose-100/80 bg-white/80 shadow-xl shadow-rose-100/30 backdrop-blur-xl sm:p-6",
        collapsible ? "p-4" : "p-5",
        className
      )}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={expanded}
          aria-controls="order-summary-content"
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[#2a1a1f]">Resumo do pedido</h3>
            {!expanded && letter && (
              <p className="mt-0.5 truncate text-sm font-medium text-rose-600">
                Total {formatCurrency(total)}
              </p>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-rose-500 transition-transform duration-200 ease-out",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      ) : (
        <h3 className="text-lg font-semibold text-[#2a1a1f]">Resumo do pedido</h3>
      )}

      <motion.div
        id="order-summary-content"
        initial={false}
        animate={{
          height: !collapsible || expanded ? "auto" : 0,
          opacity: !collapsible || expanded ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className={cn(collapsible && "pt-3")}>
          {!letter ? (
            <p className="text-sm text-muted">Selecione uma carta para ver o resumo.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted">{letter.name}</span>
                <span className="font-medium text-[#2a1a1f]">{formatCurrency(letter.price)}</span>
              </div>
              {extras.map((extra) => {
                const item = EXTRAS.find((e) => e.id === extra.id);
                if (!item || extra.quantity < 1) return null;
                return (
                  <div key={extra.id} className="flex justify-between gap-4">
                    <span className="text-muted">
                      {item.name} x{extra.quantity}
                    </span>
                    <span className="font-medium text-[#2a1a1f]">
                      {formatCurrency(item.price * extra.quantity)}
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-rose-100 pt-3">
                <div className="flex justify-between text-base font-bold">
                  <span className="text-[#2a1a1f]">Total</span>
                  <span className="text-rose-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}

          {showContinue && onContinue && (
            <Button
              type="button"
              className="mt-4 w-full"
              onClick={onContinue}
              disabled={continueLoading}
            >
              {continueLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                continueLabel
              )}
            </Button>
          )}

          {paymentStep && (
            <div className="mt-4 space-y-3 border-t border-rose-100 pt-4">
              {!paymentsAvailable ? (
                <p className="text-center text-xs text-amber-800">
                  Os pagamentos ainda não estão disponíveis no momento.
                </p>
              ) : (
                <>
                  {qrCodes.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3">
                      {qrCodes.map((qr) => (
                        <div key={qr.src} className="text-center">
                          <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white p-2">
                            <Image
                              src={qr.src}
                              alt={`QR Code ${qr.label}`}
                              width={120}
                              height={120}
                              className="h-[100px] w-[100px] object-contain sm:h-[120px] sm:w-[120px]"
                            />
                          </div>
                          {qr.label ? (
                            <p className="mt-1 text-[10px] font-medium text-muted">{qr.label}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    className="w-full"
                    onClick={onConfirmPayment}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Já realizei o pagamento"
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </aside>
  );
}

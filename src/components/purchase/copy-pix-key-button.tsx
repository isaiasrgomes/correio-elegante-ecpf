"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyPixKeyButtonProps {
  pixKey: string;
  className?: string;
  size?: "default" | "sm";
}

export function CopyPixKeyButton({
  pixKey,
  className,
  size = "default",
}: CopyPixKeyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Não foi possível copiar a chave. Copie manualmente: " + pixKey);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleCopy}
      className={cn("gap-2", className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Chave copiada!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copiar chave Pix
        </>
      )}
    </Button>
  );
}

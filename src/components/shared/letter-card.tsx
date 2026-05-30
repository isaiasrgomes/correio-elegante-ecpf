"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LETTER_TYPES } from "@/lib/constants";
import { Illustration } from "@/components/shared/illustration";

interface LetterCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export function LetterCard({
  id,
  name,
  price,
  description,
  image,
  selected,
  onSelect,
  compact,
}: LetterCardProps) {
  const imageScale = LETTER_TYPES.find((letter) => letter.id === id)?.imageScale;
  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className={cn(
        "group relative flex flex-col overflow-visible rounded-3xl border bg-white/60 p-5 shadow-lg shadow-rose-200/20 backdrop-blur-md transition-all duration-300",
        selected
          ? "border-rose-400 ring-2 ring-rose-300/50"
          : "border-rose-100/80 hover:border-rose-300/60 hover:shadow-xl hover:shadow-rose-300/20"
      )}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md">
          <Check className="h-4 w-4" />
        </span>
      )}
      <Illustration
        src={image}
        alt={name}
        imageScale={imageScale}
        hoverScale
        className="mx-auto mb-4"
        imageClassName="drop-shadow-sm"
      />
      <h3 className="text-center text-lg font-semibold text-[#2a1a1f]">{name}</h3>
      {!compact && (
        <p className="mt-2 text-center text-sm leading-relaxed text-[#5c4550]">
          {description}
        </p>
      )}
      <p className="mt-3 text-center text-xl font-bold text-rose-600">
        {formatCurrency(price)}
      </p>
      {onSelect && (
        <Button
          type="button"
          variant={selected ? "secondary" : "default"}
          className="mt-4 w-full"
          onClick={onSelect}
        >
          {selected ? "Selecionada" : "Selecionar"}
        </Button>
      )}
    </motion.article>
  );
}

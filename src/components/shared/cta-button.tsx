"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "default" | "secondary";
  size?: "default" | "lg" | "sm";
  className?: string;
}

export function CtaButton({
  href = "/comprar",
  onClick,
  children,
  variant = "default",
  size = "default",
  className,
}: CtaButtonProps) {
  const content = (
    <motion.span
      className="relative inline-flex"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400/40 to-red-400/40 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
      <Button variant={variant} size={size} className={cn("group relative", className)}>
        {children}
      </Button>
    </motion.span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="inline-flex">
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className="inline-flex">
      {content}
    </Link>
  );
}

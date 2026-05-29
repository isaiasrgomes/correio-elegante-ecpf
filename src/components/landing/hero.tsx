"use client";

import { motion } from "framer-motion";
import { CtaButton } from "@/components/shared/cta-button";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="gradient-hero relative min-h-[92vh] overflow-hidden pt-16 pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -12, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 16, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-16 top-48 h-80 w-80 rounded-full bg-red-300/25 blur-3xl"
        />
        <div className="absolute left-1/2 top-20 h-px w-[min(90%,600px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-rose-300/50 to-transparent" />
        <svg
          className="absolute bottom-32 left-[8%] h-24 w-24 text-rose-300/40"
          viewBox="0 0 100 100"
          fill="currentColor"
          aria-hidden
        >
          <path d="M50 88 C20 60 5 40 25 22 C35 12 50 20 50 35 C50 20 65 12 75 22 C95 40 80 60 50 88Z" />
        </svg>
        <svg
          className="absolute right-[12%] top-40 h-16 w-16 text-red-300/30"
          viewBox="0 0 100 100"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 inline-flex rounded-full border border-rose-200/80 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-600 backdrop-blur-sm"
        >
          Dia dos Namorados · EREM Carlos Pena Filho
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold leading-[1.1] tracking-tight text-[#2a1a1f] sm:text-5xl md:text-6xl"
        >
          Diga o que o coração sente,
          <span className="block bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 bg-clip-text text-transparent">
            com uma carta inesquecível
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
        >
          O Correio Elegante transforma suas palavras em um presente único para
          quem você ama — simples, rápido e cheio de emoção.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <CtaButton href="/comprar" size="lg">
            Enviar uma carta
          </CtaButton>
          <Button variant="secondary" size="lg" asChild>
            <a href="#como-funciona">Como funciona</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

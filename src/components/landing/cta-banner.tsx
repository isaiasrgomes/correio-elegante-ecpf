"use client";

import { motion } from "framer-motion";
import { CtaButton } from "@/components/shared/cta-button";

export function CtaBanner() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-rose-200/60 bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 p-10 text-center text-white shadow-2xl shadow-rose-500/30 sm:p-14"
      >
        <h2 className="text-2xl font-bold sm:text-3xl">
          Este Dia dos Namorados merece um gesto verdadeiro
        </h2>
        <p className="mx-auto mt-4 max-w-md text-rose-100">
          Não deixe para depois. Envie sua carta agora e faça alguém sorrir de
          um jeito que só você consegue.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CtaButton
            href="/comprar"
            variant="secondary"
            className="!bg-white !text-rose-700 hover:!bg-rose-50"
          >
            Surpreender alguém
          </CtaButton>
          <CtaButton href="/comprar">Começar pedido</CtaButton>
        </div>
      </motion.div>
    </section>
  );
}

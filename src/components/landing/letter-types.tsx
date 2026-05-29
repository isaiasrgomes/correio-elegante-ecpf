"use client";

import { motion } from "framer-motion";
import { LETTER_TYPES } from "@/lib/constants";
import { LetterCard } from "@/components/shared/letter-card";
import { CtaButton } from "@/components/shared/cta-button";

export function LetterTypes() {
  return (
    <section id="cartas" className="bg-gradient-to-b from-rose-50/50 to-transparent py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-[#2a1a1f] sm:text-4xl">
            Escolha o tipo de carta
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Cada opção foi pensada para tornar seu gesto ainda mais especial.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LETTER_TYPES.map((letter, i) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <LetterCard
                id={letter.id}
                name={letter.name}
                price={letter.price}
                description={letter.description}
                image={letter.image}
                onSelect={() => {
                  window.location.href = `/comprar?tipo=${letter.id}`;
                }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 flex justify-center"
        >
          <CtaButton href="/comprar" size="lg">
            Criar minha carta
          </CtaButton>
        </motion.div>
      </div>
    </section>
  );
}

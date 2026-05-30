"use client";

import { motion } from "framer-motion";
import { HOW_IT_WORKS } from "@/lib/constants";
import { Illustration } from "@/components/shared/illustration";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold text-[#2a1a1f] sm:text-4xl">Como funciona</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Quatro passos simples para surpreender alguém especial neste Dia dos
            Namorados.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item, index) => (
            <motion.article
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center rounded-3xl border border-rose-100/80 bg-white/70 p-6 text-center shadow-lg shadow-rose-100/30 backdrop-blur-md"
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-lg font-bold text-white shadow-md shadow-rose-400/30">
                {item.step}
              </span>
              <Illustration src={item.image} alt="" className="mb-5" />
              <h3 className="text-lg font-semibold text-[#2a1a1f]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

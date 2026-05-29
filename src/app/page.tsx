import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LetterTypes } from "@/components/landing/letter-types";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";
import { CtaButton } from "@/components/shared/cta-button";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <div className="flex justify-center py-8">
          <CtaButton href="/comprar">Enviar agora</CtaButton>
        </div>
        <HowItWorks />
        <LetterTypes />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Correio Elegante | EREM Carlos Pena Filho",
  description:
    "Envie cartas de Dia dos Namorados com carinho. Correio Elegante da EREM Carlos Pena Filho.",
  openGraph: {
    title: "Correio Elegante",
    description: "Surpreenda quem você ama com uma carta especial.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  );
}

import { LETTER_TYPES } from "./constants";

const QR_BASE = "/qr-codes";

export const PAYMENT_PRODUCT_IDS = [
  "simples",
  "pirulito",
  "spotify",
  "bombom",
  "polaroid",
  "flor",
  "adicionais",
] as const;

export type PaymentProductId = (typeof PAYMENT_PRODUCT_IDS)[number];

export const PAYMENT_PRODUCTS: { id: PaymentProductId; name: string }[] = [
  { id: "simples", name: "Carta Simples" },
  { id: "pirulito", name: "Carta + Pirulito" },
  { id: "spotify", name: "Carta + Spotify" },
  { id: "bombom", name: "Carta + Bombom" },
  { id: "polaroid", name: "Carta + Polaroid" },
  { id: "flor", name: "Carta + Flor" },
  { id: "adicionais", name: "Adicionais" },
];

/** Mapa id do produto → imagem QR estática (fallback) */
export const PRODUCT_QR_CODES: Record<string, string> = {
  simples: `${QR_BASE}/carta-simples.png`,
  pirulito: `${QR_BASE}/carta-pirulito.png`,
  spotify: `${QR_BASE}/carta-spotify.png`,
  bombom: `${QR_BASE}/carta-bombom.png`,
  polaroid: `${QR_BASE}/carta-polaroid.png`,
  flor: `${QR_BASE}/carta-flor.png`,
  adicionais: `${QR_BASE}/carta-adicionais.png`,
};

export type ProductPaymentConfig = {
  productPixKeys?: Record<string, string> | null;
  productQrCodes?: Record<string, string> | null;
};

function resolveQrSrc(productId: string, overrides?: Record<string, string> | null) {
  const custom = overrides?.[productId]?.trim();
  if (custom) return custom;
  return PRODUCT_QR_CODES[productId] ?? null;
}

function resolvePaymentProductId(
  letterTypeId: string,
  extras: { id: string; quantity: number }[] = []
): string | null {
  const hasExtras = extras.some((e) => e.quantity > 0);
  if (hasExtras) return "adicionais";
  if (PRODUCT_QR_CODES[letterTypeId]) return letterTypeId;
  return null;
}

export function getQrCodesForOrder(
  letterTypeId: string,
  extras: { id: string; quantity: number }[] = [],
  config: ProductPaymentConfig = {}
): { src: string; label: string }[] {
  const letter = LETTER_TYPES.find((l) => l.id === letterTypeId);
  const productId = resolvePaymentProductId(letterTypeId, extras);
  if (!productId) return [];

  const src = resolveQrSrc(productId, config.productQrCodes);
  if (!src) return [];

  if (productId === "adicionais") {
    return [{ src, label: "" }];
  }

  if (letter) {
    return [{ src, label: letter.name }];
  }

  return [{ src, label: "" }];
}

export function getPixKeyForOrder(
  letterTypeId: string,
  extras: { id: string; quantity: number }[] = [],
  productPixKeys?: Record<string, string> | null
): string | null {
  const productId = resolvePaymentProductId(letterTypeId, extras);
  if (!productId) return null;
  const key = productPixKeys?.[productId]?.trim();
  return key || null;
}

export function getQrCodesForLetter(letterTypeId: string) {
  return getQrCodesForOrder(letterTypeId, []);
}

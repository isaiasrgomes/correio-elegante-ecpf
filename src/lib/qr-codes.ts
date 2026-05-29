import { LETTER_TYPES } from "./constants";

const QR_BASE = "/qr-codes";

/** Mapa id do produto → imagem QR estática */
export const PRODUCT_QR_CODES: Record<string, string> = {
  simples: `${QR_BASE}/carta-simples.png`,
  pirulito: `${QR_BASE}/carta-pirulito.png`,
  spotify: `${QR_BASE}/carta-spotify.png`,
  bombom: `${QR_BASE}/carta-bombom.png`,
  polaroid: `${QR_BASE}/carta-polaroid.png`,
  flor: `${QR_BASE}/carta-flor.png`,
  adicionais: `${QR_BASE}/carta-adicionais.png`,
};

export function getQrCodesForOrder(
  letterTypeId: string,
  extras: { id: string; quantity: number }[] = []
): { src: string; label: string }[] {
  const letter = LETTER_TYPES.find((l) => l.id === letterTypeId);
  const hasExtras = extras.some((e) => e.quantity > 0);

  if (hasExtras && PRODUCT_QR_CODES.adicionais) {
    return [{ src: PRODUCT_QR_CODES.adicionais, label: "" }];
  }

  const mainQr = PRODUCT_QR_CODES[letterTypeId];
  if (mainQr && letter) {
    return [{ src: mainQr, label: letter.name }];
  }

  return [];
}

export function getQrCodesForLetter(letterTypeId: string) {
  return getQrCodesForOrder(letterTypeId, []);
}

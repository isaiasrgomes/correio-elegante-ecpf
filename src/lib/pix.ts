import QRCode from "qrcode";

/** CRC16-CCITT (0xFFFF) conforme manual BACEN Pix */
function crc16Pix(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function sanitizeAscii(value: string, maxLen: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLen);
}

/** Normaliza chave Pix para formato aceito pelos apps bancários */
export function normalizePixKey(key: string): string {
  const trimmed = key.trim();

  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    const phone = digits.length === 10 ? digits : digits.slice(-11);
    return `+55${phone}`;
  }

  if (digits.length === 14) {
    return digits;
  }

  return trimmed;
}

/**
 * Gera payload EMV Pix (BR Code) válido para Nubank, Caixa, BB, etc.
 * Cobrança dinâmica com valor fixo por pedido.
 */
export function buildPixPayload(params: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid?: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount } = params;
  const normalizedKey = normalizePixKey(pixKey);
  const txid = (params.txid ?? "***")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 25) || "CORREIOELEGANTE";

  const gui = formatField("00", "br.gov.bcb.pix");
  const keyField = formatField("01", normalizedKey);
  const merchantAccount = formatField("26", gui + keyField);

  const amountStr = amount.toFixed(2);
  const name = sanitizeAscii(merchantName, 25) || "CORREIO ELEGANTE";
  const city = sanitizeAscii(merchantCity, 15) || "RECIFE";

  const payloadWithoutCrc =
    formatField("00", "01") +
    formatField("01", "12") +
    merchantAccount +
    formatField("52", "0000") +
    formatField("53", "986") +
    formatField("54", amountStr) +
    formatField("58", "BR") +
    formatField("59", name) +
    formatField("60", city) +
    formatField("62", formatField("05", txid)) +
    "6304";

  return payloadWithoutCrc + crc16Pix(payloadWithoutCrc);
}

export async function generatePixQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 280,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export function base64ToQrDataUrl(base64: string): string {
  const clean = base64.replace(/^data:image\/\w+;base64,/, "");
  return `data:image/png;base64,${clean}`;
}

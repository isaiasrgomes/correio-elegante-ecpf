import {
  buildPixPayload,
  generatePixQrDataUrl,
  base64ToQrDataUrl,
} from "./pix";

export type PixProvider = "brcode" | "mercadopago" | "openpix";

export interface PaymentSettings {
  pix_enabled: boolean;
  pix_key: string | null;
  pix_provider: PixProvider | string | null;
  merchant_name: string;
  merchant_city: string;
  mercadopago_access_token: string | null;
  openpix_app_id: string | null;
}

export interface PixChargeResult {
  paymentId: string;
  brCode: string;
  qrDataUrl: string;
  pixKey: string | null;
  provider: PixProvider;
}

export function isPaymentsConfigured(settings: PaymentSettings): boolean {
  if (!settings.pix_enabled) return false;

  const provider = (settings.pix_provider ?? "brcode") as PixProvider;

  switch (provider) {
    case "mercadopago":
      return Boolean(settings.mercadopago_access_token?.trim());
    case "openpix":
      return Boolean(settings.openpix_app_id?.trim());
    default:
      return Boolean(settings.pix_key?.trim());
  }
}

async function createMercadoPagoCharge(params: {
  accessToken: string;
  orderId: string;
  amount: number;
}): Promise<{ paymentId: string; brCode: string; qrDataUrl: string }> {
  const res = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": params.orderId,
    },
    body: JSON.stringify({
      transaction_amount: params.amount,
      description: "Correio Elegante - Carta Dia dos Namorados",
      payment_method_id: "pix",
      external_reference: params.orderId,
      payer: { email: "comprador@correioelegante.com" },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.message ??
      data?.cause?.[0]?.description ??
      "Erro ao gerar cobrança no Mercado Pago.";
    throw new Error(msg);
  }

  const tx = data.point_of_interaction?.transaction_data;
  const brCode = tx?.qr_code as string | undefined;
  const qrBase64 = tx?.qr_code_base64 as string | undefined;

  if (!brCode) {
    throw new Error("Mercado Pago não retornou QR Code Pix.");
  }

  const qrDataUrl = qrBase64
    ? base64ToQrDataUrl(qrBase64)
    : await generatePixQrDataUrl(brCode);

  return {
    paymentId: String(data.id),
    brCode,
    qrDataUrl,
  };
}

async function createOpenPixCharge(params: {
  appId: string;
  orderId: string;
  amount: number;
}): Promise<{ paymentId: string; brCode: string; qrDataUrl: string }> {
  const res = await fetch("https://api.openpix.com.br/api/v1/charge", {
    method: "POST",
    headers: {
      Authorization: params.appId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      correlationID: params.orderId,
      value: Math.round(params.amount * 100),
      comment: "Correio Elegante",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? "Erro ao gerar cobrança na OpenPix.");
  }

  const charge = data.charge;
  const brCode = charge?.brCode as string | undefined;

  if (!brCode) {
    throw new Error("OpenPix não retornou QR Code.");
  }

  let qrDataUrl: string;
  const qrImage = charge?.qrCodeImage as string | undefined;

  if (qrImage?.startsWith("http")) {
    qrDataUrl = qrImage;
  } else if (qrImage) {
    qrDataUrl = base64ToQrDataUrl(qrImage);
  } else {
    qrDataUrl = await generatePixQrDataUrl(brCode);
  }

  return {
    paymentId: charge?.transactionID ?? params.orderId,
    brCode,
    qrDataUrl,
  };
}

async function createBrCodeCharge(params: {
  settings: PaymentSettings;
  orderId: string;
  amount: number;
}): Promise<{ paymentId: string; brCode: string; qrDataUrl: string; pixKey: string }> {
  const pixKey = params.settings.pix_key!.trim();
  const brCode = buildPixPayload({
    pixKey,
    merchantName: params.settings.merchant_name,
    merchantCity: params.settings.merchant_city,
    amount: params.amount,
    txid: params.orderId.replace(/-/g, "").slice(0, 25),
  });

  return {
    paymentId: params.orderId,
    brCode,
    qrDataUrl: await generatePixQrDataUrl(brCode),
    pixKey,
  };
}

export async function createPixCharge(
  settings: PaymentSettings,
  orderId: string,
  amount: number
): Promise<PixChargeResult> {
  const provider = (settings.pix_provider ?? "brcode") as PixProvider;

  switch (provider) {
    case "mercadopago": {
      const result = await createMercadoPagoCharge({
        accessToken: settings.mercadopago_access_token!,
        orderId,
        amount,
      });
      return { ...result, pixKey: null, provider: "mercadopago" };
    }
    case "openpix": {
      const result = await createOpenPixCharge({
        appId: settings.openpix_app_id!,
        orderId,
        amount,
      });
      return { ...result, pixKey: null, provider: "openpix" };
    }
    default: {
      const result = await createBrCodeCharge({ settings, orderId, amount });
      return { ...result, provider: "brcode" };
    }
  }
}

export async function checkMercadoPagoPayment(
  accessToken: string,
  paymentId: string
): Promise<boolean> {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.status === "approved";
}

export async function checkOpenPixPayment(
  appId: string,
  correlationId: string
): Promise<boolean> {
  const res = await fetch(
    `https://api.openpix.com.br/api/v1/charge/${correlationId}`,
    { headers: { Authorization: appId } }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return data.charge?.status === "COMPLETED";
}

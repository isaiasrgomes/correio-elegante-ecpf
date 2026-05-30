import { z } from "zod";
import { PAYMENT_PRODUCT_IDS } from "@/lib/qr-codes";

const productRecordSchema = z.record(z.string().trim());

export const settingsSchema = z.object({
  pixEnabled: z.boolean(),
  productPixKeys: productRecordSchema.optional(),
  productQrCodes: productRecordSchema.optional(),
});

export type SettingsForm = z.infer<typeof settingsSchema>;

export const PAYMENT_PRODUCT_ID_SET = new Set<string>(PAYMENT_PRODUCT_IDS);

export function sanitizeProductRecord(
  record: Record<string, string> | undefined
): Record<string, string> {
  if (!record) return {};
  return Object.fromEntries(
    Object.entries(record).filter(
      ([id, value]) => PAYMENT_PRODUCT_ID_SET.has(id) && value.trim().length > 0
    )
  );
}

import { z } from "zod";
import { CLASSES, LETTER_TYPES, MAX_MESSAGE_LENGTH, SENDER_NON_STUDENT_LABEL } from "./constants";

const letterIds = LETTER_TYPES.map((l) => l.id) as [string, ...string[]];
const classOptions = [...CLASSES] as [string, ...string[]];

export const orderSchema = z
  .object({
    letterType: z.enum(letterIds),
    receiverName: z.string().min(2, "Informe o nome de quem vai receber."),
    receiverClass: z.enum(classOptions),
    identificationMode: z.enum(["IDENTIFIED", "ANONYMOUS"]),
    senderName: z.string().optional(),
    senderIsStudent: z.boolean().optional(),
    senderClass: z.enum(classOptions).optional(),
    message: z
      .string()
      .min(10, "Sua mensagem precisa ter pelo menos 10 caracteres.")
      .max(MAX_MESSAGE_LENGTH),
    spotifyLink: z.string().url("Link do Spotify inválido.").optional().or(z.literal("")),
    polaroidUrl: z.string().optional(),
    extras: z
      .array(
        z.object({
          id: z.enum(["pirulito", "bombom"]),
          quantity: z.number().int().min(1).max(20),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.identificationMode === "IDENTIFIED") {
      if (!data.senderName || data.senderName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe seu nome.",
          path: ["senderName"],
        });
      }
      if (data.senderIsStudent !== false && !data.senderClass) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione sua turma.",
          path: ["senderClass"],
        });
      }
    }

    if (data.letterType === "spotify") {
      if (!data.spotifyLink) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o link da música no Spotify.",
          path: ["spotifyLink"],
        });
      }
    }

    if (data.letterType === "polaroid") {
      if (!data.polaroidUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Envie uma foto para a polaroid.",
          path: ["polaroidUrl"],
        });
      }
    }
  });

export type OrderFormValues = z.infer<typeof orderSchema>;

export function resolveSenderClass(data: OrderFormValues): string | null {
  if (data.identificationMode !== "IDENTIFIED") return null;
  if (data.senderIsStudent === false) return SENDER_NON_STUDENT_LABEL;
  return data.senderClass ?? null;
}

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

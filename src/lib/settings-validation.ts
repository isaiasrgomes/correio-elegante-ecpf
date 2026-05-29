import { z } from "zod";

export const settingsSchema = z.object({
  pixEnabled: z.boolean(),
});

export type SettingsForm = z.infer<typeof settingsSchema>;

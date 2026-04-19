import { z } from "zod";

export const addRecipientSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: z.string().optional(),
});

export const addPortalRecipientSchema = z.object({
  userId: z.string().uuid("Invalid user selected"),
});

export const updateRecipientSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type AddRecipientValues = z.infer<typeof addRecipientSchema>;
export type AddPortalRecipientValues = z.infer<typeof addPortalRecipientSchema>;
export type UpdateRecipientValues = z.infer<typeof updateRecipientSchema>;

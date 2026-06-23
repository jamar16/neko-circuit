import { z } from 'zod';

// ── Reusable field schemas ──────────────────────────────────────────
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(254, 'Email too long')
  .toLowerCase();

// ── Subscribe ───────────────────────────────────────────────────────
export const subscribeSchema = z.object({
  email: emailSchema,
  source: z.string().max(50).default('unknown'),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;

// ── Contact ─────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  email: emailSchema,
  subject: z.string().max(200).optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000)
    .trim(),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ── Signup ──────────────────────────────────────────────────────────
export const signupSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password too long'),
  name: z.string().max(100).trim().optional(),
});
export type SignupInput = z.infer<typeof signupSchema>;

// ── Checkout (client sends product IDs + quantities; prices come from DB) ──
export const checkoutItemSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1).max(10),
  isPreOrder: z.boolean(),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Cart is empty').max(20),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

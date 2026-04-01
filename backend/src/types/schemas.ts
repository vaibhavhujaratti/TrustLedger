import { z } from "zod";

// --- Auth Schemas ---
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CLIENT", "FREELANCER"]),
  displayName: z.string().min(2),
  upiHandle: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- Escrow Schemas ---
export const depositSchema = z.object({
  amount: z.number().positive(),
});

// --- Milestone Schemas ---
export const submitMilestoneSchema = z.object({
  url: z.string().url(),
});

// --- Dispute Schemas ---
export const raiseDisputeSchema = z.object({
  reason: z.string().min(10),
});

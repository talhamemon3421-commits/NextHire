import { z } from 'zod';

// ─── Update Employer Profile Schema ──────────────────────────────────────
export const updateEmployerProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim().optional(),
  phone: z.string().min(7, 'Phone number must be at least 7 characters').max(20).trim().optional().nullable(),
  location: z.string().max(200).trim().optional().nullable(),
  profilePicture: z.string().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

import { z } from 'zod';

// ─── Login Schema ─────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),

  role: z
    .enum(['admin', 'employer', 'jobseeker'], {
      errorMap: () => ({ message: 'Role must be admin, employer, or jobseeker' }),
    })
    .default('jobseeker'),
});

// ─── Register Schema (Jobseeker / Employer self-registration) ─────────────────
const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must not exceed 80 characters')
      .trim(),

    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),

    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),

    confirmPassword: z.string({ required_error: 'Please confirm your password' }),

    role: z.enum(['employer', 'jobseeker'], {
      errorMap: () => ({ message: 'Role must be employer or jobseeker' }),
    }),

    phone: z
      .string()
      .regex(/^(\+92|0)[0-9]{10}$/, 'Enter a valid Pakistani phone number')
      .optional(),

    city: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export { loginSchema, registerSchema };
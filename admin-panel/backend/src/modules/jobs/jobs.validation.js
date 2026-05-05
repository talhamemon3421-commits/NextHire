import { z } from 'zod';

// ─── Create Job Schema ─────────────────────────────────────────────────────
export const createJobSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title must not exceed 150 characters')
    .trim(),

  description: z
    .string({ required_error: 'Description is required' })
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .trim(),

  jobType: z
    .enum(['full-time', 'part-time', 'contract', 'internship', 'freelance'], {
      errorMap: () => ({ message: 'Invalid job type' }),
    }),

  location: z
    .string()
    .optional()
    .nullable(),

  isRemote: z
    .boolean()
    .default(false),

  salary: z.object({
    min: z.number().int().nonnegative().nullable().optional(),
    max: z.number().int().nonnegative().nullable().optional(),
    currency: z.enum(['PKR', 'USD']).default('PKR'),
  }).optional(),

  experienceLevel: z
    .enum(['entry', 'junior', 'mid', 'senior', 'lead'], {
      errorMap: () => ({ message: 'Invalid experience level' }),
    }),

  responsibilities: z
    .array(z.string().min(1).trim())
    .max(15, 'Cannot add more than 15 responsibilities')
    .default([]),

  requirements: z
    .array(z.string().min(1).trim())
    .max(15, 'Cannot add more than 15 requirements')
    .default([]),

  benefits: z
    .array(z.string().min(1).trim())
    .max(15, 'Cannot add more than 15 benefits')
    .default([]),

  skills: z
    .array(z.string().min(1).trim())
    .max(15, 'Cannot add more than 15 skills')
    .default([]),

  deadline: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  isUrgent: z
    .boolean()
    .default(false),
}).refine(
  (data) => data.isRemote || data.location,
  {
    message: 'Non-remote jobs must have a location',
    path: ['location'],
  }
).refine(
  (data) => {
    if (data.salary?.min && data.salary?.max) {
      return data.salary.max >= data.salary.min;
    }
    return true;
  },
  {
    message: 'Max salary must be greater than or equal to min salary',
    path: ['salary'],
  }
);

// ─── Add Requirement Schema ────────────────────────────────────────────────
export const addRequirementSchema = z.object({
  requirement: z
    .string({ required_error: 'Requirement is required' })
    .min(1, 'Requirement cannot be empty')
    .trim(),
});

// ─── Add Benefit Schema ────────────────────────────────────────────────────
export const addBenefitSchema = z.object({
  benefit: z
    .string({ required_error: 'Benefit is required' })
    .min(1, 'Benefit cannot be empty')
    .trim(),
});

// ─── Set Deadline Schema ──────────────────────────────────────────────────
export const setDeadlineSchema = z.object({
  deadline: z
    .string({ required_error: 'Deadline is required' })
    .datetime('Invalid date format'),
});

// ─── Extend Deadline Schema ───────────────────────────────────────────────
export const extendDeadlineSchema = z.object({
  daysToExtend: z
    .number({ required_error: 'Days to extend is required' })
    .int()
    .positive('Days to extend must be greater than 0'),
});

// ─── Update Job Schema ────────────────────────────────────────────────────
export const updateJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150).trim().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000).trim().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance'], {
    errorMap: () => ({ message: 'Invalid job type' }),
  }).optional(),
  location: z.string().optional().nullable(),
  isRemote: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isUrgent: z.boolean().optional(),
  experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead'], {
    errorMap: () => ({ message: 'Invalid experience level' }),
  }).optional(),
  responsibilities: z.array(z.string().min(1).trim()).max(15, 'Cannot have more than 15 responsibilities').optional(),
  requirements: z.array(z.string().min(1).trim()).max(15, 'Cannot have more than 15 requirements').optional(),
  benefits: z.array(z.string().min(1).trim()).max(15, 'Cannot have more than 15 benefits').optional(),
  skills: z.array(z.string().min(1).trim()).max(15, 'Cannot have more than 15 skills').optional(),
  salary: z.object({
    min: z.number().int().nonnegative().nullable().optional(),
    max: z.number().int().nonnegative().nullable().optional(),
    currency: z.enum(['PKR', 'USD']).optional(),
  }).optional(),
  deadline: z.string().datetime('Invalid date format').optional().nullable(),
}).superRefine((data, ctx) => {
  // Only enforce isRemote/location constraint when either field is in the payload
  if ('isRemote' in data || 'location' in data) {
    if (data.isRemote === false && !data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Non-remote jobs must have a location',
        path: ['location'],
      });
    }
  }

  // Only enforce salary range constraint when both sides are present
  if (data.salary?.min != null && data.salary?.max != null) {
    if (data.salary.max < data.salary.min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max salary must be greater than or equal to min salary',
        path: ['salary'],
      });
    }
  }
});

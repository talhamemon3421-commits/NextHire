import { z } from 'zod';
import { EMPLOYER_ALLOWED_STATUSES } from './applications.model.js';

// ─── Update Status (with lifecycle-aware conditional fields) ──────────────────
export const updateStatusSchema = z
  .object({
    status: z.enum(EMPLOYER_ALLOWED_STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${EMPLOYER_ALLOWED_STATUSES.join(', ')}`,
      }),
    }),
    note: z
      .string()
      .max(500, 'Note must not exceed 500 characters')
      .trim()
      .optional()
      .nullable(),
    // Required when transitioning to 'interview'
    interviewDate: z
      .string()
      .datetime({ message: 'interviewDate must be a valid ISO 8601 datetime string' })
      .optional()
      .nullable(),
    interviewLink: z
      .string()
      .url('interviewLink must be a valid URL')
      .optional()
      .nullable(),
    // Required when accepting/rejecting after interview
    hiringNotes: z
      .string()
      .max(2000, 'Hiring notes must not exceed 2000 characters')
      .trim()
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // When moving to interview, require interviewDate
    if (data.status === 'interview' && !data.interviewDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'interviewDate is required when setting status to interview',
        path: ['interviewDate'],
      });
    }

    // Validate interview date is in the future
    if (data.status === 'interview' && data.interviewDate) {
      if (new Date(data.interviewDate) <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Interview date must be in the future',
          path: ['interviewDate'],
        });
      }
    }
  });

// ─── Schedule Interview ───────────────────────────────────────────────────────
export const scheduleInterviewSchema = z
  .object({
    date: z
      .string({ required_error: 'Interview date is required' })
      .datetime({ message: 'date must be a valid ISO 8601 datetime string' }),
    link: z
      .string()
      .url('Interview link must be a valid URL')
      .optional()
      .nullable(),
  })
  .refine((data) => new Date(data.date) > new Date(), {
    message: 'Interview date must be in the future',
    path: ['date'],
  });

// ─── Update Hiring Notes ──────────────────────────────────────────────────────
export const updateHiringNotesSchema = z.object({
  hiringNotes: z
    .string({ required_error: 'hiringNotes is required' })
    .max(2000, 'Hiring notes must not exceed 2000 characters')
    .trim(),
});

// ─── Get Applications Query (query-string params) ─────────────────────────────
export const getApplicationsQuerySchema = z.object({
  status: z
    .enum([
      'pending',
      'reviewing',
      'shortlisted',
      'interview',
      'accepted',
      'rejected',
    ])
    .optional(),

  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .refine((v) => v > 0, { message: 'page must be a positive integer' }),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .refine((v) => v > 0 && v <= 100, {
      message: 'limit must be between 1 and 100',
    }),

  sortBy: z
    .enum(['createdAt', 'updatedAt', 'status'])
    .optional()
    .default('createdAt'),

  order: z.enum(['asc', 'desc']).optional().default('desc'),
});
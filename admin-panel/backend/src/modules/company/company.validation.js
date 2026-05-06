import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((v) => !v || /^https?:\/\//i.test(v), {
    message: 'Must be a valid URL starting with http(s)://',
  });

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'Must be a valid email',
  });

const officeSchema = z.object({
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
});

export const updateCompanyProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional().nullable(),
    shortName: z.string().trim().min(1).max(80).optional().nullable(),
    tagline: z.string().trim().max(200).optional().nullable(),

    branding: z
      .object({
        logo: optionalUrl,
        banner: optionalUrl,
        favicon: optionalUrl,
        primaryColor: z.string().trim().max(20).optional().nullable(),
        secondaryColor: z.string().trim().max(20).optional().nullable(),
      })
      .optional(),

    contact: z
      .object({
        email: optionalEmail,
        phone: z.string().trim().max(40).optional().nullable(),
        website: optionalUrl,
      })
      .optional(),

    socialLinks: z
      .object({
        linkedin: optionalUrl,
        facebook: optionalUrl,
        instagram: optionalUrl,
        youtube: optionalUrl,
        x: optionalUrl,
      })
      .optional(),

    headquarters: z
      .object({
        address: z.string().trim().max(200).optional().nullable(),
        city: z.string().trim().max(80).optional().nullable(),
        state: z.string().trim().max(80).optional().nullable(),
        country: z.string().trim().max(80).optional().nullable(),
        postalCode: z.string().trim().max(30).optional().nullable(),
      })
      .optional(),

    offices: z.array(officeSchema).optional(),

    about: z
      .object({
        foundedYear: z.number().int().min(1800).max(2100).optional().nullable(),
        description: z.string().trim().max(3000).optional().nullable(),
        mission: z.string().trim().max(1200).optional().nullable(),
        vision: z.string().trim().max(1200).optional().nullable(),
        values: z.array(z.string().trim().min(1).max(60)).optional(),
      })
      .optional(),
  })
  .strict();


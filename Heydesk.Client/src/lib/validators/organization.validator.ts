import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, "org name must be at least 2 characters")
    .max(100, "org name must not exceed 100 characters"),
  slug: z
    .string()
    .min(2, "org slug must be at least 2 characters")
    .max(50, "org slug must not exceed 50 characters"),
  url: z
    .string()
    .min(1, "Website URL is required")
});

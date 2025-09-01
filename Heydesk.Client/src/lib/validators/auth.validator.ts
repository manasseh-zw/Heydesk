import { z } from 'zod';

export const signUpSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

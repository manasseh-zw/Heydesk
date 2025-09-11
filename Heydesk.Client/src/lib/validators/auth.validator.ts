import { z } from 'zod';

export const signUpSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Customer (Support Portal) Auth Schemas
export const customerSignUpSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const customerSignInSchema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

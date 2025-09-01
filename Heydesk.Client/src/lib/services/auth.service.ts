import { apiRequest } from "@/lib/api";
import type {
  EmailSignUpRequest,
  EmailSignInRequest,
  GoogleAuthRequest,
  User,
} from "@/lib/types/auth";

export const emailSignUp = async (
  payload: EmailSignUpRequest
): Promise<User> => {
  return apiRequest<User>("/api/auth/email-sign-up", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const emailSignIn = async (
  payload: EmailSignInRequest
): Promise<User> => {
  return apiRequest<User>("/api/auth/email-sign-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const googleAuth = async (payload: GoogleAuthRequest): Promise<User> => {
  return apiRequest<User>("/api/auth/google-auth", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getCurrentUser = async (): Promise<User> => {
  return apiRequest<User>("/api/auth/me");
};

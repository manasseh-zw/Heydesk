import { apiRequest } from "@/lib/api";
import type {
  EmailSignUpRequest,
  EmailSignInRequest,
  GoogleAuthRequest,
  User,
  Customer,
  CustomerSignUpRequest,
  CustomerSignInRequest,
  SelectOrganizationRequest,
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

// Customer Auth Services
export const customerSignUp = async (
  payload: CustomerSignUpRequest
): Promise<Customer> => {
  return apiRequest<Customer>("/api/auth/support/sign-up", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const customerSignIn = async (
  payload: CustomerSignInRequest
): Promise<Customer> => {
  return apiRequest<Customer>("/api/auth/support/sign-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getCurrentCustomer = async (): Promise<Customer> => {
  return apiRequest<Customer>("/api/auth/support/me");
};

export const selectOrganization = async (
  payload: SelectOrganizationRequest
): Promise<Customer> => {
  return apiRequest<Customer>("/api/auth/support/select-organization", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Customer Google Auth
export const customerGoogleAuth = async (
  payload: GoogleAuthRequest
): Promise<Customer> => {
  return apiRequest<Customer>("/api/auth/support/google-auth", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

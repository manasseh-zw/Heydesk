import type { Organization } from "./organization"

export type AuthProvider = "Email" | "Google"


export type User = {
  id: string
  email: string
  username?: string
  avatarUrl?: string
  createdAt: string
  authProvider: AuthProvider
  onboarding: boolean
  organization?: Organization
}

export type EmailSignUpRequest = {
  username: string
  email: string
  password: string
}

export type EmailSignInRequest = {
  userIdentifier: string
  password: string
}

export type GoogleAuthRequest = {
  accessToken: string
}

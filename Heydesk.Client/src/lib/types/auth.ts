export type AuthProvider = "Email" | "Google"

export type User = {
  id: string
  email: string
  username?: string
  avatarUrl?: string
  createdAt: string
  authProvider: AuthProvider
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

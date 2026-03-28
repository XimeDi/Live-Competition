import type { User } from "@/store/useAuthStore"
import { apiJson } from "./client"

export type AuthResponse = {
  user: User
  token: string
}

export function registerAccount(body: {
  username: string
  email: string
  password: string
}): Promise<AuthResponse> {
  return apiJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function loginAccount(body: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return apiJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function fetchCurrentUser(token: string): Promise<User> {
  return apiJson<User>("/api/user/me", { method: "GET", token })
}

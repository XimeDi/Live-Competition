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

export function logoutAccount(token: string): Promise<{ ok: boolean }> {
  return apiJson<{ ok: boolean }>("/auth/logout", { method: "POST", token })
}

export type MatchPointEntry = {
  matchId: string
  teamA: string
  teamB: string
  scoreA: number
  scoreB: number
  pointsEarned: number
  playersRewarded: { name: string; nationality: string; points: number }[]
  createdAt: string
}

export type MatchRecord = {
  id: string
  teamA: string
  teamB: string
  scoreA: number
  scoreB: number
  createdAt: string
}

export function fetchPointsBreakdown(token: string): Promise<{
  history: MatchPointEntry[]
  allMatches: MatchRecord[]
}> {
  return apiJson("/api/user/me/points-breakdown", { method: "GET", token })
}

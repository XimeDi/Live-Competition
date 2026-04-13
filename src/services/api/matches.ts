import { apiJson } from "./client"

export type MatchStatus = "scheduled" | "live" | "finished"

export interface Match {
  id: string
  groupName: string
  homeTeam: string
  awayTeam: string
  homeNationality: string
  awayNationality: string
  homeFlag: string
  awayFlag: string
  homeScore: number | null
  awayScore: number | null
  status: MatchStatus
  matchDate: string | null
  createdAt: string
}

export interface MatchResult {
  ok: boolean
  homeScore: number
  awayScore: number
  usersAffected: number
  totalPointsDistributed: number
}

export function getMatches(): Promise<{ matches: Match[] }> {
  return apiJson<{ matches: Match[] }>("/api/matches")
}

export function adminGetMatches(adminSecret: string): Promise<{ matches: Match[] }> {
  return apiJson<{ matches: Match[] }>("/api/admin/matches", {
    headers: { "X-Admin-Secret": adminSecret },
  })
}

export function adminSetResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
  adminSecret: string
): Promise<MatchResult> {
  return apiJson<MatchResult>(`/api/admin/matches/${matchId}/result`, {
    method: "PUT",
    body: JSON.stringify({ homeScore, awayScore }),
    headers: { "X-Admin-Secret": adminSecret },
  })
}

export function adminSimulateMatch(
  matchId: string,
  adminSecret: string
): Promise<MatchResult> {
  return apiJson<MatchResult>(`/api/admin/matches/${matchId}/simulate`, {
    method: "POST",
    headers: { "X-Admin-Secret": adminSecret },
  })
}

export function adminResetMatch(
  matchId: string,
  adminSecret: string
): Promise<{ ok: boolean }> {
  return apiJson<{ ok: boolean }>(`/api/admin/matches/${matchId}/reset`, {
    method: "POST",
    headers: { "X-Admin-Secret": adminSecret },
  })
}

export function adminDeleteMatch(
  matchId: string,
  adminSecret: string
): Promise<{ ok: boolean }> {
  return apiJson<{ ok: boolean }>(`/api/admin/matches/${matchId}`, {
    method: "DELETE",
    headers: { "X-Admin-Secret": adminSecret },
  })
}

export function adminGetStats(adminSecret: string): Promise<{
  userCount: number
  squadCount: number
  matchCount: number
  finishedCount: number
}> {
  return apiJson(`/api/admin/stats`, {
    headers: { "X-Admin-Secret": adminSecret },
  })
}

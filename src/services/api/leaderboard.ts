import { apiJson } from "./client"

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  points: number
}

export const getLeaderboard = async (
  page = 1,
  limit = 20
): Promise<{ data: LeaderboardEntry[]; nextPage: number | null; total: number }> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return apiJson<{ data: LeaderboardEntry[]; nextPage: number | null; total: number }>(
    `/api/leaderboard?${params}`,
    { method: "GET" }
  )
}

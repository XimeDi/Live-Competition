import { redis } from "./redis.js"
import { findUserById } from "./userStore.js"

/** Global ranking: score = fantasy points, member = user id (Redis sorted set). */
export const LEADERBOARD_KEY = "leaderboard:global"

/** Upsert score in the leaderboard (O(log N)). Call whenever user points change. */
export async function syncLeaderboardScore(userId: string, points: number): Promise<void> {
  await redis.zadd(LEADERBOARD_KEY, points, userId)
}

/** 1-based rank (1 = top), or null if user not in the set. */
export async function getLeaderboardRank(userId: string): Promise<number | null> {
  const r = await redis.zrevrank(LEADERBOARD_KEY, userId)
  if (r === null) return null
  return r + 1
}

export type LeaderboardRow = {
  rank: number
  userId: string
  username: string
  points: number
}

export async function getLeaderboardPage(
  page: number,
  limit: number
): Promise<{ data: LeaderboardRow[]; nextPage: number | null; total: number }> {
  const total = await redis.zcard(LEADERBOARD_KEY)
  if (total === 0) {
    return { data: [], nextPage: null, total: 0 }
  }

  const start = (page - 1) * limit
  if (start >= total) {
    return { data: [], nextPage: null, total }
  }

  const end = start + limit - 1
  const raw = await redis.zrevrange(LEADERBOARD_KEY, start, end, "WITHSCORES")

  const data: LeaderboardRow[] = []
  for (let i = 0; i < raw.length; i += 2) {
    const userId = raw[i]
    const points = Number(raw[i + 1])
    const rank = start + i / 2 + 1
    const user = await findUserById(userId)
    data.push({
      rank,
      userId,
      username: user?.username ?? "Unknown",
      points: Number.isFinite(points) ? Math.round(points) : 0,
    })
  }

  const nextPage = end + 1 < total ? page + 1 : null
  return { data, nextPage, total }
}

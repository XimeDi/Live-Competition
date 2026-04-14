import { redis } from "./redis.js"
import { db } from "./db.js"

/** Tabla de clasificación global en Redis (sorted set: puntos → userId). */
export const LEADERBOARD_KEY = "leaderboard:global"

/** Actualiza el puntaje del usuario en el leaderboard (O(log N)). */
export async function syncLeaderboardScore(userId: string, points: number): Promise<void> {
  await redis.zadd(LEADERBOARD_KEY, points, userId)
}

/** Devuelve el ranking 1-based del usuario, o null si no está en el set. */
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

  const userIds = raw.filter((_, i) => i % 2 === 0)
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true },
  })
  const usernameMap = new Map(users.map((u) => [u.id, u.username]))

  const data: LeaderboardRow[] = []
  for (let i = 0; i < raw.length; i += 2) {
    const userId = raw[i]
    const points = Number(raw[i + 1])
    const rank = start + i / 2 + 1
    data.push({
      rank,
      userId,
      username: usernameMap.get(userId) ?? "Unknown",
      points: Number.isFinite(points) ? Math.round(points) : 0,
    })
  }

  const nextPage = end + 1 < total ? page + 1 : null
  return { data, nextPage, total }
}

/**
 * Match history & points breakdown store (F4.8).
 *
 * Redis layout:
 *   user:{userId}:match_history → Redis list of JSON (MatchPointEntry), newest first
 *
 * Match records are persisted in PostgreSQL (via Prisma).
 * Full audit log is persisted in MongoDB (MatchEvent model).
 * Points are written here by pointsCalculator.ts after each match result.
 */
import { redis } from "./redis.js"

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

const userHistoryKey = (userId: string) => `user:${userId}:match_history`

/** Return the match points breakdown for a single user (F4.8). */
export async function getUserMatchHistory(userId: string): Promise<MatchPointEntry[]> {
  const raws = await redis.lrange(userHistoryKey(userId), 0, -1)
  return raws.map((r) => JSON.parse(r) as MatchPointEntry)
}

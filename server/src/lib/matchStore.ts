/**
 * Match results, scoring engine and points breakdown (F4.1–F4.8).
 *
 * Redis layout:
 *   matches:all          → sorted set  (score = timestamp ms, member = matchId)
 *   match:{id}           → JSON string (MatchRecord)
 *   user:{userId}:match_history → Redis list of JSON (MatchPointEntry), newest first
 */
import { randomUUID } from "node:crypto"
import { redis } from "./redis.js"
import { getAllUserIds, updateUserPoints } from "./userStore.js"
import { syncLeaderboardScore, LEADERBOARD_KEY } from "./leaderboard.js"
import { getSquad } from "./squadStore.js"

export type MatchRecord = {
  id: string
  teamA: string
  teamB: string
  scoreA: number
  scoreB: number
  createdAt: string
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

const MATCHES_ZSET = "matches:all"
const matchKey = (id: string) => `match:${id}`
const userHistoryKey = (userId: string) => `user:${userId}:match_history`

function outcomePoints(teamNationality: string, teamA: string, teamB: string, scoreA: number, scoreB: number): number {
  const isA = teamNationality.toLowerCase() === teamA.toLowerCase()
  const isB = teamNationality.toLowerCase() === teamB.toLowerCase()
  if (!isA && !isB) return 0
  if (scoreA === scoreB) return 1 // draw
  const aWon = scoreA > scoreB
  if (isA && aWon) return 3
  if (isB && !aWon) return 3
  return 0
}

/**
 * Persist a match result and award points to every user whose squad contains
 * players from either national team (F4.2).
 */
export async function addMatch(
  teamA: string,
  teamB: string,
  scoreA: number,
  scoreB: number
): Promise<MatchRecord> {
  const match: MatchRecord = {
    id: randomUUID(),
    teamA,
    teamB,
    scoreA,
    scoreB,
    createdAt: new Date().toISOString(),
  }

  // Persist match record.
  const ts = Date.now()
  await redis.set(matchKey(match.id), JSON.stringify(match))
  await redis.zadd(MATCHES_ZSET, ts, match.id)

  // Award points to all users.
  const userIds = await getAllUserIds()
  await Promise.all(
    userIds.map(async (userId) => {
      const squad = await getSquad(userId)
      if (!squad) return

      const playersRewarded: MatchPointEntry["playersRewarded"] = []
      let totalPoints = 0

      for (const player of squad.players) {
        if (!player) continue
        const pts = outcomePoints(player.nationality, teamA, teamB, scoreA, scoreB)
        if (pts > 0) {
          playersRewarded.push({ name: player.name, nationality: player.nationality, points: pts })
          totalPoints += pts
        }
      }

      if (totalPoints === 0) return

      const newTotal = await updateUserPoints(userId, totalPoints)

      // Sync leaderboard sorted set.
      await syncLeaderboardScore(userId, newTotal)

      // Push breakdown entry to the front of the user's history list.
      const entry: MatchPointEntry = {
        matchId: match.id,
        teamA,
        teamB,
        scoreA,
        scoreB,
        pointsEarned: totalPoints,
        playersRewarded,
        createdAt: match.createdAt,
      }
      await redis.lpush(userHistoryKey(userId), JSON.stringify(entry))
    })
  )

  return match
}

/** Return all matches newest-first (F4.5). */
export async function getAllMatches(): Promise<MatchRecord[]> {
  const total = await redis.zcard(MATCHES_ZSET)
  if (total === 0) return []
  const ids = await redis.zrevrange(MATCHES_ZSET, 0, -1)
  const raws = await Promise.all(ids.map((id) => redis.get(matchKey(id))))
  return raws
    .filter((r): r is string => r !== null)
    .map((r) => JSON.parse(r) as MatchRecord)
}

/** Return the match points breakdown for a single user (F4.8). */
export async function getUserMatchHistory(userId: string): Promise<MatchPointEntry[]> {
  const raws = await redis.lrange(userHistoryKey(userId), 0, -1)
  return raws.map((r) => JSON.parse(r) as MatchPointEntry)
}

import { db } from "./db.js"
import { redis } from "./redis.js"
import { addUserPoints } from "./userStore.js"
import { syncLeaderboardScore } from "./leaderboard.js"
import { MatchEventModel } from "./models/MatchEvent.js"
import type { MatchPointEntry } from "./matchStore.js"

/**
 * F4.2 — Official scoring rules:
 *   Win:  +3 points per player whose national team wins
 *   Draw: +1 point  per player whose national team draws
 *   Loss: +0 points (no points awarded)
 */
function calcPointsForPlayer(
  homeScore: number,
  awayScore: number,
  playerNationality: string,
  homeNationality: string,
  awayNationality: string
): number {
  const isHome = playerNationality === homeNationality
  const isAway = playerNationality === awayNationality
  if (!isHome && !isAway) return 0

  const myScore = isHome ? homeScore : awayScore
  const oppScore = isHome ? awayScore : homeScore

  if (myScore > oppScore) return 3  // Win
  if (myScore === oppScore) return 1 // Draw
  return 0                           // Loss
}

const userHistoryKey = (userId: string) => `user:${userId}:match_history`

export async function calculateMatchPoints(
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
  homeNationality: string,
  awayNationality: string
): Promise<{ usersAffected: number; totalPointsDistributed: number }> {
  // Find all squad players from the two competing nations
  const affectedPlayers = await db.squadPlayer.findMany({
    where: {
      nationality: { in: [homeNationality, awayNationality] },
    },
    include: {
      squad: { select: { userId: true } },
    },
  })

  // Accumulate points + breakdown per user
  const userMap = new Map<
    string,
    { points: number; players: { name: string; nationality: string; points: number }[] }
  >()

  for (const sp of affectedPlayers) {
    const pts = calcPointsForPlayer(
      homeScore,
      awayScore,
      sp.nationality,
      homeNationality,
      awayNationality
    )
    const userId = sp.squad.userId
    const entry = userMap.get(userId) ?? { points: 0, players: [] }
    if (pts > 0) {
      entry.players.push({ name: sp.playerName, nationality: sp.nationality, points: pts })
      entry.points += pts
    }
    userMap.set(userId, entry)
  }

  const createdAt = new Date().toISOString()
  let totalPointsDistributed = 0

  for (const [userId, { points: pts, players }] of userMap) {
    if (pts === 0) continue

    // Persist points to PostgreSQL and sync leaderboard in Redis
    const newPoints = await addUserPoints(userId, pts)
    await syncLeaderboardScore(userId, newPoints)
    totalPointsDistributed += pts

    // Write match history entry to Redis for fast per-user reads (F4.8)
    const entry: MatchPointEntry = {
      matchId,
      teamA: homeTeam,
      teamB: awayTeam,
      scoreA: homeScore,
      scoreB: awayScore,
      pointsEarned: pts,
      playersRewarded: players,
      createdAt,
    }
    await redis.lpush(userHistoryKey(userId), JSON.stringify(entry))
  }

  // Persist MatchEvent to MongoDB (F4.8 — audit log with full breakdown)
  const userBreakdowns = Array.from(userMap.entries())
    .filter(([, { points }]) => points > 0)
    .map(([userId, { points, players }]) => ({ userId, pointsEarned: points, players }))

  await MatchEventModel.findOneAndUpdate(
    { matchId },
    {
      $set: {
        matchId,
        homeTeam,
        awayTeam,
        homeNationality,
        awayNationality,
        homeScore,
        awayScore,
        scoredAt: new Date(),
        usersAffected: userBreakdowns.length,
        totalPointsDistributed,
        userBreakdowns,
      },
    },
    { upsert: true }
  )

  return { usersAffected: userBreakdowns.length, totalPointsDistributed }
}

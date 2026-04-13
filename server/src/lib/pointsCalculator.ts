import { db } from "./db.js"
import { addUserPoints } from "./userStore.js"
import { syncLeaderboardScore } from "./leaderboard.js"
import { MatchEventModel } from "./models/MatchEvent.js"

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

  // Participation
  let pts = 2
  // Result
  if (myScore > oppScore) pts += 6
  else if (myScore === oppScore) pts += 3
  else pts += 1
  // Goals scored by the player's team
  pts += myScore * 2

  return pts
}

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
    if (pts === 0) continue
    const userId = sp.squad.userId
    const entry = userMap.get(userId) ?? { points: 0, players: [] }
    entry.points += pts
    entry.players.push({ name: sp.playerName, nationality: sp.nationality, points: pts })
    userMap.set(userId, entry)
  }

  // Apply points to each user and sync the leaderboard
  let totalPointsDistributed = 0
  for (const [userId, { points: pts }] of userMap) {
    const newPoints = await addUserPoints(userId, pts)
    await syncLeaderboardScore(userId, newPoints)
    totalPointsDistributed += pts
  }

  // Persist MatchEvent to MongoDB (F4.8 — points breakdown audit log)
  const userBreakdowns = Array.from(userMap.entries()).map(([userId, { points, players }]) => ({
    userId,
    pointsEarned: points,
    players,
  }))

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
        usersAffected: userMap.size,
        totalPointsDistributed,
        userBreakdowns,
      },
    },
    { upsert: true }
  )

  return { usersAffected: userMap.size, totalPointsDistributed }
}

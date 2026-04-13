import { db } from "./db.js"
import { addUserPoints } from "./userStore.js"
import { syncLeaderboardScore } from "./leaderboard.js"

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

  // Accumulate points per user
  const userPointsMap = new Map<string, number>()
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
    userPointsMap.set(userId, (userPointsMap.get(userId) ?? 0) + pts)
  }

  // Apply points to each user and sync the leaderboard
  let totalPointsDistributed = 0
  for (const [userId, pts] of userPointsMap) {
    const newPoints = await addUserPoints(userId, pts)
    await syncLeaderboardScore(userId, newPoints)
    totalPointsDistributed += pts
  }

  return { usersAffected: userPointsMap.size, totalPointsDistributed }
}

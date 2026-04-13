/**
 * Motor de resultados y puntuación (F4.1–F4.8). Almacenamiento en Redis:
 *   matches:all                → sorted set (matchId por timestamp)
 *   match:{id}                 → JSON del partido
 *   user:{userId}:match_history → lista de entradas de puntos, más reciente primero
 */
import { randomUUID } from "node:crypto"
import { redis } from "./redis.js"
import { addUserPoints } from "./userStore.js"
import { syncLeaderboardScore, LEADERBOARD_KEY } from "./leaderboard.js"
import { getSquad } from "./squadStore.js"

// Stub: lee IDs de usuarios desde Redis (set users:all)
async function getAllUserIds(): Promise<string[]> {
  const keys = await redis.smembers("users:all")
  return keys
}
const updateUserPoints = addUserPoints

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

/** Guarda el resultado y reparte puntos a usuarios con jugadores de los equipos involucrados (F4.2). */
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

  // Persiste el partido en Redis
  const ts = Date.now()
  await redis.set(matchKey(match.id), JSON.stringify(match))
  await redis.zadd(MATCHES_ZSET, ts, match.id)

  // Reparte puntos a todos los usuarios
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

      // Sincroniza el leaderboard en Redis
      await syncLeaderboardScore(userId, newTotal)

      // Agrega el desglose al historial del usuario
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

/** Devuelve todos los partidos ordenados del más reciente al más antiguo (F4.5). */
export async function getAllMatches(): Promise<MatchRecord[]> {
  const total = await redis.zcard(MATCHES_ZSET)
  if (total === 0) return []
  const ids = await redis.zrevrange(MATCHES_ZSET, 0, -1)
  const raws = await Promise.all(ids.map((id) => redis.get(matchKey(id))))
  return raws
    .filter((r): r is string => r !== null)
    .map((r) => JSON.parse(r) as MatchRecord)
}

/** Devuelve el historial de puntos de un usuario por partido (F4.8). */
export async function getUserMatchHistory(userId: string): Promise<MatchPointEntry[]> {
  const raws = await redis.lrange(userHistoryKey(userId), 0, -1)
  return raws.map((r) => JSON.parse(r) as MatchPointEntry)
}

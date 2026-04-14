/**
 * Squad persistence in Redis (F3.7).
 * Key:  squad:{userId}
 * Value: JSON of StoredSquad
 */
import { redis } from "./redis.js"
import { db } from "./db.js"

export type StoredSquadPlayer = {
  id: string
  name: string
  nationality: string
  club: string
  position: string
  rating: number
  price: number
  photo: string
}

export type StoredSquad = {
  formation: string
  players: (StoredSquadPlayer | null)[]
  updatedAt: string
}

const squadKey = (userId: string) => `squad:${userId}`

export async function getSquad(userId: string): Promise<StoredSquad | null> {
  const raw = await redis.get(squadKey(userId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredSquad
  } catch {
    return null
  }
}

export async function saveSquad(userId: string, squad: Omit<StoredSquad, "updatedAt">): Promise<StoredSquad> {
  const stored: StoredSquad = { ...squad, updatedAt: new Date().toISOString() }
  await redis.set(squadKey(userId), JSON.stringify(stored))

  // Sincronizar también con PostgreSQL para que la UI recupere los equipos usando GET /squad
  const budgetSpent = squad.players.reduce((sum, p) => sum + ((p && p.price) ? p.price : 0), 0)
  const remainingBudget = Math.max(0, 400.0 - budgetSpent)
  
  const savedSquad = await db.squad.upsert({
    where: { userId },
    create: { userId, formation: squad.formation, budget: remainingBudget },
    update: { formation: squad.formation, budget: remainingBudget, updatedAt: new Date() },
  })

  // Reemplaza los jugadores del equipo de forma atómica en PostgreSQL
  await db.squadPlayer.deleteMany({ where: { squadId: savedSquad.id } })

  const rows = squad.players
    .map((p, i) => ({ player: p, index: i }))
    .filter(
      (item): item is { player: NonNullable<typeof item.player>; index: number } =>
        item.player !== null
    )

  if (rows.length > 0) {
    await db.squadPlayer.createMany({
      data: rows.map(({ player, index }) => ({
        squadId: savedSquad.id,
        playerId: player.id.toString(),
        playerName: player.name,
        nationality: player.nationality,
        position: player.position,
        slotIndex: index,
      })),
    })
  }

  return stored
}

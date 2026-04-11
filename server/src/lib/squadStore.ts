/**
 * Squad persistence in Redis (F3.7).
 * Key:  squad:{userId}
 * Value: JSON of StoredSquad
 */
import { redis } from "./redis.js"

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
  return stored
}

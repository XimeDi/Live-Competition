import { db } from "./db.js"
import type { StoredUserRecord } from "./user.js"

export type CreateUserConflict = "email" | "username"

function toStoredRecord(user: {
  id: string
  email: string
  username: string
  passwordHash: string
  points: number
  createdAt: Date
}): StoredUserRecord {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    passwordHash: user.passwordHash,
    points: user.points,
    rank: 0,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function createUserInStore(input: {
  username: string
  email: string
  passwordHash: string
}): Promise<{ user: StoredUserRecord } | { conflict: CreateUserConflict }> {
  const normEmail = input.email.toLowerCase().trim()

  const existing = await db.user.findFirst({
    where: {
      OR: [
        { email: normEmail },
        { username: { equals: input.username, mode: "insensitive" } },
      ],
    },
  })

  if (existing) {
    if (existing.email === normEmail) return { conflict: "email" }
    return { conflict: "username" }
  }

  const user = await db.user.create({
    data: {
      email: normEmail,
      username: input.username,
      passwordHash: input.passwordHash,
      points: 0,
    },
  })

  return { user: toStoredRecord(user) }
}

export async function findUserByEmail(email: string): Promise<StoredUserRecord | null> {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user) return null
  return toStoredRecord(user)
}

export async function findUserById(id: string): Promise<StoredUserRecord | null> {
  const user = await db.user.findUnique({ where: { id } })
  if (!user) return null
  return toStoredRecord(user)
}

export async function addUserPoints(userId: string, delta: number): Promise<number> {
  const user = await db.user.update({
    where: { id: userId },
    data: { points: { increment: delta } },
  })
  return user.points
}

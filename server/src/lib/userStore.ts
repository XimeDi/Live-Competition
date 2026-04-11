import { randomUUID } from "node:crypto"
import { redis } from "./redis.js"
import type { StoredUserRecord } from "./user.js"

const emailKey = (email: string) => `user:email:${email.toLowerCase()}`
const usernameKey = (username: string) => `user:username:${username.toLowerCase()}`
const idKey = (id: string) => `user:id:${id}`
/** Set containing all user IDs — used by the scoring engine to iterate users. */
const ALL_USERS_KEY = "users:all"

export type CreateUserConflict = "email" | "username"

export async function createUserInStore(input: {
  username: string
  email: string
  passwordHash: string
}): Promise<{ user: StoredUserRecord } | { conflict: CreateUserConflict }> {
  const normEmail = input.email.toLowerCase()
  const normUsername = input.username.toLowerCase()
  if (await redis.exists(emailKey(normEmail))) {
    return { conflict: "email" }
  }
  if (await redis.exists(usernameKey(normUsername))) {
    return { conflict: "username" }
  }
  const id = randomUUID()
  const user: StoredUserRecord = {
    id,
    email: input.email.trim(),
    username: input.username,
    passwordHash: input.passwordHash,
    points: 0,
    rank: 0,
    createdAt: new Date().toISOString(),
  }
  const payload = JSON.stringify(user)
  const multi = redis.multi()
  multi.set(emailKey(normEmail), id)
  multi.set(usernameKey(normUsername), id)
  multi.set(idKey(id), payload)
  multi.sadd(ALL_USERS_KEY, id)
  await multi.exec()
  return { user }
}

export async function findUserByEmail(email: string): Promise<StoredUserRecord | null> {
  const id = await redis.get(emailKey(email))
  if (!id) return null
  return findUserById(id)
}

export async function findUserById(id: string): Promise<StoredUserRecord | null> {
  const raw = await redis.get(idKey(id))
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUserRecord
  } catch {
    return null
  }
}

/** Update user's accumulated points and persist back to Redis. */
export async function updateUserPoints(id: string, additionalPoints: number): Promise<number> {
  const user = await findUserById(id)
  if (!user) return 0
  const newPoints = user.points + additionalPoints
  const updated: StoredUserRecord = { ...user, points: newPoints }
  await redis.set(idKey(id), JSON.stringify(updated))
  return newPoints
}

/** Return all registered user IDs. Used by the scoring engine. */
export async function getAllUserIds(): Promise<string[]> {
  return redis.smembers(ALL_USERS_KEY)
}

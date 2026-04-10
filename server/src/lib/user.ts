export type StoredUserRecord = {
  id: string
  email: string
  username: string
  passwordHash: string
  points: number
  rank: number
  createdAt: string
}

export type PublicUser = {
  id: string
  username: string
  points: number
  rank: number
}

export function toPublicUser(user: StoredUserRecord): PublicUser {
  return {
    id: user.id,
    username: user.username,
    points: user.points,
    rank: user.rank,
  }
}

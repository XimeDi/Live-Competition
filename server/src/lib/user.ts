import type { User } from "@prisma/client"

export type PublicUser = {
  id: string
  username: string
  points: number
  rank: number
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    points: user.points,
    rank: user.rank,
  }
}

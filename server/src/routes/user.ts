import type { FastifyInstance } from "fastify"
import { getLeaderboardRank, syncLeaderboardScore } from "../lib/leaderboard.js"
import { findUserById } from "../lib/userStore.js"
import { toPublicUser } from "../lib/user.js"
import { requireAuth } from "../middleware/requireAuth.js"
import { getUserMatchHistory } from "../lib/matchStore.js"
import { getAllMatches } from "../lib/matchStore.js"

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/user/me",
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId
      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" })
      }
      const user = await findUserById(userId)
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" })
      }
      await syncLeaderboardScore(user.id, user.points)
      const liveRank = await getLeaderboardRank(user.id)
      const publicUser = toPublicUser(user)
      return reply.send({
        ...publicUser,
        rank: liveRank ?? publicUser.rank,
      })
    }
  )

  /**
   * F4.8 — points breakdown per match for the authenticated user.
   * Also returns all matches so the UI can show matches where the user earned 0 pts.
   */
  app.get(
    "/user/me/points-breakdown",
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId!
      const [history, allMatches] = await Promise.all([
        getUserMatchHistory(userId),
        getAllMatches(),
      ])
      return reply.send({ history, allMatches })
    }
  )
}

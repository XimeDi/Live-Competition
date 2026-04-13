import type { FastifyInstance } from "fastify"
import { getLeaderboardRank, syncLeaderboardScore } from "../lib/leaderboard.js"
import { findUserById } from "../lib/userStore.js"
import { toPublicUser } from "../lib/user.js"
import { requireAuth } from "../middleware/requireAuth.js"
import { MatchEventModel } from "../lib/models/MatchEvent.js"
import { db } from "../lib/db.js"

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
   *
   * Data source: MongoDB MatchEvent collection (indexed on userBreakdowns.userId).
   * Also returns all matches from PostgreSQL so the UI can show matches where
   * the user earned 0 points.
   */
  app.get(
    "/user/me/points-breakdown",
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId!

      // Fetch all finished matches from PostgreSQL (authoritative schedule)
      const allMatches = await db.match.findMany({
        where: { status: "finished" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          homeTeam: true,
          awayTeam: true,
          homeScore: true,
          awayScore: true,
          homeFlag: true,
          awayFlag: true,
          createdAt: true,
        },
      })

      // Fetch this user's scoring events from MongoDB
      const events = await MatchEventModel.find(
        { "userBreakdowns.userId": userId },
        {
          matchId: 1,
          homeTeam: 1,
          awayTeam: 1,
          homeScore: 1,
          awayScore: 1,
          scoredAt: 1,
          userBreakdowns: { $elemMatch: { userId } },
        }
      )
        .sort({ scoredAt: -1 })
        .lean()

      // Shape the response to match what the frontend expects
      const history = events.map((ev) => {
        const breakdown = ev.userBreakdowns[0]
        return {
          matchId: ev.matchId,
          homeTeam: ev.homeTeam,
          awayTeam: ev.awayTeam,
          homeScore: ev.homeScore,
          awayScore: ev.awayScore,
          scoredAt: ev.scoredAt,
          pointsEarned: breakdown?.pointsEarned ?? 0,
          players: breakdown?.players ?? [],
        }
      })

      return reply.send({ history, allMatches })
    }
  )
}

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

  // Desglose de puntos por partido del usuario autenticado (F4.8)
  app.get(
    "/user/me/points-breakdown",
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId!

      // Partidos finalizados desde PostgreSQL (fuente de verdad)
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

      // Eventos de puntuación del usuario desde MongoDB
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

      // Formatea la respuesta para el frontend
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

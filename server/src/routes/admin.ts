import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { requireAdmin } from "../middleware/requireAdmin.js"
import { db } from "../lib/db.js"
import { calculateMatchPoints } from "../lib/pointsCalculator.js"
import { redis } from "../lib/redis.js"
import { LEADERBOARD_KEY } from "../lib/leaderboard.js"
import { MatchEventModel } from "../lib/models/MatchEvent.js"

// Generador de marcadores aleatorio con distribución ponderada
const SCORE_POOL: [number, number][] = [
  [0, 0], [1, 0], [0, 1], [1, 1],
  [2, 0], [0, 2], [2, 1], [1, 2],
  [2, 2], [3, 0], [0, 3], [3, 1],
  [1, 3], [3, 2], [2, 3], [4, 0],
  [0, 4], [4, 1], [1, 4], [5, 0],
]
const SCORE_WEIGHTS = [4, 10, 10, 8, 8, 8, 10, 10, 5, 5, 5, 7, 7, 5, 5, 2, 2, 2, 2, 1]

function weightedRandom(): [number, number] {
  const total = SCORE_WEIGHTS.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < SCORE_WEIGHTS.length; i++) {
    r -= SCORE_WEIGHTS[i]
    if (r <= 0) return SCORE_POOL[i]
  }
  return [1, 0]
}

const resultBody = z.object({
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
})

const createMatchBody = z.object({
  groupName: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  homeNationality: z.string().min(1),
  awayNationality: z.string().min(1),
  homeFlag: z.string().min(1),
  awayFlag: z.string().min(1),
  matchDate: z.string().optional(),
})

export async function adminRoutes(app: FastifyInstance) {
  // Todas las rutas requieren autenticación de admin
  app.addHook("preHandler", requireAdmin)

  // Lista todos los partidos
  app.get("/matches", async (_request, reply) => {
    const matches = await db.match.findMany({
      orderBy: [{ groupName: "asc" }, { createdAt: "asc" }],
    })
    return reply.send({ matches })
  })

  // Crea un nuevo partido
  app.post("/matches", async (request, reply) => {
    const parsed = createMatchBody.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: "Validation failed", details: parsed.error.flatten().fieldErrors })
    }
    const { matchDate, ...rest } = parsed.data
    const match = await db.match.create({
      data: {
        ...rest,
        matchDate: matchDate ? new Date(matchDate) : null,
        status: "scheduled",
      },
    })
    return reply.status(201).send({ match })
  })

  // Registra el resultado real y reparte puntos
  app.put("/matches/:id/result", async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = resultBody.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: "Validation failed", details: parsed.error.flatten().fieldErrors })
    }

    const match = await db.match.findUnique({ where: { id } })
    if (!match) return reply.status(404).send({ error: "Match not found" })
    if (match.status === "finished") {
      return reply.status(409).send({ error: "Match already finished — reset it first" })
    }

    const { homeScore, awayScore } = parsed.data
    await db.match.update({ where: { id }, data: { homeScore, awayScore, status: "finished" } })

    const stats = await calculateMatchPoints(
      match.id,
      match.homeTeam,
      match.awayTeam,
      homeScore,
      awayScore,
      match.homeNationality,
      match.awayNationality
    )

    return reply.send({ ok: true, homeScore, awayScore, ...stats })
  })

  // Simula un resultado aleatorio y reparte puntos
  app.post("/matches/:id/simulate", async (request, reply) => {
    const { id } = request.params as { id: string }

    const match = await db.match.findUnique({ where: { id } })
    if (!match) return reply.status(404).send({ error: "Match not found" })
    if (match.status === "finished") {
      return reply.status(409).send({ error: "Match already finished — reset it first" })
    }

    const [homeScore, awayScore] = weightedRandom()
    await db.match.update({ where: { id }, data: { homeScore, awayScore, status: "finished" } })

    const stats = await calculateMatchPoints(
      match.id,
      match.homeTeam,
      match.awayTeam,
      homeScore,
      awayScore,
      match.homeNationality,
      match.awayNationality
    )

    return reply.send({ ok: true, homeScore, awayScore, ...stats })
  })

  // Revierte el partido a estado "programado" (borra el resultado)
  app.post("/matches/:id/reset", async (request, reply) => {
    const { id } = request.params as { id: string }

    const event = await MatchEventModel.findOne({ matchId: id })
    if (event) {
      const pipeline = redis.pipeline()
      for (const b of event.userBreakdowns) {
        if (b.pointsEarned > 0) {
          const user = await db.user.update({
            where: { id: b.userId },
            data: { points: { decrement: b.pointsEarned } }
          })
          pipeline.zadd(LEADERBOARD_KEY, user.points, b.userId)
        }
      }
      await pipeline.exec()
      await MatchEventModel.deleteOne({ matchId: id })
    }

    await db.match.update({
      where: { id },
      data: { homeScore: null, awayScore: null, status: "scheduled" },
    })
    return reply.send({ ok: true })
  })

  // Elimina un partido por completo
  app.delete("/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string }
    await db.match.delete({ where: { id } })
    return reply.send({ ok: true })
  })

  // POST /api/admin/matches/simulate-round/:round — simula todos los partidos de una jornada
  app.post("/matches/simulate-round/:round", async (request, reply) => {
    const { round } = request.params as { round: string }
    const roundIdx = Number(round)

    const allMatches = await db.match.findMany({
      orderBy: [{ matchDate: "asc" }, { createdAt: "asc" }],
    })

    const dates = [...new Set(allMatches.map(m => m.matchDate?.toISOString()))].sort()
    const targetDate = dates[roundIdx - 1]

    if (!targetDate) {
      return reply.status(404).send({ error: "Round not found" })
    }

    const matchesToSimulate = allMatches.filter(
      m => m.matchDate?.toISOString() === targetDate && m.status === "scheduled"
    )

    let totalAffected = 0
    let totalPoints = 0

    for (const match of matchesToSimulate) {
      const [homeScore, awayScore] = weightedRandom()
      await db.match.update({ where: { id: match.id }, data: { homeScore, awayScore, status: "finished" } })

      const stats = await calculateMatchPoints(
        match.id,
        match.homeTeam,
        match.awayTeam,
        homeScore,
        awayScore,
        match.homeNationality,
        match.awayNationality
      )
      totalAffected += stats.usersAffected
      totalPoints += stats.totalPointsDistributed
    }

    return reply.send({ ok: true, matchesSimulated: matchesToSimulate.length, totalAffected, totalPoints })
  })

  // POST /api/admin/matches/reset-all — reinicia todos los resultados y puntos
  app.post("/matches/reset-all", async (_request, reply) => {
    await db.match.updateMany({
      data: { homeScore: null, awayScore: null, status: "scheduled" }
    })
    await db.user.updateMany({
      data: { points: 0 }
    })
    
    await MatchEventModel.deleteMany({})

    const allUsers = await db.user.findMany({ select: { id: true } })
    if (allUsers.length > 0) {
      const redisPipeline = redis.pipeline()
      for (const u of allUsers) {
        redisPipeline.zadd(LEADERBOARD_KEY, 0, u.id)
        redisPipeline.del(`user:${u.id}:match_history`)
      }
      await redisPipeline.exec()
    }

    return reply.send({ ok: true })
  })

  // GET /api/admin/stats — estadísticas globales de la plataforma
  app.get("/stats", async (_request, reply) => {
    const [userCount, squadCount, matchCount, finishedCount] = await Promise.all([
      db.user.count(),
      db.squad.count(),
      db.match.count(),
      db.match.count({ where: { status: "finished" } }),
    ])
    return reply.send({ userCount, squadCount, matchCount, finishedCount })
  })
}

import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { getLeaderboardPage } from "../lib/leaderboard.js"

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function leaderboardRoutes(app: FastifyInstance) {
  app.get("/leaderboard", async (request, reply) => {
    const parsed = querySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid query", details: parsed.error.flatten() })
    }
    const { page, limit } = parsed.data
    const result = await getLeaderboardPage(page, limit)
    return reply.send(result)
  })
}

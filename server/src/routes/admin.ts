/**
 * Admin routes (F4.1) — protected by a simple API-key check so the professor
 * can enter match results without a full user account.
 *
 * Header required:  X-Admin-Key: <value of ADMIN_KEY env var>
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"
import { addMatch, getAllMatches } from "../lib/matchStore.js"

async function requireAdminKey(request: FastifyRequest, reply: FastifyReply) {
  const adminKey = process.env.ADMIN_KEY
  if (!adminKey) {
    return reply.status(503).send({ error: "Admin access not configured (ADMIN_KEY not set)" })
  }
  const provided = request.headers["x-admin-key"]
  if (provided !== adminKey) {
    return reply.status(403).send({ error: "Forbidden" })
  }
}

const matchBodySchema = z.object({
  teamA: z.string().min(1),
  teamB: z.string().min(1),
  scoreA: z.coerce.number().int().min(0),
  scoreB: z.coerce.number().int().min(0),
})

export async function adminRoutes(app: FastifyInstance) {
  /** F4.1 — enter a match result. Triggers automatic scoring for all users. */
  app.post("/match", { preHandler: requireAdminKey }, async (request, reply) => {
    const parsed = matchBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid body", details: parsed.error.flatten() })
    }
    const { teamA, teamB, scoreA, scoreB } = parsed.data
    try {
      const match = await addMatch(teamA, teamB, scoreA, scoreB)
      return reply.status(201).send({ match })
    } catch (e) {
      app.log.error(e)
      return reply.status(500).send({ error: "Failed to process match result" })
    }
  })

  /** List all entered match results. */
  app.get("/matches", { preHandler: requireAdminKey }, async (_request, reply) => {
    const matches = await getAllMatches()
    return reply.send({ matches })
  })
}

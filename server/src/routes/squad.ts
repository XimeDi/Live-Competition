import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { requireAuth } from "../middleware/requireAuth.js"
import { getSquad, saveSquad } from "../lib/squadStore.js"

const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  nationality: z.string(),
  club: z.string(),
  position: z.string(),
  rating: z.number(),
  price: z.number(),
  photo: z.string(),
})

const squadBodySchema = z.object({
  formation: z.string().min(1),
  players: z.array(playerSchema.nullable()),
})

export async function squadRoutes(app: FastifyInstance) {
  /** F3.7 — get the user's saved squad. */
  app.get("/squad", { preHandler: requireAuth }, async (request, reply) => {
    const squad = await getSquad(request.userId!)
    if (!squad) return reply.send({ squad: null })
    return reply.send({ squad })
  })

  /** F3.7 — save (overwrite) the user's squad. */
  app.put("/squad", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = squadBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid squad", details: parsed.error.flatten() })
    }
    const saved = await saveSquad(request.userId!, parsed.data)
    return reply.send({ squad: saved })
  })
}

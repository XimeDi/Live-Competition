import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { requireAuth } from "../middleware/requireAuth.js"
import { db } from "../lib/db.js"

const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  nationality: z.string(),
  position: z.string(),
})

const squadBody = z.object({
  formation: z.enum(["4-3-3", "4-4-2", "3-5-2"]),
  budget: z.number().min(0).max(1000),
  players: z.array(z.union([z.null(), playerSchema])).length(11),
})

export async function squadRoutes(app: FastifyInstance) {
  // GET /api/squad — fetch current user's saved squad
  app.get("/squad", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.userId!

    const squad = await db.squad.findUnique({
      where: { userId },
      include: { players: { orderBy: { slotIndex: "asc" } } },
    })

    if (!squad) {
      return reply.send({ squad: null })
    }

    // Build a sparse array of 11 slots (null = empty)
    const playerSlots: (Record<string, unknown> | null)[] = Array(11).fill(null)
    for (const p of squad.players) {
      playerSlots[p.slotIndex] = {
        id: p.playerId,
        name: p.playerName,
        nationality: p.nationality,
        position: p.position,
      }
    }

    return reply.send({
      squad: {
        formation: squad.formation,
        budget: squad.budget,
        players: playerSlots,
      },
    })
  })

  // POST /api/squad — save (upsert) the user's squad
  app.post("/squad", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.userId!

    const parsed = squadBody.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: "Validation failed", details: parsed.error.flatten().fieldErrors })
    }

    const { formation, budget, players } = parsed.data

    // Upsert the squad record
    const squad = await db.squad.upsert({
      where: { userId },
      create: { userId, formation, budget },
      update: { formation, budget, updatedAt: new Date() },
    })

    // Replace squad players atomically
    await db.squadPlayer.deleteMany({ where: { squadId: squad.id } })

    const rows = players
      .map((p, i) => ({ player: p, index: i }))
      .filter(
        (item): item is { player: NonNullable<typeof item.player>; index: number } =>
          item.player !== null
      )

    if (rows.length > 0) {
      await db.squadPlayer.createMany({
        data: rows.map(({ player, index }) => ({
          squadId: squad.id,
          playerId: player.id,
          playerName: player.name,
          nationality: player.nationality,
          position: player.position,
          slotIndex: index,
        })),
      })
    }

    return reply.send({ ok: true })
  })
}

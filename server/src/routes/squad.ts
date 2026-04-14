import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { requireAuth } from "../middleware/requireAuth.js"
import { db } from "../lib/db.js"
import { loadPlayersFromDisk } from "../lib/playersIndex.js"

const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  nationality: z.string(),
  position: z.string(),
})

const squadBody = z.object({
  formation: z.enum(["4-3-3", "4-4-2", "3-5-2"]),
  budget: z.number().min(0).max(400),
  players: z.array(z.union([z.null(), playerSchema])).length(11),
})

export async function squadRoutes(app: FastifyInstance) {
  // Obtiene el equipo guardado del usuario autenticado
  app.get("/squad", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.userId!

    const squad = await db.squad.findUnique({
      where: { userId },
      include: { players: { orderBy: { slotIndex: "asc" } } },
    })

    if (!squad) {
      return reply.send({ squad: null })
    }

    // Arma el array de 11 slots (null = slot vacío)
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

  // Guarda (upsert) el equipo del usuario en PostgreSQL
  app.post("/squad", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.userId!

    const parsed = squadBody.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: "Validation failed", details: parsed.error.flatten().fieldErrors })
    }

    const { formation, players } = parsed.data
    
    // SERVER-SIDE BUDGET VALIDATION
    const allPlayers = await loadPlayersFromDisk()
    let totalSpent = 0

    // Only non-null players
    const activePlayers = players.filter(p => p !== null)
    
    for (const p of activePlayers) {
      const dbPlayer = allPlayers.find(x => String(x.id) === String(p.id))
      if (!dbPlayer) {
        return reply.status(400).send({ error: "Player not found in database", id: p.id })
      }
      totalSpent += dbPlayer.price
    }

    if (totalSpent > 400.0) {
      return reply.status(400).send({ 
        error: "Budget exceeded limit.", 
        spent: totalSpent,
        limit: 400.0 
      })
    }

    const calculatedBudget = Math.max(0, 400.0 - totalSpent)

    // Upsert del registro de equipo
    const squad = await db.squad.upsert({
      where: { userId },
      create: { userId, formation, budget: calculatedBudget },
      update: { formation, budget: calculatedBudget, updatedAt: new Date() },
    })

    // Reemplaza los jugadores del equipo de forma atómica
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

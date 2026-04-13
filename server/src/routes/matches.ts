import type { FastifyInstance } from "fastify"
import { db } from "../lib/db.js"

export async function matchesRoutes(app: FastifyInstance) {
  // GET /api/matches — public list of all matches with current results
  app.get("/matches", async (_request, reply) => {
    const matches = await db.match.findMany({
      orderBy: [{ groupName: "asc" }, { createdAt: "asc" }],
    })
    return reply.send({ matches })
  })
}

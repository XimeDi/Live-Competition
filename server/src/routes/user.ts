import type { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma.js"
import { toPublicUser } from "../lib/user.js"
import { requireAuth } from "../middleware/requireAuth.js"

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/user/me",
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId
      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" })
      }
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" })
      }
      return reply.send(toPublicUser(user))
    }
  )
}

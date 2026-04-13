import type { FastifyReply, FastifyRequest } from "fastify"

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const secret = process.env.ADMIN_SECRET
  if (!secret) {
    return reply.status(503).send({ error: "Admin access not configured on this server" })
  }
  const provided = request.headers["x-admin-secret"]
  if (provided !== secret) {
    return reply.status(403).send({ error: "Forbidden: invalid admin secret" })
  }
}

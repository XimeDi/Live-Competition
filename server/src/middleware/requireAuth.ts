import type { FastifyReply, FastifyRequest } from "fastify"
import { verifyAccessToken } from "../lib/jwt.js"

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Unauthorized" })
  }
  const token = header.slice("Bearer ".length).trim()
  if (!token) {
    return reply.status(401).send({ error: "Unauthorized" })
  }
  try {
    const { sub } = verifyAccessToken(token)
    request.userId = sub
  } catch {
    return reply.status(401).send({ error: "Unauthorized" })
  }
}

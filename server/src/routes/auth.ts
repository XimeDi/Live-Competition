import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { signAccessToken } from "../lib/jwt.js"
import { syncLeaderboardScore } from "../lib/leaderboard.js"
import { hashPassword, verifyPassword } from "../lib/password.js"
import { createUserInStore, findUserByEmail } from "../lib/userStore.js"
import { toPublicUser } from "../lib/user.js"

const registerBody = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const loginBody = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const parsed = registerBody.safeParse(request.body)
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors
      return reply.status(400).send({ error: "Validation failed", details: msg })
    }
    const { username, email, password } = parsed.data
    const passwordHash = await hashPassword(password)
    const result = await createUserInStore({ username, email, passwordHash })
    if ("conflict" in result) {
      return reply.status(409).send({ error: `${result.conflict} already in use` })
    }
    await syncLeaderboardScore(result.user.id, result.user.points)
    const token = signAccessToken(result.user.id)
    return reply.status(201).send({ user: toPublicUser(result.user), token })
  })

  app.post("/login", async (request, reply) => {
    const parsed = loginBody.safeParse(request.body)
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors
      return reply.status(400).send({ error: "Validation failed", details: msg })
    }
    const { email, password } = parsed.data
    const user = await findUserByEmail(email)
    if (!user) {
      return reply.status(401).send({ error: "Invalid email or password" })
    }
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      return reply.status(401).send({ error: "Invalid email or password" })
    }
    await syncLeaderboardScore(user.id, user.points)
    const token = signAccessToken(user.id)
    return reply.send({ user: toPublicUser(user), token })
  })
}

import type { FastifyInstance } from "fastify"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"
import { signAccessToken } from "../lib/jwt.js"
import { hashPassword, verifyPassword } from "../lib/password.js"
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
    try {
      const user = await prisma.user.create({
        data: { username, email, passwordHash },
      })
      const token = signAccessToken(user.id)
      return reply.status(201).send({ user: toPublicUser(user), token })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const target = (e.meta?.target as string[] | undefined) ?? []
        const field = target.includes("email") ? "email" : target.includes("username") ? "username" : "field"
        return reply.status(409).send({ error: `${field} already in use` })
      }
      throw e
    }
  })

  app.post("/login", async (request, reply) => {
    const parsed = loginBody.safeParse(request.body)
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors
      return reply.status(400).send({ error: "Validation failed", details: msg })
    }
    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.status(401).send({ error: "Invalid email or password" })
    }
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      return reply.status(401).send({ error: "Invalid email or password" })
    }
    const token = signAccessToken(user.id)
    return reply.send({ user: toPublicUser(user), token })
  })
}

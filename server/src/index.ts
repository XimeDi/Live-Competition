import "dotenv/config"
import Fastify from "fastify"
import cors from "@fastify/cors"
import { pingRedis, redis } from "./lib/redis.js"
import { db } from "./lib/db.js"
import { syncLeaderboardScore } from "./lib/leaderboard.js"
import { seedMatchesIfEmpty } from "./lib/seedMatches.js"
import { authRoutes } from "./routes/auth.js"
import { leaderboardRoutes } from "./routes/leaderboard.js"
import { userRoutes } from "./routes/user.js"
import { squadRoutes } from "./routes/squad.js"
import { matchesRoutes } from "./routes/matches.js"
import { adminRoutes } from "./routes/admin.js"

const port = Number(process.env.PORT) || 3001
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173"

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: corsOrigin,
  credentials: true,
})

await app.register(authRoutes, { prefix: "/auth" })
await app.register(userRoutes, { prefix: "/api" })
await app.register(leaderboardRoutes, { prefix: "/api" })
await app.register(squadRoutes, { prefix: "/api" })
await app.register(matchesRoutes, { prefix: "/api" })
await app.register(adminRoutes, { prefix: "/api/admin" })

app.get("/health", async (_request, reply) => {
  const redisOk = await pingRedis()
  try {
    await db.$queryRaw`SELECT 1`
    const dbOk = true
    if (!redisOk) {
      return reply.status(503).send({ ok: false, redis: false, db: dbOk })
    }
    return { ok: true, redis: true, db: true }
  } catch {
    return reply.status(503).send({ ok: false, redis: redisOk, db: false })
  }
})

const shutdown = async () => {
  await app.close()
  await redis.quit()
  await db.$disconnect()
  process.exit(0)
}
process.on("SIGINT", () => void shutdown())
process.on("SIGTERM", () => void shutdown())

try {
  // Verify Redis
  const redisOk = await pingRedis()
  if (!redisOk) {
    app.log.error("Redis is not reachable. Set REDIS_URL in .env.")
    process.exit(1)
  }

  // Verify PostgreSQL
  await db.$connect()
  app.log.info("PostgreSQL connected")

  // Warm up leaderboard cache from DB
  const users = await db.user.findMany({ select: { id: true, points: true } })
  for (const u of users) {
    await syncLeaderboardScore(u.id, u.points)
  }
  app.log.info(`Leaderboard synced for ${users.length} user(s)`)

  // Seed initial matches if the table is empty
  await seedMatchesIfEmpty()

  await app.listen({ port, host: "0.0.0.0" })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

import "dotenv/config"
import Fastify from "fastify"
import cors from "@fastify/cors"
import { pingRedis, redis } from "./lib/redis.js"
import { db } from "./lib/db.js"
import { connectMongo, disconnectMongo, pingMongo } from "./lib/mongo.js"
import { syncLeaderboardScore } from "./lib/leaderboard.js"
import { seedMatchesIfEmpty } from "./lib/seedMatches.js"
import { bootstrapPlayersIndexIfEmpty } from "./lib/playersIndex.js"
import { authRoutes } from "./routes/auth.js"
import { leaderboardRoutes } from "./routes/leaderboard.js"
import { userRoutes } from "./routes/user.js"
import { squadRoutes } from "./routes/squad.js"
import { matchesRoutes } from "./routes/matches.js"
import { adminRoutes } from "./routes/admin.js"
import { searchRoutes } from "./routes/search.js"

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
await app.register(searchRoutes, { prefix: "/api" })

app.get("/health", async (_request, reply) => {
  const [redisOk, mongoOk] = await Promise.all([pingRedis(), pingMongo()])
  try {
    await db.$queryRaw`SELECT 1`
    if (!redisOk || !mongoOk) {
      return reply.status(503).send({ ok: false, redis: redisOk, db: true, mongo: mongoOk })
    }
    return { ok: true, redis: true, db: true, mongo: true }
  } catch {
    return reply.status(503).send({ ok: false, redis: redisOk, db: false, mongo: mongoOk })
  }
})

const shutdown = async () => {
  await app.close()
  await redis.quit()
  await db.$disconnect()
  await disconnectMongo()
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

    // Connect MongoDB
    await connectMongo()
    const mongoOk = await pingMongo()
    if (!mongoOk) {
      app.log.error("MongoDB is not reachable. Set MONGODB_URL in .env.")
      process.exit(1)
    }
    app.log.info("MongoDB connected")

    // Warm up leaderboard cache from DB
    const users = await db.user.findMany({ select: { id: true, points: true } })
    for (const u of users) {
      await syncLeaderboardScore(u.id, u.points)
    }
    app.log.info(`Leaderboard synced for ${users.length} user(s)`)

    // Seed initial matches if the table is empty
    await seedMatchesIfEmpty()

    // Bootstrap MongoDB players + Meilisearch index (idempotent)
    await bootstrapPlayersIndexIfEmpty()
    app.log.info("Player index ready (MongoDB → Meilisearch)")

    await app.listen({ port, host: "0.0.0.0" })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

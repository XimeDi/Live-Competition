import "dotenv/config"
import Fastify from "fastify"
import cors from "@fastify/cors"
import { pingRedis, redis } from "./lib/redis.js"
import { authRoutes } from "./routes/auth.js"
import { leaderboardRoutes } from "./routes/leaderboard.js"
import { userRoutes } from "./routes/user.js"

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

app.get("/health", async (_request, reply) => {
  const redisOk = await pingRedis()
  if (!redisOk) {
    return reply.status(503).send({ ok: false, redis: false })
  }
  return { ok: true, redis: true }
})

const shutdown = async () => {
  await app.close()
  await redis.quit()
  process.exit(0)
}
process.on("SIGINT", () => void shutdown())
process.on("SIGTERM", () => void shutdown())

try {
  const redisOk = await pingRedis()
  if (!redisOk) {
    app.log.error(
      "Redis is not reachable. Start Redis (e.g. docker run -d -p 6379:6379 redis:7-alpine) and set REDIS_URL in .env."
    )
    process.exit(1)
  }
  await app.listen({ port, host: "0.0.0.0" })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

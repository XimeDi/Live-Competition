import "dotenv/config"
import Fastify from "fastify"
import cors from "@fastify/cors"
import { meili } from "./lib/meilisearch.js"
import { bootstrapPlayersIndexIfEmpty } from "./lib/playersIndex.js"
import { pingRedis, redis } from "./lib/redis.js"
import { authRoutes } from "./routes/auth.js"
import { leaderboardRoutes } from "./routes/leaderboard.js"
import { searchRoutes } from "./routes/search.js"
import { userRoutes } from "./routes/user.js"
import { squadRoutes } from "./routes/squad.js"
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
await app.register(searchRoutes, { prefix: "/api" })
await app.register(squadRoutes, { prefix: "/api" })
await app.register(adminRoutes, { prefix: "/admin" })

app.get("/health", async (_request, reply) => {
  const redisOk = await pingRedis()
  const meiliOk = await meili.isHealthy()
  if (!redisOk || !meiliOk) {
    return reply.status(503).send({ ok: false, redis: redisOk, meilisearch: meiliOk })
  }
  return { ok: true, redis: true, meilisearch: true }
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
  const meiliOk = await meili.isHealthy()
  if (!meiliOk) {
    app.log.error(
      "Meilisearch is not reachable. Start it (e.g. docker run -d -p 7700:7700 -e MEILI_MASTER_KEY=masterKey getmeili/meilisearch:v1.11) and set MEILISEARCH_HOST / MEILISEARCH_API_KEY in .env."
    )
    process.exit(1)
  }
  await app.listen({ port, host: "0.0.0.0" })
  void bootstrapPlayersIndexIfEmpty()
    .then(() => app.log.info("Player search index ready (Meilisearch)."))
    .catch((err) => app.log.error({ err }, "Failed to bootstrap Meilisearch player index"))
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

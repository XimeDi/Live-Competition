import "dotenv/config"
import Fastify from "fastify"
import cors from "@fastify/cors"
import { authRoutes } from "./routes/auth.js"
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

app.get("/health", async () => ({ ok: true }))

try {
  await app.listen({ port, host: "0.0.0.0" })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

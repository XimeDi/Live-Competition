import { Redis } from "ioredis"

function getRedisUrl(): string {
  const url = process.env.REDIS_URL
  if (!url) {
    throw new Error("REDIS_URL is not set (e.g. redis://localhost:6379)")
  }
  return url
}

const globalForRedis = globalThis as unknown as { redis?: Redis }

function createRedis(): Redis {
  const client = new Redis(getRedisUrl(), {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 8) return null
      return Math.min(times * 150, 2000)
    },
  })
  client.on("error", () => {
    /* Avoid ioredis "Unhandled error event" spam; startup uses pingRedis() */
  })
  return client
}

export const redis: Redis = globalForRedis.redis ?? createRedis()
globalForRedis.redis = redis

export async function pingRedis(): Promise<boolean> {
  try {
    const pong = await redis.ping()
    return pong === "PONG"
  } catch {
    return false
  }
}

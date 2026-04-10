import { Redis } from "ioredis"

function getRedisUrl(): string {
  const url = process.env.REDIS_URL
  if (!url) {
    throw new Error("REDIS_URL is not set (e.g. redis://localhost:6379)")
  }
  return url
}

const globalForRedis = globalThis as unknown as { redis: Redis | undefined }

export const redis: Redis = globalForRedis.redis ?? new Redis(getRedisUrl(), { maxRetriesPerRequest: 3 })

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis
}

export async function pingRedis(): Promise<boolean> {
  try {
    const pong = await redis.ping()
    return pong === "PONG"
  } catch {
    return false
  }
}

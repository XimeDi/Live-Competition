import { redis } from "./redis.js"

/** Redis key prefix for denied JWT IDs (F1.5). */
const DENY_PREFIX = "jwt:denied:"

/**
 * Add a token's jti to the denylist. TTL matches the token's remaining lifetime
 * so the key auto-expires when the token would have expired anyway.
 */
export async function denyToken(jti: string, expEpochSeconds: number): Promise<void> {
  const nowSeconds = Math.floor(Date.now() / 1000)
  const ttl = expEpochSeconds - nowSeconds
  if (ttl <= 0) return // already expired — nothing to blacklist
  await redis.set(`${DENY_PREFIX}${jti}`, "1", "EX", ttl)
}

/** Returns true if the token has been revoked. */
export async function isTokenDenied(jti: string): Promise<boolean> {
  const val = await redis.get(`${DENY_PREFIX}${jti}`)
  return val !== null
}

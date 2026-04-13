import { redis } from "./redis.js"

/** Prefijo de clave Redis para tokens invalidados (F1.5). */
const DENY_PREFIX = "jwt:denied:"

/** Agrega el jti a la lista negra con TTL igual al tiempo restante del token. */
export async function denyToken(jti: string, expEpochSeconds: number): Promise<void> {
  const nowSeconds = Math.floor(Date.now() / 1000)
  const ttl = expEpochSeconds - nowSeconds
  if (ttl <= 0) return // ya expiró, no hay que hacer nada
  await redis.set(`${DENY_PREFIX}${jti}`, "1", "EX", ttl)
}

/** Devuelve true si el token fue revocado. */
export async function isTokenDenied(jti: string): Promise<boolean> {
  const val = await redis.get(`${DENY_PREFIX}${jti}`)
  return val !== null
}

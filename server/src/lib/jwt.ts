import jwt, { type SignOptions } from "jsonwebtoken"
import { randomUUID } from "node:crypto"

export type AccessTokenPayload = {
  sub: string
  /** ID único del token, usado para la lista negra al cerrar sesión (F1.5). */
  jti: string
  /** Fecha de expiración en segundos Unix. */
  exp: number
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  return secret
}

export function signAccessToken(userId: string): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "30d") as SignOptions["expiresIn"]
  const options: SignOptions = { expiresIn, jwtid: randomUUID() }
  return jwt.sign({ sub: userId }, getSecret(), options)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getSecret()) as jwt.JwtPayload & {
    sub?: string
    jti?: string
    exp?: number
  }
  if (typeof decoded.sub !== "string" || !decoded.sub) {
    throw new Error("Invalid token payload")
  }
  if (typeof decoded.jti !== "string" || !decoded.jti) {
    throw new Error("Token missing jti")
  }
  if (typeof decoded.exp !== "number") {
    throw new Error("Token missing exp")
  }
  return { sub: decoded.sub, jti: decoded.jti, exp: decoded.exp }
}

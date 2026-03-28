import jwt, { type SignOptions } from "jsonwebtoken"

export type AccessTokenPayload = {
  sub: string
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
  const options: SignOptions = { expiresIn }
  return jwt.sign({ sub: userId }, getSecret(), options)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getSecret()) as jwt.JwtPayload & { sub?: string }
  if (typeof decoded.sub !== "string" || !decoded.sub) {
    throw new Error("Invalid token payload")
  }
  return { sub: decoded.sub }
}

export class ApiError extends Error {
  readonly status: number
  readonly details: unknown | undefined

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

type ErrorBody = {
  error?: string
  details?: unknown
}

export async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit & { token?: string | null; headers?: Record<string, string> }
): Promise<T> {
  const headers = new Headers()
  const isMutation = ["POST", "PUT", "PATCH"].includes(init?.method?.toUpperCase() || "")
  if (init?.body || isMutation) {
    headers.set("Content-Type", "application/json")
  }

  // Merge extra headers first
  if (init?.headers) {
    for (const [key, value] of Object.entries(init.headers)) {
      headers.set(key, value)
    }
  }

  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`)
  }

  const { token: _token, headers: _headers, ...rest } = init ?? {}
  
  // Ensure mutations have at least an empty body to satisfy Fastify
  const finalInit = { ...rest, headers }
  if (isMutation && !finalInit.body) {
    finalInit.body = "{}"
  }

  const res = await fetch(path, finalInit)
  const body = (await parseJsonSafe(res)) as ErrorBody | T | null
  if (!res.ok) {
    const errBody = body as ErrorBody | null
    const msg =
      typeof errBody?.error === "string"
        ? errBody.error
        : res.statusText || "Request failed"
    throw new ApiError(res.status, msg, errBody?.details)
  }
  return body as T
}

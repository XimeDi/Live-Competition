import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { getSearchFacetMeta, searchPlayersMeili, suggestPlayerNames } from "../lib/playersIndex.js"

/** Comma-separated or repeated query keys → unique trimmed list */
function parseCsvList(s: string | undefined): string[] {
  if (!s || !s.trim()) return []
  return [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))]
}

const searchQuerySchema = z.object({
  q: z.string().optional().default(""),
  nationality: z.string().optional(),
  nationalities: z.string().optional(),
  club: z.string().optional(),
  clubs: z.string().optional(),
  position: z.enum(["GK", "DEF", "MID", "FWD", "ALL"]).optional(),
  minRating: z.coerce.number().min(0).max(99).default(0),
  maxRating: z.coerce.number().min(0).max(99).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).default(300),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
})

const suggestQuerySchema = z.object({
  q: z.string().min(2),
  limit: z.coerce.number().int().min(1).max(20).default(8),
})

export async function searchRoutes(app: FastifyInstance) {
  app.get("/search/suggest", async (request, reply) => {
    const parsed = suggestQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid query", details: parsed.error.flatten() })
    }
    try {
      const suggestions = await suggestPlayerNames(parsed.data.q, parsed.data.limit)
      return reply.send({ suggestions })
    } catch (e) {
      app.log.error(e)
      return reply.status(503).send({ error: "Suggest temporarily unavailable" })
    }
  })

  app.get("/search", async (request, reply) => {
    const parsed = searchQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid query", details: parsed.error.flatten() })
    }
    const q = parsed.data

    let nationalities = parseCsvList(q.nationalities)
    if (nationalities.length === 0 && q.nationality?.trim()) {
      nationalities = [q.nationality.trim()]
    }

    let clubs = parseCsvList(q.clubs)
    if (clubs.length === 0 && q.club?.trim()) {
      clubs = [q.club.trim()]
    }

    try {
      const result = await searchPlayersMeili({
        q: q.q,
        nationalities,
        clubs,
        position: q.position,
        minRating: q.minRating,
        maxRating: q.maxRating,
        minPrice: q.minPrice,
        maxPrice: q.maxPrice,
        page: q.page,
        limit: q.limit,
      })
      return reply.send(result)
    } catch (e) {
      app.log.error(e)
      return reply.status(503).send({ error: "Search temporarily unavailable" })
    }
  })

  app.get("/search/meta", async (_request, reply) => {
    try {
      const meta = await getSearchFacetMeta()
      return reply.send(meta)
    } catch (e) {
      app.log.error(e)
      return reply.status(503).send({ error: "Search meta temporarily unavailable" })
    }
  })
}

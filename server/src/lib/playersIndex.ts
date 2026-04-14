import { readFile } from "node:fs/promises"
import path from "node:path"
import { meili, PLAYERS_INDEX_UID } from "./meilisearch.js"
import { PlayerModel } from "./models/Player.js"

const BATCH_SIZE = 8000
const TASK_TIMEOUT_MS = 600_000 as const

export type MeiliPlayerDoc = {
  id: string
  name: string
  /** Nombre sin acentos para búsqueda fuzzy (F2.2). */
  nameNormalized: string
  photo: string
  nationality: string
  club: string
  position: string
  rating: number
  price: number
}

function playersJsonPath(): string {
  const override = process.env.PLAYERS_JSON_PATH
  if (override) return path.resolve(override)
  return path.resolve(process.cwd(), "../src/data/players.json")
}

function meiliQuoteString(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

/** Elimina acentos para que "Mbappe" encuentre "Mbappé" (F2.2). */
function normalizeForSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}

export async function ensurePlayersIndexExists(): Promise<void> {
  try {
    await meili.getRawIndex(PLAYERS_INDEX_UID)
  } catch {
    await meili.createIndex(PLAYERS_INDEX_UID, { primaryKey: "id" }).waitTask({
      timeout: TASK_TIMEOUT_MS,
    })
  }
}

export async function applyPlayersIndexSettings(): Promise<void> {
  const index = meili.index(PLAYERS_INDEX_UID)
  await index
    .updateSettings({
      searchableAttributes: ["name", "nameNormalized", "club", "nationality"],
      filterableAttributes: ["position", "nationality", "club", "rating", "price"],
      sortableAttributes: ["rating", "price", "name"],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 2,
          twoTypos: 5,
        },
      },
      faceting: {
        maxValuesPerFacet: 5000,
      },
      pagination: {
        maxTotalHits: 250_000,
      },
    })
    .waitTask({ timeout: TASK_TIMEOUT_MS })
}

export async function loadPlayersFromDisk(): Promise<MeiliPlayerDoc[]> {
  const filePath = playersJsonPath()
  const raw = JSON.parse(await readFile(filePath, "utf-8")) as Array<{
    id: number
    name: string
    photo: string
    nationality: string
    club: string
    position: string
    rating: number
    price: number
  }>
  return raw.map((p) => ({
    id: String(p.id),
    name: p.name,
    nameNormalized: normalizeForSearch(p.name),
    photo: p.photo,
    nationality: p.nationality,
    club: p.club,
    position: p.position,
    rating: p.rating,
    price: p.price,
  }))
}

export async function indexAllPlayersFromFile(): Promise<number> {
  const docs = await loadPlayersFromDisk()
  const index = meili.index(PLAYERS_INDEX_UID)
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    await index.addDocuments(batch).waitTask({ timeout: TASK_TIMEOUT_MS })
  }
  return docs.length
}

// ─── MongoDB helpers ──────────────────────────────────────────────────────────

/**
 * Seed the MongoDB players collection from the disk JSON (one-time operation).
 * Uses ordered:false bulk insert so duplicate-key errors are silently skipped,
 * making re-runs safe without a full drop/recreate.
 */
export async function seedPlayersToMongo(): Promise<number> {
  const docs = await loadPlayersFromDisk()
  let inserted = 0
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    const ops = batch.map((p) => ({
      insertOne: { document: { _id: p.id, ...p } },
    }))
    const result = await PlayerModel.bulkWrite(ops, { ordered: false }).catch(() => null)
    inserted += result?.insertedCount ?? 0
  }
  return inserted
}

/**
 * Load all players from MongoDB (used as source of truth when Meilisearch
 * needs to be re-indexed without touching the disk JSON again).
 */
export async function loadPlayersFromMongo(): Promise<MeiliPlayerDoc[]> {
  const docs = await PlayerModel.find({}).lean()
  return docs.map((p) => ({
    id: p._id as string,
    name: p.name,
    nameNormalized: p.nameNormalized,
    photo: p.photo,
    nationality: p.nationality,
    club: p.club,
    position: p.position,
    rating: p.rating,
    price: p.price,
  }))
}

/**
 * Get a single player by id from MongoDB (fast O(1) look-up by _id).
 */
export async function getPlayerById(id: string): Promise<MeiliPlayerDoc | null> {
  const p = await PlayerModel.findById(id).lean()
  if (!p) return null
  return {
    id: p._id as string,
    name: p.name,
    nameNormalized: p.nameNormalized,
    photo: p.photo,
    nationality: p.nationality,
    club: p.club,
    position: p.position,
    rating: p.rating,
    price: p.price,
  }
}

/**
 * Bootstrap: ensure MongoDB has players, then ensure Meilisearch is indexed.
 * MongoDB is seeded first (source of truth); Meilisearch is seeded from it.
 */
export async function bootstrapPlayersIndexIfEmpty(): Promise<void> {
  if (process.env.SKIP_PLAYER_INDEX === "1") {
    return
  }

  // 1. Ensure MongoDB players collection is populated
  const mongoCount = await PlayerModel.estimatedDocumentCount()
  if (mongoCount === 0) {
    await seedPlayersToMongo()
  }

  // 2. Ensure Meilisearch index exists and has correct settings
  await ensurePlayersIndexExists()
  await applyPlayersIndexSettings()

  // 3. Index from MongoDB → Meilisearch if empty
  const index = meili.index(PLAYERS_INDEX_UID)
  const stats = await index.getStats()
  if (stats.numberOfDocuments > 0) {
    return
  }
  const docs = await loadPlayersFromMongo()
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    await index.addDocuments(batch).waitTask({ timeout: TASK_TIMEOUT_MS })
  }
}

export function toPublicPhotoUrl(photo: string): string {
  const photoUrl = photo.replace("https://", "")
  return `https://images.weserv.nl/?url=${photoUrl}&w=120&h=120&fit=cover&mask=circle`
}

export type PublicPlayerHit = {
  id: string
  name: string
  photo: string
  nationality: string
  club: string
  position: "GK" | "DEF" | "MID" | "FWD"
  rating: number
  price: number
}

function mapHitToPlayer(hit: MeiliPlayerDoc): PublicPlayerHit {
  return {
    id: hit.id,
    name: hit.name,
    photo: toPublicPhotoUrl(hit.photo),
    nationality: hit.nationality,
    club: hit.club,
    position: hit.position as PublicPlayerHit["position"],
    rating: hit.rating,
    price: hit.price,
  }
}

export function buildSearchFilter(input: {
  nationalities?: string[]
  clubs?: string[]
  position?: string
  minRating: number
  maxRating?: number
  minPrice?: number
  maxPrice: number
}): string | undefined {
  const parts: string[] = []

  const nationalities = [...new Set((input.nationalities ?? []).map((n) => n.trim()).filter(Boolean))]
  if (nationalities.length === 1) {
    parts.push(`nationality = ${meiliQuoteString(nationalities[0])}`)
  } else if (nationalities.length > 1) {
    parts.push(`(${nationalities.map((n) => `nationality = ${meiliQuoteString(n)}`).join(" OR ")})`)
  }

  const clubs = [...new Set((input.clubs ?? []).map((c) => c.trim()).filter(Boolean))]
  if (clubs.length === 1) {
    parts.push(`club = ${meiliQuoteString(clubs[0])}`)
  } else if (clubs.length > 1) {
    parts.push(`(${clubs.map((c) => `club = ${meiliQuoteString(c)}`).join(" OR ")})`)
  }

  if (input.position && input.position !== "ALL") {
    parts.push(`position = ${meiliQuoteString(input.position)}`)
  }
  if (input.minRating > 0) {
    parts.push(`rating >= ${input.minRating}`)
  }
  if (input.maxRating !== undefined) {
    parts.push(`rating <= ${input.maxRating}`)
  }
  if (input.minPrice !== undefined && input.minPrice > 0) {
    parts.push(`price >= ${input.minPrice}`)
  }
  if (input.maxPrice > 0) {
    parts.push(`price <= ${input.maxPrice}`)
  }
  if (parts.length === 0) return undefined
  return parts.join(" AND ")
}

/** Búsqueda activa solo desde 2 caracteres; con menos devuelve query vacío (F2.1). */
function resolveSearchQuery(q: string): string {
  const t = q.trim()
  if (t.length < 2) return ""
  return t
}

export async function suggestPlayerNames(
  q: string,
  limit: number
): Promise<{ id: string; name: string }[]> {
  const t = q.trim()
  if (t.length < 2) return []
  const index = meili.index<MeiliPlayerDoc>(PLAYERS_INDEX_UID)
  const res = await index.search(t, {
    limit,
    attributesToRetrieve: ["id", "name"],
  })
  return (res.hits ?? []).map((h: MeiliPlayerDoc) => ({ id: String(h.id), name: h.name }))
}

export async function searchPlayersMeili(input: {
  q: string
  nationalities: string[]
  clubs: string[]
  position?: string
  minRating: number
  maxRating?: number
  minPrice?: number
  maxPrice: number
  page: number
  limit: number
}): Promise<{ data: PublicPlayerHit[]; nextPage: number | null; total: number }> {
  const meiliQuery = resolveSearchQuery(input.q)

  const index = meili.index<MeiliPlayerDoc>(PLAYERS_INDEX_UID)
  const offset = (input.page - 1) * input.limit
  const filter = buildSearchFilter({
    nationalities: input.nationalities,
    clubs: input.clubs,
    position: input.position,
    minRating: input.minRating,
    maxRating: input.maxRating,
    minPrice: input.minPrice,
    maxPrice: input.maxPrice,
  })

  const res = await index.search(meiliQuery, {
    filter,
    offset,
    limit: input.limit,
    sort: ["rating:desc"],
  })

  const total = res.estimatedTotalHits ?? 0
  const hits = res.hits ?? []
  const data = hits.map(mapHitToPlayer)
  const nextPage = offset + hits.length < total ? input.page + 1 : null
  return { data, nextPage, total }
}

export async function getSearchFacetMeta(): Promise<{ nationalities: string[]; clubs: string[] }> {
  const index = meili.index<MeiliPlayerDoc>(PLAYERS_INDEX_UID)
  const res = await index.search("", {
    limit: 0,
    facets: ["nationality", "club"],
  })
  const natDist = res.facetDistribution?.nationality ?? {}
  const clubDist = res.facetDistribution?.club ?? {}
  return {
    nationalities: Object.keys(natDist).sort((a, b) => a.localeCompare(b)),
    clubs: Object.keys(clubDist).sort((a, b) => a.localeCompare(b)),
  }
}

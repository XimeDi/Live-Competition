import { Meilisearch } from "meilisearch"

function getHost(): string {
  const host = process.env.MEILISEARCH_HOST
  if (!host) {
    throw new Error("MEILISEARCH_HOST is not set (e.g. http://127.0.0.1:7700)")
  }
  return host.replace(/\/$/, "")
}

const globalForMeili = globalThis as unknown as { meili: Meilisearch | undefined }

export const meili: Meilisearch =
  globalForMeili.meili ??
  new Meilisearch({
    host: getHost(),
    apiKey: process.env.MEILISEARCH_API_KEY ?? "",
  })

if (process.env.NODE_ENV !== "production") {
  globalForMeili.meili = meili
}

export const PLAYERS_INDEX_UID = "players"

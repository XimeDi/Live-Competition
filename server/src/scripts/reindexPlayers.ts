import "dotenv/config"
import { meili } from "../lib/meilisearch.js"
import {
  applyPlayersIndexSettings,
  ensurePlayersIndexExists,
  indexAllPlayersFromFile,
} from "../lib/playersIndex.js"

async function main() {
  const ok = await meili.isHealthy()
  if (!ok) {
    console.error("Meilisearch is not reachable. Check MEILISEARCH_HOST and that the server is running.")
    process.exit(1)
  }
  await ensurePlayersIndexExists()
  await applyPlayersIndexSettings()
  const n = await indexAllPlayersFromFile()
  console.log(`Indexed ${n} players into Meilisearch.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

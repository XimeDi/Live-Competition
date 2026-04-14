import "dotenv/config"
import { db } from "../lib/db.js"
import { saveSquad } from "../lib/squadStore.js"
import type { StoredSquadPlayer } from "../lib/squadStore.js"
import { loadPlayersFromDisk } from "../lib/playersIndex.js"
import { connectMongo, disconnectMongo } from "../lib/mongo.js"
import { redis } from "../lib/redis.js"

type Formation = "4-3-3" | "4-4-2" | "3-5-2"

const FORMATIONS: Formation[] = ["4-3-3", "4-4-2", "3-5-2"]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickFormation(): Formation {
  return FORMATIONS[randInt(0, FORMATIONS.length - 1)]!
}

function expectedPosForIndex(index: number, formation: Formation): "GK" | "DEF" | "MID" | "FWD" {
  if (index === 0) return "GK"
  const [defS, midS] = formation.split("-")
  const defCount = Number(defS)
  const midCount = Number(midS)
  if (index <= defCount) return "DEF"
  if (index <= defCount + midCount) return "MID"
  return "FWD"
}

function toStoredPlayer(p: Awaited<ReturnType<typeof loadPlayersFromDisk>>[number]): StoredSquadPlayer {
  return {
    id: p.id,
    name: p.name,
    nationality: p.nationality,
    club: p.club,
    position: p.position,
    rating: p.rating,
    price: p.price,
    photo: p.photo,
  }
}

async function main() {
  console.log("Connecting databases...")
  await connectMongo()

  const players = await loadPlayersFromDisk()
  if (players.length < 1000) {
    throw new Error(`Players dataset too small: got ${players.length}`)
  }

  // Get all users
  const users = await db.user.findMany()
  console.log(`Found ${users.length} managers.`)

  const BUDGET_LIMIT = 400.0

  let created = 0
  for (const user of users) {
    let validSquad = false;
    let formation: Formation = "4-3-3";
    let squad: (StoredSquadPlayer | null)[] = [];

    while (!validSquad) {
      formation = pickFormation()
      squad = Array(11).fill(null)
      const perNation = new Map<string, number>()
      let currentSpent = 0
      let failed = false

      for (let slot = 0; slot < 11; slot++) {
        const pos = expectedPosForIndex(slot, formation)
        let foundForSlot = false
        
        for (let tries = 0; tries < 500; tries++) {
          const cand = players[randInt(0, players.length - 1)]!
          if (cand.position !== pos) continue
          
          const n = cand.nationality
          const cnt = perNation.get(n) ?? 0
          if (cnt >= 3) continue // Max 3 players from same nationality
          
          // Budget constraint check
          if (currentSpent + cand.price > BUDGET_LIMIT) continue
          
          const stored = toStoredPlayer(cand)
          if (squad.some((p) => p?.id === stored.id)) continue // Avoid duplicates within the same squad
          
          squad[slot] = stored
          perNation.set(n, cnt + 1)
          currentSpent += cand.price
          foundForSlot = true
          break
        }

        if (!foundForSlot) {
          failed = true
          break
        }
      }

      if (!failed && currentSpent <= BUDGET_LIMIT) {
        validSquad = true
      }
    }

    // saveSquad overwrites existing squads automatically handling previous Squad data
    const finalSpent = squad.reduce((sum, p) => sum + (p?.price || 0), 0)
    await saveSquad(user.id, { formation, players: squad as StoredSquadPlayer[] })
    created++
    console.log(`Squad generated for ${user.username} (${formation}) | Gasto: $${finalSpent.toFixed(1)}M`)
  }

  console.log(`\nSquad generation complete: ${created}/${users.length} squads successfully randomized within budget.`)

  await disconnectMongo()
  await db.$disconnect()
  await redis.quit()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import "dotenv/config"
import { hashPassword } from "../lib/password.js"
import { createUserInStore } from "../lib/userStore.js"
import { setUserPoints } from "../lib/userStore.js"
import { syncLeaderboardScore } from "../lib/leaderboard.js"
import { saveSquad } from "../lib/squadStore.js"
import type { StoredSquadPlayer } from "../lib/squadStore.js"
import { loadPlayersFromDisk } from "../lib/playersIndex.js"
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
  const shouldFlush = process.env.SEED_FLUSH === "1"
  const userCount = Number(process.env.SEED_USERS ?? "500")
  const password = process.env.SEED_PASSWORD ?? "password123"

  if (shouldFlush) {
    // WARNING: for local demos only.
    await redis.flushdb()
  }

  const players = await loadPlayersFromDisk()
  if (players.length < 1000) {
    throw new Error(`players dataset too small: got ${players.length}`)
  }

  const passwordHash = await hashPassword(password)

  let created = 0
  for (let i = 1; i <= userCount; i++) {
    const username = `manager${String(i).padStart(4, "0")}`
    const email = `${username}@example.com`

    const res = await createUserInStore({ username, email, passwordHash })
    if ("conflict" in res) {
      continue
    }
    created++

    // Give everyone some points so the leaderboard is meaningful.
    const pts = await setUserPoints(res.user.id, randInt(0, 120))
    await syncLeaderboardScore(res.user.id, pts)

    // Optional: give them a valid 11-player squad.
    const formation = pickFormation()
    const squad: (StoredSquadPlayer | null)[] = Array(11).fill(null)
    const perNation = new Map<string, number>()

    for (let slot = 0; slot < 11; slot++) {
      const pos = expectedPosForIndex(slot, formation)
      // Try a few random candidates until we satisfy the 3-per-nation rule.
      for (let tries = 0; tries < 300; tries++) {
        const cand = players[randInt(0, players.length - 1)]!
        if (cand.position !== pos) continue
        const n = cand.nationality
        const cnt = perNation.get(n) ?? 0
        if (cnt >= 3) continue
        const stored = toStoredPlayer(cand)
        // Prevent duplicates
        if (squad.some((p) => p?.id === stored.id)) continue
        squad[slot] = stored
        perNation.set(n, cnt + 1)
        break
      }
    }

    await saveSquad(res.user.id, { formation, players: squad })
  }

  // eslint-disable-next-line no-console
  console.log(`Seed complete. created=${created} requested=${userCount}`)
  // eslint-disable-next-line no-console
  console.log(`Login with any user: manager0001@example.com / ${password}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})


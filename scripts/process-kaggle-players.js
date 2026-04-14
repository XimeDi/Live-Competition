#!/usr/bin/env node
/**
 * process-kaggle-players.js
 *
 * Converts the Kaggle FC 26 FIFA 26 Player Data CSV into src/data/players.json
 * filtered to the 48 qualified World Cup 2026 nations.
 *
 * Usage:
 *   1. Download the dataset from:
 *      https://www.kaggle.com/datasets/rovnez/fc-26-fifa-26-player-data
 *   2. Place the CSV file (e.g. players.csv) anywhere accessible.
 *   3. Run:
 *        node scripts/process-kaggle-players.js --input ./players.csv
 *
 *   Output → src/data/players.json  (auto-created)
 */

import { createReadStream, mkdirSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createInterface } from "node:readline"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── 48 qualified nations for FIFA World Cup 2026 ──────────────────────────────
const QUALIFIED_NATIONS = new Set([
  // CONMEBOL (6)
  "Argentina", "Brazil", "Colombia", "Ecuador", "Uruguay", "Paraguay",
  // UEFA (16)
  "England", "France", "Germany", "Spain", "Portugal", "Netherlands",
  "Belgium", "Croatia", "Serbia", "Switzerland", "Denmark", "Austria",
  "Poland", "Scotland", "Turkey", "Czechia",
  // CONCACAF (6)
  "United States", "Mexico", "Canada", "Panama", "Honduras", "Jamaica",
  // CAF (9)
  "Morocco", "Nigeria", "Senegal", "Egypt", "South Africa", "Cameroon",
  "DR Congo", "Tunisia", "Mali",
  // AFC (8)
  "Japan", "Korea Republic", "Saudi Arabia", "Australia", "Iran",
  "Uzbekistan", "Qatar", "Jordan",
  // OFC (1)
  "New Zealand",
  // Inter-confederation playoffs (2)
  "Venezuela", "Costa Rica",
])

// Position normalization — FIFA 26 uses specific position codes
const POSITION_MAP = {
  GK: "GK",
  CB: "DEF", LB: "DEF", RB: "DEF", LWB: "DEF", RWB: "DEF",
  CDM: "MID", CM: "MID", CAM: "MID", LM: "MID", RM: "MID",
  LW: "FWD", RW: "FWD", ST: "FWD", CF: "FWD", RF: "FWD", LF: "FWD",
}

function normalizePosition(rawPos) {
  if (!rawPos) return null
  const p = rawPos.trim().toUpperCase()
  return POSITION_MAP[p] ?? null
}

/**
 * Derive fantasy price from player market value (in EUR).
 * We scale to a budget of 1000 across a typical squad.
 * A world-class player (~€150M) costs ~25 units; average (~€5M) costs ~3 units.
 */
function derivePrice(marketValueEur) {
  if (!marketValueEur || isNaN(marketValueEur) || marketValueEur <= 0) return 3.0
  const millions = marketValueEur / 1_000_000
  // Logarithmic scale: ln(value+1) * factor
  const price = Math.log(millions + 1) * 4.5
  return Math.max(1.0, Math.min(50.0, Math.round(price * 10) / 10))
}

async function processCSV(inputPath) {
  const stream = createReadStream(resolve(inputPath), "utf-8")
  const rl = createInterface({ input: stream, crlfDelay: Infinity })

  let headers = null
  const players = []
  let lineNum = 0

  for await (const line of rl) {
    lineNum++
    if (lineNum === 1) {
      // Parse CSV header (handle quoted fields)
      headers = parseCSVLine(line)
      continue
    }

    const values = parseCSVLine(line)
    if (values.length < headers.length) continue

    const row = {}
    for (let i = 0; i < headers.length; i++) {
      row[headers[i].trim()] = values[i]?.trim() ?? ""
    }

    // Filter to qualified nations
    const nationality = row["nationality_name"] || row["nationality"] || ""
    if (!QUALIFIED_NATIONS.has(nationality)) continue

    // Normalize position
    const rawPos = row["player_positions"]?.split(",")[0]?.trim() ?? ""
    const position = normalizePosition(rawPos)
    if (!position) continue

    const id = parseInt(row["sofifa_id"] || row["id"] || "0", 10)
    if (!id) continue

    const overall = parseInt(row["overall"] || "0", 10)
    if (overall < 60) continue // Filter out very low rated players

    const marketValue = parseFloat(row["value_eur"] || "0")
    const price = derivePrice(marketValue)

    const photo = row["player_face_url"] || row["photo"] || ""
    const club = row["club_name"] || row["club"] || "Free Agent"
    const name = row["short_name"] || row["long_name"] || row["name"] || ""

    if (!name) continue

    players.push({ id, name, photo, nationality, club, position, rating: overall, price })
  }

  return players
}

// Simple CSV line parser (handles quoted fields with commas inside)
function parseCSVLine(line) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

// ── Main ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const inputIdx = args.indexOf("--input")
const inputPath = inputIdx !== -1 ? args[inputIdx + 1] : args[0]

if (!inputPath) {
  console.error("Usage: node scripts/process-kaggle-players.js --input <path-to-players.csv>")
  process.exit(1)
}

console.log(`Reading CSV from: ${resolve(inputPath)}`)
const players = await processCSV(inputPath)

const outDir = resolve(__dirname, "../src/data")
mkdirSync(outDir, { recursive: true })
const outPath = resolve(outDir, "players.json")
writeFileSync(outPath, JSON.stringify(players, null, 2), "utf-8")

console.log(`✅ Done! ${players.length} players written to ${outPath}`)
console.log("   Run 'docker compose up' to index them in Meilisearch automatically.")

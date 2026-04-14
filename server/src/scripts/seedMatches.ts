import "dotenv/config"
import { db } from "../lib/db.js"

const GROUPS = "ABCDEFGHIJKL".split("")

const TEAMS_BY_GROUP: Record<string, { name: string; flag: string; nationality: string }[]> = {
  A: [
    { name: "USA", flag: "🇺🇸", nationality: "USA" },
    { name: "Colombia", flag: "🇨🇴", nationality: "Colombia" },
    { name: "South Korea", flag: "🇰🇷", nationality: "Korea Republic" },
    { name: "Mali", flag: "🇲🇱", nationality: "Mali" },
  ],
  B: [
    { name: "Mexico", flag: "🇲🇽", nationality: "Mexico" },
    { name: "Ecuador", flag: "🇪🇨", nationality: "Ecuador" },
    { name: "Poland", flag: "🇵🇱", nationality: "Poland" },
    { name: "Australia", flag: "🇦🇺", nationality: "Australia" },
  ],
  C: [
    { name: "Canada", flag: "🇨🇦", nationality: "Canada" },
    { name: "Peru", flag: "🇵🇪", nationality: "Peru" },
    { name: "Japan", flag: "🇯🇵", nationality: "Japan" },
    { name: "Senegal", flag: "🇸🇳", nationality: "Senegal" },
  ],
  D: [
    { name: "Argentina", flag: "🇦🇷", nationality: "Argentina" },
    { name: "Switzerland", flag: "🇨🇭", nationality: "Switzerland" },
    { name: "Saudi Arabia", flag: "🇸🇦", nationality: "Saudi Arabia" },
    { name: "Ghana", flag: "🇬🇭", nationality: "Ghana" },
  ],
  E: [
    { name: "France", flag: "🇫🇷", nationality: "France" },
    { name: "Denmark", flag: "🇩🇰", nationality: "Denmark" },
    { name: "Iraq", flag: "🇮🇶", nationality: "Iraq" },
    { name: "Nigeria", flag: "🇳🇬", nationality: "Nigeria" },
  ],
  F: [
    { name: "Brazil", flag: "🇧🇷", nationality: "Brazil" },
    { name: "Serbia", flag: "🇷🇸", nationality: "Serbia" },
    { name: "Egypt", flag: "🇪🇬", nationality: "Egypt" },
    { name: "Norway", flag: "🇳🇴", nationality: "Norway" },
  ],
  G: [
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", nationality: "England" },
    { name: "Uruguay", flag: "🇺🇾", nationality: "Uruguay" },
    { name: "Iran", flag: "🇮🇷", nationality: "Iran" },
    { name: "Cameroon", flag: "🇨🇲", nationality: "Cameroon" },
  ],
  H: [
    { name: "Portugal", flag: "🇵🇹", nationality: "Portugal" },
    { name: "Belgium", flag: "🇧🇪", nationality: "Belgium" },
    { name: "Algeria", flag: "🇩🇿", nationality: "Algeria" },
    { name: "South Africa", flag: "🇿🇦", nationality: "South Africa" },
  ],
  I: [
    { name: "Netherlands", flag: "🇳🇱", nationality: "Netherlands" },
    { name: "Chile", flag: "🇨🇱", nationality: "Chile" },
    { name: "Ivory Coast", flag: "🇨🇮", nationality: "Côte d'Ivoire" },
    { name: "Sweden", flag: "🇸🇪", nationality: "Sweden" },
  ],
  J: [
    { name: "Spain", flag: "🇪🇸", nationality: "Spain" },
    { name: "Croatia", flag: "🇭🇷", nationality: "Croatia" },
    { name: "Ukraine", flag: "🇺🇦", nationality: "Ukraine" },
    { name: "Paraguay", flag: "🇵🇾", nationality: "Paraguay" },
  ],
  K: [
    { name: "Italy", flag: "🇮🇹", nationality: "Italy" },
    { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", nationality: "Scotland" },
    { name: "Morocco", flag: "🇲🇦", nationality: "Morocco" },
    { name: "Romania", flag: "🇷🇴", nationality: "Romania" },
  ],
  L: [
    { name: "Germany", flag: "🇩🇪", nationality: "Germany" },
    { name: "Turkey", flag: "🇹🇷", nationality: "Turkey" },
    { name: "Greece", flag: "🇬🇷", nationality: "Greece" },
    { name: "Czechia", flag: "🇨🇿", nationality: "Czechia" },
  ],
}

async function main() {
  console.log("Seeding World Cup 2026 matches...")

  // Clear existing matches
  await db.match.deleteMany({})

  const now = new Date()

  for (const groupName of GROUPS) {
    const teams = TEAMS_BY_GROUP[groupName]
    if (!teams || teams.length !== 4) continue

    // Round 1
    // 1 vs 2
    await createMatch(groupName, teams[0], teams[1], addDays(now, 0))
    // 3 vs 4
    await createMatch(groupName, teams[2], teams[3], addDays(now, 0))

    // Round 2
    // 1 vs 3
    await createMatch(groupName, teams[0], teams[2], addDays(now, 4))
    // 2 vs 4
    await createMatch(groupName, teams[1], teams[3], addDays(now, 4))

    // Round 3
    // 1 vs 4
    await createMatch(groupName, teams[0], teams[3], addDays(now, 8))
    // 2 vs 3
    await createMatch(groupName, teams[1], teams[2], addDays(now, 8))
  }

  console.log("Seeding complete: 72 matches created.")
  await db.$disconnect()
}

async function createMatch(groupName: string, home: any, away: any, date: Date) {
  await db.match.create({
    data: {
      groupName,
      homeTeam: home.name,
      awayTeam: away.name,
      homeNationality: home.nationality,
      awayNationality: away.nationality,
      homeFlag: home.flag,
      awayFlag: away.flag,
      matchDate: date,
      status: "scheduled",
    },
  })
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

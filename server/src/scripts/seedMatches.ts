import "dotenv/config"
import { db } from "../lib/db.js"

const GROUPS = "ABCDEFGHIJKL".split("")

const TEAMS_BY_GROUP: Record<string, { name: string; flag: string; nationality: string }[]> = {
  A: [
    { name: "México", flag: "🇲🇽", nationality: "Mexico" },
    { name: "Sudáfrica", flag: "🇿🇦", nationality: "South Africa" },
    { name: "Corea", flag: "🇰🇷", nationality: "Korea Republic" },
    { name: "Chequia", flag: "🇨🇿", nationality: "Czechia" },
  ],
  B: [
    { name: "Canadá", flag: "🇨🇦", nationality: "Canada" },
    { name: "Bosnia", flag: "🇧🇦", nationality: "Bosnia and Herzegovina" },
    { name: "Qatar", flag: "🇶🇦", nationality: "Qatar" },
    { name: "Suiza", flag: "🇨🇭", nationality: "Switzerland" },
  ],
  C: [
    { name: "Brasil", flag: "🇧🇷", nationality: "Brazil" },
    { name: "Marruecos", flag: "🇲🇦", nationality: "Morocco" },
    { name: "Haití", flag: "🇭🇹", nationality: "Haiti" },
    { name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", nationality: "Scotland" },
  ],
  D: [
    { name: "EE.UU.", flag: "🇺🇸", nationality: "United States" },
    { name: "Paraguay", flag: "🇵🇾", nationality: "Paraguay" },
    { name: "Australia", flag: "🇦🇺", nationality: "Australia" },
    { name: "Turquía", flag: "🇹🇷", nationality: "Türkiye" },
  ],
  E: [
    { name: "Alemania", flag: "🇩🇪", nationality: "Germany" },
    { name: "Curazao", flag: "🇨🇼", nationality: "Curacao" },
    { name: "C. de Marfil", flag: "🇨🇮", nationality: "Côte d'Ivoire" },
    { name: "Ecuador", flag: "🇪🇨", nationality: "Ecuador" },
  ],
  F: [
    { name: "Países Bajos", flag: "🇳🇱", nationality: "Netherlands" },
    { name: "Japón", flag: "🇯🇵", nationality: "Japan" },
    { name: "Suecia", flag: "🇸🇪", nationality: "Sweden" },
    { name: "Túnez", flag: "🇹🇳", nationality: "Tunisia" },
  ],
  G: [
    { name: "Bélgica", flag: "🇧🇪", nationality: "Belgium" },
    { name: "Egipto", flag: "🇪🇬", nationality: "Egypt" },
    { name: "Irán", flag: "🇮🇷", nationality: "Iran" },
    { name: "N. Zelanda", flag: "🇳🇿", nationality: "New Zealand" },
  ],
  H: [
    { name: "España", flag: "🇪🇸", nationality: "Spain" },
    { name: "Cabo Verde", flag: "🇨🇻", nationality: "Cabo Verde" },
    { name: "Arabia S.", flag: "🇸🇦", nationality: "Saudi Arabia" },
    { name: "Uruguay", flag: "🇺🇾", nationality: "Uruguay" },
  ],
  I: [
    { name: "Francia", flag: "🇫🇷", nationality: "France" },
    { name: "Senegal", flag: "🇸🇳", nationality: "Senegal" },
    { name: "Irak", flag: "🇮🇶", nationality: "Iraq" },
    { name: "Noruega", flag: "🇳🇴", nationality: "Norway" },
  ],
  J: [
    { name: "Argentina", flag: "🇦🇷", nationality: "Argentina" },
    { name: "Argelia", flag: "🇩🇿", nationality: "Algeria" },
    { name: "Austria", flag: "🇦🇹", nationality: "Austria" },
    { name: "Jordania", flag: "🇯🇴", nationality: "Jordan" },
  ],
  K: [
    { name: "Portugal", flag: "🇵🇹", nationality: "Portugal" },
    { name: "RD Congo", flag: "🇨🇩", nationality: "Congo DR" },
    { name: "Uzbekistán", flag: "🇺🇿", nationality: "Uzbekistan" },
    { name: "Colombia", flag: "🇨🇴", nationality: "Colombia" },
  ],
  L: [
    { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", nationality: "England" },
    { name: "Croacia", flag: "🇭🇷", nationality: "Croatia" },
    { name: "Ghana", flag: "🇬🇭", nationality: "Ghana" },
    { name: "Panamá", flag: "🇵🇦", nationality: "Panama" },
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

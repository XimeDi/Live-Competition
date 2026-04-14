import { db } from "./db.js"

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
const TEAMS_BY_GROUP: Record<string, {name: string, flag: string, nationality: string}[]> = {
  A: [
    { name: "Argentina", flag: "🇦🇷", nationality: "Argentina" },
    { name: "Polonia", flag: "🇵🇱", nationality: "Poland" },
    { name: "México", flag: "🇲🇽", nationality: "Mexico" },
    { name: "Arabia Saudí", flag: "🇸🇦", nationality: "Saudi Arabia" }
  ],
  B: [
    { name: "Francia", flag: "🇫🇷", nationality: "France" },
    { name: "Dinamarca", flag: "🇩🇰", nationality: "Denmark" },
    { name: "Túnez", flag: "🇹🇳", nationality: "Tunisia" },
    { name: "Australia", flag: "🇦🇺", nationality: "Australia" }
  ],
  C: [
    { name: "España", flag: "🇪🇸", nationality: "Spain" },
    { name: "Alemania", flag: "🇩🇪", nationality: "Germany" },
    { name: "Japón", flag: "🇯🇵", nationality: "Japan" },
    { name: "Costa Rica", flag: "🇨🇷", nationality: "Costa Rica" }
  ],
  D: [
    { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", nationality: "England" },
    { name: "Estados Unidos", flag: "🇺🇸", nationality: "United States" },
    { name: "Irán", flag: "🇮🇷", nationality: "Iran" },
    { name: "Gales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", nationality: "Wales" }
  ],
  E: [
    { name: "Brasil", flag: "🇧🇷", nationality: "Brazil" },
    { name: "Suiza", flag: "🇨🇭", nationality: "Switzerland" },
    { name: "Serbia", flag: "🇷🇸", nationality: "Serbia" },
    { name: "Camerún", flag: "🇨🇲", nationality: "Cameroon" }
  ],
  F: [
    { name: "Bélgica", flag: "🇧🇪", nationality: "Belgium" },
    { name: "Croacia", flag: "🇭🇷", nationality: "Croatia" },
    { name: "Marruecos", flag: "🇲🇦", nationality: "Morocco" },
    { name: "Canadá", flag: "🇨🇦", nationality: "Canada" }
  ],
  G: [
    { name: "Portugal", flag: "🇵🇹", nationality: "Portugal" },
    { name: "Uruguay", flag: "🇺🇾", nationality: "Uruguay" },
    { name: "Corea del Sur", flag: "🇰🇷", nationality: "Korea Republic" },
    { name: "Ghana", flag: "🇬🇭", nationality: "Ghana" }
  ],
  H: [
    { name: "Países Bajos", flag: "🇳🇱", nationality: "Netherlands" },
    { name: "Senegal", flag: "🇸🇳", nationality: "Senegal" },
    { name: "Ecuador", flag: "🇪🇨", nationality: "Ecuador" },
    { name: "Qatar", flag: "🇶🇦", nationality: "Qatar" }
  ],
  // Extra groups for WC 2026 format (fictional fillers for demo)
  I: [
    { name: "Italia", flag: "🇮🇹", nationality: "Italy" },
    { name: "Colombia", flag: "🇨🇴", nationality: "Colombia" },
    { name: "Suecia", flag: "🇸🇪", nationality: "Sweden" },
    { name: "Chile", flag: "🇨🇱", nationality: "Chile" }
  ],
  J: [
    { name: "Noruega", flag: "🇳🇴", nationality: "Norway" },
    { name: "Egipto", flag: "🇪🇬", nationality: "Egypt" },
    { name: "Turquía", flag: "🇹🇷", nationality: "Turkey" },
    { name: "Argelia", flag: "🇩🇿", nationality: "Algeria" }
  ],
  K: [
    { name: "Ucrania", flag: "🇺🇦", nationality: "Ukraine" },
    { name: "Grecia", flag: "🇬🇷", nationality: "Greece" },
    { name: "Perú", flag: "🇵🇪", nationality: "Peru" },
    { name: "Nigeria", flag: "🇳🇬", nationality: "Nigeria" }
  ],
  L: [
    { name: "Austria", flag: "🇦🇹", nationality: "Austria" },
    { name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", nationality: "Scotland" },
    { name: "Hungría", flag: "🇭🇺", nationality: "Hungary" },
    { name: "Costa de Marfil", flag: "🇨🇮", nationality: "Ivory Coast" }
  ]
}

export async function seedMatchesIfEmpty(): Promise<void> {
  const count = await db.match.count()
  if (count > 0) return

  const matches = []
  
  // Dates for Jornada 1, 2, 3
  const DATES = [
    new Date("2026-06-11T18:00:00Z"),
    new Date("2026-06-18T18:00:00Z"),
    new Date("2026-06-25T18:00:00Z")
  ]

  for (const group of GROUPS) {
    const teams = TEAMS_BY_GROUP[group]!
    
    // Jornada 1: T1 vs T2, T3 vs T4
    matches.push({
      groupName: group,
      homeTeam: teams[0].name, awayTeam: teams[1].name,
      homeFlag: teams[0].flag, awayFlag: teams[1].flag,
      homeNationality: teams[0].nationality, awayNationality: teams[1].nationality,
      matchDate: DATES[0], status: "scheduled"
    })
    matches.push({
      groupName: group,
      homeTeam: teams[2].name, awayTeam: teams[3].name,
      homeFlag: teams[2].flag, awayFlag: teams[3].flag,
      homeNationality: teams[2].nationality, awayNationality: teams[3].nationality,
      matchDate: DATES[0], status: "scheduled"
    })

    // Jornada 2: T1 vs T3, T2 vs T4
    matches.push({
      groupName: group,
      homeTeam: teams[0].name, awayTeam: teams[2].name,
      homeFlag: teams[0].flag, awayFlag: teams[2].flag,
      homeNationality: teams[0].nationality, awayNationality: teams[2].nationality,
      matchDate: DATES[1], status: "scheduled"
    })
    matches.push({
      groupName: group,
      homeTeam: teams[1].name, awayTeam: teams[3].name,
      homeFlag: teams[1].flag, awayFlag: teams[3].flag,
      homeNationality: teams[1].nationality, awayNationality: teams[3].nationality,
      matchDate: DATES[1], status: "scheduled"
    })

    // Jornada 3: T1 vs T4, T2 vs T3
    matches.push({
      groupName: group,
      homeTeam: teams[0].name, awayTeam: teams[3].name,
      homeFlag: teams[0].flag, awayFlag: teams[3].flag,
      homeNationality: teams[0].nationality, awayNationality: teams[3].nationality,
      matchDate: DATES[2], status: "scheduled"
    })
    matches.push({
      groupName: group,
      homeTeam: teams[1].name, awayTeam: teams[2].name,
      homeFlag: teams[1].flag, awayFlag: teams[2].flag,
      homeNationality: teams[1].nationality, awayNationality: teams[2].nationality,
      matchDate: DATES[2], status: "scheduled"
    })
  }

  await db.match.createMany({ data: matches })
  console.log(`[seed] Inserted ${matches.length} matches (12 groups x 3 jornadas)`)
}

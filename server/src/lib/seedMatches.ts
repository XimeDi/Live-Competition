import { db } from "./db.js"

const INITIAL_MATCHES = [
  // Grupo A — Argentina
  { groupName: "A", homeTeam: "Argentina",   awayTeam: "Polonia",       homeFlag: "🇦🇷", awayFlag: "🇵🇱", homeNationality: "Argentina",    awayNationality: "Poland" },
  { groupName: "A", homeTeam: "Australia",   awayTeam: "Arabia Saudí",  homeFlag: "🇦🇺", awayFlag: "🇸🇦", homeNationality: "Australia",    awayNationality: "Saudi Arabia" },
  // Grupo B — Francia
  { groupName: "B", homeTeam: "Francia",     awayTeam: "Alemania",      homeFlag: "🇫🇷", awayFlag: "🇩🇪", homeNationality: "France",       awayNationality: "Germany" },
  { groupName: "B", homeTeam: "Dinamarca",   awayTeam: "Túnez",         homeFlag: "🇩🇰", awayFlag: "🇹🇳", homeNationality: "Denmark",      awayNationality: "Tunisia" },
  // Grupo C — Inglaterra
  { groupName: "C", homeTeam: "Inglaterra",  awayTeam: "Estados Unidos", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayFlag: "🇺🇸", homeNationality: "England",      awayNationality: "United States" },
  { groupName: "C", homeTeam: "Irán",        awayTeam: "Gales",          homeFlag: "🇮🇷", awayFlag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", homeNationality: "Iran",          awayNationality: "Wales" },
  // Grupo D — Brasil
  { groupName: "D", homeTeam: "Brasil",      awayTeam: "Serbia",         homeFlag: "🇧🇷", awayFlag: "🇷🇸", homeNationality: "Brazil",       awayNationality: "Serbia" },
  { groupName: "D", homeTeam: "Suiza",       awayTeam: "Camerún",        homeFlag: "🇨🇭", awayFlag: "🇨🇲", homeNationality: "Switzerland",  awayNationality: "Cameroon" },
  // Grupo E — España
  { groupName: "E", homeTeam: "España",      awayTeam: "Alemania",       homeFlag: "🇪🇸", awayFlag: "🇩🇪", homeNationality: "Spain",        awayNationality: "Germany" },
  { groupName: "E", homeTeam: "Japón",       awayTeam: "Costa Rica",     homeFlag: "🇯🇵", awayFlag: "🇨🇷", homeNationality: "Japan",        awayNationality: "Costa Rica" },
  // Grupo F — Bélgica
  { groupName: "F", homeTeam: "Bélgica",     awayTeam: "Marruecos",      homeFlag: "🇧🇪", awayFlag: "🇲🇦", homeNationality: "Belgium",      awayNationality: "Morocco" },
  { groupName: "F", homeTeam: "Croacia",     awayTeam: "Canadá",         homeFlag: "🇭🇷", awayFlag: "🇨🇦", homeNationality: "Croatia",      awayNationality: "Canada" },
  // Grupo G — Portugal
  { groupName: "G", homeTeam: "Portugal",    awayTeam: "Uruguay",        homeFlag: "🇵🇹", awayFlag: "🇺🇾", homeNationality: "Portugal",     awayNationality: "Uruguay" },
  { groupName: "G", homeTeam: "Corea del Sur", awayTeam: "Ghana",        homeFlag: "🇰🇷", awayFlag: "🇬🇭", homeNationality: "Korea Republic", awayNationality: "Ghana" },
  // Grupo H — Países Bajos
  { groupName: "H", homeTeam: "Países Bajos", awayTeam: "Senegal",       homeFlag: "🇳🇱", awayFlag: "🇸🇳", homeNationality: "Netherlands",  awayNationality: "Senegal" },
  { groupName: "H", homeTeam: "Ecuador",     awayTeam: "México",          homeFlag: "🇪🇨", awayFlag: "🇲🇽", homeNationality: "Ecuador",      awayNationality: "Mexico" },
]

export async function seedMatchesIfEmpty(): Promise<void> {
  const count = await db.match.count()
  if (count > 0) return

  await db.match.createMany({ data: INITIAL_MATCHES })
  console.log(`[seed] Inserted ${INITIAL_MATCHES.length} matches`)
}

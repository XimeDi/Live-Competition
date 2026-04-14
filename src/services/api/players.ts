import type { Player, SearchFilters, PaginatedResponse, SortOption } from '@/types'
import playersData from '@/data/players.json'
import { apiJson } from './client'

const CLUB_TO_LEAGUE: Record<string, { name: string; logo: string }> = {
  'Real Madrid': { name: 'LaLiga', logo: 'https://cdn.sofifa.net/leagues/53.png' },
  'FC Barcelona': { name: 'LaLiga', logo: 'https://cdn.sofifa.net/leagues/53.png' },
  'Atlético Madrid': { name: 'LaLiga', logo: 'https://cdn.sofifa.net/leagues/53.png' },
  'Girona FC': { name: 'LaLiga', logo: 'https://cdn.sofifa.net/leagues/53.png' },
  'Athletic Club': { name: 'LaLiga', logo: 'https://cdn.sofifa.net/leagues/53.png' },
  'Real Sociedad': { name: 'LaLiga', logo: 'https://cdn.sofifa.net/leagues/53.png' },
  'Villarreal CF': { name: 'LaLiga', logo: 'https://cdn.sofifa.net/leagues/53.png' },

  'Manchester City': { name: 'Premier League', logo: 'https://cdn.sofifa.net/leagues/13.png' },
  'Liverpool': { name: 'Premier League', logo: 'https://cdn.sofifa.net/leagues/13.png' },
  'Arsenal': { name: 'Premier League', logo: 'https://cdn.sofifa.net/leagues/13.png' },
  'Manchester United': { name: 'Premier League', logo: 'https://cdn.sofifa.net/leagues/13.png' },
  'Chelsea': { name: 'Premier League', logo: 'https://cdn.sofifa.net/leagues/13.png' },
  'Tottenham Hotspur': { name: 'Premier League', logo: 'https://cdn.sofifa.net/leagues/13.png' },
  'Aston Villa': { name: 'Premier League', logo: 'https://cdn.sofifa.net/leagues/13.png' },
  'Newcastle United': { name: 'Premier League', logo: 'https://cdn.sofifa.net/leagues/13.png' },

  'FC Bayern München': { name: 'Bundesliga', logo: 'https://cdn.sofifa.net/leagues/19.png' },
  'Bayer 04 Leverkusen': { name: 'Bundesliga', logo: 'https://cdn.sofifa.net/leagues/19.png' },
  'Borussia Dortmund': { name: 'Bundesliga', logo: 'https://cdn.sofifa.net/leagues/19.png' },
  'RB Leipzig': { name: 'Bundesliga', logo: 'https://cdn.sofifa.net/leagues/19.png' },
  'VfB Stuttgart': { name: 'Bundesliga', logo: 'https://cdn.sofifa.net/leagues/19.png' },

  'Inter': { name: 'Serie A', logo: 'https://cdn.sofifa.net/leagues/31.png' },
  'Juventus': { name: 'Serie A', logo: 'https://cdn.sofifa.net/leagues/31.png' },
  'Milan': { name: 'Serie A', logo: 'https://cdn.sofifa.net/leagues/31.png' },
  'Roma': { name: 'Serie A', logo: 'https://cdn.sofifa.net/leagues/31.png' },
  'Napoli': { name: 'Serie A', logo: 'https://cdn.sofifa.net/leagues/31.png' },
  'Atalanta': { name: 'Serie A', logo: 'https://cdn.sofifa.net/leagues/31.png' },
  'Lazio': { name: 'Serie A', logo: 'https://cdn.sofifa.net/leagues/31.png' },

  'Paris Saint-Germain': { name: 'Ligue 1', logo: 'https://cdn.sofifa.net/leagues/16.png' },
  'Olympique Lyonnais': { name: 'Ligue 1', logo: 'https://cdn.sofifa.net/leagues/16.png' },
  'Olympique de Marseille': { name: 'Ligue 1', logo: 'https://cdn.sofifa.net/leagues/16.png' },
  'AS Monaco': { name: 'Ligue 1', logo: 'https://cdn.sofifa.net/leagues/16.png' },
  'LOSC Lille': { name: 'Ligue 1', logo: 'https://cdn.sofifa.net/leagues/16.png' },
  'OGC Nice': { name: 'Ligue 1', logo: 'https://cdn.sofifa.net/leagues/16.png' },
}

const ALL_PLAYERS: Player[] = (playersData as any[]).map(p => {
  const photoUrl = p.photo.replace('https://', '')
  const leagueData = CLUB_TO_LEAGUE[p.club] || { name: 'Other', logo: 'https://cdn.sofifa.net/leagues/1.png' }

  return {
    ...p,
    id: String(p.id),
    photo: `https://images.weserv.nl/?url=${photoUrl}&w=120&h=120&fit=cover&mask=circle`,
    clubLogo: `https://cdn.sofifa.net/teams/${Math.floor(p.id % 200) + 1}/60.png`, // Placeholder for club logos based on id
    league: leagueData.name,
    leagueLogo: leagueData.logo
  }
})

export const getPlayers = async (
  filters: SearchFilters,
  pageParam = 1,
  limit = 12
): Promise<PaginatedResponse<Player>> => {
  const params = new URLSearchParams()

  if (filters.query && filters.query.length >= 2) params.set('q', filters.query)
  if (filters.nationalities?.length) params.set('nationalities', filters.nationalities.join(','))
  if (filters.position && filters.position !== 'ALL') params.set('position', filters.position)
  if (filters.club) params.set('club', filters.club)
  if (filters.minRating > 0) params.set('minRating', String(filters.minRating))
  if (filters.maxRating && filters.maxRating < 99) params.set('maxRating', String(filters.maxRating))
  if (filters.minPrice && filters.minPrice > 0) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice < 300) params.set('maxPrice', String(filters.maxPrice))
  params.set('page', String(pageParam))
  params.set('limit', String(limit))

  try {
    const result = await apiJson<PaginatedResponse<Player>>(`/api/search?${params.toString()}`)
    // Enriquecer con datos de liga/logo si los necesita la UI
    const data = result.data.map(p => ({
      ...p,
      clubLogo: CLUB_TO_LEAGUE[p.club] ? undefined : undefined,
      league: CLUB_TO_LEAGUE[p.club]?.name ?? 'Other',
      leagueLogo: CLUB_TO_LEAGUE[p.club]?.logo ?? 'https://cdn.sofifa.net/leagues/1.png',
    }))
    return { ...result, data }
  } catch {
    // Fallback local si el backend no está disponible
    return localFilter(filters, pageParam, limit)
  }
}

function localFilter(
  filters: SearchFilters,
  pageParam: number,
  limit: number
): PaginatedResponse<Player> {
  let filtered = [...ALL_PLAYERS]

  if (filters.query) {
    const q = filters.query.toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q))
  }
  if (filters.nationalities?.length) filtered = filtered.filter(p => filters.nationalities.includes(p.nationality))
  if (filters.position && filters.position !== 'ALL') filtered = filtered.filter(p => p.position === filters.position)
  if (filters.league && filters.league !== 'ALL') filtered = filtered.filter(p => p.league === filters.league)
  if (filters.club) filtered = filtered.filter(p => p.club === filters.club)
  if (filters.minRating > 0) filtered = filtered.filter(p => p.rating >= filters.minRating)
  if (filters.maxPrice > 0) filtered = filtered.filter(p => p.price <= filters.maxPrice)

  const sort: SortOption = filters.sortBy ?? 'rating_desc'
  filtered.sort((a, b) => {
    switch (sort) {
      case 'rating_asc': return a.rating - b.rating
      case 'price_desc': return b.price - a.price
      case 'price_asc': return a.price - b.price
      case 'name_asc': return a.name.localeCompare(b.name)
      default: return b.rating - a.rating
    }
  })

  const startIndex = (pageParam - 1) * limit
  const data = filtered.slice(startIndex, startIndex + limit)
  return { data, nextPage: startIndex + limit < filtered.length ? pageParam + 1 : null, total: filtered.length }
}

export const getNationalities = () => {
  const nats = new Set(ALL_PLAYERS.map(p => p.nationality))
  return Array.from(nats).sort()
}

export const getLeagues = () => {
  const leagues = new Set(ALL_PLAYERS.map(p => p.league))
  return Array.from(leagues).sort()
}

export const getClubs = () => {
  const clubs = new Set(ALL_PLAYERS.map(p => p.club))
  return Array.from(clubs).sort()
}


export const getClubsByLeague = (league: string | undefined) => {
  if (!league || league === 'ALL') return getClubs()
  const clubs = new Set(ALL_PLAYERS.filter(p => p.league === league).map(p => p.club))
  return Array.from(clubs).sort()
}

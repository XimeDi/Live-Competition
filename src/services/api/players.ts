import type { Player, SearchFilters, PaginatedResponse } from '@/types'

const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'L. Messi', photo: 'https://i.pravatar.cc/150?u=messi', nationality: 'Argentina', club: 'Inter Miami', position: 'FWD', rating: 93, price: 12.5 },
  { id: '2', name: 'K. Mbappe', photo: 'https://i.pravatar.cc/150?u=mbappe', nationality: 'France', club: 'Real Madrid', position: 'FWD', rating: 91, price: 12.0 },
  { id: '3', name: 'E. Haaland', photo: 'https://i.pravatar.cc/150?u=haaland', nationality: 'Norway', club: 'Manchester City', position: 'FWD', rating: 91, price: 12.0 },
  { id: '4', name: 'K. De Bruyne', photo: 'https://i.pravatar.cc/150?u=kdb', nationality: 'Belgium', club: 'Manchester City', position: 'MID', rating: 91, price: 11.0 },
  { id: '5', name: 'V. van Dijk', photo: 'https://i.pravatar.cc/150?u=vvd', nationality: 'Netherlands', club: 'Liverpool', position: 'DEF', rating: 89, price: 7.0 },
  { id: '6', name: 'T. Courtois', photo: 'https://i.pravatar.cc/150?u=courtois', nationality: 'Belgium', club: 'Real Madrid', position: 'GK', rating: 90, price: 6.5 },
  { id: '7', name: 'Vini Jr.', photo: 'https://i.pravatar.cc/150?u=vini', nationality: 'Brazil', club: 'Real Madrid', position: 'FWD', rating: 89, price: 11.5 },
  { id: '8', name: 'Rodri', photo: 'https://i.pravatar.cc/150?u=rodri', nationality: 'Spain', club: 'Manchester City', position: 'MID', rating: 89, price: 9.0 },
  { id: '9', name: 'R. Dias', photo: 'https://i.pravatar.cc/150?u=dias', nationality: 'Portugal', club: 'Manchester City', position: 'DEF', rating: 89, price: 6.5 },
  { id: '10', name: 'Alisson', photo: 'https://i.pravatar.cc/150?u=alisson', nationality: 'Brazil', club: 'Liverpool', position: 'GK', rating: 89, price: 6.0 },
  { id: '11', name: 'J. Bellingham', photo: 'https://i.pravatar.cc/150?u=bellingham', nationality: 'England', club: 'Real Madrid', position: 'MID', rating: 88, price: 10.0 },
  { id: '12', name: 'B. Saka', photo: 'https://i.pravatar.cc/150?u=saka', nationality: 'England', club: 'Arsenal', position: 'MID', rating: 87, price: 9.5 },
  { id: '13', name: 'M. Salah', photo: 'https://i.pravatar.cc/150?u=salah', nationality: 'Egypt', club: 'Liverpool', position: 'FWD', rating: 89, price: 11.0 },
  { id: '14', name: 'Marquinhos', photo: 'https://i.pravatar.cc/150?u=marquinhos', nationality: 'Brazil', club: 'PSG', position: 'DEF', rating: 87, price: 6.0 },
  { id: '15', name: 'H. Kane', photo: 'https://i.pravatar.cc/150?u=kane', nationality: 'England', club: 'Bayern Munich', position: 'FWD', rating: 90, price: 11.5 },
  { id: '16', name: 'L. Modric', photo: 'https://i.pravatar.cc/150?u=modric', nationality: 'Croatia', club: 'Real Madrid', position: 'MID', rating: 87, price: 8.0 },
  { id: '17', name: 'A. Davies', photo: 'https://i.pravatar.cc/150?u=davies', nationality: 'Canada', club: 'Bayern Munich', position: 'DEF', rating: 85, price: 6.0 },
  { id: '18', name: 'E. Martinez', photo: 'https://i.pravatar.cc/150?u=martinez', nationality: 'Argentina', club: 'Aston Villa', position: 'GK', rating: 85, price: 5.5 },
  { id: '19', name: 'C. Romero', photo: 'https://i.pravatar.cc/150?u=romero', nationality: 'Argentina', club: 'Tottenham', position: 'DEF', rating: 85, price: 5.5 },
  { id: '20', name: 'Fede Valverde', photo: 'https://i.pravatar.cc/150?u=fede', nationality: 'Uruguay', club: 'Real Madrid', position: 'MID', rating: 88, price: 9.0 },
  { id: '21', name: 'S. Heung-min', photo: 'https://i.pravatar.cc/150?u=son', nationality: 'South Korea', club: 'Tottenham', position: 'FWD', rating: 88, price: 10.0 },
  { id: '22', name: 'A. Hakimi', photo: 'https://i.pravatar.cc/150?u=hakimi', nationality: 'Morocco', club: 'PSG', position: 'DEF', rating: 86, price: 6.5 },
  { id: '23', name: 'P. Foden', photo: 'https://i.pravatar.cc/150?u=foden', nationality: 'England', club: 'Manchester City', position: 'MID', rating: 86, price: 9.5 },
  { id: '24', name: 'Y. Bounou', photo: 'https://i.pravatar.cc/150?u=bounou', nationality: 'Morocco', club: 'Al Hilal', position: 'GK', rating: 85, price: 5.5 },
  { id: '25', name: 'J. Musiala', photo: 'https://i.pravatar.cc/150?u=musiala', nationality: 'Germany', club: 'Bayern Munich', position: 'MID', rating: 86, price: 9.0 },
]

export const getPlayers = async (
  filters: SearchFilters,
  pageParam = 1,
  limit = 10
): Promise<PaginatedResponse<Player>> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  let filtered = [...MOCK_PLAYERS]

  if (filters.query) {
    const q = filters.query.toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q))
  }
  
  if (filters.nationality) {
    filtered = filtered.filter(p => p.nationality === filters.nationality)
  }
  
  if (filters.position && filters.position !== 'ALL') {
    filtered = filtered.filter(p => p.position === filters.position)
  }
  
  if (filters.club) {
    filtered = filtered.filter(p => p.club === filters.club)
  }
  
  if (filters.minRating > 0) {
    filtered = filtered.filter(p => p.rating >= filters.minRating)
  }

  // Pagination logic
  const startIndex = (pageParam - 1) * limit
  const endIndex = startIndex + limit
  const data = filtered.slice(startIndex, endIndex)
  
  const nextPage = endIndex < filtered.length ? pageParam + 1 : null

  return {
    data,
    nextPage,
    total: filtered.length
  }
}

// Helpers for the filters
export const getNationalities = () => {
  const nats = new Set(MOCK_PLAYERS.map(p => p.nationality))
  return Array.from(nats).sort()
}

export const getClubs = () => {
  const clubs = new Set(MOCK_PLAYERS.map(p => p.club))
  return Array.from(clubs).sort()
}

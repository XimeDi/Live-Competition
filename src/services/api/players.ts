import type { Player, SearchFilters, PaginatedResponse, SortOption } from '@/types'
import playersData from '@/data/players.json'

const ALL_PLAYERS: Player[] = (playersData as any[]).map(p => {
  // Use a proxy to bypass ORB/CORS and ensure images load correctly
  const photoUrl = p.photo.replace('https://', '')
  return {
    ...p,
    id: String(p.id),
    photo: `https://images.weserv.nl/?url=${photoUrl}&w=120&h=120&fit=cover&mask=circle`
  }
})

export const getPlayers = async (
  filters: SearchFilters,
  pageParam = 1,
  limit = 12 // Increased to match the 3-column layout better
): Promise<PaginatedResponse<Player>> => {
  // Simulate network delay (reduced for snappier UX)
  await new Promise((resolve) => setTimeout(resolve, 200))

  let filtered = [...ALL_PLAYERS]

  if (filters.query) {
    const q = filters.query.toLowerCase()
    filtered = filtered.filter(
      p => p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q)
    )
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

  if (filters.maxPrice > 0) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice)
  }

  // Sort
  const sort: SortOption = filters.sortBy ?? 'rating_desc'
  filtered.sort((a, b) => {
    switch (sort) {
      case 'rating_asc':  return a.rating - b.rating
      case 'price_desc':  return b.price - a.price
      case 'price_asc':   return a.price - b.price
      case 'name_asc':    return a.name.localeCompare(b.name)
      default:            return b.rating - a.rating // rating_desc
    }
  })

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
  const nats = new Set(ALL_PLAYERS.map(p => p.nationality))
  return Array.from(nats).sort()
}

export const getClubs = () => {
  const clubs = new Set(ALL_PLAYERS.map(p => p.club))
  return Array.from(clubs).sort()
}

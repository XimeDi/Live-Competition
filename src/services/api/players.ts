import type { Player, SearchFilters, PaginatedResponse } from '@/types'
import { apiJson } from './client'

export const getPlayers = async (
  filters: SearchFilters,
  pageParam = 1,
  limit = 12
): Promise<PaginatedResponse<Player>> => {
  const params = new URLSearchParams()
  params.set('page', String(pageParam))
  params.set('limit', String(limit))

  const q = filters.query.trim()
  if (q.length >= 2) {
    params.set('q', q)
  }

  if (filters.nationalities.length > 0) {
    params.set('nationalities', filters.nationalities.join(','))
  }
  if (filters.club) {
    params.set('club', filters.club)
  }
  if (filters.position && filters.position !== 'ALL') {
    params.set('position', filters.position)
  }
  params.set('minRating', String(filters.minRating))
  if (filters.maxRating < 99) {
    params.set('maxRating', String(filters.maxRating))
  }
  if (filters.minPrice > 0) {
    params.set('minPrice', String(filters.minPrice))
  }
  params.set('maxPrice', String(filters.maxPrice))

  return apiJson<PaginatedResponse<Player>>(`/api/search?${params}`, { method: 'GET' })
}

export type SearchMetaResponse = {
  nationalities: string[]
  clubs: string[]
}

export const getSearchMeta = (): Promise<SearchMetaResponse> => {
  return apiJson<SearchMetaResponse>('/api/search/meta', { method: 'GET' })
}

export type SearchSuggestResponse = {
  suggestions: { id: string; name: string }[]
}

export const getSearchSuggest = (q: string, limit = 8): Promise<SearchSuggestResponse> => {
  const params = new URLSearchParams({ q: q.trim(), limit: String(limit) })
  return apiJson<SearchSuggestResponse>(`/api/search/suggest?${params}`, { method: 'GET' })
}

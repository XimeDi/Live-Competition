export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export interface Player {
  id: string
  name: string
  photo: string
  nationality: string
  club: string
  clubLogo?: string
  league?: string
  leagueLogo?: string
  position: Position
  rating: number
  price: number
}

export type SortOption = 'rating_desc' | 'rating_asc' | 'price_desc' | 'price_asc' | 'name_asc'

export interface SearchFilters {
  /** Sent to API only when length >= 2 (F2.1). */
  query: string
  /** OR group in Meilisearch (F2.3). */
  nationalities: string[]
  position?: Position | 'ALL'
  league?: string
  club?: string
  minRating: number
  /** Upper OVR cap; 99 = no filter sent. */
  maxRating?: number
  minPrice?: number
  maxPrice: number
  sortBy?: SortOption
}

export interface PaginatedResponse<T> {
  data: T[]
  nextPage: number | null
  total: number
}

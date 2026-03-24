export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export interface Player {
  id: string
  name: string
  photo: string
  nationality: string
  club: string
  position: Position
  rating: number
  price: number
}

export interface SearchFilters {
  query: string
  nationality?: string
  position?: Position | 'ALL'
  club?: string
  minRating: number
}

export interface PaginatedResponse<T> {
  data: T[]
  nextPage: number | null
  total: number
}

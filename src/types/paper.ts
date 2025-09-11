export interface Author {
  id: string
  name: string
  institution?: string
}

export interface Paper {
  id: string
  title: string
  authors: Author[]
  abstract: string
  publishDate: string
  journal: string
  fields: string[]
  keywords: string[]
  citations: number
  favorites: number
  isFavorited: boolean
  pdfUrl?: string
  doi?: string
}

export interface SearchFilters {
  fields: string[]
  timeRange: string
  sortBy: string
}
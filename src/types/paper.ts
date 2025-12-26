export interface Author {
  id: string
  name: string
  institution?: string
}

export interface Paper {
  id: string
  title: string
  authorships: Author[]
  publicationDate: string
  abstractText: string
  citedByCount: number
  favouriteCount: number
  readCount: number
  isfavorited: boolean
  publication: string // 刊物
  institution: string // 机构
  keyword: string[]
  concepts: string[]
  doi?: string
  landingPageUrl?: string
}

export interface SearchFilters {
  fields: string[]
  timeRange: string
  sortBy: string
  author?: string
  organization?: string
  institution?: string
  q?: string
  startDate?: string
  endDate?: string
  time_start?: string
  time_end?: string
}
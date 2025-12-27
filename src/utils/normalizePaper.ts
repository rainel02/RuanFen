import type { Paper } from '@/types/paper'

const normalizeId = (id?: string) => {
  if (!id) return ''
  if (id.startsWith('http')) return id.split('/').pop() || id
  return id
}

const normalizeAuthors = (auths: any = []) => {
  // normalize string payloads like "Author1, Author2" into an array first
  let list: any[] = []
  if (Array.isArray(auths)) {
    list = auths
  } else if (typeof auths === 'string') {
    list = auths.split(/[;,、]\s*/).filter(Boolean)
  } else if (auths && typeof auths === 'object') {
    list = [auths]
  }

  return list.map((au: any) => {
    if (!au) return { id: '', name: '' }
    if (au.author) {
      return {
        id: normalizeId(au.author.id),
        name: au.author.display_name || au.author.name || au.displayName || au.name || ''
      }
    }
    const id = normalizeId(au.authorId || au.author_id || au.id)
    const name = au.authorName || au.author_name || au.display_name || au.displayName || au.name || au.fullName || (typeof au === 'string' ? au : '')
    return { id, name }
  }).filter(a => a.name)
}

export function normalizePaper(raw: any): Paper {
  const a = raw?.achievement || raw || {}
  const id = normalizeId(a.id || raw?.achievementId || raw?.id)
  const hostVenue = (a as any)?.hostVenue

  // pick authors from multiple possible fields (backend may vary)
  const authorsField = a.authorships
    || a.authors
    || a.authorList
    || a.authorNames
    || a.authorName
    || a.author
    || raw?.authors
    || raw?.author
    || []

  const paper: Paper = {
    id,
    title: a.title || raw?.title || '未命名论文',
    authorships: normalizeAuthors(authorsField),
    publicationDate: a.publicationDate || a.year || '',
    abstractText: a.abstractText || a.abstract || '',
    citedByCount: a.citedByCount || a.citationCount || a.cited_by_count || 0,
    favouriteCount: a.favouriteCount ?? a.favorites ?? raw?.favouriteCount ?? 0,
    readCount: a.readCount ?? raw?.readCount ?? 0,
    isfavorited: a.isfavorited
      ?? a.isFavorite
      ?? a.favorite
      ?? a.favorited
      ?? a.favourited
      ?? a.collected
      ?? a.isCollected
      ?? a.isCollect
      ?? raw?.isfavorited
      ?? raw?.isFavorite
      ?? raw?.favorite
      ?? raw?.favorited
      ?? raw?.favourited
      ?? raw?.collected
      ?? raw?.isCollected
      ?? raw?.isCollect
      ?? false,
    publication: hostVenue?.displayName || a.publication || a.journalName || '',
    institution: a.institution || '',
    keyword: a.keyword || a.keywords || [],
    concepts: a.concepts || [],
    doi: a.doi,
    landingPageUrl: a.landingPageUrl || a.url
  }

  return paper
}

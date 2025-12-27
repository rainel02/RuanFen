import type { Paper } from '@/types/paper'

const normalizeId = (id?: string) => {
  if (!id) return ''
  if (id.startsWith('http')) return id.split('/').pop() || id
  return id
}

const normalizeAuthors = (auths: any = [], authorNames?: any[]) => {
  // 优先 authorships（对象数组），否则 authorNames（字符串数组）
  if (Array.isArray(auths) && auths.length && typeof auths[0] === 'object' && 'name' in auths[0]) {
    return auths.map((au: any) => ({
      id: normalizeId(au.id),
      name: au.name || ''
    })).filter(a => a.name)
  }
  if (Array.isArray(authorNames) && authorNames.length) {
    return authorNames.map((name: string) => ({ id: '', name }))
  }
  // 兼容字符串
  if (typeof auths === 'string') {
    return auths.split(/[;,、]\s*/).filter(Boolean).map((name: string) => ({ id: '', name }))
  }
  return []
}

export function normalizePaper(raw: any): Paper {
  // 兼容后端返回格式，优先使用顶层字段
  const id = normalizeId(raw.id || raw.achievementId || (raw.achievement && raw.achievement.id))
  const a = raw.achievement || raw || {}
  const hostVenue = (a as any)?.hostVenue

  // authors字段兼容：优先 authorships（对象数组），否则 authorNames（字符串数组）
  const authorsField = raw.authorships || a.authorships || []
  const authorNamesField = raw.authorNames || a.authorNames || []

  // institution 字段兼容：优先 institution（对象数组），否则 institutionNames（字符串数组）
  const institutionField = raw.institution || a.institution || []
  const institutionNamesField = raw.institutionNames || a.institutionNames || []

  const paper: Paper = {
    id,
    title: a.title || raw?.title || '未命名论文',
    authorships: normalizeAuthors(authorsField, authorNamesField),
    publicationDate: a.publicationDate || a.year || '',
    abstractText: a.abstractText || a.abstract || '',
    citedByCount: a.citedByCount || a.citationCount || a.cited_by_count || 0,
    favouriteCount: a.favouriteCount ?? a.favorites ?? raw?.favouriteCount ?? 0,
    readCount: a.readCount ?? raw?.readCount ?? 0,
    isfavorited: a.isFavourite
      ?? a.isfavorited
      ?? a.isFavorite
      ?? a.favorite
      ?? a.favorited
      ?? a.favourited
      ?? a.collected
      ?? a.isCollected
      ?? a.isCollect
      ?? raw?.isFavourite
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
    institution: Array.isArray(institutionField) && institutionField.length && institutionField[0].displayName
      ? institutionField.map((i: any) => i.displayName).join(', ')
      : (Array.isArray(institutionNamesField) ? institutionNamesField.join(', ') : ''),
    keyword: a.keyword || a.keywords || [],
    concepts: a.concepts || [],
    doi: a.doi,
    landingPageUrl: a.landingPageUrl || a.url
  }

  return paper
}

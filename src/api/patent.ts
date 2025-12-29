import request from '../utils/request'
import { mockPatents } from '../mock/patents'
import type { Patent, PatentSearchFilters } from '../types/patent'

const mapBackendToPatent = (item: any): Patent => {
  const applicationNumber = item.applicationNumber || item.applicationNo || ''
  const publicationNumber = item.grantNumber || item.publicationNumber || ''
  const applicationYear = item.applicationYear != null ? String(item.applicationYear) : (item.applicationYearStr || '')
  const publicationYear = item.grantYear != null ? String(item.grantYear) : (item.publicationYearStr || '')
  const inventors = (item.inventor || item.inventors || '').split(/[;；]/).map((s: string) => s.trim()).filter(Boolean)
  const ipc = (item.ipcCode || item.ipcClassification || '')

  return {
    id: applicationNumber || publicationNumber || (item.patentName || item.title || '').slice(0, 60),
    title: item.patentName || item.title || '',
    type: item.patentType || item.type || '',
    applicant: item.applicant || '',
    applicantType: item.applicantType,
    applicationNumber: applicationNumber || '',
    applicationYear,
    publicationNumber: publicationNumber || '',
    publicationYear,
    ipcClassification: ipc,
    inventors,
    abstract: item.abstractText || item.abstract || '',
    claims: item.claims || '',
    currentAssignee: item.currentAssignee || item.applicant || '',
    citedCount: typeof item.citedCount === 'number' ? item.citedCount : (item.citedCount ? Number(item.citedCount) : undefined),
    grantNumber: publicationNumber
  }
}

export default {
  async getPatents(page = 1, pageSize = 12, filters: PatentSearchFilters = {}) {
    try {
      const params: any = {}
      if (filters.q) params.q = filters.q
      if (filters.applicationYear != null) params.applicationYear = filters.applicationYear
      if (filters.grantYear != null) params.grantYear = filters.grantYear
      // include pagination params (backend expects 0-based page index)
      params.page = page - 1
      // change pageSize -> size to match backend parameter name
      params.size = pageSize

      const raw: any = await request.get('/patent', { params })
      // normalize potential shapes: backend may return { content: [], totalElements },
      // or return an array directly, or wrap with { data: ... }
      const content = raw && (raw.content ?? raw.data ?? raw)
      console.log('Raw patent API response:', raw)
      let list: Patent[] = []
      let total = 0

      if (Array.isArray(content)) {
        // backend returned an array (could be paged or full list)
        list = content.map(mapBackendToPatent)

        // prefer explicit server-side total metadata when present
        if (raw && (raw.totalElements != null)) {
          total = Number(raw.totalElements)
        } else if (raw && (raw.total != null)) {
          total = Number(raw.total)
        } else {
          // no server-side metadata — treat returned array as full list
          total = list.length
        }
      } else {
        // fallback to mock if response shape unexpected
        list = mockPatents.map((m: any) => ({ ...m }))
        total = list.length
      }

      // if backend returned the full list (no server-side total metadata),
      // apply client-side pagination
      if (Array.isArray(content) && !(raw && (raw.totalElements != null || raw.total != null))) {
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paged = list.slice(start, end)
        return { list: paged, total: list.length }
      }

      return { list, total }
    } catch (error) {
      console.error('Failed to fetch patents from backend, falling back to mock:', error)
      const list = mockPatents.map((m: any) => ({ ...m }))
      return { list, total: list.length }
    }
  },

  async getPatentById(id: string) {
    try {
      // Try to query backend by application number or id via q
      const raw: any = await request.get('/achievements/patent', { params: { q: id } })
      const res: any = raw && (raw as any).data ? (raw as any).data : raw
      let found: any = null
      if (Array.isArray(res)) {
        found = res.find((it: any) => (it.applicationNumber === id) || (it.grantNumber === id) || (it.id === id))
      } else if (res && Array.isArray((res as any).list)) {
        found = (res as any).list[0]
      }
      if (found) return mapBackendToPatent(found)
    } catch (e) {
      console.warn('getPatentById backend lookup failed, fallback to mock', e)
    }

    // fallback to mock
    const fromMock = mockPatents.find(p => p.id === id || p.applicationNumber === id) || null
    return fromMock
  }
}

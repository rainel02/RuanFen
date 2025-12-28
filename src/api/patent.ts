import { mockPatents } from '../mock/patents'
import type { Patent, PatentSearchFilters } from '../types/patent'

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default {
  async getPatents(page = 1, pageSize = 10, filters: PatentSearchFilters = {}) {
    await delay(500) // 模拟网络延迟

    let filtered = [...mockPatents]

    if (filters.q) {
      const q = filters.q.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.abstract.toLowerCase().includes(q) ||
        p.applicant.toLowerCase().includes(q)
      )
    }

    if (filters.type) {
      filtered = filtered.filter(p => p.type === filters.type)
    }

    const total = filtered.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = filtered.slice(start, end)

    return {
      list,
      total
    }
  },

  async getPatentById(id: string) {
    await delay(300)
    return mockPatents.find(p => p.id === id) || null
  }
}

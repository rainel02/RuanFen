import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockPapers } from '../mock/papers'
import type { Paper, SearchFilters } from '../types/paper'

export const usePapersStore = defineStore('papers', () => {
  const papers = ref<Paper[]>(mockPapers)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const searchQuery = ref('')
  const selectedFields = ref<string[]>([])
  const timeRange = ref('all')
  const sortBy = ref('latest')

  const filteredPapers = computed(() => {
    let result = [...papers.value]

    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(paper =>
        paper.title.toLowerCase().includes(query) ||
        paper.authors.some(author => author.name.toLowerCase().includes(query)) ||
        paper.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    }

    // 领域过滤
    if (selectedFields.value.length > 0) {
      result = result.filter(paper =>
        selectedFields.value.some(field => paper.fields.includes(field))
      )
    }

    // 时间过滤
    if (timeRange.value !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (timeRange.value) {
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      result = result.filter(paper => new Date(paper.publishDate) >= filterDate)
    }

    // 排序
    switch (sortBy.value) {
      case 'latest':
        result.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        break
      case 'citations':
        result.sort((a, b) => b.citations - a.citations)
        break
      case 'favorites':
        result.sort((a, b) => b.favorites - a.favorites)
        break
    }

    return result
  })

  const paginatedPapers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredPapers.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredPapers.value.length / pageSize.value)
  )

  const searchPapers = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  const setFilters = (filters: Partial<SearchFilters>) => {
    if (filters.fields !== undefined) selectedFields.value = filters.fields
    if (filters.timeRange !== undefined) timeRange.value = filters.timeRange
    if (filters.sortBy !== undefined) sortBy.value = filters.sortBy
    currentPage.value = 1
  }

  const toggleFavorite = (paperId: string) => {
    const paper = papers.value.find(p => p.id === paperId)
    if (paper) {
      paper.isFavorited = !paper.isFavorited
      paper.favorites += paper.isFavorited ? 1 : -1
    }
  }

  return {
    papers,
    loading,
    currentPage,
    pageSize,
    searchQuery,
    selectedFields,
    timeRange,
    sortBy,
    filteredPapers,
    paginatedPapers,
    totalPages,
    searchPapers,
    setFilters,
    toggleFavorite
  }
})

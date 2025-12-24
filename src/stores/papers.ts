import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Paper, SearchFilters } from '../types/paper'
import api from '../api'

export const usePapersStore = defineStore('papers', () => {
  const papers = ref<Paper[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const searchQuery = ref('')
  const selectedFields = ref<string[]>([])
  const timeRange = ref('all')
  const sortBy = ref('latest')
  const total = ref(0)

  const filteredPapers = computed(() => papers.value)

  const paginatedPapers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredPapers.value.slice(start, end)
  })

  const totalPages = computed(() => Math.ceil((total.value || filteredPapers.value.length) / pageSize.value))

  const searchPapers = async (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
    await fetchPapers()
  }

  const setFilters = async (filters: Partial<SearchFilters>) => {
    if (filters.fields !== undefined) selectedFields.value = filters.fields
    if (filters.timeRange !== undefined) timeRange.value = filters.timeRange
    if (filters.sortBy !== undefined) sortBy.value = filters.sortBy
    if (filters.author !== undefined) (searchQuery.value = filters.author)
    currentPage.value = 1
    await fetchPapers()
  }

  const fetchPapers = async () => {
    loading.value = true
    try {
      const params: Record<string, any> = {}
      if (searchQuery.value) params.q = searchQuery.value
      if (selectedFields.value.length) params.field = selectedFields.value[0]
      if (sortBy.value === 'citations') params.sort_by = 'citations'
      if (sortBy.value === 'latest') params.sort_by = 'time'

      const data = await api.searchAchievements(params)
      // api returns { results, total }
      papers.value = data.results || []
      total.value = data.total ?? papers.value.length
    } catch (e) {
      console.error('fetchPapers error', e)
    } finally {
      loading.value = false
    }
  }

  const toggleFavorite = (paperId: string) => {
    const paper = papers.value.find(p => p.id === paperId)
    if (paper) {
      paper.isfavorited = !paper.isfavorited
      console.log('Toggled favorite for paper', paperId, 'to', paper.isfavorited)
      paper.favoriteCount += paper.isfavorited ? 1 : -1
      // call collection API
      if (paper.isfavorited) {
        api.addToCollections(paper.id).catch(() => {})
      } else {
        api.removeFromCollections(paper.id).catch(() => {})
      }
    }
  }

  return {
    papers,
    total,
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
    toggleFavorite,
    fetchPapers
  }
})

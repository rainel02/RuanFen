import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Paper, SearchFilters } from '../types/paper'
import api from '../api'

export const usePapersStore = defineStore('papers', () => {
  const papers = ref<Paper[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const searchQuery = ref('')
  const author = ref('')
  const institution = ref('')
  const selectedFields = ref<string[]>([])
  const timeRange = ref('all')
  const sortBy = ref('latest')
  const startDate = ref('')
  const endDate = ref('')
  const total = ref(0)

  const filteredPapers = computed(() => papers.value)

  // 后端已做分页，`papers` 存储当前页数据，前端不应再次按页面切片
  const paginatedPapers = computed(() => filteredPapers.value)

  const totalPages = computed(() => Math.ceil((total.value || filteredPapers.value.length) / pageSize.value))

  const searchPapers = async (query: string) => {
    searchQuery.value = query
    // ensure explicit fetch happens once even though a watcher also listens to page changes
    skipNextFetchOnPageChange.value = true
    currentPage.value = 1
    await fetchPapers()
  }

  const setFilters = async (filters: Partial<SearchFilters>) => {
    if (filters.fields !== undefined) selectedFields.value = filters.fields
    if (filters.timeRange !== undefined) timeRange.value = filters.timeRange
    if (filters.sortBy !== undefined) sortBy.value = filters.sortBy
    // accept q (search), author, institution, startDate, endDate
    if ((filters as any).q !== undefined) searchQuery.value = (filters as any).q
    if ((filters as any).author !== undefined) author.value = (filters as any).author
    if ((filters as any).institution !== undefined) institution.value = (filters as any).institution
    if ((filters as any).startDate !== undefined) startDate.value = (filters as any).startDate
    if ((filters as any).endDate !== undefined) endDate.value = (filters as any).endDate
    // when resetting filters we set page to 1 and perform an explicit fetch;
    // set a skip flag so the pagination watcher doesn't trigger a duplicate fetch
    skipNextFetchOnPageChange.value = true
    currentPage.value = 1
    await fetchPapers()
  }

  const fetchPapers = async () => {
    loading.value = true
    try {
      const params: Record<string, any> = {}
      
      // Backend requires at least one search condition
      // Always provide q parameter (empty string searches all)
      params.q = searchQuery.value || ''
      
      // optional filters
      if (author.value) params.author = author.value
      if (institution.value) params.institution = institution.value
      if (selectedFields.value.length) params.field = selectedFields.value[0]
      if (startDate.value) params.startDate = startDate.value
      if (endDate.value) params.endDate = endDate.value
      
      // pagination: backend uses 0-based page numbers
      params.page = Math.max(0, currentPage.value - 1)
      params.size = pageSize.value

      const data = await api.searchAchievements(params)
      // api 返回已由请求封装器 unwrap 为 `data` 对象
      // 例如后端原始响应为 { code, message, data: { content, totalElements } }
      // 此处 `data` 已等同于后端的 `data` 字段
      papers.value = data.content || []
      console.log(data)
      total.value = data.totalElements ?? papers.value.length
    } catch (e) {
      console.error('fetchPapers error', e)
    } finally {
      loading.value = false
    }
  }

  // When user changes page or page size via UI, trigger fetch automatically.
  // Use a skip flag to avoid duplicate fetch when callers already perform an explicit fetch
  const skipNextFetchOnPageChange = ref(false)
  watch([currentPage, pageSize], async () => {
    console.log('Page or pageSize changed:', currentPage.value, pageSize.value)
    if (skipNextFetchOnPageChange.value) {
      skipNextFetchOnPageChange.value = false
      return
    }
    await fetchPapers()
  })

  const toggleFavorite = async (paperId: string) => {
    const paper = papers.value.find(p => p.id === paperId)
    if (paper) {
      const originalState = paper.isfavorited
      
      paper.isfavorited = !paper.isfavorited
      console.log('Toggled favorite for paper', paperId, 'to', paper.isfavorited)
      paper.favouriteCount += paper.isfavorited ? 1 : -1
      
      try {
        // call collection API
        if (paper.isfavorited) {
          await api.addToCollections(paper.id)
        } else {
          await api.removeFromCollections(paper.id)
        }
      } catch (e) {
        console.error('Failed to toggle favorite, rolling back', e)
        // rollback
        paper.isfavorited = originalState
        paper.favouriteCount += paper.isfavorited ? 1 : -1
        throw e // re-throw to let UI handle notification
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
    author,
    institution,
    selectedFields,
    timeRange,
    sortBy,
    filteredPapers,
    paginatedPapers,
    totalPages,
    searchPapers,
    setFilters,
    toggleFavorite,
    fetchPapers,
    // expose skip flag so components can avoid duplicate fetches when they call fetchPapers manually
    skipNextFetchOnPageChange
  }
})

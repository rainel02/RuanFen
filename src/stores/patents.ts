import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Patent, PatentSearchFilters } from '../types/patent'
import patentApi from '../api/patent'

export const usePatentsStore = defineStore('patents', () => {
  const patents = ref<Patent[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const searchQuery = ref('')
  const total = ref(0)
  
  // Filters
  const typeFilter = ref('')
  const applicantFilter = ref('')
  const applicationYear = ref<number | null>(null)
  const grantYear = ref<number | null>(null)

  const setFilters = async (filters: Partial<PatentSearchFilters>) => {
    console.log('Applying filters:', filters)
    if (filters.q !== undefined) searchQuery.value = filters.q as string
    if (filters.applicationYear !== undefined) applicationYear.value = Number(filters.applicationYear) || null
    if (filters.grantYear !== undefined) grantYear.value = Number(filters.grantYear) || null
    console.log('Setting filters:', filters)
    currentPage.value = 1
    await fetchPatents()
  }

  const paginatedPatents = computed(() => patents.value)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  const fetchPatents = async () => {
    loading.value = true
    try {
      const filters: PatentSearchFilters = {
        q: searchQuery.value,
        applicationYear: applicationYear.value ?? undefined,
        grantYear: grantYear.value ?? undefined
      }
      console.log('Fetching patents with filters:', filters)
      
      const res = await patentApi.getPatents(currentPage.value, pageSize.value, filters)
      patents.value = res.list
      total.value = res.total
    } catch (error) {
      console.error('Failed to fetch patents:', error)
      patents.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  const searchPatents = async (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
    await fetchPatents()
  }

  const getPatentById = async (id: string) => {
    loading.value = true
    try {
      return await patentApi.getPatentById(id)
    } finally {
      loading.value = false
    }
  }

  return {
    patents,
    loading,
    currentPage,
    pageSize,
    searchQuery,
    total,
    totalPages,
    paginatedPatents,
    typeFilter,
    applicantFilter,
    applicationYear,
    grantYear,
    setFilters,
    fetchPatents,
    searchPatents,
    getPatentById
  }
})

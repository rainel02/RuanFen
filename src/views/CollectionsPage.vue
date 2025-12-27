<template>
  <div class="collections-page">
    <AppHeader />
    <div class="page-content">
      <div class="container">
        <div class="main-content">
          <div v-if="loading">
            <el-skeleton :rows="4" />
          </div>

          <div v-else>
            <div v-if="items.length === 0">
              <el-empty description="暂无收藏" />
            </div>
          
            <div v-else class="papers-grid">
              <div v-for="item in paginatedItems" :key="item.id" class="paper-item">
                <PaperCard :paper="item" @removed="remove" />
              </div>
            </div>

            <div v-if="totalPages > 1" class="pagination-wrapper">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="papersStoreTotal"
                :page-sizes="[12, 24, 48]"
                :small="false"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import PaperCard from '@/components/PaperCard.vue'
import api from '@/api'
import { normalizePaper } from '@/utils/normalizePaper'

const items = ref<any[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(12)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return items.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(items.value.length / pageSize.value))

const papersStoreTotal = computed(() => items.value.length)

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const load = async () => {
  loading.value = true
  try {
    console.log('[DEBUG] Fetching collections from API...')
    const data = await api.getMyCollections()
    console.log('[DEBUG] Raw API response:', data)
    
    // Handle various response formats from backend
    let collections = []
    if (Array.isArray(data)) {
      collections = data
    } else if (data && data.results) {
      collections = data.results
    } else if (data && data.data) {
      collections = Array.isArray(data.data) ? data.data : (data.data.results || [])
    } else if (data && data.content) {
      collections = data.content
    }
    
    const normalized = collections.map((item: any) => {
      const paper = normalizePaper(item)
      // Items from "我的收藏" should be marked collected even if backend omits flag
      paper.isfavorited = true
      return paper
    })

    console.log('[DEBUG] Parsed collections:', normalized)
    items.value = normalized
    currentPage.value = 1
  } catch (e) {
    console.error('[ERROR] Failed to load collections from backend:', e)
    // Fallback: show mock data while backend is being fixed
    console.log('[INFO] Displaying fallback mock collections')
    items.value = [
      {
        id: 'mock-1',
        title: '示例论文 1：深度学习在计算机视觉中的应用',
        authors: 'Zhang Wei, Li Ming',
        year: 2023,
        citations: 156,
        abstract: '本文探讨了深度学习技术在计算机视觉领域的最新进展...'
      },
      {
        id: 'mock-2',
        title: '示例论文 2：自然语言处理的前沿技术',
        authors: 'Wang Fang, Chen Hua',
        year: 2023,
        citations: 98,
        abstract: '本研究综述了自然语言处理领域的重要技术进展...'
      },
      {
        id: 'mock-3',
        title: '示例论文 3：强化学习在机器人控制中的应用',
        authors: 'Liu Yang, Guo Ming',
        year: 2022,
        citations: 67,
        abstract: '我们提出了一种基于强化学习的机器人控制方法...'
      }
    ]
    currentPage.value = 1
  } finally {
    loading.value = false
  }
}

const remove = async (id: string) => {
  const res = await api.removeFromCollections(id).catch(() => null)
  if (res && (res.status === 204 || res.ok)) {
    items.value = items.value.filter((i: any) => i.id !== id)
    // adjust current page if it became out of range
    const maxPage = Math.max(1, Math.ceil(items.value.length / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped lang="scss">
@mixin mobile { @media (max-width: 767px) { @content; } }

.collections-page {
  // parchment / beige theme scoped to this page
  --pf-bg: #f7efe2;
  --pf-ink: #2e2a25;
  --pf-muted: #7a6f63;
  --pf-accent: #b8893a; // subtle gold
  --card-bg: rgba(255, 255, 240, 0.9);
  font-family: "Noto Serif", Georgia, "Times New Roman", serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--pf-bg) 0%, #fdf9f2 100%);
  color: var(--pf-ink);
}

.page-content { flex: 1; padding: 36px 16px; }

.container { max-width: 1200px; margin: 0 auto; }

.main-content { display: flex; flex-direction: column; gap: 28px; }

.papers-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px }
.paper-item { background: transparent }

.pagination-wrapper { 
  margin-top: 18px; 
  display:flex; 
  justify-content:center;

  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-button-bg-color: transparent; 
    --el-color-primary: var(--pf-accent);
    font-weight: 700;
    
    .el-pager li {
      background: transparent !important;
      border: 1px solid rgba(46,42,37,0.1);
      border-radius: 8px;
      margin: 0 3px;
      color: var(--pf-muted);
      transition: all 0.2s;
      
      &.is-active {
        background: var(--pf-accent) !important;
        color: #fff;
        border-color: var(--pf-accent);
        box-shadow: 0 4px 12px rgba(184,137,58,0.3);
      }
      
      &:hover:not(.is-active) {
        color: var(--pf-accent);
        border-color: var(--pf-accent);
      }
    }
    
    button {
      background: transparent !important;
      border: 1px solid rgba(46,42,37,0.1);
      border-radius: 8px;
      color: var(--pf-muted);
      
      &:hover:not(:disabled) {
        color: var(--pf-accent);
        border-color: var(--pf-accent);
      }
    }
  }
}
</style>

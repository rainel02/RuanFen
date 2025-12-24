<template>
  <div class="home-page">
    <AppHeader />
    
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">探索学术前沿，连接智慧火花</h1>
        <p class="hero-subtitle">汇聚全球顶尖科研成果，助您洞察学术趋势</p>
        <div class="search-box-wrapper glass-panel">
          <el-input
            v-model="searchQuery"
            placeholder="搜索论文标题、作者、关键词..."
            class="hero-search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="container">
        <el-row :gutter="24">
          <el-col :lg="6" :md="8" :sm="24" :xs="24">
            <div class="sidebar-wrapper glass-panel">
              <FilterSidebar />
            </div>
          </el-col>

          <el-col :lg="18" :md="16" :sm="24" :xs="24">
            <div class="main-content">
              <!-- Recommendation Section -->
              <div v-if="showPaperGuide && !searchQuery" class="recommendation-section glass-panel">
                <div class="section-header">
                  <h3><el-icon><StarFilled /></el-icon> 为您推荐</h3>
                  <el-button link @click="router.push('/paper-guide')">
                    查看更多 <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </div>
                <div class="rec-grid">
                  <div
                    v-for="paper in recommendedPapers"
                    :key="`rec-${paper.id}`"
                    class="rec-card"
                    @click="router.push(`/paper/${paper.id}`)"
                  >
                    <div class="rec-tag">{{ paper.recommendationReason }}</div>
                    <h4 class="rec-title">{{ paper.title }}</h4>
                    <div class="rec-meta">
                      <span>{{ paper.authors[0]?.name }}</span>
                      <span class="dot">·</span>
                      <span>{{ paper.year }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Results Header -->
              <div class="results-header glass-panel">
                <div class="left">
                  <span class="count">共找到 {{ filteredPapers.length }} 篇论文</span>
                  <el-tag v-if="searchQuery" closable @close="clearSearch">{{ searchQuery }}</el-tag>
                </div>
                <div class="right">
                  <el-radio-group v-model="sortBy" size="small">
                    <el-radio-button label="relevance">相关度</el-radio-button>
                    <el-radio-button label="date">最新</el-radio-button>
                    <el-radio-button label="citations">引用</el-radio-button>
                  </el-radio-group>
                </div>
              </div>

              <!-- Papers List -->
              <div v-loading="loading" class="papers-list">
                <transition-group name="list">
                  <div
                    v-for="paper in paginatedPapers"
                    :key="paper.id"
                    class="paper-item-wrapper"
                  >
                    <PaperCard :paper="paper" />
                  </div>
                </transition-group>
              </div>

              <div v-if="paginatedPapers.length === 0 && !loading" class="empty-state glass-panel">
                <el-empty description="没有找到相关论文，换个关键词试试？" />
              </div>

              <div v-if="totalPages > 1" class="pagination-wrapper glass-panel">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="filteredPapers.length"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import FilterSidebar from '@/components/FilterSidebar.vue'
import PaperCard from '@/components/PaperCard.vue'
import { usePapersStore } from '@/stores/papers'
import { Search, StarFilled, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const papersStore = usePapersStore()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const sortBy = ref('relevance')
const showPaperGuide = ref(true)

const loading = computed(() => papersStore.loading)
const filteredPapers = computed(() => papersStore.filteredPapers)
const recommendedPapers = computed(() => papersStore.papers.slice(0, 3).map(p => ({
  ...p,
  year: new Date(p.publishDate).getFullYear(),
  recommendationReason: '基于您的浏览历史'
})))

const paginatedPapers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPapers.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredPapers.value.length / pageSize.value))

const handleSearch = () => {
  papersStore.searchPapers(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  papersStore.searchPapers('')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  window.scrollTo({ top: 400, behavior: 'smooth' })
}

watch(() => route.query.q, (newQ) => {
  if (newQ) {
    searchQuery.value = newQ as string
    papersStore.searchPapers(newQ as string)
  }
}, { immediate: true })

onMounted(() => {
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.hero-section {
  height: 400px;
  background: linear-gradient(135deg, #1c2434 0%, #2c3e50 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    opacity: 0.2;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
    max-width: 800px;
    padding: 0 20px;

    .hero-title {
      font-size: 42px;
      color: #fff;
      margin-bottom: 15px;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .hero-subtitle {
      font-size: 18px;
      color: rgba(255,255,255,0.8);
      margin-bottom: 40px;
    }

    .search-box-wrapper {
      padding: 10px;
      border-radius: 12px;
      
      .hero-search-input {
        :deep(.el-input__wrapper) {
          background: #fff;
          box-shadow: none;
          padding: 8px 15px;
          font-size: 16px;
        }
        :deep(.el-input-group__append) {
          background-color: #409eff;
          color: white;
          border: none;
          font-weight: 600;
          &:hover { background-color: #66b1ff; }
        }
      }
    }
  }
}

.page-content {
  margin-top: -60px;
  padding-bottom: 40px;
  position: relative;
  z-index: 2;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.sidebar-wrapper {
  padding: 20px;
  height: fit-content;
  margin-bottom: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommendation-section {
  padding: 20px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    h3 { margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px; color: #303133; }
  }

  .rec-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;

    .rec-card {
      background: #f5f7fa;
      padding: 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid transparent;

      &:hover {
        background: #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border-color: #409eff;
        transform: translateY(-2px);
      }

      .rec-tag {
        font-size: 12px;
        color: #e6a23c;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .rec-title {
        margin: 0 0 10px 0;
        font-size: 14px;
        line-height: 1.4;
        color: #303133;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 40px;
      }

      .rec-meta {
        font-size: 12px;
        color: #909399;
        .dot { margin: 0 4px; }
      }
    }
  }
}

.results-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left {
    display: flex;
    align-items: center;
    gap: 15px;
    .count { color: #606266; font-size: 14px; }
  }
}

.papers-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.paper-item-wrapper {
  transition: all 0.3s ease;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.pagination-wrapper {
  padding: 15px;
  display: flex;
  justify-content: center;
}

/* Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .rec-grid {
    grid-template-columns: 1fr !important;
  }
  .hero-section {
    height: 300px;
    .hero-title { font-size: 28px; }
  }
}
</style>

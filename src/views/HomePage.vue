<template>
  <div class="home-page">
    <AppHeader />
<!--    <div>正常渲染</div>-->
    <div class="page-content">
      <div class="container">
        <div class="main-content">
          <div class="swiss-search-section">
            <div class="search-wrapper">
              <el-input
                v-model="searchQueryLocal"
                placeholder="Search for papers..."
                class="swiss-input-lg"
                clearable
                @keyup.enter="onSearch"
              >
                <template #prefix>
                  <el-icon class="search-icon"><Search /></el-icon>
                </template>
                <template #append>
                  <el-button class="swiss-search-btn" @click="onSearch">
                    Search
                  </el-button>
                </template>
              </el-input>
            </div>

            <div class="advanced-toggle-wrapper">
              <el-collapse v-model="advancedActive" class="swiss-collapse">
                <el-collapse-item name="1">
                  <template #title>
                    <div class="toggle-label">
                      <el-icon><Operation /></el-icon>
                      <span>高级搜索</span>
                      <el-icon class="arrow-icon" :class="{ 'is-active': advancedActive.includes('1') }"><ArrowDown /></el-icon>
                    </div>
                  </template>
                  
                  <div class="swiss-advanced-panel">
                    <div class="filter-grid">
                      <div class="filter-item">
                        <label>Author</label>
                        <el-input v-model="author" placeholder="e.g. Hinton" />
                      </div>
                      <div class="filter-item">
                        <label>Organization</label>
                        <el-input v-model="organization" placeholder="e.g. Google" />
                      </div>
                      <div class="filter-item">
                        <label>Date Range</label>
                        <el-date-picker 
                          v-model="timeRangeLocal" 
                          type="daterange" 
                          range-separator="-"
                          start-placeholder="Start" 
                          end-placeholder="End"
                          style="width: 100%"
                        />
                      </div>
                      <div class="filter-item">
                        <label>Field</label>
                        <el-select v-model="fieldLocal" placeholder="Select Field" clearable>
                          <el-option v-for="f in fields" :key="f" :label="f" :value="f" />
                        </el-select>
                      </div>
                      <div class="filter-item">
                        <label>Sort By</label>
                        <el-select v-model="sortLocal" placeholder="Relevance" clearable>
                          <el-option label="Citations" value="citations" />
                          <el-option label="Date" value="time" />
                        </el-select>
                      </div>
                      <div class="filter-actions">
                        <el-button class="btn-reset" @click="onClearAdvanced">Reset</el-button>
                        <el-button type="primary" class="btn-apply" @click="applyAdvanced">Apply Filters</el-button>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
          <!-- 论文收藏区域 -->
          <div v-if="showPaperGuide && !searchQuery" class="paper-guide-section">
            <router-link to="/collections" class="guide-link-wrapper">
              <VantaBanner>
                <div class="guide-banner-content">
                  <div class="guide-title">我的收藏</div>
                  <div class="guide-arrow-wrapper">
                    <div class="obtuse-arrow arrow-1"></div>
                    <div class="obtuse-arrow arrow-2"></div>
                    <div class="obtuse-arrow arrow-3"></div>
                  </div>
                </div>
              </VantaBanner>
            </router-link>
            <!-- <el-card class="guide-card">
              <template #header>
                <div class="guide-header">
                  <h4>
                    <el-icon><Star /></el-icon>
                    个性化推荐
                  </h4>
                  <router-link to="/paper-guide" class="view-all-link">
                    查看全部 <el-icon><ArrowRight /></el-icon>
                  </router-link>
                </div>
              </template>

              <div class="recommended-papers">
                <el-carousel height="120px">
                  <el-carousel-item v-for="paper in recommendedPapers" :key="paper.id">
                    <div class="recommended-paper">
                      <div class="paper-info">
                        <h5 class="paper-title">
                          <router-link :to="`/paper/${paper.id}`">{{ paper.title }}</router-link>
                        </h5>
                        <p class="paper-meta">
                          {{ paper.authorships.slice(0, 2).map((a: any) => a.name).join(', ') }} - {{ paper.publication }}
                        </p>
                      </div>
                    </div>
                  </el-carousel-item>
                </el-carousel>
              </div>
            </el-card> -->
          </div>

          <div class="content-header">
            <div class="results-info">
              <span class="results-count">
                找到 {{ papersStoreTotal }} 篇相关论文
              </span>
              <span v-if="searchQuery" class="search-query">
                "{{ searchQuery }}"
              </span>
            </div>
          </div>

          <div v-loading="loading" class="papers-grid">
            <template v-if="loading">
              <div
                v-for="n in (pageSize || 12)"
                :key="`skeleton-${n}`"
                class="paper-item"
              >
                <div class="skeleton-card">
                  <el-skeleton :rows="6" animated />
                </div>
              </div>
            </template>
            <template v-else>
              <div
                v-for="paper in paginatedPapers"
                :key="paper.id"
                class="paper-item"
              >
                <PaperCard :paper="paper" />
              </div>
            </template>
          </div>

          <div v-if="paginatedPapers.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无符合条件的论文" />
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
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import PaperCard from '../components/PaperCard.vue'
import VantaBanner from '../components/VantaBanner.vue'
import { usePapersStore } from '../stores/papers'
import { useSettingsStore } from '../stores/settings'

const papersStore = usePapersStore()
const settingsStore = useSettingsStore()

const loading = computed(() => papersStore.loading)
const paginatedPapers = computed(() => papersStore.paginatedPapers)
const filteredPapers = computed(() => papersStore.filteredPapers)
const searchQuery = computed(() => papersStore.searchQuery)
const currentPage = computed({
  get: () => papersStore.currentPage,
  set: (value) => { papersStore.currentPage = value }
})
const pageSize = computed({
  get: () => papersStore.pageSize,
  set: (value) => { papersStore.pageSize = value }
})
const totalPages = computed(() => papersStore.totalPages)
const papersStoreTotal = computed(() => (papersStore.total ?? filteredPapers.value.length))

// 显示论文导读功能
const showPaperGuide = computed(() => settingsStore.settings.enablePaperGuide)

// // 推荐论文（简化版）
// const recommendedPapers = computed(() => {
//   return filteredPapers.value.slice(0, 3).map(paper => ({
//     ...paper,
//     recommendationReason: '基于兴趣推荐'
//   }))
// })

const handleSizeChange = (size: number) => {
  papersStore.pageSize = size
  papersStore.currentPage = 1
}

const handleCurrentChange = (page: number) => {
  papersStore.currentPage = page
}

// local search & advanced
const searchQueryLocal = ref(searchQuery.value)
const advancedActive = ref<string[]>([])
const author = ref('')
const organization = ref('')
const timeRangeLocal = ref([] as any[])
const fieldLocal = ref('')
const sortLocal = ref('')
const fields = [
  '人工智能', '机器学习', '计算机视觉', '自然语言处理', '数据挖掘'
]

const onSearch = async () => {
  await papersStore.searchPapers(searchQueryLocal.value)
}

const applyAdvanced = async () => {
  await papersStore.setFilters({
    fields: fieldLocal.value ? [fieldLocal.value] : [],
    sortBy: sortLocal.value || 'latest',
    author: author.value
  })
}

const onClearAdvanced = async () => {
  author.value = ''
  organization.value = ''
  timeRangeLocal.value = []
  fieldLocal.value = ''
  sortLocal.value = ''
  await papersStore.setFilters({ fields: [], sortBy: 'latest' })
}

onMounted(() => {
  // initial load
  papersStore.fetchPapers()
})


</script>

<style scoped lang="scss">
@mixin mobile { @media (max-width: 767px) { @content; } }
@mixin tablet { @media (min-width: 768px) and (max-width: 1199px) { @content; } }
@mixin desktop { @media (min-width: 1200px) { @content; } }

.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.page-content {
  flex: 1;
  padding: var(--space-xl) 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* --- Swiss Search Section --- */
.swiss-search-section {
  margin-bottom: var(--space-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.search-wrapper {
  width: 100%;
  position: relative;
  margin-bottom: var(--space-md);
}

/* Customizing the large search input */
:deep(.swiss-input-lg) {
  .el-input__wrapper {
    background: var(--surface) !important;
    border: 1px solid var(--border-subtle) !important;
    box-shadow: var(--shadow-md) !important;
    border-radius: var(--radius-full) !important; /* Pill shape */
    padding: 8px 24px !important;
    height: 64px;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--border-light) !important;
      background: var(--surface-hover) !important;
      transform: translateY(-1px);
    }

    &.is-focus {
      border-color: var(--primary) !important;
      box-shadow: var(--shadow-lg), 0 0 0 1px var(--primary-dim) !important;
      background: var(--surface-active) !important;
    }
  }

  .el-input__inner {
    font-size: 18px;
    font-weight: 500;
    color: var(--text-primary);
    height: 100%;
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  .search-icon {
    font-size: 20px;
    color: var(--text-tertiary);
    margin-right: 8px;
  }
}

.swiss-search-btn {
  border-radius: var(--radius-full) !important;
  padding: 0 24px !important;
  height: 48px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  margin-left: 8px;
  background: var(--primary) !important;
  border: none !important;
  color: #fff !important;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 63, 129, 0.4);
  }
}

/* --- Advanced Toggle & Panel --- */
.advanced-toggle-wrapper {
  width: 100%;
}

.swiss-collapse {
  border: none;
  background: transparent;
  
  :deep(.el-collapse-item__header) {
    background: transparent;
    border: none;
    height: auto;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
    
    &:hover {
      color: var(--primary);
    }

    .el-collapse-item__arrow {
      display: none; /* Hide default arrow */
    }
  }
  
  :deep(.el-collapse-item__wrap) {
    background: transparent;
    border: none;
  }
  
  :deep(.el-collapse-item__content) {
    padding-bottom: 0;
    color: var(--text-secondary);
  }
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .arrow-icon {
    font-size: 12px;
    margin-left: 4px;
    transition: transform 0.3s;
    
    &.is-active {
      transform: rotate(180deg);
    }
  }
}

.swiss-advanced-panel {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-top: var(--space-md);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  
  @include mobile {
    grid-template-columns: 1fr;
  }
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    font-weight: 600;
  }
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-subtle);
}

.btn-reset {
  color: var(--text-secondary) !important;
  &:hover { color: var(--text-primary) !important; }
}

.btn-apply {
  min-width: 120px;
}

/* --- Results Info --- */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding: 0 var(--space-sm);
}

.results-info {
  font-size: 14px;
  color: var(--text-secondary);
  
  .search-query {
    color: var(--primary);
    font-weight: 600;
  }
}

/* --- Grid & Cards --- */
.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-lg);
}

.paper-item {
  height: 100%;
}

/* --- Empty State --- */
.empty-state {
  padding: var(--space-xl) 0;
  
  :deep(.el-empty__description) {
    color: var(--text-tertiary);
  }
}

/* --- Pagination --- */
.pagination-wrapper {
  margin-top: var(--space-xl);
  display: flex;
  justify-content: center;
}

/* --- Paper Guide (Collections) --- */
.paper-guide-section {
  margin-bottom: var(--space-lg);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: var(--border-light);
  }

  /* Center content vertically in the banner */
  :deep(.vanta-banner) {
    display: flex !important;
    align-items: center !important;
  }
  
  :deep(.vanta-content) {
    width: 100%;
  }
}

.guide-banner-content {
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guide-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.guide-arrow-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px; /* Increased spacing */
}

.obtuse-arrow {
  width: 12px;
  height: 12px;
  border-top: 3px solid #fff;
  border-right: 3px solid #fff;
  /* Positive skew makes the angle obtuse (>90deg) */
  transform: rotate(45deg) skew(10deg, 10deg);
  transform-origin: center;
  animation: arrow-wave 1.5s infinite ease-in-out;
}

.arrow-1 {
  opacity: 0.3;
  animation-delay: 0s;
}

.arrow-2 {
  opacity: 0.6;
  animation-delay: 0.2s;
}

.arrow-3 {
  opacity: 1;
  animation-delay: 0.4s;
}

@keyframes arrow-wave {
  0%, 100% {
    transform: rotate(45deg) skew(10deg, 10deg) translate(0, 0);
  }
  50% {
    /* Move diagonally to follow the arrow direction */
    transform: rotate(45deg) skew(10deg, 10deg) translate(4px, -4px);
  }
}
</style>

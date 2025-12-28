<template>
  <div class="home-page" ref="homePageRef">
    <AppHeader />
<!--    <div>正常渲染</div>-->
    <div class="page-content">
      <div class="container">
        <div class="main-content">
          <div class="swiss-search-section">
            <div class="search-controls">
              <div class="controls-groups">
                <div class="segmented mode-toggle" role="tablist" aria-label="资源类型">
                  <el-button :class="{ active: searchMode === 'paper' }" @click="searchMode = 'paper'">
                    <el-icon><Document /></el-icon> 论文
                  </el-button>
                  <el-button :class="{ active: searchMode === 'patent' }" @click="searchMode = 'patent'">
                    <el-icon><Reading /></el-icon> 专利
                  </el-button>
                </div>

                <div class="segmented search-mode" role="tablist" aria-label="搜索模式">
                  <el-button :class="{ active: !isAdvanced }" @click="isAdvanced = false">普通搜索</el-button>
                  <el-button :class="{ active: isAdvanced }" @click="isAdvanced = true">高级搜索</el-button>
                </div>
              </div>

              <div class="search-wrapper">
                <template v-if="!isAdvanced">
                  <div
                    class="premium-search-bar"
                    :class="{ 'is-focused': isInputFocused }"
                  >
                    <el-icon class="search-icon-prefix"><Search /></el-icon>
                    <input
                      v-model="searchQueryLocal"
                      class="premium-input"
                      :placeholder="searchMode === 'paper' ? '搜索论文关键词...' : '搜索专利名称、申请人...'"
                      @focus="isInputFocused = true"
                      @blur="isInputFocused = false"
                      @keyup.enter="onSearch"
                    />
                    <button class="premium-search-btn" @click="onSearch" aria-label="搜索">
                      <span class="btn-text">搜索</span>
                      <el-icon class="btn-icon"><ArrowRight /></el-icon>
                    </button>
                  </div>
                </template>

                <template v-else>
                  <div class="swiss-advanced-panel">
                    <!-- Advanced for Paper -->
                    <div v-if="searchMode === 'paper'" class="filter-grid">
                      <div class="filter-item">
                        <label>关键词</label>
                        <el-input v-model="searchQueryLocal" placeholder="任意关键词" clearable />
                      </div>
                      <div class="filter-item">
                        <label>作者</label>
                        <el-input v-model="author" placeholder="作者名" clearable />
                      </div>
                      <div class="filter-item">
                        <label>机构</label>
                        <el-input v-model="organization" placeholder="机构名称" clearable />
                      </div>

                      <div class="filter-item">
                        <label>领域</label>
                        <el-cascader
                          v-model="fieldLocal"
                          :options="fieldOptions"
                          :props="{ checkStrictly: true, emitPath: false }"
                          placeholder="选择领域"
                          clearable
                          popper-class="swiss-cascader-popper"
                        />
                      </div>

                      <div class="filter-item">
                        <label>开始时间</label>
                        <el-date-picker v-model="startDateLocal" type="date" placeholder="开始日期" clearable />
                      </div>

                      <div class="filter-item">
                        <label>截止时间</label>
                        <el-date-picker v-model="endDateLocal" type="date" placeholder="截止日期" clearable />
                      </div>

                      <div class="filter-actions">
                        <el-button class="btn-reset" @click="onClearAdvanced">重置</el-button>
                        <el-button type="primary" class="btn-apply" @click="onSearch">搜索</el-button>
                      </div>
                    </div>

                    <!-- Advanced for Patent -->
                    <div v-else class="filter-grid">
                      <div class="filter-item">
                        <label>关键词</label>
                        <el-input v-model="searchQueryLocal" placeholder="专利名称/摘要/申请人" clearable />
                      </div>

                      <div class="filter-item">
                        <label>申请年份</label>
                        <el-input-number v-model="applicationYearLocal" :min="1800" :max="new Date().getFullYear()" controls-position="right" style="width:100%" />
                      </div>

                      <div class="filter-item">
                        <label>授权年份</label>
                        <el-input-number v-model="grantYearLocal" :min="1800" :max="new Date().getFullYear()" controls-position="right" style="width:100%" />
                      </div>

                      <div class="filter-actions">
                        <el-button class="btn-reset" @click="onClearAdvanced">重置</el-button>
                        <el-button type="primary" class="btn-apply" @click="onSearch">搜索</el-button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <!-- 论文收藏区域 -->
          <!-- <div v-if="showPaperGuide && !searchQuery" class="paper-guide-section">
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
            <el-card class="guide-card">
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
            </el-card>
          </div> -->

          <div class="content-header">
            <div class="results-info">
              <span class="results-count">
                找到 {{ totalDisplay }} 篇相关{{ searchMode === 'paper' ? '论文' : '专利' }}
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
              <template v-if="searchMode === 'paper'">
                <div
                  v-for="paper in paginatedPapers"
                  :key="paper.id"
                  class="paper-item"
                >
                  <PaperCard :paper="paper" />
                </div>
              </template>
              <template v-else>
                <div
                  v-for="patent in paginatedPatents"
                  :key="patent.id"
                  class="paper-item"
                >
                  <PatentCard :patent="patent" />
                </div>
              </template>
            </template>
          </div>

          <div v-if="(searchMode === 'paper' ? paginatedPapers.length : paginatedPatents.length) === 0 && !loading" class="empty-state">
            <el-empty :description="`暂无符合条件的${searchMode === 'paper' ? '论文' : '专利'}`" />
          </div>

          <div v-if="totalPages > 1" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="searchMode === 'paper' ? papersStoreTotal : patentsStoreTotal"
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
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Search, ArrowRight, Document, Reading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import PaperCard from '../components/PaperCard.vue'
import PatentCard from '../components/PatentCard.vue'
import { usePapersStore } from '../stores/papers'
import { usePatentsStore } from '../stores/patents'
// import { useSettingsStore } from '../stores/settings'
import { fieldOptions } from '../constants/fields'

const papersStore = usePapersStore()
const patentsStore = usePatentsStore()
// const settingsStore = useSettingsStore()

const homePageRef = ref<HTMLElement | null>(null)
let vantaEffect: any = null

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load ' + src))
    document.head.appendChild(s)
  })
}

// Search Mode
const searchMode = ref<'paper' | 'patent'>('paper')

// Unified Computed Properties
const loading = computed(() => searchMode.value === 'paper' ? papersStore.loading : patentsStore.loading)

// Paper specific
const paginatedPapers = computed(() => papersStore.paginatedPapers)
const filteredPapers = computed(() => papersStore.filteredPapers)
const papersStoreTotal = computed(() => (papersStore.total ?? filteredPapers.value.length))

// Patent specific
const paginatedPatents = computed(() => patentsStore.paginatedPatents)
const patentsStoreTotal = computed(() => patentsStore.total)

// Unified Pagination & Search Query
const searchQuery = computed(() => searchMode.value === 'paper' ? papersStore.searchQuery : patentsStore.searchQuery)

const currentPage = computed({
  get: () => searchMode.value === 'paper' ? papersStore.currentPage : patentsStore.currentPage,
  set: (value) => { 
    if (searchMode.value === 'paper') papersStore.currentPage = value
    else patentsStore.currentPage = value
  }
})

const pageSize = computed({
  get: () => searchMode.value === 'paper' ? papersStore.pageSize : patentsStore.pageSize,
  set: (value) => { 
    if (searchMode.value === 'paper') papersStore.pageSize = value
    else patentsStore.pageSize = value
  }
})

const totalPages = computed(() => searchMode.value === 'paper' ? papersStore.totalPages : patentsStore.totalPages)

const totalDisplay = computed(() => {
  const t = searchMode.value === 'paper' ? papersStoreTotal.value : patentsStoreTotal.value
  return (searchMode.value === 'paper' && t === 10000) ? '10000+' : t
})

const handleSizeChange = async (size: number) => {
  if (searchMode.value === 'paper') {
    papersStore.skipNextFetchOnPageChange = true
    papersStore.pageSize = size
    papersStore.currentPage = 1
    await papersStore.fetchPapers()
  } else {
    patentsStore.pageSize = size
    patentsStore.currentPage = 1
    await patentsStore.fetchPatents()
  }
}

const handleCurrentChange = async (page: number) => {
  if (searchMode.value === 'paper') {
    papersStore.skipNextFetchOnPageChange = true
    papersStore.currentPage = page
    await papersStore.fetchPapers()
  } else {
    patentsStore.currentPage = page
    await patentsStore.fetchPatents()
  }
}

// local search & advanced
const isAdvanced = ref(false)
const searchQueryLocal = ref('')
const author = ref('')
const organization = ref('')
const startDateLocal = ref('')
const endDateLocal = ref('')
const fieldLocal = ref('')
const isInputFocused = ref(false)
const applicantLocal = ref('')
const inventorLocal = ref('')
const applicationYearLocal = ref<number | null>(null)
const grantYearLocal = ref<number | null>(null)

// Watch search mode to reset local query or sync it
watch(searchMode, (newMode) => {
  searchQueryLocal.value = newMode === 'paper' ? papersStore.searchQuery : patentsStore.searchQuery
})

// unified search handler for basic and advanced modes
const onSearch = async () => {
  // Common date validation
  const parseDate = (d: any) => {
    if (!d) return null
    const dt = typeof d === 'string' ? new Date(d) : new Date(d)
    return Number.isNaN(dt.getTime()) ? null : dt
  }

  const sDate = parseDate(startDateLocal.value)
  const eDate = parseDate(endDateLocal.value)
  
  if (sDate && !eDate) {
    ElMessage({ message: '请填写截止时间', type: 'error', customClass: 'pf-message-parchment', duration: 4000 })
    return
  }
  if (!sDate && eDate) {
    ElMessage({ message: '请填写开始时间', type: 'error', customClass: 'pf-message-parchment', duration: 4000 })
    return
  }
  if (sDate && eDate && sDate.getTime() > eDate.getTime()) {
    ElMessage({ message: '请修改查询条件，保证开始时间早于截止时间', type: 'error', customClass: 'pf-message-parchment', duration: 4000 })
    return
  }

  const formatDate = (d: any) => {
    if (!d) return ''
    if (typeof d === 'string') return d
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return ''
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  if (searchMode.value === 'paper') {
    papersStore.pageSize = 12
    papersStore.currentPage = 1
    await papersStore.setFilters({
      q: searchQueryLocal.value || '',
      author: author.value || '',
      institution: organization.value || '',
      fields: fieldLocal.value ? [fieldLocal.value] : [],
      startDate: formatDate(startDateLocal.value),
      endDate: formatDate(endDateLocal.value)
    })
    } else {
    // Patent Search
    patentsStore.pageSize = 12
    patentsStore.currentPage = 1
    await patentsStore.setFilters({
      q: searchQueryLocal.value || '',
      applicationYear: applicationYearLocal.value ?? undefined,
      grantYear: grantYearLocal.value ?? undefined
    })
  }
}

const onClearAdvanced = async () => {
  author.value = ''
  organization.value = ''
  startDateLocal.value = ''
  endDateLocal.value = ''
  fieldLocal.value = ''
  searchQueryLocal.value = ''
  applicantLocal.value = ''
  inventorLocal.value = ''
  applicationYearLocal.value = null
  grantYearLocal.value = null
  
  if (searchMode.value === 'paper') {
    papersStore.pageSize = 12
    papersStore.currentPage = 1
    await papersStore.setFilters({
      q: '',
      author: '',
      institution: '',
      fields: [],
      startDate: '',
      endDate: ''
    })
  }
}

onMounted(async () => {
  // initial load
  if (searchMode.value === 'paper') {
    papersStore.fetchPapers()
  } else {
    patentsStore.fetchPatents()
  }

  // Vanta Init
  try {
    if (!(window as any).THREE) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js')
    }
    await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js')

    if ((window as any).VANTA && homePageRef.value) {
      vantaEffect = (window as any).VANTA.NET({
        el: homePageRef.value,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xb8893a,       // Retro Gold/Accent
        backgroundColor: 0xf7efe2, // Parchment
        points: 10.00,
        maxDistance: 20.00,
        spacing: 14.00,
        showDots: true
      })
    }
  } catch (e) {
    console.error('Failed to init Vanta', e)
  }
})

onBeforeUnmount(() => {
  if (vantaEffect) vantaEffect.destroy()
})


</script>

<style scoped lang="scss">
@mixin mobile { @media (max-width: 767px) { @content; } }
@mixin tablet { @media (min-width: 768px) and (max-width: 1199px) { @content; } }

.home-page {
  // parchment / beige theme scoped to this page
  --pf-bg: #f7efe2;
  --pf-ink: #2e2a25;
  --pf-muted: #7a6f63;
  --pf-accent: #b8893a; // subtle gold
  --pf-brown: #8B4513; // Match login button
  --pf-brown-dark: #654321; // Match login button border
  --card-bg: rgba(251, 246, 236, 0.85); // #fbf6ec with opacity
  font-family: "Noto Serif", Georgia, "Times New Roman", serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--pf-bg); /* Fallback */
  color: var(--pf-ink);
  position: relative;
  overflow: hidden; /* Ensure no scrollbars from canvas */
}

.home-page > * {
  position: relative;
  z-index: 1;
}

.home-page :deep(canvas) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0 !important;
  pointer-events: none;
}

.page-content { flex: 1; padding: 36px 16px; }

.container { max-width: 1200px; margin: 0 auto; }

.main-content { display: flex; flex-direction: column; gap: 28px; }

/* Search area */
.swiss-search-section { padding: 18px; border-radius: 12px; background: var(--card-bg); box-shadow: 0 6px 24px rgba(46,42,37,0.06); }

.search-controls { display:flex; gap:18px; align-items:center; flex-direction:row; flex-wrap:wrap; justify-content:space-between }
.controls-groups { display:flex; gap:12px; align-items:center; background: rgba(255,252,245,0.6); padding:6px; border-radius:14px; box-shadow: 0 6px 18px rgba(46,42,37,0.03); }
.segmented { display:flex; gap:8px; align-items:center }

/* Emphasize resource type (论文/专利) over search-mode */
.mode-toggle :deep(.el-button) {
  min-width: 140px;
  padding: 12px 20px;
  font-size: 16px;
  box-shadow: 0 8px 26px rgba(139,69,19,0.14);
  border-radius: 999px;
}

.search-mode {
  background: transparent;
  padding: 2px 6px;
  border-radius: 999px;
}
.search-mode :deep(.el-button) {
  min-width: 96px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 700;
  background: transparent;
  color: var(--pf-muted);
  border: 1px solid rgba(46,42,37,0.06);
  border-radius: 999px;
  box-shadow: none;
}

.search-mode :deep(.el-button.active) {
  background: rgba(46,42,37,0.03);
  color: var(--pf-ink);
  border-color: rgba(46,42,37,0.08);
}
.segmented :deep(.el-button) {
  background: #fbf6ec;
  color: var(--pf-ink);
  border: 1px solid rgba(184, 137, 58, 0.2);
  padding: 10px 16px;
  border-radius: 999px;
  font-weight:700;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(46,42,37,0.03);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.segmented :deep(.el-button):hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(139, 69, 19, 0.15) }
.segmented :deep(.el-button):focus-visible { outline: 3px solid rgba(139, 69, 19, 0.14); outline-offset: 3px }
.segmented :deep(.el-button.active) {
  background: var(--pf-brown);
  color: #fff;
  border-color: var(--pf-brown-dark);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}
.segmented :deep(.el-button.active):hover { transform: translateY(-3px); background: var(--pf-brown-dark); }

.search-wrapper { width:100%; }

/* --- Premium Search Bar (Integrated) --- */
.premium-search-bar {
  display: flex;
  align-items: center;
  background: #fbf6ec; /* Matches card/parchment tone */
  border: 1px solid rgba(184, 137, 58, 0.2);
  border-radius: 16px; /* Smooth pill shape */
  padding: 6px;
  box-shadow:
    0 2px 8px rgba(46, 42, 37, 0.03),
    0 8px 24px rgba(46, 42, 37, 0.04); /* Soft ambient shadow */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 64px;
  box-sizing: border-box;
  position: relative;
}

.premium-search-bar.is-focused {
  border-color: var(--pf-accent);
  box-shadow:
    0 4px 12px rgba(184, 137, 58, 0.1),
    0 12px 32px rgba(184, 137, 58, 0.15);
  transform: translateY(-1px);
  background: #fffcf5; /* Slightly lighter on focus */
}

.search-icon-prefix {
  font-size: 20px;
  color: rgba(46, 42, 37, 0.4);
  margin-left: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.premium-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: "Noto Serif", serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--pf-ink);
  padding: 0;
  height: 100%;
  min-width: 0; /* Prevent flex overflow */
}

.premium-input::placeholder {
  color: rgba(46, 42, 37, 0.3);
  font-weight: 500;
}

.premium-search-btn {
  background: var(--pf-brown);
  color: #ffffff;
  border: 1px solid var(--pf-brown-dark);
  border-radius: 12px;
  height: 52px; /* Slightly smaller than container to fit inside */
  padding: 0 24px;
  font-family: "Noto Serif", serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
  flex-shrink: 0;
}

.premium-search-btn:hover {
  background: var(--pf-brown-dark); /* Slightly darker gold */
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(139, 69, 19, 0.3);
}

.premium-search-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
}

.premium-search-btn .btn-icon {
  font-size: 16px;
}

/* Mobile Adaptation */
@include mobile {
  .premium-search-bar {
    height: 56px;
    border-radius: 12px;
  }

  .premium-input {
    font-size: 16px;
  }

  .premium-search-btn {
    height: 44px;
    padding: 0 16px;
    border-radius: 8px;
  }

  .premium-search-btn .btn-text {
    display: none; /* Icon only on mobile */
  }

  .search-icon-prefix {
    margin-left: 12px;
    margin-right: 8px;
    font-size: 18px;
  }
}

.swiss-advanced-panel {
  border-radius:10px;
  padding:18px;
  background: #fbf6ec;
  border:1px solid rgba(184, 137, 58, 0.2);
  box-shadow: 0 6px 24px rgba(46,42,37,0.05);
}

.filter-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; align-items:start }
@include mobile { .filter-grid { grid-template-columns: 1fr } }

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  grid-column: 1 / -1; /* full width */
}

.filter-item { padding: 6px; }

.filter-item label { font-size:12px; color:var(--pf-muted); font-weight:700; margin-bottom:6px; text-transform:uppercase }
.filter-item :deep(.el-input__inner), .filter-item :deep(.el-select), .filter-item :deep(.el-date-editor__editor) { background: transparent }

/* --- Unified Input Styles (Select & Date Picker) --- */
/* Force both containers to full width */
.filter-item :deep(.el-select),
.filter-item :deep(.el-cascader),
.filter-item :deep(.el-date-editor) {
  width: 100% !important;
}

/* Unified Wrapper Styles: The visible box */
.filter-item :deep(.el-input__wrapper) {
  box-sizing: border-box !important;
  height: 48px !important;
  padding: 6px 12px !important;
  border-radius: 10px !important;
  border: 1px solid rgba(46,42,37,0.06) !important;
  background: #ffffff !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
  transition: all 0.2s ease;
}

/* Unified Hover Effects */
.filter-item :deep(.el-input__wrapper:hover) {
  background: rgba(255,252,245,1) !important;
  border-color: rgba(184,137,58,0.3) !important;
}

/* Unified Focus Effects */
.filter-item :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(184,137,58,0.1) !important;
  border-color: var(--pf-accent) !important;
}

/* Unified Inner Text Styles */
.filter-item :deep(.el-input__inner) {
  height: 100% !important;
  line-height: 48px !important; /* match select line-height */
  font-weight: 600 !important;
  color: var(--pf-ink) !important;
  font-size: 14px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  font-family: inherit !important;
}

/* Unified Icon Styles */
.filter-item :deep(.el-input__prefix),
.filter-item :deep(.el-input__suffix) {
  display: flex !important;
  height: 100% !important;
  color: var(--pf-muted) !important;
  position: static !important;
}
.filter-item :deep(.el-input__prefix) { margin-right: 8px !important; }
.filter-item :deep(.el-input__suffix) { margin-left: 8px !important; }

/* Ensure suffix inner wrapper (Element Plus) aligns center */
.filter-item :deep(.el-input__suffix-inner) {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
}

/* remove append wrapper border/background from Element input group (avoid blue box) */
:deep(.el-input__group), :deep(.el-input__group__append), :deep(.el-input-group__append), :deep(.el-input__append), :deep(.el-input-group__append) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* ensure append area aligns center and doesn't change input height */
:deep(.el-input__group), :deep(.el-input__append), :deep(.el-input-group__append) {
  display: inline-flex !important;
  align-items: center !important;
  height: 100% !important;
}

/* ensure append area doesn't show focus ring */
:deep(.el-input-group__append) :deep(.el-button), :deep(.el-input__append) :deep(.el-button) {
  outline: none !important;
  box-shadow: none !important;
}

/* specifically target Element Plus append wrapper border (some versions use class .el-input-group__append with inner border) */
:deep(.el-input-group__append), :deep(.el-input__group__append) {
  border-left: none !important;
  border: none !important;
  background: transparent !important;
}

/* additionally remove any focus ring coming from input group or inner elements */
:deep(.el-input__wrapper.is-focus), :deep(.el-input__inner:focus), :deep(.el-input__inner:focus-visible), :deep(.el-input__group:focus-within) {
  outline: none !important;
  box-shadow: none !important;
  border-color: rgba(46,42,37,0.08) !important;
}

/* ensure el-button inside append has no default outline/shadow */
:deep(.el-input__append) :deep(.el-button), :deep(.el-input-group__append) :deep(.el-button) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

/* icon sizing */
.search-btn-icon { font-size: 20px; color: #fff; display:inline-block; transform: scale(1); transition: transform 0.12s ease }
.swiss-search-btn:hover .search-btn-icon { transform: scale(1.12) }

.filter-actions { grid-column: 1 / -1; display:flex; justify-content:flex-end; gap:12px; margin-top:6px }
.btn-reset { color: var(--pf-muted) }
.btn-apply {
  background: var(--pf-brown);
  border-color: var(--pf-brown-dark);
  color: #fff;
  font-family: "Noto Serif", serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 700;
}
.btn-apply:hover {
  background: var(--pf-brown-dark);
  border-color: var(--pf-brown-dark);
  color: #fff;
}

.content-header { display:flex; justify-content:space-between; align-items:center; padding: 0 4px }
.results-info { color:var(--pf-muted); font-size:14px }
.search-query { color:var(--pf-accent); font-weight:700 }

.papers-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px }
.paper-item { background: transparent }

.empty-state { padding: 40px 0 }
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

/* guide banner tweaks */
.paper-guide-section { border-radius:10px; overflow:hidden }

/* responsive adjustments */
@include mobile {
  .page-content { padding: 20px 12px }
  .search-controls { flex-direction: column; align-items: stretch; gap:12px }
  .segmented { justify-content: center }
  .mode-toggle { order: 0 }
  .search-mode { order: 1 }
  .swiss-search-btn { padding: 8px 12px !important }
}

</style>

<style lang="scss">
.swiss-cascader-popper {
  --el-color-primary: #b8893a;
  .el-cascader-node.in-active-path, .el-cascader-node.is-active {
    color: var(--el-color-primary);
    font-weight: 700;
  }
  .el-radio__input.is-checked .el-radio__inner {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary);
  }
  .el-radio__input.is-checked + .el-radio__label {
    color: var(--el-color-primary);
  }
}
</style>

<!-- 自定义全局消息样式（棕色羊皮纸 / 巴洛克复古风格） -->
<style lang="scss">
.pf-message-parchment.el-message, .pf-message-parchment {
  background: linear-gradient(180deg, #fbf6ec 0%, #f3e6cf 100%) !important; /* 羊皮纸渐变 */
  color: #5a3715 !important; /* 深棕文字 */
  border: 1px solid rgba(90,55,21,0.12) !important;
  box-shadow: 0 8px 30px rgba(90,55,21,0.12) !important;
  font-family: "Noto Serif", Georgia, "Times New Roman", serif !important;
  font-weight: 700 !important;
  border-left: 6px solid rgba(184,137,58,0.7) !important; /* 金色装饰条 */
  border-radius: 8px !important;
  padding: 12px 18px !important;
}

.pf-message-parchment .el-message__content {
  color: #5a3715 !important;
}

/* 强制让图标也变为棕色（兼容不同 Element Plus 版本） */
.pf-message-parchment svg, .pf-message-parchment .el-icon {
  color: #5a3715 !important;
  fill: #5a3715 !important;
  stroke: #5a3715 !important;
}

/* 支持较老结构：根节点本身使用自定义类 */
.pf-message-parchment {
  background: linear-gradient(180deg, #fbf6ec 0%, #f3e6cf 100%) !important;
  color: #5a3715 !important;
  border: 1px solid rgba(90,55,21,0.12) !important;
  box-shadow: 0 8px 30px rgba(90,55,21,0.12) !important;
  font-family: "Noto Serif", Georgia, "Times New Roman", serif !important;
  font-weight: 700 !important;
}
</style>

<template>
  <div class="paper-detail-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div v-if="paper" class="paper-detail">
          <div class="paper-header">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>论文详情</el-breadcrumb-item>
            </el-breadcrumb>

            <div class="paper-actions">
              <el-button
                :type="paper.isfavorited ? 'primary' : 'default'"
                :icon="Star"
                @click="toggleFavorite"
              >
                {{ paper.isfavorited ? '已收藏' : '收藏' }}
              </el-button>
              <!-- <el-button :icon="Share">分享</el-button> -->
              <!-- <el-button :icon="Download" v-if="paper.url">下载PDF</el-button> -->
              <el-button
                v-if="paper.url"
                @click.prevent="openExternal(paper.url)"
              >
                查看原文
              </el-button>
            </div>
          </div>

          <el-row :gutter="24">
            <el-col :lg="18" :md="24" :sm="24" :xs="24">
              <el-card class="main-content">
                <div class="paper-title-row">
                  <h1 class="paper-title">{{ paper.title }}</h1>
                </div>

                <div class="paper-meta">
                  <div class="publication-info">
                    <span class="meta-label">刊物：</span>
                    <span>{{ paper.publication }}</span>
                    <span class="meta-label" style="margin-left: 20px;">机构：</span>
                    <span>{{ paper.institution }}</span>
                  </div>

                  <div class="publication-info">
                    <span class="meta-label">发表日期：</span>
                    <span>{{ formatDate(paper.publication_date) }}</span>
                  </div>

                  <div class="doi" v-if="paper.doi">
                    <span class="meta-label">DOI：</span>
                    <a :href="`https://doi.org/${paper.doi}`" target="_blank">{{ paper.doi }}</a>
                  </div>
                </div>

                <div class="paper-fields">
                  <el-tag
                    v-for="field in paper.fields"
                    :key="field"
                    size="large"
                    effect="plain"
                  >
                    {{ field }}
                  </el-tag>
                </div>

                <div class="paper-abstract">
                  <h3>摘要</h3>
                  <p>{{ paper.abstract }}</p>
                </div>

                <div class="paper-keywords">
                  <h3>关键词</h3>
                  <div class="keywords-list">
                    <el-tag
                      v-for="keyword in paper.keyword"
                      :key="keyword"
                      effect="plain"
                      size="small"
                      style="padding-left: 5px; padding-right: 5px;"
                    >
                      {{ keyword }}
                    </el-tag>
                  </div>
                </div>
              </el-card>

              <!-- <el-card class="comments-section">
                <template #header>
                  <h3>评论与讨论</h3>
                </template>
                <el-empty description="暂无评论，来发表第一个评论吧！" />
              </el-card> -->
            </el-col>

            <el-col :lg="6" :md="24" :sm="24" :xs="24">
              <div class="sidebar">
                <el-card class="stats-card">
                  <template #header>
                    <h4>统计信息</h4>
                  </template>
                  <div class="stat-item">
                    <el-icon><Star /></el-icon>
                    <span class="stat-label">收藏数</span>
                    <span class="stat-value">{{ paper.favoriteCount }}</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Document /></el-icon>
                    <span class="stat-label">引用数</span>
                    <span class="stat-value">{{ paper.citationCount }}</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><View /></el-icon>
                    <span class="stat-label">浏览数</span>
                    <span class="stat-value">{{ paper.readCount }}</span>
                  </div>
                </el-card>

                <el-card class="authors-card">
                  <template #header>
                    <h4>作者信息</h4>
                  </template>
                    <div class="authors-list">
                      <div
                        v-for="(author, idx) in (paper.authorships || [])"
                        :key="authorKey(author, idx)"
                        class="author-item"
                      >
                        <el-avatar :size="40">{{ authorInitial(author) }}</el-avatar>
                        <div class="author-info">
                          <router-link v-if="author && author.id" :to="`/scholar/${author.id}`" class="author-name">
                            {{ authorLabel(author) }}
                          </router-link>
                          <span v-else class="author-name">{{ authorLabel(author) }}</span>
                          <p class="author-institution">{{ typeof author === 'string' ? '' : (author.institution || '') }}</p>
                        </div>
                      </div>
                    </div>
                </el-card>

                <el-card class="related-papers">
                  <template #header>
                    <h4>相关论文</h4>
                  </template>
                  <div class="related-list">
                    <div
                      v-for="relatedPaper in relatedPapers"
                      :key="relatedPaper.id"
                      class="related-item"
                    >
                      <router-link :to="`/paper/${relatedPaper.id}`" class="related-title">
                        {{ relatedPaper.title }}
                      </router-link>
                      <p class="related-authors">{{ (relatedPaper.authorships || []).map(a => authorLabel(a)).join(', ') }}</p>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-else class="loading-state">
          <el-skeleton :rows="10" animated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Paper } from '@/types/paper'
import { useRoute } from 'vue-router'
import { Star, Share, Download, Document, View } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import api from '@/api'
// import { usePapersStore } from '../stores/papers'

const route = useRoute()

const paper = ref<Paper | null>(null)
const relatedPapers = ref<Paper[]>([])



const authorKey = (author: any, idx: number) => {
  if (!author) return String(idx)
  if (typeof author === 'string') return `${author}-${idx}`
  return `${author.id ?? author.name ?? idx}-${idx}`
}

const authorLabel = (author: any) => (typeof author === 'string' ? author : (author?.name ?? ''))

const authorInitial = (author: any) => {
  const name = authorLabel(author)
  return name ? name.charAt(0) : '?'
}

const formatDate = (dateStringOrYear?: string | number) => {
  if (dateStringOrYear === undefined || dateStringOrYear === null) return ''
  if (typeof dateStringOrYear === 'number') return String(dateStringOrYear)
  const s = String(dateStringOrYear)
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) {
    const y = m[1]
    const mm = m[2].padStart(2, '0')
    const dd = m[3].padStart(2, '0')
    return `${y}-${mm}-${dd}`
  }
  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${mm}-${dd}`
  }
  return s
}

const toggleFavorite = async () => {
  if (!paper.value) return
  const id = paper.value.id
  if (!paper.value.isfavorited) {
    const res = await api.addToCollections(id).catch(() => null)
    if (res && (res.status === 201 || res.ok)) {
      paper.value.isfavorited = true
      paper.value.favoriteCount = (paper.value.favoriteCount || 0) + 1
    }
  } else {
    const res = await api.removeFromCollections(id).catch(() => null)
    if (res && (res.status === 204 || res.ok)) {
      paper.value.isfavorited = false
      paper.value.favoriteCount = Math.max(0, (paper.value.favoriteCount || 1) - 1)
    }
  }
}

const loadPaper = async (paperId: string) => {
  if (!paperId) return
  try {
    const data = await api.getAchievement(paperId)
    paper.value = data
    relatedPapers.value = data.relatedPapers || []
    // optional: scroll to top when navigating to another paper
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    console.error('load paper error', e)
  }
}

function openExternal(url?: string): void {
  if (!url) return
  try {
    window.open(url, '_blank')
  } catch (e) {
    const a = document.createElement('a')
    a.href = url as string
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.click()
  }
}

onMounted(async () => {
  await loadPaper(String(route.params.id))
})

// When route param changes (navigating to another paper via router-link), reload data
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadPaper(String(newId))
  }
})
</script>

<style scoped lang="scss">
@mixin mobile { @media (max-width: 767px) { @content; } }

.paper-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.page-content {
  flex: 1;
  padding: var(--space-xl) 0;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

/* Breadcrumb & Header */
.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-subtle);

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
}

:deep(.el-breadcrumb__inner) {
  color: var(--text-tertiary) !important;
  font-weight: 500;
  
  &.is-link:hover {
    color: var(--primary) !important;
  }
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--text-secondary) !important;
}

.paper-actions {
  display: flex;
  gap: var(--space-sm);
}

/* Main Content Card */
.main-content {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-lg);
  
  /* Override Element Plus Card styles if needed, but class is on el-card */
  :deep(.el-card__body) {
    padding: 0;
  }
}

.paper-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 var(--space-lg) 0;
}

.paper-meta {
  display: grid;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-subtle);
  
  .publication-info {
    font-size: 14px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .meta-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    font-weight: 600;
    margin-right: 4px;
  }
  
  a {
    color: var(--primary);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}

.paper-fields {
  margin-bottom: var(--space-lg);
  
  .el-tag {
    background: rgba(255, 255, 255, 0.03);
    border-color: var(--border-subtle);
    color: var(--text-secondary);
    margin-right: 8px;
    margin-bottom: 8px;
  }
}

.paper-abstract {
  margin-bottom: var(--space-xl);

  h3 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    margin-bottom: var(--space-md);
    font-weight: 600;
  }

  p {
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-secondary);
    text-align: justify;
  }
}

.paper-keywords {
  h3 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    margin-bottom: var(--space-md);
    font-weight: 600;
  }
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.stats-card, .authors-card, .related-papers {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  
  :deep(.el-card__header) {
    border-bottom: 1px solid var(--border-subtle);
    padding: var(--space-md) var(--space-lg);
    
    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  
  :deep(.el-card__body) {
    padding: var(--space-lg);
  }
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--text-secondary);
  
  &:last-child { margin-bottom: 0; }

  .stat-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  
  .stat-value {
    font-weight: 600;
    color: var(--text-primary);
  }
}

.author-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  &:last-child { margin-bottom: 0; }
  
  .el-avatar {
    background: var(--surface-hover);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
  }

  .author-info {
    display: flex;
    flex-direction: column;
    
    .author-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      transition: color 0.2s;
      
      &:hover { color: var(--primary); }
    }
    
    .author-institution {
      font-size: 12px;
      color: var(--text-tertiary);
      margin: 2px 0 0 0;
    }
  }
}

.related-item {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
  
  .related-title {
    display: block;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-secondary);
    text-decoration: none;
    margin-bottom: 4px;
    transition: color 0.2s;
    
    &:hover { color: var(--primary); }
  }
  
  .related-authors {
    font-size: 12px;
    color: var(--text-tertiary);
    margin: 0;
  }
}
</style>

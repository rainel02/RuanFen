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
                v-if="paper.landingPageUrl"
                @click.prevent="openExternal(paper.landingPageUrl)"
              >
                查看原文
              </el-button>
              <el-button type="primary" icon="MagicStick" class="poster-btn" style="margin-left:16px;" @click="showPosterDialog = true">
                智能生成论文海报
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
                    <!-- <span class="meta-label">刊物：</span> -->
                    <!-- <span>{{ paper.publication }}</span> -->
                    <span class="meta-label">机构：</span>
                    <span>{{ paper.institution }}</span>
                  </div>

                  <div class="publication-info">
                    <span class="meta-label">发表日期：</span>
                    <span>{{ formatDate(paper.publicationDate) }}</span>
                  </div>

                  <div class="doi" v-if="paper.doi">
                    <span class="meta-label">DOI：</span>
                    <a :href="`https://doi.org/${paper.doi}`" target="_blank">{{ paper.doi }}</a>
                  </div>
                </div>

                <div class="main-info-row">
                  <div class="main-info-left">
                    <div class="paper-abstract">
                      <h3>摘要</h3>
                      <p>{{ paper.abstractText }}</p>
                    </div>
                    <div class="paper-keywords">
                      <h3>关键词</h3>
                      <div class="keywords-list">
                        <el-tag
                          v-for="field in paper.concepts"
                          :key="field"
                          size="large"
                          effect="plain"
                        >
                          {{ field }}
                        </el-tag>
                      </div>
                    </div>
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
                    <span class="stat-value">{{ paper.favouriteCount }}</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Document /></el-icon>
                    <span class="stat-label">引用数</span>
                    <span class="stat-value">{{ paper.citedByCount }}</span>
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
                      <div v-if="!paper.authorships || paper.authorships.length === 0" class="empty-authors">
                        暂无详细信息
                      </div>
                      <template v-else>
                        <div
                          v-for="(author, idx) in paper.authorships"
                          :key="authorKey(author, idx)"
                          class="author-item"
                        >
                          <el-avatar :size="40">{{ authorInitial(author) }}</el-avatar>
                          <div class="author-info">
                            <router-link v-if="author && author.id" :to="`/scholars/${author.id}`" class="author-name">
                              {{ authorLabel(author) }}
                            </router-link>
                            <span v-else class="author-name">{{ authorLabel(author) }}</span>
                            <p class="author-institution">{{ typeof author === 'string' ? '' : (author.institution || '') }}</p>
                          </div>
                        </div>
                      </template>
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
        <!-- 生成海报弹窗 -->
        <el-dialog
          v-model="showPosterDialog"
          title="生成论文海报"
          width="480px"
          class="poster-dialog"
          :close-on-click-modal="false"
          :close-on-press-escape="true"
        >
          <div class="poster-dialog-content">
            <div class="poster-preview">
              <el-empty description="海报预览占位" />
            </div>
            <div class="poster-dialog-actions">
              <el-button @click="showPosterDialog = false">取消</el-button>
              <el-button type="primary" @click="downloadPoster">下载</el-button>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { Paper } from '@/types/paper'
import { useRoute } from 'vue-router'
import { Star, Document, View } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import api from '@/api'

// 控制弹窗显示
const showPosterDialog = ref(false)

// 生成海报逻辑（弹窗打开时自动调用）
const generatePoster = () => {
  // 这里可以放置实际生成海报的逻辑
  ElMessage.success('海报已生成（示例）')
}

// 下载海报逻辑（此处为示例）
const downloadPoster = () => {
  ElMessage.success('海报已下载（示例）')
  showPosterDialog.value = false
}

// 监听弹窗打开时自动生成海报
watch(showPosterDialog, (val) => {
  if (val) {
    generatePoster()
  }
})

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
      paper.value.favouriteCount = (paper.value.favouriteCount || 0) + 1
    }
  } else {
    const res = await api.removeFromCollections(id).catch(() => null)
    if (res && (res.status === 204 || res.ok)) {
      paper.value.isfavorited = false
      paper.value.favouriteCount = Math.max(0, (paper.value.favouriteCount || 1) - 1)
    }
  }
}

const loadPaper = async (paperId: string) => {
  if (!paperId) return
  try {
    const data = await api.getAchievement(paperId)
    paper.value = data
    relatedPapers.value = data.relatedWorks || []
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
// 生成海报弹窗样式
.poster-dialog {
  .el-dialog__header {
    background: rgba(255, 252, 245, 0.8);
    border-bottom: 1px solid var(--pf-border);
    font-family: var(--font-sans);
    font-size: 18px;
    color: var(--pf-ink);
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 20px 24px 12px 24px;
  }
  .el-dialog__body {
    background: var(--card-bg);
    padding: 32px 24px 16px 24px;
  }
  .el-dialog__footer {
    background: transparent;
    border-top: none;
    padding: 0 24px 24px 24px;
  }
}

.poster-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.poster-preview {
  width: 320px;
  height: 480px;
  background: linear-gradient(135deg, #f7efe2 60%, #fdf9f2 100%);
  border: 1.5px dashed var(--pf-accent);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(46, 42, 37, 0.06);
}

.poster-dialog-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 16px;
}
@mixin mobile { @media (max-width: 767px) { @content; } }

.paper-detail-page {
  // Theme Variables - Parchment / Beige / Gold
  --pf-bg: #f7efe2;
  --pf-ink: #2e2a25;
  --pf-muted: #7a6f63;
  --pf-accent: #b8893a;
  --pf-border: rgba(46, 42, 37, 0.08);
  --card-bg: #fffcf5;
  --shadow-soft: 0 12px 32px rgba(46, 42, 37, 0.04);
  --font-serif: "Noto Serif", Georgia, "Times New Roman", serif;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--pf-bg) 0%, #fdf9f2 100%);
  color: var(--pf-ink);
  font-family: var(--font-serif);
}

.page-content {
  flex: 1;
  padding: 48px 24px;
  @include mobile { padding: 24px 16px; }
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Header Area */
.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--pf-border);

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

:deep(.el-breadcrumb) {
  font-family: var(--font-sans);
  font-size: 13px;
  letter-spacing: 0.02em;
}

:deep(.el-breadcrumb__inner) {
  color: var(--pf-muted) !important;
  font-weight: 500;

  &.is-link:hover {
    color: var(--pf-accent) !important;
  }
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--pf-ink) !important;
}

.paper-actions {
  display: flex;
  gap: 12px;
}

/* Buttons - Minimalist & Retro */
:deep(.el-button) {
  font-family: var(--font-sans);
  font-weight: 600;
  border-radius: 8px;
  height: 36px;
  padding: 0 18px;
  transition: all 0.2s ease;

  &.el-button--primary {
    background: var(--pf-accent);
    border-color: var(--pf-accent);
    color: #fff;
    box-shadow: 0 4px 12px rgba(184, 137, 58, 0.2);

    &:hover {
      background: darken(#b8893a, 5%);
      border-color: darken(#b8893a, 5%);
      transform: translateY(-1px);
    }
  }

  &.el-button--default {
    background: transparent;
    border: 1px solid var(--pf-border);
    color: var(--pf-ink);

    &:hover {
      border-color: var(--pf-accent);
      color: var(--pf-accent);
      background: rgba(184, 137, 58, 0.05);
    }
  }
}

/* Cards General */
.main-content, .stats-card, .authors-card, .related-papers {
  background: var(--card-bg);
  border: 1px solid var(--pf-border);
  border-radius: 12px;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Main Content Specifics */
.main-content {
  padding: 48px;
  margin-bottom: 32px;

  :deep(.el-card__body) { padding: 0; }

  @include mobile { padding: 24px; }
}

.paper-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--pf-ink);
  margin: 0 0 24px 0;
  letter-spacing: -0.01em;
}

.paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--pf-border);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--pf-muted);

  .publication-info, .doi {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .meta-label {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 0.05em;
    color: var(--pf-accent);
  }

  a {
    color: var(--pf-ink);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;

    &:hover { border-color: var(--pf-accent); }
  }
}

.paper-fields {
  margin-bottom: 32px;

  .el-tag {
    background: rgba(184, 137, 58, 0.08);
    border: none;
    color: var(--pf-ink);
    font-family: var(--font-sans);
    font-weight: 600;
    padding: 6px 14px;
    height: 32px;
    border-radius: 6px;
    margin-right: 8px;
    margin-bottom: 8px;
    font-size: 13px;
  }
}

.paper-abstract {
  margin-bottom: 48px;

  h3 {
    font-family: var(--font-sans);
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--pf-muted);
    margin-bottom: 16px;
    font-weight: 700;
  }

  p {
    font-size: 18px;
    line-height: 1.8;
    color: var(--pf-ink);
    text-align: justify;
  }
}

.paper-keywords {
  h3 {
    font-family: var(--font-sans);
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--pf-muted);
    margin-bottom: 12px;
    font-weight: 700;
  }

  .el-tag {
    background-color: transparent;
    border: 1px solid rgba(46, 42, 37, 0.15);
    color: var(--pf-muted);
    font-family: var(--font-serif);
    font-size: 13px;
    border-radius: 99px; /* Pill shape */
    padding: 0 12px;
    height: 26px;
    line-height: 24px;
    transition: all 0.2s ease;
    margin-right: 8px;
    margin-bottom: 8px;

    &:hover {
      color: var(--pf-accent);
      border-color: var(--pf-accent);
      background-color: rgba(184, 137, 58, 0.04);
    }
  }
}

/* Sidebar Cards */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-card, .authors-card, .related-papers {
  :deep(.el-card__header) {
    border-bottom: 1px solid var(--pf-border);
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.4);

    h4 {
      margin: 0;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--pf-muted);
    }
  }

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-family: var(--font-sans);

  &:last-child { margin-bottom: 0; }

  .el-icon {
    font-size: 18px;
    color: var(--pf-accent);
    margin-right: 8px;
  }

  .stat-label {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--pf-muted);
  }

  .stat-value {
    font-weight: 700;
    color: var(--pf-ink);
    font-size: 16px;
    margin-left: auto;
  }
}

.author-item {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;

  &:last-child { margin-bottom: 0; }

  .el-avatar {
    background: var(--pf-accent);
    color: #fff;
    font-family: var(--font-serif);
    font-weight: 700;
    border: 2px solid rgba(255,255,255,0.5);
    box-shadow: 0 2px 8px rgba(184, 137, 58, 0.2);
  }

  .author-info {
    display: flex;
    flex-direction: column;

    .author-name {
      font-family: var(--font-sans);
      font-size: 15px;
      font-weight: 600;
      color: var(--pf-ink);
      text-decoration: none;
      line-height: 1.2;

      &:hover { color: var(--pf-accent); }
    }

    .author-institution {
      font-family: var(--font-sans);
      font-size: 12px;
      color: var(--pf-muted);
      margin-top: 4px;
      line-height: 1.4;
    }
  }
}

.empty-authors {
  color: var(--pf-muted);
  font-family: var(--font-sans);
  font-size: 14px;
  text-align: center;
  padding: 12px 0;
  font-style: italic;
}

.related-item {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--pf-border);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .related-title {
    display: block;
    font-family: var(--font-serif);
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--pf-ink);
    text-decoration: none;
    margin-bottom: 6px;

    &:hover { color: var(--pf-accent); }
  }

  .related-authors {
    font-family: var(--font-sans);
    font-size: 12px;
    color: var(--pf-muted);
    margin: 0;
  }
}

.loading-state {
  padding: 40px;
}
</style>

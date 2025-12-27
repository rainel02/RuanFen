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
              <el-button type="primary" icon="MagicStick" class="poster-btn" style="margin-left:16px;" @click="openPoster">
                智能生成论文海报
              </el-button>
            </div>
          </div>

          <el-row :gutter="24">
            <el-col :lg="18" :md="24" :sm="24" :xs="24">
              <el-card class="main-content">
                <div class="paper-title-row">
                  <h1 class="paper-title">{{ paper.title }}</h1>
                  <div class="title-actions">
                    <button
                      class="btn-favorite icon-btn"
                      :class="{ 'is-active': paper.isfavorited }"
                      @click.stop="toggleFavorite"
                      aria-label="收藏"
                    >
                      <el-icon><Star /></el-icon>
                    </button>

                    <button
                      v-if="paper.landingPageUrl"
                      class="btn-external icon-btn"
                      @click.prevent.stop="openExternal(paper.landingPageUrl)"
                      aria-label="查看原文"
                    >
                      <el-icon><Document /></el-icon>
                    </button>
                  </div>
                </div>

                <div class="paper-meta">
                  <div class="publication-info">
                    <!-- <span class="meta-label">刊物：</span> -->
                    <!-- <span>{{ paper.publication }}</span> -->
                    <span class="meta-label">机构：</span>
                    <span v-if="paper.institution && paper.institution.length">{{ paper.institution }}</span>
                    <span v-else class="empty-placeholder">暂无详细信息</span>
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

                <div class="paper-abstract">
                  <h3>摘要</h3>
                    <div v-if="paper.abstractText && paper.abstractText.length">
                      <p>{{ paper.abstractText }}</p>
                    </div>
                    <div v-else class="empty-placeholder">暂无详细信息</div>
                </div>

                <div class="paper-keywords">
                  <h3>领域</h3>
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
                            <router-link v-if="getAuthorId(author)" :to="`/scholars/${getAuthorId(author)}`" class="author-name">
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
                      <template v-if="relatedPapers && relatedPapers.length">
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
                      </template>
                      <div v-else class="empty-placeholder">暂无详细信息</div>
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
              <el-skeleton v-if="posterLoading" :rows="8" animated style="width:100%;height:100%" />
              <img v-else-if="posterImg" :src="posterImg" alt="AI海报" style="max-width:100%;max-height:100%;border-radius:12px;box-shadow:0 2px 8px #eee;" />
              <el-empty v-else description="海报预览占位" />
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
import { usePapersStore } from '@/stores/papers'
import type { Paper } from '@/types/paper'
import { useRoute } from 'vue-router'
import { Star, Document, View } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import api from '@/api'
// 百炼模型API Key（sk）
const BAILIAN_API_KEY = 'sk-80aa295708f444a8b03d7bd4680ee555'
// 生成海报图片（通过 Vite /dashscope dev-proxy 转发到通义万相）
async function generatePosterImage(prompt: string): Promise<string | null> {
  // 前端直接发送 provider 所需的请求体，Vite proxy 会把请求重写到真实路径并注入 Authorization
  const body = {
    model: 'wan2.6-t2i',
    input: {
      messages: [
        { role: 'user', content: [{ text: prompt }] }
      ]
    },
    parameters: {
      prompt_extend: true,
      watermark: false,
      n: 1,
      negative_prompt: '',
      size: '1280*1280'
    }
  }

  // 开发时通过 Vite dev server 代理 `/dashscope` 转发到通义万相（Vite 在启动时注入 Authorization）
  const res = await fetch('/dashscope', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    let txt = ''
    try { txt = await res.text() } catch (e) { txt = String(e) }
    console.error('generatePosterImage: 非 2xx 响应', res.status, res.statusText, txt)
    ElMessage.error(`AI 生成接口错误: ${res.status} ${res.statusText}`)
    return null
  }

  const data = await res.json()
  console.log('dashscope 返回:', data)
  if (
    data.output &&
    data.output.choices &&
    data.output.choices[0] &&
    data.output.choices[0].message &&
    data.output.choices[0].message.content &&
    data.output.choices[0].message.content[0] &&
    data.output.choices[0].message.content[0].image
  ) {
    return data.output.choices[0].message.content[0].image
  }
  if (data.output && data.output.images && data.output.images[0]) {
    return data.output.images[0]
  }
  if (data.image) return data.image
  return null
}

// 控制弹窗显示
const showPosterDialog = ref(false)
const posterImg = ref<string | null>(null)
const posterLoading = ref(false)

// 生成海报逻辑（弹窗打开时自动调用）
const generatePoster = async () => {
  console.log('generatePoster start')
  if (!paper.value) {
    console.log('generatePoster aborted: no paper')
    return
  }
  posterLoading.value = true
  posterImg.value = null
  // 组装prompt
  const prompt = `请根据以下论文信息生成一张学术风格的AI海报，内容需突出论文主题、作者和摘要，适合学术分享场景：\n论文题目：${paper.value.title}\n作者：${(paper.value.authorships||[]).map(a=>typeof a==='string'?a:a?.name).join('，')}\n摘要：${paper.value.abstractText}\n关键词：${(paper.value.concepts||[]).join('，')}`
  try {
    const img = await generatePosterImage(prompt)
    if (img) {
      posterImg.value = img
    } else {
      ElMessage.error('AI海报生成失败')
    }
  } catch (e) {
    ElMessage.error('AI海报生成异常')
  } finally {
    posterLoading.value = false
  }
}

// 下载海报逻辑
const downloadPoster = () => {
  console.log('downloadPoster invoked, posterImg:', posterImg.value)
  if (!posterImg.value) {
    console.log('no poster to download')
    return
  }
  const a = document.createElement('a')
  a.href = posterImg.value
  a.download = (paper.value?.title || 'poster') + '.png'
  a.click()
  showPosterDialog.value = false
}

// 监听弹窗打开时自动生成海报
watch(showPosterDialog, (val) => {
  console.log('showPosterDialog changed:', val)
  if (val) {
    console.log('trigger generatePoster from watch')
    generatePoster()
      .then(() => console.log('generatePoster finished'))
      .catch(e => console.error('generatePoster error', e))
  }
})

// 打开弹窗的入口，便于调试
function openPoster() {
  console.log('openPoster clicked')
  showPosterDialog.value = true
}

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

const getAuthorId = (author: any) => {
  if (!author || typeof author === 'string') return null

  const tryFromString = (s?: string | null) => {
    if (!s) return null
    const m = String(s).match(/(?:openalex\.org\/)([A-Za-z0-9]+)/)
    return m ? m[1] : null
  }

  // common places: author.id or author.authorIds (array of URLs)
  const fromId = tryFromString(author.id)
  if (fromId) return fromId

  const candidateArrays = [author.authorIds, author.ids]
  for (const arr of candidateArrays) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        const found = tryFromString(item)
        if (found) return found
      }
    }
  }

  return null
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

const papersStore = usePapersStore()

const toggleFavorite = async () => {
  if (!paper.value) return
  const id = paper.value.id

  try {
    const msgOpts = { customClass: 'swiss-message', duration: 1500, offset: 60 }
    const errorMsgOpts = { customClass: 'swiss-message swiss-message-error', duration: 3000, offset: 60 }
    // if the store contains this paper, use store method (keeps central state)
    const storeHas = !!(papersStore as any).papers?.find((p: any) => p.id === id)
    if (storeHas) {
      await papersStore.toggleFavorite(id)
      const updated = (papersStore as any).papers.find((p: any) => p.id === id)
      if (updated) {
        paper.value.isfavorited = !!updated.isfavorited
        // update favouriteCount if store provides it
        if (typeof updated.favouriteCount !== 'undefined') paper.value.favouriteCount = updated.favouriteCount
      }
      if (!updated?.isfavorited) {
        ElMessage.success({ message: '已从收藏夹移除', ...msgOpts })
      } else {
        ElMessage.success({ message: '已加入收藏夹', ...msgOpts })
      }
      return
    }

    // fallback: call API directly and update local paper
    if (!paper.value.isfavorited) {
      const res = await api.addToCollections(id)
      ElMessage.success({ message: '已加入收藏夹', ...msgOpts })
      paper.value.isfavorited = true
      paper.value.favouriteCount = (paper.value.favouriteCount || 0) + 1
    } else {
      const res = await api.removeFromCollections(id)
      ElMessage.success({ message: '已从收藏夹移除', ...msgOpts })
      paper.value.isfavorited = false
      paper.value.favouriteCount = Math.max(0, (paper.value.favouriteCount || 1) - 1)
    }
  } catch (error) {
    console.error('Toggle favorite failed', error)
    ElMessage.error({ message: '操作失败，请稍后重试', customClass: 'swiss-message swiss-message-error', duration: 3000, offset: 60 })
  }
}

const loadPaper = async (paperId: string) => {
  if (!paperId) return
  try {
    const data = await api.getAchievement(paperId)
    paper.value = data
    relatedPapers.value = data.relatedWorks || []
    // If the central store already has this paper (e.g. user favorited from list), prefer store state
    try {
      const storePaper = (papersStore as any).papers?.find((p: any) => String(p.id) === String(paperId))
      if (storePaper && paper.value) {
        if (typeof storePaper.isfavorited !== 'undefined') paper.value.isfavorited = !!storePaper.isfavorited
        if (typeof storePaper.favouriteCount !== 'undefined') paper.value.favouriteCount = storePaper.favouriteCount
      }
    } catch (e) {
      // ignore store merge errors
      console.warn('merge store paper state failed', e)
    }
    // optional: scroll to top when navigating to another paper
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    console.error('load paper error', e)
  }
}

// Keep detail page in sync if store papers change (e.g. user toggles favorite elsewhere)
watch(
  () => (papersStore as any).papers,
  (newPapers: any[]) => {
    if (!paper.value || !Array.isArray(newPapers)) return
    const sp = newPapers.find((p: any) => String(p.id) === String(paper.value?.id))
    if (sp) {
      if (typeof sp.isfavorited !== 'undefined') paper.value.isfavorited = !!sp.isfavorited
      if (typeof sp.favouriteCount !== 'undefined') paper.value.favouriteCount = sp.favouriteCount
    }
  },
  { deep: true }
)

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
// 复制自 src/styles/mixins.scss - 避免在 SFC 中使用 @use 导致顺序错误
@mixin mobile { @media (max-width: 767px) { @content; } }

@mixin tablet { @media (min-width: 768px) and (max-width: 1199px) { @content; } }

@mixin desktop { @media (min-width: 1200px) { @content; } }
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
  overflow: visible; /* allow top-floating controls to remain visible */
}

.page-content {
  flex: 1;
  padding: 48px 24px;
  @include mobile { padding: 24px 16px; }
  overflow: visible;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  overflow: visible;
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
      background: adjust(#b8893a, -5%);
      border-color: adjust(#b8893a, -5%);
      transform: translateY(-1px);
    }
  }

  &.el-button--default {
    background: transparent;
    border: 1px solid var(--pf-border);
    color: var(--pf-ink);

    &:hover {
      border-color: var(--pf-accent);
      color: var(--pf-accent) !important;
      background: rgba(184, 137, 58, 0.05) !important;
    }
  }
}

/* Specific styling for external link button to avoid Element default blue hover/focus */
:deep(.external-btn) {
  background: transparent !important;
  border: 1px solid var(--pf-border) !important;
  color: var(--pf-ink) !important;
  box-shadow: none !important;
}

:deep(.external-btn:hover) {
  border-color: var(--pf-accent) !important;
  color: var(--pf-accent) !important;
  background: rgba(184, 137, 58, 0.05) !important;
}

:deep(.external-btn:focus), :deep(.external-btn:active) {
  outline: none !important;
  box-shadow: none !important;
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
  overflow: visible; /* allow title action buttons to extend outside without being clipped */
  position: relative; /* ensure absolute children position relative to this card */

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

.paper-title-row {
  position: relative;
  display: block;
  padding-top: 12px; /* 保留顶部空间，避免按钮被遮挡 */
}

.title-actions {
  position: absolute;
  top: -30px; /* 放在标题上方，减小偏移以避免被上层元素遮挡 */
  left: 0px;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: none;
  z-index: 9999; /* 提高层级，确保不被页面其它元素覆盖 */
}

.title-actions .icon-btn {
  background: transparent;
  border: 1px solid var(--pf-border);
  color: var(--pf-ink);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}

.title-actions .icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 69, 19, 0.12);
}

.title-actions .btn-favorite.is-active {
  background: var(--pf-accent);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 18px rgba(184, 137, 58, 0.18);
}

.title-actions .btn-external:hover {
  border-color: var(--pf-accent);
  color: var(--pf-accent);
  background: rgba(184, 137, 58, 0.05);
}

@media (max-width: 767px) {
  .title-actions {
    position: static;
    transform: none;
    margin-top: 8px;
    gap: 8px;
  }
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
  width: 40px !important; /* ensure fixed circular avatar */
  height: 40px !important;
  flex-shrink: 0 !important;
  border-radius: 50% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
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

/* Unified empty placeholder used across abstract, related list, institution, authors */
.empty-placeholder {
  color: var(--pf-muted);
  font-family: var(--font-sans);
  font-size: 14px;
  text-align: center;
  padding: 14px 0;
  font-style: italic;
  background: transparent;
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

/* Ensure Element Plus card internals don't clip our floating controls */
:deep(.el-card), :deep(.el-card__body) {
  overflow: visible !important;
}

.loading-state {
  padding: 40px;
}
</style>

<style lang="scss">
/* 全局样式 - 用于 ElMessage 等插入到 body 的元素 */
.swiss-message {
  --el-message-bg-color: #fffcf5 !important;
  --el-message-border-color: rgba(184, 137, 58, 0.3) !important;
  --el-message-text-color: #2e2a25 !important;
  --el-color-success: #b8893a !important; /* 将成功图标颜色改为金色 */
  
  font-family: "Noto Serif", Georgia, serif !important;
  border-radius: 4px !important;
  box-shadow: 0 8px 24px rgba(46, 42, 37, 0.12) !important;
  border-width: 1px !important;
  padding: 12px 24px !important;
  min-width: 300px !important;
  
  .el-message__content {
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
  }
  
  .el-icon {
    font-size: 18px !important;
  }
}

/* 强制覆盖 Element Plus 成功/图标颜色（有时 Element 使用更高优先级的选择器） */
.swiss-message,
.swiss-message * {
  color: #2e2a25 !important;
}
.swiss-message {
  background-color: #fffcf5 !important;
  border: 1px solid rgba(184, 137, 58, 0.18) !important;
}
.swiss-message .el-icon,
.swiss-message .el-message__icon,
.swiss-message .el-icon svg,
.swiss-message .el-icon path {
  color: #b8893a !important;
  fill: #b8893a !important;
}
.swiss-message .el-message__content {
  color: #2e2a25 !important;
}

/* 错误/警告样式 - 复古红 */
.swiss-message.swiss-message-error {
  --el-message-border-color: rgba(166, 55, 55, 0.3) !important;
  border-color: rgba(166, 55, 55, 0.25) !important;
}

.swiss-message.swiss-message-error .el-icon,
.swiss-message.swiss-message-error .el-message__icon,
.swiss-message.swiss-message-error .el-icon svg,
.swiss-message.swiss-message-error .el-icon path {
  color: #a63737 !important;
  fill: #a63737 !important;
}
</style>

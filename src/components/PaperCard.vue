<template>
  <div class="paper-card">
    <div class="paper-header">
      <h3 class="paper-title">
        <router-link
          :to="`/paper/${paper.id}`"
          class="title-link"
        >
          {{ paper.title }}
        </router-link>
      </h3>
      <button
        class="btn-favorite"
        :class="{ 'is-active': paper.isfavorited }"
        @click.stop="toggleFavorite"
        aria-label="收藏"
      >
        <el-icon><Star /></el-icon>
      </button>
    </div>

    <div class="paper-authors">
      <span class="authors-label">作者：</span>
      <span class="authors-list">
        <template v-for="(author, index) in (paper.authorships || [])">
          <router-link
            v-if="getAuthorId(author, index)"
            :key="getAuthorId(author, index) || `author-${index}`"
            :to="`/scholars/${getAuthorId(author, index)}`"
            class="author-link"
          >
            {{ author.name }}{{ index < ((paper.authorships || []).length) - 1 ? ', ' : '' }}
          </router-link>
          <span v-else :key="index">{{ author.name }}{{ index < ((paper.authorships || []).length) - 1 ? ', ' : '' }}</span>
        </template>
      </span>
    </div>

    <!-- <div class="paper-meta">
      <span class="publish-label">发布时间：</span>
      <span>{{ paper.year }}</span>
    </div> -->

    <div class="paper-meta">
      <span class="publish-label">摘要：</span>
      <p>{{ paper.abstractText }}</p>
    </div>

    <!-- 论文领域 -->
    <!-- <div class="paper-fields">
      <el-tag
        v-for="field in paper.fields"
        :key="field"
        size="small"
        effect="plain"
      >
        {{ field }}
      </el-tag>
    </div> -->

    <!-- 论文关键词 -->
    <div v-if="paper.keyword && paper.keyword.length" class="paper-keywords">
      <span class="keywords-label">关键词：</span>
      <div class="keywords-list">
        <el-tag
          v-for="kw in paper.keyword"
          :key="kw"
          size="small"
          effect="plain"
        >
          {{ kw }}
        </el-tag>
      </div>
    </div>

    <div class="paper-stats">
      <div class="stat-item">
        <el-icon><Star /></el-icon>
        <span>{{ paper.favouriteCount }}</span>
      </div>
      <div class="stat-item">
        <el-icon><Document /></el-icon>
        <span>{{ paper.citedByCount }} 引用</span>
      </div>
      <div class="stat-item">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDate(paper.publicationDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Document, Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePapersStore } from '../stores/papers'
import type { Paper } from '../types/paper'
import api from '../api'

const emit = defineEmits<{
  (e: 'removed', id: string): void
  (e: 'updated', payload: { id: string; isfavorited: boolean }): void
}>()

interface Props {
  paper: Paper
}

const props = defineProps<Props>()
const papersStore = usePapersStore()

const formatDate = (dateStringOrYear?: string | number) => {
  if (dateStringOrYear === undefined || dateStringOrYear === null) return ''
  if (typeof dateStringOrYear === 'number') return String(dateStringOrYear)
  const s = String(dateStringOrYear)
  // if already in yyyy-mm-dd or similar, normalize
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

// Extract an OpenAlex-style ID from an author object or fallback arrays.
const getAuthorId = (author: any, index: number) => {
  // If author has an id field
  if (author && author.id) {
    const idStr = String(author.id)
    // If it's a URL, take last path segment
    if (/^https?:\/\//.test(idStr)) {
      const parts = idStr.split('/').filter(Boolean)
      return parts.length ? parts[parts.length - 1] : null
    }
    return idStr
  }

  // Fallback: if the paper includes authorIds array, try to use that
  const fallback = (props.paper as any).authorIds
  if (Array.isArray(fallback) && fallback[index]) {
    const idStr = String(fallback[index])
    if (/^https?:\/\//.test(idStr)) {
      const parts = idStr.split('/').filter(Boolean)
      return parts.length ? parts[parts.length - 1] : null
    }
    return idStr
  }

  return null
}

const toggleFavorite = async () => {
  const id = props.paper.id
  console.log('Toggling favorite for paper', id)
  const msgOpts = { customClass: 'swiss-message', duration: 1500, offset: 60 }
  const errorMsgOpts = { customClass: 'swiss-message swiss-message-error', duration: 3000, offset: 60 }

  try {
    // if the store contains this paper, use store method (keeps central state)
    const storeHas = !!(papersStore as any).papers?.find((p: any) => p.id === id)
    if (storeHas) {
      await papersStore.toggleFavorite(id)
      // if now unfavorited, notify parent
      const nowFav = (papersStore as any).papers.find((p: any) => p.id === id)?.isfavorited
      if (!nowFav) {
        ElMessage.success({ message: '已从收藏夹移除', ...msgOpts })
        emit('removed', id)
      } else {
        ElMessage.success({ message: '已加入收藏夹', ...msgOpts })
        emit('updated', { id, isfavorited: true })
      }
      return
    }

    // fallback: call API directly and notify parent to update/remove
    if (!props.paper.isfavorited) {
      await api.addToCollections(id)
      ElMessage.success({ message: '已加入收藏夹', ...msgOpts })
      emit('updated', { id, isfavorited: true })
    } else {
      await api.removeFromCollections(id)
      ElMessage.success({ message: '已从收藏夹移除', ...msgOpts })
      // regardless of response, emit removed so parent can update UI
      emit('removed', id)
    }
  } catch (error) {
    console.error('Toggle favorite failed', error)
    ElMessage.error({ message: '操作失败，请稍后重试', ...errorMsgOpts })
  }
}
</script>

<style scoped lang="scss">
.paper-card {
  /* 核心变量定义 - 羊皮纸风格 */
  --pc-bg: #fffcf5; /* 比背景稍亮的纸张色 */
  --pc-border: rgba(46, 42, 37, 0.08);
  --pc-ink: #2e2a25;
  --pc-ink-light: #5c554b;
  --pc-accent: #b8893a;
  --pc-shadow: 0 2px 8px rgba(46, 42, 37, 0.04);
  --pc-shadow-hover: 0 12px 32px rgba(46, 42, 37, 0.08);
  
  font-family: "Noto Serif", Georgia, "Times New Roman", serif;
  background: var(--pc-bg);
  border: 1px solid var(--pc-border);
  border-radius: 2px; /* 稍微锐利一点的圆角，更像纸张 */
  padding: 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--pc-shadow-hover);
    border-color: rgba(184, 137, 58, 0.2);
  }

  .paper-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 16px;

    .paper-title {
      flex: 1;
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: -0.02em;
      color: var(--pc-ink);
      min-width: 0; /* allow flex child to shrink and avoid pushing sibling button */

      .title-link {
        text-decoration: none;
        color: inherit;
        display: -webkit-box;
        -webkit-line-clamp: 4; /* limit to 4 lines */
        line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        background-image: linear-gradient(var(--pc-ink), var(--pc-ink));
        background-position: 0% 100%;
        background-repeat: no-repeat;
        background-size: 0% 1px;
        transition: background-size 0.3s ease, color 0.3s ease;

        &:hover {
          color: var(--pc-accent);
          background-size: 100% 1px;
          background-image: linear-gradient(var(--pc-accent), var(--pc-accent));
        }
      }
    }

    .btn-favorite {
      background: transparent !important;
      border: 1px solid rgba(46, 42, 37, 0.08) !important;
      cursor: pointer;
      padding: 6px !important;
      border-radius: 50% !important;
      color: var(--pc-ink-light) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease !important;
      width: 28px !important;
      height: 28px !important;
      flex-shrink: 0;

      &:hover {
        background: rgba(184, 137, 58, 0.06) !important;
        color: var(--pc-accent) !important;
        transform: translateY(-1px) scale(1.03) !important;
        border-color: rgba(184, 137, 58, 0.18) !important;
      }

      &.is-active {
        background: var(--pc-accent) !important;
        color: #ffffff !important;
        border-color: transparent !important;
        box-shadow: 0 6px 18px rgba(184, 137, 58, 0.18) !important;

        &:hover {
          transform: translateY(-1px) scale(1.06) !important;
          box-shadow: 0 8px 22px rgba(184, 137, 58, 0.22) !important;
        }
      }

      .el-icon {
        font-size: 14px !important;
        line-height: 1 !important;
      }
      /* 强制图标使用当前颜色并覆盖 Element Plus 的默认填充 */
      .el-icon svg,
      .el-icon path {
        fill: currentColor !important;
      }
      /* 确保按钮与图标颜色被覆盖（防止 Element Plus 主题色生效） */
      color: var(--pc-ink-light) !important;
    }
  }

  .paper-authors {
    margin-bottom: 20px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--pc-ink-light);
    font-style: italic;
    font-family: "Georgia", serif;

    .authors-label {
      font-weight: 600;
      font-style: normal;
      opacity: 0.6;
      margin-right: 6px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .author-link {
      color: var(--pc-ink-light);
      text-decoration: none;
      border-bottom: 1px dotted rgba(92, 85, 75, 0.3);
      transition: all 0.2s;

      &:hover {
        color: var(--pc-accent);
        border-bottom-color: var(--pc-accent);
      }
    }
  }

  .paper-meta {
    margin-bottom: 24px;
    font-size: 16px;
    color: var(--pc-ink);
    line-height: 1.75;
    flex-grow: 1; /* 让摘要占据剩余空间 */

    .publish-label {
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--pc-accent);
      display: block;
      margin-bottom: 8px;
      opacity: 0.9;
    }
    
    p {
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      opacity: 0.85;
    }
  }

  .paper-keywords {
    margin-bottom: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .keywords-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--pc-ink-light);
      text-transform: uppercase;
      margin-right: 4px;
      opacity: 0.7;
    }

    .keywords-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    /* 自定义 Tag 样式以符合复古风格 */
    :deep(.el-tag) {
      background-color: transparent;
      border: 1px solid rgba(46, 42, 37, 0.15);
      color: var(--pc-ink-light);
      font-family: "Noto Serif", serif;
      font-size: 13px;
      border-radius: 99px; /* 药丸形状 */
      padding: 0 12px;
      height: 26px;
      line-height: 24px;
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--pc-accent);
        border-color: var(--pc-accent);
        background-color: rgba(184, 137, 58, 0.04);
      }
    }
  }

  .paper-stats {
    display: flex;
    align-items: center;
    gap: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(46, 42, 37, 0.08);
    margin-top: auto;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--pc-ink-light);
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; /* 数字用无衬线体更清晰 */
      opacity: 0.8;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
        color: var(--pc-accent);
      }

      .el-icon {
        font-size: 16px;
        color: var(--pc-accent);
      }
    }
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .paper-card {
    padding: 20px;
    
    .paper-header .paper-title {
      font-size: 19px;
    }
    
    .paper-meta {
      font-size: 15px;
      line-height: 1.6;
      
      p {
        -webkit-line-clamp: 4; /* 移动端多显示一行 */
        line-clamp: 4;
      }
    }
  }
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
  color: var(--pc-accent) !important;
  fill: var(--pc-accent) !important;
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
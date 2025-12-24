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
      <el-button
        :type="paper.isfavorited ? 'primary' : 'default'"
        :icon="Star"
        circle
        size="small"
        @click="toggleFavorite"
      />
    </div>

    <div class="paper-authors">
      <span class="authors-label">作者：</span>
      <span class="authors-list">
        <template v-for="(author, index) in (paper.authorships || [])">
          <router-link
            v-if="author && author.id" 
            :key="author.id"
            :to="`/scholars/${author.id}`"
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
      <p>{{ paper.abstract }}</p>
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
        <span>{{ paper.favoriteCount }}</span>
      </div>
      <div class="stat-item">
        <el-icon><Document /></el-icon>
        <span>{{ paper.citationCount }} 引用</span>
      </div>
      <div class="stat-item">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDate(paper.publication_date) }}</span>
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

const toggleFavorite = async () => {
  const id = props.paper.id

  // if the store contains this paper, use store method (keeps central state)
  const storeHas = !!(papersStore as any).papers?.find((p: any) => p.id === id)
  if (storeHas) {
    papersStore.toggleFavorite(id)
    // if now unfavorited, notify parent
    const nowFav = (papersStore as any).papers.find((p: any) => p.id === id)?.isfavorited
    if (!nowFav) {
      ElMessage.success('取消收藏成功')
      emit('removed', id)
    } else {
      ElMessage.success('加入收藏成功')
      emit('updated', { id, isfavorited: true })
    }
    return
  }

  // fallback: call API directly and notify parent to update/remove
  if (!props.paper.isfavorited) {
    await api.addToCollections(id).catch(() => null)
    ElMessage.success('收藏成功')
    emit('updated', { id, isfavorited: true })
  } else {
    const res = await api.removeFromCollections(id).catch(() => null)
    ElMessage.success('取消收藏成功')
    // regardless of response, emit removed so parent can update UI
    emit('removed', id)
  }
}
</script>

<style scoped lang="scss">
.paper-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* Note: Background and border are handled by the global .paper-card class in main.scss */

  .paper-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-md);

    .paper-title {
      flex: 1;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: -0.01em;

      .title-link {
        text-decoration: none;
        color: var(--text-primary);
        transition: color 0.2s;

        &:hover {
          color: var(--primary);
        }
      }
    }
  }

  .paper-authors {
    margin-bottom: var(--space-sm);
    font-size: 14px;
    color: var(--text-secondary);

    .authors-label {
      color: var(--text-tertiary);
      margin-right: 4px;
    }

    .author-link {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: var(--primary);
      }
    }
  }

  .paper-meta {
    margin-bottom: var(--space-md);
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;

    .publish-label {
      color: var(--text-tertiary);
      font-weight: 500;
      margin-right: 4px;
    }
    
    p {
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .paper-keywords {
    margin-bottom: var(--space-md);
    font-size: 13px;
    display: flex;
    align-items: baseline;

    .keywords-label {
      color: var(--text-tertiary);
      margin-right: 8px;
      white-space: nowrap;
    }

    .keywords-list {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
  }

  .paper-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: var(--space-md);
    border-top: 1px solid var(--border-subtle);

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-tertiary);
      font-weight: 500;

      .el-icon {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }
}
</style>

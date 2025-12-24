<template>
  <div class="paper-card glass-card">
    <div class="card-body">
      <div class="paper-header">
        <div class="title-section">
          <h3 class="paper-title" @click="goToDetail">
            {{ paper.title }}
          </h3>
          <div class="badges">
            <el-tag size="small" effect="dark" class="journal-tag">{{ paper.journal }}</el-tag>
            <el-tag v-if="isRecent(paper.publishDate)" size="small" type="danger" effect="plain">New</el-tag>
          </div>
        </div>
        <el-button
          :type="paper.isFavorited ? 'warning' : 'default'"
          :icon="paper.isFavorited ? StarFilled : Star"
          circle
          size="small"
          class="fav-btn"
          @click.stop="toggleFavorite"
        />
      </div>

      <div class="paper-authors">
        <span class="label">Authors:</span>
        <div class="authors-list">
          <span 
            v-for="(author, index) in paper.authors" 
            :key="author.id"
            class="author-name"
            @click.stop="goToScholar(author.id)"
          >
            {{ author.name }}<span v-if="index < paper.authors.length - 1">, </span>
          </span>
        </div>
      </div>

      <div class="paper-abstract">
        {{ paper.abstract }}
      </div>

      <div class="paper-footer">
        <div class="tags-list">
          <el-tag
            v-for="field in paper.fields.slice(0, 3)"
            :key="field"
            size="small"
            effect="light"
            class="field-tag"
          >
            {{ field }}
          </el-tag>
        </div>
        
        <div class="stats-info">
          <span class="stat" title="引用数">
            <el-icon><Document /></el-icon> {{ formatNumber(paper.citations) }}
          </span>
          <span class="stat" title="发布时间">
            <el-icon><Calendar /></el-icon> {{ formatDate(paper.publishDate) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Star, StarFilled, Document, Calendar } from '@element-plus/icons-vue'
import { usePapersStore } from '../stores/papers'
import type { Paper } from '../types/paper'

interface Props {
  paper: Paper
}

const props = defineProps<Props>()
const router = useRouter()
const papersStore = usePapersStore()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatNumber = (num: number) => {
  return num > 1000 ? (num / 1000).toFixed(1) + 'k' : num
}

const isRecent = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays < 30
}

const toggleFavorite = () => {
  papersStore.toggleFavorite(props.paper.id)
}

const goToDetail = () => {
  router.push(`/paper/${props.paper.id}`)
}

const goToScholar = (id: string) => {
  router.push(`/scholar/${id}`)
}
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: rgba(64, 158, 255, 0.3);
    background: rgba(255, 255, 255, 0.95);
  }
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  .title-section {
    flex: 1;
    margin-right: 15px;

    .paper-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 1.4;
      transition: color 0.2s;

      &:hover {
        color: #409eff;
      }
    }

    .badges {
      display: flex;
      gap: 8px;
    }
  }

  .fav-btn {
    flex-shrink: 0;
    &:hover {
      color: #e6a23c;
      border-color: #e6a23c;
      background-color: #fdf6ec;
    }
  }
}

.paper-authors {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  gap: 5px;

  .label {
    color: #909399;
    font-weight: 500;
  }

  .authors-list {
    .author-name {
      cursor: pointer;
      &:hover { color: #409eff; text-decoration: underline; }
    }
  }
}

.paper-abstract {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.paper-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(0,0,0,0.05);

  .tags-list {
    display: flex;
    gap: 6px;
  }

  .stats-info {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #909399;

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}
</style>

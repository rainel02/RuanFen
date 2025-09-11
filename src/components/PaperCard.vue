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
        :type="paper.isFavorited ? 'primary' : 'default'"
        :icon="Star"
        circle
        size="small"
        @click="toggleFavorite"
      />
    </div>

    <div class="paper-authors">
      <span class="authors-label">作者：</span>
      <span class="authors-list">
        <router-link
          v-for="(author, index) in paper.authors"
          :key="author.id"
          :to="`/scholar/${author.id}`"
          class="author-link"
        >
          {{ author.name }}{{ index < paper.authors.length - 1 ? ', ' : '' }}
        </router-link>
      </span>
    </div>

    <div class="paper-meta">
      <el-tag size="small" type="info">{{ paper.journal }}</el-tag>
      <span class="publish-date">{{ formatDate(paper.publishDate) }}</span>
    </div>

    <div class="paper-abstract">
      <p class="text-ellipsis-3">{{ paper.abstract }}</p>
    </div>

    <div class="paper-fields">
      <el-tag
        v-for="field in paper.fields"
        :key="field"
        size="small"
        effect="plain"
      >
        {{ field }}
      </el-tag>
    </div>

    <div class="paper-stats">
      <div class="stat-item">
        <el-icon><Star /></el-icon>
        <span>{{ paper.favorites }}</span>
      </div>
      <div class="stat-item">
        <el-icon><Document /></el-icon>
        <span>{{ paper.citations }} 引用</span>
      </div>
      <div class="stat-item">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDate(paper.publishDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Document, Calendar } from '@element-plus/icons-vue'
import { usePapersStore } from '../stores/papers'
import type { Paper } from '../types/paper'

interface Props {
  paper: Paper
}

const props = defineProps<Props>()
const papersStore = usePapersStore()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const toggleFavorite = () => {
  papersStore.toggleFavorite(props.paper.id)
}
</script>

<style scoped lang="scss">
.paper-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  .paper-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .paper-title {
      flex: 1;
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.4;

      .title-link {
        text-decoration: none;
        color: var(--text-color);

        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }

  .paper-authors {
    margin-bottom: 10px;
    font-size: 14px;

    .authors-label {
      color: var(--text-light);
    }

    .author-link {
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .paper-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;

    .publish-date {
      font-size: 13px;
      color: var(--text-light);
    }
  }

  .paper-abstract {
    flex: 1;
    margin-bottom: 12px;

    p {
      font-size: 14px;
      color: var(--text-light);
      line-height: 1.5;
      margin: 0;
    }
  }

  .paper-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .paper-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-light);

      .el-icon {
        font-size: 14px;
      }
    }
  }
}
</style>

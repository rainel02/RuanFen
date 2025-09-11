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
                :type="paper.isFavorited ? 'primary' : 'default'"
                :icon="Star"
                @click="toggleFavorite"
              >
                {{ paper.isFavorited ? '已收藏' : '收藏' }}
              </el-button>
              <el-button :icon="Share">分享</el-button>
              <el-button :icon="Download" v-if="paper.pdfUrl">下载PDF</el-button>
            </div>
          </div>

          <el-row :gutter="24">
            <el-col :lg="18" :md="24" :sm="24" :xs="24">
              <el-card class="main-content">
                <h1 class="paper-title">{{ paper.title }}</h1>

                <div class="paper-meta">
                  <div class="authors">
                    <span class="meta-label">作者：</span>
                    <router-link
                      v-for="(author, index) in paper.authors"
                      :key="author.id"
                      :to="`/scholar/${author.id}`"
                      class="author-link"
                    >
                      {{ author.name }}{{ index < paper.authors.length - 1 ? ', ' : '' }}
                    </router-link>
                  </div>

                  <div class="publication-info">
                    <span class="meta-label">发表于：</span>
                    <span>{{ paper.journal }}</span>
                    <span class="separator">|</span>
                    <span>{{ formatDate(paper.publishDate) }}</span>
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
                      v-for="keyword in paper.keywords"
                      :key="keyword"
                      type="info"
                      effect="plain"
                      size="small"
                    >
                      {{ keyword }}
                    </el-tag>
                  </div>
                </div>
              </el-card>

              <el-card class="comments-section">
                <template #header>
                  <h3>评论与讨论</h3>
                </template>
                <el-empty description="暂无评论，来发表第一个评论吧！" />
              </el-card>
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
                    <span class="stat-value">{{ paper.favorites }}</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Document /></el-icon>
                    <span class="stat-label">引用数</span>
                    <span class="stat-value">{{ paper.citations }}</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><View /></el-icon>
                    <span class="stat-label">浏览数</span>
                    <span class="stat-value">{{ Math.floor(Math.random() * 1000) + 100 }}</span>
                  </div>
                </el-card>

                <el-card class="authors-card">
                  <template #header>
                    <h4>作者信息</h4>
                  </template>
                  <div class="authors-list">
                    <div
                      v-for="author in paper.authors"
                      :key="author.id"
                      class="author-item"
                    >
                      <el-avatar :size="40">{{ author.name.charAt(0) }}</el-avatar>
                      <div class="author-info">
                        <router-link :to="`/scholar/${author.id}`" class="author-name">
                          {{ author.name }}
                        </router-link>
                        <p class="author-institution">{{ author.institution }}</p>
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
                      <p class="related-authors">{{ relatedPaper.authors.map(a => a.name).join(', ') }}</p>
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

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Star, Share, Download, Document, View } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { mockPapers } from '@/mock/papers'
import { usePapersStore } from '../stores/papers'

const route = useRoute()
const papersStore = usePapersStore()

const paper = ref(null)
const relatedPapers = ref([])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const toggleFavorite = () => {
  if (paper.value) {
    papersStore.toggleFavorite(paper.value.id)
    paper.value.isFavorited = !paper.value.isFavorited
    paper.value.favorites += paper.value.isFavorited ? 1 : -1
  }
}

onMounted(() => {
  const paperId = route.params.id
  paper.value = mockPapers.find(p => p.id === paperId)

  if (paper.value) {
    // 获取相关论文（同领域的其他论文）
    relatedPapers.value = mockPapers
      .filter(p => p.id !== paperId && p.fields.some(field => paper.value.fields.includes(field)))
      .slice(0, 5)
  }
})
</script>

<style scoped lang="scss">
.paper-detail-page {
  min-height: 100vh;
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .paper-actions {
    display: flex;
    gap: 12px;

    @include mobile {
      flex-direction: column;
      width: 100%;
      margin-top: 16px;
    }
  }

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
  }
}

.main-content {
  margin-bottom: 24px;

  .paper-title {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.4;
    margin: 0 0 20px 0;
    color: var(--text-color);
  }

  .paper-meta {
    margin-bottom: 20px;

    > div {
      margin-bottom: 8px;
      color: var(--text-color);

      .meta-label {
        font-weight: 600;
        color: var(--text-light);
      }

      .author-link {
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .separator {
        margin: 0 12px;
        color: var(--text-light);
      }

      a {
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .paper-fields {
    margin-bottom: 24px;

    .el-tag {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }

  .paper-abstract {
    margin-bottom: 24px;

    h3 {
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      line-height: 1.8;
      font-size: 16px;
      color: var(--text-color);
    }
  }

  .paper-keywords {
    h3 {
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: 600;
    }

    .keywords-list {
      .el-tag {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
  }
}

.sidebar {
  .stats-card, .authors-card, .related-papers {
    margin-bottom: 20px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .stat-label {
      flex: 1;
      color: var(--text-light);
    }

    .stat-value {
      font-weight: 600;
      color: var(--primary-color);
    }
  }

  .authors-list {
    .author-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .author-info {
        flex: 1;

        .author-name {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }

        .author-institution {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: var(--text-light);
        }
      }
    }
  }

  .related-list {
    .related-item {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .related-title {
        display: block;
        color: var(--text-color);
        text-decoration: none;
        font-weight: 500;
        line-height: 1.4;
        margin-bottom: 4px;

        &:hover {
          color: var(--primary-color);
        }
      }

      .related-authors {
        margin: 0;
        font-size: 12px;
        color: var(--text-light);
      }
    }
  }
}

.loading-state, .comments-section {
  margin-bottom: 24px;
}
</style>

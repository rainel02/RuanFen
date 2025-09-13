<template>
  <div class="home-page">
    <AppHeader />
<!--    <div>正常渲染</div>-->
    <div class="page-content">
      <div class="container">
        <el-row :gutter="24">
          <el-col :md="6" :sm="24" :xs="24">
            <div class="sidebar-wrapper">
              <FilterSidebar />
            </div>
          </el-col>

          <el-col :md="18" :sm="24" :xs="24">
            <div class="main-content">
              <!-- 论文导读推荐区域 -->
              <div v-if="showPaperGuide && !searchQuery" class="paper-guide-section">
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
                    <div
                      v-for="paper in recommendedPapers"
                      :key="`rec-${paper.id}`"
                      class="recommended-paper"
                    >
                      <div class="paper-info">
                        <h5 class="paper-title">
                          <router-link :to="`/paper/${paper.id}`">{{ paper.title }}</router-link>
                        </h5>
                        <p class="paper-meta">
                          {{ paper.authors.slice(0, 2).map((a: any) => a.name).join(', ') }} - {{ paper.journal }}
                        </p>
                        <div class="recommendation-tag">
                          <el-tag size="small" type="primary">{{ paper.recommendationReason }}</el-tag>
                        </div>
                      </div>
                      <div class="paper-actions">
                        <el-button size="small" text>
                          <el-icon><View /></el-icon>
                        </el-button>
                        <el-button size="small" text>
                          <el-icon><Star /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>

              <div class="content-header">
                <div class="results-info">
                  <span class="results-count">
                    找到 {{ filteredPapers.length }} 篇相关论文
                  </span>
                  <span v-if="searchQuery" class="search-query">
                    "{{ searchQuery }}"
                  </span>
                </div>
              </div>

              <div
                v-loading="loading"
                class="papers-grid"
              >
                <div
                  v-for="paper in paginatedPapers"
                  :key="paper.id"
                  class="paper-item"
                >
                  <PaperCard :paper="paper" />
                </div>
              </div>

              <div v-if="paginatedPapers.length === 0 && !loading" class="empty-state">
                <el-empty description="暂无符合条件的论文" />
              </div>

              <div v-if="totalPages > 1" class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="filteredPapers.length"
                  :page-sizes="[12, 24, 48]"
                  :small="false"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star, ArrowRight, View } from '@element-plus/icons-vue'
import AppHeader from '../components/AppHeader.vue'
import PaperCard from '../components/PaperCard.vue'
import FilterSidebar from '../components/FilterSidebar.vue'
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

// 显示论文导读功能
const showPaperGuide = computed(() => settingsStore.settings.enablePaperGuide)

// 推荐论文（简化版）
const recommendedPapers = computed(() => {
  return filteredPapers.value.slice(0, 3).map(paper => ({
    ...paper,
    recommendationReason: '基于兴趣推荐'
  }))
})

const handleSizeChange = (size: number) => {
  papersStore.pageSize = size
  papersStore.currentPage = 1
}

const handleCurrentChange = (page: number) => {
  papersStore.currentPage = page
}
</script>

<style scoped lang="scss">
@import "../styles/main.scss";

.home-page {
  min-height: 100vh;
}

.sidebar-wrapper {
  @include mobile {
    margin-bottom: 20px;
  }
}

.main-content {
  .paper-guide-section {
    margin-bottom: 24px;

    .guide-card {
      .guide-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-color);
        }

        .view-all-link {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .recommended-papers {
        .recommended-paper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .paper-info {
            flex: 1;

            .paper-title {
              margin: 0 0 4px 0;
              font-size: 14px;
              font-weight: 500;

              a {
                color: #333;
                text-decoration: none;

                &:hover {
                  color: var(--primary-color);
                }
              }
            }

            .paper-meta {
              margin: 4px 0;
              font-size: 12px;
              color: #666;
            }

            .recommendation-tag {
              margin-top: 4px;
            }
          }

          .paper-actions {
            display: flex;
            gap: 4px;
          }
        }
      }
    }
  }

  .content-header {
    margin-bottom: 20px;

    .results-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .results-count {
        font-size: 14px;
        color: var(--text-light);
      }

      .search-query {
        font-weight: 600;
        color: var(--primary-color);
      }
    }
  }

  .papers-grid {
    display: grid;
    gap: 20px;
    margin-bottom: 24px;

    @include mobile {
      grid-template-columns: 1fr;
    }

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @include desktop {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
}
</style>

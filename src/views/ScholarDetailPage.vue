<template>
  <div class="scholar-detail-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div v-if="scholar" class="scholar-detail">
          <div class="scholar-header">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/scholars' }">科研人员</el-breadcrumb-item>
              <el-breadcrumb-item>学者详情</el-breadcrumb-item>
            </el-breadcrumb>

            <div class="scholar-actions">
              <el-button
                :type="scholar.isFollowed ? 'primary' : 'default'"
                :icon="Plus"
                @click="toggleFollow"
              >
                {{ scholar.isFollowed ? '已关注' : '关注' }}
              </el-button>
              <el-button :icon="Message">发消息</el-button>
              <el-button @click="handleStartChat">私信</el-button>
            </div>
          </div>

          <el-row :gutter="24">
            <el-col :lg="8" :md="24" :sm="24" :xs="24">
              <el-card class="scholar-profile">
                <div class="profile-header">
                  <el-avatar :src="scholar.avatar" :size="100">
                    {{ scholar.name.charAt(0) }}
                  </el-avatar>
                  <h2>{{ scholar.name }}</h2>
                  <p class="scholar-title">{{ scholar.title }}</p>
                  <p class="scholar-institution">{{ scholar.institution }}</p>
                </div>

                <div class="profile-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ scholar.hIndex }}</span>
                    <span class="stat-label">H指数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ scholar.citations }}</span>
                    <span class="stat-label">引用数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ scholar.papers }}</span>
                    <span class="stat-label">论文数</span>
                  </div>
                </div>

                <div class="profile-fields">
                  <h4>研究领域</h4>
                  <div class="fields-list">
                    <el-tag
                      v-for="field in scholar.fields"
                      :key="field"
                      size="small"
                      effect="plain"
                    >
                      {{ field }}
                    </el-tag>
                  </div>
                </div>

                <div class="profile-contact" v-if="scholar.email">
                  <h4>联系方式</h4>
                  <p><el-icon><Message /></el-icon> {{ scholar.email }}</p>
                </div>

                <div class="profile-bio" v-if="scholar.bio">
                  <h4>个人简介</h4>
                  <p>{{ scholar.bio }}</p>
                </div>
              </el-card>
            </el-col>

            <el-col :lg="16" :md="24" :sm="24" :xs="24">
              <el-card class="scholar-content">
                <el-tabs v-model="activeTab">
                  <el-tab-pane label="论文列表" name="papers">
                    <div class="papers-list">
                      <div class="papers-header">
                        <span class="papers-count">共 {{ scholarPapers.length }} 篇论文</span>
                        <el-select v-model="papersSortBy" size="small" style="width: 120px;">
                          <el-option label="最新发表" value="date" />
                          <el-option label="引用数" value="citations" />
                        </el-select>
                      </div>

                      <div class="papers-grid">
                        <div
                          v-for="paper in sortedScholarPapers"
                          :key="paper.id"
                          class="paper-item"
                        >
                          <h4 class="paper-title">
                            <router-link :to="`/paper/${paper.id}`">{{ paper.title }}</router-link>
                          </h4>
                          <p class="paper-journal">{{ paper.journal }} | {{ formatDate(paper.publishDate) }}</p>
                          <p class="paper-abstract">{{ paper.abstract.substring(0, 150) }}...</p>
                          <div class="paper-stats">
                            <span><el-icon><Document /></el-icon> {{ paper.citations }} 引用</span>
                            <span><el-icon><Star /></el-icon> {{ paper.favorites }} 收藏</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="影响力趋势" name="impact">
                    <div class="impact-chart">
                      <v-chart
                        :option="impactChartOptions"
                        autoresize
                        style="height: 400px;"
                      />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="合作者网络" name="network">
                    <div class="collaboration-network">
                      <el-empty description="合作者网络图开发中..." />
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-card>
            </el-col>
          </el-row>

          <!-- 聊天窗口 -->
          <el-dialog
            v-model="showChatWindow"
            title="私信"
            width="80%"
            :before-close="handleCloseChatWindow"
          >
            <ChatWindow @close="handleCloseChatWindow" />
          </el-dialog>
        </div>

        <div v-else class="loading-state">
          <el-skeleton :rows="8" animated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Message, Document, Star } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import AppHeader from '@/components/AppHeader.vue'
import ChatWindow from '@/components/ChatWindow.vue'
import { mockScholars } from '@/mock/scholars'
import { mockPapers } from '@/mock/papers'
import { useChatStore } from '../stores/chat'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent
])

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const scholar = ref(null)
const showChatWindow = ref(false)
const activeTab = ref('papers')
const papersSortBy = ref('date')
const scholarPapers = ref([])

const sortedScholarPapers = computed(() => {
  const papers = [...scholarPapers.value]
  if (papersSortBy.value === 'citations') {
    return papers.sort((a, b) => b.citations - a.citations)
  }
  return papers.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
})

const impactChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['2019', '2020', '2021', '2022', '2023', '2024']
  },
  yAxis: [
    {
      type: 'value',
      name: 'H指数'
    },
    {
      type: 'value',
      name: '引用数',
      position: 'right'
    }
  ],
  series: [
    {
      name: 'H指数',
      type: 'line',
      data: [32, 35, 38, 41, 43, scholar.value?.hIndex || 45],
      smooth: true,
      itemStyle: { color: '#1890ff' }
    },
    {
      name: '年引用数',
      type: 'line',
      yAxisIndex: 1,
      data: [156, 234, 312, 387, 445, 520],
      smooth: true,
      itemStyle: { color: '#52c41a' }
    }
  ]
}))

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const toggleFollow = () => {
  if (scholar.value) {
    scholar.value.isFollowed = !scholar.value.isFollowed
  }
}

const handleStartChat = () => {
  if (scholar.value) {
    chatStore.startConversation(
      scholar.value.id,
      scholar.value.name,
      scholar.value.avatar
    )
    // 跳转到私信页面
    router.push('/chat')
  }
}

const handleCloseChatWindow = () => {
  showChatWindow.value = false
}

onMounted(() => {
  const scholarId = route.params.id
  scholar.value = mockScholars.find(s => s.id === scholarId)

  if (scholar.value) {
    // 获取该学者的论文（模拟数据）
    scholarPapers.value = mockPapers
      .filter(paper => paper.authors.some(author => author.name === scholar.value.name))
      .slice(0, 10)
  }
})
</script>

<style scoped lang="scss">
.scholar-detail-page {
  min-height: 100vh;
}

.scholar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.scholar-profile {
  margin-bottom: 24px;

  .profile-header {
    text-align: center;
    margin-bottom: 24px;

    h2 {
      margin: 16px 0 4px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .scholar-title, .scholar-institution {
      margin: 4px 0;
      color: var(--text-light);
    }
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
    text-align: center;

    .stat-item {
      .stat-value {
        display: block;
        font-size: 24px;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 4px;
      }

      .stat-label {
        display: block;
        font-size: 12px;
        color: var(--text-light);
      }
    }
  }

  .profile-fields, .profile-contact, .profile-bio {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
    }

    .fields-list {
      .el-tag {
        margin-right: 6px;
        margin-bottom: 6px;
      }
    }

    p {
      margin: 4px 0;
      color: var(--text-light);
      font-size: 14px;
      line-height: 1.5;

      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

.scholar-content {
  .papers-list {
    .papers-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .papers-count {
        font-size: 14px;
        color: var(--text-light);
      }
    }

    .papers-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .paper-item {
        padding: 16px;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: var(--shadow-medium);
        }

        .paper-title {
          margin: 0 0 8px 0;
          font-size: 16px;

          a {
            color: var(--text-color);
            text-decoration: none;

            &:hover {
              color: var(--primary-color);
            }
          }
        }

        .paper-journal {
          margin: 4px 0 8px 0;
          font-size: 13px;
          color: var(--text-light);
        }

        .paper-abstract {
          margin: 8px 0 12px 0;
          line-height: 1.5;
          color: var(--text-color);
          font-size: 14px;
        }

        .paper-stats {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: var(--text-light);

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }

  .impact-chart {
    padding: 20px 0;
  }

  .collaboration-network {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

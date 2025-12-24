<template>
  <div class="scholar-detail-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div v-if="scholar" class="scholar-detail">
          <!-- Header Section -->
          <div class="scholar-header-card glass-panel">
            <div class="header-bg"></div>
            <div class="header-content">
              <div class="avatar-section">
                <el-avatar :src="scholar.avatar" :size="120" class="main-avatar">
                  {{ scholar.name.charAt(0) }}
                </el-avatar>
              </div>
              <div class="info-section">
                <div class="name-row">
                  <h1>{{ scholar.name }}</h1>
                  <el-tag v-if="scholar.isVerified" type="success" effect="dark" round size="small">
                    <el-icon><Select /></el-icon> 认证学者
                  </el-tag>
                </div>
                <p class="title">{{ scholar.title }}</p>
                <p class="institution"><el-icon><School /></el-icon> {{ scholar.institution }}</p>
                
                <div class="action-buttons">
                  <el-button 
                    :type="scholar.isFollowed ? 'success' : 'primary'" 
                    round 
                    :icon="scholar.isFollowed ? Check : Plus"
                    @click="toggleFollow"
                  >
                    {{ scholar.isFollowed ? '已关注' : '关注' }}
                  </el-button>
                  <el-button round :icon="ChatDotRound" @click="handleStartChat">私信</el-button>
                  <el-button circle :icon="Share" />
                </div>
              </div>
              
              <div class="stats-section">
                <div class="stat-box">
                  <div class="value">{{ scholar.stats.hIndex }}</div>
                  <div class="label">H-Index</div>
                </div>
                <div class="stat-box">
                  <div class="value">{{ formatNumber(scholar.stats.citations) }}</div>
                  <div class="label">总引用</div>
                </div>
                <div class="stat-box">
                  <div class="value">{{ scholar.stats.papers }}</div>
                  <div class="label">论文数</div>
                </div>
              </div>
            </div>
          </div>

          <el-row :gutter="24" class="main-body">
            <!-- Left Column -->
            <el-col :lg="8" :md="24" :sm="24" :xs="24">
              <div class="sidebar-stack">
                <!-- About Card -->
                <div class="glass-panel sidebar-card">
                  <h3>关于学者</h3>
                  <div class="bio-text">{{ scholar.bio || '暂无简介' }}</div>
                  
                  <div class="info-group">
                    <label>研究领域</label>
                    <div class="tags-wrapper">
                      <el-tag 
                        v-for="field in scholar.fields" 
                        :key="field" 
                        effect="light"
                        class="field-tag"
                      >
                        {{ field }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="info-group" v-if="scholar.email">
                    <label>联系方式</label>
                    <div class="contact-row">
                      <el-icon><Message /></el-icon> {{ scholar.email }}
                    </div>
                  </div>
                </div>

                <!-- Co-authors Card (Mock) -->
                <div class="glass-panel sidebar-card">
                  <h3>合作学者</h3>
                  <div class="co-authors-list">
                    <div v-for="i in 3" :key="i" class="co-author-item">
                      <el-avatar :size="32" :src="`https://i.pravatar.cc/150?u=${i}`" />
                      <div class="info">
                        <div class="name">Dr. CoAuthor {{ i }}</div>
                        <div class="inst">University of Science</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>

            <!-- Right Column -->
            <el-col :lg="16" :md="24" :sm="24" :xs="24">
              <div class="glass-panel content-card">
                <el-tabs v-model="activeTab" class="custom-tabs">
                  <el-tab-pane label="发表论文" name="papers">
                    <div class="tab-header">
                      <span>共 {{ scholarPapers.length }} 篇论文</span>
                      <el-select v-model="papersSortBy" size="small" style="width: 120px">
                        <el-option label="最新发表" value="date" />
                        <el-option label="引用最高" value="citations" />
                      </el-select>
                    </div>

                    <div class="papers-list">
                      <div 
                        v-for="paper in sortedScholarPapers" 
                        :key="paper.id" 
                        class="paper-list-item"
                      >
                        <div class="paper-main">
                          <h3 class="paper-title" @click="router.push(`/paper/${paper.id}`)">
                            {{ paper.title }}
                          </h3>
                          <div class="paper-meta">
                            <span class="journal">{{ paper.journal }}</span>
                            <span class="year">{{ paper.year }}</span>
                          </div>
                          <div class="paper-authors">
                            {{ paper.authors.join(', ') }}
                          </div>
                        </div>
                        <div class="paper-stats">
                          <div class="citation-badge">
                            <span class="count">{{ paper.citations }}</span>
                            <span class="label">引用</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  
                  <el-tab-pane label="科研动态" name="activity">
                    <el-empty description="暂无动态" />
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ElMessage } from 'element-plus'
import { Plus, Message, Check, Share, Select, School, ChatDotRound } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import AppHeader from '@/components/AppHeader.vue'
import * as scholarApi from '../api/scholar'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent
])

const route = useRoute()
const router = useRouter()
const scholar = ref<any>(null)
const activeTab = ref('papers')
const papersSortBy = ref('date')


const scholarPapers = ref<any[]>([])

const sortedScholarPapers = computed(() => {
  let papers = [...scholarPapers.value]
  if (papersSortBy.value === 'citations') {
    papers.sort((a, b) => b.citations - a.citations)
  } else {
    // Date sort (mock)
  }
  return papers
})

const toggleFollow = () => {
  if (scholar.value) {
    scholar.value.isFollowed = !scholar.value.isFollowed
  }
}

const handleStartChat = () => {
  router.push('/chat')
}

const formatNumber = (num: number) => {
  return num > 1000 ? (num / 1000).toFixed(1) + 'k' : num
}


const loadScholarDetail = async () => {
  const scholarId = route.params.id as string
  try {
    const response = await scholarApi.getScholarDetail(scholarId)
    scholar.value = {
      id: response.scholarId,
      name: response.name,
      institution: response.organization,
      title: '',
      avatar: '',
      bio: response.bio,
      fields: response.researchFields || [],
      achievements: response.achievements || [],
      hIndex: 0,
      citations: 0,
      papers: 0,
      isFollowed: false
    }
    
    // 获取论文列表（从achievements中提取）
    if (response.achievements) {
      scholarPapers.value = response.achievements.map((ach: any) => ({
        id: ach.id || ach.achievementId,
        title: ach.title,
        authors: ach.authors || [],
        journal: ach.journal || '',
        publishDate: ach.publishDate || ach.year,
        citations: ach.citations || 0,
        abstract: ach.abstract || ''
      }))
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载学者详情失败')
  }
}

onMounted(() => {
  loadScholarDetail()
})
</script>

<style scoped lang="scss">
.scholar-detail-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-content {
  padding-bottom: 40px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.scholar-header-card {
  margin-top: 30px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;

  .header-bg {
    height: 120px;
    background: linear-gradient(90deg, #409eff, #36d1dc);
    opacity: 0.8;
  }

  .header-content {
    padding: 0 40px 30px;
    display: flex;
    align-items: flex-end;
    gap: 30px;
    margin-top: -60px;

    .avatar-section {
      .main-avatar {
        border: 4px solid #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background: #fff;
      }
    }

    .info-section {
      flex: 1;
      padding-bottom: 5px;

      .name-row {
        display: flex;
        align-items: center;
        gap: 10px;
        h1 { margin: 0; font-size: 28px; color: #303133; }
      }

      .title { margin: 5px 0; font-size: 16px; color: #606266; }
      .institution { margin: 0 0 15px 0; color: #909399; display: flex; align-items: center; gap: 5px; }

      .action-buttons {
        display: flex;
        gap: 12px;
      }
    }

    .stats-section {
      display: flex;
      gap: 30px;
      padding-bottom: 10px;

      .stat-box {
        text-align: center;
        .value { font-size: 24px; font-weight: 700; color: #303133; }
        .label { font-size: 12px; color: #909399; text-transform: uppercase; letter-spacing: 0.5px; }
      }
    }
  }
}

.main-body {
  .sidebar-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .sidebar-card {
    padding: 20px;
    
    h3 { margin: 0 0 15px 0; font-size: 16px; color: #303133; border-left: 3px solid #409eff; padding-left: 10px; }
    
    .bio-text {
      color: #606266;
      line-height: 1.6;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .info-group {
      margin-bottom: 20px;
      &:last-child { margin-bottom: 0; }

      label { display: block; color: #909399; font-size: 12px; margin-bottom: 8px; }
      
      .tags-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .contact-row {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #606266;
      }
    }

    .co-authors-list {
      display: flex;
      flex-direction: column;
      gap: 15px;

      .co-author-item {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .info {
          .name { font-weight: 500; color: #303133; font-size: 14px; }
          .inst { font-size: 12px; color: #909399; }
        }
      }
    }
  }

  .content-card {
    padding: 20px;
    min-height: 500px;

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      color: #909399;
      font-size: 14px;
    }

    .paper-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child { border-bottom: none; }

      .paper-main {
        flex: 1;
        padding-right: 20px;

        .paper-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #303133;
          cursor: pointer;
          &:hover { color: #409eff; }
        }

        .paper-meta {
          font-size: 13px;
          color: #606266;
          margin-bottom: 4px;
          
          .journal { font-style: italic; margin-right: 10px; }
        }

        .paper-authors {
          font-size: 13px;
          color: #909399;
        }
      }

      .paper-stats {
        .citation-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f0f9eb;
          color: #67c23a;
          padding: 5px 10px;
          border-radius: 6px;
          min-width: 50px;

          .count { font-weight: 700; font-size: 16px; }
          .label { font-size: 10px; }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .scholar-header-card .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -40px;

    .info-section {
      .name-row { justify-content: center; }
      .institution { justify-content: center; }
      .action-buttons { justify-content: center; }
    }
  }
}
</style>

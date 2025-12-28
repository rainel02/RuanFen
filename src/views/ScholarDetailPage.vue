<template>
  <div class="scholar-detail-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div v-if="scholar" class="scholar-detail">
          <!-- Header Section -->
          <div class="scholar-header-card glass-panel">
            <div class="header-bg" :style="{ backgroundImage: `url(${headerBgImage})` }"></div>
            
            <!-- 下半部分：所有信息 -->
            <div class="header-bottom">
              <div class="avatar-section">
                <el-avatar :src="scholar.avatar || defaultAvatar" :size="140" class="main-avatar">
                  {{ scholar.name.charAt(0) }}
                </el-avatar>
                <div class="status-indicator" v-if="scholar.isOnline"></div>
              </div>
              
              <div class="info-content">
                <div class="name-row">
                  <h1>{{ scholar.name }}</h1>
                  <el-tag v-if="scholar.isVerified" type="success" effect="dark" round size="small" class="verified-tag">
                    <el-icon><Select /></el-icon> 认证学者
                  </el-tag>
                </div>
                <p class="title">{{ scholar.title || '教授' }}</p>
                <p class="institution">
                  <el-icon><School /></el-icon> 
                  {{ scholar.institution }}
                </p>
                <div class="bio-preview">{{ scholar.bio || '暂无简介' }}</div>
                
                <!-- <div class="action-buttons">
                  <el-button 
                    class="gothic-btn follow-btn"
                    :class="{ 'followed': scholar.isFollowed }"
                    @click="toggleFollow"
                  >
                    <el-icon><component :is="scholar.isFollowed ? Check : Plus" /></el-icon>
                    {{ scholar.isFollowed ? '已关注' : '关注' }}
                  </el-button>
                  <el-button class="gothic-btn" @click="handleStartChat">
                    <el-icon><Message /></el-icon> 私信
                  </el-button>
                  <el-button class="gothic-btn" circle>
                    <el-icon><Share /></el-icon>
                  </el-button>
                </div> -->
                
                <div class="stats-section">
                  <div class="stat-box">
                    <div class="value">{{ scholar.stats?.hIndex || 0 }}</div>
                    <div class="label">H-Index</div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-box">
                    <div class="value">{{ formatNumber(scholar.stats?.citations || 0) }}</div>
                    <div class="label">总引用</div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-box">
                    <div class="value">{{ scholar.stats?.papers || 0 }}</div>
                    <div class="label">论文数</div>
                  </div>
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
                  <h3><el-icon><UserFilled /></el-icon> 关于学者</h3>
                  <div class="bio-text">{{ scholar.bio || '暂无简介' }}</div>
                  
                  <div class="info-group">
                    <label><el-icon><Collection /></el-icon> 研究领域</label>
                    <div class="tags-wrapper">
                      <el-tag 
                        v-for="field in scholar.fields" 
                        :key="field" 
                        class="field-tag"
                      >
                        {{ field }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="info-group" v-if="scholar.email">
                    <label><el-icon><Message /></el-icon> 联系方式</label>
                    <div class="contact-row">
                      {{ scholar.email }}
                    </div>
                  </div>
                </div>

                <!-- Collaboration Network Card -->
                <div class="glass-panel sidebar-card network-card">
                  <h3><el-icon><Connection /></el-icon> 合作网络</h3>
                  <div class="network-chart-container">
                    <v-chart 
                      v-if="networkData.nodes && networkData.nodes.length > 0"
                      class="network-chart" 
                      :option="networkOption" 
                      autoresize
                      @click="handleNodeClick"
                    />
                    <el-empty v-else description="暂无合作数据" :image-size="80" />
                  </div>
                </div>
              </div>
            </el-col>

            <!-- Right Column -->
            <el-col :lg="16" :md="24" :sm="24" :xs="24">
              <div class="glass-panel content-card">
                <el-tabs v-model="activeTab" class="custom-tabs">
                  <el-tab-pane label="发表论文" name="papers">
                    <template #label>
                      <span><el-icon><Document /></el-icon> 发表论文</span>
                    </template>
                    <div class="tab-header">
                      <span>共 {{ scholarPapers.length }} 篇论文</span>
                      <el-select v-model="papersSortBy" size="small" class="gothic-select" style="width: 140px">
                        <el-option label="最新发表" value="date" />
                        <el-option label="引用最高" value="citations" />
                      </el-select>
                    </div>

                    <div class="papers-list">
                      <div 
                        v-for="paper in sortedScholarPapers" 
                        :key="paper.id" 
                        class="paper-list-item glass-item"
                      >
                        <div class="paper-main">
                          <h3 class="paper-title" @click="router.push(`/paper/${paper.id}`)">
                            {{ paper.title }}
                          </h3>
                          <div class="paper-meta">
                            <span class="journal">{{ paper.journal || '未知期刊' }}</span>
                            <span class="year">{{ paper.year || paper.publishDate || '未知年份' }}</span>
                          </div>
                          <div class="paper-authors">
                            {{ paper.authors?.join(', ') || '未知作者' }}
                          </div>
                        </div>
                        <div class="paper-stats">
                          <div class="citation-badge">
                            <span class="count">{{ paper.citations || 0 }}</span>
                            <span class="label">引用</span>
                          </div>
                        </div>
                      </div>
                      <el-empty v-if="scholarPapers.length === 0" description="暂无论文" />
                    </div>
                  </el-tab-pane>
                  
                  <el-tab-pane label="科研动态" name="activity">
                    <template #label>
                      <span><el-icon><Bell /></el-icon> 科研动态</span>
                    </template>
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
import { 
  Plus, Message, Check, Share, Select, School,
  UserFilled, Collection, Connection, Document, Bell
} from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import AppHeader from '@/components/AppHeader.vue'
import * as scholarApi from '../api/scholar'
import { followUser, unfollowUser } from '../api/social'
import * as socialApi from '../api/social'
import { useAuthStore } from '../stores/auth'
import defaultAvatar from '@/assets/profile.png'
import pic1 from '@/assets/pic1.jpg'
import pic2 from '@/assets/pic2.jpg'
import pic3 from '@/assets/pic3.jpg'

use([
  CanvasRenderer,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const scholar = ref<any>(null)
const activeTab = ref('papers')
const papersSortBy = ref('date')
const networkData = ref<any>({ nodes: [], links: [] })

const extractApiMessage = (payload: any, fallback = '操作失败') => {
  const data = payload?.response?.data ?? payload?.data ?? payload
  const message = data?.message ?? data?.msg ?? payload?.message
  if (typeof message === 'string' && message.trim()) return message.trim()
  if (typeof data === 'string' && data.trim()) return data.trim()
  return fallback
}

// 随机选择背景图片
const backgroundImages = [pic1, pic2, pic3]
const headerBgImage = ref(backgroundImages[Math.floor(Math.random() * backgroundImages.length)])

const scholarPapers = ref<any[]>([])

const sortedScholarPapers = computed(() => {
  let papers = [...scholarPapers.value]
  if (papersSortBy.value === 'citations') {
    papers.sort((a, b) => (b.citations || 0) - (a.citations || 0))
  } else {
    // Date sort (mock)
    papers.sort((a, b) => (b.year || 0) - (a.year || 0))
  }
  return papers
})

const networkOption = computed(() => {
  if (!networkData.value.nodes || networkData.value.nodes.length === 0) {
    return {}
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `${params.data.name}<br/>${params.data.organization || ''}`
        }
        return ''
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: networkData.value.nodes.map((node: any, index: number) => ({
        id: node.id || node.scholarId || node.userId,
        name: node.name || node.publicName,
        value: node.value || 1,
        symbolSize: index === 0 ? 50 : 30,
        itemStyle: {
          color: index === 0 ? '#D4AF37' : '#8B4513',
          borderColor: '#654321',
          borderWidth: 2
        },
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold'
        },
        category: node.category !== undefined ? node.category : (index === 0 ? 0 : 1)
      })),
      links: networkData.value.links.map((link: any) => ({
        source: link.source,
        target: link.target,
        value: link.value || 1,
        lineStyle: {
          color: '#B8860B',
          width: 2,
          curveness: 0.3
        }
      })),
      categories: [
        { name: '当前学者' },
        { name: '合作学者' }
      ],
      roam: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      labelLayout: {
        hideOverlap: true
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 4
        }
      },
      force: {
        repulsion: 200,
        gravity: 0.1,
        edgeLength: 100,
        layoutAnimation: true
      }
    }]
  }
})

const toggleFollow = async () => {
  if (!scholar.value) return
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录才能关注学者')
    router.push('/profile')
    return
  }
  
  try {
    if (scholar.value.isFollowed) {
      const res = await unfollowUser(scholar.value.id)
      ElMessage.success(extractApiMessage(res, '已取消关注'))
    } else {
      const res = await followUser(scholar.value.id)
      ElMessage.success(extractApiMessage(res, '已关注'))
    }
    scholar.value.isFollowed = !scholar.value.isFollowed
  } catch (error: any) {
    ElMessage.error(extractApiMessage(error))
  }
}

const handleStartChat = () => {
  if (!scholar.value) return
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录才能发送私信')
    router.push('/profile')
    return
  }
  router.push(`/chat?userId=${scholar.value.id}&name=${encodeURIComponent(scholar.value.name || '')}&avatar=${encodeURIComponent(scholar.value.avatar || '')}`)
}

// 检查当前用户是否已关注该学者
const checkFollowStatus = async () => {
  if (!scholar.value) {
    return
  }
  
  if (!authStore.isLoggedIn || !authStore.user?.id) {
    scholar.value.isFollowed = false
    return
  }
  
  try {
    // 获取当前用户的关注列表
    const followingResponse: any = await socialApi.getFollowing(authStore.user.id)
    const followingData = followingResponse?.data || followingResponse
    const followingList = followingData.following || followingData.results || (Array.isArray(followingData) ? followingData : [])
    
    console.log('关注列表:', followingList)
    console.log('当前学者ID:', scholar.value.id)
    
    // 检查该学者是否在关注列表中（尝试多种ID字段匹配）
    const isFollowed = followingList.some((item: any) => {
      const itemId = String(item.userId || item.id || item.scholarId || '')
      const scholarId = String(scholar.value?.id || scholar.value?.userId || scholar.value?.scholarId || '')
      console.log('比较:', itemId, '===', scholarId, '?', itemId === scholarId)
      return itemId === scholarId && itemId !== ''
    })
    
    console.log('是否已关注:', isFollowed)
    scholar.value.isFollowed = isFollowed
  } catch (error) {
    console.error('检查关注状态失败:', error)
    scholar.value.isFollowed = false
  }
}

const handleNodeClick = (params: any) => {
  if (params.dataType === 'node' && params.data && params.data.id) {
    router.push(`/scholars/${params.data.id}`)
  }
}

const formatNumber = (num: number) => {
  if (num > 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num > 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

const loadScholarDetail = async () => {
  const scholarId = route.params.id as string
  if (!scholarId) {
    ElMessage.error('学者ID不存在')
    return
  }
  
  try {
    // request.ts 已经处理了 ApiResponse 格式，直接返回 data 或原始数据
    const response: any = await scholarApi.getScholarDetail(scholarId)
    
    // 如果返回的是 ApiResponse 格式，提取 data；否则直接使用
    const scholarData = (response && typeof response === 'object' && 'data' in response) 
      ? response.data 
      : response
    
    if (!scholarData) {
      ElMessage.error('学者信息不存在')
      return
    }
    
    console.log('学者详情数据:', scholarData)
    
    scholar.value = {
      id: scholarData.scholarId || scholarData.userId || scholarId,
      name: scholarData.publicName || scholarData.name || '未知学者',
      institution: scholarData.organization || '未知机构',
      title: scholarData.title || '教授',
      avatar: scholarData.avatarUrl,
      bio: scholarData.bio || '暂无简介',
      fields: scholarData.researchFields || [],
      achievements: scholarData.achievements || [],
      stats: {
        hIndex: scholarData.hIndex || 0,
        citations: scholarData.citations || 0,
        papers: scholarData.achievements?.length || 0
      },
      isFollowed: false, // 初始化为 false，后续通过 checkFollowStatus 更新
      isVerified: scholarData.isVerified || false,
      isOnline: false
    }
    
    // 检查当前用户是否已关注该学者
    await checkFollowStatus()
    
    // 获取论文列表（从achievements中提取）
    if (scholarData.achievements && Array.isArray(scholarData.achievements)) {
      scholarPapers.value = scholarData.achievements.map((ach: any) => ({
        id: ach.id || ach.achievementId,
        title: ach.title || '未命名成果',
        authors: ach.authors || [],
        journal: ach.journal || '',
        year: ach.year || (ach.publishDate ? new Date(ach.publishDate).getFullYear() : new Date().getFullYear()),
        publishDate: ach.publishDate || ach.year,
        citations: ach.citations || 0,
        abstract: ach.abstract || ''
      }))
    } else {
      scholarPapers.value = []
    }

    // 加载合作网络
    try {
      // 后端返回 ApiResponse<List<ScholarDTO>>，request.ts 已处理，这里直接使用
      const networkResponse: any = await scholarApi.getCollaborationNetwork(scholarId)
      
      // 如果返回的是 ApiResponse 格式，提取 data；否则直接使用
      const collaborators = (networkResponse && typeof networkResponse === 'object' && 'data' in networkResponse)
        ? networkResponse.data
        : (Array.isArray(networkResponse) ? networkResponse : [])
      
      console.log('合作网络数据:', collaborators)
      
      if (Array.isArray(collaborators) && collaborators.length > 0) {
        // 将合作者转换为网络图节点
        const collaboratorNodes = collaborators.map((collab: any) => ({
          id: collab.scholarId || collab.userId,
          name: collab.publicName || collab.name,
          organization: collab.organization,
          value: 1,
          category: 1
        }))
        
        // 创建链接：当前学者与每个合作者之间的链接
        const links = collaboratorNodes.map((node: any) => ({
          source: scholar.value.id,
          target: node.id,
          value: 1
        }))
        
        // 将当前学者添加到节点列表的最前面
        networkData.value = {
          nodes: [
            {
              id: scholar.value.id,
              name: scholar.value.name,
              organization: scholar.value.institution,
              value: 2,
              category: 0
            },
            ...collaboratorNodes
          ],
          links: links
        }
      } else {
        // 没有合作者，只显示当前学者
        networkData.value = {
          nodes: [
            {
              id: scholar.value.id,
              name: scholar.value.name,
              organization: scholar.value.institution,
              value: 1,
              category: 0
            }
          ],
          links: []
        }
      }
    } catch (error: any) {
      console.warn('加载合作网络失败:', error)
      // 使用空数据
      networkData.value = {
        nodes: [
          {
            id: scholar.value.id,
            name: scholar.value.name,
            organization: scholar.value.institution,
            value: 1,
            category: 0
          }
        ],
        links: []
      }
    }
  } catch (error: any) {
    console.error('加载学者详情失败:', error)
    ElMessage.error(error.message || error.response?.data?.message || '加载学者详情失败')
  }
}

onMounted(() => {
  loadScholarDetail()
})
</script>

<style scoped lang="scss">
.scholar-detail-page {
  min-height: 100vh;
  background-image: url('@/assets/bg1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding-bottom: 40px;
}

.page-content {
  padding-top: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.glass-panel {
  background: rgba(249, 247, 236, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 3px solid rgba(184, 134, 11, 0.5);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.4) 0%, 
      transparent 25%, 
      transparent 75%, 
      rgba(212, 175, 55, 0.4) 100%);
    border-radius: 16px;
    z-index: -1;
    opacity: 0.6;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 32px rgba(0, 0, 0, 0.22),
      0 0 0 2px rgba(212, 175, 55, 0.4),
      inset 0 2px 6px rgba(255, 255, 255, 0.6);
  }
}

.scholar-header-card {
  margin-top: 30px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;

  .header-bg {
    height: 140px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, 
        rgba(0, 0, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.2) 100%);
    }
  }

  .header-bottom {
    padding: 30px 40px;
    border-top: 2px solid rgba(184, 134, 11, 0.2);
    background: linear-gradient(135deg, 
      rgba(249, 247, 236, 0.5) 0%, 
      rgba(255, 255, 255, 0.3) 100%);
    display: flex;
    gap: 30px;
    align-items: flex-start;
    
    .avatar-section {
      position: relative;
      flex-shrink: 0;
      
      .main-avatar {
        border: 5px solid #D4AF37;
        box-shadow: 
          0 6px 20px rgba(0,0,0,0.3),
          0 0 0 3px rgba(184, 134, 11, 0.4),
          inset 0 2px 4px rgba(255, 255, 255, 0.4);
        background: #fff;
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 
            0 8px 24px rgba(0,0,0,0.35),
            0 0 0 4px rgba(212, 175, 55, 0.5);
        }
      }

      .status-indicator {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 18px;
        height: 18px;
        background: #67C23A;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }
    }
    
    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .name-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 0;
        
        h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 900;
          color: #654321;
          font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.5px;
        }

        .verified-tag {
          background: #D4AF37 !important;
          border-color: #B8860B !important;
          color: #654321 !important;
          font-weight: 700;
        }
      }

      .title { 
        margin: 0; 
        font-size: 18px; 
        color: #8B4513;
        font-style: italic;
        font-family: 'Georgia', 'Times New Roman', serif;
      }
      
      .institution { 
        margin: 0; 
        color: #B8860B; 
        display: flex; 
        align-items: center; 
        gap: 6px;
        font-weight: 600;
        font-family: 'Georgia', 'Times New Roman', serif;
        
        :deep(.el-icon) {
          color: #D4AF37;
        }
      }

      .bio-preview {
        color: #654321;
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        max-height: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 8px;
      }
      
      .stats-section {
        display: flex;
        gap: 20px;
        margin-top: 12px;
        align-items: center;

        .stat-box {
          text-align: center;
          min-width: 80px;
          
          .value { 
            font-size: 28px; 
            font-weight: 900; 
            color: #654321;
            font-family: 'Georgia', 'Times New Roman', serif;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
          }
          
          .label { 
            font-size: 12px; 
            color: #8B4513; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            font-weight: 700;
            margin-top: 4px;
            font-family: 'Georgia', 'Times New Roman', serif;
          }
        }

        .stat-divider {
          width: 2px;
          height: 40px;
          background: linear-gradient(to bottom, 
            transparent 0%, 
            rgba(184, 134, 11, 0.5) 50%, 
            transparent 100%);
        }
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
    padding: 24px;
    
    h3 { 
      margin: 0 0 18px 0; 
      font-size: 18px; 
      font-weight: 900;
      color: #654321;
      font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 4px solid #D4AF37;
      padding-left: 12px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
      
      :deep(.el-icon) {
        color: #D4AF37;
        font-size: 20px;
      }
    }
    
    .bio-text {
      color: #654321;
      line-height: 1.8;
      font-size: 14px;
      margin-bottom: 20px;
      font-family: 'Georgia', 'Times New Roman', serif;
    }

    .info-group {
      margin-bottom: 24px;
      &:last-child { margin-bottom: 0; }

      label { 
        display: flex;
        align-items: center;
        gap: 6px;
        color: #8B4513; 
        font-size: 13px; 
        font-weight: 700;
        margin-bottom: 10px;
        font-family: 'Georgia', 'Times New Roman', serif;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        
        :deep(.el-icon) {
          color: #D4AF37;
        }
      }
      
      .tags-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .contact-row {
        color: #654321;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .co-authors-list {
      display: flex;
      flex-direction: column;
      gap: 15px;

      .co-author-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: rgba(212, 175, 55, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(184, 134, 11, 0.3);
        transition: all 0.3s ease;
        cursor: pointer;
        
        &:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: #D4AF37;
          transform: translateX(5px);
        }
        
        .info {
          .name { 
            font-weight: 700; 
            color: #654321; 
            font-size: 14px;
            font-family: 'Georgia', 'Times New Roman', serif;
          }
          .inst { 
            font-size: 12px; 
            color: #8B4513;
            font-style: italic;
          }
        }
      }
    }

    &.network-card {
      .network-chart-container {
        height: 400px;
        width: 100%;
        
        .network-chart {
          height: 100%;
          width: 100%;
        }
      }
    }
  }

  .content-card {
    padding: 24px;
    min-height: 500px;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
      border-bottom: 2px solid rgba(184, 134, 11, 0.3);
    }

    :deep(.el-tabs__item) {
      font-weight: 700;
      color: #8B4513;
      font-family: 'Georgia', 'Times New Roman', serif;
      
      &.is-active {
        color: #654321;
      }
    }

    :deep(.el-tabs__active-bar) {
      background-color: #D4AF37;
      height: 3px;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      color: #8B4513;
      font-size: 14px;
      font-weight: 600;
    }

    .paper-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      margin-bottom: 15px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 12px;
      border: 2px solid rgba(184, 134, 11, 0.3);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.7);
        border-color: #D4AF37;
        transform: translateX(5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .paper-main {
        flex: 1;
        padding-right: 20px;

        .paper-title {
          margin: 0 0 10px 0;
          font-size: 18px;
          font-weight: 700;
          color: #654321;
          cursor: pointer;
          font-family: 'Georgia', 'Times New Roman', serif;
          transition: color 0.3s ease;
          
          &:hover { 
            color: #D4AF37;
            text-shadow: 1px 1px 2px rgba(212, 175, 55, 0.3);
          }
        }

        .paper-meta {
          font-size: 13px;
          color: #8B4513;
          margin-bottom: 6px;
          font-style: italic;
          
          .journal { margin-right: 12px; }
          .year {
            font-weight: 600;
          }
        }

        .paper-authors {
          font-size: 13px;
          color: #B8860B;
          font-weight: 500;
        }
      }

      .paper-stats {
        .citation-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(135deg, 
            rgba(212, 175, 55, 0.2) 0%, 
            rgba(184, 134, 11, 0.15) 100%);
          color: #654321;
          padding: 10px 15px;
          border-radius: 10px;
          min-width: 60px;
          border: 2px solid rgba(184, 134, 11, 0.4);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);

          .count { 
            font-weight: 900; 
            font-size: 20px;
            font-family: 'Georgia', 'Times New Roman', serif;
          }
          .label { 
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
      }
    }
  }
}

.gothic-btn {
  background: #8B4513 !important;
  border: 2px solid #654321 !important;
  color: #fff !important;
  font-weight: 700 !important;
  font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif !important;
  letter-spacing: 1px !important;
  border-radius: 20px !important;
  padding: 10px 20px !important;
  transition: all 0.3s ease !important;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;

  &:hover {
    background: #654321 !important;
    border-color: #8B4513 !important;
    transform: translateY(-2px);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  &.followed {
    background: rgba(212, 175, 55, 0.2) !important;
    border-color: #D4AF37 !important;
    color: #654321 !important;
    
    &:hover {
      background: rgba(212, 175, 55, 0.3) !important;
    }
  }

  :deep(.el-icon) {
    margin-right: 4px;
  }
}

.gothic-select {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.3) inset;
    background-color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(212, 175, 55, 0.4);
    
    &:hover {
      border-color: #D4AF37;
    }
    
    &.is-focus {
      border-color: #B8860B;
      box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.5) inset;
    }
  }
  
  :deep(.el-input__inner) {
    color: #654321;
    font-weight: 600;
    font-family: 'Georgia', 'Times New Roman', serif;
  }
}

.field-tag {
  background: rgba(212, 175, 55, 0.15) !important;
  border: 1px solid rgba(184, 134, 11, 0.4) !important;
  color: #654321 !important;
  font-weight: 600 !important;
  font-family: 'Georgia', 'Times New Roman', serif !important;
  border-radius: 6px !important;
  padding: 4px 10px !important;
  
  &:hover {
    background: rgba(212, 175, 55, 0.25) !important;
    border-color: #D4AF37 !important;
  }
}

@media (max-width: 768px) {
  .scholar-header-card .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -50px;

    .info-section {
      .name-row { justify-content: center; }
      .institution { justify-content: center; }
      .action-buttons { justify-content: center; }
    }

    .stats-section {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}
</style>

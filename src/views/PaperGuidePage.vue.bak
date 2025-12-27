<template>
<!--  <div class="paper-guide-page">-->
<!--    <AppHeader />-->

<!--    <div class="page-content">-->
<!--      <div class="container">-->
<!--        <div class="guide-header">-->
<!--          <el-breadcrumb separator="/">-->
<!--            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>-->
<!--            <el-breadcrumb-item>论文导读</el-breadcrumb-item>-->
<!--          </el-breadcrumb>-->

<!--          <div class="header-info">-->
<!--            <h2>个性化论文导读</h2>-->
<!--            <p>基于您的身份和研究兴趣，为您推荐最相关的学术论文</p>-->
<!--          </div>-->

<!--          <div class="filter-bar">-->
<!--            <el-select v-model="selectedCategory" placeholder="选择领域" style="width: 150px;">-->
<!--              <el-option label="全部领域" value="" />-->
<!--              <el-option label="人工智能" value="ai" />-->
<!--              <el-option label="机器学习" value="ml" />-->
<!--              <el-option label="深度学习" value="dl" />-->
<!--              <el-option label="计算机视觉" value="cv" />-->
<!--              <el-option label="自然语言处理" value="nlp" />-->
<!--            </el-select>-->

<!--            <el-select v-model="selectedLevel" placeholder="选择难度" style="width: 120px;">-->
<!--              <el-option label="全部难度" value="" />-->
<!--              <el-option label="入门级" value="beginner" />-->
<!--              <el-option label="中级" value="intermediate" />-->
<!--              <el-option label="高级" value="advanced" />-->
<!--            </el-select>-->

<!--            <el-button type="primary" @click="refreshRecommendations">-->
<!--              <el-icon><Refresh /></el-icon>-->
<!--              刷新推荐-->
<!--            </el-button>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; 推荐理由说明 &ndash;&gt;-->
<!--        <el-card class="recommendation-info" v-if="userSettings.userRole">-->
<!--          <div class="info-content">-->
<!--            <el-icon class="info-icon"><InfoFilled /></el-icon>-->
<!--            <div class="info-text">-->
<!--              <h4>为什么推荐这些论文？</h4>-->
<!--              <p>-->
<!--                基于您的身份（{{ getRoleDisplayName(userSettings.userRole) }}）-->
<!--                和研究兴趣（{{ userSettings.researchFields.join('、') || '未设置' }}），-->
<!--                我们为您精选了以下论文。您可以在-->
<!--                <router-link to="/settings">个人设置</router-link>-->
<!--                中调整推荐偏好。-->
<!--              </p>-->
<!--            </div>-->
<!--          </div>-->
<!--        </el-card>-->

<!--        &lt;!&ndash; 论文推荐列表 &ndash;&gt;-->
<!--        <div class="recommendations-section">-->
<!--          <div class="section-header">-->
<!--            <h3>今日推荐</h3>-->
<!--            <el-tag type="success" size="small">{{ filteredRecommendations.length }} 篇论文</el-tag>-->
<!--          </div>-->

<!--          <div class="recommendations-grid">-->
<!--            <div-->
<!--              v-for="paper in filteredRecommendations"-->
<!--              :key="paper.id"-->
<!--              class="recommendation-card"-->
<!--            >-->
<!--              <el-card>-->
<!--                <div class="card-header">-->
<!--                  <div class="recommendation-badge">-->
<!--                    <el-tag :type="getRecommendationTagType(paper.recommendationReason)" size="small">-->
<!--                      {{ paper.recommendationReason }}-->
<!--                    </el-tag>-->
<!--                    <span class="match-score">匹配度: {{ paper.matchScore }}%</span>-->
<!--                  </div>-->
<!--                  <el-button size="small" text @click="toggleBookmark(paper)">-->
<!--                    <el-icon :class="{ bookmarked: paper.isBookmarked }">-->
<!--                      <Star />-->
<!--                    </el-icon>-->
<!--                  </el-button>-->
<!--                </div>-->

<!--                <div class="paper-content">-->
<!--                  <h4 class="paper-title">-->
<!--                    <router-link :to="`/paper/${paper.id}`">{{ paper.title }}</router-link>-->
<!--                  </h4>-->

<!--                  <div class="paper-meta">-->
<!--                    <span class="authors">{{ paper.authors.slice(0, 3).map(a => a.name).join(', ') }}</span>-->
<!--                    <span class="venue">{{ paper.journal }}</span>-->
<!--                    <span class="year">{{ new Date(paper.publishDate).getFullYear() }}</span>-->
<!--                  </div>-->

<!--                  <p class="paper-abstract">{{ paper.abstract.substring(0, 200) }}...</p>-->

<!--                  <div class="paper-tags">-->
<!--                    <el-tag-->
<!--                      v-for="keyword in paper.keywords.slice(0, 3)"-->
<!--                      :key="keyword"-->
<!--                      size="small"-->
<!--                      effect="plain"-->
<!--                    >-->
<!--                      {{ keyword }}-->
<!--                    </el-tag>-->
<!--                  </div>-->

<!--                  <div class="recommendation-explanation">-->
<!--                    <el-icon><InfoFilled /></el-icon>-->
<!--                    <span>{{ paper.explanation }}</span>-->
<!--                  </div>-->
<!--                </div>-->

<!--                <div class="card-actions">-->
<!--                  <el-button size="small" @click="readPaper(paper)">-->
<!--                    <el-icon><View /></el-icon>-->
<!--                    阅读论文-->
<!--                  </el-button>-->
<!--                  <el-button size="small" @click="addToReadingList(paper)">-->
<!--                    <el-icon><Plus /></el-icon>-->
<!--                    加入待读-->
<!--                  </el-button>-->
<!--                  <el-button size="small" @click="showSimilarPapers(paper)">-->
<!--                    <el-icon><Connection /></el-icon>-->
<!--                    相似论文-->
<!--                  </el-button>-->
<!--                </div>-->
<!--              </el-card>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; 加载更多 &ndash;&gt;-->
<!--          <div class="load-more-section" v-if="filteredRecommendations.length >= 6">-->
<!--            <el-button @click="loadMoreRecommendations" :loading="loading">-->
<!--              加载更多推荐-->
<!--            </el-button>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; 阅读历史和统计 &ndash;&gt;-->
<!--        <el-row :gutter="24" class="stats-section">-->
<!--          <el-col :lg="12" :md="24">-->
<!--            <el-card class="reading-stats">-->
<!--              <template #header>-->
<!--                <h4>阅读统计</h4>-->
<!--              </template>-->
<!--              <div class="stats-grid">-->
<!--                <div class="stat-item">-->
<!--                  <span class="stat-value">{{ readingStats.totalRead }}</span>-->
<!--                  <span class="stat-label">已读论文</span>-->
<!--                </div>-->
<!--                <div class="stat-item">-->
<!--                  <span class="stat-value">{{ readingStats.weeklyRead }}</span>-->
<!--                  <span class="stat-label">本周阅读</span>-->
<!--                </div>-->
<!--                <div class="stat-item">-->
<!--                  <span class="stat-value">{{ readingStats.bookmarked }}</span>-->
<!--                  <span class="stat-label">收藏论文</span>-->
<!--                </div>-->
<!--                <div class="stat-item">-->
<!--                  <span class="stat-value">{{ readingStats.avgTime }}</span>-->
<!--                  <span class="stat-label">平均阅读时间</span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </el-card>-->
<!--          </el-col>-->

<!--          <el-col :lg="12" :md="24">-->
<!--            <el-card class="interest-evolution">-->
<!--              <template #header>-->
<!--                <h4>兴趣演化</h4>-->
<!--              </template>-->
<!--              <div class="interest-tags">-->
<!--                <el-tag-->
<!--                  v-for="interest in topInterests"-->
<!--                  :key="interest.name"-->
<!--                  :type="getInterestTagType(interest.trend)"-->
<!--                  class="interest-tag"-->
<!--                >-->
<!--                  {{ interest.name }}-->
<!--                  <span class="trend-indicator">-->
<!--                    {{ interest.trend > 0 ? '↗' : interest.trend < 0 ? '↘' : '→' }}-->
<!--                  </span>-->
<!--                </el-tag>-->
<!--              </div>-->
<!--            </el-card>-->
<!--          </el-col>-->
<!--        </el-row>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
</template>

<script setup lang="ts">
// import { ref, computed, onMounted } from 'vue'
// import { ElMessage } from 'element-plus'
// import {
//   Refresh,
//   InfoFilled,
//   Star,
//   View,
//   Plus,
//   Connection
// } from '@element-plus/icons-vue'
// import AppHeader from '@/components/AppHeader.vue'
// import { useSettingsStore } from '../stores/settings'
// import type { Paper } from '../types/paper'
//
// const settingsStore = useSettingsStore()
// const selectedCategory = ref('')
// const selectedLevel = ref('')
// const loading = ref(false)
//
// const userSettings = computed(() => settingsStore.settings)
//
// const recommendations = ref<(Paper & {
//   recommendationReason: string
//   matchScore: number
//   explanation: string
//   isBookmarked: boolean
// })[]>([
//   {
//     id: 'rec-1',
//     title: 'Attention Is All You Need: A Comprehensive Survey of Transformer Architecture',
//     abstract: 'This paper presents a comprehensive survey of the Transformer architecture, which has revolutionized natural language processing and beyond. We provide detailed analysis of attention mechanisms and their applications.',
//     authors: [
//       { id: 'author1', name: 'Ashish Vaswani', institution: 'Google Brain' },
//       { id: 'author2', name: 'Noam Shazeer', institution: 'Google Brain' }
//     ],
//     publishDate: '2024-01-15',
//     journal: 'Nature Machine Intelligence',
//     fields: ['Natural Language Processing', 'Deep Learning'],
//     citations: 1250,
//     favorites: 89,
//     isFavorited: false,
//     keywords: ['Transformer', 'Attention', 'Deep Learning', 'NLP'],
//     recommendationReason: '领域匹配',
//     matchScore: 95,
//     explanation: '基于您对自然语言处理和深度学习的兴趣推荐',
//     isBookmarked: false
//   },
//   {
//     id: 'rec-2',
//     title: 'Federated Learning: Challenges, Methods, and Future Directions for Beginners',
//     abstract: 'An introductory guide to federated learning, covering fundamental concepts, key challenges, and practical implementation strategies for newcomers to the field.',
//     authors: [
//       { id: 'author3', name: 'Peter McMahan', institution: 'Google Research' },
//       { id: 'author4', name: 'Daniel Ramage', institution: 'Google Research' }
//     ],
//     publishDate: '2024-02-20',
//     journal: 'Journal of Machine Learning Research',
//     fields: ['Machine Learning', 'Privacy'],
//     citations: 890,
//     favorites: 67,
//     isFavorited: true,
//     keywords: ['Federated Learning', 'Privacy', 'Distributed Systems'],
//     recommendationReason: '难度适配',
//     matchScore: 88,
//     explanation: '适合您当前的学习阶段，内容由浅入深',
//     isBookmarked: true
//   },
//   {
//     id: 'rec-3',
//     title: 'Computer Vision in Healthcare: Recent Advances and Clinical Applications',
//     abstract: 'This review examines recent breakthroughs in computer vision applications for healthcare, including medical imaging, diagnosis assistance, and treatment planning.',
//     authors: [
//       { id: 'author5', name: 'Li Zhang', institution: 'Stanford Medicine' },
//       { id: 'author6', name: 'Chen Wang', institution: 'MIT CSAIL' }
//     ],
//     publishDate: '2024-03-10',
//     journal: 'Nature Medicine',
//     fields: ['Computer Vision', 'Healthcare'],
//     citations: 567,
//     favorites: 34,
//     isFavorited: false,
//     keywords: ['Computer Vision', 'Healthcare', 'Medical Imaging'],
//     recommendationReason: '交叉领域',
//     matchScore: 82,
//     explanation: '结合了您感兴趣的计算机视觉和新兴应用领域',
//     isBookmarked: false
//   }
// ])
//
// const readingStats = ref({
//   totalRead: 45,
//   weeklyRead: 8,
//   bookmarked: 12,
//   avgTime: '25分钟'
// })
//
// const topInterests = ref([
//   { name: '自然语言处理', trend: 1 },
//   { name: '深度学习', trend: 0 },
//   { name: '计算机视觉', trend: -1 },
//   { name: '机器学习', trend: 1 }
// ])
//
// const filteredRecommendations = computed(() => {
//   return recommendations.value.filter(paper => {
//     if (selectedCategory.value && !paper.keywords.some(k =>
//       k.toLowerCase().includes(selectedCategory.value))) {
//       return false
//     }
//     return true
//   })
// })
//
// const getRoleDisplayName = (role: string) => {
//   const roleMap: Record<string, string> = {
//     undergraduate: '本科生',
//     graduate: '研究生',
//     phd: '博士生',
//     postdoc: '博士后',
//     assistant_professor: '助理教授',
//     associate_professor: '副教授',
//     professor: '教授',
//     researcher: '研究员',
//     industry: '行业从业者',
//     other: '其他'
//   }
//   return roleMap[role] || role
// }
//
// const getRecommendationTagType = (reason: string) => {
//   const typeMap: Record<string, string> = {
//     '领域匹配': 'primary',
//     '难度适配': 'success',
//     '交叉领域': 'warning',
//     '热门推荐': 'danger',
//     '相似兴趣': 'info'
//   }
//   return typeMap[reason] || ''
// }
//
// const getInterestTagType = (trend: number) => {
//   if (trend > 0) return 'success'
//   if (trend < 0) return 'warning'
//   return 'info'
// }
//
// const refreshRecommendations = () => {
//   loading.value = true
//   setTimeout(() => {
//     // 模拟刷新推荐
//     ElMessage.success('推荐已更新')
//     loading.value = false
//   }, 1000)
// }
//
// const toggleBookmark = (paper: any) => {
//   paper.isBookmarked = !paper.isBookmarked
//   ElMessage.success(paper.isBookmarked ? '已添加到收藏' : '已取消收藏')
// }
//
// const readPaper = (paper: any) => {
//   // 跳转到论文详情页
//   window.open(`/paper/${paper.id}`, '_blank')
// }
//
// const addToReadingList = (_paper: any) => {
//   ElMessage.success('已添加到待读列表')
// }
//
// const showSimilarPapers = (_paper: any) => {
//   ElMessage.info('正在查找相似论文...')
// }
//
// const loadMoreRecommendations = () => {
//   loading.value = true
//   setTimeout(() => {
//     loading.value = false
//   }, 1000)
// }
//
// onMounted(() => {
//   settingsStore.loadSettings()
// })
</script>

<style scoped lang="scss">
//.paper-guide-page {
//  min-height: 100vh;
//  background-color: #f5f5f5;
//
//  .guide-header {
//    margin-bottom: 24px;
//
//    .header-info {
//      margin: 16px 0;
//
//      h2 {
//        margin: 0 0 8px 0;
//        font-size: 24px;
//        font-weight: 600;
//        color: #333;
//      }
//
//      p {
//        margin: 0;
//        color: #666;
//        font-size: 14px;
//      }
//    }
//
//    .filter-bar {
//      display: flex;
//      gap: 12px;
//      align-items: center;
//      margin-top: 16px;
//    }
//  }
//
//  .recommendation-info {
//    margin-bottom: 24px;
//
//    .info-content {
//      display: flex;
//      align-items: flex-start;
//      gap: 12px;
//
//      .info-icon {
//        color: var(--el-color-primary);
//        font-size: 20px;
//        margin-top: 2px;
//      }
//
//      .info-text {
//        flex: 1;
//
//        h4 {
//          margin: 0 0 8px 0;
//          font-size: 16px;
//          font-weight: 500;
//        }
//
//        p {
//          margin: 0;
//          color: #666;
//          line-height: 1.5;
//
//          a {
//            color: var(--el-color-primary);
//            text-decoration: none;
//
//            &:hover {
//              text-decoration: underline;
//            }
//          }
//        }
//      }
//    }
//  }
//
//  .recommendations-section {
//    margin-bottom: 32px;
//
//    .section-header {
//      display: flex;
//      justify-content: space-between;
//      align-items: center;
//      margin-bottom: 16px;
//
//      h3 {
//        margin: 0;
//        font-size: 18px;
//        font-weight: 600;
//      }
//    }
//
//    .recommendations-grid {
//      display: grid;
//      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
//      gap: 20px;
//
//      .recommendation-card {
//        .el-card {
//          height: 100%;
//          transition: transform 0.2s, box-shadow 0.2s;
//
//          &:hover {
//            transform: translateY(-2px);
//            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
//          }
//        }
//
//        .card-header {
//          display: flex;
//          justify-content: space-between;
//          align-items: flex-start;
//          margin-bottom: 12px;
//
//          .recommendation-badge {
//            display: flex;
//            flex-direction: column;
//            gap: 4px;
//
//            .match-score {
//              font-size: 12px;
//              color: #666;
//            }
//          }
//
//          .bookmarked {
//            color: #f39c12;
//          }
//        }
//
//        .paper-content {
//          .paper-title {
//            margin: 0 0 8px 0;
//            font-size: 16px;
//            font-weight: 600;
//            line-height: 1.4;
//
//            a {
//              color: #333;
//              text-decoration: none;
//
//              &:hover {
//                color: var(--el-color-primary);
//              }
//            }
//          }
//
//          .paper-meta {
//            display: flex;
//            gap: 12px;
//            margin-bottom: 12px;
//            font-size: 12px;
//            color: #666;
//
//            .authors {
//              font-weight: 500;
//            }
//          }
//
//          .paper-abstract {
//            margin: 12px 0;
//            color: #666;
//            line-height: 1.5;
//            font-size: 14px;
//          }
//
//          .paper-tags {
//            margin: 12px 0;
//            display: flex;
//            gap: 6px;
//            flex-wrap: wrap;
//          }
//
//          .recommendation-explanation {
//            display: flex;
//            align-items: center;
//            gap: 6px;
//            margin-top: 12px;
//            padding: 8px;
//            background-color: #f8f9fa;
//            border-radius: 4px;
//            font-size: 12px;
//            color: #666;
//
//            .el-icon {
//              color: var(--el-color-warning);
//            }
//          }
//        }
//
//        .card-actions {
//          display: flex;
//          gap: 8px;
//          margin-top: 16px;
//          padding-top: 16px;
//          border-top: 1px solid #f0f0f0;
//        }
//      }
//    }
//
//    .load-more-section {
//      text-align: center;
//      margin-top: 24px;
//    }
//  }
//
//  .stats-section {
//    .reading-stats {
//      .stats-grid {
//        display: grid;
//        grid-template-columns: repeat(2, 1fr);
//        gap: 16px;
//
//        .stat-item {
//          text-align: center;
//
//          .stat-value {
//            display: block;
//            font-size: 24px;
//            font-weight: 600;
//            color: var(--el-color-primary);
//            margin-bottom: 4px;
//          }
//
//          .stat-label {
//            font-size: 12px;
//            color: #666;
//          }
//        }
//      }
//    }
//
//    .interest-evolution {
//      .interest-tags {
//        display: flex;
//        flex-wrap: wrap;
//        gap: 8px;
//
//        .interest-tag {
//          display: flex;
//          align-items: center;
//          gap: 4px;
//
//          .trend-indicator {
//            font-weight: bold;
//          }
//        }
//      }
//    }
//  }
//}
//
//@media (max-width: 768px) {
//  .paper-guide-page {
//    .recommendations-grid {
//      grid-template-columns: 1fr;
//    }
//
//    .filter-bar {
//      flex-direction: column;
//      align-items: stretch;
//
//      .el-select {
//        width: 100% !important;
//      }
//    }
//  }
//}
</style>

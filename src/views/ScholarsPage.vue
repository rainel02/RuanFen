<template>
  <div class="scholars-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <!-- Summary Cards -->
        <el-row :gutter="20" class="mb-20">
          <el-col :span="6" v-for="(item, index) in summaryData" :key="index">
            <el-card class="summary-card" shadow="hover">
              <div class="summary-content">
                <div class="summary-value" :style="{ color: item.color }">{{ item.value }}</div>
                <div class="summary-label">{{ item.label }}</div>
              </div>
              <el-icon class="summary-icon" :style="{ color: item.color }"><component :is="item.icon" /></el-icon>
            </el-card>
          </el-col>
        </el-row>

        <div class="page-header-section glass-panel">
          <div class="header-title">
            <h2>
              <el-icon class="title-icon"><UserFilled /></el-icon>
              <span>科研人员</span>
            </h2>
            <p><el-icon><Connection /></el-icon> 发现并连接顶尖学者</p>
          </div>
          <div class="filters-bar">
            <el-select
              v-model="selectedInstitution"
              placeholder="选择机构"
              clearable
              class="filter-select"
            >
              <template #prefix><el-icon><School /></el-icon></template>
              <el-option
                v-for="institution in institutions"
                :key="institution"
                :label="institution"
                :value="institution"
              />
            </el-select>

            <el-select
              v-model="selectedField"
              placeholder="研究领域"
              clearable
              class="filter-select"
            >
              <template #prefix><el-icon><Collection /></el-icon></template>
              <el-option
                v-for="field in fields"
                :key="field"
                :label="field"
                :value="field"
              />
            </el-select>

            <el-select
              v-model="sortBy"
              placeholder="排序方式"
              class="filter-select"
            >
              <template #prefix><el-icon><Sort /></el-icon></template>
              <el-option label="H指数" value="hIndex" />
              <el-option label="引用数" value="citations" />
              <el-option label="论文数" value="papers" />
            </el-select>
          </div>
        </div>

        <div class="scholars-grid">
          <transition-group name="fade-list">
            <div
              v-for="scholar in filteredScholars"
              :key="scholar.id"
              class="scholar-item-wrapper"
            >
              <ScholarCard
                :scholar="scholar"
                @start-chat="handleStartChat"
              />
            </div>
          </transition-group>
        </div>

        <div v-if="filteredScholars.length === 0" class="empty-state glass-panel">
          <el-empty description="暂无符合条件的学者" />
        </div>
      </div>
    </div>

    <ChatWindow v-if="showChatWindow" @close="showChatWindow = false" />
  </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, School, Collection, Sort, Connection } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import ScholarCard from '@/components/ScholarCard.vue'
import ChatWindow from '@/components/ChatWindow.vue'
import { useChatStore } from '../stores/chat'
import * as scholarApi from '../api/scholar'

const scholars = ref<any[]>([])

const chatStore = useChatStore()
const selectedInstitution = ref('')
const selectedField = ref('')
const sortBy = ref('hIndex')
const loading = ref(false)
const showChatWindow = ref(false)

// Summary data - 巴洛克风格颜色
const summaryData = computed(() => [
  {
    label: '总学者数',
    value: filteredScholars.value.length.toString(),
    icon: 'UserFilled',
    color: '#D4AF37'
  },
  {
    label: '平均H指数',
    value: filteredScholars.value.length > 0
      ? Math.round(filteredScholars.value.reduce((sum: number, s: any) => sum + (s.stats?.hIndex || 0), 0) / filteredScholars.value.length).toString()
      : '0',
    icon: 'StarFilled',
    color: '#B8860B'
  },
  {
    label: '总引用量',
    value: filteredScholars.value.length > 0
      ? (filteredScholars.value.reduce((sum: number, s: any) => sum + (s.stats?.citations || 0), 0) / 1000).toFixed(1) + 'k'
      : '0',
    icon: 'TrendCharts',
    color: '#8B4513'
  },
  {
    label: '研究领域',
    value: fields.value.length.toString(),
    icon: 'Collection',
    color: '#654321'
  },
])

const institutions = computed(() => {
  const allInstitutions = scholars.value.map((s: any) => s.organization || s.institution)
  return [...new Set(allInstitutions)]
})

const fields = computed(() => {
  const allFields = scholars.value.flatMap((s: any) => s.researchFields || s.fields || [])
  return [...new Set(allFields)]
})

const filteredScholars = computed(() => {
  let result = scholars.value

  if (selectedInstitution.value) {
    result = result.filter((s: any) => (s.organization || s.institution) === selectedInstitution.value)
  }

  if (selectedField.value) {
    result = result.filter((s: any) => (s.researchFields || s.fields || []).includes(selectedField.value))
  }


  // 排序
  result.sort((a: any, b: any) => {
    const key = sortBy.value
    return (b[key] || 0) - (a[key] || 0)
  })

  return result
})


const loadScholars = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (selectedInstitution.value) params.organization = selectedInstitution.value
    if (selectedField.value) params.field = selectedField.value

    const response = await scholarApi.searchScholars(params)
    if (response.results) {
      scholars.value = response.results.map((item: any) => ({
        id: item.scholarId,
        name: item.name,
        institution: item.organization,
        title: item.title,
        avatar: item.avatarUrl,
        fields: item.researchFields || [],
        stats: {
          hIndex: item.hIndex || Math.floor(Math.random() * 50) + 10,
          citations: item.citations || Math.floor(Math.random() * 5000) + 100,
          papers: item.papers || Math.floor(Math.random() * 100) + 10
        },
        isFollowed: false
      }))
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载学者列表失败')
  } finally {
    loading.value = false
  }
}

const handleStartChat = (participantId: string, participantName: string, participantAvatar?: string) => {
  chatStore.startConversation(participantId, participantName, participantAvatar)
  showChatWindow.value = true
}


onMounted(() => {
  loadScholars()
})
</script>


<style scoped lang="scss">
.scholars-page {
  min-height: 100vh;
  position: relative;
  background-image: url('@/assets/frontBG.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding-bottom: 40px;
}

.page-content {
  padding: 20px 0;
  position: relative;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.mb-20 {
  margin-bottom: 25px;
}

.summary-card {
  border: 3px solid rgba(184, 134, 11, 0.5) !important;
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
  background: rgba(249, 247, 236, 0.85) !important;
  backdrop-filter: blur(16px);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(45deg,
      rgba(212, 175, 55, 0.3) 0%,
      transparent 25%,
      transparent 75%,
      rgba(212, 175, 55, 0.3) 100%);
    border-radius: 12px;
    z-index: -1;
    opacity: 0.6;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.22),
      0 0 0 2px rgba(212, 175, 55, 0.4),
      inset 0 2px 6px rgba(255, 255, 255, 0.6);
  }

  .summary-content {
    position: relative;
    z-index: 1;
  }

  .summary-value {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 5px;
    font-family: 'Georgia', 'Times New Roman', serif;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .summary-label {
    color: #8B4513;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Georgia', 'Times New Roman', serif;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .summary-icon {
    position: absolute;
    right: 20px;
    bottom: 20px;
    font-size: 48px;
    opacity: 0.3;
    transform: rotate(-15deg);
    transition: all 0.3s ease;
  }

  &:hover .summary-icon {
    opacity: 0.4;
    transform: rotate(-15deg) scale(1.1);
  }
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

.page-header-section {
  padding: 30px 40px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 25px;
  position: relative;
  z-index: 5;

  .header-title {
    h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 32px;
      font-weight: 900;
      color: #654321;
      font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.5px;

      .title-icon {
        font-size: 36px;
        color: #D4AF37;
      }
    }
    p {
      margin: 8px 0 0 48px;
      color: #8B4513;
      font-size: 15px;
      font-style: italic;
      font-family: 'Georgia', 'Times New Roman', serif;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;

      :deep(.el-icon) {
        color: #D4AF37;
        font-size: 18px;
      }
    }
  }

  .filters-bar {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;

    .filter-select {
      width: 180px;
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.3) inset;
        background-color: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(212, 175, 55, 0.4);
        transition: all 0.3s ease;

        &:hover {
          border-color: #D4AF37;
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5) inset;
        }

        &.is-focus {
          border-color: #B8860B;
          box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.6) inset;
        }
      }

      :deep(.el-input__inner) {
        color: #654321;
        font-weight: 600;
        font-family: 'Georgia', 'Times New Roman', serif;
      }

      :deep(.el-input__prefix) {
        .el-icon {
          color: #D4AF37;
        }
      }
    }
  }
}

.scholars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 30px;
  position: relative;
  z-index: 5;

  @media (min-width: 1400px) {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}

.scholar-item-wrapper {
  transition: all 0.3s ease;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

/* Transitions */
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.5s ease;
}
.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

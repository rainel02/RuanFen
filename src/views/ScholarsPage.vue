<template>
  <div class="scholars-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div class="page-header-section">
          <h2>科研人员</h2>
          <div class="filters-bar">
            <el-select
              v-model="selectedInstitution"
              placeholder="选择机构"
              clearable
              style="width: 200px; margin-right: 12px;"
            >
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
              style="width: 200px; margin-right: 12px;"
            >
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
              style="width: 150px;"
            >
              <el-option label="H指数" value="hIndex" />
              <el-option label="引用数" value="citations" />
              <el-option label="论文数" value="papers" />
            </el-select>
          </div>
        </div>

        <div class="scholars-grid">
          <div
            v-for="scholar in filteredScholars"
            :key="scholar.id"
            class="scholar-item"
          >
            <ScholarCard 
              :scholar="scholar" 
              @start-chat="handleStartChat"
            />
          </div>
        </div>

        <div v-if="filteredScholars.length === 0" class="empty-state">
          <el-empty description="暂无符合条件的学者" />
        </div>

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/AppHeader.vue'
import ScholarCard from '@/components/ScholarCard.vue'
import ChatWindow from '@/components/ChatWindow.vue'
import { useChatStore } from '../stores/chat'
import * as scholarApi from '../api/scholar'

const scholars = ref<any[]>([])
const chatStore = useChatStore()
const showChatWindow = ref(false)
const selectedInstitution = ref('')
const selectedField = ref('')
const sortBy = ref('hIndex')
const loading = ref(false)

const institutions = computed(() => {
  const allInstitutions = scholars.value.map((s: any) => s.organization || s.institution)
  return [...new Set(allInstitutions)]
})

const fields = computed(() => {
  const allFields = scholars.value.flatMap((s: any) => s.researchFields || s.fields || [])
  return [...new Set(allFields)]
})

const filteredScholars = computed(() => {
  let result = [...scholars.value]

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
        hIndex: 0,
        citations: 0,
        papers: 0,
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

const handleCloseChatWindow = () => {
  showChatWindow.value = false
}

onMounted(() => {
  loadScholars()
})
</script>


<style scoped lang="scss">
@import "../styles/main.scss";
.scholars-page {
  min-height: 100vh;
}

.page-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .filters-bar {
    display: flex;
    align-items: center;

    @include mobile {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
  }
}

.scholars-grid {
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
    grid-template-columns: repeat(3, 1fr);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}
</style>

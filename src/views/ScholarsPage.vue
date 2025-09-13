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
import { ref, computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ScholarCard from '@/components/ScholarCard.vue'
import ChatWindow from '@/components/ChatWindow.vue'
import { mockScholars } from '../mock/scholars'
import { useChatStore } from '../stores/chat'

const scholars = ref(mockScholars)
const chatStore = useChatStore()
const showChatWindow = ref(false)
const selectedInstitution = ref('')
const selectedField = ref('')
const sortBy = ref('hIndex')

const institutions = computed(() => {
  const allInstitutions = scholars.value.map(s => s.institution)
  return [...new Set(allInstitutions)]
})

const fields = computed(() => {
  const allFields = scholars.value.flatMap(s => s.fields)
  return [...new Set(allFields)]
})

const filteredScholars = computed(() => {
  let result = [...scholars.value]

  if (selectedInstitution.value) {
    result = result.filter(s => s.institution === selectedInstitution.value)
  }

  if (selectedField.value) {
    result = result.filter(s => s.fields.includes(selectedField.value))
  }

  // 排序
  result.sort((a, b) => {
    const key = sortBy.value as keyof typeof a
    return (b[key] as number) - (a[key] as number)
  })

  return result
})
</script>
const handleStartChat = (participantId: string, participantName: string, participantAvatar?: string) => {
  chatStore.startConversation(participantId, participantName, participantAvatar)
  showChatWindow.value = true
}

const handleCloseChatWindow = () => {
  showChatWindow.value = false
}


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

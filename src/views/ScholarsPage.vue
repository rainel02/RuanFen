<template>
  <div class="scholars-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div class="page-header-section glass-panel">
          <div class="header-title">
            <h2><el-icon><UserFilled /></el-icon> 科研人员</h2>
            <p>发现并连接顶尖学者</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ScholarCard from '@/components/ScholarCard.vue'
import { mockScholars } from '../mock/scholars'
import { useChatStore } from '../stores/chat'
import { UserFilled, School, Collection, Sort } from '@element-plus/icons-vue'

const router = useRouter()
const scholars = ref(mockScholars)
const chatStore = useChatStore()
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
  let result = scholars.value

  if (selectedInstitution.value) {
    result = result.filter(s => s.institution === selectedInstitution.value)
  }

  if (selectedField.value) {
    result = result.filter(s => s.fields.includes(selectedField.value))
  }

  result = [...result].sort((a, b) => {
    if (sortBy.value === 'hIndex') return b.stats.hIndex - a.stats.hIndex
    if (sortBy.value === 'citations') return b.stats.citations - a.stats.citations
    if (sortBy.value === 'papers') return b.stats.papers - a.stats.papers
    return 0
  })

  return result
})

const handleStartChat = (scholarId: string) => {
  // In a real app, we would create a conversation or get existing one
  // For now, just navigate to chat page
  router.push('/chat')
}
</script>

<style scoped lang="scss">
.scholars-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: 
    radial-gradient(at 0% 0%, rgba(64, 158, 255, 0.1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(103, 194, 58, 0.1) 0px, transparent 50%);
  background-attachment: fixed;
}

.page-content {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.page-header-section {
  padding: 25px 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;

  .header-title {
    h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      color: #303133;
    }
    p {
      margin: 5px 0 0 34px;
      color: #909399;
      font-size: 14px;
    }
  }

  .filters-bar {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;

    .filter-select {
      width: 180px;
      :deep(.el-input__wrapper) {
        border-radius: 20px;
        box-shadow: 0 0 0 1px #dcdfe6 inset;
        background-color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

.scholars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
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

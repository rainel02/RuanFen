<template>
  <div class="filter-sidebar">
    <div class="filter-section">
      <h4 class="filter-title">学科分类</h4>
      <el-checkbox-group
        v-model="selectedFields"
        @change="handleFieldChange"
      >
        <el-checkbox
          v-for="field in fields"
          :key="field"
          :value="field"
          class="field-checkbox"
        >
          {{ field }}
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <div class="filter-section">
      <h4 class="filter-title">时间范围</h4>
      <el-radio-group
        v-model="timeRange"
        @change="handleTimeChange"
      >
        <el-radio value="all">全部时间</el-radio>
        <el-radio value="year">最近一年</el-radio>
        <el-radio value="month">最近一月</el-radio>
        <el-radio value="week">最近一周</el-radio>
      </el-radio-group>
    </div>

    <div class="filter-section">
      <h4 class="filter-title">排序方式</h4>
      <el-select
        v-model="sortBy"
        @change="handleSortChange"
        style="width: 100%"
      >
        <el-option label="最新发表" value="latest" />
        <el-option label="引用数量" value="citations" />
        <el-option label="收藏数量" value="favorites" />
      </el-select>
    </div>

    <div class="filter-actions">
      <el-button @click="clearFilters" size="small">
        清空筛选
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePapersStore } from '../stores/papers'

const papersStore = usePapersStore()

const fields = [
  '计算机科学与技术',
  '人工智能',
  '机器学习',
  '深度学习',
  '计算机视觉',
  '自然语言处理',
  '数据挖掘',
  '软件工程',
  '网络安全',
  '量子计算',
  '生物信息学',
  '医学信息学'
]

const selectedFields = ref(papersStore.selectedFields)
const timeRange = ref(papersStore.timeRange)
const sortBy = ref(papersStore.sortBy)

const handleFieldChange = () => {
  papersStore.setFilters({ fields: selectedFields.value })
}

const handleTimeChange = () => {
  papersStore.setFilters({ timeRange: timeRange.value })
}

const handleSortChange = () => {
  papersStore.setFilters({ sortBy: sortBy.value })
}

const clearFilters = () => {
  selectedFields.value = []
  timeRange.value = 'all'
  sortBy.value = 'latest'
  papersStore.setFilters({
    fields: [],
    timeRange: 'all',
    sortBy: 'latest'
  })
}
</script>

<style scoped lang="scss">
.filter-sidebar {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-light);
  height: fit-content;

  .filter-section {
    margin-bottom: 24px;

    &:last-of-type {
      margin-bottom: 16px;
    }
  }

  .filter-title {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color);
  }

  .field-checkbox {
    display: block;
    margin-bottom: 8px;

    :deep(.el-checkbox__label) {
      font-size: 13px;
      color: var(--text-color);
    }
  }

  :deep(.el-radio-group) {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .el-radio {
      margin: 0;

      .el-radio__label {
        font-size: 13px;
      }
    }
  }

  .filter-actions {
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }
}
</style>

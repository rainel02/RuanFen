<template>
  <div class="filter-sidebar">
    <div class="sidebar-header">
      <h3><el-icon><Filter /></el-icon> 筛选条件</h3>
      <el-button link type="primary" size="small" @click="clearFilters">清空</el-button>
    </div>

    <div class="filter-group">
      <h4 class="group-title">学科分类</h4>
      <div class="filter-content scrollable">
        <el-checkbox-group v-model="selectedFields" @change="handleFieldChange">
          <div v-for="field in fields" :key="field" class="checkbox-item">
            <el-checkbox :label="field" :value="field" />
          </div>
        </el-checkbox-group>
      </div>
    </div>

    <div class="filter-divider"></div>

    <div class="filter-group">
      <h4 class="group-title">时间范围</h4>
      <div class="filter-content">
        <el-radio-group v-model="timeRange" @change="handleTimeChange" class="vertical-radio">
          <el-radio label="all" value="all">全部时间</el-radio>
          <el-radio label="year" value="year">最近一年</el-radio>
          <el-radio label="month" value="month">最近一月</el-radio>
          <el-radio label="week" value="week">最近一周</el-radio>
        </el-radio-group>
      </div>
    </div>

    <div class="filter-divider"></div>

    <div class="filter-group">
      <h4 class="group-title">排序方式</h4>
      <el-select
        v-model="sortBy"
        @change="handleSortChange"
        style="width: 100%"
        class="custom-select"
      >
        <el-option label="最新发表" value="latest" />
        <el-option label="引用数量" value="citations" />
        <el-option label="收藏数量" value="favorites" />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePapersStore } from '../stores/papers'
import { Filter } from '@element-plus/icons-vue'

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
  padding: 20px;
  color: #303133;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.filter-group {
  margin-bottom: 15px;

  .group-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #606266;
  }

  .filter-content {
    &.scrollable {
      max-height: 200px;
      overflow-y: auto;
      padding-right: 5px;
      
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 2px;
      }
    }
  }
}

.checkbox-item {
  margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
}

.vertical-radio {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.filter-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 20px 0;
}

.custom-select {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
  }
}
</style>

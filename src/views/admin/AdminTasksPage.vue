<template>
  <div class="admin-tasks-page">
    <AppHeader />
    
    <!-- Vanta.js GLOBE 背景 -->
    <div id="vanta-globe-tasks-bg" class="vanta-background"></div>
    <div class="page-content">
      <div class="container">
        <h1>系统任务</h1>
        
        <el-table :data="tasks" style="width: 100%">
          <el-table-column prop="name" label="任务名称" width="200" />
          <el-table-column prop="cron" label="Cron表达式" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastRun" label="上次执行时间" width="180" />
          <el-table-column prop="nextRun" label="下次执行时间" width="180" />
          <el-table-column label="操作" width="300">
            <template #default="{ row }">
              <el-button size="small" @click="handleRun(row)">手动触发</el-button>
              <el-button size="small" @click="handleConfig(row)">配置</el-button>
              <el-button 
                :type="row.status === 'enabled' ? 'warning' : 'success'"
                size="small"
                @click="toggleStatus(row)"
              >
                {{ row.status === 'enabled' ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 配置对话框 -->
        <el-dialog v-model="configDialogVisible" title="配置任务" width="500px">
          <el-form :model="configForm" label-width="120px">
            <el-form-item label="Cron表达式">
              <el-input v-model="configForm.cron" placeholder="例如: 0 0 * * *" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="configForm.status">
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
            <el-form-item label="参数">
              <el-input
                v-model="configForm.params"
                type="textarea"
                :rows="3"
                placeholder="JSON格式参数（可选）"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="configDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmConfig">保存</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/AppHeader.vue'
import * as adminApi from '../../api/admin'

declare global {
  interface Window {
    VANTA: any
  }
}

let vantaEffect: any = null

const tasks = ref<any[]>([])
const loading = ref(false)
const configDialogVisible = ref(false)
const currentTask = ref<any>(null)
const configForm = ref({
  cron: '',
  status: 'enabled' as 'enabled' | 'disabled',
  params: ''
})

const loadTasks = async () => {
  loading.value = true
  try {
    const response = await adminApi.getTasks()
    if (response.tasks) {
      tasks.value = response.tasks
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载任务列表失败')
  } finally {
    loading.value = false
  }
}

const handleRun = async (row: any) => {
  try {
    await adminApi.runTask(row.taskId)
    ElMessage.success(`任务 ${row.name} 已加入执行队列`)
    await loadTasks()
  } catch (error: any) {
    ElMessage.error(error.message || '触发任务失败')
  }
}

const handleConfig = (row: any) => {
  currentTask.value = row
  configForm.value = {
    cron: row.cron,
    status: row.status,
    params: ''
  }
  configDialogVisible.value = true
}

const confirmConfig = async () => {
  try {
    const params = configForm.value.params ? JSON.parse(configForm.value.params) : undefined
    await adminApi.updateTask(currentTask.value.taskId, {
      cron: configForm.value.cron,
      status: configForm.value.status,
      params
    })
    ElMessage.success('任务配置已保存')
    configDialogVisible.value = false
    await loadTasks()
  } catch (error: any) {
    ElMessage.error(error.message || '保存配置失败')
  }
}

const toggleStatus = async (row: any) => {
  const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
  try {
    await adminApi.updateTask(row.taskId, {
      status: newStatus
    })
    row.status = newStatus
    ElMessage.success(`任务已${newStatus === 'enabled' ? '启用' : '禁用'}`)
  } catch (error: any) {
    ElMessage.error(error.message || '更新任务状态失败')
  }
}

onMounted(() => {
  loadTasks()
  
  // 初始化 Vanta.js GLOBE 背景
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VANTA) {
      vantaEffect = window.VANTA.GLOBE({
        el: '#vanta-globe-tasks-bg',
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x79550e,
        color2: 0xc5850f,
        backgroundColor: 0xf4f2e7
      })
    }
  }, 100)
})

onUnmounted(() => {
  if (vantaEffect) {
    vantaEffect.destroy()
  }
})
</script>

<style scoped lang="scss">
.admin-tasks-page {
  min-height: 100vh;
  position: relative;

  .vanta-background {
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    height: calc(100vh - 64px);
    z-index: 0;
    pointer-events: none;
  }

  .page-content {
    position: relative;
    z-index: 1;

    .el-table {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
  }
}
</style>


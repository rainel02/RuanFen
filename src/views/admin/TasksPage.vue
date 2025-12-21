<template>
  <div class="admin-tasks">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>任务管理</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="page-title">系统任务管理</h1>
        </div>

        <el-card class="tasks-card">
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="tasks.length === 0" class="empty-state">
            <el-empty description="暂无任务" />
          </div>

          <div v-else class="tasks-list">
            <div
              v-for="task in tasks"
              :key="task.taskId"
              class="task-item"
            >
              <div class="task-header">
                <div class="task-info">
                  <h3>{{ task.name }}</h3>
                  <p v-if="task.description" class="task-desc">{{ task.description }}</p>
                </div>
                <el-switch
                  v-model="task.status"
                  active-value="enabled"
                  inactive-value="disabled"
                  active-text="启用"
                  inactive-text="禁用"
                  @change="handleToggleTask(task)"
                />
              </div>

              <div class="task-details">
                <div class="detail-row">
                  <span class="label">任务ID：</span>
                  <span class="value">{{ task.taskId }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Cron表达式：</span>
                  <el-input
                    v-model="task.cron"
                    size="small"
                    style="width: 200px;"
                    @blur="handleUpdateCron(task)"
                  />
                </div>
                <div class="detail-row">
                  <span class="label">上次执行：</span>
                  <span class="value">{{ formatDate(task.lastRun) }}</span>
                </div>
                <div class="detail-row" v-if="task.nextRun">
                  <span class="label">下次执行：</span>
                  <span class="value">{{ formatDate(task.nextRun) }}</span>
                </div>
              </div>

              <div class="task-actions">
                <el-button
                  type="primary"
                  @click="handleRunTask(task)"
                  :loading="running === task.taskId"
                >
                  <el-icon><VideoPlay /></el-icon>
                  手动执行
                </el-button>
                <el-button
                  @click="handleConfigTask(task)"
                >
                  <el-icon><Setting /></el-icon>
                  配置
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 配置对话框 -->
        <el-dialog
          v-model="configDialogVisible"
          title="配置任务"
          width="600px"
        >
          <el-form :model="configForm" label-width="120px" v-if="currentTask">
            <el-form-item label="任务名称">
              <el-input v-model="currentTask.name" disabled />
            </el-form-item>
            <el-form-item label="Cron表达式">
              <el-input v-model="configForm.cron" placeholder="如：0 0 2 * * ?" />
              <p class="form-tip">格式：秒 分 时 日 月 周</p>
            </el-form-item>
            <el-form-item label="任务状态">
              <el-radio-group v-model="configForm.status">
                <el-radio value="enabled">启用</el-radio>
                <el-radio value="disabled">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="configDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="confirmConfig"
              :loading="configuring"
            >
              保存
            </el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Setting } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import {
  getTasks,
  updateTask,
  runTask,
  type Task,
  type UpdateTaskRequest
} from '@/api/admin'

const loading = ref(false)
const tasks = ref<Task[]>([])
const running = ref<string>('')
const configDialogVisible = ref(false)
const configuring = ref(false)
const currentTask = ref<Task | null>(null)

const configForm = ref<UpdateTaskRequest>({
  cron: '',
  status: 'enabled'
})

const loadTasks = async () => {
  loading.value = true
  try {
    const response = await getTasks()
    tasks.value = response.tasks
  } catch (error: any) {
    ElMessage.error(error.message || '加载任务列表失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '从未执行'
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleToggleTask = async (task: Task) => {
  try {
    await updateTask(task.taskId, { status: task.status })
    ElMessage.success(`任务已${task.status === 'enabled' ? '启用' : '禁用'}`)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
    // 恢复原状态
    task.status = task.status === 'enabled' ? 'disabled' : 'enabled'
  }
}

const handleUpdateCron = async (task: Task) => {
  try {
    await updateTask(task.taskId, { cron: task.cron })
    ElMessage.success('Cron表达式已更新')
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  }
}

const handleRunTask = async (task: Task) => {
  running.value = task.taskId
  try {
    await runTask(task.taskId)
    ElMessage.success('任务已加入执行队列')
    // 刷新任务列表以获取最新执行时间
    setTimeout(() => {
      loadTasks()
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.message || '执行失败')
  } finally {
    running.value = ''
  }
}

const handleConfigTask = (task: Task) => {
  currentTask.value = task
  configForm.value = {
    cron: task.cron,
    status: task.status
  }
  configDialogVisible.value = true
}

const confirmConfig = async () => {
  if (!currentTask.value) return

  configuring.value = true
  try {
    await updateTask(currentTask.value.taskId, configForm.value)
    ElMessage.success('配置已保存')
    configDialogVisible.value = false
    await loadTasks()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    configuring.value = false
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped lang="scss">
.admin-tasks {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.page-content {
  padding: 24px 0;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin: 16px 0 0 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
}

.tasks-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  padding: 24px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(102, 126, 234, 0.4);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;

  .task-info {
    flex: 1;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 8px 0;
    }

    .task-desc {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }
  }
}

.task-details {
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;

  .label {
    color: #718096;
    min-width: 120px;
  }

  .value {
    color: #1a202c;
  }
}

.task-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.form-tip {
  font-size: 12px;
  color: #718096;
  margin: 4px 0 0 0;
}

@media (max-width: 768px) {
  .task-header {
    flex-direction: column;
  }

  .task-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>


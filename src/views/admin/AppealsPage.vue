<template>
  <div class="admin-appeals">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>申诉处理</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="header-actions">
            <h1 class="page-title">申诉处理</h1>
            <el-radio-group v-model="statusFilter" @change="loadAppeals">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="pending">待处理</el-radio-button>
              <el-radio-button label="approved">已批准</el-radio-button>
              <el-radio-button label="rejected">已驳回</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <el-card class="appeals-card">
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="appeals.length === 0" class="empty-state">
            <el-empty description="暂无申诉" />
          </div>

          <div v-else class="appeals-list">
            <div
              v-for="appeal in appeals"
              :key="appeal.caseId"
              class="appeal-item"
            >
              <div class="appeal-header">
                <div class="appeal-info">
                  <el-tag :type="appeal.appealType === 'identity_stolen' ? 'danger' : 'warning'" size="small">
                    {{ appeal.appealType === 'identity_stolen' ? '身份冒用' : '成果冒领' }}
                  </el-tag>
                  <span class="case-id">申诉编号：{{ appeal.caseId }}</span>
                </div>
                <el-tag :type="getStatusType(appeal.status)" size="large">
                  {{ getStatusText(appeal.status) }}
                </el-tag>
              </div>

              <div class="appeal-content">
                <div class="content-section">
                  <h4>申诉人</h4>
                  <p>{{ appeal.username }} (ID: {{ appeal.userId }})</p>
                </div>
                <div class="content-section">
                  <h4>被申诉{{ appeal.appealType === 'identity_stolen' ? '学者' : '成果' }}ID</h4>
                  <p>{{ appeal.targetId }}</p>
                </div>
                <div class="content-section">
                  <h4>申诉原因</h4>
                  <p class="reason-text">{{ appeal.reason }}</p>
                </div>
                <div class="content-section" v-if="appeal.evidenceMaterials.length > 0">
                  <h4>证据材料</h4>
                  <div class="materials">
                    <el-link
                      v-for="(material, index) in appeal.evidenceMaterials"
                      :key="index"
                      :href="material"
                      target="_blank"
                      type="primary"
                    >
                      证据{{ index + 1 }}
                    </el-link>
                  </div>
                </div>
                <div class="content-section">
                  <h4>提交时间</h4>
                  <p>{{ formatDate(appeal.submittedAt) }}</p>
                </div>
              </div>

              <div class="appeal-actions" v-if="appeal.status === 'pending'">
                <el-button
                  type="success"
                  @click="handleProcess(appeal, 'approve')"
                  :loading="processing === appeal.caseId"
                >
                  <el-icon><Check /></el-icon>
                  批准申诉
                </el-button>
                <el-button
                  type="danger"
                  @click="handleProcess(appeal, 'reject')"
                  :loading="processing === appeal.caseId"
                >
                  <el-icon><Close /></el-icon>
                  驳回申诉
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 处理对话框 -->
        <el-dialog
          v-model="processDialogVisible"
          :title="processAction === 'approve' ? '批准申诉' : '驳回申诉'"
          width="500px"
        >
          <el-form :model="processForm" label-width="100px" v-if="processAction === 'reject'">
            <el-form-item label="驳回原因">
              <el-input
                v-model="processForm.reason"
                type="textarea"
                :rows="4"
                placeholder="请输入驳回原因（可选）"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-form>
          <div v-else>
            <p>确定要批准此申诉吗？</p>
          </div>
          <template #footer>
            <el-button @click="processDialogVisible = false">取消</el-button>
            <el-button
              :type="processAction === 'approve' ? 'success' : 'danger'"
              @click="confirmProcess"
              :loading="processing"
            >
              确认{{ processAction === 'approve' ? '批准' : '驳回' }}
            </el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import {
  getAppeals,
  processAppeal,
  type Appeal
} from '@/api/admin'

const loading = ref(false)
const statusFilter = ref('pending')
const appeals = ref<Appeal[]>([])
const processing = ref<string>('')
const processDialogVisible = ref(false)
const processAction = ref<'approve' | 'reject'>('approve')
const currentAppeal = ref<Appeal | null>(null)

const processForm = ref({
  reason: ''
})

const loadAppeals = async () => {
  loading.value = true
  try {
    const response = await getAppeals(statusFilter.value || undefined)
    appeals.value = response.appeals
  } catch (error: any) {
    ElMessage.error(error.message || '加载申诉列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    approved: '已批准',
    rejected: '已驳回'
  }
  return map[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleProcess = (appeal: Appeal, action: 'approve' | 'reject') => {
  currentAppeal.value = appeal
  processAction.value = action
  processForm.value.reason = ''
  processDialogVisible.value = true
}

const confirmProcess = async () => {
  if (!currentAppeal.value) return

  processing.value = currentAppeal.value.caseId
  try {
    await processAppeal(
      currentAppeal.value.caseId,
      processAction.value,
      processForm.value.reason || undefined
    )
    ElMessage.success(`申诉已${processAction.value === 'approve' ? '批准' : '驳回'}`)
    processDialogVisible.value = false
    await loadAppeals()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    processing.value = ''
  }
}

onMounted(() => {
  loadAppeals()
})
</script>

<style scoped lang="scss">
.admin-appeals {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.page-content {
  padding: 24px 0;
}

.page-header {
  margin-bottom: 24px;

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
}

.appeals-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.appeals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appeal-item {
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

.appeal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;

  .appeal-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;

    .case-id {
      font-size: 14px;
      color: #718096;
    }
  }
}

.appeal-content {
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.content-section {
  margin-bottom: 16px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #1a202c;
    margin: 0;
  }

  .reason-text {
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .materials {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.appeal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .appeal-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .appeal-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>


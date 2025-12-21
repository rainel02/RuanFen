<template>
  <div class="admin-certifications">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>认证审核</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="header-actions">
            <h1 class="page-title">认证审核</h1>
            <el-radio-group v-model="statusFilter" @change="loadApplications">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="pending">待审核</el-radio-button>
              <el-radio-button label="approved">已通过</el-radio-button>
              <el-radio-button label="rejected">已驳回</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <el-card class="applications-card">
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="applications.length === 0" class="empty-state">
            <el-empty description="暂无认证申请" />
          </div>

          <div v-else class="applications-list">
            <div
              v-for="app in applications"
              :key="app.appId"
              class="application-item"
            >
              <div class="application-header">
                <div class="applicant-info">
                  <el-avatar :size="48">{{ app.realName.charAt(0) }}</el-avatar>
                  <div class="info-content">
                    <h3>{{ app.realName }}</h3>
                    <p class="meta">{{ app.organization }} · {{ app.title }}</p>
                    <p class="meta">{{ app.orgEmail }}</p>
                  </div>
                </div>
                <el-tag :type="getStatusType(app.status)" size="large">
                  {{ getStatusText(app.status) }}
                </el-tag>
              </div>

              <div class="application-details">
                <div class="detail-item">
                  <span class="label">申请时间：</span>
                  <span>{{ formatDate(app.submittedAt) }}</span>
                </div>
                <div class="detail-item" v-if="app.proofMaterials.length > 0">
                  <span class="label">证明材料：</span>
                  <div class="materials">
                    <el-link
                      v-for="(material, index) in app.proofMaterials"
                      :key="index"
                      :href="material"
                      target="_blank"
                      type="primary"
                    >
                      材料{{ index + 1 }}
                    </el-link>
                  </div>
                </div>
              </div>

              <div class="application-actions" v-if="app.status === 'pending'">
                <el-button
                  type="success"
                  @click="handleApprove(app.appId)"
                  :loading="processing === app.appId"
                >
                  <el-icon><Check /></el-icon>
                  批准
                </el-button>
                <el-button
                  type="danger"
                  @click="handleReject(app)"
                  :loading="processing === app.appId"
                >
                  <el-icon><Close /></el-icon>
                  驳回
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 驳回对话框 -->
        <el-dialog
          v-model="rejectDialogVisible"
          title="驳回认证申请"
          width="500px"
        >
          <el-form :model="rejectForm" label-width="100px">
            <el-form-item label="驳回原因">
              <el-input
                v-model="rejectForm.reason"
                type="textarea"
                :rows="4"
                placeholder="请输入驳回原因"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="rejectDialogVisible = false">取消</el-button>
            <el-button
              type="danger"
              @click="confirmReject"
              :loading="rejecting"
            >
              确认驳回
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
  getCertificationApplications,
  approveCertification,
  rejectCertification,
  type CertificationApplication
} from '@/api/admin'

const loading = ref(false)
const statusFilter = ref('pending')
const applications = ref<CertificationApplication[]>([])
const processing = ref<string>('')
const rejectDialogVisible = ref(false)
const rejecting = ref(false)
const currentApp = ref<CertificationApplication | null>(null)

const rejectForm = ref({
  reason: ''
})

const loadApplications = async () => {
  loading.value = true
  try {
    const response = await getCertificationApplications(statusFilter.value || undefined)
    applications.value = response.applications
  } catch (error: any) {
    ElMessage.error(error.message || '加载申请列表失败')
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
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
  }
  return map[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleApprove = async (appId: string) => {
  try {
    await ElMessageBox.confirm('确定要批准此认证申请吗？', '确认批准', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })

    processing.value = appId
    await approveCertification(appId)
    ElMessage.success('已批准')
    await loadApplications()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    processing.value = ''
  }
}

const handleReject = (app: CertificationApplication) => {
  currentApp.value = app
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!currentApp.value || !rejectForm.value.reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  rejecting.value = true
  try {
    await rejectCertification(currentApp.value.appId, rejectForm.value.reason)
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    await loadApplications()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    rejecting.value = false
  }
}

onMounted(() => {
  loadApplications()
})
</script>

<style scoped lang="scss">
.admin-certifications {
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

.applications-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-item {
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

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.applicant-info {
  display: flex;
  gap: 16px;
  flex: 1;

  .info-content {
    flex: 1;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 4px 0;
    }

    .meta {
      font-size: 14px;
      color: #718096;
      margin: 2px 0;
    }
  }
}

.application-details {
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);

  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;

    .label {
      color: #718096;
      min-width: 100px;
    }

    .materials {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}

.application-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .application-header {
    flex-direction: column;
  }

  .application-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>


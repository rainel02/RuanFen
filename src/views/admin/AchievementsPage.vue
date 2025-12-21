<template>
  <div class="admin-achievements">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>成果审核</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="page-title">成果审核</h1>
        </div>

        <el-card class="achievements-card">
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="achievements.length === 0" class="empty-state">
            <el-empty description="暂无待审核成果" />
          </div>

          <div v-else class="achievements-list">
            <div
              v-for="achievement in achievements"
              :key="achievement.achId"
              class="achievement-item"
            >
              <div class="achievement-header">
                <div class="achievement-info">
                  <h3>{{ achievement.title }}</h3>
                  <p class="scholar-name">提交者：{{ achievement.scholarName }}</p>
                </div>
                <el-tag type="warning" size="large">待审核</el-tag>
              </div>

              <div class="achievement-details">
                <div class="detail-item">
                  <span class="label">作者：</span>
                  <span>{{ achievement.authors.join(', ') }}</span>
                </div>
                <div class="detail-item" v-if="achievement.journal">
                  <span class="label">期刊/会议：</span>
                  <span>{{ achievement.journal }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">年份：</span>
                  <span>{{ achievement.year }}</span>
                </div>
                <div class="detail-item" v-if="achievement.doi">
                  <span class="label">DOI：</span>
                  <span>{{ achievement.doi }}</span>
                </div>
                <div class="detail-item" v-if="achievement.abstract">
                  <span class="label">摘要：</span>
                  <p class="abstract-text">{{ achievement.abstract }}</p>
                </div>
                <div class="detail-item">
                  <span class="label">提交时间：</span>
                  <span>{{ formatDate(achievement.submittedAt) }}</span>
                </div>
              </div>

              <div class="achievement-actions">
                <el-button
                  type="success"
                  @click="handleApprove(achievement.achId)"
                  :loading="processing === achievement.achId"
                >
                  <el-icon><Check /></el-icon>
                  批准
                </el-button>
                <el-button
                  type="danger"
                  @click="handleReject(achievement)"
                  :loading="processing === achievement.achId"
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
          title="驳回成果"
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
  getPendingAchievements,
  approveAchievement,
  rejectAchievement,
  type PendingAchievement
} from '@/api/admin'

const loading = ref(false)
const achievements = ref<PendingAchievement[]>([])
const processing = ref<string>('')
const rejectDialogVisible = ref(false)
const rejecting = ref(false)
const currentAchievementId = ref<string>('')

const rejectForm = ref({
  reason: ''
})

const loadAchievements = async () => {
  loading.value = true
  try {
    const response = await getPendingAchievements()
    achievements.value = response.pendingAchievements
  } catch (error: any) {
    ElMessage.error(error.message || '加载成果列表失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleApprove = async (achId: string) => {
  try {
    await ElMessageBox.confirm('确定要批准此成果吗？', '确认批准', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })

    processing.value = achId
    await approveAchievement(achId)
    ElMessage.success('已批准')
    await loadAchievements()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    processing.value = ''
  }
}

const handleReject = (achievement: PendingAchievement) => {
  currentAchievementId.value = achievement.achId
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!currentAchievementId.value || !rejectForm.value.reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  rejecting.value = true
  try {
    await rejectAchievement(currentAchievementId.value, rejectForm.value.reason)
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    await loadAchievements()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    rejecting.value = false
  }
}

onMounted(() => {
  loadAchievements()
})
</script>

<style scoped lang="scss">
.admin-achievements {
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

.achievements-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.achievement-item {
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

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;

  .achievement-info {
    flex: 1;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 8px 0;
    }

    .scholar-name {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }
  }
}

.achievement-details {
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;

  .label {
    color: #718096;
    min-width: 100px;
    flex-shrink: 0;
  }

  .abstract-text {
    color: #1a202c;
    line-height: 1.6;
    margin: 0;
    flex: 1;
  }
}

.achievement-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .achievement-header {
    flex-direction: column;
  }

  .achievement-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>


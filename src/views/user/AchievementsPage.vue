<template>
  <div class="achievements-page">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
            <el-breadcrumb-item>成果管理</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="header-actions">
            <h1 class="page-title">成果管理</h1>
            <el-button
              type="primary"
              size="large"
              @click="handleAdd"
            >
              <el-icon><Plus /></el-icon>
              新增成果
            </el-button>
          </div>
        </div>

        <el-card class="achievements-card">
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="achievements.length === 0" class="empty-state">
            <el-empty description="暂无成果，点击上方按钮添加">
              <el-button type="primary" @click="handleAdd">添加成果</el-button>
            </el-empty>
          </div>

          <div v-else class="achievements-list">
            <div
              v-for="achievement in achievements"
              :key="achievement.id"
              class="achievement-item"
            >
              <div class="achievement-content">
                <div class="achievement-header">
                  <h3 class="achievement-title">{{ achievement.title }}</h3>
                  <el-tag
                    :type="getStatusType(achievement.status)"
                    size="small"
                    class="status-tag"
                  >
                    {{ getStatusText(achievement.status) }}
                  </el-tag>
                </div>

                <div class="achievement-meta">
                  <span class="meta-item">
                    <el-icon><User /></el-icon>
                    {{ achievement.authors.join(', ') }}
                  </span>
                  <span v-if="achievement.journal" class="meta-item">
                    <el-icon><Document /></el-icon>
                    {{ achievement.journal }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    {{ achievement.year }}
                  </span>
                  <span v-if="achievement.doi" class="meta-item">
                    <el-icon><Link /></el-icon>
                    DOI: {{ achievement.doi }}
                  </span>
                </div>

                <div v-if="achievement.status === 'rejected' && achievement.rejectionReason" class="rejection-reason">
                  <el-alert
                    :title="`驳回原因：${achievement.rejectionReason}`"
                    type="error"
                    :closable="false"
                    show-icon
                  />
                </div>
              </div>

              <div class="achievement-actions">
                <el-button
                  size="small"
                  :disabled="achievement.status === 'approved'"
                  @click="handleEdit(achievement)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :disabled="achievement.status === 'approved'"
                  @click="handleDelete(achievement)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑成果' : '新增成果'"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="dialogFormRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="dialogForm.title"
            placeholder="请输入论文标题"
            class="sci-fi-input"
          />
        </el-form-item>

        <el-form-item label="作者" prop="authors">
          <el-select
            v-model="dialogForm.authors"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入作者姓名，按回车确认"
            class="sci-fi-input"
            style="width: 100%;"
          />
          <p class="field-tip">可以输入多个作者，按回车确认</p>
        </el-form-item>

        <el-form-item label="期刊/会议" prop="journal">
          <el-input
            v-model="dialogForm.journal"
            placeholder="请输入期刊或会议名称"
            class="sci-fi-input"
          />
        </el-form-item>

        <el-form-item label="年份" prop="year">
          <el-date-picker
            v-model="dialogForm.year"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            class="sci-fi-input"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="DOI" prop="doi">
          <el-input
            v-model="dialogForm.doi"
            placeholder="请输入DOI（可选）"
            class="sci-fi-input"
          />
        </el-form-item>

        <el-form-item label="摘要" prop="abstract">
          <el-input
            v-model="dialogForm.abstract"
            type="textarea"
            :rows="4"
            placeholder="请输入摘要（可选）"
            class="sci-fi-input"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleDialogSubmit"
          >
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, User, Document, Calendar, Link } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import {
  getUserAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  type Achievement,
  type CreateAchievementRequest,
  type UpdateAchievementRequest
} from '@/api/user'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<string>('')
const achievements = ref<Achievement[]>([])

const dialogForm = reactive<CreateAchievementRequest & { abstract?: string }>({
  title: '',
  authors: [],
  journal: '',
  year: new Date().getFullYear(),
  doi: '',
  abstract: ''
})

const dialogFormRules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  authors: [
    { required: true, message: '请输入至少一个作者', trigger: 'change' },
    { type: 'array', min: 1, message: '请输入至少一个作者', trigger: 'change' }
  ],
  year: [
    { required: true, message: '请选择年份', trigger: 'change' }
  ]
}

const dialogFormRef = ref<FormInstance>()

const loadAchievements = async () => {
  loading.value = true
  try {
    const response = await getUserAchievements()
    achievements.value = response.achievements
  } catch (error: any) {
    ElMessage.error(error.message || '加载成果列表失败')
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
    pending: '审核中',
    approved: '已发布',
    rejected: '被拒绝'
  }
  return map[status] || status
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = ''
  resetDialogForm()
  dialogVisible.value = true
}

const handleEdit = (achievement: Achievement) => {
  isEdit.value = true
  currentId.value = achievement.id
  dialogForm.title = achievement.title
  dialogForm.authors = [...achievement.authors]
  dialogForm.journal = achievement.journal || ''
  dialogForm.year = achievement.year
  dialogForm.doi = achievement.doi || ''
  dialogVisible.value = true
}

const handleDelete = async (achievement: Achievement) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除成果"${achievement.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteAchievement(achievement.id)
    ElMessage.success('删除成功')
    await loadAchievements()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleDialogSubmit = async () => {
  if (!dialogFormRef.value) return

  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value) {
        const updateData: UpdateAchievementRequest = {
          title: dialogForm.title,
          authors: dialogForm.authors,
          journal: dialogForm.journal || undefined,
          year: typeof dialogForm.year === 'string' ? parseInt(dialogForm.year) : dialogForm.year,
          doi: dialogForm.doi || undefined,
          abstract: dialogForm.abstract || undefined
        }
        await updateAchievement(currentId.value, updateData)
        ElMessage.success('更新成功')
      } else {
        const createData: CreateAchievementRequest = {
          title: dialogForm.title,
          authors: dialogForm.authors,
          journal: dialogForm.journal || undefined,
          year: typeof dialogForm.year === 'string' ? parseInt(dialogForm.year) : dialogForm.year,
          doi: dialogForm.doi || undefined,
          abstract: dialogForm.abstract || undefined
        }
        await createAchievement(createData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      await loadAchievements()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

const handleDialogClose = () => {
  resetDialogForm()
  dialogFormRef.value?.clearValidate()
}

const resetDialogForm = () => {
  dialogForm.title = ''
  dialogForm.authors = []
  dialogForm.journal = ''
  dialogForm.year = new Date().getFullYear()
  dialogForm.doi = ''
  dialogForm.abstract = ''
}

onMounted(() => {
  loadAchievements()
})
</script>

<style scoped lang="scss">
.achievements-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 50%, #e8eaf6 100%);
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
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #263238;
    margin: 0;
    background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.achievements-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(33, 150, 243, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.loading-state,
.empty-state {
  padding: 40px 0;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.achievement-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(33, 150, 243, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(33, 150, 243, 0.4);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
    transform: translateY(-2px);
  }
}

.achievement-content {
  flex: 1;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;

  .achievement-title {
    font-size: 18px;
    font-weight: 600;
    color: #263238;
    margin: 0;
    flex: 1;
  }

  .status-tag {
    flex-shrink: 0;
  }
}

.achievement-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #78909c;

    .el-icon {
      font-size: 16px;
    }
  }
}

.rejection-reason {
  margin-top: 12px;
}

.achievement-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
  flex-shrink: 0;
}

.field-tip {
  font-size: 12px;
  color: #90a4ae;
  margin: 4px 0 0 0;
}

:deep(.sci-fi-input) {
  .el-input__wrapper {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(33, 150, 243, 0.2);
    border-radius: 8px;
    box-shadow: 
      0 2px 8px rgba(33, 150, 243, 0.08),
      inset 0 1px 2px rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(33, 150, 243, 0.4);
    }

    &.is-focus {
      border-color: #2196f3;
      box-shadow: 
        0 0 0 3px rgba(33, 150, 243, 0.1),
        0 4px 12px rgba(33, 150, 243, 0.15);
    }
  }
}

:deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(33, 150, 243, 0.2);
  border-radius: 8px;
  box-shadow: 
    0 2px 8px rgba(33, 150, 243, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(33, 150, 243, 0.4);
  }

  &:focus {
    border-color: #2196f3;
    box-shadow: 
      0 0 0 3px rgba(33, 150, 243, 0.1),
      0 4px 12px rgba(33, 150, 243, 0.15);
  }
}

@media (max-width: 768px) {
  .achievement-item {
    flex-direction: column;
    gap: 16px;
  }

  .achievement-actions {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }

  .page-header .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>


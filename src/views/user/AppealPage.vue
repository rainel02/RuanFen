<template>
  <div class="appeal-page">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
            <el-breadcrumb-item>申诉</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="page-title">申诉</h1>
        </div>

        <el-card class="appeal-card">
          <el-alert
            title="申诉说明"
            description="如果您发现身份被冒用或成果被冒领，请填写以下信息并提交相关证据。我们将在收到申诉后尽快处理。"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 24px;"
          />

          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="appeal-form"
          >
            <el-form-item label="申诉类型" prop="appealType">
              <el-radio-group v-model="formData.appealType" class="appeal-type-group">
                <el-radio value="identity_stolen" border>
                  <div class="radio-content">
                    <el-icon><UserFilled /></el-icon>
                    <div>
                      <div class="radio-title">身份冒用</div>
                      <div class="radio-desc">发现他人冒用您的身份信息</div>
                    </div>
                  </div>
                </el-radio>
                <el-radio value="achievement_stolen" border>
                  <div class="radio-content">
                    <el-icon><Document /></el-icon>
                    <div>
                      <div class="radio-title">成果冒领</div>
                      <div class="radio-desc">发现他人冒领您的学术成果</div>
                    </div>
                  </div>
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item 
              :label="formData.appealType === 'identity_stolen' ? '被申诉学者ID' : '被申诉成果ID'"
              prop="targetId"
            >
              <el-input
                v-model="formData.targetId"
                :placeholder="formData.appealType === 'identity_stolen' ? '请输入被申诉的学者ID' : '请输入被申诉的成果ID'"
                class="sci-fi-input"
              />
              <p class="field-tip">可以从相关页面URL中获取ID</p>
            </el-form-item>

            <el-form-item label="申诉原因" prop="reason">
              <el-input
                v-model="formData.reason"
                type="textarea"
                :rows="6"
                placeholder="请详细描述申诉原因，包括时间、地点、具体情况等"
                class="sci-fi-input"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="证据材料" prop="evidenceMaterials">
              <el-upload
                v-model:file-list="fileList"
                action="/api/upload"
                multiple
                :limit="10"
                :on-success="handleUploadSuccess"
                :on-remove="handleRemove"
                :before-upload="beforeUpload"
                list-type="picture-card"
                class="evidence-uploader"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <p class="upload-tip">支持 JPG、PNG、PDF 格式，最多上传10个文件，单个文件不超过 10MB</p>
            </el-form-item>

            <div class="form-actions">
              <el-button size="large" @click="handleCancel">取消</el-button>
              <el-button
                type="primary"
                size="large"
                :loading="submitting"
                @click="handleSubmit"
              >
                提交申诉
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, UserFilled, Document } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { submitAppeal, type AppealRequest } from '@/api/user'
import type { UploadFile } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const fileList = ref<UploadFile[]>([])

const formData = reactive<AppealRequest>({
  appealType: 'identity_stolen',
  targetId: '',
  reason: '',
  evidenceMaterials: []
})

const formRules: FormRules = {
  appealType: [
    { required: true, message: '请选择申诉类型', trigger: 'change' }
  ],
  targetId: [
    { required: true, message: '请输入被申诉的ID', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入申诉原因', trigger: 'blur' },
    { min: 20, message: '申诉原因至少需要20个字符', trigger: 'blur' }
  ],
  evidenceMaterials: [
    { required: true, message: '请上传证据材料', trigger: 'change' }
  ]
}

const handleUploadSuccess = (response: any, file: UploadFile) => {
  const url = response.url || response.data?.url || file.url
  if (url) {
    formData.evidenceMaterials.push(url)
  }
  ElMessage.success('文件上传成功')
}

const handleRemove = (file: UploadFile) => {
  const url = file.url || file.response?.url || file.response?.data?.url
  if (url) {
    const index = formData.evidenceMaterials.indexOf(url)
    if (index > -1) {
      formData.evidenceMaterials.splice(index, 1)
    }
  }
}

const beforeUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传 JPG、PNG 或 PDF 格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  if (formData.evidenceMaterials.length === 0) {
    ElMessage.warning('请至少上传一个证据材料')
    return
  }

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const response = await submitAppeal(formData)
      ElMessage.success('申诉已提交，申诉编号：' + response.caseId)
      router.push('/profile')
    } catch (error: any) {
      ElMessage.error(error.message || '提交失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

const handleCancel = () => {
  router.push('/profile')
}
</script>

<style scoped lang="scss">
.appeal-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 50%, #e8eaf6 100%);
}

.page-content {
  padding: 24px 0;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #263238;
    margin: 16px 0 0 0;
    background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.appeal-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(33, 150, 243, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.appeal-form {
  padding: 8px 0;
}

.appeal-type-group {
  width: 100%;
  display: flex;
  gap: 16px;

  :deep(.el-radio) {
    flex: 1;
    margin: 0;
    height: auto;

    .el-radio__input {
      display: none;
    }

    .el-radio__label {
      padding: 0;
      width: 100%;
    }

    &.is-checked {
      .radio-content {
        border-color: #2196f3;
        background: rgba(33, 150, 243, 0.05);
      }
    }
  }
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid rgba(33, 150, 243, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba(33, 150, 243, 0.4);
    background: rgba(33, 150, 243, 0.02);
  }

  .el-icon {
    font-size: 32px;
    color: #2196f3;
  }

  .radio-title {
    font-size: 16px;
    font-weight: 600;
    color: #263238;
    margin-bottom: 4px;
  }

  .radio-desc {
    font-size: 13px;
    color: #90a4ae;
  }
}

.field-tip {
  font-size: 12px;
  color: #90a4ae;
  margin: 4px 0 0 0;
}

.evidence-uploader {
  :deep(.el-upload) {
    border: 2px dashed rgba(33, 150, 243, 0.3);
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      border-color: #2196f3;
    }
  }
}

.upload-tip {
  font-size: 12px;
  color: #90a4ae;
  margin: 8px 0 0 0;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(33, 150, 243, 0.1);

  .el-button {
    min-width: 120px;
    height: 44px;
    font-weight: 600;
    border-radius: 8px;

    &.el-button--primary {
      background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
      border: none;
      box-shadow: 
        0 4px 12px rgba(33, 150, 243, 0.3),
        0 2px 4px rgba(33, 150, 243, 0.2);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 6px 16px rgba(33, 150, 243, 0.4),
          0 2px 4px rgba(33, 150, 243, 0.3);
      }
    }
  }
}

@media (max-width: 768px) {
  .appeal-type-group {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>


<template>
  <div class="certification-page">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
            <el-breadcrumb-item>学者认证</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="page-title">学者认证申请</h1>
        </div>

        <!-- 认证状态显示 -->
        <el-card v-if="certificationStatus" class="status-card">
          <div class="status-content">
            <el-icon class="status-icon" :class="statusClass">
              <component :is="statusIcon" />
            </el-icon>
            <div class="status-info">
              <h3 class="status-title">{{ statusText }}</h3>
              <p v-if="certificationStatus.reason" class="status-reason">
                {{ certificationStatus.reason }}
              </p>
            </div>
          </div>
        </el-card>

        <!-- 认证表单 -->
        <el-card class="certification-card" v-if="!certificationStatus || certificationStatus.status === 'rejected'">
          <el-alert
            title="认证说明"
            description="请填写真实信息并上传相关证明材料，我们将在3-5个工作日内完成审核。"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 24px;"
          />

          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="certification-form"
          >
            <el-form-item label="真实姓名" prop="realName">
              <el-input
                v-model="formData.realName"
                placeholder="请输入真实姓名"
                class="sci-fi-input"
              />
            </el-form-item>

            <el-form-item label="所属机构" prop="organization">
              <el-input
                v-model="formData.organization"
                placeholder="请输入所属机构（如：清华大学）"
                class="sci-fi-input"
              />
            </el-form-item>

            <el-form-item label="机构邮箱" prop="orgEmail">
              <el-input
                v-model="formData.orgEmail"
                placeholder="请输入机构邮箱（如：xxx@tsinghua.edu.cn）"
                class="sci-fi-input"
              />
              <p class="field-tip">请使用机构官方邮箱，用于验证身份</p>
            </el-form-item>

            <el-form-item label="职位" prop="title">
              <el-input
                v-model="formData.title"
                placeholder="请输入职位（如：教授、副教授、研究员等）"
                class="sci-fi-input"
              />
            </el-form-item>

            <el-form-item label="证明材料" prop="proofMaterials">
              <el-upload
                v-model:file-list="fileList"
                action="/api/upload"
                multiple
                :limit="5"
                :on-success="handleUploadSuccess"
                :on-remove="handleRemove"
                :before-upload="beforeUpload"
                list-type="picture-card"
                class="proof-uploader"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <p class="upload-tip">支持 JPG、PNG、PDF 格式，最多上传5个文件，单个文件不超过 5MB</p>
            </el-form-item>

            <div class="form-actions">
              <el-button size="large" @click="handleCancel">取消</el-button>
              <el-button
                type="primary"
                size="large"
                :loading="submitting"
                @click="handleSubmit"
              >
                提交申请
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, CircleCheck, Clock, CircleClose } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { 
  submitCertification, 
  getCertificationStatus,
  type CertificationRequest,
  type CertificationStatus
} from '@/api/user'
import type { UploadFile } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const certificationStatus = ref<CertificationStatus | null>(null)
const fileList = ref<UploadFile[]>([])

const formData = reactive<CertificationRequest>({
  realName: '',
  organization: '',
  orgEmail: '',
  title: '',
  proofMaterials: []
})

const formRules: FormRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  organization: [
    { required: true, message: '请输入所属机构', trigger: 'blur' }
  ],
  orgEmail: [
    { required: true, message: '请输入机构邮箱', trigger: 'blur' },
    { 
      pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur'
    }
  ],
  title: [
    { required: true, message: '请输入职位', trigger: 'blur' }
  ],
  proofMaterials: [
    { required: true, message: '请上传证明材料', trigger: 'change' }
  ]
}

const statusClass = computed(() => {
  if (!certificationStatus.value) return ''
  const status = certificationStatus.value.status
  return {
    'status-pending': status === 'pending',
    'status-certified': status === 'certified',
    'status-rejected': status === 'rejected'
  }
})

const statusIcon = computed(() => {
  if (!certificationStatus.value) return Clock
  const status = certificationStatus.value.status
  if (status === 'certified') return CircleCheck
  if (status === 'rejected') return CircleClose
  return Clock
})

const statusText = computed(() => {
  if (!certificationStatus.value) return ''
  const status = certificationStatus.value.status
  if (status === 'certified') return '认证已通过'
  if (status === 'rejected') return '认证未通过'
  return '认证审核中'
})

const loadCertificationStatus = async () => {
  try {
    const status = await getCertificationStatus()
    certificationStatus.value = status
  } catch (error: any) {
    // 如果接口返回404或错误，说明还没有提交过认证
    if (error.message?.includes('404') || error.message?.includes('未找到')) {
      certificationStatus.value = null
    } else {
      console.error('获取认证状态失败:', error)
    }
  }
}

const handleUploadSuccess = (response: any, file: UploadFile) => {
  const url = response.url || response.data?.url || file.url
  if (url) {
    formData.proofMaterials.push(url)
  }
  ElMessage.success('文件上传成功')
}

const handleRemove = (file: UploadFile) => {
  const url = file.url || file.response?.url || file.response?.data?.url
  if (url) {
    const index = formData.proofMaterials.indexOf(url)
    if (index > -1) {
      formData.proofMaterials.splice(index, 1)
    }
  }
}

const beforeUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isValidType) {
    ElMessage.error('只能上传 JPG、PNG 或 PDF 格式的文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  if (formData.proofMaterials.length === 0) {
    ElMessage.warning('请至少上传一个证明材料')
    return
  }

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      await submitCertification(formData)
      ElMessage.success('认证申请已提交，请等待审核')
      await loadCertificationStatus()
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

onMounted(() => {
  loadCertificationStatus()
})
</script>

<style scoped lang="scss">
.certification-page {
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

.status-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(33, 150, 243, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 0;

  .status-icon {
    font-size: 48px;

    &.status-pending {
      color: #ff9800;
    }

    &.status-certified {
      color: #4caf50;
    }

    &.status-rejected {
      color: #f44336;
    }
  }

  .status-info {
    flex: 1;

    .status-title {
      font-size: 20px;
      font-weight: 600;
      color: #263238;
      margin: 0 0 8px 0;
    }

    .status-reason {
      font-size: 14px;
      color: #f44336;
      margin: 0;
      padding: 12px;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 8px;
      border-left: 3px solid #f44336;
    }
  }
}

.certification-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(33, 150, 243, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.certification-form {
  padding: 8px 0;
}

.field-tip {
  font-size: 12px;
  color: #90a4ae;
  margin: 4px 0 0 0;
}

.proof-uploader {
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
  .status-content {
    flex-direction: column;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>


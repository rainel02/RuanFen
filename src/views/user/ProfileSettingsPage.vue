<template>
  <div class="profile-settings-page">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
            <el-breadcrumb-item>个人信息设置</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="page-title">个人信息设置</h1>
        </div>

        <el-card class="settings-card">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="settings-form"
          >
            <div class="form-section">
              <h3 class="section-title">基本信息</h3>
              
              <el-form-item label="头像" prop="avatar">
                <div class="avatar-upload">
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadAction"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload"
                  >
                    <img v-if="formData.avatar" :src="formData.avatar" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
                </div>
              </el-form-item>

              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="formData.username"
                  placeholder="请输入用户名"
                  class="sci-fi-input"
                />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="formData.email"
                  placeholder="请输入邮箱地址"
                  class="sci-fi-input"
                />
              </el-form-item>

              <el-form-item label="真实姓名" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="请输入真实姓名"
                  class="sci-fi-input"
                />
              </el-form-item>

              <el-form-item label="职位" prop="title">
                <el-input
                  v-model="formData.title"
                  placeholder="请输入职位（如：教授、副教授等）"
                  class="sci-fi-input"
                />
              </el-form-item>

              <el-form-item label="所属机构" prop="institution">
                <el-input
                  v-model="formData.institution"
                  placeholder="请输入所属机构"
                  class="sci-fi-input"
                />
              </el-form-item>
            </div>

            <div class="form-section">
              <h3 class="section-title">研究信息</h3>

              <el-form-item label="研究领域" prop="researchFields">
                <el-select
                  v-model="formData.researchFields"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入研究领域"
                  class="sci-fi-input"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="field in commonFields"
                    :key="field"
                    :label="field"
                    :value="field"
                  />
                </el-select>
                <p class="field-tip">可以输入多个研究领域，按回车确认</p>
              </el-form-item>

              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="formData.bio"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入个人简介"
                  class="sci-fi-input"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </div>

            <div class="form-actions">
              <el-button size="large" @click="handleCancel">取消</el-button>
              <el-button
                type="primary"
                size="large"
                :loading="saving"
                @click="handleSave"
              >
                保存更改
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { getUserInfo, updateUserInfo, type UpdateUserInfoRequest } from '@/api/user'

const router = useRouter()
const formRef = ref<FormInstance>()
const saving = ref(false)

const formData = reactive<UpdateUserInfoRequest>({
  username: '',
  email: '',
  name: '',
  title: '',
  institution: '',
  researchFields: [],
  bio: '',
  avatar: ''
})

const commonFields = [
  '人工智能', '机器学习', '深度学习', '计算机视觉', '自然语言处理',
  '数据挖掘', '算法设计', '软件工程', '网络安全', '数据库',
  '分布式系统', '云计算', '物联网', '区块链', '量子计算'
]

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const uploadAction = '/api/upload/avatar' // 根据实际情况调整

const handleAvatarSuccess = (response: any) => {
  formData.avatar = response.url || response.data?.url
  ElMessage.success('头像上传成功')
}

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

const loadUserInfo = async () => {
  try {
    const userInfo = await getUserInfo()
    formData.username = userInfo.username
    formData.email = userInfo.email
    formData.name = userInfo.name || ''
    formData.title = userInfo.title || ''
    formData.institution = userInfo.institution || ''
    formData.researchFields = userInfo.researchFields || []
    formData.bio = userInfo.bio || ''
    formData.avatar = userInfo.avatar || ''
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户信息失败')
  }
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    saving.value = true
    try {
      await updateUserInfo(formData)
      ElMessage.success('保存成功')
      router.push('/profile')
    } catch (error: any) {
      ElMessage.error(error.message || '保存失败，请稍后重试')
    } finally {
      saving.value = false
    }
  })
}

const handleCancel = () => {
  router.push('/profile')
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped lang="scss">
.profile-settings-page {
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

.settings-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(33, 150, 243, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.settings-form {
  padding: 8px 0;
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(33, 150, 243, 0.1);

  &:last-child {
    border-bottom: none;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #263238;
    margin: 0 0 24px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(33, 150, 243, 0.2);
  }
}

.avatar-upload {
  .avatar-uploader {
    :deep(.el-upload) {
      border: 2px dashed rgba(33, 150, 243, 0.3);
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        border-color: #2196f3;
      }
    }
  }

  .avatar {
    width: 120px;
    height: 120px;
    display: block;
    border-radius: 12px;
    object-fit: cover;
  }

  .avatar-uploader-icon {
    font-size: 32px;
    color: #2196f3;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }

  .upload-tip {
    font-size: 12px;
    color: #90a4ae;
    margin: 8px 0 0 0;
  }
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
  .form-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>


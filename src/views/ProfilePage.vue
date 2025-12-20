<template>
  <div class="profile-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <!-- Login/Register Section -->
        <div v-if="!isLoggedIn" class="auth-container">
          <div class="auth-card glass-panel">
            <div class="auth-header">
              <h2>欢迎来到 ScholarHub</h2>
              <p>连接全球智慧，分享学术成果</p>
            </div>
            
            <el-tabs v-model="authTab" class="auth-tabs" stretch>
              <el-tab-pane label="登录" name="login">
                <el-form
                  ref="loginFormRef"
                  :model="loginForm"
                  :rules="loginRules"
                  label-position="top"
                  size="large"
                >
                  <el-form-item label="用户名" prop="username">
                    <el-input
                      v-model="loginForm.username"
                      placeholder="请输入用户名"
                      :prefix-icon="User"
                    />
                  </el-form-item>

                  <el-form-item label="密码" prop="password">
                    <el-input
                      v-model="loginForm.password"
                      type="password"
                      placeholder="请输入密码"
                      show-password
                      :prefix-icon="Lock"
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-button
                      type="primary"
                      @click="handleLogin"
                      :loading="loginLoading"
                      class="submit-btn"
                      round
                    >
                      立即登录
                    </el-button>
                  </el-form-item>
                </el-form>

                <div class="demo-info">
                  <el-alert
                    title="演示账号: admin / 123456"
                    type="info"
                    :closable="false"
                    show-icon
                    center
                  />
                </div>
              </el-tab-pane>

              <el-tab-pane label="注册" name="register">
                <el-form
                  ref="registerFormRef"
                  :model="registerForm"
                  :rules="registerRules"
                  label-position="top"
                  size="large"
                >
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="registerForm.name" placeholder="真实姓名" :prefix-icon="User" />
                  </el-form-item>

                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerForm.email" placeholder="邮箱地址" :prefix-icon="Message" />
                  </el-form-item>

                  <el-form-item label="密码" prop="password">
                    <el-input
                      v-model="registerForm.password"
                      type="password"
                      placeholder="设置密码"
                      show-password
                      :prefix-icon="Lock"
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-button
                      type="primary"
                      @click="handleRegister"
                      :loading="registerLoading"
                      class="submit-btn"
                      round
                    >
                      注册账号
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- User Profile Section -->
        <div v-else class="user-profile">
          <div class="profile-header-card glass-panel">
            <div class="header-bg"></div>
            <div class="header-content">
              <div class="avatar-section">
                <el-avatar :src="user.avatar" :size="100" class="main-avatar">
                  {{ user.name?.charAt(0) }}
                </el-avatar>
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                >
                  <el-button circle size="small" :icon="Camera" class="edit-avatar-btn" />
                </el-upload>
              </div>
              
              <div class="info-section">
                <div class="name-row">
                  <h1>{{ user.name }}</h1>
                  <el-tag size="small" effect="dark">{{ user.role === 'scholar' ? '认证学者' : '普通用户' }}</el-tag>
                </div>
                <p class="email"><el-icon><Message /></el-icon> {{ user.email }}</p>
                <p class="bio">{{ user.bio || '这个人很懒，什么都没有写...' }}</p>
              </div>

              <div class="actions-section">
                <el-button type="primary" plain round @click="showEditDialog = true">编辑资料</el-button>
                <el-button type="danger" plain round @click="handleLogout">退出登录</el-button>
              </div>
            </div>
          </div>

          <el-row :gutter="24">
            <el-col :span="16">
              <div class="glass-panel content-card">
                <el-tabs v-model="activeTab">
                  <el-tab-pane label="我的收藏" name="favorites">
                    <el-empty description="暂无收藏内容" />
                  </el-tab-pane>
                  <el-tab-pane label="浏览历史" name="history">
                    <el-empty description="暂无浏览记录" />
                  </el-tab-pane>
                  <el-tab-pane label="我的帖子" name="posts">
                    <el-empty description="暂无发帖记录" />
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="glass-panel sidebar-card">
                <h3>账户统计</h3>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="value">0</div>
                    <div class="label">关注</div>
                  </div>
                  <div class="stat-item">
                    <div class="value">0</div>
                    <div class="label">粉丝</div>
                  </div>
                  <div class="stat-item">
                    <div class="value">0</div>
                    <div class="label">获赞</div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <el-dialog v-model="showEditDialog" title="编辑个人资料" width="500px">
      <el-form :model="editForm" label-position="top">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="editForm.bio" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="研究兴趣">
          <el-select
            v-model="editForm.interests"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="添加标签"
            style="width: 100%"
          >
            <el-option label="人工智能" value="AI" />
            <el-option label="大数据" value="BigData" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Camera } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user || {})

const authTab = ref('login')
const activeTab = ref('favorites')
const showEditDialog = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const editForm = reactive({
  name: '',
  bio: '',
  interests: []
})

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const registerRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loginLoading.value = true
      try {
        await authStore.login(loginForm.username, loginForm.password)
        ElMessage.success('登录成功')
        // Initialize edit form
        editForm.name = user.value.name
        editForm.bio = user.value.bio
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loginLoading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registerLoading.value = true
      try {
        await authStore.register(registerForm)
        ElMessage.success('注册成功，请登录')
        authTab.value = 'login'
      } catch (error) {
        ElMessage.error('注册失败')
      } finally {
        registerLoading.value = false
      }
    }
  })
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

const saveProfile = () => {
  // Mock save
  authStore.user.name = editForm.name
  authStore.user.bio = editForm.bio
  showEditDialog.value = false
  ElMessage.success('个人资料已更新')
}

const beforeAvatarUpload = (rawFile: any) => {
  ElMessage.info('头像上传功能演示中')
  return false
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.page-content {
  padding: 40px 0;
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center; // Center vertically for auth
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Auth Styles */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;

  .auth-header {
    text-align: center;
    margin-bottom: 30px;
    h2 { margin: 0 0 10px 0; color: #303133; }
    p { margin: 0; color: #606266; font-size: 14px; }
  }

  .submit-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    margin-top: 10px;
    background: linear-gradient(45deg, #409eff, #36d1dc);
    border: none;
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }
}

/* Profile Styles */
.user-profile {
  width: 100%;
  align-self: flex-start; // Reset alignment for profile view
}

.profile-header-card {
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;

  .header-bg {
    height: 140px;
    background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
    opacity: 0.8;
  }

  .header-content {
    padding: 0 40px 30px;
    display: flex;
    align-items: flex-end;
    gap: 30px;
    margin-top: -50px;

    .avatar-section {
      position: relative;
      .main-avatar {
        border: 4px solid #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background: #fff;
      }
      .edit-avatar-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
    }

    .info-section {
      flex: 1;
      padding-bottom: 5px;

      .name-row {
        display: flex;
        align-items: center;
        gap: 10px;
        h1 { margin: 0; font-size: 28px; color: #303133; }
      }

      .email { margin: 5px 0; color: #606266; display: flex; align-items: center; gap: 5px; }
      .bio { margin: 10px 0 0 0; color: #909399; font-size: 14px; max-width: 600px; }
    }

    .actions-section {
      padding-bottom: 10px;
    }
  }
}

.content-card {
  padding: 20px;
  min-height: 400px;
}

.sidebar-card {
  padding: 20px;
  h3 { margin: 0 0 20px 0; font-size: 16px; color: #303133; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    text-align: center;

    .stat-item {
      .value { font-size: 20px; font-weight: 700; color: #303133; }
      .label { font-size: 12px; color: #909399; margin-top: 5px; }
    }
  }
}

@media (max-width: 768px) {
  .profile-header-card .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -40px;

    .info-section {
      .name-row { justify-content: center; }
      .email { justify-content: center; }
    }
  }
}
</style>

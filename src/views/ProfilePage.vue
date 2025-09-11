<template>
  <div class="profile-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div v-if="!isLoggedIn" class="auth-section">
          <el-card class="auth-card">
            <div class="auth-tabs">
              <el-tabs v-model="authTab" class="auth-tabs-component">
                <el-tab-pane label="登录" name="login">
                  <el-form
                    ref="loginFormRef"
                    :model="loginForm"
                    :rules="loginRules"
                    label-width="80px"
                  >
                    <el-form-item label="用户名" prop="username">
                      <el-input
                        v-model="loginForm.username"
                        placeholder="请输入用户名"
                      />
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                      <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                      />
                    </el-form-item>

                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="handleLogin"
                        :loading="loginLoading"
                        style="width: 100%;"
                      >
                        登录
                      </el-button>
                    </el-form-item>
                  </el-form>

                  <div class="demo-info">
                    <el-alert
                      title="演示账号"
                      type="info"
                      :closable="false"
                      show-icon
                    >
                      <template #default>
                        用户名: admin，密码: 123456
                      </template>
                    </el-alert>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="注册" name="register">
                  <el-form
                    ref="registerFormRef"
                    :model="registerForm"
                    :rules="registerRules"
                    label-width="80px"
                  >
                    <el-form-item label="姓名" prop="name">
                      <el-input v-model="registerForm.name" placeholder="请输入真实姓名" />
                    </el-form-item>

                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="registerForm.email" placeholder="请输入邮箱地址" />
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                      <el-input
                        v-model="registerForm.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                      />
                    </el-form-item>

                    <el-form-item label="确认密码" prop="confirmPassword">
                      <el-input
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="请再次输入密码"
                        show-password
                      />
                    </el-form-item>

                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="handleRegister"
                        :loading="registerLoading"
                        style="width: 100%;"
                      >
                        注册
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </div>

        <div v-else class="profile-content">
          <el-row :gutter="24">
            <el-col :md="8" :sm="24" :xs="24">
              <el-card class="profile-card">
                <div class="profile-header">
                  <el-avatar :src="user?.avatar" :size="80">
                    {{ user?.name?.charAt(0) }}
                  </el-avatar>
                  <h3>{{ user?.name }}</h3>
                  <p class="user-title">{{ user?.title }}</p>
                  <p class="user-institution">{{ user?.institution }}</p>
                </div>

                <div class="profile-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ user?.hIndex }}</span>
                    <span class="stat-label">H指数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ user?.citations }}</span>
                    <span class="stat-label">引用数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ user?.papers }}</span>
                    <span class="stat-label">论文数</span>
                  </div>
                </div>

                <div class="profile-actions">
                  <el-button @click="handleLogout">退出登录</el-button>
                </div>
              </el-card>
            </el-col>

            <el-col :md="16" :sm="24" :xs="24">
              <el-card class="content-card">
                <el-tabs v-model="activeTab" class="profile-tabs">
                  <el-tab-pane label="个人信息" name="info">
                    <div class="info-content">
                      <h4>研究领域</h4>
                      <div class="research-fields">
                        <el-tag
                          v-for="field in user?.researchFields"
                          :key="field"
                          type="info"
                          effect="plain"
                        >
                          {{ field }}
                        </el-tag>
                      </div>

                      <h4>联系信息</h4>
                      <p><strong>邮箱：</strong>{{ user?.email }}</p>
                      <p><strong>机构：</strong>{{ user?.institution }}</p>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="我的论文" name="papers">
                    <div class="papers-content">
                      <el-empty description="暂无上传的论文" />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="收藏夹" name="favorites">
                    <div class="favorites-content">
                      <el-empty description="暂无收藏的论文" />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="关注列表" name="following">
                    <div class="following-content">
                      <el-empty description="暂无关注的学者" />
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const authTab = ref('login')
const activeTab = ref('info')
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const registerRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleLogin = async () => {
  loginLoading.value = true
  try {
    const result = await authStore.login(loginForm.value.username, loginForm.value.password)
    if (result.success) {
      ElMessage.success('登录成功')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  registerLoading.value = true
  // Mock register
  setTimeout(() => {
    ElMessage.success('注册成功，请登录')
    authTab.value = 'login'
    registerLoading.value = false
  }, 1000)
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
}

onMounted(() => {
  authStore.initAuth()
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
}

.auth-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;

  .auth-card {
    width: 100%;
    max-width: 400px;

    .demo-info {
      margin-top: 16px;
    }
  }
}

.profile-content {
  .profile-card {
    .profile-header {
      text-align: center;
      margin-bottom: 24px;

      h3 {
        margin: 12px 0 4px 0;
        font-size: 20px;
        font-weight: 600;
      }

      .user-title, .user-institution {
        margin: 4px 0;
        color: var(--text-light);
        font-size: 14px;
      }
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      .stat-item {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 4px;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: var(--text-light);
        }
      }
    }

    .profile-actions {
      text-align: center;
    }
  }

  .content-card {
    .info-content {
      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .research-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
      }

      p {
        margin: 8px 0;
        color: var(--text-color);
      }
    }

    .papers-content,
    .favorites-content,
    .following-content {
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>

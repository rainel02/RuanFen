<template>
  <div class="login-page">
    <div class="login-background">
      <div class="background-pattern"></div>
      <div class="floating-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-section">
            <el-icon class="logo-icon"><School /></el-icon>
            <h1 class="logo-title">学术平台</h1>
            <p class="logo-subtitle">Academic Platform</p>
          </div>
        </div>

        <div class="login-content">
          <h2 class="welcome-text">欢迎回来</h2>
          <p class="welcome-subtitle">登录您的账户以继续探索学术世界</p>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="account">
              <el-input
                v-model="loginForm.account"
                placeholder="用户名或邮箱"
                size="large"
                class="sci-fi-input"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                size="large"
                class="sci-fi-input"
                show-password
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <router-link to="/forgot-password" class="forgot-link">
                忘记密码？
              </router-link>
            </div>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                @click="handleLogin"
              >
                <span v-if="!loading">登录</span>
                <span v-else>登录中...</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="divider">
            <span>或</span>
          </div>

          <div class="register-prompt">
            <span>还没有账户？</span>
            <router-link to="/register" class="register-link">立即注册</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, School } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  account: '',
  password: ''
})

const loginRules: FormRules = {
  account: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const response = await login({
        account: loginForm.account,
        password: loginForm.password
      })

      // 存储token
      localStorage.setItem('token', response.token)
      
      // 设置用户基本信息
      authStore.setUser({
        id: response.user.userId,
        username: response.user.username,
        email: loginForm.account.includes('@') ? loginForm.account : '',
        role: response.user.role
      })
      
      // 获取完整用户信息
      await authStore.fetchUserInfo()

      ElMessage.success('登录成功')

      // 根据角色跳转
      if (response.user.role === 'admin') {
        router.push('/admin')
      } else if (response.user.role === 'scholar') {
        router.push('/profile')
      } else {
        router.push('/')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}

const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const animationDelay = Math.random() * 5
  const animationDuration = Math.random() * 3 + 3
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 50%, #e8eaf6 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(144, 202, 249, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(187, 222, 251, 0.1) 0%, transparent 50%);
  animation: patternMove 20s ease-in-out infinite;
}

@keyframes patternMove {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-20px, -20px) scale(1.1);
  }
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: rgba(33, 150, 243, 0.3);
  border-radius: 50%;
  animation: float infinite ease-in-out;
  backdrop-filter: blur(1px);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0.6;
  }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 
    0 8px 32px rgba(33, 150, 243, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2196f3, #64b5f6, #90caf9, #bbdefb);
    animation: shimmer 3s ease-in-out infinite;
  }
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-section {
  .logo-icon {
    font-size: 48px;
    color: #2196f3;
    margin-bottom: 12px;
    filter: drop-shadow(0 2px 8px rgba(33, 150, 243, 0.3));
  }

  .logo-title {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 4px 0;
    letter-spacing: 1px;
  }

  .logo-subtitle {
    font-size: 12px;
    color: #90a4ae;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 0;
  }
}

.login-content {
  .welcome-text {
    font-size: 24px;
    font-weight: 600;
    color: #263238;
    margin: 0 0 8px 0;
    text-align: center;
  }

  .welcome-subtitle {
    font-size: 14px;
    color: #78909c;
    text-align: center;
    margin: 0 0 32px 0;
  }
}

.login-form {
  margin-top: 32px;

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .sci-fi-input {
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(33, 150, 243, 0.2);
      border-radius: 12px;
      box-shadow: 
        0 2px 8px rgba(33, 150, 243, 0.08),
        inset 0 1px 2px rgba(255, 255, 255, 0.5);
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(33, 150, 243, 0.4);
        box-shadow: 
          0 4px 12px rgba(33, 150, 243, 0.12),
          inset 0 1px 2px rgba(255, 255, 255, 0.5);
      }

      &.is-focus {
        border-color: #2196f3;
        box-shadow: 
          0 0 0 3px rgba(33, 150, 243, 0.1),
          0 4px 12px rgba(33, 150, 243, 0.15);
      }
    }

    :deep(.el-input__inner) {
      color: #263238;
      font-weight: 500;
    }

    :deep(.el-icon) {
      color: #2196f3;
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;

  .forgot-link {
    color: #2196f3;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      color: #1976d2;
      text-decoration: underline;
    }
  }
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(33, 150, 243, 0.3),
    0 2px 4px rgba(33, 150, 243, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(33, 150, 243, 0.4),
      0 2px 4px rgba(33, 150, 243, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.divider {
  text-align: center;
  margin: 32px 0;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.3), transparent);
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }

  span {
    color: #90a4ae;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.95);
    padding: 0 16px;
    position: relative;
    z-index: 1;
  }
}

.register-prompt {
  text-align: center;
  font-size: 14px;
  color: #78909c;

  .register-link {
    color: #2196f3;
    text-decoration: none;
    font-weight: 600;
    margin-left: 8px;
    transition: all 0.3s ease;

    &:hover {
      color: #1976d2;
      text-decoration: underline;
    }
  }
}

@media (max-width: 768px) {
  .login-card {
    padding: 32px 24px;
  }

  .logo-section .logo-icon {
    font-size: 40px;
  }

  .logo-section .logo-title {
    font-size: 24px;
  }
}
</style>


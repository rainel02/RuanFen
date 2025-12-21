<template>
  <div class="register-page">
    <div class="register-background">
      <div class="background-pattern"></div>
      <div class="floating-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo-section">
            <el-icon class="logo-icon"><School /></el-icon>
            <h1 class="logo-title">学术平台</h1>
            <p class="logo-subtitle">Academic Platform</p>
          </div>
        </div>

        <div class="register-content">
          <h2 class="welcome-text">创建账户</h2>
          <p class="welcome-subtitle">加入我们，开启您的学术之旅</p>

          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            @submit.prevent="handleRegister"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="用户名"
                size="large"
                class="sci-fi-input"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="邮箱地址"
                size="large"
                class="sci-fi-input"
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码（至少6位）"
                size="large"
                class="sci-fi-input"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
              <div class="password-strength" v-if="registerForm.password">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrength.level"
                    :style="{ width: passwordStrength.width }"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrength.level">
                  {{ passwordStrength.text }}
                </span>
              </div>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                size="large"
                class="sci-fi-input"
                show-password
                @keyup.enter="handleRegister"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="agreeTerms" class="terms-checkbox">
                我已阅读并同意
                <a href="#" class="terms-link">《用户协议》</a>
                和
                <a href="#" class="terms-link">《隐私政策》</a>
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="register-button"
                :loading="loading"
                :disabled="!agreeTerms"
                @click="handleRegister"
              >
                <span v-if="!loading">注册</span>
                <span v-else>注册中...</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="divider">
            <span>或</span>
          </div>

          <div class="login-prompt">
            <span>已有账户？</span>
            <router-link to="/login" class="login-link">立即登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Message, School } from '@element-plus/icons-vue'
import { register } from '@/api/auth'

const router = useRouter()

const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const agreeTerms = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 密码强度检测
const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return { level: '', width: '0%', text: '' }

  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  if (strength <= 2) {
    return { level: 'weak', width: '33%', text: '弱' }
  } else if (strength <= 3) {
    return { level: 'medium', width: '66%', text: '中' }
  } else {
    return { level: 'strong', width: '100%', text: '强' }
  }
})

const validateConfirmPassword = (_rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password
      })

      ElMessage.success('注册成功！请登录')
      router.push('/login')
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败，请稍后重试')
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
.register-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 50%, #e8eaf6 100%);
  padding: 40px 20px;
}

.register-background {
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

.register-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
}

.register-card {
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

.register-header {
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

.register-content {
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

.register-form {
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

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  .strength-bar {
    flex: 1;
    height: 4px;
    background: rgba(33, 150, 243, 0.1);
    border-radius: 2px;
    overflow: hidden;

    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: all 0.3s ease;

      &.weak {
        background: #f44336;
      }

      &.medium {
        background: #ff9800;
      }

      &.strong {
        background: #4caf50;
      }
    }
  }

  .strength-text {
    font-size: 12px;
    font-weight: 600;
    min-width: 24px;

    &.weak {
      color: #f44336;
    }

    &.medium {
      color: #ff9800;
    }

    &.strong {
      color: #4caf50;
    }
  }
}

.terms-checkbox {
  font-size: 13px;
  color: #78909c;

  .terms-link {
    color: #2196f3;
    text-decoration: none;
    margin: 0 2px;

    &:hover {
      text-decoration: underline;
    }
  }
}

.register-button {
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

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(33, 150, 243, 0.4),
      0 2px 4px rgba(33, 150, 243, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

.login-prompt {
  text-align: center;
  font-size: 14px;
  color: #78909c;

  .login-link {
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
  .register-card {
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


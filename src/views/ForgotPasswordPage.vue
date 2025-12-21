<template>
  <div class="forgot-password-page">
    <div class="forgot-password-background">
      <div class="background-pattern"></div>
      <div class="floating-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <div class="forgot-password-header">
          <div class="logo-section">
            <el-icon class="logo-icon"><School /></el-icon>
            <h1 class="logo-title">学术平台</h1>
            <p class="logo-subtitle">Academic Platform</p>
          </div>
        </div>

        <div class="forgot-password-content">
          <!-- 步骤1: 忘记密码 - 发送验证码 -->
          <div v-if="step === 1" class="step-content">
            <h2 class="welcome-text">忘记密码</h2>
            <p class="welcome-subtitle">请输入您的邮箱地址，我们将发送验证码</p>

            <el-form
              ref="forgotFormRef"
              :model="forgotForm"
              :rules="forgotRules"
              class="forgot-form"
              @submit.prevent="handleSendCode"
            >
              <el-form-item prop="email">
                <el-input
                  v-model="forgotForm.email"
                  placeholder="请输入注册邮箱"
                  size="large"
                  class="sci-fi-input"
                >
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-button"
                  :loading="sendingCode"
                  @click="handleSendCode"
                >
                  <span v-if="!sendingCode">发送验证码</span>
                  <span v-else>发送中...</span>
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤2: 重置密码 -->
          <div v-if="step === 2" class="step-content">
            <h2 class="welcome-text">重置密码</h2>
            <p class="welcome-subtitle">请输入验证码和新密码</p>

            <el-alert
              :title="`验证码已发送至 ${forgotForm.email}`"
              type="success"
              :closable="false"
              show-icon
              style="margin-bottom: 24px;"
            />

            <el-form
              ref="resetFormRef"
              :model="resetForm"
              :rules="resetRules"
              class="reset-form"
              @submit.prevent="handleResetPassword"
            >
              <el-form-item prop="verificationCode">
                <el-input
                  v-model="resetForm.verificationCode"
                  placeholder="请输入验证码"
                  size="large"
                  class="sci-fi-input"
                  maxlength="6"
                >
                  <template #prefix>
                    <el-icon><Key /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="newPassword">
                <el-input
                  v-model="resetForm.newPassword"
                  type="password"
                  placeholder="新密码（至少6位）"
                  size="large"
                  class="sci-fi-input"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
                <div class="password-strength" v-if="resetForm.newPassword">
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
                  v-model="resetForm.confirmPassword"
                  type="password"
                  placeholder="确认新密码"
                  size="large"
                  class="sci-fi-input"
                  show-password
                  @keyup.enter="handleResetPassword"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item>
                <div class="form-actions">
                  <el-button
                    size="large"
                    class="back-button"
                    @click="step = 1"
                  >
                    返回
                  </el-button>
                  <el-button
                    type="primary"
                    size="large"
                    class="submit-button"
                    :loading="resetting"
                    @click="handleResetPassword"
                  >
                    <span v-if="!resetting">重置密码</span>
                    <span v-else>重置中...</span>
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3: 重置成功 -->
          <div v-if="step === 3" class="step-content success-content">
            <div class="success-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <h2 class="welcome-text">密码重置成功</h2>
            <p class="welcome-subtitle">您的密码已成功重置，请使用新密码登录</p>
            <el-button
              type="primary"
              size="large"
              class="submit-button"
              @click="goToLogin"
            >
              前往登录
            </el-button>
          </div>

          <div class="divider" v-if="step !== 3">
            <span>或</span>
          </div>

          <div class="login-prompt" v-if="step !== 3">
            <span>想起密码了？</span>
            <router-link to="/login" class="login-link">返回登录</router-link>
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
import { Message, Lock, Key, School, CircleCheck } from '@element-plus/icons-vue'
import { forgotPassword, resetPassword } from '@/api/auth'

const router = useRouter()

const forgotFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()
const step = ref(1) // 1: 发送验证码, 2: 重置密码, 3: 成功
const sendingCode = ref(false)
const resetting = ref(false)

const forgotForm = reactive({
  email: ''
})

const resetForm = reactive({
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度检测
const passwordStrength = computed(() => {
  const password = resetForm.newPassword
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
  } else if (value !== resetForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const forgotRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const resetRules: FormRules = {
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSendCode = async () => {
  if (!forgotFormRef.value) return

  await forgotFormRef.value.validate(async (valid) => {
    if (!valid) return

    sendingCode.value = true
    try {
      await forgotPassword({
        email: forgotForm.email
      })

      ElMessage.success('验证码已发送，请查收邮箱')
      step.value = 2
    } catch (error: any) {
      ElMessage.error(error.message || '发送验证码失败，请稍后重试')
    } finally {
      sendingCode.value = false
    }
  })
}

const handleResetPassword = async () => {
  if (!resetFormRef.value) return

  await resetFormRef.value.validate(async (valid) => {
    if (!valid) return

    resetting.value = true
    try {
      await resetPassword({
        email: forgotForm.email,
        verificationCode: resetForm.verificationCode,
        newPassword: resetForm.newPassword
      })

      ElMessage.success('密码重置成功')
      step.value = 3
    } catch (error: any) {
      ElMessage.error(error.message || '密码重置失败，请检查验证码是否正确')
    } finally {
      resetting.value = false
    }
  })
}

const goToLogin = () => {
  router.push('/login')
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
.forgot-password-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 50%, #e8eaf6 100%);
  padding: 40px 20px;
}

.forgot-password-background {
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

.forgot-password-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
}

.forgot-password-card {
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

.forgot-password-header {
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

.forgot-password-content {
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

.step-content {
  margin-top: 32px;
}

.success-content {
  text-align: center;
  padding: 20px 0;

  .success-icon {
    margin-bottom: 24px;

    .el-icon {
      font-size: 64px;
      color: #4caf50;
      filter: drop-shadow(0 2px 8px rgba(76, 175, 80, 0.3));
    }
  }
}

.forgot-form,
.reset-form {
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

.form-actions {
  display: flex;
  gap: 12px;
  width: 100%;

  .back-button {
    flex: 1;
    height: 48px;
    border: 1px solid rgba(33, 150, 243, 0.3);
    color: #2196f3;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(33, 150, 243, 0.1);
      border-color: #2196f3;
    }
  }

  .submit-button {
    flex: 2;
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
}

.submit-button {
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
  .forgot-password-card {
    padding: 32px 24px;
  }

  .logo-section .logo-icon {
    font-size: 40px;
  }

  .logo-section .logo-title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;

    .back-button,
    .submit-button {
      flex: 1;
    }
  }
}
</style>


<template>
  <div class="profile-page" :class="{ 'login-page': !isLoggedIn }">
    <AppHeader />

    <!-- Vanta.js Birds 背景（已登录用户） -->
    <div v-if="isLoggedIn" id="vanta-birds-bg" class="vanta-background"></div>

    <!-- 登录背景轮播 -->
    <div v-if="!isLoggedIn" class="login-carousel-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
      <div 
        class="carousel-wrapper" 
        :style="getCarouselStyle()"
      >
        <!-- 最后一张的副本（放在最前面，用于从第一张向左滑动） -->
        <div 
          class="carousel-item"
          :style="{ backgroundImage: `url(${loginImages[loginImages.length - 1]})` }"
        ></div>
        <!-- 原始图片 -->
        <div 
          v-for="(_image, index) in loginImages" 
          :key="index" 
          class="carousel-item"
          :style="{ backgroundImage: `url(${loginImages[index]})` }"
        ></div>
        <!-- 第一张的副本（放在最后面，用于从最后一张向右滑动） -->
        <div 
          class="carousel-item"
          :style="{ backgroundImage: `url(${loginImages[0]})` }"
        ></div>
      </div>
      <!-- 指示器 -->
      <div class="carousel-indicators">
        <span 
          v-for="(_, index) in loginImages" 
          :key="index"
          class="indicator"
          :class="{ active: getDisplayIndex() === index }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>

    <div class="page-content" :class="{ 'with-carousel': !isLoggedIn }">
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

                    <el-form-item label="用户角色" prop="role">
                      <el-radio-group v-model="registerForm.role">
                        <el-radio label="user">普通用户</el-radio>
                        <el-radio label="admin">管理员</el-radio>
                      </el-radio-group>
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

        <div v-if="isLoggedIn" class="profile-content">
          <el-row :gutter="24">
            <el-col :md="8" :sm="24" :xs="24">
              <el-card class="profile-card">
                <div class="profile-header">
                  <el-avatar :src="user?.avatar || defaultAvatar" :size="80">
                    {{ user?.name?.charAt(0) }}
                  </el-avatar>
                  <h3>{{ user?.name }}</h3>
                  <p class="user-title">{{ user?.title }}</p>
                  <p class="user-institution">{{ user?.institution }}</p>
                </div>
                <p class="email"><el-icon><Message /></el-icon> {{ user.email }}</p>
                <p class="bio">{{ user.bio || '这个人很懒，什么都没有写...' }}</p>
              </el-card>

              <div class="actions-section">
                <el-button type="primary" plain round @click="showEditDialog = true">编辑资料</el-button>
                <el-button 
                  v-if="verificationStatus === 'unverified' || verificationStatus === 'rejected'"
                  type="success" 
                  plain 
                  round 
                  @click="showVerificationDialog = true"
                >
                  申请认证
                </el-button>
                <el-tag v-else-if="verificationStatus === 'pending'" type="warning" class="status-tag">认证审核中</el-tag>
                <el-tag v-else-if="verificationStatus === 'verified'" type="success" class="status-tag">已认证学者</el-tag>
                <el-button type="danger" plain round @click="handleLogout">退出登录</el-button>
              </div>
            </el-col>
          </el-row>

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

    <!-- Verification Dialog -->
    <el-dialog v-model="showVerificationDialog" title="学者身份认证" width="500px">
      <el-form 
        ref="verificationFormRef"
        :model="verificationForm" 
        :rules="verificationRules"
        label-position="top"
      >
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="verificationForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        
        <el-form-item label="教育邮箱" prop="email">
          <el-input v-model="verificationForm.email" placeholder="请输入edu邮箱">
            <template #append>
              <el-button 
                @click="handleSendCode" 
                :disabled="codeSending || codeCountdown > 0"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="code" :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]">
          <el-input v-model="verificationForm.code" placeholder="请输入验证码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showVerificationDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmitVerification" 
            :loading="submittingVerification"
          >
            提交申请
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import type { FormRules, FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
 
  Message
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'
import * as authApi from '../api/auth'
import * as userApi from '../api/user'

// 导入登录背景图片
import login1 from '@/assets/login1.png'
import login2 from '@/assets/login2.png'
import login3 from '@/assets/login3.png'
import login4 from '@/assets/login4.png'
import login5 from '@/assets/login5.png'
import login6 from '@/assets/login6.png'
import login7 from '@/assets/login7.png'
import login8 from '@/assets/login8.png'
import login9 from '@/assets/login9.png'
import login10 from '@/assets/login10.png'
import defaultAvatar from '@/assets/profile.png'

// 轮播相关
const loginImages = [login1, login2, login3, login4, login5, login6, login7, login8, login9, login10]
// currentIndex 现在表示实际位置（包括副本），范围是 0 到 loginImages.length + 1
// 0 是最后一张的副本，1 到 loginImages.length 是原始图片，loginImages.length + 1 是第一张的副本
const currentIndex = ref(1) // 从第一张真实图片开始
const isTransitioning = ref(true)
let autoPlayTimer: any = null
let touchStartX = 0
let touchEndX = 0
let isDragging = ref(false)
let dragStartX = 0
let dragOffset = ref(0)

let vantaEffect: any = null
let vantaPromise: Promise<void> | null = null

// 动态加载外部脚本
const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script ${src}`))
    document.head.appendChild(script)
  })
}

const ensureVantaBirds = async () => {
  if (typeof window === 'undefined') return
  if (!vantaPromise) {
    vantaPromise = (async () => {
      if (!(window as any).THREE) {
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.min.js')
      }
      if (!(window as any).VANTA || !(window as any).VANTA.BIRDS) {
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js')
      }
    })()
  }
  await vantaPromise
}

// 获取显示的索引（用于指示器）
const getDisplayIndex = () => {
  if (currentIndex.value === 0) {
    return loginImages.length - 1 // 显示最后一张
  } else if (currentIndex.value === loginImages.length + 1) {
    return 0 // 显示第一张
  } else {
    return currentIndex.value - 1 // 显示对应的真实图片
  }
}

// 计算轮播样式
const getCarouselStyle = () => {
  // 总共有 loginImages.length + 2 张图片（原始 + 2个副本）
  const baseOffset = -currentIndex.value * 100
  const dragOffsetPercent = isDragging.value ? (dragOffset.value / window.innerWidth) * 100 : 0
  const totalOffset = baseOffset + dragOffsetPercent
  
  return {
    transform: `translateX(${totalOffset}%)`,
    transition: isTransitioning.value && !isDragging.value ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
  }
}

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user || ({} as any))
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
  confirmPassword: '',
  role: 'user' as 'user' | 'admin' | 'administrator'
})

const editForm = reactive({
  name: '',
  bio: '',
  interests: []
})

const verificationForm = ref({
  email: '',
  realName: '',
  code: ''
})
const verificationFormRef = ref<FormInstance>()
const verificationStatus = ref('unverified')
const showVerificationDialog = ref(false)
const submittingVerification = ref(false)
const codeSending = ref(false)
const codeCountdown = ref(0)
let codeTimer: any = null
const sentCode = ref('')

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

      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ]
})

// 认证表单验证规则
const verificationRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入edu邮箱', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (!value) return callback(new Error('请输入edu邮箱'))
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.edu(\.[A-Za-z]{2,})?$/.test(value)) {
          callback(new Error('请输入有效的edu邮箱'))
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
    console.log('准备发送登录请求，用户名:', loginForm.username)
    const result = await authStore.login(loginForm.username, loginForm.password)
    console.log('登录结果:', result)
    if (result.success) {
      ElMessage.success('登录成功')
      await authStore.refreshUserInfo()
      await loadCertificationStatus()
      // 登录成功后跳转到首页
      router.push('/')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录异常:', error)
    ElMessage.error('登录失败')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  registerLoading.value = true
  try {
    const result = await authStore.register(
      registerForm.name,
      registerForm.email,
      registerForm.password,
      registerForm.role
    )
    if (result.success) {
      ElMessage.success('注册成功，请登录')
      authTab.value = 'login'
    } else {
      ElMessage.error(result.message || '注册失败')
    }
  } catch (error) {
    ElMessage.error('注册失败')
  } finally {
    registerLoading.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}


// 认证相关方法
const handleSendCode = async () => {
  const email = verificationForm.value.email
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.edu(\.[A-Za-z]{2,})?$/.test(email)) {
    ElMessage.error('请输入有效的edu邮箱')
    return
  }
  codeSending.value = true
  try {
    await authApi.forgotPassword({ email })
    ElMessage.success('验证码已发送到邮箱')
    codeCountdown.value = 60
    codeTimer && clearInterval(codeTimer)
    codeTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(codeTimer)
        codeCountdown.value = 0
      }
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败')
  } finally {
    codeSending.value = false
  }
}

const handleSubmitVerification = async () => {
  submittingVerification.value = true
  const formRef = verificationFormRef.value
  if (!formRef) return
  formRef.validate(async (valid: boolean) => {
    if (!valid) {
      submittingVerification.value = false
      return
    }
    try {
      await userApi.submitCertification({
        realName: verificationForm.value.realName,
        organization: '', // 需要从表单获取
        orgEmail: verificationForm.value.email,
        title: '', // 需要从表单获取
        proofMaterials: []
      })
      verificationStatus.value = 'pending'
      showVerificationDialog.value = false
      submittingVerification.value = false
      ElMessage.success('认证申请已提交，等待审核')
      resetVerificationForm()
      await loadCertificationStatus()
    } catch (error: any) {
      ElMessage.error(error.message || '提交认证申请失败')
      submittingVerification.value = false
    }
  })
}

const saveProfile = async () => {
  console.log('saveProfile called', editForm)
  showEditDialog.value = false
}

const loadCertificationStatus = async () => {
  if (!authStore.isLoggedIn) return
  try {
    const response = await userApi.getCertificationStatus()
    if (response.status) {
      const status = String(response.status)
      verificationStatus.value = status === 'certified' ? 'verified' : 
                                  status === 'pending' ? 'pending' :
                                  status === 'rejected' ? 'rejected' : 'unverified'
    }
  } catch (error) {
    // 如果接口返回404或其他错误，说明未申请认证
    verificationStatus.value = 'unverified'
  }
}

const resetVerificationForm = () => {
  verificationForm.value = {
    realName: '',
    email: '',
    code: ''
  }
  sentCode.value = ''
  codeCountdown.value = 0
  codeTimer && clearInterval(codeTimer)
}

// 轮播方法
const startAutoPlay = () => {
  if (autoPlayTimer) clearInterval(autoPlayTimer)
  autoPlayTimer = setInterval(() => {
    nextSlide()
  }, 3000)
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

const nextSlide = () => {
  isTransitioning.value = true
  currentIndex.value++
  
  // 如果滑动到第一张的副本（最后一张后面），等待动画完成后跳转到真实的第一张
  if (currentIndex.value === loginImages.length + 1) {
    setTimeout(() => {
      isTransitioning.value = false
      currentIndex.value = 1
      // 使用 requestAnimationFrame 确保在下一帧恢复动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isTransitioning.value = true
        })
      })
    }, 800) // 等待动画完成（0.8s）
  }
}

const prevSlide = () => {
  isTransitioning.value = true
  currentIndex.value--
  
  // 如果滑动到最后一张的副本（第一张前面），等待动画完成后跳转到真实的最后一张
  if (currentIndex.value === 0) {
    setTimeout(() => {
      isTransitioning.value = false
      currentIndex.value = loginImages.length
      // 使用 requestAnimationFrame 确保在下一帧恢复动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isTransitioning.value = true
        })
      })
    }, 800) // 等待动画完成（0.8s）
  }
}

const goToSlide = (index: number) => {
  isTransitioning.value = true
  // index 是 0 到 loginImages.length - 1，需要转换为 1 到 loginImages.length
  currentIndex.value = index + 1
  stopAutoPlay()
  startAutoPlay()
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
  isTransitioning.value = false
  stopAutoPlay()
}

const handleTouchMove = (e: TouchEvent) => {
  touchEndX = e.touches[0].clientX
  const diff = touchEndX - touchStartX
  dragOffset.value = -diff
  isDragging.value = true
}

const handleTouchEnd = () => {
  isDragging.value = false
  isTransitioning.value = true
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
  dragOffset.value = 0
  startAutoPlay()
}

// 鼠标拖拽事件处理
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  dragStartX = e.clientX
  dragOffset.value = 0
  isTransitioning.value = false
  stopAutoPlay()
  e.preventDefault()
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  dragOffset.value = e.clientX - dragStartX
}

const handleMouseUp = () => {
  if (!isDragging.value) return
  const offset = dragOffset.value
  isDragging.value = false
  isTransitioning.value = true
  
  if (Math.abs(offset) > 50) {
    if (offset > 0) {
      prevSlide()
    } else {
      nextSlide()
    }
  }
  dragOffset.value = 0
  startAutoPlay()
}

onMounted(async () => {
  await authStore.initAuth()
  settingsStore.loadSettings()
  
  if (authStore.isLoggedIn) {
    await loadCertificationStatus()
    await ensureVantaBirds()
    // 等待 DOM 渲染后再初始化 Vanta.js
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).VANTA) {
        vantaEffect = (window as any).VANTA.BIRDS({
          el: '#vanta-birds-bg',
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          backgroundColor: 0xf9f7ec,
          colorMode: "lerpGradient",
          color1: 0xff0000,
          color2: 0xd1ff,
          birdSize: 1.40,
          quantity: 5.00,
          wingSpan: 30.00,
          speedLimit: 5.00,
          separation: 20.00,
          alignment: 20.00,
          cohesion: 20.00
        })
      }
    }, 100)
  } else {
    // 未登录时启动轮播
    startAutoPlay()
  }
})

onUnmounted(() => {
  stopAutoPlay()
  // 清理 Vanta.js 实例
  if (vantaEffect) {
    vantaEffect.destroy()
  }
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  position: relative;
}

// Vanta.js Birds 背景样式
.vanta-background {
  position: fixed;
  top: 64px; // 导航栏高度
  left: 0;
  width: 100%;
  height: calc(100vh - 64px);
  z-index: 0;
  pointer-events: none;
}

// 登录背景轮播样式
.login-carousel-container {
  position: fixed;
  top: 64px; // 导航栏高度，从导航栏下方开始
  left: 0;
  width: 100%;
  height: calc(100vh - 64px); // 减去导航栏高度
  z-index: 0;
  overflow: hidden;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }

  .carousel-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    will-change: transform;
    backface-visibility: hidden;
    perspective: 1000px;
  }

  .carousel-item {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    background-size: 100% auto;
    background-position: center top;
    background-repeat: no-repeat;
    will-change: transform;
  }

  .carousel-indicators {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 10;

    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.8);
        transform: scale(1.2);
      }

      &.active {
        background-color: rgba(255, 255, 255, 1);
        width: 24px;
        border-radius: 5px;
      }
    }
  }
}

.page-content {
  position: relative;
  z-index: 1;

  &.with-carousel {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 64px);
    
    .auth-section {
      width: 100%;
      max-width: 450px;
      margin: 0 auto;
      
      .auth-card {
        background-image: url('@/assets/bg1.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border: 2px solid rgba(0, 0, 0, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
                    0 2px 8px rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        overflow: hidden;
        position: relative;

        // 中世纪装饰边框
        &::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, 
            rgba(212, 175, 55, 0.3) 0%, 
            transparent 25%, 
            transparent 75%, 
            rgba(212, 175, 55, 0.3) 100%);
          border-radius: 16px;
          z-index: -1;
          opacity: 0.6;
        }

        :deep(.el-card__body) {
          padding: 40px 35px;
          position: relative;
        }

        .auth-tabs {
          :deep(.el-tabs__header) {
            margin-bottom: 30px;
          }

          :deep(.el-tabs__nav-wrap::after) {
            background: rgba(0, 0, 0, 0.2);
            height: 2px;
          }

          :deep(.el-tabs__item) {
            color: #000;
            font-weight: 700;
            font-size: 20px;
            font-family: 'Georgia', 'Times New Roman', serif;

            &.is-active {
              color: #000;
              font-weight: 700;
              text-shadow: none;
            }

            &:hover {
              color: #000;
            }
          }

          :deep(.el-tabs__active-bar) {
            display: none;
          }

          :deep(.el-form-item__label) {
            color: #000;
            font-weight: 700;
            font-family: 'Georgia', 'Times New Roman', serif;
            text-shadow: none;
          }

          :deep(.el-input__wrapper) {
            background-color: rgba(255, 255, 255, 0.9);
            border: 2px solid rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;

            &:hover {
              background-color: rgba(255, 255, 255, 0.95);
              border-color: rgba(0, 0, 0, 0.5);
            }

            &.is-focus {
              background-color: #fff;
              border-color: #000;
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.2);
            }
          }

          :deep(.el-input__inner) {
            color: #000;
            font-weight: 600;
            font-family: 'Georgia', 'Times New Roman', serif;

            &::placeholder {
              color: rgba(0, 0, 0, 0.5);
            }
          }

          :deep(.el-input__prefix) {
            .el-icon {
              color: #000;
            }
          }

          :deep(.el-input__suffix) {
            .el-icon {
              color: #000;
            }
          }

          :deep(.el-button--primary) {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            font-weight: 700;
            color: #fff;
            text-shadow: none;
            transition: all 0.3s ease;
            font-family: 'Georgia', 'Times New Roman', serif;

            &:hover {
              background: #000;
              border-color: #000;
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
              transform: translateY(-2px);
            }

            &:active {
              transform: translateY(0);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
          }

          :deep(.el-alert) {
            background-color: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;

            .el-alert__content {
              .el-alert__title {
                color: rgba(255, 255, 255, 0.95);
              }

              .el-alert__description {
                color: rgba(255, 255, 255, 0.85);
              }
            }
          }
        }

      }
    }
  }

}

/* Auth Styles */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 60vh;
  position: relative;
  z-index: 2;
  padding: 20px;

  .auth-card {
    width: 100%;
    max-width: 420px;
  }
}

// 登录页面样式
.profile-page.login-page {
  :deep(.page-header) {
    background-image: url('@/assets/bg1.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-bottom: 2px solid rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  :deep(.page-header .container) {
    .logo-link {
      .logo-text {
        color: #000 !important;
        text-shadow: none;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-weight: 700;
      }

      .el-icon {
        color: #000 !important;
        filter: none;
      }
    }

    .nav-menu {
      :deep(.el-menu-item) {
        color: #000 !important;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-weight: 700;

        &.is-active {
          color: #000 !important;
          border-bottom-color: #000 !important;
          text-shadow: none;
        }

        &:hover {
          color: #000 !important;
          background-color: rgba(0, 0, 0, 0.1) !important;
        }

        &.user-menu-item {
          .user-avatar-wrapper {
            .user-avatar {
              border-color: #000 !important;
            }

            .user-name {
              color: #000 !important;
              font-weight: 700 !important;
            }

            .user-icon {
              color: #000 !important;
            }
          }
        }
      }
    }

    .search-wrapper {
      :deep(.el-input__wrapper) {
        background-color: rgba(255, 255, 255, 0.9) !important;
        border: 2px solid rgba(0, 0, 0, 0.3) !important;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

        .el-input__inner {
          color: #000 !important;
          font-weight: 600;

          &::placeholder {
            color: rgba(0, 0, 0, 0.5) !important;
          }
        }

        .el-icon {
          color: #000 !important;
        }
      }
    }
  }
}

.profile-content {
  .profile-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    overflow: hidden;

    .profile-header {
      text-align: center;
      margin-bottom: 24px;

      h3 {
        margin: 12px 0 4px 0;
        font-size: 22px;
        font-weight: 700;
        color: #2c3e50;
      }

      .user-title, .user-institution {
        margin: 4px 0;
        color: #666;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}


    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      .stat-item {
        text-align: center;
        background: #f8f9fa;
        border-radius: 12px;
        padding: 12px 8px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;

        &:hover {
          background: #f0f2f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1890ff;
          margin-bottom: 4px;
        }

        .stat-label {
          display: block;
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
      }
    }

    .profile-actions {
      text-align: center;

      .el-button {
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }
      }
    }
  

  .content-card {
    background-image: url('@/assets/accept.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2),
                0 2px 8px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    overflow: hidden;
    position: relative;

    // 添加半透明遮罩层，使文字更清晰
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.75));
      z-index: 0;
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
    }

    :deep(.el-tabs) {
      position: relative;
      z-index: 1;

      .el-tabs__header {
        margin-bottom: 20px;
      }

      .el-tabs__item {
        color: #34495e;
        font-weight: 600;
        font-size: 16px;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);

        &.is-active {
          color: #1890ff;
          font-weight: 700;
        }

        &:hover {
          color: #1890ff;
        }
      }

      .el-tabs__active-bar {
        display: none;
      }

      .el-tabs__nav-wrap::after {
        background-color: rgba(24, 144, 255, 0.2);
      }
    }

    .info-content {
      position: relative;
      z-index: 1;

      h4 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 700;
        color: #2c3e50;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
      }

      .research-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 24px;

        .el-tag {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(24, 144, 255, 0.3);
          color: #1890ff;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(24, 144, 255, 0.1);
            border-color: #1890ff;
            transform: translateY(-2px);
          }
        }
      }

      p {
        margin: 12px 0;
        color: #34495e;
        font-weight: 500;
        font-size: 15px;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);

        strong {
          color: #2c3e50;
          font-weight: 700;
        }
      }
      .edit-avatar-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
    }


    // 认证相关样式
    .verification-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;

      h4 {
        margin-bottom: 16px;
        color: #2c3e50;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
      }

      .verification-status {
        margin-bottom: 12px;

        .status-verified,
        .status-pending,
        .status-rejected,
        .status-unverified {
          display: flex;
          align-items: center;
          gap: 8px;

          .status-icon {
            font-size: 18px;
          }

          .status-text {
            font-weight: 500;
          }
        }

        .status-verified .status-icon {
          color: var(--el-color-success);
        }

        .status-pending .status-icon {
          color: var(--el-color-warning);
        }

        .status-rejected .status-icon {
          color: var(--el-color-danger);
        }

        .status-unverified .status-icon {
          color: var(--el-color-info);
        }
      }

      .verification-desc {
        font-size: 13px;
        color: #34495e;
        margin: 8px 0 0 0;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
      }
    }

      .name-row {
        display: flex;
        align-items: center;
        gap: 10px;
        h1 { margin: 0; font-size: 28px; color: #303133; }
      }


      .managed-papers {
        h5 {
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 700;
          color: #2c3e50;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .papers-list {
          .managed-paper-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 12px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;

            &:hover {
              background: rgba(255, 255, 255, 0.85);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .paper-info {
              flex: 1;

              .paper-title {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
              }

              .paper-meta {
                margin: 4px 0;
                font-size: 14px;
                color: #34495e;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
              }

              .paper-stats {
                display: flex;
                gap: 16px;
                font-size: 13px;
                color: #34495e;
                font-weight: 500;
                margin-top: 8px;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
              }
            }

            .paper-actions {
              display: flex;
              gap: 8px;

              .el-button {
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(24, 144, 255, 0.3);
                color: #1890ff;
                font-weight: 600;
                backdrop-filter: blur(10px);

                &:hover {
                  background: #1890ff;
                  color: #fff;
                  border-color: #1890ff;
                }
              }
            }
          }
        }

        .empty-papers {
          text-align: center;
          padding: 40px 0;
          color: #34495e;
          font-weight: 500;
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

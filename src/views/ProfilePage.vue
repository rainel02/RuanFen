<template>
  <div class="profile-page" :class="{ 'login-page': !isLoggedIn }">
    <AppHeader />

    <!-- Vanta.js Birds 背景（已登录用户） -->
    <div v-if="isLoggedIn" id="vanta-birds-bg" class="vanta-background"></div>
    <!-- ...existing code... -->
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
                      <el-radio-group v-model="registerForm.role" @change="handleRoleChange">
                        <el-radio label="user">普通用户</el-radio>
                        <el-radio label="admin">管理员</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <el-form-item 
                      v-if="registerForm.role === 'admin'" 
                      label="邀请码" 
                      prop="inviteCode"
                    >
                      <el-input 
                        v-model="registerForm.inviteCode" 
                        placeholder="请输入管理员邀请码" 
                        type="password"
                        show-password
                      />
                      <div style="font-size: 12px; color: #909399; margin-top: 5px;">
                        只有输入正确的邀请码才能注册为管理员
                      </div>
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
          <!-- Profile Header Card -->
          <div class="profile-header-card glass-panel">
            <div class="header-bg" :style="{ backgroundImage: `url(${headerBgImage})` }"></div>
            <div class="header-content">
              <div class="avatar-section">
                <el-avatar :src="user?.avatar || defaultAvatar" :size="140" class="main-avatar">
                  {{ user?.name?.charAt(0) || '?' }}
                </el-avatar>
              </div>
              <div class="info-section">
                <div class="name-row">
                  <h1 style="display: inline-flex; align-items: center; gap: 8px;">
                    {{ user?.name }}
                    <template v-if="verificationStatus === 'approved'">
                      <el-tag
                        type="success"
                        effect="dark"
                        round
                        size="small"
                        class="verified-tag"
                        style="display: inline-flex; align-items: center; gap: 4px; font-size: 15px; margin-left: 4px; vertical-align: middle;"
                      >
                        <el-icon><Select /></el-icon>
                        认证学者
                      </el-tag>
                    </template>
                    <template v-else-if="verificationStatus === 'pending'">
                      <el-tag type="warning" effect="dark" round size="small" class="pending-tag" style="margin-left: 4px;">审核中</el-tag>
                    </template>
                  </h1>
                </div>
                <p class="title">{{ user?.title || '用户' }}</p>
                <p class="institution">
                  <el-icon><School /></el-icon> 
                  {{ user?.organization || '未设置机构' }}
                </p>
                <div class="bio-preview">{{ user?.bio || '这个人很懒，什么都没有写...' }}</div>
                
                <div class="action-buttons">
                  <el-button 
                    class="gothic-btn"
                    @click="showEditDialog = true"
                  >
                    <el-icon><Edit /></el-icon> 编辑资料
                  </el-button>
                  <template v-if="verificationStatus === 'unverified' || verificationStatus === 'rejected'">
                    <el-button 
                      class="gothic-btn"
                      @click="showVerificationDialog = true"
                    >
                      <el-icon><DocumentChecked /></el-icon> 申请认证
                    </el-button>
                  </template>
                  <el-button 
                    class="gothic-btn danger-btn"
                    @click="handleLogout"
                  >
                    <el-icon><SwitchButton /></el-icon> 退出登录
                  </el-button>
                </div>
              </div>
              
              <div class="stats-section">
                <div class="stat-box clickable" @click="showFollowingDialog = true">
                  <div class="value">{{ followingCount }}</div>
                  <div class="label">关注</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box clickable" @click="showFollowersDialog = true">
                  <div class="value">{{ followersCount }}</div>
                  <div class="label">粉丝</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                  <div class="value">0</div>
                  <div class="label">获赞</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <el-row :gutter="24" class="main-body">
            <!-- Left Column -->
            <el-col :lg="8" :md="24" :sm="24" :xs="24">
              <div class="sidebar-stack">
                <!-- About Card -->
                <div class="glass-panel sidebar-card">
                  <h3><el-icon><UserFilled /></el-icon> 个人信息</h3>
                  <div class="info-group">
                    <label><el-icon><Message /></el-icon> 邮箱</label>
                    <div class="contact-row">{{ user?.email }}</div>
                  </div>
                  <div class="info-group" v-if="user?.bio">
                    <label><el-icon><Document /></el-icon> 个人简介</label>
                    <div class="bio-text">{{ user?.bio }}</div>
                  </div>
                </div>
              </div>
            </el-col>

            <!-- Right Column -->
            <el-col :lg="16" :md="24" :sm="24" :xs="24">
              <div class="glass-panel content-card">
                <el-tabs v-model="activeTab" class="custom-tabs">
                  <el-tab-pane label="我的收藏" name="favorites">
                    <template #label>
                      <span><el-icon><Star /></el-icon> 我的收藏</span>
                    </template>
                    <div class="collections-content">
                      <div v-if="collections.length === 0" class="empty-state">
                        <el-empty description="暂无收藏内容" />
                      </div>
                      <div v-else class="collections-list">
                        <div 
                          v-for="item in collections" 
                          :key="item.id"
                          class="collection-item glass-panel"
                        >
                          <div class="item-info">
                            <h4>{{ item.title || '未命名成果' }}</h4>
                            <p class="item-meta">{{ item.authors?.join(', ') || '未知作者' }} · {{ item.year || '未知年份' }}</p>
                          </div>
                          <el-button 
                            class="gothic-btn-small"
                            @click="removeFromCollection(item.id)"
                          >
                            <el-icon><Delete /></el-icon> 取消收藏
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="我的帖子" name="posts">
                    <template #label>
                      <span><el-icon><ChatLineRound /></el-icon> 我的帖子</span>
                    </template>
                    <template v-if="myPosts && myPosts.length === 0">
                      <div class="empty-state">
                        <el-empty description="暂无帖子" />
                      </div>
                    </template>
                    <template v-else-if="myPosts && myPosts.length > 0">
                      <div class="my-posts-list">
                        <div
                          v-for="post in myPosts"
                          :key="post.postId || post.id"
                          class="my-post-card"
                          @click="router.push(`/forum/post/${post.postId || post.id}`)"
                        >
                          <div class="my-post-title">
                            <el-icon style="color:#b8893a"><ChatLineRound /></el-icon>
                            {{ post.title || '未命名帖子' }}
                          </div>
                          <div class="my-post-meta">
                            <span>{{ post.boardName || post.boardId || '未知板块' }}</span>
                            <span v-if="post.createdAt">{{ post.createdAt.split('T')[0] }}</span>
                          </div>
                          <div class="my-post-divider"></div>
                          <div class="my-post-summary">
                            {{ post.contentPreview || post.content?.replace(/[#*`]/g, '').slice(0, 80) || '无内容摘要' }}<span v-if="(post.content?.length || 0) > 80">...</span>
                          </div>
                          <div class="my-post-actions">
                            <span class="my-post-author">作者：{{ post.author?.username || post.authorName || user?.name || '我' }}</span>
                            <el-button size="small" type="primary" plain @click.stop="router.push(`/forum/post/${post.postId || post.id}`)">查看详情</el-button>
                          </div>
                        </div>
                      </div>
                    </template>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <el-dialog v-model="showEditDialog" title="编辑个人资料" width="500px" class="gothic-dialog">
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
    <el-dialog v-model="showVerificationDialog" title="学者身份认证" width="500px" class="gothic-dialog">
      <el-form 
        ref="verificationFormRef"
        :model="verificationForm" 
        :rules="verificationRules"
        label-position="top"
      >
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="verificationForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="所属机构" prop="organization">
          <el-input v-model="verificationForm.organization" placeholder="请输入所属机构" />
        </el-form-item>
        <el-form-item label="机构邮箱（可选）" prop="email">
          <el-input v-model="verificationForm.email" placeholder="请输入机构邮箱（可选）" />
        </el-form-item>
        <el-form-item label="职称/学位（可选）" prop="title">
          <el-input v-model="verificationForm.title" placeholder="如：教授、博士（可选）" />
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

    <!-- Following List Dialog -->
    <el-dialog v-model="showFollowingDialog" title="我关注的学者" width="500px" class="gothic-dialog">
      <div v-if="followingList.length === 0" class="empty-state">
        <el-empty description="暂无关注的学者" />
      </div>
      <div v-else class="following-list">
        <div 
          v-for="item in followingList" 
          :key="item.userId || item.id"
          class="follow-item glass-panel"
        >
          <div class="follow-item-content" @click="router.push(`/scholars/${item.userId || item.id}`); showFollowingDialog = false; handleFollowChanged();">
            <el-avatar :src="item.avatarUrl || defaultAvatar" :size="40">{{ item.name?.charAt(0) || '?' }}</el-avatar>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p>{{ item.organization }}</p>
            </div>
          </div>
          <el-button 
            class="gothic-btn-small unfollow-btn"
            @click.stop="async () => { await handleUnfollow(item.userId || item.id); await handleFollowChanged(); }"
          >
            <el-icon><Close /></el-icon> 取消关注
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- Followers List Dialog -->
    <el-dialog v-model="showFollowersDialog" title="我的粉丝" width="500px" class="gothic-dialog">
      <div v-if="followersList.length === 0" class="empty-state">
        <el-empty description="暂无粉丝" />
      </div>
      <div v-else class="followers-list">
        <div 
          v-for="item in followersList" 
          :key="item.userId || item.id"
          class="follow-item glass-panel"
          @click="router.push(`/scholars/${item.userId || item.id}`); showFollowersDialog = false;"
        >
          <el-avatar :src="item.avatarUrl || defaultAvatar" :size="40">{{ item.name?.charAt(0) || '?' }}</el-avatar>
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p>{{ item.organization }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getFollowers, getFollowing } from '../api/social'
const followersCount = ref(0)
const followingCount = ref(0)

const loadFollowStats = async () => {
  if (!authStore.user || !authStore.user.id) return
  try {
    const [followersRes, followingRes] = await Promise.all([
      getFollowers(authStore.user.id),
      getFollowing(authStore.user.id)
    ])
    console.log('getFollowers 返回:', followersRes)
    console.log('getFollowing 返回:', followingRes)
    // 兼容返回 { total, following: [...] } 或 { total, followers: [...] }
    const followersResAny = followersRes as any
    const followingResAny = followingRes as any
    const followersData: any = followersResAny?.data || followersResAny
    const followingData: any = followingResAny?.data || followingResAny
    
    if (followersData && Array.isArray(followersData.followers)) {
      followersCount.value = followersData.followers.length
    } else if (followersData && Array.isArray(followersData.results)) {
      followersCount.value = followersData.results.length
    } else if (Array.isArray(followersData)) {
      followersCount.value = followersData.length
    } else {
      followersCount.value = 0
    }
    
    if (followingData && Array.isArray(followingData.following)) {
      followingCount.value = followingData.following.length
    } else if (followingData && Array.isArray(followingData.results)) {
      followingCount.value = followingData.results.length
    } else if (Array.isArray(followingData)) {
      followingCount.value = followingData.length
    } else {
      followingCount.value = 0
    }
  } catch (e) {
    followersCount.value = 0
    followingCount.value = 0
  }
}

import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import type { FormRules, FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Message, UserFilled, School, Document, Edit, DocumentChecked, SwitchButton,
  Select, Star, Clock, ChatLineRound, Delete
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'
import * as authApi from '../api/auth'
import * as userApi from '../api/user'
import * as achievementApi from '../api/index'
import * as socialApi from '../api/social'
import defaultAvatar from '@/assets/profile.png'
import pic1 from '@/assets/pic1.jpg'
import pic2 from '@/assets/pic2.jpg'
import pic3 from '@/assets/pic3.jpg'

// 我的帖子相关
const myPosts = ref<any[]>([])
const loadMyPosts = async () => {
  myPosts.value = []
  try {
    const res = await socialApi.getPosts()
    // 兼容多种返回格式
    let posts = (res as any).posts || (res as any).data || res
    if (!Array.isArray(posts)) posts = []
    const userId = authStore.user?.id || (authStore.user as any)?.userId
    myPosts.value = posts.filter((p: any) => {
      // 兼容 author 字段结构
      const authorId = p.author?.id || p.author?.userId || p.authorId || p.userId
      return userId && authorId && String(authorId) === String(userId)
    })
  } catch (e) {
    myPosts.value = []
  }
}

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

// 随机选择背景图片
const backgroundImages = [pic1, pic2, pic3]
const headerBgImage = ref(backgroundImages[Math.floor(Math.random() * backgroundImages.length)])

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
  role: 'user' as 'user' | 'admin' | 'administrator',
  inviteCode: ''
})

const editForm = reactive({
  name: '',
  bio: '',
  interests: []
})

const verificationForm = ref({
  realName: '',
  organization: '',
  email: '',
  title: ''
})
const verificationFormRef = ref<FormInstance>()
const verificationStatus = ref('unverified')
const showVerificationDialog = ref(false)
const submittingVerification = ref(false)

// 收藏和成果相关
const collections = ref<any[]>([])
const showAchievementDialog = ref(false)
const editingAchievement = ref<any>(null)

// 关注和粉丝相关（followingCount、followersCount 只声明一次）
// const followingCount = ref(0)
// const followersCount = ref(0)
const followingList = ref<any[]>([])
const followersList = ref<any[]>([])
const showFollowingDialog = ref(false)
const showFollowersDialog = ref(false)

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
  ],
  inviteCode: [
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (registerForm.role === 'admin') {
          if (!value || value.trim() === '') {
            callback(new Error('请输入管理员邀请码'))
          } else if (value !== '123456') {
            callback(new Error('邀请码错误，请输入正确的管理员邀请码'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 认证表单验证规则
const verificationRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  organization: [
    { required: true, message: '请输入所属机构', trigger: 'blur' }
  ],
  email: [
    // 邮箱可选，不做强校验
  ],
  title: [
    // 职称/学位可选
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

const handleRoleChange = () => {
  // 切换角色时清空邀请码
  registerForm.inviteCode = ''
  // 清除邀请码的验证错误
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate('inviteCode')
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  // 如果是管理员，验证邀请码
  if (registerForm.role === 'admin' && registerForm.inviteCode !== '123456') {
    ElMessage.error('管理员邀请码错误，请输入123456')
    return
  }
  
  // 验证表单
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) {
      registerLoading.value = false
      return
    }
  })
  
  registerLoading.value = true
  try {
    const result = await authStore.register(
      registerForm.name,
      registerForm.email,
      registerForm.password,
      registerForm.role
    )
    console.log('注册结果:', result)
    if (result.success) {
      // 确保使用绿色成功提示
      ElMessage.success('注册成功，请登录')
      // ElMessage({
      //   message: '注册成功，请登录',
      //   type: 'success',
      //   duration: 3000
      // })
      authTab.value = 'login'
      // 重置表单
      registerForm.name = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.role = 'user'
      registerForm.inviteCode = ''
    } else {
      console.log("HEREEEEEEEEEEEEEEEEEE")
      if(result.message === "注册成功"){
        ElMessage.success('注册成功')
        authTab.value = 'login'
        // 重置表单
        registerForm.name = ''
        registerForm.email = ''
        registerForm.password = ''
        registerForm.confirmPassword = ''
        registerForm.role = 'user'
        registerForm.inviteCode = ''
        return
      }
      ElMessage.error(result.message || '注册失败')
    }
  } catch (error: any) {
    // 如果注册API调用失败，显示错误信息
    const errorMsg = error?.message || error?.response?.data?.message || '注册失败'
    ElMessage.error(errorMsg)
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
  if (!email) {
    ElMessage.warning('请输入邮箱（可非 edu），无需验证码')
    return
  }
  ElMessage.success('学者认证无需验证码，直接提交即可')
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
        organization: verificationForm.value.organization,
        orgEmail: verificationForm.value.email,
        title: verificationForm.value.title,
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
  try {
    const payload: any = {
      preferences: {
        bio: editForm.bio || '',
        interests: editForm.interests || []
      }
    }
    
    // username 必须 3-50 字符，只有符合条件时才发送
    if (editForm.name && editForm.name.trim().length >= 3 && editForm.name.trim().length <= 50) {
      payload.username = editForm.name.trim()
    }
    
    console.log('Sending update payload:', JSON.stringify(payload, null, 2))
    console.log('Calling userApi.updateCurrentUser...')
    
    // 调用 API 更新用户资料
    const result = await userApi.updateCurrentUser(payload)
    
    console.log('API call successful, result:', result)
    
    // 更新本地 authStore 中的用户信息
    if (authStore.user && result) {
      if (payload.username) {
        authStore.user.username = payload.username
        authStore.user.name = payload.username
      }
      
      // 解析并更新 preferences
      if (result.preferences) {
        try {
          const prefs = typeof result.preferences === 'string' 
            ? JSON.parse(result.preferences) 
            : result.preferences
          authStore.user.bio = prefs.bio || ''
          // @ts-ignore - interests 属性可能不在类型定义中，但实际存在
          if (authStore.user) {
            (authStore.user as any).interests = prefs.interests || []
          }
        } catch (e) {
          console.error('Failed to parse preferences:', e)
        }
      }
    }
    
    console.log('Closing dialog...')
    showEditDialog.value = false
    
    console.log('Showing success message...')
    ElMessage.success('保存成功')
    console.log('Save complete!')
  } catch (error: any) {
    console.error('保存失败:', error)
    console.error('Error details:', error.response)
    ElMessage.error(error.message || '保存失败')
  }
}

const loadCertificationStatus = async () => {
  if (!authStore.isLoggedIn) return
  try {
    const response = await userApi.getCertificationStatus()
    // 兼容后端返回的 status 字段，直接赋值
    if (response && response.status) {
      verificationStatus.value = String(response.status)
    } else {
      verificationStatus.value = 'unverified'
    }
  } catch (error) {
    // 如果接口返回404或其他错误，说明未申请认证
    verificationStatus.value = 'unverified'
  }
}

const resetVerificationForm = () => {
  verificationForm.value = {
    realName: '',
    organization: '',
    email: '',
    title: ''
  }
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

// 加载收藏
const loadCollections = async () => {
  try {
    const response = await achievementApi.getMyCollections()
    // 兼容数组/对象格式，兼容 achievementDTO 包裹
    let arr = Array.isArray(response) ? response : (response?.collections || response?.content || response?.results || response?.data || [])
    collections.value = arr.map((item: any) => {
      const paper = item.achievementDTO || item
      return {
        id: paper.id || item.achievementId,
        title: paper.title || '未命名成果',
        authors: (paper.authorships && Array.isArray(paper.authorships))
          ? paper.authorships.map((a: any) => a.name).filter(Boolean)
          : (paper.authorNames || []),
        year: paper.publicationDate || paper.year || '',
        isfavorited: true
      }
    })
  } catch (error) {
    console.error('加载收藏失败', error)
    collections.value = []
  }
}

// 取消收藏
const removeFromCollection = async (achievementId: string) => {
  try {
    await achievementApi.removeFromCollections(achievementId)
    ElMessage.success('已取消收藏')
    await loadCollections()
  } catch (error: any) {
    ElMessage.error(error.message || '取消收藏失败')
  }
}

// 加载关注和粉丝数据
const loadFollowingAndFollowers = async () => {
  if (!authStore.user?.id) {
    followingCount.value = 0
    followersCount.value = 0
    followingList.value = []
    followersList.value = []
    return
  }
  try {
    const followingResponse: any = await socialApi.getFollowing(authStore.user.id)
    const followingData = followingResponse?.data || followingResponse
    followingList.value = followingData.following || followingData.results || (Array.isArray(followingData) ? followingData : [])
    followingCount.value = followingData.total || followingList.value.length

    const followersResponse: any = await socialApi.getFollowers(authStore.user.id)
    const followersData = followersResponse?.data || followersResponse
    followersList.value = followersData.followers || followersData.results || (Array.isArray(followersData) ? followersData : [])
    followersCount.value = followersData.total || followersList.value.length
  } catch (error) {
    console.error('加载关注和粉丝数据失败', error)
    followingCount.value = 0
    followersCount.value = 0
    followingList.value = []
    followersList.value = []
  }
}

// 取消关注
const handleUnfollow = async (userId: string) => {
  try {
    console.log('[unfollow] 调用接口，userId:', userId)
    const res = await socialApi.unfollowUser(userId)
    console.log('[unfollow] 接口返回:', res)
    ElMessage.success('已取消关注')
    // 从列表中移除
    followingList.value = followingList.value.filter(item => (item.userId || item.id) !== userId)
    // 更新关注数
    followingCount.value = Math.max(0, followingCount.value - 1)
  } catch (error: any) {
    console.error('[unfollow] error:', error)
    ElMessage.error(error.message || '取消关注失败')
  }
}

onMounted(async () => {
  await authStore.initAuth()
  settingsStore.loadSettings()
  
  if (authStore.isLoggedIn) {
    // 强制刷新认证状态
    verificationStatus.value = 'unverified'
    await loadCertificationStatus()
    await loadCollections()
    await loadFollowingAndFollowers()
    await loadMyPosts()
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
          color1: 0x8b4513,
          color2: 0xd4af37,
          colorMode: 'lerp',
          birdSize: 1.00,
          wingSpan: 20.00,
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

.my-posts-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 8px;
}
.my-post-card {
  background: var(--pf-card-bg, #fffef8);
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(180, 137, 58, 0.08), 0 1.5px 6px 0 rgba(44, 38, 24, 0.04);
  padding: 20px 24px 16px 24px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1px solid #f3e7c6;
  position: relative;
  cursor: pointer;
}
.my-post-card:hover {
  box-shadow: 0 6px 24px 0 rgba(180, 137, 58, 0.18), 0 2px 8px 0 rgba(44, 38, 24, 0.08);
  transform: translateY(-2px) scale(1.01);
  border-color: #e2c88f;
}
.my-post-title {
  font-size: 1.18rem;
  font-weight: 600;
  color: #2e2a25;
  margin-bottom: 4px;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 8px;
}
.my-post-meta {
  font-size: 0.98rem;
  color: #b8893a;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.my-post-summary {
  color: #7a6f63;
  font-size: 0.98rem;
  margin-bottom: 8px;
  line-height: 1.6;
  min-height: 1.5em;
}
.my-post-actions {
  display: flex;
  gap: 12px;
  margin-top: 2px;
}
.my-post-author {
  font-size: 0.92rem;
  color: #b8893a;
  margin-right: 8px;
}
.my-post-divider {
  border-top: 1px dashed #e2c88f;
  margin: 10px 0 8px 0;
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
    padding: 30px;
    min-height: 400px;

    :deep(.el-tabs) {
      .el-tabs__header {
        margin-bottom: 25px;
      }

      .el-tabs__item {
        color: #654321;
        font-weight: 600;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size: 16px;
        transition: all 0.3s ease;

        &.is-active {
          color: #8b4513;
          font-weight: 700;
        }

        &:hover {
          color: #B8860B;
        }
      }

      .el-tabs__active-bar {
        background: linear-gradient(90deg, #d4af37 0%, #b8860b 100%);
        height: 3px;
        border-radius: 2px;
      }

      .el-tabs__nav-wrap::after {
        background-color: rgba(184, 134, 11, 0.2);
        height: 2px;
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


// 巴洛克风格样式
.glass-panel {
  background: rgba(249, 247, 236, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 3px solid rgba(184, 134, 11, 0.5);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(135deg,
      rgba(212, 175, 55, 0.4) 0%,
      transparent 25%,
      transparent 75%,
      rgba(212, 175, 55, 0.4) 100%);
    border-radius: 16px;
    z-index: -1;
    opacity: 0.6;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.22),
      0 0 0 2px rgba(212, 175, 55, 0.4),
      inset 0 2px 6px rgba(255, 255, 255, 0.6);
  }
}

.profile-header-card {
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;

  .header-bg {
    height: 140px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, 
        rgba(0, 0, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.2) 100%);
    }
  }

  .header-content {
    padding: 0 40px 30px;
    display: flex;
    align-items: flex-end;
    gap: 30px;
    margin-top: -70px;
    position: relative;
    z-index: 1;

    .avatar-section {
      position: relative;

      .main-avatar {
        border: 4px solid #f9f7ec;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }

    .info-section {
      flex: 1;

      .name-row {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 10px;

        h1 {
          margin: 0;
          font-size: 36px;
          font-weight: 900;
          color: #654321;
          font-family: 'Georgia', 'Times New Roman', serif;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
      }

      .title {
        font-size: 18px;
        color: #8b4513;
        margin: 5px 0;
        font-family: 'Georgia', serif;
      }

      .institution {
        font-size: 16px;
        color: #8b4513;
        margin: 5px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Georgia', serif;
      }

      .bio-preview {
        margin-top: 15px;
        color: #654321;
        font-size: 14px;
        line-height: 1.6;
        max-width: 600px;
      }

      .action-buttons {
        margin-top: 20px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    }

    .stats-section {
      display: flex;
      gap: 20px;
      align-items: center;

      .stat-box {
        text-align: center;
        padding: 15px 20px;
        background: rgba(249, 247, 236, 0.6);
        border-radius: 12px;
        border: 2px solid rgba(212, 175, 55, 0.3);
        min-width: 80px;
        transition: all 0.3s ease;

        &.clickable {
          cursor: pointer;

          &:hover {
            background: rgba(212, 175, 55, 0.2);
            transform: translateY(-2px);
          }
        }

        .value {
          font-size: 28px;
          font-weight: 900;
          color: #8b4513;
          font-family: 'Georgia', serif;
          margin-bottom: 5px;
        }

        .label {
          font-size: 14px;
          color: #654321;
          font-weight: 600;
          font-family: 'Georgia', serif;
        }
      }

      .stat-divider {
        width: 2px;
        height: 50px;
        background: rgba(212, 175, 55, 0.3);
      }
    }
  }
}

.gothic-btn {
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  border: none;
  color: #654321;
  font-weight: bold;
  border-radius: 8px;
  padding: 10px 20px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
  }

  &.danger-btn {
    background: linear-gradient(135deg, #8b0000 0%, #654321 100%);
    color: #f9f7ec;

    &:hover {
      background: linear-gradient(135deg, #654321 0%, #4a2c1a 100%);
    }
  }
}

.gothic-btn-small {
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  border: none;
  color: #654321;
  font-weight: bold;
  border-radius: 6px;
  padding: 6px 12px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
  }
}

.content-card {
  padding: 30px;
  min-height: 400px;

  :deep(.el-tabs) {
    .el-tabs__header {
      margin-bottom: 25px;
    }

    .el-tabs__item {
      color: #654321;
      font-weight: 600;
      font-family: 'Georgia', serif;
      font-size: 16px;

      &.is-active {
        color: #8b4513;
        font-weight: 700;
      }
    }

    .el-tabs__active-bar {
      background: linear-gradient(90deg, #d4af37 0%, #b8860b 100%);
      height: 3px;
    }
  }
}

.sidebar-card {
  padding: 25px;

  h3 {
    margin: 0 0 20px 0;
    font-size: 20px;
    color: #654321;
    font-family: 'Georgia', serif;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(.el-icon) {
      color: #d4af37;
    }
  }

  .info-group {
    margin-bottom: 20px;

    label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #8b4513;
      font-weight: 600;
      margin-bottom: 8px;
      font-family: 'Georgia', serif;

      :deep(.el-icon) {
        color: #d4af37;
      }
    }

    .contact-row {
      color: #654321;
      font-size: 15px;
      padding: 8px 0;
    }

    .bio-text {
      color: #654321;
      font-size: 14px;
      line-height: 1.6;
      padding: 8px 0;
    }
  }
}

.collections-content {
  .collections-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .collection-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(5px);
    }

    .item-info {
      flex: 1;

      h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #654321;
        font-family: 'Georgia', serif;
        font-weight: 700;
      }

      .item-meta {
        margin: 0;
        font-size: 14px;
        color: #8b4513;
      }
    }
  }
}

.follow-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  border-radius: 14px;

  .follow-item-content {
    display: flex;
    align-items: center;
    gap: 18px;
    flex: 1;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  &:hover {
    background: rgba(249, 247, 236, 0.8);
    box-shadow: 
      0 6px 16px rgba(0, 0, 0, 0.12),
      0 0 0 2px rgba(212, 175, 55, 0.3);
    transform: translateY(-3px) translateX(4px);
  }

  :deep(.el-avatar) {
    border: 3px solid #D4AF37;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .item-info {
    flex-grow: 1;

    h4 {
      margin: 0;
      font-size: 18px;
      color: #654321;
      font-family: 'Georgia', 'Times New Roman', serif;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    p {
      margin: 6px 0 0;
      font-size: 14px;
      color: #8b4513;
      font-family: 'Georgia', serif;
      font-style: italic;
      font-weight: 500;
    }
  }

  .unfollow-btn {
    flex-shrink: 0;
    background: linear-gradient(135deg, #8b0000 0%, #654321 100%) !important;
    border-color: #654321 !important;
    color: #f9f7ec !important;
    font-size: 12px;
    padding: 6px 12px !important;

    &:hover {
      background: linear-gradient(135deg, #654321 0%, #4a2c1a 100%) !important;
      border-color: #4a2c1a !important;
    }
  }
}

.main-body {
  margin-top: 30px;
}

.sidebar-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

// 中世纪复古风格弹窗
:deep(.gothic-dialog) {
  .el-dialog {
    background: rgba(249, 247, 236, 0.95) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 16px !important;
    border: 3px solid rgba(184, 134, 11, 0.5) !important;
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.18),
      0 0 0 1px rgba(212, 175, 55, 0.2) inset,
      inset 0 2px 4px rgba(255, 255, 255, 0.5),
      inset 0 -2px 4px rgba(0, 0, 0, 0.1) !important;
    overflow: hidden;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      background: linear-gradient(135deg, 
        rgba(212, 175, 55, 0.4) 0%, 
        transparent 25%, 
        transparent 75%, 
        rgba(212, 175, 55, 0.4) 100%);
      border-radius: 16px;
      z-index: -1;
      opacity: 0.6;
    }

    .el-dialog__header {
      padding: 24px 32px 16px !important;
      background: linear-gradient(135deg, 
        rgba(212, 175, 55, 0.2) 0%, 
        rgba(184, 134, 11, 0.15) 100%);
      border-bottom: 2px solid rgba(184, 134, 11, 0.3);
      
      .el-dialog__title {
        font-family: 'Georgia', 'Times New Roman', serif !important;
        font-size: 24px !important;
        font-weight: 900 !important;
        color: #654321 !important;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2) !important;
        letter-spacing: 0.5px;
      }

      .el-dialog__headerbtn {
        .el-dialog__close {
          color: #8B4513 !important;
          font-size: 20px;
          
          &:hover {
            color: #654321 !important;
          }
        }
      }
    }

    .el-dialog__body {
      padding: 24px 32px !important;
      
      :deep(.el-form-item__label) {
        font-family: 'Georgia', 'Times New Roman', serif !important;
        font-weight: 700 !important;
        color: #654321 !important;
        font-size: 15px !important;
        margin-bottom: 8px;
      }

      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 2px solid rgba(184, 134, 11, 0.4) !important;
        border-radius: 8px !important;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s ease;

        &:hover {
          border-color: rgba(212, 175, 55, 0.6) !important;
        }

        &.is-focus {
          border-color: #D4AF37 !important;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(212, 175, 55, 0.3) !important;
        }
      }

      :deep(.el-input__inner) {
        font-family: 'Georgia', serif !important;
        color: #654321 !important;
        font-weight: 600;

        &::placeholder {
          color: rgba(101, 67, 33, 0.5) !important;
        }
      }

      :deep(.el-textarea__inner) {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 2px solid rgba(184, 134, 11, 0.4) !important;
        border-radius: 8px !important;
        font-family: 'Georgia', serif !important;
        color: #654321 !important;
        font-weight: 600;

        &:focus {
          border-color: #D4AF37 !important;
        }
      }

      :deep(.el-select) {
        .el-input__wrapper {
          background: rgba(255, 255, 255, 0.9) !important;
        }
      }

      .empty-state {
        padding: 40px 0;
      }

      .following-list,
      .followers-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 400px;
        overflow-y: auto;
        padding-right: 8px;

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: rgba(184, 134, 11, 0.1);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(184, 134, 11, 0.4);
          border-radius: 4px;

          &:hover {
            background: rgba(184, 134, 11, 0.6);
          }
        }
      }

      .follow-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.6) !important;
        border: 2px solid rgba(184, 134, 11, 0.3) !important;
        border-radius: 10px !important;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(212, 175, 55, 0.5) !important;
          transform: translateX(3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .follow-item-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          cursor: pointer;

          .item-info {
            h4 {
              margin: 0;
              font-family: 'Georgia', 'Times New Roman', serif !important;
              font-weight: 700 !important;
              color: #654321 !important;
              font-size: 15px;
            }

            p {
              margin: 4px 0 0 0;
              font-family: 'Georgia', 'Times New Roman', serif !important;
              color: #8B4513 !important;
              font-size: 13px;
              font-style: italic;
            }
          }
        }

        .unfollow-btn {
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-weight: 600 !important;
          padding: 6px 12px !important;
          font-size: 12px !important;
        }
      }
    }

    .el-dialog__footer {
      padding: 20px 32px 24px !important;
      border-top: 2px solid rgba(184, 134, 11, 0.3);
      background: linear-gradient(135deg, 
        rgba(249, 247, 236, 0.5) 0%, 
        rgba(255, 255, 255, 0.3) 100%);

      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      :deep(.el-button) {
        font-family: 'Georgia', 'Times New Roman', serif !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
        padding: 10px 20px !important;
        transition: all 0.3s ease;

        &.el-button--default {
          background: linear-gradient(135deg, #8B4513 0%, #654321 100%) !important;
          border-color: #654321 !important;
          color: #f9f7ec !important;

          &:hover {
            background: linear-gradient(135deg, #654321 0%, #4a2c1a 100%) !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        }

        &.el-button--primary {
          background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%) !important;
          border-color: #B8860B !important;
          color: #654321 !important;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3) !important;

          &:hover {
            background: linear-gradient(135deg, #B8860B 0%, #9a7209 100%) !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4) !important;
          }
        }
      }
    }
  }
}

// 全局样式，确保对话框样式正确应用（Element Plus使用Teleport）
</style>

<style lang="scss">
// 全局样式：中世纪复古风格弹窗
// 由于Element Plus的对话框通过Teleport渲染，需要使用全局样式
.gothic-dialog.el-dialog {
  background: rgba(249, 247, 236, 0.95) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px !important;
  border: 3px solid rgba(184, 134, 11, 0.5) !important;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1) !important;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.4) 0%, 
      transparent 25%, 
      transparent 75%, 
      rgba(212, 175, 55, 0.4) 100%);
    border-radius: 16px;
    z-index: -1;
    opacity: 0.6;
  }

  .el-dialog__header {
    padding: 24px 32px 16px !important;
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.2) 0%, 
      rgba(184, 134, 11, 0.15) 100%);
    border-bottom: 2px solid rgba(184, 134, 11, 0.3);
    
    .el-dialog__title {
      font-family: 'Georgia', 'Times New Roman', serif !important;
      font-size: 24px !important;
      font-weight: 900 !important;
      color: #654321 !important;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2) !important;
      letter-spacing: 0.5px;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #8B4513 !important;
        font-size: 20px;
        
        &:hover {
          color: #654321 !important;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px 32px !important;
    
    .el-form-item__label {
      font-family: 'Georgia', 'Times New Roman', serif !important;
      font-weight: 700 !important;
      color: #654321 !important;
      font-size: 15px !important;
      margin-bottom: 8px;
    }

    .el-input__wrapper {
      background: rgba(255, 255, 255, 0.9) !important;
      border: 2px solid rgba(184, 134, 11, 0.4) !important;
      border-radius: 8px !important;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(212, 175, 55, 0.6) !important;
      }

      &.is-focus {
        border-color: #D4AF37 !important;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(212, 175, 55, 0.3) !important;
      }
    }

    .el-input__inner {
      font-family: 'Georgia', serif !important;
      color: #654321 !important;
      font-weight: 600;

      &::placeholder {
        color: rgba(101, 67, 33, 0.5) !important;
      }
    }

    .el-textarea__inner {
      background: rgba(255, 255, 255, 0.9) !important;
      border: 2px solid rgba(184, 134, 11, 0.4) !important;
      border-radius: 8px !important;
      font-family: 'Georgia', serif !important;
      color: #654321 !important;
      font-weight: 600;

      &:focus {
        border-color: #D4AF37 !important;
      }
    }

    .el-select {
      .el-input__wrapper {
        background: rgba(255, 255, 255, 0.9) !important;
      }
    }

    .el-empty {
      .el-empty__description {
        color: #8B4513 !important;
        font-family: 'Georgia', 'Times New Roman', serif !important;
        font-weight: 600 !important;
      }
    }

    .empty-state {
      padding: 40px 0;
    }

    .following-list,
    .followers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 8px;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(184, 134, 11, 0.1);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(184, 134, 11, 0.4);
        border-radius: 4px;

        &:hover {
          background: rgba(184, 134, 11, 0.6);
        }
      }
    }

    .follow-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.6) !important;
      border: 2px solid rgba(184, 134, 11, 0.3) !important;
      border-radius: 10px !important;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.8) !important;
        border-color: rgba(212, 175, 55, 0.5) !important;
        transform: translateX(3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .follow-item-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        cursor: pointer;

        .item-info {
          h4 {
            margin: 0;
            font-family: 'Georgia', 'Times New Roman', serif !important;
            font-weight: 700 !important;
            color: #654321 !important;
            font-size: 15px;
          }

          p {
            margin: 4px 0 0 0;
            font-family: 'Georgia', 'Times New Roman', serif !important;
            color: #8B4513 !important;
            font-size: 13px;
            font-style: italic;
          }
        }
      }

      .unfollow-btn {
        font-family: 'Georgia', 'Times New Roman', serif !important;
        font-weight: 600 !important;
        padding: 6px 12px !important;
        font-size: 12px !important;
      }
    }
  }

  .el-dialog__footer {
    padding: 20px 32px 24px !important;
    border-top: 2px solid rgba(184, 134, 11, 0.3);
    background: linear-gradient(135deg, 
      rgba(249, 247, 236, 0.5) 0%, 
      rgba(255, 255, 255, 0.3) 100%);

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .el-button {
      font-family: 'Georgia', 'Times New Roman', serif !important;
      font-weight: 700 !important;
      border-radius: 8px !important;
      padding: 10px 20px !important;
      transition: all 0.3s ease;

      &.el-button--default {
        background: linear-gradient(135deg, #8B4513 0%, #654321 100%) !important;
        border-color: #654321 !important;
        color: #f9f7ec !important;

        &:hover {
          background: linear-gradient(135deg, #654321 0%, #4a2c1a 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      }

      &.el-button--primary {
        background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%) !important;
        border-color: #B8860B !important;
        color: #654321 !important;
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3) !important;

        &:hover {
          background: linear-gradient(135deg, #B8860B 0%, #9a7209 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4) !important;
        }
      }
    }
  }
}

// 下拉选择框样式
.el-select-dropdown {
  background: rgba(249, 247, 236, 0.98) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid rgba(184, 134, 11, 0.5) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;

  .el-select-dropdown__item {
    font-family: 'Georgia', 'Times New Roman', serif !important;
    color: #654321 !important;
    font-weight: 600 !important;
    
    &:hover {
      background: rgba(212, 175, 55, 0.3) !important;
      color: #8B4513 !important;
    }

    &.selected {
      background: rgba(212, 175, 55, 0.4) !important;
      color: #654321 !important;
      font-weight: 700 !important;
    }
  }
}
</style>

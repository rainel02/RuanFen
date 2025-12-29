<template>
  <div class="app-header glass-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo-section" @click="router.push('/')">
          <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
          <span class="logo-text">HuggingPapers</span>
        </div>

        <!-- Search Bar (Hidden on Home and Profile) -->
        <div class="search-section" v-if="!isHomePage && !isProfilePage">
          <el-input
            v-model="searchInput"
            placeholder="搜索..."
            class="header-search"
            @keyup.enter="handleSearchSubmit"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- Navigation -->
        <div class="nav-section">
          <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">首页</router-link>
          <router-link to="/collections" class="nav-item" :class="{ active: route.path === '/collections' }">收藏</router-link>
          <router-link to="/scholars" class="nav-item" :class="{ active: route.path.startsWith('/scholar') }">学者</router-link>
          <router-link v-if="showPaperGuide" to="/paper-guide" class="nav-item" :class="{ active: route.path === '/paper-guide' }">导读</router-link>
          <router-link v-if="showForum" to="/forum" class="nav-item" :class="{ active: route.path.startsWith('/forum') }">论坛</router-link>
          <router-link to="/chat" class="nav-item" :class="{ active: route.path === '/chat' }">消息</router-link>
          <router-link to="/analytics" class="nav-item" :class="{ active: route.path === '/analytics' }">分析</router-link>
          <router-link to="/knowledge" class="nav-item" :class="{ active: route.path.startsWith('/knowledge') }">我的智库</router-link>
          <router-link 
            v-if="isLoggedIn && isAdmin" 
            to="/admin" 
            class="nav-item" 
            :class="{ active: route.path.startsWith('/admin') }"
          >
            控制台
          </router-link>
          
          <div class="user-menu" @click="handleUserMenuClick">
            <template v-if="shouldShowAvatar && isLoggedIn">
              <el-avatar :size="40" :src="user?.avatar || defaultAvatar" class="user-avatar">
                {{ user?.name?.charAt(0) }}
              </el-avatar>
            </template>
            <template v-else-if="!isLoginPage">
              <el-button class="gothic-login-btn" size="small" @click.stop="router.push('/profile')">登录</el-button>
            </template>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePapersStore } from '../stores/papers'
import { useSettingsStore } from '../stores/settings'

import { Search } from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/profile.png'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const papersStore = usePapersStore()
const settingsStore = useSettingsStore()

const searchInput = ref('')

const isHomePage = computed(() => route.path === '/')
const isProfilePage = computed(() => route.path === '/profile')
const isLoginPage = computed(() => route.path === '/profile' && !authStore.isLoggedIn)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)
const isAdmin = computed(() => {
  const role = user.value?.role
  return role === 'admin' || role === 'ADMIN' || role === 'administrator'
})

// 是否显示头像（除了登录注册页面外都显示）
const shouldShowAvatar = computed(() => {
  // 如果已登录，总是显示头像
  if (isLoggedIn.value) return true
  // 如果未登录且不在登录页面，显示登录按钮
  return !isLoginPage.value
})

// 根据设置显示功能
const showPaperGuide = computed(() => settingsStore.settings.enablePaperGuide)
const showForum = computed(() => settingsStore.settings.enableForum)

const handleSearchSubmit = () => {
  if (searchInput.value.trim()) {
    papersStore.searchPapers(searchInput.value)
    if (route.path !== '/') {
      router.push({ path: '/', query: { q: searchInput.value } })
    }
  }
}

const handleUserMenuClick = () => {
  if (isLoggedIn.value) {
    router.push('/profile')
  } else {
    router.push('/profile')
  }
}

</script>

<style>

.glass-header {
  background-image: url('@/assets/bg1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  height: 64px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  .logo-image {
    width: 40px;
    height: 40px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 900;
    color: #000;
    font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
    letter-spacing: 0.5px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }
}

.search-section {
  flex: 1;
  max-width: 400px;
  margin: 0 40px;

  .header-search {
    :deep(.el-input__wrapper) {
      border-radius: 20px;
      background-color: #f5f7fa;
      box-shadow: none;
      &:focus-within {
        background-color: #fff;
        box-shadow: 0 0 0 1px #409eff inset;
      }
    }
  }
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 25px;
  position: relative;
  z-index: 100;

  .nav-item {
    text-decoration: none;
    color: #606266;
    font-size: 15px;
    font-weight: 500;
    transition: color 0.2s;
    position: relative;
    cursor: pointer;
    z-index: 10;
    pointer-events: auto;

    &:hover {
      color: #D4AF37;
    }

    &.active {
      color: #B8860B;
      font-weight: 600;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -22px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: #D4AF37;
        border-radius: 3px 3px 0 0;
      }
    }
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding-left: 15px;
    border-left: 1px solid #ebeef5;
    
    .user-avatar {
      transition: all 0.3s ease;
      border: 2px solid rgba(212, 175, 55, 0.3);
      
      &:hover {
        transform: scale(1.1);
        border-color: #D4AF37;
        box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
      }
    }
    
    .user-name {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
    
    &:hover .user-name {
      color: #409eff;
    }
  }

  .gothic-login-btn {
    background: #8B4513 !important;
    border: 2px solid #654321 !important;
    color: #fff !important;
    font-weight: 700 !important;
    font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif !important;
    letter-spacing: 1px !important;
    text-transform: uppercase !important;
    border-radius: 20px !important;
    padding: 14px 24px !important;
    min-width: 80px !important;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2) !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        transparent 50%, 
        rgba(0, 0, 0, 0.1) 100%);
      border-radius: 2px;
      pointer-events: none;
    }
    
    &:hover {
      background: #654321 !important;
      border-color: #5a3a1f !important;
      box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.3) !important;
      transform: translateY(-1px) !important;
    }
    
    &:active {
      transform: translateY(0) !important;
      box-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
  }
}

@media (max-width: 768px) {
  .search-section { display: none; }
  .nav-section { gap: 15px; }
  .nav-item { font-size: 14px; }
}

.user-menu-item {
  :deep(.el-menu-item__content) {
    display: flex;
    align-items: center;
  }

  .user-avatar-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.8;
    }

    .user-icon {
      font-size: 24px;
      color: var(--text-color);
    }

    .user-avatar {
      border: 2px solid var(--primary-color);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .user-name {
      font-weight: 500;
      color: var(--text-color);
      white-space: nowrap;
    }
  }
}
</style>

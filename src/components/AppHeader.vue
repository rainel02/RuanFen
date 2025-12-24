<template>
  <div class="app-header glass-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo-section" @click="router.push('/')">
          <div class="logo-icon">
            <el-icon><School /></el-icon>

          </div>
          <span class="logo-text">ScholarHub</span>
        </div>

        <!-- Search Bar (Hidden on Home) -->
        <div class="search-section" v-if="!isHomePage">
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
          <router-link to="/scholars" class="nav-item" :class="{ active: route.path.startsWith('/scholar') }">学者</router-link>
          <router-link v-if="showPaperGuide" to="/paper-guide" class="nav-item" :class="{ active: route.path === '/paper-guide' }">导读</router-link>
          <router-link v-if="showForum" to="/forum" class="nav-item" :class="{ active: route.path.startsWith('/forum') }">论坛</router-link>
          <router-link to="/chat" class="nav-item" :class="{ active: route.path === '/chat' }">消息</router-link>
          <router-link to="/analytics" class="nav-item" :class="{ active: route.path === '/analytics' }">分析</router-link>
          
          <div class="user-menu" @click="router.push('/profile')">
            <template v-if="isLoggedIn">
              <el-avatar :size="32" :src="user?.avatar" class="user-avatar">
                {{ user?.name?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ user?.name }}</span>
            </template>
            <template v-else>
              <el-button type="primary" round size="small">登录</el-button>
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

import { Search, School } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const papersStore = usePapersStore()
const settingsStore = useSettingsStore()

const searchInput = ref('')

const isHomePage = computed(() => route.path === '/')
const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)

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

</script>

<style>

.glass-header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
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
  
  .logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #409eff, #36d1dc);
    border-radius: 8px;
    display: flex;
    align-items: center;

    text-decoration: none;
    color: var(--text-color);
    font-weight: 600;
    gap: 10px;

    .logo-image {
      width: 40px;
      height: 40px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .logo-avatar {
      cursor: pointer;
      border: 2px solid var(--primary-color);
      transition: all 0.3s ease;
      flex-shrink: 0;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .logo-text {
      font-size: 18px;
      color: var(--primary-color);
    }
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

  .nav-item {
    text-decoration: none;
    color: #606266;
    font-size: 15px;
    font-weight: 500;
    transition: color 0.2s;
    position: relative;

    &:hover {
      color: #409eff;
    }

    &.active {
      color: #409eff;
      font-weight: 600;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -22px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: #409eff;
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
    
    .user-name {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
    
    &:hover .user-name {
      color: #409eff;
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

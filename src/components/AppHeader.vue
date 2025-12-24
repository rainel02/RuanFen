<template>
  <div class="page-header">
    <div class="container">
      <el-row align="middle" justify="space-between" style="height: 64px;">
        <el-col :span="12">
          <div class="left-area">
            <div class="logo">
              <router-link to="/" class="logo-link">
                <el-icon size="28" color="#1890ff">
                  <School />
                </el-icon>
                <span class="logo-text">学术平台</span>
              </router-link>
            </div>

            <div class="search-wrapper" v-if="showSearch">
              <el-input
                v-model="searchInput"
                placeholder="搜索论文、作者、关键词..."
                size="large"
                clearable
                @input="handleSearch"
                @keyup.enter="handleSearchSubmit"
              >
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="nav-actions">
            <el-menu
              mode="horizontal"
              :default-active="activeIndex"
              class="nav-menu"
              @select="handleSelect"
              router
            >
              <el-menu-item index="/">论文</el-menu-item>
              <el-menu-item index="/collections">收藏</el-menu-item>
              <el-menu-item index="/scholars">学者</el-menu-item>
              <el-menu-item index="/paper-guide" v-if="showPaperGuide">导读</el-menu-item>
              <el-menu-item index="/forum" v-if="showForum">论坛</el-menu-item>
              <el-menu-item index="/chat">私信</el-menu-item>
              <el-menu-item index="/analytics">统计</el-menu-item>
              <el-menu-item index="/profile">
                <el-icon v-if="!isLoggedIn">
                  <User />
                </el-icon>
                <el-avatar v-else :src="user?.avatar" :size="24">
                  {{ user?.name?.charAt(0) }}
                </el-avatar>
                <span style="margin-left: 6px;">
                  {{ isLoggedIn ? user?.name : '登录' }}
                </span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePapersStore } from '../stores/papers'
import { useSettingsStore } from '../stores/settings'
import { Search, User, School } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const papersStore = usePapersStore()
const settingsStore = useSettingsStore()

const searchInput = ref('')

const activeIndex = computed(() => route.path + '') // 保证为字符串
const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)
const showSearch = computed(() => route.path === '/')

// 根据设置显示功能
const showPaperGuide = computed(() => settingsStore.settings.enablePaperGuide)
const showForum = computed(() => settingsStore.settings.enableForum)

const handleSelect = (index: string) => {
  if (index !== route.path) {
    router.push(index)
  }
}

const handleSearch = (value: string) => {
  if (route.path === '/') {
    papersStore.searchPapers(value)
  }
}

const handleSearchSubmit = () => {
  if (route.path !== '/') {
    router.push('/')
  }
  papersStore.searchPapers(searchInput.value)
}

onMounted(() => {
  settingsStore.loadSettings()
})

watch(() => route.path, () => {
  if (route.path !== '/') {
    searchInput.value = ''
  }
})
</script>

<style scoped lang="scss">
.page-header {
  background: rgba(20, 22, 25, 0.8); /* Glass effect fallback */
  backdrop-filter: blur(var(--backdrop-blur));
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  .logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }

    .logo-text {
      margin-left: 10px;
      font-size: 18px;
      letter-spacing: -0.02em;
      color: var(--text-primary); /* Keep it clean white */
    }
  }
}

.left-area {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.search-wrapper {
  width: 320px;
  transition: width 0.3s ease;
  
  &:focus-within {
    width: 400px;
  }

  :deep(.el-input__wrapper) {
    background: var(--surface);
    border: 1px solid var(--border-subtle);
    box-shadow: none;
    border-radius: var(--radius-full);
    padding-left: 16px;
    
    &.is-focus {
      border-color: var(--primary);
      background: var(--surface-active);
    }
  }
}

.nav-actions {
  display: flex;
  justify-content: flex-end;
}

.nav-menu {
  border: none;
  background: transparent;
  height: 64px;
  align-items: center;

  :deep(.el-menu-item) {
    border: none;
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 14px;
    padding: 0 16px;
    height: 40px;
    line-height: 40px;
    margin: 0 4px;
    border-radius: var(--radius-sm);
    transition: all 0.2s;

    &.is-active {
      color: var(--text-primary);
      background: var(--surface-hover);
      font-weight: 600;
    }

    &:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.03);
    }
  }
}
</style>

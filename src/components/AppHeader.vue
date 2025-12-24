<template>
  <div class="page-header">
    <div class="container">
      <el-row align="middle" justify="space-between" style="height: 64px;">
        <el-col :span="6">
          <div class="logo">
            <router-link to="/" class="logo-link">
              <img 
                :src="logoImage"
                alt="HuggingPapers"
                class="logo-image"
              />
              <span class="logo-text">HuggingPapers</span>
            </router-link>
          </div>
        </el-col>

        <el-col :span="12">
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
        </el-col>

        <el-col :span="6">
          <div class="nav-actions">
            <el-menu
              mode="horizontal"
              :default-active="activeIndex"
              class="nav-menu"
              @select="handleSelect"
              router
            >
              <el-menu-item index="/">论文</el-menu-item>
              <el-menu-item index="/scholars">学者</el-menu-item>
              <el-menu-item index="/paper-guide" v-if="showPaperGuide">导读</el-menu-item>
              <el-menu-item index="/forum" v-if="showForum">论坛</el-menu-item>
              <el-menu-item index="/chat">私信</el-menu-item>
              <el-menu-item index="/analytics">统计</el-menu-item>
              <el-menu-item index="/admin" v-if="isAdmin" class="admin-menu-item">
                <span>管理后台</span>
              </el-menu-item>
              <el-menu-item index="/profile" class="user-menu-item">
                <div class="user-avatar-wrapper" @click="goToProfile">
                  <el-avatar 
                    :src="(isLoggedIn && user?.avatar) ? user.avatar : defaultAvatar" 
                    :size="32"
                    class="user-avatar"
                  >
                    {{ isLoggedIn && user?.name ? user.name.charAt(0) : '' }}
                  </el-avatar>
                </div>
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
import defaultAvatar from '@/assets/profile.png'
import logoImage from '@/assets/logo.png'

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
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'administrator')

// 根据设置显示功能
const showPaperGuide = computed(() => settingsStore.settings.enablePaperGuide)
const showForum = computed(() => settingsStore.settings.enableForum)

const handleSelect = (index: string) => {
  if (index !== route.path) {
    router.push(index)
  }
}

const goToProfile = () => {
  if (isLoggedIn.value) {
    router.push('/profile')
  } else {
    router.push('/profile')
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

.logo {
  .logo-link {
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

.search-wrapper {
  max-width: 500px;

  :deep(.el-input__wrapper) {
    border-radius: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.nav-menu {
  border: none;
  background: transparent;

  :deep(.el-menu-item) {
    border: none;
    color: var(--text-color);
    font-weight: 500;

    &.is-active {
      color: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
    }

    &:hover {
      color: var(--primary-color);
    }
  }
}

.nav-actions {
  display: flex;
  justify-content: flex-end;
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

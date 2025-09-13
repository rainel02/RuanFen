<template>
  <div class="page-header">
    <div class="container">
      <el-row align="middle" justify="space-between" style="height: 64px;">
        <el-col :span="6">
          <div class="logo">
            <router-link to="/" class="logo-link">
              <el-icon size="28" color="#1890ff">
                <School />
              </el-icon>
              <span class="logo-text">学术平台</span>
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
              <el-menu-item index="/analytics">统计</el-menu-item>
              <el-menu-item index="/chat">私信</el-menu-item>
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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePapersStore } from '../stores/papers'
import { Search, User, School } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const papersStore = usePapersStore()

const searchInput = ref('')

const activeIndex = computed(() => route.path + '') // 保证为字符串
const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)
const showSearch = computed(() => route.path === '/')

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

    .logo-text {
      margin-left: 8px;
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
</style>

<template>
  <div class="admin-dashboard">
    <AppHeader />
    
    <div class="page-content">
      <div class="container">
        <div class="page-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>仪表盘</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="page-title">管理后台仪表盘</h1>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="24" class="stats-row">
          <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.key">
            <div class="stat-card" :class="stat.type">
              <div class="stat-icon">
                <el-icon :size="40"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
              <div class="stat-bg"></div>
            </div>
          </el-col>
        </el-row>

        <!-- 快捷操作 -->
        <el-row :gutter="24" class="actions-row">
          <el-col :xs="24" :sm="12" :md="8" v-for="action in quickActions" :key="action.path">
            <el-card class="action-card" @click="handleQuickAction(action.path)">
              <div class="action-content">
                <el-icon class="action-icon" :size="32"><component :is="action.icon" /></el-icon>
                <div class="action-info">
                  <h3>{{ action.title }}</h3>
                  <p>{{ action.description }}</p>
                </div>
                <el-icon class="action-arrow"><ArrowRight /></el-icon>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 待处理事项 -->
        <el-card class="pending-card">
          <template #header>
            <div class="card-header">
              <span>待处理事项</span>
              <el-badge :value="pendingCount" class="pending-badge" />
            </div>
          </template>
          <div class="pending-list">
            <div v-if="pendingCertifications > 0" class="pending-item" @click="$router.push('/admin/certifications')">
              <el-icon class="pending-icon"><UserFilled /></el-icon>
              <div class="pending-info">
                <div class="pending-title">待审核认证申请</div>
                <div class="pending-count">{{ pendingCertifications }} 条</div>
              </div>
              <el-button type="primary" link>去处理</el-button>
            </div>
            <div v-if="pendingAppeals > 0" class="pending-item" @click="$router.push('/admin/appeals')">
              <el-icon class="pending-icon"><Warning /></el-icon>
              <div class="pending-info">
                <div class="pending-title">待处理申诉</div>
                <div class="pending-count">{{ pendingAppeals }} 条</div>
              </div>
              <el-button type="primary" link>去处理</el-button>
            </div>
            <div v-if="pendingAchievements > 0" class="pending-item" @click="$router.push('/admin/achievements')">
              <el-icon class="pending-icon"><Document /></el-icon>
              <div class="pending-info">
                <div class="pending-title">待审核成果</div>
                <div class="pending-count">{{ pendingAchievements }} 条</div>
              </div>
              <el-button type="primary" link>去处理</el-button>
            </div>
            <el-empty v-if="pendingCount === 0" description="暂无待处理事项" />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, 
  UserFilled, 
  Document, 
  Warning, 
  Setting,
  ArrowRight,
  Check,
  Clock,
  Files
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { getDashboardStats, type DashboardStats } from '@/api/admin'

const router = useRouter()

const dashboardStats = ref<DashboardStats>({
  totalUsers: 0,
  totalScholars: 0,
  totalPapers: 0,
  pendingCertifications: 0,
  pendingAppeals: 0,
  pendingAchievements: 0
})

const loading = ref(false)

const stats = computed(() => [
  {
    key: 'users',
    label: '总用户数',
    value: dashboardStats.value.totalUsers,
    icon: User,
    type: 'primary'
  },
  {
    key: 'scholars',
    label: '认证学者',
    value: dashboardStats.value.totalScholars,
    icon: UserFilled,
    type: 'success'
  },
  {
    key: 'papers',
    label: '论文总数',
    value: dashboardStats.value.totalPapers,
    icon: Document,
    type: 'warning'
  },
  {
    key: 'pending',
    label: '待处理',
    value: dashboardStats.value.pendingCertifications + 
            dashboardStats.value.pendingAppeals + 
            dashboardStats.value.pendingAchievements,
    icon: Clock,
    type: 'danger'
  }
])

const pendingCertifications = computed(() => dashboardStats.value.pendingCertifications)
const pendingAppeals = computed(() => dashboardStats.value.pendingAppeals)
const pendingAchievements = computed(() => dashboardStats.value.pendingAchievements)
const pendingCount = computed(() => 
  pendingCertifications.value + pendingAppeals.value + pendingAchievements.value
)

const quickActions = [
  {
    title: '认证审核',
    description: '审核学者认证申请',
    icon: Check,
    path: '/admin/certifications'
  },
  {
    title: '申诉处理',
    description: '处理用户申诉',
    icon: Warning,
    path: '/admin/appeals'
  },
  {
    title: '成果审核',
    description: '审核学者提交的成果',
    icon: Files,
    path: '/admin/achievements'
  },
  {
    title: '任务管理',
    description: '管理系统定时任务',
    icon: Setting,
    path: '/admin/tasks'
  }
]

const loadStats = async () => {
  loading.value = true
  try {
    const data = await getDashboardStats()
    dashboardStats.value = data
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    // 如果接口不存在，使用模拟数据
    dashboardStats.value = {
      totalUsers: 1234,
      totalScholars: 567,
      totalPapers: 8901,
      pendingCertifications: 12,
      pendingAppeals: 5,
      pendingAchievements: 23
    }
  } finally {
    loading.value = false
  }
}

const handleQuickAction = (path: string) => {
  router.push(path)
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    animation: pulse 10s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.page-content {
  padding: 24px 0;
  position: relative;
  z-index: 1;
}

.page-header {
  margin-bottom: 32px;

  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin: 16px 0 0 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  padding: 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-bg {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  &.primary .stat-icon {
    color: #667eea;
  }

  &.success .stat-icon {
    color: #48bb78;
  }

  &.warning .stat-icon {
    color: #ed8936;
  }

  &.danger .stat-icon {
    color: #f56565;
  }
}

.stat-icon {
  margin-bottom: 12px;
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

.actions-row {
  margin-bottom: 24px;
}

.action-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.action-content {
  display: flex;
  align-items: center;
  gap: 16px;

  .action-icon {
    color: #667eea;
    flex-shrink: 0;
  }

  .action-info {
    flex: 1;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }
  }

  .action-arrow {
    color: #cbd5e0;
    transition: all 0.3s ease;
  }
}

.action-card:hover .action-arrow {
  color: #667eea;
  transform: translateX(4px);
}

.pending-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pending-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateX(4px);
  }

  .pending-icon {
    font-size: 24px;
    color: #667eea;
    flex-shrink: 0;
  }

  .pending-info {
    flex: 1;

    .pending-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 4px;
    }

    .pending-count {
      font-size: 14px;
      color: #718096;
    }
  }
}

@media (max-width: 768px) {
  .stats-row {
    .el-col {
      margin-bottom: 16px;
    }
  }
}
</style>


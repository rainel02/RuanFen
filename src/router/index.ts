import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
    meta: { title: '学术成果' }
  },
  {
    path: '/scholars',
    name: 'Scholars',
    component: () => import('../views/ScholarsPage.vue'),
    meta: { title: '科研人员' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/AnalyticsPage.vue'),
    meta: { title: '统计分析' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfilePage.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/paper/:id',
    name: 'PaperDetail',
    component: () => import('../views/PaperDetailPage.vue'),
    meta: { title: '论文详情' }
  },
  {
    path: '/scholar/:id',
    name: 'ScholarDetail',
    component: () => import('../views/ScholarDetailPage.vue'),
    meta: { title: '学者详情' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsPage.vue'),
    meta: { title: '个人设置' }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/ChatPage.vue'),
    meta: { title: '私信' }
  },
  {
    path: '/paper-guide',
    name: 'PaperGuide',
    component: () => import('../views/PaperGuidePage.vue'),
    meta: { title: '论文导读' }
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('../views/ForumPage.vue'),
    meta: { title: '学术论坛' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordPage.vue'),
    meta: { title: '忘记密码' }
  },
  {
    path: '/reset-password',
    redirect: '/forgot-password'
  },
  {
    path: '/user/profile',
    name: 'ProfileSettings',
    component: () => import('../views/user/ProfileSettingsPage.vue'),
    meta: { title: '个人信息设置' }
  },
  {
    path: '/user/certification',
    name: 'Certification',
    component: () => import('../views/user/CertificationPage.vue'),
    meta: { title: '学者认证' }
  },
  {
    path: '/user/appeal',
    name: 'Appeal',
    component: () => import('../views/user/AppealPage.vue'),
    meta: { title: '申诉' }
  },
  {
    path: '/user/achievements',
    name: 'Achievements',
    component: () => import('../views/user/AchievementsPage.vue'),
    meta: { title: '成果管理' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/admin/DashboardPage.vue'),
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/certifications',
    name: 'AdminCertifications',
    component: () => import('../views/admin/CertificationsPage.vue'),
    meta: { title: '认证审核', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/appeals',
    name: 'AdminAppeals',
    component: () => import('../views/admin/AppealsPage.vue'),
    meta: { title: '申诉处理', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/tasks',
    name: 'AdminTasks',
    component: () => import('../views/admin/TasksPage.vue'),
    meta: { title: '任务管理', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/achievements',
    name: 'AdminAchievements',
    component: () => import('../views/admin/AchievementsPage.vue'),
    meta: { title: '成果审核', requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title} - 学术成果分享平台`
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role !== 'admin') {
          next({ path: '/', replace: true })
          return
        }
      } catch (e) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
    } else {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  next()
})

export default router

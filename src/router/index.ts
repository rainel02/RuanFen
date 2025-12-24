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
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { title: '管理后台' }
  },
  {
    path: '/admin/certifications',
    name: 'AdminCertifications',
    component: () => import('../views/admin/AdminCertificationsPage.vue'),
    meta: { title: '认证审核' }
  },
  {
    path: '/admin/appeals',
    name: 'AdminAppeals',
    component: () => import('../views/admin/AdminAppealsPage.vue'),
    meta: { title: '申诉处理' }
  },
  {
    path: '/admin/tasks',
    name: 'AdminTasks',
    component: () => import('../views/admin/AdminTasksPage.vue'),
    meta: { title: '系统任务' }
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
  document.title = `${to.meta.title} - HuggingPapers`
  next()
})

export default router

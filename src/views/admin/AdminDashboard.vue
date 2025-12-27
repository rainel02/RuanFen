<template>
  <div class="admin-dashboard-page">
    <AppHeader />
    
    <!-- Vanta.js GLOBE 背景 -->
    <div id="vanta-globe-admin-bg" class="vanta-background"></div>

    <div class="page-content">
      <div class="container">
        <h1>管理后台</h1>
        
        <el-row :gutter="24" style="margin-top: 24px;">
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ pendingCertifications }}</div>
                <div class="stat-label">待审核认证</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ pendingAppeals }}</div>
                <div class="stat-label">待处理申诉</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ totalUsers }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="24" style="margin-top: 24px;">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>快速操作</span>
                </div>
              </template>
              <el-button type="primary" @click="$router.push('/admin/certifications')">
                认证审核
              </el-button>
              <el-button type="success" @click="$router.push('/admin/appeals')" style="margin-left: 12px;">
                申诉处理
              </el-button>
              <el-button @click="$router.push('/admin/tasks')" style="margin-left: 12px;">
                系统任务
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import * as adminApi from '../../api/admin'
import * as userApi from '../../api/user'

declare global {
  interface Window {
    VANTA: any
    THREE: any
  }
}

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

const ensureVantaGlobe = async () => {
  if (typeof window === 'undefined') return
  if (!vantaPromise) {
    vantaPromise = (async () => {
      if (!(window as any).THREE) {
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.min.js')
      }
      if (!(window as any).VANTA || !(window as any).VANTA.GLOBE) {
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js')
      }
    })()
  }
  await vantaPromise
}

const pendingCertifications = ref(0)
const pendingAppeals = ref(0)
const totalUsers = ref(0)

const loadStats = async () => {
  try {
    const certs = await adminApi.getPendingCertifications()
    pendingCertifications.value = Array.isArray(certs) ? certs.length : (certs?.applications?.length || 0)
    
    try {
      const appeals = await adminApi.getPendingAppeals()
      pendingAppeals.value = Array.isArray(appeals) ? appeals.length : (appeals?.appeals?.length || 0)
    } catch (error) {
      console.warn('加载申诉列表失败:', error)
      pendingAppeals.value = 0
    }
    
    try {
      const users = await userApi.getAllUsers()
      totalUsers.value = Array.isArray(users) ? users.length : 0
    } catch (error) {
      console.warn('加载用户列表失败:', error)
      totalUsers.value = 0
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

onMounted(async () => {
  await loadStats()
  await ensureVantaGlobe()
  
  // 初始化 Vanta.js GLOBE 背景
  setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).VANTA && (window as any).VANTA.GLOBE) {
      vantaEffect = (window as any).VANTA.GLOBE({
        el: '#vanta-globe-admin-bg',
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x8b4513,
        color2: 0xd4af37,
        backgroundColor: 0xf9f7ec,
        size: 1.00,
        speed: 1.00
      })
    }
  }, 100)
})

onUnmounted(() => {
  if (vantaEffect) {
    vantaEffect.destroy()
    vantaEffect = null
  }
})
</script>

<style scoped lang="scss">
.admin-dashboard-page {
  min-height: 100vh;
  position: relative;
  background: #f9f7ec;

  .vanta-background {
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    height: calc(100vh - 64px);
    z-index: 0;
    pointer-events: none;
  }

  .page-content {
    position: relative;
    z-index: 1;
    padding: 40px 0;

    h1 {
      color: #654321;
      font-family: 'Georgia', serif;
      font-size: 36px;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-card {
      background: rgba(249, 247, 236, 0.85);
      backdrop-filter: blur(10px);
      border: 2px solid #d4af37;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(139, 69, 19, 0.3);
      }

      .stat-content {
        text-align: center;
        padding: 20px;

        .stat-value {
          font-size: 42px;
          font-weight: bold;
          color: #8b4513;
          margin-bottom: 10px;
          font-family: 'Georgia', serif;
        }

        .stat-label {
          font-size: 16px;
          color: #654321;
          font-weight: 500;
        }
      }
    }

    .el-card {
      background: rgba(249, 247, 236, 0.85);
      backdrop-filter: blur(10px);
      border: 2px solid #d4af37;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);

      :deep(.el-card__header) {
        background: rgba(212, 175, 55, 0.2);
        border-bottom: 1px solid #d4af37;
        padding: 15px 20px;

        .card-header {
          font-size: 18px;
          font-weight: bold;
          color: #654321;
          font-family: 'Georgia', serif;
        }
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .el-button {
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

        &.el-button--success {
          background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
          color: #f9f7ec;

          &:hover {
            background: linear-gradient(135deg, #654321 0%, #4a2c1a 100%);
          }
        }
      }
    }
  }
}
</style>

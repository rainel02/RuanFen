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

declare global {
  interface Window {
    VANTA: any
    THREE: any
  }
}

let vantaEffect: any = null

const pendingCertifications = ref(0)
const pendingAppeals = ref(0)
const totalUsers = ref(0)

const loadStats = async () => {
  try {
    const certs = await adminApi.getCertifications({ status: 'pending' })
    pendingCertifications.value = certs.applications?.length || 0
    
    const appeals = await adminApi.getAppeals({ status: 'pending' })
    pendingAppeals.value = appeals.appeals?.length || 0
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

onMounted(async () => {
  loadStats()
  
  // 动态加载 THREE.js 和 Vanta.js
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
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

  try {
    // 先加载 THREE.js
    if (!(window as any).THREE) {
      await loadScript('https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.min.js')
    }
    // 再加载 Vanta.js GLOBE
    if (!(window as any).VANTA || !(window as any).VANTA.GLOBE) {
      await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js')
    }
    
    // 初始化 Vanta.js GLOBE 背景
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).VANTA) {
        vantaEffect = (window as any).VANTA.GLOBE({
          el: '#vanta-globe-admin-bg',
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x79550e,
          color2: 0xc5850f,
          backgroundColor: 0xf4f2e7
        })
      }
    }, 100)
  } catch (error) {
    console.error('Failed to load Vanta.js:', error)
  }
})

onUnmounted(() => {
  if (vantaEffect) {
    vantaEffect.destroy()
  }
})
</script>

<style scoped lang="scss">
.admin-dashboard-page {
  min-height: 100vh;
  position: relative;

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
    padding: 30px 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1 {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 36px;
      font-weight: 900;
      color: #654321;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.5px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: rgba(249, 247, 236, 0.85) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 16px !important;
      border: 3px solid rgba(184, 134, 11, 0.5) !important;
      box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.18),
        0 0 0 1px rgba(212, 175, 55, 0.2) inset,
        inset 0 2px 4px rgba(255, 255, 255, 0.5),
        inset 0 -2px 4px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

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
        transform: translateY(-4px);
        box-shadow: 
          0 12px 32px rgba(0, 0, 0, 0.22),
          0 0 0 2px rgba(212, 175, 55, 0.4),
          inset 0 2px 6px rgba(255, 255, 255, 0.6) !important;
      }

      :deep(.el-card__body) {
        padding: 30px 25px;
      }

      .stat-content {
        text-align: center;

        .stat-value {
          font-size: 42px;
          font-weight: 900;
          font-family: 'Georgia', 'Times New Roman', serif;
          color: #654321;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .stat-label {
          font-size: 16px;
          font-family: 'Georgia', serif;
          color: #8B4513;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      }
    }

    .el-card {
      background: rgba(249, 247, 236, 0.85) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 16px !important;
      border: 3px solid rgba(184, 134, 11, 0.5) !important;
      box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.18),
        0 0 0 1px rgba(212, 175, 55, 0.2) inset,
        inset 0 2px 4px rgba(255, 255, 255, 0.5),
        inset 0 -2px 4px rgba(0, 0, 0, 0.1) !important;

      :deep(.el-card__header) {
        background: linear-gradient(135deg, 
          rgba(212, 175, 55, 0.2) 0%, 
          rgba(184, 134, 11, 0.15) 100%);
        border-bottom: 2px solid rgba(184, 134, 11, 0.3);
        padding: 20px 25px;

        .card-header {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 20px;
          font-weight: 900;
          color: #654321;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }
      }

      :deep(.el-card__body) {
        padding: 25px;
      }

      :deep(.el-button) {
        font-family: 'Georgia', 'Times New Roman', serif !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
        padding: 10px 20px !important;
        transition: all 0.3s ease;

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

        &.el-button--success {
          background: linear-gradient(135deg, #67C23A 0%, #529b2e 100%) !important;
          border-color: #529b2e !important;
          color: #fff !important;

          &:hover {
            background: linear-gradient(135deg, #529b2e 0%, #3d7a1f 100%) !important;
            transform: translateY(-2px);
          }
        }

        &.el-button--default {
          background: linear-gradient(135deg, #8B4513 0%, #654321 100%) !important;
          border-color: #654321 !important;
          color: #f9f7ec !important;

          &:hover {
            background: linear-gradient(135deg, #654321 0%, #4a2c1a 100%) !important;
            transform: translateY(-2px);
          }
        }
      }
    }
  }
}
</style>

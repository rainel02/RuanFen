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

onMounted(() => {
  loadStats()
  
  // 初始化 Vanta.js GLOBE 背景
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VANTA) {
      vantaEffect = window.VANTA.GLOBE({
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

    h1 {
      color: #333;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);

      .stat-content {
        text-align: center;

        .stat-value {
          font-size: 36px;
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }
      }
    }

    .el-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
  }
}
</style>

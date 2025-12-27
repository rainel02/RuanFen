<template>
  <div class="admin-certifications-page">
    <AppHeader />
    
    <!-- Vanta.js GLOBE 背景 -->
    <div id="vanta-globe-certifications-bg" class="vanta-background"></div>

    <div class="page-content">
      <div class="container">
        <h1>认证审核</h1>
        
        <el-table :data="certifications" style="width: 100%">
          <el-table-column prop="applicantName" label="申请人" width="150" />
          <el-table-column prop="organization" label="机构" width="200" />
          <el-table-column prop="title" label="职位" width="150" />
          <el-table-column prop="applyTime" label="申请时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'pending' ? 'warning' : 'info'">
                {{ row.status === 'pending' ? '待审核' : row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="success" size="small" @click="handleApprove(row)">
                通过
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">
                驳回
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 驳回对话框 -->
        <el-dialog v-model="rejectDialogVisible" title="驳回认证申请" width="500px">
          <el-form :model="rejectForm">
            <el-form-item label="驳回原因">
              <el-input
                v-model="rejectForm.reason"
                type="textarea"
                :rows="4"
                placeholder="请输入驳回原因"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="rejectDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="confirmReject">确认驳回</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/AppHeader.vue'
import * as adminApi from '../../api/admin'

declare global {
  interface Window {
    VANTA: any
  }
}

let vantaEffect: any = null

const certifications = ref<any[]>([])
const loading = ref(false)
const rejectDialogVisible = ref(false)
const currentRejectId = ref('')
const rejectForm = ref({
  reason: ''
})

const loadCertifications = async () => {
  loading.value = true
  try {
    const response = await adminApi.getCertifications({ status: 'pending' })
    if (response.applications) {
      certifications.value = response.applications
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载认证列表失败')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (row: any) => {
  try {
    await adminApi.approveCertification(row.id || row.appId)
    ElMessage.success(`已批准 ${row.applicantName || row.realName} 的认证申请`)
    await loadCertifications()
  } catch (error: any) {
    ElMessage.error(error.message || '批准失败')
  }
}

const handleReject = (row: any) => {
  currentRejectId.value = row.id || row.appId
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  try {
    await adminApi.rejectCertification(currentRejectId.value, {
      reason: rejectForm.value.reason
    })
    ElMessage.success('已驳回认证申请')
    rejectDialogVisible.value = false
    await loadCertifications()
  } catch (error: any) {
    ElMessage.error(error.message || '驳回失败')
  }
}

onMounted(async () => {
  loadCertifications()
  
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
          el: '#vanta-globe-certifications-bg',
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
.admin-certifications-page {
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

    .el-table {
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
      overflow: hidden;

      :deep(.el-table__header) {
        background: linear-gradient(135deg, 
          rgba(212, 175, 55, 0.2) 0%, 
          rgba(184, 134, 11, 0.15) 100%);

        th {
          background: transparent !important;
          border-bottom: 2px solid rgba(184, 134, 11, 0.3) !important;
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-weight: 900 !important;
          color: #654321 !important;
          font-size: 16px !important;
        }
      }

      :deep(.el-table__body) {
        tr {
          background: rgba(249, 247, 236, 0.6) !important;

          &:hover {
            background: rgba(249, 247, 236, 0.9) !important;
          }

          td {
            border-bottom: 1px solid rgba(184, 134, 11, 0.2) !important;
            font-family: 'Georgia', serif !important;
            color: #654321 !important;
            font-weight: 600;
          }
        }
      }

      :deep(.el-tag) {
        font-family: 'Georgia', serif !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
      }
    }

    :deep(.el-button) {
      font-family: 'Georgia', 'Times New Roman', serif !important;
      font-weight: 700 !important;
      border-radius: 8px !important;
      padding: 8px 16px !important;
      transition: all 0.3s ease;

      &.el-button--success {
        background: linear-gradient(135deg, #67C23A 0%, #529b2e 100%) !important;
        border-color: #529b2e !important;
        color: #fff !important;

        &:hover {
          background: linear-gradient(135deg, #529b2e 0%, #3d7a1f 100%) !important;
          transform: translateY(-2px);
        }
      }

      &.el-button--danger {
        background: linear-gradient(135deg, #F56C6C 0%, #d63030 100%) !important;
        border-color: #d63030 !important;
        color: #fff !important;

        &:hover {
          background: linear-gradient(135deg, #d63030 0%, #b01e1e 100%) !important;
          transform: translateY(-2px);
        }
      }
    }

    :deep(.el-dialog) {
      background: rgba(249, 247, 236, 0.95) !important;
      backdrop-filter: blur(16px);
      border-radius: 16px !important;
      border: 3px solid rgba(184, 134, 11, 0.5) !important;
      box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.18),
        0 0 0 1px rgba(212, 175, 55, 0.2) inset !important;

      .el-dialog__header {
        background: linear-gradient(135deg, 
          rgba(212, 175, 55, 0.2) 0%, 
          rgba(184, 134, 11, 0.15) 100%);
        border-bottom: 2px solid rgba(184, 134, 11, 0.3);

        .el-dialog__title {
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-weight: 900 !important;
          color: #654321 !important;
        }
      }

      .el-dialog__body {
        :deep(.el-form-item__label) {
          font-family: 'Georgia', serif !important;
          font-weight: 700 !important;
          color: #654321 !important;
        }

        :deep(.el-textarea__inner) {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 2px solid rgba(184, 134, 11, 0.4) !important;
          border-radius: 8px !important;
          font-family: 'Georgia', serif !important;
          color: #654321 !important;
        }
      }
    }
  }
}
</style>


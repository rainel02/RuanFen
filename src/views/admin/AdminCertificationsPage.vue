<template>
  <div class="admin-certifications-page">
    <AppHeader />
    
    <!-- Vanta.js GLOBE 背景 -->
    <div id="vanta-globe-certifications-bg" class="vanta-background"></div>

    <div class="page-content">
      <div class="container">
        <h1>认证审核</h1>
        
        <div class="glass-panel certifications-table-wrapper">
          <el-table :data="certifications" style="width: 100%" v-loading="loading">
            <el-table-column prop="realName" label="申请人" width="150" />
            <el-table-column prop="organization" label="机构" width="200" />
            <el-table-column prop="title" label="职位" width="150" />
            <el-table-column prop="submittedAt" label="申请时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.submittedAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'PENDING' || row.status === 'pending' ? 'warning' : 'info'">
                  {{ row.status === 'PENDING' || row.status === 'pending' ? '待审核' : row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button 
                  class="gothic-btn-small"
                  type="success"
                  @click="handleApprove(row)"
                >
                  通过
                </el-button>
                <el-button 
                  class="gothic-btn-small"
                  type="danger"
                  @click="handleReject(row)"
                >
                  驳回
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

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
    const response = await adminApi.getPendingCertifications()
    // 后端返回的是数组或包含 applications 的对象
    certifications.value = Array.isArray(response) ? response : (response?.applications || [])
  } catch (error: any) {
    ElMessage.error(error.message || '加载认证列表失败')
    certifications.value = []
  } finally {
    loading.value = false
  }
}

const handleApprove = async (row: any) => {
  try {
    await adminApi.approveCertification(row.id || row.certificationId)
    ElMessage.success(`已批准 ${row.realName || row.applicantName} 的认证申请`)
    await loadCertifications()
  } catch (error: any) {
    ElMessage.error(error.message || '批准失败')
  }
}

const handleReject = (row: any) => {
  currentRejectId.value = row.id || row.certificationId
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  try {
    await adminApi.rejectCertification(currentRejectId.value, rejectForm.value.reason)
    ElMessage.success('已驳回认证申请')
    rejectDialogVisible.value = false
    await loadCertifications()
  } catch (error: any) {
    ElMessage.error(error.message || '驳回失败')
  }
}

const formatDate = (date: string | Date) => {
  if (!date) return '未知'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN')
}

onMounted(async () => {
  await loadCertifications()
  await ensureVantaGlobe()
  
  // 初始化 Vanta.js GLOBE 背景
  setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).VANTA && (window as any).VANTA.GLOBE) {
      vantaEffect = (window as any).VANTA.GLOBE({
        el: '#vanta-globe-certifications-bg',
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
.admin-certifications-page {
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

    .certifications-table-wrapper {
      background: rgba(249, 247, 236, 0.85);
      backdrop-filter: blur(10px);
      border: 2px solid #d4af37;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
      padding: 20px;
      overflow: hidden;

      :deep(.el-table) {
        background: transparent;
        
        .el-table__header {
          background: rgba(212, 175, 55, 0.2);
          
          th {
            background: rgba(212, 175, 55, 0.2);
            color: #654321;
            font-weight: bold;
            border-bottom: 2px solid #d4af37;
          }
        }

        .el-table__body {
          tr {
            background: rgba(249, 247, 236, 0.5);
            
            &:hover {
              background: rgba(212, 175, 55, 0.1);
            }
          }

          td {
            border-bottom: 1px solid rgba(212, 175, 55, 0.3);
            color: #654321;
          }
        }
      }

      .gothic-btn-small {
        background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
        border: none;
        color: #654321;
        font-weight: bold;
        border-radius: 6px;
        padding: 6px 12px;
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

        &.el-button--danger {
          background: linear-gradient(135deg, #8b0000 0%, #654321 100%);
          color: #f9f7ec;

          &:hover {
            background: linear-gradient(135deg, #654321 0%, #4a2c1a 100%);
          }
        }
      }
    }
  }
}

.glass-panel {
  background: rgba(249, 247, 236, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid #d4af37;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
}
</style>


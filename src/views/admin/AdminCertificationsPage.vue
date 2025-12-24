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

onMounted(() => {
  loadCertifications()
  
  // 初始化 Vanta.js GLOBE 背景
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VANTA) {
      vantaEffect = window.VANTA.GLOBE({
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

    .el-table {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
  }
}
</style>


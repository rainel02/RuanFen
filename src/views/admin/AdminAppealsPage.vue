<template>
  <div class="admin-appeals-page">
    <AppHeader />
    
    <!-- Vanta.js GLOBE 背景 -->
    <div id="vanta-globe-appeals-bg" class="vanta-background"></div>

    <div class="page-content">
      <div class="container">
        <h1>申诉处理</h1>
        
        <el-table :data="appeals" style="width: 100%">
          <el-table-column prop="appealType" label="申诉类型" width="120">
            <template #default="{ row }">
              {{ row.appealType === 'identity_stolen' ? '身份冒用' : '成果冒领' }}
            </template>
          </el-table-column>
          <el-table-column prop="applicantName" label="申诉人" width="150" />
          <el-table-column prop="targetName" label="被申诉对象" width="150" />
          <el-table-column prop="reason" label="申诉原因" min-width="200" />
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'pending' ? 'warning' : 'success'">
                {{ row.status === 'pending' ? '待处理' : '已处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button size="small" @click="viewDetails(row)">查看详情</el-button>
              <el-button type="success" size="small" @click="handleProcess(row, 'approve')">
                批准
              </el-button>
              <el-button type="danger" size="small" @click="handleProcess(row, 'reject')">
                驳回
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 详情对话框 -->
        <el-dialog v-model="detailDialogVisible" title="申诉详情" width="600px">
          <div v-if="currentAppeal">
            <p><strong>申诉类型：</strong>{{ currentAppeal.appealType === 'identity_stolen' ? '身份冒用' : '成果冒领' }}</p>
            <p><strong>申诉人：</strong>{{ currentAppeal.applicantName }}</p>
            <p><strong>被申诉对象：</strong>{{ currentAppeal.targetName }}</p>
            <p><strong>申诉原因：</strong>{{ currentAppeal.reason }}</p>
            <p><strong>证据材料：</strong></p>
            <div v-if="currentAppeal.evidenceMaterials && currentAppeal.evidenceMaterials.length > 0">
              <el-tag v-for="(evidence, index) in currentAppeal.evidenceMaterials" :key="index" style="margin-right: 8px;">
                {{ evidence }}
              </el-tag>
            </div>
            <p v-else>无证据材料</p>
          </div>
        </el-dialog>

        <!-- 处理对话框 -->
        <el-dialog v-model="processDialogVisible" :title="processAction === 'approve' ? '批准申诉' : '驳回申诉'" width="500px">
          <el-form :model="processForm">
            <el-form-item label="处理原因" v-if="processAction === 'reject'">
              <el-input
                v-model="processForm.reason"
                type="textarea"
                :rows="4"
                placeholder="请输入驳回原因"
              />
            </el-form-item>
            <el-form-item label="处理说明" v-else>
              <el-input
                v-model="processForm.reason"
                type="textarea"
                :rows="4"
                placeholder="请输入处理说明（可选）"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="processDialogVisible = false">取消</el-button>
            <el-button :type="processAction === 'approve' ? 'success' : 'danger'" @click="confirmProcess">
              确认{{ processAction === 'approve' ? '批准' : '驳回' }}
            </el-button>
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
    VANTA: {
      GLOBE: (options: any) => any
    }
  }
}

let vantaEffect: any = null

const appeals = ref<any[]>([])
const loading = ref(false)
const detailDialogVisible = ref(false)
const processDialogVisible = ref(false)
const currentAppeal = ref<any>(null)
const processAction = ref<'approve' | 'reject'>('approve')
const processForm = ref({
  reason: ''
})

const loadAppeals = async () => {
  loading.value = true
  try {
    const response = await adminApi.getAppeals({ status: 'pending' })
    if (response.appeals) {
      appeals.value = response.appeals
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载申诉列表失败')
  } finally {
    loading.value = false
  }
}

const viewDetails = (row: any) => {
  currentAppeal.value = row
  detailDialogVisible.value = true
}

const handleProcess = (row: any, action: 'approve' | 'reject') => {
  currentAppeal.value = row
  processAction.value = action
  processForm.value.reason = ''
  processDialogVisible.value = true
}

const confirmProcess = async () => {
  if (processAction.value === 'reject' && !processForm.value.reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  try {
    await adminApi.processAppeal(currentAppeal.value.id || currentAppeal.value.caseId, {
      action: processAction.value,
      reason: processForm.value.reason
    })
    ElMessage.success(`已${processAction.value === 'approve' ? '批准' : '驳回'}申诉`)
    processDialogVisible.value = false
    await loadAppeals()
  } catch (error: any) {
    ElMessage.error(error.message || '处理申诉失败')
  }
}

onMounted(() => {
  loadAppeals()
  
  // 初始化 Vanta.js GLOBE 背景
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VANTA) {
      vantaEffect = window.VANTA.GLOBE({
        el: '#vanta-globe-appeals-bg',
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
.admin-appeals-page {
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


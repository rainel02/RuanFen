<template>
  <div class="patent-detail-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="10" animated />
        </div>
        
        <div v-else-if="patent" class="patent-detail">
          <el-row :gutter="24">
            <el-col :lg="18" :md="24" :sm="24" :xs="24">
              <el-card class="main-content">
                <div class="patent-header-row">
                  <div class="title-section">
                    <div class="type-badge">{{ patent.type }}</div>
                    <h1 class="patent-title">{{ patent.title }}</h1>
                  </div>
                </div>

                <div class="patent-basic-info">
                  <el-descriptions :column="2" border class="info-descriptions">
                    <el-descriptions-item label="申请号">{{ patent.applicationNumber }}</el-descriptions-item>
                    <el-descriptions-item label="申请年份">{{ patent.applicationYear }}</el-descriptions-item>
                    <el-descriptions-item label="授权公告号">{{ patent.publicationNumber }}</el-descriptions-item>
                    <el-descriptions-item label="授权公告年份">{{ patent.publicationYear }}</el-descriptions-item>
                    <el-descriptions-item label="IPC分类号">{{ patent.ipcClassification }}</el-descriptions-item>
                    <el-descriptions-item label="当前权利人">{{ patent.currentAssignee }}</el-descriptions-item>
                  </el-descriptions>
                </div>

                <div class="patent-section">
                  <h3>摘要</h3>
                  <p class="text-content">{{ patent.abstract }}</p>
                </div>

                <!-- <div class="patent-section">
                  <h3>主权项</h3>
                  <div class="claims-content">
                    <p class="text-content">{{ patent.claims }}</p>
                  </div>
                </div> -->
              </el-card>
            </el-col>

            <el-col :lg="6" :md="24" :sm="24" :xs="24">
              <div class="sidebar">
                <el-card class="people-card">
                  <template #header>
                    <h4>相关人员</h4>
                  </template>
                  
                  <div class="people-group">
                    <div class="group-label">申请人</div>
                    <div class="group-value">{{ patent.applicant }}</div>
                  </div>

                  <div class="people-group">
                    <div class="group-label">发明人</div>
                    <div class="group-value">
                      <el-tag 
                        v-for="inventor in patent.inventors" 
                        :key="inventor"
                        class="inventor-tag"
                        effect="plain"
                      >
                        {{ inventor }}
                      </el-tag>
                    </div>
                  </div>
                </el-card>

                <el-card class="actions-card">
                  <!-- <el-button type="primary" class="action-btn download-btn" :icon="Download" @click="handleDownload">
                    下载全文 PDF
                  </el-button> -->
                  <el-button class="action-btn" :icon="DocumentCopy" @click="handleCite">
                    引用此专利
                  </el-button>
                </el-card>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-else class="empty-state">
          <el-empty description="未找到专利信息" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Download, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import { usePatentsStore } from '../stores/patents'
import type { Patent } from '../types/patent'

const route = useRoute()
const patentsStore = usePatentsStore()
const patent = ref<Patent | null>(null)
const loading = ref(true)

const handleDownload = () => {
  ElMessage({
    message: '正在开始下载 PDF...',
    type: 'success',
    customClass: 'pf-message-parchment'
  })
}

const handleCite = () => {
  if (!patent.value) return
  const citation = `${patent.value.inventors.join(', ')}. ${patent.value.title}. ${patent.value.applicationNumber}, ${patent.value.applicationYear}.`
  
  navigator.clipboard.writeText(citation).then(() => {
    ElMessage({
      message: '引用格式已复制到剪贴板',
      type: 'success',
      customClass: 'pf-message-parchment'
    })
  }).catch(() => {
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error',
      customClass: 'pf-message-parchment'
    })
  })
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    // try to find patent from already-fetched list
    let found = patentsStore.patents.find((p: Patent) => p.id === id || p.applicationNumber === id)
    if (!found) {
      // ensure patents list is loaded, then try again
      await patentsStore.fetchPatents()
      found = patentsStore.patents.find((p: Patent) => p.id === id || p.applicationNumber === id)
    }
    patent.value = found || null
  }
  loading.value = false
})
</script>

<style scoped lang="scss">
.patent-detail-page {
  --pf-bg: #f7efe2;
  --pf-ink: #2e2a25;
  --pf-muted: #7a6f63;
  --pf-accent: #b8893a;
  --pf-brown: #8B4513;
  --pf-brown-dark: #654321;
  
  min-height: 100vh;
  background: var(--pf-bg);
  color: var(--pf-ink);
  font-family: "Noto Serif", serif;
}

.page-content {
  padding: 36px 16px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.main-content {
  background: rgba(251, 246, 236, 0.9);
  border: 1px solid rgba(184, 137, 58, 0.2);
  box-shadow: 0 6px 24px rgba(46, 42, 37, 0.06);
  border-radius: 12px;
  margin-bottom: 24px;
}

.patent-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(184, 137, 58, 0.2);
  padding-bottom: 16px;
}

.title-section {
  flex: 1;
}

.type-badge {
  display: inline-block;
  background: var(--pf-brown);
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.patent-title {
  margin: 0;
  font-size: 24px;
  color: var(--pf-ink);
  line-height: 1.4;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  margin-left: 16px;
  
  &.status-valid {
    background: rgba(76, 175, 80, 0.1);
    color: #2e7d32;
    border: 1px solid rgba(76, 175, 80, 0.2);
  }
  
  &.status-invalid {
    background: rgba(211, 47, 47, 0.1);
    color: #c62828;
    border: 1px solid rgba(211, 47, 47, 0.2);
  }
}

.patent-basic-info {
  margin-bottom: 32px;
  
  :deep(.el-descriptions__label) {
    background: rgba(184, 137, 58, 0.05);
    color: var(--pf-muted);
    font-weight: 600;
  }
  
  :deep(.el-descriptions__content) {
    background: transparent;
    color: var(--pf-ink);
  }
  
  :deep(.el-descriptions__cell) {
    border-color: rgba(184, 137, 58, 0.2);
  }
}

.patent-section {
  margin-bottom: 32px;
  
  h3 {
    font-size: 18px;
    color: var(--pf-brown);
    margin-bottom: 12px;
    border-left: 4px solid var(--pf-accent);
    padding-left: 12px;
  }
}

.text-content {
  line-height: 1.8;
  color: #4a4a4a;
  white-space: pre-wrap;
}

.claims-content {
  background: #fffcf5;
  padding: 16px;
  border-radius: 8px;
  border: 1px dashed rgba(184, 137, 58, 0.3);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.people-card, .actions-card {
  background: rgba(251, 246, 236, 0.9);
  border: 1px solid rgba(184, 137, 58, 0.2);
  box-shadow: 0 4px 12px rgba(46, 42, 37, 0.04);
  border-radius: 12px;
  
  :deep(.el-card__header) {
    border-bottom-color: rgba(184, 137, 58, 0.2);
    padding: 16px;
    
    h4 {
      margin: 0;
      color: var(--pf-brown);
    }
  }
}

.people-group {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.group-label {
  font-size: 12px;
  color: var(--pf-muted);
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 8px;
}

.group-value {
  font-weight: 600;
  color: var(--pf-ink);
}

.inventor-tag {
  margin-right: 8px;
  margin-bottom: 8px;
  border-color: rgba(184, 137, 58, 0.3);
  color: var(--pf-brown);
  background: #fffcf5;
}

.action-btn {
  width: 100%;
  margin-bottom: 12px;
  justify-content: center;
  margin-left: 0 !important; /* 修复 Element Plus 默认的相邻按钮左边距导致的未对齐问题 */
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.download-btn {
    background: var(--pf-brown);
    border-color: var(--pf-brown-dark);
    color: #fff;
    
    &:hover, &:focus {
      background: var(--pf-brown-dark);
      border-color: var(--pf-brown-dark);
      color: #fff; /* 确保悬停时文字颜色清晰 */
    }
  }
}
</style>

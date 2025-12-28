<template>
  <div class="kb-page">
    <AppHeader />
    <div class="kb-container">
      <div class="kb-layout">
        <!-- 左侧分类/文件夹 -->
        <aside class="kb-sidebar">
          <div class="sidebar-header">
            <h4>知识库</h4>
            <el-button type="primary" link @click="showCreate = true">新建</el-button>
          </div>
          <el-menu class="kb-menu" :default-active="currentKb?.id || ''">
            <el-menu-item
              v-for="kb in knowledgeBases"
              :key="kb.id"
              :index="kb.id"
              @click="selectKb(kb)"
            >
              <div class="menu-title">{{ kb.name }}</div>
              <el-tag size="small" :type="kb.visibility === 'PRIVATE' ? 'info' : 'success'">
                {{ kb.visibility === 'PRIVATE' ? '私密' : '公开' }}
              </el-tag>
            </el-menu-item>
          </el-menu>
          <div class="sidebar-tip">
            支持按主题创建多个知识库，例如“深度学习”“毕业设计参考”“待读清单”。
          </div>
        </aside>

        <!-- 右侧主区域 -->
        <main class="kb-main">
          <div class="kb-header">
            <div>
              <h2>我的智库</h2>
              <p class="kb-subtitle">上传论文，AI 自动解析并入库，供研读与问答</p>
            </div>
            <div class="kb-actions">
              <el-button type="primary" @click="showCreate = true">新建知识库</el-button>
              <el-button @click="refreshBases" :loading="loadingBases">刷新</el-button>
            </div>
          </div>

          <div class="main-content-layout">
            <!-- 知识库内容区域 -->
            <div class="kb-content-wrapper">
              <div class="kb-cards" v-if="currentKb">
                <el-card shadow="hover" class="current-kb-card">
                  <div class="current-title">
                    <el-tag type="info" size="small">{{ currentKb.visibility === 'PRIVATE' ? '私密库' : '公开库' }}</el-tag>
                    <span class="current-name">{{ currentKb.name }}</span>
                  </div>
                  <p class="kb-desc">{{ currentKb.description || '暂无描述' }}</p>
                  <div class="kb-meta">创建于 {{ formatDate(currentKb.createdAt) }}</div>
                  <div class="kb-ops">
                    <el-button text type="primary" @click="selectKb(currentKb)">查看文档</el-button>
                    <el-popconfirm title="确认删除该知识库及其文档？" @confirm="handleDelete(currentKb.id)">
                      <template #reference>
                        <el-button text type="danger">删除</el-button>
                      </template>
                    </el-popconfirm>
                  </div>
                </el-card>
              </div>

              <div class="kb-content">
                <div class="upload-banner">
                  <div>
                    <h4>上传论文</h4>
                    <p>支持拖拽 PDF，自动解析摘要和页数，入库后可用于 AI 问答</p>
                  </div>
                  <el-upload
                    drag
                    multiple
                    :http-request="handleUpload"
                    :show-file-list="false"
                    accept="application/pdf"
                    class="upload-drag"
                  >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将 PDF 拖到此处，或 <em>点击上传</em></div>
                  </el-upload>
                </div>

                <el-table
                  v-loading="loadingDocs"
                  :data="documents"
                  border
                  style="width: 100%"
                  empty-text="请选择左侧知识库后上传文档"
                  class="kb-table"
                >
                  <el-table-column prop="originalFilename" label="文件名" min-width="240" />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="statusTag(row.status)" size="small">
                        {{ statusText(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                <!-- 移除页数、错误列，解析时间改为上传时间 -->
                <el-table-column prop="summary" label="摘要" min-width="220" show-overflow-tooltip />
                <el-table-column prop="createdAt" label="上传时间" width="160">
                  <template #default="{ row }">
                    {{ formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- AI问答聊天框 -->
            <div class="qa-chat-panel" v-if="qaDialogVisible">
              <div class="qa-panel-header">
                <h3>全库问答</h3>
                <el-button text @click="qaDialogVisible = false" class="close-btn">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <div class="qa-chat">
                <div class="qa-messages">
                  <div v-for="(msg, idx) in chatHistory" :key="idx" class="qa-msg" :class="msg.role">
                    <div class="qa-msg-bubble">
                      <div class="qa-msg-role">{{ msg.role === 'user' ? '我' : '助手' }}</div>
                      <div class="qa-msg-text">{{ msg.content }}</div>
                      <div v-if="isNotFound(msg.content)" class="qa-hint">请更具体提问，如包含论文标题或关键词。</div>
                      <div v-if="msg.references?.length && !isNotFound(msg.content)" class="qa-refs">
                        <div class="qa-refs-title">引用</div>
                        <ul>
                          <li v-for="(ref, rIdx) in msg.references" :key="rIdx">
                            [{{ rIdx + 1 }}] {{ ref.source || '未知来源' }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div v-if="!chatHistory.length" class="qa-empty">还没有对话，提一个问题试试</div>
                </div>

                <div class="qa-input-area">
                  <el-input
                    v-model="qaQuestion"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入你的问题，基于当前用户的知识库回答"
                  />
                  <div class="qa-actions">
                    <el-button type="primary" :loading="qaLoading" @click="handleQa">发送</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <div class="floating-qa">
      <div class="qa-button-ball" @click="qaDialogVisible = !qaDialogVisible">
        <el-icon class="qa-icon"><ChatLineRound /></el-icon>
        <span class="qa-button-text">全库问答</span>
      </div>
    </div>

    <el-dialog v-model="showCreate" title="新建知识库" width="420px" class="gothic-dialog">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="createForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" rows="3" placeholder="可选" />
        </el-form-item>
        <el-form-item label="可见性">
          <el-radio-group v-model="createForm.visibility">
            <el-radio label="PRIVATE">私密</el-radio>
            <el-radio label="PUBLIC">公开</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatLineRound, Close } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import {
  listKnowledgeBases,
  createKnowledgeBase,
  deleteKnowledgeBase,
  listDocuments,
  uploadDocument,
  type KnowledgeBase,
  type KnowledgeDocument,
  qa
} from '@/api/kb'

const knowledgeBases = ref<KnowledgeBase[]>([])
const documents = ref<KnowledgeDocument[]>([])
const currentKb = ref<KnowledgeBase | null>(null)
const loadingBases = ref(false)
const loadingDocs = ref(false)
const showCreate = ref(false)
const creating = ref(false)

const createForm = ref({
  name: '',
  description: '',
  visibility: 'PRIVATE' as 'PRIVATE' | 'PUBLIC'
})

const qaDialogVisible = ref(false)
const qaLoading = ref(false)
const qaQuestion = ref('')
const chatHistory = ref<Array<{ role: 'user' | 'assistant'; content: string; references?: any[] }>>([])

onMounted(() => {
  refreshBases()
})

const refreshBases = async () => {
  loadingBases.value = true
  try {
    const data = await listKnowledgeBases()
    knowledgeBases.value = data || []
    if (!currentKb.value && knowledgeBases.value.length > 0) {
      selectKb(knowledgeBases.value[0])
    } else if (currentKb.value) {
      const found = knowledgeBases.value.find(k => k.id === currentKb.value?.id)
      if (found) selectKb(found)
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '获取知识库失败')
  } finally {
    loadingBases.value = false
  }
}

const selectKb = async (kb: KnowledgeBase) => {
  currentKb.value = kb
  loadingDocs.value = true
  try {
    documents.value = await listDocuments(kb.id)
  } catch (e: any) {
    ElMessage.error(e?.message || '获取文档列表失败')
  } finally {
    loadingDocs.value = false
  }
}

const handleCreate = async () => {
  if (!createForm.value.name.trim()) {
    ElMessage.warning('请填写名称')
    return
  }
  creating.value = true
  try {
    const kb = await createKnowledgeBase({
      name: createForm.value.name,
      description: createForm.value.description,
      visibility: createForm.value.visibility
    })
    ElMessage.success('创建成功')
    showCreate.value = false
    createForm.value = { name: '', description: '', visibility: 'PRIVATE' }
    await refreshBases()
    if (kb) selectKb(kb)
  } catch (e: any) {
    ElMessage.error(e?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await deleteKnowledgeBase(id)
    ElMessage.success('删除成功')
    if (currentKb.value?.id === id) {
      currentKb.value = null
      documents.value = []
    }
    await refreshBases()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

const handleUpload = async (options: any) => {
  if (!currentKb.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  const file: File = options.file
  try {
    const doc = await uploadDocument(currentKb.value.id, file)
    // 如果 ai_service 成功返回，则以其解析结果为准，将状态视为已解析
    if (doc) {
      doc.status = 'READY'
      doc.parseError = undefined
    }
    ElMessage.success('上传成功，正在解析')
    await selectKb(currentKb.value)
  } catch (e: any) {
    ElMessage.error(e?.message || '上传失败')
  }
}

const handleQa = async () => {
  if (!qaQuestion.value.trim()) {
    ElMessage.warning('请输入问题')
    return
  }
  const question = qaQuestion.value.trim()
  qaLoading.value = true
  try {
    chatHistory.value.push({ role: 'user', content: question })
    const res = await qa(question, 5, currentKb.value?.id)
    chatHistory.value.push({ role: 'assistant', content: res.answer, references: res.references })
    qaQuestion.value = ''
  } catch (e: any) {
    ElMessage.error(e?.message || '问答失败')
  } finally {
    qaLoading.value = false
  }
}

const formatDate = (val?: string) => {
  if (!val) return '-'
  return val.replace('T', ' ').substring(0, 19)
}

const statusText = (status: KnowledgeDocument['status']) => {
  switch (status) {
    case 'READY':
      return '已解析'
    case 'PARSING':
      return '解析中'
    case 'FAILED':
      return '失败'
    default:
      return '待处理'
  }
}

const statusTag = (status: KnowledgeDocument['status']) => {
  switch (status) {
    case 'READY':
      return 'success'
    case 'PARSING':
      return 'warning'
    case 'FAILED':
      return 'danger'
    default:
      return 'info'
  }
}

const isNotFound = (text?: string) => {
  if (!text) return false
  return text.includes('未找到相关信息')
}
</script>

<style scoped lang="scss">
.kb-page {
  min-height: 100vh;
  position: relative;
  background-image: url('@/assets/frontBG.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding-bottom: 40px;
}

.kb-container {
  max-width: 1600px;
  margin: 24px auto 60px;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.kb-layout {
  display: flex;
  gap: 16px;
  width: 100%;
}

.kb-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: rgba(249, 247, 236, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 3px solid rgba(184, 134, 11, 0.5);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  padding: 18px 16px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

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
    pointer-events: none;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h4 {
    margin: 0;
    font-size: 20px;
    font-weight: 900;
    color: #654321;
    font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }
}

.kb-menu {
  border: none;
  --el-menu-item-height: 44px;
  padding-right: 8px;
  background: transparent !important;

  :deep(.el-menu-item) {
    border-radius: 8px;
    margin-bottom: 6px;
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(184, 134, 11, 0.2);
    transition: all 0.3s ease;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-weight: 600;
    color: #654321;

    &:hover {
      background: rgba(212, 175, 55, 0.2);
      border-color: rgba(184, 134, 11, 0.4);
      transform: translateX(4px);
    }

    &.is-active {
      background: rgba(212, 175, 55, 0.3);
      border-color: #D4AF37;
      color: #654321;
    }
  }
}

.menu-title {
  margin-right: 10px;
  font-weight: 600;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.sidebar-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #8B4513;
  line-height: 1.6;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-style: italic;
}

.kb-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-content-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.kb-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  max-width: calc(100% - 480px); // 为右侧聊天框留出空间（440px + 20px gap + 20px padding）
}

.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(249, 247, 236, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 3px solid rgba(184, 134, 11, 0.5);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px 30px;
  position: relative;

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
    pointer-events: none;
  }

  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 900;
    color: #654321;
    font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    letter-spacing: 0.5px;
  }
}

.kb-subtitle {
  color: #8B4513;
  font-size: 14px;
  font-style: italic;
  font-family: 'Georgia', 'Times New Roman', serif;
  margin-top: 4px;
}

.kb-actions {
  display: flex;
  gap: 12px;
}

.kb-cards {
  display: flex;
  gap: 12px;
}

.current-kb-card {
  flex: 1;
  background: rgba(249, 247, 236, 0.85) !important;
  backdrop-filter: blur(16px) !important;
  border: 3px solid rgba(184, 134, 11, 0.5) !important;
  border-radius: 16px !important;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.4s ease !important;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 32px rgba(0, 0, 0, 0.22),
      0 0 0 2px rgba(212, 175, 55, 0.4),
      inset 0 2px 6px rgba(255, 255, 255, 0.6) !important;
  }
}

.current-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.current-name {
  font-size: 18px;
  font-weight: 900;
  color: #654321;
  font-family: 'Georgia', 'Times New Roman', serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.kb-desc {
  color: #8B4513;
  margin: 4px 0;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-style: italic;
}

.kb-meta {
  color: #B8860B;
  font-size: 12px;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.kb-ops {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.kb-content {
  background: rgba(249, 247, 236, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 3px solid rgba(184, 134, 11, 0.5);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: relative;

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
    pointer-events: none;
  }
}

.upload-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.3);
  border: 2px dashed rgba(184, 134, 11, 0.4);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.6);
    background: rgba(255, 255, 255, 0.4);
  }

  h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 900;
    color: #654321;
    font-family: 'Georgia', 'Times New Roman', serif;
  }

  p {
    margin: 0;
    color: #8B4513;
    font-size: 13px;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-style: italic;
  }
}

.upload-drag {
  width: 320px;

  :deep(.el-upload-dragger) {
    background: rgba(255, 255, 255, 0.5);
    border: 2px dashed rgba(184, 134, 11, 0.4);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #D4AF37;
      background: rgba(255, 255, 255, 0.7);
    }
  }

  :deep(.el-icon-upload) {
    color: #D4AF37;
    font-size: 48px;
  }

  :deep(.el-upload__text) {
    color: #654321;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-weight: 600;

    em {
      color: #D4AF37;
      font-weight: 700;
    }
  }
}

.kb-table {
  margin-top: 12px;

  :deep(.el-table) {
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(184, 134, 11, 0.3);
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-table__header) {
    background: rgba(212, 175, 55, 0.2);
    
    th {
      background: rgba(212, 175, 55, 0.2) !important;
      color: #654321 !important;
      font-weight: 900 !important;
      font-family: 'Georgia', 'Times New Roman', serif !important;
      border-bottom: 2px solid rgba(184, 134, 11, 0.4) !important;
    }
  }

  :deep(.el-table__body) {
    tr {
      background: rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(212, 175, 55, 0.15) !important;
      }

      td {
        color: #654321;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-weight: 600;
        border-bottom: 1px solid rgba(184, 134, 11, 0.2) !important;
      }
    }
  }
}

.floating-qa {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.qa-button-ball {
  min-width: 120px;
  height: 64px;
  border-radius: 32px;
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  border: 3px solid rgba(184, 134, 11, 0.6);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(184, 134, 11, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 32px;
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.6) 0%, 
      transparent 50%, 
      rgba(184, 134, 11, 0.6) 100%);
    z-index: -1;
    opacity: 0.8;
  }

  &:hover {
    transform: scale(1.05) translateY(-4px);
    box-shadow: 
      0 12px 32px rgba(0, 0, 0, 0.4),
      0 6px 16px rgba(184, 134, 11, 0.5),
      inset 0 2px 6px rgba(255, 255, 255, 0.4),
      inset 0 -2px 6px rgba(0, 0, 0, 0.3);
    border-color: rgba(212, 175, 55, 0.8);
  }

  &:active {
    transform: scale(1.02) translateY(-2px);
  }

  .qa-icon {
    font-size: 24px;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .qa-button-text {
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Georgia', 'Times New Roman', serif;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
  }

  &:hover .qa-icon {
    transform: scale(1.1);
  }
}

.qa-chat-panel {
  width: 420px;
  flex-shrink: 0;
  background: rgba(249, 247, 236, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 3px solid rgba(184, 134, 11, 0.5);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  position: sticky;
  top: 24px;

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
    pointer-events: none;
  }
}

.qa-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 2px solid rgba(184, 134, 11, 0.3);
  background: linear-gradient(135deg, 
    rgba(212, 175, 55, 0.2) 0%, 
    rgba(184, 134, 11, 0.15) 100%);
  border-radius: 16px 16px 0 0;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #654321;
    font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.5px;
  }

  .close-btn {
    padding: 4px;
    color: #654321;
    font-size: 20px;

    &:hover {
      color: #D4AF37;
      background: rgba(212, 175, 55, 0.1);
    }
  }
}


.qa-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 8px;
}

.qa-chat {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 20px;
  gap: 16px;
}

.qa-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(249, 247, 236, 0.6);
  border: 2px solid rgba(184, 134, 11, 0.3);
  border-radius: 12px;
  min-height: 400px;
  max-height: 600px;
}

.qa-msg {
  display: flex;
  margin-bottom: 12px;
}

.qa-msg.user {
  justify-content: flex-end;
}

.qa-msg.assistant {
  justify-content: flex-start;
}

.qa-msg-bubble {
  max-width: 90%;
  padding: 18px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(184, 134, 11, 0.2);
  font-family: 'Georgia', 'Times New Roman', serif;
}

.qa-msg.user .qa-msg-bubble {
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(184, 134, 11, 0.4);
}

.qa-msg-role {
  font-size: 16px;
  color: #8B4513;
  margin-bottom: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.qa-msg-text {
  line-height: 2;
  white-space: pre-wrap;
  color: #654321;
  font-weight: 600;
  font-size: 18px;
}

.qa-refs {
  margin-top: 12px;
  font-size: 16px;
  color: #8B4513;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.qa-refs-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: #654321;
  font-size: 17px;
}

.qa-refs ul {
  padding-left: 16px;
  margin: 0;
}

.qa-empty {
  text-align: center;
  color: #8B4513;
  padding: 60px 0;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-style: italic;
  font-size: 18px;
}

.qa-hint {
  margin-top: 10px;
  color: #B8860B;
  font-size: 16px;
  font-style: italic;
}

.qa-input-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 按钮样式
:deep(.el-button) {
  border-radius: 12px !important;
  font-weight: 700 !important;
  font-family: 'Georgia', 'Times New Roman', serif !important;
  border: 2px solid !important;
  transition: all 0.3s ease !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;

  &.el-button--primary {
    background: #D4AF37 !important;
    border-color: #B8860B !important;
    color: #fff !important;

    &:hover {
      background: #B8860B !important;
      border-color: #8B4513 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(184, 134, 11, 0.4);
    }
  }

  &.el-button--default {
    background: rgba(212, 175, 55, 0.1) !important;
    border-color: #D4AF37 !important;
    color: #654321 !important;

    &:hover {
      background: rgba(212, 175, 55, 0.2) !important;
      border-color: #B8860B !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
    }
  }

  &.el-button--text {
    color: #654321 !important;
    border: none !important;
    background: transparent !important;

    &:hover {
      color: #D4AF37 !important;
      background: rgba(212, 175, 55, 0.1) !important;
    }
  }

  &.el-button--danger {
    background: rgba(139, 69, 19, 0.1) !important;
    border-color: #8B4513 !important;
    color: #8B4513 !important;

    &:hover {
      background: rgba(139, 69, 19, 0.2) !important;
      border-color: #654321 !important;
      color: #654321 !important;
    }
  }

  &.el-button--link {
    color: #D4AF37 !important;
    border: none !important;
    background: transparent !important;

    &:hover {
      color: #B8860B !important;
    }
  }

  &.is-round {
    border-radius: 24px !important;
  }
}

// 标签样式
:deep(.el-tag) {
  border-radius: 8px !important;
  font-weight: 600 !important;
  font-family: 'Georgia', 'Times New Roman', serif !important;
  border: 1px solid !important;

  &.el-tag--info {
    background: rgba(212, 175, 55, 0.15) !important;
    border-color: rgba(184, 134, 11, 0.4) !important;
    color: #654321 !important;
  }

  &.el-tag--success {
    background: rgba(139, 69, 19, 0.15) !important;
    border-color: rgba(139, 69, 19, 0.4) !important;
    color: #8B4513 !important;
  }
}

// 输入框样式
:deep(.el-input__wrapper) {
  border-radius: 8px !important;
  box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.3) inset !important;
  background-color: rgba(255, 255, 255, 0.7) !important;
  border: 1px solid rgba(212, 175, 55, 0.4) !important;
  transition: all 0.3s ease !important;

  &:hover {
    border-color: #D4AF37 !important;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5) inset !important;
  }

  &.is-focus {
    border-color: #B8860B !important;
    box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.6) inset !important;
  }
}

:deep(.el-input__inner) {
  color: #654321 !important;
  font-weight: 600 !important;
  font-family: 'Georgia', 'Times New Roman', serif !important;
}

// 文本域样式
:deep(.el-textarea__inner) {
  border-radius: 8px !important;
  box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.3) inset !important;
  background-color: rgba(255, 255, 255, 0.7) !important;
  border: 1px solid rgba(212, 175, 55, 0.4) !important;
  color: #654321 !important;
  font-weight: 600 !important;
  font-family: 'Georgia', 'Times New Roman', serif !important;
  transition: all 0.3s ease !important;

  &:hover {
    border-color: #D4AF37 !important;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5) inset !important;
  }

  &:focus {
    border-color: #B8860B !important;
    box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.6) inset !important;
  }
}

// 单选框样式
:deep(.el-radio) {
  .el-radio__label {
    color: #654321 !important;
    font-weight: 600 !important;
    font-family: 'Georgia', 'Times New Roman', serif !important;
  }

  .el-radio__input.is-checked .el-radio__inner {
    background-color: #D4AF37 !important;
    border-color: #B8860B !important;
  }
}

// 卡片样式
:deep(.el-card) {
  background: rgba(249, 247, 236, 0.85) !important;
  border: 3px solid rgba(184, 134, 11, 0.5) !important;
  border-radius: 16px !important;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1) !important;

  .el-card__body {
    color: #654321;
    font-family: 'Georgia', 'Times New Roman', serif;
  }
}
</style>

<style lang="scss">
// 全局对话框样式
.gothic-dialog {
  .el-dialog {
    background: rgba(249, 247, 236, 0.95) !important;
    backdrop-filter: blur(20px) !important;
    border: 3px solid rgba(184, 134, 11, 0.6) !important;
    border-radius: 16px !important;
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.25),
      0 0 0 2px rgba(212, 175, 55, 0.3) inset,
      inset 0 2px 6px rgba(255, 255, 255, 0.6),
      inset 0 -2px 6px rgba(0, 0, 0, 0.15) !important;

    &::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      background: linear-gradient(135deg, 
        rgba(212, 175, 55, 0.5) 0%, 
        transparent 25%, 
        transparent 75%, 
        rgba(212, 175, 55, 0.5) 100%);
      border-radius: 16px;
      z-index: -1;
      opacity: 0.7;
      pointer-events: none;
    }
  }

  .el-dialog__header {
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.2) 0%, 
      rgba(184, 134, 11, 0.15) 100%);
    border-bottom: 2px solid rgba(184, 134, 11, 0.4);
    padding: 20px 24px;
    border-radius: 16px 16px 0 0;

    .el-dialog__title {
      color: #654321 !important;
      font-size: 22px !important;
      font-weight: 900 !important;
      font-family: 'Georgia', 'Times New Roman', 'Goudy Old Style', serif !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1) !important;
      letter-spacing: 0.5px !important;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #654321 !important;
        font-size: 20px !important;
        font-weight: 700 !important;

        &:hover {
          color: #D4AF37 !important;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
    color: #654321;
    font-family: 'Georgia', 'Times New Roman', serif;
  }

  .el-dialog__footer {
    border-top: 2px solid rgba(184, 134, 11, 0.3);
    padding: 16px 24px;
    background: rgba(249, 247, 236, 0.5);
    border-radius: 0 0 16px 16px;
  }

  .el-form-item__label {
    color: #654321 !important;
    font-weight: 700 !important;
    font-family: 'Georgia', 'Times New Roman', serif !important;
  }
}
</style>

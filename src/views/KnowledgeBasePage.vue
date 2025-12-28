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
        </main>
      </div>
    </div>

    <div class="floating-qa">
      <el-button type="primary" round @click="qaDialogVisible = true">全库问答</el-button>
    </div>

    <el-dialog v-model="showCreate" title="新建知识库" width="420px">
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

    <el-dialog v-model="qaDialogVisible" title="全库问答" width="560px">
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

        <el-input
          v-model="qaQuestion"
          type="textarea"
          :rows="3"
          placeholder="请输入你的问题，基于当前用户的知识库回答"
        />
        <div class="qa-actions">
          <el-button @click="qaDialogVisible = false">关闭</el-button>
          <el-button type="primary" :loading="qaLoading" @click="handleQa">发送</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
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

<style scoped>
.kb-page {
  min-height: 100vh;
  background: #f6f1e5;
}

.kb-container {
  max-width: 1200px;
  margin: 24px auto 60px;
  padding: 0 20px;
}

.kb-layout {
  display: flex;
  gap: 16px;
}

.kb-sidebar {
  width: 340px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.kb-menu {
  border: none;
  --el-menu-item-height: 44px;
  padding-right: 8px;
}

.menu-title {
  margin-right: 10px;
  font-weight: 600;
}

.sidebar-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #888;
  line-height: 1.6;
}

.kb-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kb-subtitle {
  color: #888;
}

.kb-actions {
  display: flex;
  gap: 8px;
}

.kb-cards {
  display: flex;
  gap: 12px;
}

.current-kb-card {
  flex: 1;
}

.current-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.current-name {
  font-size: 16px;
  font-weight: 600;
}

.kb-desc {
  color: #666;
  margin: 4px 0;
}

.kb-meta {
  color: #999;
  font-size: 12px;
}

.kb-ops {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.kb-content {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}

.upload-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7f8fb;
  border: 1px dashed #dcdfe6;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.upload-drag {
  width: 320px;
}

.kb-table {
  margin-top: 8px;
}

.floating-qa {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 99;
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
  gap: 12px;
}

.qa-messages {
  max-height: 360px;
  overflow-y: auto;
  padding: 10px;
  background: #f7f8fb;
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

.qa-msg {
  display: flex;
  margin-bottom: 10px;
}

.qa-msg.user {
  justify-content: flex-end;
}

.qa-msg.assistant {
  justify-content: flex-start;
}

.qa-msg-bubble {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  background: #fff;
}

.qa-msg.user .qa-msg-bubble {
  background: #e7f5ff;
  border: 1px solid #c9e7fd;
}

.qa-msg-role {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.qa-msg-text {
  line-height: 1.6;
  white-space: pre-wrap;
  color: #333;
}

.qa-refs {
  margin-top: 8px;
  font-size: 12px;
  color: #555;
}

.qa-refs-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.qa-refs ul {
  padding-left: 16px;
  margin: 0;
}

.qa-empty {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.qa-hint {
  margin-top: 6px;
  color: #888;
  font-size: 12px;
}
</style>

<template>
  <div class="post-detail-page">
    <AppHeader />
    <div class="container">
      <el-button @click="router.back()" class="back-btn" link>
        <el-icon><ArrowLeft /></el-icon> 返回列表
      </el-button>

      <div v-loading="loading" class="content-wrapper">
        <el-card v-if="post" class="main-post" shadow="never">
          <template #header>
            <div class="post-header">
              <div class="post-title-row">
                <h1>{{ post.title }}</h1>
                <el-tag size="small" effect="dark">{{ post.boardName }}</el-tag>
              </div>
              <div class="post-meta">
                <div class="author-info">
                  <el-avatar :size="40" :src="post.authorAvatar || defaultAvatar" />
                  <div class="meta-text">
                    <span class="author-name">{{ post.authorName }}</span>
                    <span class="time">发布于 {{ formatDate(post.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ replies.length }}</span>
                </div>
              </div>
            </div>
          </template>
          
          <div class="post-body markdown-body" v-html="renderedContent"></div>
          
          <div class="post-actions">
            <el-button type="primary" plain round :icon="Star">收藏</el-button>
            <el-button type="success" plain round :icon="Share">分享</el-button>
          </div>
        </el-card>

        <div class="replies-section">
          <div class="section-header">
            <h3>全部回复 ({{ replies.length }})</h3>
            <el-radio-group v-model="sortOrder" size="small">
              <el-radio-button label="latest">最新</el-radio-button>
              <el-radio-button label="hottest">最热</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="reply-list">
            <el-empty v-if="replies.length === 0" description="暂无回复，快来抢沙发吧" />
            <div v-for="(reply, index) in replies" :key="reply.id" class="reply-item">
              <div class="reply-avatar">
                <el-avatar :size="36" :src="reply.authorAvatar || defaultAvatar" />
              </div>
              <div class="reply-main">
                <div class="reply-info">
                  <span class="name">{{ reply.authorName }}</span>
                  <span class="floor">#{{ index + 1 }}</span>
                </div>
                <div class="reply-content" v-html="renderMarkdown(reply.content)"></div>
                <div class="reply-footer">
                  <span class="time">{{ formatDate(reply.createdAt) }}</span>
                  <div class="actions">
                    <el-button link size="small" :icon="ChatLineRound">回复</el-button>
                    <el-button link size="small" :icon="Pointer">点赞</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="reply-editor-card">
            <div class="editor-header">
              <h4>发表回复</h4>
            </div>
            <div class="editor-toolbar">
              <el-button-group size="small">
                <el-button :icon="EditPen" title="Bold" @click="insertMarkdown('**')">B</el-button>
                <el-button title="Italic" @click="insertMarkdown('*')">I</el-button>
                <el-button title="Code" @click="insertMarkdown('`')">&lt;/&gt;</el-button>
                <el-button title="Link" @click="insertMarkdown('[]()')">Link</el-button>
              </el-button-group>
              <el-popover placement="top" :width="300" trigger="click">
                <template #reference>
                  <el-button size="small">😀</el-button>
                </template>
                <EmojiPicker @select="onSelectEmoji" />
              </el-popover>
            </div>
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="6"
              placeholder="写下你的真知灼见..."
              resize="none"
              class="reply-textarea"
            />
            <div class="editor-footer">
              <el-button type="primary" @click="handleReply" :loading="submitting" round>
                发表回复
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { ArrowLeft, View, ChatDotRound, Star, Share, ChatLineRound, Pointer, EditPen } from '@element-plus/icons-vue'
import { getPostDetail, replyPost } from '../api/social'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css' // Or any other style
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const post = ref<any>(null)
const replies = ref<any[]>([])
const replyContent = ref('')
const sortOrder = ref('latest')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// Configure marked with highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-'
})

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return marked(post.value.content)
})

const renderMarkdown = (content: string) => {
  return marked(content || '')
}

const fetchPostDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  
  loading.value = true
  try {
    const res = await getPostDetail(id)
    const data = (res as any).data || res
    post.value = data
    replies.value = data.replies || [] 
  } catch (error) {
    console.error(error)
    ElMessage.error('获取帖子详情失败')
  } finally {
    loading.value = false
  }
}

const handleReply = async () => {
  if (!replyContent.value.trim()) return
  
  submitting.value = true
  try {
    await replyPost(post.value.id, replyContent.value)
    ElMessage.success('回复成功')
    replyContent.value = ''
    fetchPostDetail() // Refresh
  } catch (error) {
    console.error(error)
    ElMessage.error('回复失败')
  } finally {
    submitting.value = false
  }
}

const insertMarkdown = (syntax: string) => {
  replyContent.value += syntax
}

const onSelectEmoji = (emoji: any) => {
  replyContent.value += emoji.i
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

onMounted(() => {
  fetchPostDetail()
})
</script>

<style scoped lang="scss">
.post-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40px;
}

.container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.back-btn {
  margin-bottom: 20px;
  font-size: 16px;
}

.main-post {
  margin-bottom: 20px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);

  .post-header {
    .post-title-row {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      
      h1 {
        margin: 0;
        font-size: 24px;
        color: #303133;
        line-height: 1.4;
      }
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      
      .author-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .meta-text {
          display: flex;
          flex-direction: column;
          
          .author-name {
            font-weight: 600;
            color: #303133;
          }
          
          .time {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .post-stats {
        display: flex;
        gap: 20px;
        color: #909399;
        font-size: 14px;
        
        span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }
    }
  }

  .post-body {
    padding: 20px 0;
    line-height: 1.8;
    color: #303133;
    font-size: 16px;
    min-height: 150px;
  }

  .post-actions {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
}

.replies-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;

    h3 { margin: 0; font-size: 18px; }
  }

  .reply-item {
    display: flex;
    gap: 20px;
    padding: 20px 0;
    border-bottom: 1px solid #f5f7fa;

    &:last-child {
      border-bottom: none;
    }

    .reply-main {
      flex: 1;

      .reply-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        
        .name {
          font-weight: 600;
          color: #303133;
        }
        
        .floor {
          color: #909399;
          font-size: 12px;
        }
      }

      .reply-content {
        color: #606266;
        line-height: 1.6;
        margin-bottom: 10px;
      }

      .reply-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #909399;

        .actions {
          display: flex;
          gap: 10px;
        }
      }
    }
  }

  .reply-editor-card {
    margin-top: 40px;
    background: #f9fafc;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #ebeef5;

    .editor-header {
      margin-bottom: 15px;
      h4 { margin: 0; }
    }

    .editor-toolbar {
      margin-bottom: 10px;
      display: flex;
      gap: 10px;
    }

    .reply-textarea {
      :deep(.el-textarea__inner) {
        border: 1px solid #e4e7ed;
        &:focus { border-color: #409eff; }
      }
    }

    .editor-footer {
      margin-top: 15px;
      text-align: right;
    }
  }
}

/* Markdown Styles */
.markdown-body {
  :deep(h1), :deep(h2), :deep(h3) { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
  :deep(p) { margin-bottom: 16px; }
  :deep(code) { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(27,31,35,0.05); border-radius: 3px; }
  :deep(pre) { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 3px; }
  :deep(pre code) { display: inline; max-width: auto; padding: 0; margin: 0; overflow: visible; line-height: inherit; word-wrap: normal; background-color: initial; border: 0; }
  :deep(blockquote) { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; }
}
</style>

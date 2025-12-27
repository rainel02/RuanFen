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
                  <el-tag size="small" effect="dark">{{ translateBoardName(post.boardId || post.boardName) }}</el-tag>
              </div>
              <div class="post-meta">
                <div class="author-info">
                  <el-avatar :size="40" :src="getAuthorAvatar(post.author)" />
                  <div class="meta-text">
                    <span class="author-name">{{ getAuthorName(post.author) }}</span>
                    <span class="time">发布于 {{ formatDate(post.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ replies.length }}</span>
                  <span><el-icon><Pointer /></el-icon> {{ likeCount }}</span>
                </div>
              </div>
            </div>
          </template>
          
          <div class="post-body markdown-body" v-html="renderedContent"></div>
          
          <div class="post-actions">
            <el-button 
              :type="isLiked ? 'danger' : 'info'" 
              :plain="!isLiked" 
              round 
              :icon="Pointer" 
              @click="toggleLike"
            >
              {{ isLiked ? '已点赞' : '点赞' }} {{ likeCount }}
            </el-button>
            <el-button 
              :type="isFavorited ? 'warning' : 'info'" 
              :plain="!isFavorited" 
              round 
              :icon="isFavorited ? StarFilled : Star" 
              @click="toggleFavorite"
            >
              {{ isFavorited ? '已收藏' : '收藏' }} {{ favoriteCount }}
            </el-button>
            <el-button 
              type="success" 
              plain 
              round 
              :icon="Share" 
              @click="handleShare"
            >
              分享 {{ shareCount }}
            </el-button>
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
                <el-avatar :size="36" :src="getAuthorAvatar(reply.author)" />
              </div>
              <div class="reply-main">
                <div class="reply-info">
                  <span class="name">{{ getAuthorName(reply.author) }}</span>
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
import { ArrowLeft, View, ChatDotRound, Star, StarFilled, Share, ChatLineRound, Pointer, EditPen, Trophy } from '@element-plus/icons-vue'
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

// Mock Social States
const isLiked = ref(false)
const likeCount = ref(0)
const isFavorited = ref(false)
const favoriteCount = ref(0)
const shareCount = ref(0)

const retroColors = ['D4AF37', '8B4513', 'A0522D', 'CD853F', '556B2F', 'B8860B', '800000', '5D4037'];
const getRetroAvatar = (name: string) => {
  if (!name) return defaultAvatar;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = retroColors[hash % retroColors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128&bold=true&font-size=0.5`;
}

const getAuthorAvatar = (author: any) => {
  if (!author) return defaultAvatar
  if (author.avatarUrl) return author.avatarUrl
  if (author.avatar) return author.avatar
  const name = author.username || author.name || 'User'
  return getRetroAvatar(name)
}

const getAuthorName = (author: any) => {
  if (!author) return 'Unknown'
  return author.username || author.name || 'User'
}

// Board name translation (reuse same mapping as ForumPage for consistency)
const boardNameMap: Record<string, string> = {
  Medicine: '医学',
  Biology: '生物学',
  Chemistry: '化学',
  'Computer science': '计算机科学',
  Business: '商业',
  Sociology: '社会学',
  'Political science': '政治学',
  Geology: '地质学',
  Philosophy: '哲学',
  History: '历史',
  'Materials science': '材料科学',
  Psychology: '心理学',
  Physics: '物理学',
  'Environmental science': '环境科学',
  Mathematics: '数学',
  Engineering: '工程学',
  Geography: '地理学',
  Economics: '经济学',
  Art: '艺术'
}

const translateBoardName = (idOrName: string) => {
  if (!idOrName) return '综合'
  return boardNameMap[idOrName] || idOrName
}

// Configure marked with highlight.js
marked.setOptions({
  highlight: function(code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-'
} as any)

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
    // API returns { post: {...}, replies: [...] }
    const data = (res as any).data || res
    post.value = data.post || data
    replies.value = data.replies || [] 
    
    // Initialize mock data
    likeCount.value = Math.floor(Math.random() * 100)
    favoriteCount.value = Math.floor(Math.random() * 50)
    shareCount.value = Math.floor(Math.random() * 20)
    isLiked.value = false
    isFavorited.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('获取帖子详情失败')
  } finally {
    loading.value = false
  }
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  if (isLiked.value) {
    likeCount.value++
    ElMessage.success('点赞成功')
  } else {
    likeCount.value--
  }
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  if (isFavorited.value) {
    favoriteCount.value++
    ElMessage.success('收藏成功')
  } else {
    favoriteCount.value--
  }
}

const handleShare = () => {
  shareCount.value++
  ElMessage.success('分享链接已复制到剪贴板')
  // Mock copy to clipboard
  navigator.clipboard.writeText(window.location.href)
}

const handleReply = async () => {
  if (!replyContent.value.trim()) return
  
  submitting.value = true
  try {
    await replyPost(post.value.postId, replyContent.value)
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
  background: linear-gradient(180deg, #fbf6ec 0%, #f7efe2 100%); /* parchment base */
  padding-bottom: 48px;
  font-family: "Noto Serif", Georgia, "Times New Roman", serif;
  color: #2e2a25;
}

.container {
  max-width: 980px;
  margin: 28px auto;
  padding: 0 20px;
}

.back-btn {
  margin-bottom: 18px;
  font-size: 15px;
  color: #5d4037;
  --el-button-bg-color: transparent;
}

.main-post {
  margin-bottom: 22px;
  border-radius: 14px;
  border: 1px solid rgba(90,55,21,0.06);
  background: linear-gradient(180deg, rgba(255,255,250,0.9), rgba(249,244,236,0.95));
  box-shadow: 0 12px 40px rgba(86,58,33,0.06);
  padding: 22px 26px;

  .post-header {
    .post-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;

      h1 {
        margin: 0;
        font-size: 26px;
        color: #2e2a25;
        line-height: 1.25;
        font-weight: 700;
      }

      .el-tag {
        background: rgba(212,175,55,0.08);
        color: #7a5a2a;
        border: 1px solid rgba(212,175,55,0.12);
        font-weight: 700;
      }
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding-bottom: 6px;

      .author-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .meta-text {
          display: flex;
          flex-direction: column;

          .author-name {
            font-weight: 700;
            color: #3c2c1f;
            font-size: 14px;
          }

          .time {
            font-size: 12px;
            color: #7a6f63;
          }
        }
      }

      .post-stats {
        display: flex;
        gap: 16px;
        color: #7a6f63;
        font-size: 13px;
      }
    }
  }

  .post-body {
    padding: 18px 2px 6px 2px;
    line-height: 1.9;
    color: #3c2c1f;
    font-size: 16px;
    min-height: 150px;
  }

  .post-actions {
    margin-top: 22px;
    display: flex;
    justify-content: center;
    gap: 14px;
    padding-top: 18px;
    border-top: 1px dashed rgba(90,55,21,0.04);
  }
}

.replies-section {
  background: linear-gradient(180deg, rgba(255,255,250,0.95), rgba(249,244,236,0.98));
  padding: 22px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(86,58,33,0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px dashed rgba(90,55,21,0.06);

    h3 { margin: 0; font-size: 18px; color: #3c2c1f }
  }

  .reply-item {
    display: flex;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px dashed rgba(90,55,21,0.04);

    &:last-child { border-bottom: none }

    .reply-avatar {
      flex: 0 0 48px;
      align-self: flex-start;
      :deep(.el-avatar) {
        border: 2px solid rgba(212,175,55,0.12);
        box-shadow: 0 4px 12px rgba(86,58,33,0.06);
      }
    }

    .reply-main {
      flex: 1;

      .reply-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .name { font-weight: 700; color: #3c2c1f }
        .floor { color: #7a6f63; font-size: 12px }
      }

      .reply-content { color: #4b3a2a; line-height: 1.7; margin-bottom: 10px }

      .reply-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #7a6f63;

        .actions { display: flex; gap: 8px }
      }
    }
  }

  .reply-editor-card {
    margin-top: 28px;
    background: rgba(255,255,250,0.96);
    padding: 18px;
    border-radius: 10px;
    border: 1px solid rgba(90,55,21,0.04);

    .editor-header { margin-bottom: 10px; h4 { margin: 0; color: #3c2c1f } }

    .editor-toolbar { margin-bottom: 12px; display:flex; gap:8px }

    .reply-textarea :deep(.el-textarea__inner) {
      border: 1px solid rgba(90,55,21,0.06);
      padding: 12px;
      border-radius: 8px;
      font-family: "Noto Serif", Georgia, serif;
      font-size: 14px;
      color: #3c2c1f;
      background: rgba(255,255,255,0.96);
    }

    .editor-footer { margin-top: 12px; text-align: right }
    .editor-footer :deep(.el-button) { border-radius: 8px }
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

/* Responsive adjustments for detail page */
@media (max-width: 768px) {
  .container { padding: 0 12px }
  .main-post { padding: 16px }
  .post-body { font-size: 15px }
  .reply-avatar { flex: 0 0 40px }
  .reply-textarea :deep(.el-textarea__inner) { font-size: 14px }
}
</style>

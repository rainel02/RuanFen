<template>
  <div class="forum-page">
    <AppHeader />
    <div class="forum-layout">
      <!-- Sidebar -->
      <div class="sidebar glass-panel">
        <div class="sidebar-header">
          <h3><el-icon><Compass /></el-icon> 探索板块</h3>
        </div>
        <div class="board-list">
          <div 
            class="board-item" 
            :class="{ active: activeBoard === '' }"
            @click="handleBoardSelect('')"
          >
            <el-icon><Menu /></el-icon>
            <span>全部动态</span>
          </div>
          <div 
            v-for="board in boards" 
            :key="board.id" 
            class="board-item"
            :class="{ active: activeBoard === board.id }"
            @click="handleBoardSelect(board.id)"
          >
            <el-icon><component :is="board.icon" /></el-icon>
            <span>{{ board.name }}</span>
            <span class="badge" v-if="board.count">{{ board.count }}</span>
          </div>
        </div>
        
        <div class="create-btn-wrapper">
          <el-button type="primary" class="create-btn" round @click="showCreateDialog = true">
            <el-icon><Edit /></el-icon> 发起讨论
          </el-button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="content-header glass-panel">
          <div class="header-left">
            <h2>{{ currentBoardName }}</h2>
            <span class="subtitle">共找到 {{ posts.length }} 篇相关帖子</span>
          </div>
          <div class="header-right">
            <el-input
              v-model="searchQuery"
              placeholder="搜索感兴趣的话题..."
              :prefix-icon="Search"
              class="search-input"
              clearable
            />
          </div>
        </div>

        <div v-loading="loading" class="post-list">
          <el-empty v-if="posts.length === 0 && !loading" description="这里静悄悄的，来发第一篇帖子吧~" />
          
          <transition-group name="list">
            <div
              v-for="post in posts"
              :key="post.id"
              class="post-card glass-panel"
              @click="goToPost(post.id)"
            >
              <div class="card-body">
                <div class="post-main">
                  <div class="post-header">
                    <el-tag size="small" effect="light" class="board-tag">{{ post.boardName }}</el-tag>
                    <h3 class="post-title">{{ post.title }}</h3>
                  </div>
                  <p class="post-summary">{{ getSummary(post.content) }}</p>
                </div>
                <div class="post-meta">
                  <div class="author">
                    <el-avatar :size="24" :src="post.authorAvatar || defaultAvatar" />
                    <span class="name">{{ post.authorName }}</span>
                    <span class="dot">·</span>
                    <span class="time">{{ formatDate(post.createdAt) }}</span>
                  </div>
                  <div class="stats">
                    <span class="stat-item"><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                    <span class="stat-item"><el-icon><ChatDotRound /></el-icon> {{ post.replyCount || 0 }}</span>
                    <span class="stat-item"><el-icon><Star /></el-icon> {{ post.likeCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- Create Post Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      title="发起新讨论"
      width="600px"
      destroy-on-close
      class="create-dialog"
    >
      <el-form :model="newPost" label-position="top">
        <el-form-item label="标题">
          <el-input v-model="newPost.title" placeholder="请输入引人注目的标题" size="large" />
        </el-form-item>
        <el-form-item label="选择板块">
          <el-select v-model="newPost.boardId" placeholder="选择合适的板块" style="width: 100%">
            <el-option
              v-for="board in boards"
              :key="board.id"
              :label="board.name"
              :value="board.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <div class="editor-toolbar">
             <el-button-group size="small">
                <el-button :icon="EditPen" title="Bold" @click="insertMarkdown('**')">B</el-button>
                <el-button title="Italic" @click="insertMarkdown('*')">I</el-button>
                <el-button title="Code" @click="insertMarkdown('`')">&lt;/&gt;</el-button>
             </el-button-group>
             <el-popover placement="bottom-start" :width="300" trigger="click">
                <template #reference>
                  <el-button size="small" circle>😀</el-button>
                </template>
                <EmojiPicker @select="onSelectEmoji" />
              </el-popover>
          </div>
          <el-input
            v-model="newPost.content"
            type="textarea"
            :rows="8"
            placeholder="支持 Markdown 格式，分享你的观点..."
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreatePost" :loading="submitting">
            发布
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import { 
  Menu, Edit, Search, ChatDotRound, View, Star, 
  Compass, EditPen
} from '@element-plus/icons-vue'
import { getPosts, createPost } from '../api/social'
import { ElMessage } from 'element-plus'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const activeBoard = ref('')
const searchQuery = ref('')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const boards = ref([
  { id: 'academic', name: '学术交流', icon: 'DataAnalysis', count: 12 },
  { id: 'tech', name: '技术分享', icon: 'Monitor', count: 8 },
  { id: 'life', name: '校园生活', icon: 'Compass', count: 5 },
  { id: 'career', name: '求职招聘', icon: 'Share', count: 3 },
])

const allPosts = ref<any[]>([])

const posts = computed(() => {
  let result = allPosts.value
  if (activeBoard.value) {
    result = result.filter(p => p.boardId === activeBoard.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q))
  }
  return result
})

const currentBoardName = computed(() => {
  const board = boards.value.find(b => b.id === activeBoard.value)
  return board ? board.name : '全部动态'
})

const newPost = ref({
  title: '',
  content: '',
  boardId: ''
})

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await getPosts()
    // API returns { posts: [...] }
    allPosts.value = (res as any).posts || (res as any).data || res
  } catch (error) {
    console.error(error)
    ElMessage.error('获取帖子列表失败')
  } finally {
    loading.value = false
  }
}

const handleBoardSelect = (id: string) => {
  activeBoard.value = id
}

const handleCreatePost = async () => {
  if (!newPost.value.title || !newPost.value.content || !newPost.value.boardId) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  submitting.value = true
  try {
    await createPost(newPost.value)
    ElMessage.success('发布成功')
    showCreateDialog.value = false
    newPost.value = { title: '', content: '', boardId: '' }
    fetchPosts()
  } catch (error) {
    console.error(error)
    ElMessage.error('发布失败')
  } finally {
    submitting.value = false
  }
}

const goToPost = (id: string) => {
  router.push(`/forum/${id}`)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getSummary = (content: string) => {
  if (!content) return ''
  return content.replace(/[#*`]/g, '').substring(0, 120) + (content.length > 120 ? '...' : '')
}

const insertMarkdown = (syntax: string) => {
  newPost.value.content += syntax
}

const onSelectEmoji = (emoji: any) => {
  newPost.value.content += emoji.i
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped lang="scss">
.forum-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: radial-gradient(#e0e4e8 1px, transparent 1px);
  background-size: 20px 20px;
}

.forum-layout {
  max-width: 1200px;
  margin: 20px auto;
  display: flex;
  gap: 20px;
  padding: 0 20px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.sidebar {
  width: 260px;
  height: fit-content;
  padding: 20px;
  position: sticky;
  top: 20px;

  .sidebar-header {
    margin-bottom: 20px;
    h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      color: #303133;
    }
  }

  .board-list {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .board-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 15px;
      border-radius: 8px;
      cursor: pointer;
      color: #606266;
      transition: all 0.3s ease;

      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }

      &.active {
        background-color: #409eff;
        color: white;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }

      .badge {
        margin-left: auto;
        background: rgba(0,0,0,0.1);
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 12px;
      }
    }
  }

  .create-btn-wrapper {
    margin-top: 30px;
    .create-btn {
      width: 100%;
      height: 40px;
      font-size: 16px;
      background: linear-gradient(45deg, #409eff, #36d1dc);
      border: none;
      
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .content-header {
    padding: 20px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      h2 { margin: 0 0 5px 0; font-size: 22px; color: #303133; }
      .subtitle { font-size: 13px; color: #909399; }
    }

    .search-input {
      width: 250px;
      :deep(.el-input__wrapper) {
        border-radius: 20px;
        box-shadow: 0 0 0 1px #dcdfe6 inset;
      }
    }
  }

  .post-list {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .post-card {
      padding: 20px 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        border-left-color: #409eff;
      }

      .post-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;

        .post-title {
          margin: 0;
          font-size: 18px;
          color: #303133;
          font-weight: 600;
        }
      }

      .post-summary {
        color: #606266;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 15px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .post-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #909399;

        .author {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .name { color: #606266; font-weight: 500; }
          .dot { margin: 0 2px; }
        }

        .stats {
          display: flex;
          gap: 15px;
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}

.editor-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

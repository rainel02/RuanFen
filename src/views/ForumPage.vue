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
              :key="post.postId"
              class="post-card glass-panel"
              @click="goToPost(post.postId)"
            >
              <div class="card-body">
                <div class="post-main">
                  <div class="post-header">
                    <el-tag size="small" effect="light" class="board-tag">{{ post.boardName }}</el-tag>
                    <h3 class="post-title">{{ post.title }}</h3>
                  </div>
                  <p class="post-summary">{{ getSummary(post.contentPreview || post.content) }}</p>
                </div>
                <div class="post-meta">
                  <div class="author">
                    <el-avatar :size="24" :src="post.author?.avatar || defaultAvatar" />
                    <span class="name">{{ post.author?.username || post.authorName }}</span>
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
  { id: 'Medicine', name: 'Medicine', icon: 'FirstAidKit', count: 0 },
  { id: 'Biology', name: 'Biology', icon: 'Microphone', count: 0 },
  { id: 'Chemistry', name: 'Chemistry', icon: 'Pouring', count: 0 },
  { id: 'Computer science', name: 'Computer science', icon: 'Monitor', count: 0 },
  { id: 'Business', name: 'Business', icon: 'Suitcase', count: 0 },
  { id: 'Sociology', name: 'Sociology', icon: 'User', count: 0 },
  { id: 'Political science', name: 'Political science', icon: 'Flag', count: 0 },
  { id: 'Geology', name: 'Geology', icon: 'Location', count: 0 },
  { id: 'Philosophy', name: 'Philosophy', icon: 'Reading', count: 0 },
  { id: 'History', name: 'History', icon: 'Timer', count: 0 },
  { id: 'Materials science', name: 'Materials science', icon: 'Box', count: 0 },
  { id: 'Psychology', name: 'Psychology', icon: 'Headset', count: 0 },
  { id: 'Physics', name: 'Physics', icon: 'Lightning', count: 0 },
  { id: 'Environmental science', name: 'Environmental science', icon: 'Sunny', count: 0 },
  { id: 'Mathematics', name: 'Mathematics', icon: 'TrendCharts', count: 0 },
  { id: 'Engineering', name: 'Engineering', icon: 'Setting', count: 0 },
  { id: 'Geography', name: 'Geography', icon: 'MapLocation', count: 0 },
  { id: 'Economics', name: 'Economics', icon: 'Money', count: 0 },
  { id: 'Art', name: 'Art', icon: 'Brush', count: 0 },
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
    const res = await getPosts(activeBoard.value || undefined)
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
  fetchPosts()
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
  router.push(`/forum/post/${id}`)
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
@import '@/styles/retro-theme.scss';

.forum-page {
  @extend .retro-page-bg;
}

.forum-layout {
  max-width: 1200px;
  margin: 20px auto;
  display: flex;
  gap: 20px;
  padding: 0 20px;
  position: relative;
  z-index: 1;
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
      @extend .text-retro-dark;
      @extend .font-serif;
      
      .el-icon {
        @extend .text-retro-gold;
      }
    }
  }

  .board-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .board-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 15px;
      border-radius: 8px;
      cursor: pointer;
      @extend .text-retro-brown;
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        background-color: rgba(212, 175, 55, 0.1);
        color: #654321;
        border-color: rgba(212, 175, 55, 0.3);
      }

      &.active {
        background-color: rgba(212, 175, 55, 0.2);
        color: #654321;
        border-color: #D4AF37;
        box-shadow: 0 2px 8px rgba(184, 134, 11, 0.2);
        font-weight: 600;
      }

      .badge {
        margin-left: auto;
        background: rgba(184, 134, 11, 0.15);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        color: #8B4513;
      }
    }
  }

  .create-btn-wrapper {
    margin-top: 30px;
    .create-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
      @extend .font-serif;
      font-weight: 600;
      
      &:hover {
        opacity: 0.95;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(184, 134, 11, 0.4);
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
      h2 { 
        margin: 0 0 5px 0; 
        font-size: 24px; 
        @extend .text-retro-dark;
        @extend .font-serif;
      }
      .subtitle { 
        font-size: 14px; 
        @extend .text-retro-brown;
        font-style: italic;
      }
    }

    .search-input {
      width: 250px;
      @extend .retro-input;
    }
  }

  .post-list {
    display: flex;
    flex-direction: column;
    gap: 15px;

    :deep(.el-empty) {
      padding: 60px 0;
      .el-empty__description p {
        color: #8B4513;
        font-family: 'Georgia', serif;
        font-size: 16px;
        font-style: italic;
      }
      .el-empty__image svg {
        filter: sepia(1) hue-rotate(10deg) saturate(1.5);
        opacity: 0.8;
      }
    }

    .post-card {
      padding: 20px 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(184, 134, 11, 0.15);
        border-left-color: #D4AF37;
      }

      .post-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;

        .board-tag {
          background-color: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.3);
          color: #8B4513;
        }

        .post-title {
          margin: 0;
          font-size: 20px;
          @extend .text-retro-dark;
          @extend .font-serif;
          font-weight: 600;
        }
      }

      .post-summary {
        color: #5d4037;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 15px;
        font-family: 'Georgia', serif;
      }

      .post-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #8d6e63;

        .author {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .name { color: #654321; font-weight: 600; }
          .dot { margin: 0 2px; color: #D4AF37; }
        }

        .stats {
          display: flex;
          gap: 15px;
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            .el-icon { color: #D4AF37; }
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

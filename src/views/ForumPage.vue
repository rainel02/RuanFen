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
            <span>{{ translateBoardName(board.id) }}</span>
            <span class="badge" v-if="board.count">{{ board.count }}</span>
          </div>
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
            <el-button type="primary" class="cta-btn" round @click="showCreateDialog = true">
              <el-icon><Edit /></el-icon> 发起讨论
            </el-button>
            <el-input
              v-model="searchQuery"
              placeholder="搜索感兴趣的话题..."
              :prefix-icon="Search"
              class="search-input"
              clearable
            />
          </div>
        </div>

        <div v-loading="loading" class="post-list" :class="{ 'has-bg': posts.length === 0 }">
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
                    <el-tag size="small" effect="light" class="board-tag">{{ resolveBoardName(post.boardId, post.boardName) }}</el-tag>
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
      width="720px"
      destroy-on-close
      class="create-dialog"
      align-center
    >
      <el-form :model="newPost" label-position="top" class="retro-form">
        <el-form-item label="标题">
          <el-input
            v-model="newPost.title"
            placeholder="请输入引人注目的标题"
            class="retro-input-title"
          />
        </el-form-item>
        <el-form-item label="选择板块">
          <el-select
            v-model="newPost.boardId"
            placeholder="选择合适的板块"
            style="width: 100%"
            popper-class="retro-dropdown"
            class="retro-select"
          >
            <el-option
              v-for="board in boards"
              :key="board.id"
              :label="board.name"
              :value="board.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <div class="editor-container">
            <div class="editor-toolbar">
              <div class="tools-group">
                <el-button text @click="insertMarkdown('**')"><b>B</b></el-button>
                <el-button text @click="insertMarkdown('*')"><i>I</i></el-button>
                <el-button text @click="insertMarkdown('`')">&lt;/&gt;</el-button>
              </div>
              <el-popover placement="bottom-end" :width="300" trigger="click" popper-class="emoji-popper">
                  <template #reference>
                    <el-button text class="emoji-btn">😀</el-button>
                  </template>
                  <EmojiPicker @select="onSelectEmoji" />
                </el-popover>
            </div>
            <el-input
              v-model="newPost.content"
              type="textarea"
              :rows="8"
              placeholder="在此分享您的真知灼见..."
              resize="none"
              class="retro-textarea"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" class="submit-btn" @click="handleCreatePost" :loading="submitting">
            发布
          </el-button>
        </div>
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
  Compass
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
  if (!idOrName) return '全部动态'
  return boardNameMap[idOrName] || idOrName
}

const boards = ref([
  { id: 'Medicine', name: boardNameMap.Medicine, icon: 'FirstAidKit', count: 0 },
  { id: 'Biology', name: boardNameMap.Biology, icon: 'Microphone', count: 0 },
  { id: 'Chemistry', name: boardNameMap.Chemistry, icon: 'Pouring', count: 0 },
  { id: 'Computer science', name: boardNameMap['Computer science'], icon: 'Monitor', count: 0 },
  { id: 'Business', name: boardNameMap.Business, icon: 'Suitcase', count: 0 },
  { id: 'Sociology', name: boardNameMap.Sociology, icon: 'User', count: 0 },
  { id: 'Political science', name: boardNameMap['Political science'], icon: 'Flag', count: 0 },
  { id: 'Geology', name: boardNameMap.Geology, icon: 'Location', count: 0 },
  { id: 'Philosophy', name: boardNameMap.Philosophy, icon: 'Reading', count: 0 },
  { id: 'History', name: boardNameMap.History, icon: 'Timer', count: 0 },
  { id: 'Materials science', name: boardNameMap['Materials science'], icon: 'Box', count: 0 },
  { id: 'Psychology', name: boardNameMap.Psychology, icon: 'Headset', count: 0 },
  { id: 'Physics', name: boardNameMap.Physics, icon: 'Lightning', count: 0 },
  { id: 'Environmental science', name: boardNameMap['Environmental science'], icon: 'Sunny', count: 0 },
  { id: 'Mathematics', name: boardNameMap.Mathematics, icon: 'TrendCharts', count: 0 },
  { id: 'Engineering', name: boardNameMap.Engineering, icon: 'Setting', count: 0 },
  { id: 'Geography', name: boardNameMap.Geography, icon: 'MapLocation', count: 0 },
  { id: 'Economics', name: boardNameMap.Economics, icon: 'Money', count: 0 },
  { id: 'Art', name: boardNameMap.Art, icon: 'Brush', count: 0 },
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
  return board ? translateBoardName(board.id) : '全部动态'
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

const resolveBoardName = (id?: string, name?: string) => {
  return translateBoardName(id || name || '')
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
  min-height: 100vh;
}

.forum-layout {
  max-width: 1280px;
  margin: 40px auto;
  display: flex;
  gap: 32px;
  padding: 0 32px;
  position: relative;
  z-index: 1;
}

.sidebar {
  width: 260px;
  height: fit-content;
  padding: 20px;
  position: sticky;
  top: 20px;

  :deep(.glass-panel) {
    background: rgba(255, 255, 255, 0.7);
  }

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
      border-radius: 10px;
      cursor: pointer;
      @extend .text-retro-brown;
      transition: all 0.28s ease;
      border: 1px solid transparent;
      background: rgba(255, 255, 255, 0.7);

      &:hover {
        background-color: rgba(201, 154, 75, 0.12);
        color: #4a3b2a;
        border-color: rgba(201, 154, 75, 0.35);
      }

      &.active {
        background-color: rgba(201, 154, 75, 0.2);
        color: #3c2c1f;
        border-color: #c99a4b;
        box-shadow: 0 4px 14px rgba(86, 58, 33, 0.14);
        font-weight: 600;
      }

      .badge {
        margin-left: auto;
        background: rgba(86, 58, 33, 0.12);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        color: #6b4b2a;
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
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(76, 57, 32, 0.08);
    box-shadow: 0 10px 28px rgba(60, 44, 31, 0.08);

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
      width: 280px;
      @extend .retro-input;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .cta-btn {
        background: linear-gradient(120deg, #c99a4b, #d9b16d);
        border: none;
        height: 42px;
        padding: 0 18px;
        box-shadow: 0 8px 20px rgba(86, 58, 33, 0.2);
        @extend .font-serif;
        font-weight: 650;
        letter-spacing: 0.3px;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(86, 58, 33, 0.26);
        }
      }
    }
  }

  .post-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    transition: all 0.3s ease;

    &.has-bg {
      background-color: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      border: 1px solid rgba(76, 57, 32, 0.05);
    }

    :deep(.el-empty) {
      padding: 80px 0;
      .el-empty__description p {
        color: #5d4037;
        font-family: 'Georgia', serif;
        font-size: 18px;
        font-weight: 600;
        font-style: italic;
        letter-spacing: 0.5px;
        margin-top: 16px;
      }
      .el-empty__image svg {
        filter: sepia(1) hue-rotate(5deg) saturate(1.2) drop-shadow(0 4px 8px rgba(93, 64, 55, 0.15));
        opacity: 1;
        width: 140px;
        height: 140px;
      }
    }

    .post-card {
      padding: 24px 32px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
      background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(246,240,232,0.92));
      border: 1px solid rgba(76, 57, 32, 0.08);
      border-radius: 14px;

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

.create-dialog {
  --el-color-primary: #c99a4b; /* Override primary color for this scope */
  --el-color-primary-light-3: #d9b16d;
  --el-color-primary-light-9: #fdfbf7;
  --el-border-color-hover: #c99a4b;

  :deep(.el-dialog) {
    background-color: #fdfbf7;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(60, 44, 31, 0.25);
    border: 1px solid rgba(184, 134, 11, 0.15);
    padding: 0;

    .el-dialog__header {
      padding: 24px 32px 0;
      margin-right: 0;
      .el-dialog__title {
        font-family: 'Georgia', serif;
        font-size: 24px;
        color: #2c1810;
        font-weight: 700;
      }
      .el-dialog__headerbtn {
        top: 24px;
        right: 24px;
        .el-dialog__close {
          color: #8b5e3c;
          &:hover { color: #2c1810; }
        }
      }
    }

    .el-dialog__body {
      padding: 24px 32px;
    }

    .el-dialog__footer {
      padding: 20px 32px 32px;
      border-top: 1px solid rgba(184, 134, 11, 0.1);
    }
  }

  .retro-form {
    :deep(.el-form-item__label) {
      color: #8b5e3c;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
      padding-bottom: 8px;
    }
  }

  /* Title Input */
  .retro-input-title {
    :deep(.el-input__wrapper) {
      box-shadow: none !important;
      background: transparent;
      border-bottom: 2px solid rgba(184, 134, 11, 0.2);
      border-radius: 0;
      padding: 0 0 8px 0;
      transition: border-color 0.3s ease;

      &.is-focus {
        border-bottom-color: #c99a4b;
      }
    }
    :deep(.el-input__inner) {
      font-family: 'Georgia', serif;
      font-size: 20px;
      color: #2c1810;
      height: auto;
      &::placeholder {
        color: rgba(139, 94, 60, 0.3);
        font-style: italic;
      }
    }
  }

  /* Select */
  .retro-select {
    --el-select-input-focus-border-color: #c99a4b;
    --el-color-primary: #c99a4b;

    :deep(.el-input__wrapper) {
      background-color: rgba(255, 255, 255, 0.5);
      box-shadow: 0 0 0 1px rgba(184, 134, 11, 0.2) inset !important;
      border-radius: 8px;
      padding: 4px 12px;

      &.is-focus {
        box-shadow: 0 0 0 1px #c99a4b inset !important;
      }
    }
    :deep(.el-input.is-focus .el-input__wrapper) {
      box-shadow: 0 0 0 1px #c99a4b inset !important;
    }
    :deep(.el-input__inner) {
      font-family: 'Georgia', serif;
      color: #2c1810;
    }
  }

  /* Editor */
  .editor-container {
    border: 1px solid rgba(184, 134, 11, 0.2);
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;

    &:focus-within {
      background-color: #fff;
      border-color: #c99a4b;
      box-shadow: 0 4px 12px rgba(201, 154, 75, 0.1);
    }

    .editor-toolbar {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px dashed rgba(184, 134, 11, 0.2);

      .el-button {
        padding: 4px 8px;
        height: 28px;
        color: #8b5e3c;
        font-family: 'Georgia', serif;
        &:hover {
          color: #2c1810;
          background-color: rgba(184, 134, 11, 0.1);
        }
      }
    }

    .retro-textarea {
      width: 684px;
      :deep(.el-textarea__inner) {
        box-shadow: none !important;
        background: transparent;
        padding: 16px;
        font-family: 'Georgia', serif;
        font-size: 16px;
        color: #2c1810;
        line-height: 1.6;

        &::placeholder {
          color: rgba(139, 94, 60, 0.3);
          font-style: italic;
        }
      }
    }
  }

  /* Footer Buttons */
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      height: 40px;
      padding: 0 24px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .cancel-btn {
      border: 1px solid rgba(139, 94, 60, 0.3);
      background: rgba(255, 255, 255, 0.5);
      color: #8b5e3c;
      &:hover {
        background: rgba(139, 94, 60, 0.1);
        color: #5d4037;
        border-color: rgba(139, 94, 60, 0.5);
      }
    }

    .submit-btn {
      background: #2c1810;
      border: none;
      color: #fdfbf7;
      &:hover {
        background: #3e2723;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(44, 24, 16, 0.2);
      }
    }
  }
}

@media (max-width: 1080px) {
  .forum-layout {
    flex-direction: column;
  }

  .sidebar {
    position: static;
    width: 100%;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;

    .header-right {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;

      .search-input {
        width: 100%;
      }
    }
  }

  .post-list {
    .post-card {
      padding: 18px 20px;
    }
  }

  .create-dialog :deep(.el-dialog) {
    width: 90% !important;
    --el-dialog-width: 90%;
  }
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

<style lang="scss">
/* Global styles for dropdowns to match retro theme */
.retro-dropdown {
  --el-color-primary: #c99a4b;
  border: 1px solid rgba(184, 134, 11, 0.2) !important;
  background-color: #fffefb !important;
  box-shadow: 0 8px 24px rgba(60, 44, 31, 0.15) !important;
  border-radius: 8px !important;

  .el-select-dropdown__item {
    font-family: 'Georgia', serif;
    color: #5d4037;
    
    &.selected {
      color: #c99a4b !important;
    }

    &:hover {
      background-color: rgba(212, 175, 55, 0.05);
      color: #3e2723;
    }
  }

  .el-popper__arrow::before {
    background-color: #fffefb !important;
    border: 1px solid rgba(184, 134, 11, 0.2) !important;
  }
}

/* Fix double background for emoji picker */
.emoji-popper {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  
  .el-popper__arrow {
    display: none;
  }
}
</style>

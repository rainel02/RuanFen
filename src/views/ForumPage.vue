<template>
  <div class="forum-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div class="forum-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>学术论坛</el-breadcrumb-item>
          </el-breadcrumb>
          
          <div class="header-actions">
            <el-button type="primary" @click="showNewTopicDialog = true">
              <el-icon><EditPen /></el-icon>
              发表新话题
            </el-button>
          </div>
        </div>

        <el-row :gutter="24">
          <!-- 论坛分类 -->
          <el-col :lg="6" :md="8" :sm="24" :xs="24">
            <el-card class="forum-categories">
              <template #header>
                <h4>论坛分类</h4>
              </template>
              
              <div class="category-list">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="category-item"
                  :class="{ active: selectedCategory === category.id }"
                  @click="selectCategory(category.id)"
                >
                  <div class="category-info">
                    <span class="category-name">{{ category.name }}</span>
                    <span class="category-desc">{{ category.description }}</span>
                  </div>
                  <div class="category-stats">
                    <span class="topic-count">{{ category.topicCount }}</span>
                    <span class="label">话题</span>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 热门标签 -->
            <el-card class="hot-tags">
              <template #header>
                <h4>热门标签</h4>
              </template>
              
              <div class="tags-list">
                <el-tag
                  v-for="tag in hotTags"
                  :key="tag.name"
                  :type="getTagType(tag.heat)"
                  class="hot-tag"
                  @click="filterByTag(tag.name)"
                >
                  {{ tag.name }}
                  <span class="tag-count">({{ tag.count }})</span>
                </el-tag>
              </div>
            </el-card>
          </el-col>

          <!-- 话题列表 -->
          <el-col :lg="18" :md="16" :sm="24" :xs="24">
            <el-card class="topics-container">
              <template #header>
                <div class="topics-header">
                  <h4>{{ currentCategoryName }}话题</h4>
                  <div class="sort-options">
                    <el-select v-model="sortBy" size="small" style="width: 120px;">
                      <el-option label="最新回复" value="latest" />
                      <el-option label="最新发布" value="newest" />
                      <el-option label="最多回复" value="replies" />
                      <el-option label="最多点赞" value="likes" />
                    </el-select>
                  </div>
                </div>
              </template>

              <div class="topics-list">
                <div
                  v-for="topic in filteredTopics"
                  :key="topic.id"
                  class="topic-item"
                  @click="viewTopic(topic)"
                >
                  <div class="topic-avatar">
                    <el-avatar :src="topic.author.avatar" :size="40">
                      {{ topic.author.name.charAt(0) }}
                    </el-avatar>
                  </div>

                  <div class="topic-content">
                    <div class="topic-header">
                      <h5 class="topic-title">{{ topic.title }}</h5>
                      <div class="topic-tags">
                        <el-tag
                          v-for="tag in topic.tags"
                          :key="tag"
                          size="small"
                          effect="plain"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                    </div>

                    <p class="topic-preview">{{ topic.content.substring(0, 150) }}...</p>

                    <div class="topic-meta">
                      <span class="author">{{ topic.author.name }}</span>
                      <span class="time">{{ formatTime(topic.createTime) }}</span>
                      <span class="category">{{ getCategoryName(topic.categoryId) }}</span>
                    </div>
                  </div>

                  <div class="topic-stats">
                    <div class="stat-item">
                      <el-icon><ChatLineSquare /></el-icon>
                      <span>{{ topic.replyCount }}</span>
                    </div>
                    <div class="stat-item">
                      <el-icon><View /></el-icon>
                      <span>{{ topic.viewCount }}</span>
                    </div>
                    <div class="stat-item">
                      <el-icon><Star /></el-icon>
                      <span>{{ topic.likeCount }}</span>
                    </div>
                  </div>

                  <div class="topic-status">
                    <el-tag v-if="topic.isPinned" type="danger" size="small">置顶</el-tag>
                    <el-tag v-if="topic.isClosed" type="info" size="small">已关闭</el-tag>
                    <el-tag v-if="topic.isHot" type="warning" size="small">热门</el-tag>
                  </div>
                </div>

                <!-- 分页 -->
                <div class="pagination-wrapper">
                  <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :total="totalTopics"
                    layout="prev, pager, next, sizes, total"
                    :page-sizes="[10, 20, 50]"
                    @current-change="handlePageChange"
                    @size-change="handleSizeChange"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 发表新话题对话框 -->
    <el-dialog
      v-model="showNewTopicDialog"
      title="发表新话题"
      width="800px"
      @close="resetTopicForm"
    >
      <el-form :model="newTopicForm" :rules="topicRules" ref="topicFormRef" label-width="80px">
        <el-form-item label="话题标题" prop="title">
          <el-input
            v-model="newTopicForm.title"
            placeholder="请输入话题标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="newTopicForm.categoryId" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="newTopicForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="newTopicForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入话题内容..."
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewTopicDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitTopic" :loading="submitting">
            发布话题
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  EditPen,
  ChatLineSquare,
  View,
  Star
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const showNewTopicDialog = ref(false)
const submitting = ref(false)
const selectedCategory = ref('')
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = ref(20)

// 论坛分类
const categories = ref([
  {
    id: '',
    name: '全部话题',
    description: '查看所有讨论话题',
    topicCount: 1250
  },
  {
    id: 'ai',
    name: '人工智能',
    description: 'AI技术讨论与交流',
    topicCount: 340
  },
  {
    id: 'ml',
    name: '机器学习',
    description: '机器学习算法与应用',
    topicCount: 285
  },
  {
    id: 'cv',
    name: '计算机视觉',
    description: '图像处理与视觉算法',
    topicCount: 192
  },
  {
    id: 'nlp',
    name: '自然语言处理',
    description: 'NLP技术与应用',
    topicCount: 156
  },
  {
    id: 'research',
    name: '学术研究',
    description: '研究方法与经验分享',
    topicCount: 178
  },
  {
    id: 'career',
    name: '职业发展',
    description: '学术职业规划讨论',
    topicCount: 99
  }
])

// 热门标签
const hotTags = ref([
  { name: 'ChatGPT', count: 45, heat: 'high' },
  { name: '深度学习', count: 38, heat: 'high' },
  { name: '论文写作', count: 32, heat: 'medium' },
  { name: '数据集', count: 28, heat: 'medium' },
  { name: '实验设计', count: 25, heat: 'medium' },
  { name: '代码实现', count: 22, heat: 'low' },
  { name: '学术会议', count: 18, heat: 'low' },
  { name: '开源项目', count: 15, heat: 'low' }
])

// 话题列表
const topics = ref([
  {
    id: 'topic-1',
    title: '如何选择合适的深度学习框架进行研究？',
    content: '最近在准备开始一个新的研究项目，需要选择一个深度学习框架。目前主要考虑PyTorch和TensorFlow，想听听大家的建议和经验分享。项目主要涉及计算机视觉和自然语言处理...',
    author: {
      id: 'user1',
      name: '张同学',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    categoryId: 'ai',
    tags: ['深度学习', 'PyTorch', 'TensorFlow'],
    createTime: new Date(Date.now() - 3600000).toISOString(),
    replyCount: 23,
    viewCount: 156,
    likeCount: 12,
    isPinned: false,
    isClosed: false,
    isHot: true
  },
  {
    id: 'topic-2',
    title: '学术论文写作技巧分享',
    content: '作为一个博士生，想和大家分享一些学术论文写作的心得。包括如何构思文章结构、如何进行文献综述、如何撰写方法论部分等...',
    author: {
      id: 'user2',
      name: '李博士',
      avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    categoryId: 'research',
    tags: ['论文写作', '学术研究', '博士'],
    createTime: new Date(Date.now() - 7200000).toISOString(),
    replyCount: 45,
    viewCount: 289,
    likeCount: 34,
    isPinned: true,
    isClosed: false,
    isHot: true
  },
  {
    id: 'topic-3',
    title: 'CVPR 2024 论文解读与讨论',
    content: 'CVPR 2024 已经公布了接收论文列表，让我们一起来讨论一些有趣的工作。我先分享几篇我比较关注的论文...',
    author: {
      id: 'user3',
      name: '王教授',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    categoryId: 'cv',
    tags: ['CVPR', '会议论文', '计算机视觉'],
    createTime: new Date(Date.now() - 14400000).toISOString(),
    replyCount: 18,
    viewCount: 98,
    likeCount: 8,
    isPinned: false,
    isClosed: false,
    isHot: false
  }
])

// 新话题表单
const newTopicForm = ref({
  title: '',
  categoryId: '',
  tags: [],
  content: ''
})

const topicRules = {
  title: [
    { required: true, message: '请输入话题标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入话题内容', trigger: 'blur' },
    { min: 20, max: 5000, message: '内容长度在 20 到 5000 个字符', trigger: 'blur' }
  ]
}

const availableTags = ref([
  '深度学习', '机器学习', '计算机视觉', '自然语言处理',
  '论文写作', '实验设计', '数据集', '开源项目',
  'PyTorch', 'TensorFlow', 'Python', 'CUDA'
])

const totalTopics = computed(() => topics.value.length)

const currentCategoryName = computed(() => {
  const category = categories.value.find(c => c.id === selectedCategory.value)
  return category ? category.name : '全部'
})

const filteredTopics = computed(() => {
  let filtered = topics.value

  if (selectedCategory.value) {
    filtered = filtered.filter(topic => topic.categoryId === selectedCategory.value)
  }

  // 排序
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      case 'replies':
        return b.replyCount - a.replyCount
      case 'likes':
        return b.likeCount - a.likeCount
      case 'latest':
      default:
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    }
  })

  return filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

const getTagType = (heat: string) => {
  switch (heat) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return ''
  }
}

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未分类'
}

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
}

const filterByTag = (tagName: string) => {
  ElMessage.info(`正在筛选标签: ${tagName}`)
}

const viewTopic = (topic: any) => {
  router.push(`/forum/topic/${topic.id}`)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const resetTopicForm = () => {
  newTopicForm.value = {
    title: '',
    categoryId: '',
    tags: [],
    content: ''
  }
}

const handleSubmitTopic = () => {
  submitting.value = true
  
  setTimeout(() => {
    ElMessage.success('话题发布成功！')
    showNewTopicDialog.value = false
    resetTopicForm()
    submitting.value = false
  }, 1500)
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped lang="scss">
.forum-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  .forum-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
  }

  .forum-categories {
    margin-bottom: 20px;

    .category-list {
      .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 8px;

        &:hover {
          background-color: #f8f9fa;
        }

        &.active {
          background-color: var(--el-color-primary);
          color: white;

          .category-info .category-desc,
          .category-stats .label {
            color: rgba(255, 255, 255, 0.8);
          }
        }

        .category-info {
          flex: 1;

          .category-name {
            display: block;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .category-desc {
            display: block;
            font-size: 12px;
            color: #666;
          }
        }

        .category-stats {
          text-align: center;

          .topic-count {
            display: block;
            font-size: 18px;
            font-weight: 600;
            color: var(--el-color-primary);
          }

          .label {
            font-size: 11px;
            color: #999;
          }
        }

        &.active .category-stats .topic-count {
          color: white;
        }
      }
    }
  }

  .hot-tags {
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .hot-tag {
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.05);
        }

        .tag-count {
          font-size: 11px;
          opacity: 0.8;
        }
      }
    }
  }

  .topics-container {
    .topics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
      }
    }

    .topics-list {
      .topic-item {
        display: flex;
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f8f9fa;
        }

        &:last-child {
          border-bottom: none;
        }

        .topic-avatar {
          margin-right: 12px;
        }

        .topic-content {
          flex: 1;
          min-width: 0;

          .topic-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .topic-title {
              margin: 0;
              font-size: 16px;
              font-weight: 500;
              color: #333;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .topic-tags {
              display: flex;
              gap: 4px;
            }
          }

          .topic-preview {
            margin: 8px 0;
            color: #666;
            line-height: 1.5;
            font-size: 14px;
          }

          .topic-meta {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #999;

            .author {
              font-weight: 500;
              color: var(--el-color-primary);
            }
          }
        }

        .topic-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 0 16px;
          min-width: 60px;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #666;

            .el-icon {
              font-size: 14px;
            }
          }
        }

        .topic-status {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      }

      .pagination-wrapper {
        margin-top: 24px;
        text-align: center;
      }
    }
  }
}

@media (max-width: 768px) {
  .forum-page {
    .topics-list .topic-item {
      flex-direction: column;
      gap: 12px;

      .topic-stats {
        flex-direction: row;
        margin: 0;
      }
    }
  }
}
</style>

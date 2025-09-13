<template>
  <div class="chat-page">
    <div class="chat-container">
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h3>私信</h3>
          <el-button 
            type="primary" 
            size="small" 
            @click="showNewChatDialog = true"
          >
            新建对话
          </el-button>
        </div>

        <div class="conversations-list">
          <div
            v-for="conversation in conversations"
            :key="conversation.id"
            class="conversation-item"
            :class="{ active: currentConversationId === conversation.id }"
            @click="setCurrentConversation(conversation.id)"
          >
            <el-avatar :src="conversation.participantAvatar" :size="40">
              {{ conversation.participantName.charAt(0) }}
            </el-avatar>
            <div class="conversation-info">
              <div class="participant-name">{{ conversation.participantName }}</div>
              <div class="last-message">
                {{ conversation.lastMessage?.content || '暂无消息' }}
              </div>
            </div>
            <div class="conversation-meta">
              <div class="time">{{ formatTime(conversation.lastActivity) }}</div>
              <el-badge
                v-if="conversation.unreadCount > 0"
                :value="conversation.unreadCount"
                class="unread-badge"
              />
            </div>
          </div>
          
          <div v-if="conversations.length === 0" class="empty-conversations">
            <el-empty 
              description="暂无对话" 
              :image-size="100"
            >
              <el-button 
                type="primary" 
                @click="showNewChatDialog = true"
              >
                开始新对话
              </el-button>
            </el-empty>
          </div>
        </div>
      </div>

      <div class="chat-main" v-if="currentConversation">
        <div class="chat-header">
          <el-avatar :src="currentConversation.participantAvatar" :size="32">
            {{ currentConversation.participantName.charAt(0) }}
          </el-avatar>
          <div class="header-info">
            <span class="participant-name">{{ currentConversation.participantName }}</span>
            <span class="status">在线</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="handleVideoCall">
              <el-icon><VideoCamera /></el-icon>
              视频通话
            </el-button>
            <el-button size="small" @click="handleDeleteConversation">
              <el-icon><Delete /></el-icon>
              删除对话
            </el-button>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            class="message-item"
            :class="{ 'own-message': message.senderId === 'current-user' }"
          >
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <div class="message-input">
          <div v-if="!canSendMessage" class="message-limit-warning">
            <el-alert
              title="已达到连续发送消息上限"
              description="请等待对方回复后再继续发送消息"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
          <div class="input-area">
            <el-input
              v-model="newMessage"
              type="textarea"
              :rows="3"
              placeholder="输入消息..."
              :disabled="!canSendMessage"
              @keydown.ctrl.enter="handleSendMessage"
            />
            <div class="input-actions">
              <div class="input-tools">
                <el-button size="small" text @click="handleSendFile">
                  <el-icon><Paperclip /></el-icon>
                  附件
                </el-button>
                <el-button size="small" text @click="handleSendImage">
                  <el-icon><Picture /></el-icon>
                  图片
                </el-button>
              </div>
              <div class="send-area">
                <span class="send-tip">Ctrl + Enter 发送</span>
                <el-button
                  type="primary"
                  :disabled="!newMessage.trim() || !canSendMessage"
                  @click="handleSendMessage"
                >
                  发送
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="chat-empty">
        <el-empty 
          description="选择一个对话开始聊天" 
          :image-size="200"
        >
          <el-button 
            type="primary" 
            @click="showNewChatDialog = true"
          >
            开始新对话
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 新建对话对话框 -->
    <el-dialog
      v-model="showNewChatDialog"
      title="新建对话"
      width="500px"
      @close="resetNewChatForm"
    >
      <el-form :model="newChatForm" label-width="80px">
        <el-form-item label="选择学者">
          <el-select
            v-model="newChatForm.participantId"
            placeholder="请选择要私信的学者"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="scholar in availableScholars"
              :key="scholar.id"
              :label="scholar.name"
              :value="scholar.id"
            >
              <div class="scholar-option">
                <el-avatar :src="scholar.avatar" :size="24">
                  {{ scholar.name.charAt(0) }}
                </el-avatar>
                <span class="scholar-name">{{ scholar.name }}</span>
                <span class="scholar-title">{{ scholar.title }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="初始消息">
          <el-input
            v-model="newChatForm.initialMessage"
            type="textarea"
            :rows="3"
            placeholder="输入您想说的话..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewChatDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleCreateNewChat"
            :disabled="!newChatForm.participantId"
          >
            开始对话
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  VideoCamera, 
  Delete, 
  Paperclip, 
  Picture 
} from '@element-plus/icons-vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const showNewChatDialog = ref(false)
const newChatForm = ref({
  participantId: '',
  initialMessage: ''
})

// 模拟可用学者数据
const availableScholars = ref([
  {
    id: 'scholar-3',
    name: '王教授',
    title: '计算机科学教授',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'scholar-4', 
    name: '刘博士',
    title: '人工智能研究员',
    avatar: 'https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'scholar-5',
    name: '陈副教授',
    title: '数据科学副教授',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
])

const conversations = computed(() => chatStore.conversations)
const currentConversationId = computed(() => chatStore.currentConversationId)
const currentConversation = computed(() => chatStore.currentConversation)
const currentMessages = computed(() => chatStore.currentMessages)
const canSendMessage = computed(() => chatStore.canSendMessage)

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

const setCurrentConversation = (conversationId: string) => {
  chatStore.setCurrentConversation(conversationId)
  nextTick(() => {
    scrollToBottom()
  })
}

const handleSendMessage = () => {
  if (!newMessage.value.trim() || !canSendMessage.value) return
  
  const success = chatStore.sendMessage(newMessage.value.trim())
  if (success) {
    newMessage.value = ''
    nextTick(() => {
      scrollToBottom()
    })
  } else {
    ElMessage.warning('发送失败，请稍后重试')
  }
}

const handleCreateNewChat = () => {
  const scholar = availableScholars.value.find(s => s.id === newChatForm.value.participantId)
  if (!scholar) return

  const conversationId = chatStore.startConversation(
    scholar.id,
    scholar.name,
    scholar.avatar
  )

  if (newChatForm.value.initialMessage.trim()) {
    chatStore.sendMessage(newChatForm.value.initialMessage.trim())
  }

  showNewChatDialog.value = false
  resetNewChatForm()
  ElMessage.success('对话创建成功')
  
  nextTick(() => {
    scrollToBottom()
  })
}

const resetNewChatForm = () => {
  newChatForm.value = {
    participantId: '',
    initialMessage: ''
  }
}

const handleVideoCall = () => {
  ElMessage.info('视频通话功能开发中...')
}

const handleDeleteConversation = () => {
  ElMessageBox.confirm(
    '确定要删除这个对话吗？删除后无法恢复。',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('对话已删除')
    // 这里可以添加删除对话的逻辑
  }).catch(() => {
    // 用户取消删除
  })
}

const handleSendFile = () => {
  ElMessage.info('文件发送功能开发中...')
}

const handleSendImage = () => {
  ElMessage.info('图片发送功能开发中...')
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  chatStore.initMockData()
})
</script>

<style scoped lang="scss">
.chat-page {
  min-height: calc(100vh - 64px);
  background-color: #f5f5f5;
  padding: 20px;

  .chat-container {
    max-width: 1200px;
    margin: 0 auto;
    height: calc(100vh - 104px);
    display: flex;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .chat-sidebar {
      width: 320px;
      border-right: 1px solid #e8e8e8;
      display: flex;
      flex-direction: column;

      .sidebar-header {
        padding: 20px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #fafafa;

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }

      .conversations-list {
        flex: 1;
        overflow-y: auto;

        .conversation-item {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid #f0f0f0;

          &:hover {
            background-color: #f8f9fa;
          }

          &.active {
            background-color: var(--el-color-primary);
            color: white;

            .conversation-info .participant-name,
            .conversation-info .last-message,
            .conversation-meta .time {
              color: white;
            }
          }

          .conversation-info {
            flex: 1;
            margin-left: 12px;
            min-width: 0;

            .participant-name {
              font-weight: 500;
              margin-bottom: 4px;
              font-size: 14px;
            }

            .last-message {
              font-size: 12px;
              color: #999;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 1.4;
            }
          }

          .conversation-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;

            .time {
              font-size: 11px;
              color: #999;
            }
          }
        }

        .empty-conversations {
          padding: 40px 20px;
          text-align: center;
        }
      }
    }

    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;

      .chat-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        align-items: center;
        gap: 12px;
        background-color: #fafafa;

        .header-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .participant-name {
            font-weight: 500;
            font-size: 16px;
            margin-bottom: 2px;
          }

          .status {
            font-size: 12px;
            color: #52c41a;
          }
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }
      }

      .messages-container {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background-color: #fafafa;

        .message-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          &.own-message {
            align-items: flex-end;

            .message-content {
              background-color: var(--el-color-primary);
              color: white;
            }
          }

          .message-content {
            max-width: 70%;
            padding: 10px 16px;
            background-color: white;
            border-radius: 12px;
            word-wrap: break-word;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            line-height: 1.5;
          }

          .message-time {
            font-size: 11px;
            color: #999;
            margin-top: 6px;
          }
        }
      }

      .message-input {
        border-top: 1px solid #e8e8e8;
        background-color: white;

        .message-limit-warning {
          padding: 12px 20px;
        }

        .input-area {
          padding: 20px;

          .input-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;

            .input-tools {
              display: flex;
              gap: 8px;
            }

            .send-area {
              display: flex;
              align-items: center;
              gap: 12px;

              .send-tip {
                font-size: 12px;
                color: #999;
              }
            }
          }
        }
      }
    }

    .chat-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fafafa;
    }
  }
}

.scholar-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .scholar-name {
    font-weight: 500;
  }

  .scholar-title {
    font-size: 12px;
    color: #999;
    margin-left: auto;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-page {
    padding: 10px;

    .chat-container {
      height: calc(100vh - 84px);

      .chat-sidebar {
        width: 100%;
        position: absolute;
        z-index: 10;
        height: 100%;
        background: white;
      }

      .chat-main {
        width: 100%;
      }
    }
  }
}
</style>

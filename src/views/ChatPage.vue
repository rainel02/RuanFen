<template>
  <div class="chat-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <div class="chat-container">
          <!-- 左侧会话列表 -->
          <div class="chat-sidebar">
            <div class="sidebar-header">
              <h3>消息</h3>
              <div class="header-actions">
                <el-tooltip content="新建对话" placement="bottom">
                  <el-button size="small" circle @click="showNewChatDialog = true">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>

            <div class="search-bar">
              <el-input
                v-model="searchQuery"
                placeholder="搜索对话"
                prefix-icon="Search"
                clearable
              />
            </div>

            <div class="conversations-list">
              <div
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                class="conversation-item"
                :class="{ active: currentConversationId === conversation.id }"
                @click="setCurrentConversation(conversation.id)"
              >
                <div class="avatar-wrapper">
                  <el-avatar :src="conversation.participantAvatar" :size="50">
                    {{ conversation.participantName.charAt(0) }}
                  </el-avatar>
                  <div v-if="isOnline(conversation.participantId)" class="online-indicator"></div>
                </div>
                <div class="conversation-info">
                  <div class="conversation-header">
                    <div class="participant-name">{{ conversation.participantName }}</div>
                    <div class="time">{{ formatTime(conversation.lastActivity) }}</div>
                  </div>
                  <div class="last-message">
                    <span class="message-preview">{{ getMessagePreview(conversation.lastMessage) }}</span>
                    <el-badge
                      v-if="conversation.unreadCount > 0"
                      :value="conversation.unreadCount"
                      :max="99"
                      class="unread-badge"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredConversations.length === 0" class="empty-conversations">
              <el-empty description="暂无对话" :image-size="80" />
            </div>
          </div>

          <!-- 右侧聊天区域 -->
          <div class="chat-main" v-if="currentConversation">
            <div class="chat-header">
              <div class="participant-info">
                <el-avatar :src="currentConversation.participantAvatar" :size="40">
                  {{ currentConversation.participantName.charAt(0) }}
                </el-avatar>
                <div class="participant-details">
                  <span class="participant-name">{{ currentConversation.participantName }}</span>
                  <span class="participant-status">
                    {{ isOnline(currentConversation.participantId) ? '在线' : '离线' }}
                  </span>
                </div>
              </div>
              <div class="chat-actions">
                <el-button size="small" @click="showProfileDialog = true">
                  <el-icon><User /></el-icon>
                  查看资料
                </el-button>
                <el-dropdown @command="handleChatCommand">
                  <el-button size="small">
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="clear">清空聊天记录</el-dropdown-item>
                      <el-dropdown-item command="block">屏蔽用户</el-dropdown-item>
                      <el-dropdown-item command="report">举报</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <div class="messages-container" ref="messagesContainer">
              <div
                v-for="message in currentMessages"
                :key="message.id"
                class="message-item"
                :class="{ 'own-message': message.senderId === 'current-user' }"
              >
                <div class="message-avatar" v-if="message.senderId !== 'current-user'">
                  <el-avatar :src="currentConversation.participantAvatar" :size="32">
                    {{ currentConversation.participantName.charAt(0) }}
                  </el-avatar>
                </div>
                <div class="message-content-wrapper">
                  <div class="message-content" :class="`message-${message.type}`">
                    <!-- 文本消息 -->
                    <div v-if="message.type === 'text'" class="text-content">
                      {{ message.content }}
                    </div>
                    
                    <!-- 表情消息 -->
                    <div v-else-if="message.type === 'emoji'" class="emoji-content">
                      <span class="emoji">{{ message.content }}</span>
                    </div>
                    
                    <!-- 图片消息 -->
                    <div v-else-if="message.type === 'image'" class="image-content">
                      <el-image
                        :src="message.imageUrl"
                        :alt="message.content"
                        fit="cover"
                        style="max-width: 200px; max-height: 200px; border-radius: 8px;"
                        @click="previewImage(message.imageUrl)"
                      />
                    </div>
                    
                    <!-- 文件消息 -->
                    <div v-else-if="message.type === 'file'" class="file-content">
                      <div class="file-info">
                        <el-icon class="file-icon"><Document /></el-icon>
                        <div class="file-details">
                          <div class="file-name">{{ message.fileName }}</div>
                          <div class="file-size">{{ formatFileSize(message.fileSize) }}</div>
                        </div>
                        <el-button size="small" @click="downloadFile(message)">
                          <el-icon><Download /></el-icon>
                          下载
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div class="message-time">
                    {{ formatTime(message.timestamp) }}
                    <el-icon v-if="message.senderId === 'current-user' && message.isRead" class="read-status">
                      <Check />
                    </el-icon>
                  </div>
                </div>
              </div>
            </div>

            <div class="message-input-area">
              <div v-if="!canSendMessage" class="message-limit-warning">
                <el-alert
                  title="已达到连续发送消息上限"
                  description="请等待对方回复后再继续发送消息"
                  type="warning"
                  :closable="false"
                  show-icon
                />
              </div>
              
              <div class="input-toolbar">
                <div class="toolbar-buttons">
                  <el-tooltip content="表情" placement="top">
                    <el-button size="small" @click="showEmojiPicker = !showEmojiPicker">
                      <el-icon><Picture /></el-icon>
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip content="图片" placement="top">
                    <el-button size="small" @click="handleImageUpload">
                      <el-icon><Camera /></el-icon>
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip content="文件" placement="top">
                    <el-button size="small" @click="handleFileUpload">
                      <el-icon><Folder /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>

              <!-- 表情选择器 -->
              <div v-if="showEmojiPicker" class="emoji-picker">
                <div class="emoji-grid">
                  <div
                    v-for="emoji in emojiList"
                    :key="emoji"
                    class="emoji-item"
                    @click="insertEmoji(emoji)"
                  >
                    {{ emoji }}
                  </div>
                </div>
              </div>

              <div class="input-area">
                <el-input
                  v-model="newMessage"
                  type="textarea"
                  :rows="3"
                  placeholder="输入消息..."
                  :disabled="!canSendMessage"
                  @keydown.ctrl.enter="handleSendMessage"
                  resize="none"
                />
                <div class="input-actions">
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

          <!-- 空状态 -->
          <div v-else class="chat-empty">
            <el-empty description="选择一个对话开始聊天" :image-size="200" />
          </div>
        </div>
      </div>
    </div>

    <!-- 新建对话对话框 -->
    <el-dialog
      v-model="showNewChatDialog"
      title="新建对话"
      width="400px"
      center
    >
      <el-form :model="newChatForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="newChatForm.username" placeholder="请输入用户名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewChatDialog = false">取消</el-button>
        <el-button type="primary" @click="createNewChat">创建</el-button>
      </template>
    </el-dialog>

    <!-- 用户资料对话框 -->
    <el-dialog
      v-model="showProfileDialog"
      title="用户资料"
      width="500px"
      center
    >
      <div v-if="currentConversation" class="profile-content">
        <div class="profile-header">
          <el-avatar :src="currentConversation.participantAvatar" :size="80">
            {{ currentConversation.participantName.charAt(0) }}
          </el-avatar>
          <h3>{{ currentConversation.participantName }}</h3>
        </div>
        <div class="profile-info">
          <p>这里可以显示用户的详细信息</p>
        </div>
      </div>
    </el-dialog>

    <!-- 隐藏的文件上传输入 -->
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      @change="onFileSelected"
    />
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onImageSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, User, More, Check, Picture, Camera, Folder, Document, Download
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()

// 响应式数据
const newMessage = ref('')
const searchQuery = ref('')
const messagesContainer = ref<HTMLElement>()
const showEmojiPicker = ref(false)
const showNewChatDialog = ref(false)
const showProfileDialog = ref(false)
const fileInput = ref<HTMLInputElement>()
const imageInput = ref<HTMLInputElement>()

const newChatForm = ref({
  username: ''
})

// 表情列表
const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
]

// 计算属性
const conversations = computed(() => chatStore.conversations)
const currentConversationId = computed(() => chatStore.currentConversationId)
const currentConversation = computed(() => chatStore.currentConversation)
const currentMessages = computed(() => chatStore.currentMessages)
const canSendMessage = computed(() => chatStore.canSendMessage)

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  return conversations.value.filter((conv: any) =>
    conv.participantName.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return date.toLocaleDateString('zh-CN', { weekday: 'short' })
  return date.toLocaleDateString('zh-CN')
}

const getMessagePreview = (message?: any) => {
  if (!message) return '暂无消息'
  
  switch (message.type) {
    case 'text':
      return message.content
    case 'emoji':
      return message.content
    case 'image':
      return '[图片]'
    case 'file':
      return `[文件] ${message.fileName}`
    default:
      return message.content
  }
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isOnline = (_userId: string) => {
  // 模拟在线状态
  return Math.random() > 0.5
}

const setCurrentConversation = (conversationId: string) => {
  chatStore.setCurrentConversation(conversationId)
  showEmojiPicker.value = false
  nextTick(() => {
    scrollToBottom()
  })
}

const handleSendMessage = () => {
  if (!newMessage.value.trim() || !canSendMessage.value) return
  
  const success = chatStore.sendMessage(newMessage.value.trim(), 'text')
  if (success) {
    newMessage.value = ''
    showEmojiPicker.value = false
    nextTick(() => {
      scrollToBottom()
    })
  } else {
    ElMessage.warning('发送失败，请稍后重试')
  }
}

const insertEmoji = (emoji: string) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

const handleImageUpload = () => {
  imageInput.value?.click()
}

const handleFileUpload = () => {
  fileInput.value?.click()
}

const onImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 模拟图片上传
    const imageUrl = URL.createObjectURL(file)
    const success = chatStore.sendMessage(file.name, 'image', { imageUrl })
    if (success) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  }
  target.value = ''
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 模拟文件上传
    const fileUrl = URL.createObjectURL(file)
    const success = chatStore.sendMessage(file.name, 'file', {
      fileUrl,
      fileName: file.name,
      fileSize: file.size
    })
    if (success) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  }
  target.value = ''
}

const previewImage = (imageUrl: string) => {
  // 这里可以实现图片预览功能
  window.open(imageUrl, '_blank')
}

const downloadFile = (message: any) => {
  if (message.fileUrl) {
    const link = document.createElement('a')
    link.href = message.fileUrl
    link.download = message.fileName || 'download'
    link.click()
  }
}

const createNewChat = () => {
  if (!newChatForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  
  // 模拟创建新对话
  chatStore.startConversation(
    `user-${Date.now()}`,
    newChatForm.value.username
  )
  
  showNewChatDialog.value = false
  newChatForm.value.username = ''
  ElMessage.success('对话创建成功')
}

const handleChatCommand = (command: string) => {
  switch (command) {
    case 'clear':
      ElMessageBox.confirm('确定要清空聊天记录吗？', '确认', {
        type: 'warning',
      }).then(() => {
        ElMessage.success('聊天记录已清空')
      }).catch(() => {})
      break
    case 'block':
      ElMessageBox.confirm('确定要屏蔽此用户吗？', '确认', {
        type: 'warning',
      }).then(() => {
        ElMessage.success('用户已屏蔽')
      }).catch(() => {})
      break
    case 'report':
      ElMessage.info('举报功能开发中')
      break
  }
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
@import "../styles/main.scss";

.chat-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.chat-container {
  display: flex;
  height: calc(100vh - 180px);
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  overflow: hidden;

  @include mobile {
    height: calc(100vh - 140px);
    flex-direction: column;
  }

  .chat-sidebar {
    width: 350px;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    background: #fafafa;

    @include mobile {
      width: 100%;
      max-height: 40%;
      border-right: none;
      border-bottom: 1px solid var(--border-color);
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color);
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .search-bar {
      padding: 16px 20px;
      background: white;
      border-bottom: 1px solid var(--border-color);
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
          background-color: var(--primary-color);
          color: white;

          .conversation-info .participant-name,
          .conversation-info .last-message .message-preview,
          .conversation-info .time {
            color: white;
          }
        }

        .avatar-wrapper {
          position: relative;
          margin-right: 12px;

          .online-indicator {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            background-color: #52c41a;
            border: 2px solid white;
            border-radius: 50%;
          }
        }

        .conversation-info {
          flex: 1;
          min-width: 0;

          .conversation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;

            .participant-name {
              font-weight: 500;
              font-size: 15px;
              color: var(--text-color);
            }

            .time {
              font-size: 12px;
              color: var(--text-light);
            }
          }

          .last-message {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .message-preview {
              font-size: 13px;
              color: var(--text-light);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              flex: 1;
            }

            .unread-badge {
              margin-left: 8px;
            }
          }
        }
      }
    }

    .empty-conversations {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-light);
    }
  }

  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;

    .chat-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;

      .participant-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .participant-details {
          display: flex;
          flex-direction: column;

          .participant-name {
            font-weight: 500;
            font-size: 16px;
            color: var(--text-color);
          }

          .participant-status {
            font-size: 12px;
            color: var(--text-light);
          }
        }
      }

      .chat-actions {
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
      background: #f8f9fa;

      .message-item {
        display: flex;
        gap: 8px;

        &.own-message {
          flex-direction: row-reverse;

          .message-content-wrapper {
            align-items: flex-end;

            .message-content {
              background-color: var(--primary-color);
              color: white;

              &.message-text {
                background-color: var(--primary-color);
              }
            }
          }
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .message-content-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 60%;

          .message-content {
            padding: 12px 16px;
            border-radius: 12px;
            background-color: white;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            word-wrap: break-word;

            &.message-text {
              .text-content {
                line-height: 1.5;
              }
            }

            &.message-emoji {
              background: transparent;
              box-shadow: none;
              padding: 4px;

              .emoji-content {
                .emoji {
                  font-size: 32px;
                }
              }
            }

            &.message-file {
              .file-content {
                .file-info {
                  display: flex;
                  align-items: center;
                  gap: 12px;

                  .file-icon {
                    font-size: 24px;
                    color: var(--primary-color);
                  }

                  .file-details {
                    flex: 1;

                    .file-name {
                      font-weight: 500;
                      margin-bottom: 2px;
                    }

                    .file-size {
                      font-size: 12px;
                      color: var(--text-light);
                    }
                  }
                }
              }
            }
          }

          .message-time {
            font-size: 11px;
            color: var(--text-light);
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;

            .read-status {
              color: var(--primary-color);
            }
          }
        }
      }
    }

    .message-input-area {
      border-top: 1px solid var(--border-color);
      background: white;

      .message-limit-warning {
        padding: 12px 20px;
      }

      .input-toolbar {
        padding: 12px 20px 8px;
        border-bottom: 1px solid #f0f0f0;

        .toolbar-buttons {
          display: flex;
          gap: 8px;
        }
      }

      .emoji-picker {
        padding: 12px 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #f0f0f0;

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
          gap: 4px;
          max-height: 120px;
          overflow-y: auto;

          .emoji-item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 20px;
            transition: background-color 0.2s;

            &:hover {
              background-color: #e6f7ff;
            }
          }
        }
      }

      .input-area {
        padding: 20px;

        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;

          .send-tip {
            font-size: 12px;
            color: var(--text-light);
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
    background: #f8f9fa;
    color: var(--text-light);
  }
}

.profile-content {
  .profile-header {
    text-align: center;
    margin-bottom: 24px;

    h3 {
      margin: 12px 0 0 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .profile-info {
    padding: 20px;
    background: #f8f9fa;
    border-radius: var(--border-radius);
    text-align: center;
    color: var(--text-light);
  }
}
</style>

<template>
  <div class="chat-page">
    <AppHeader />
    <div class="chat-container">
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h3>消息中心</h3>
          <el-button circle size="small" :icon="Plus" @click="showNewChatDialog = true" />
        </div>
        <div class="search-box">
          <el-input v-model="searchQuery" placeholder="搜索联系人..." prefix-icon="Search" clearable />
        </div>
        <div class="conversation-list" v-loading="loadingConversations">
          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="conversation-item"
            :class="{ active: currentConversationId === conv.id }"
            @click="selectConversation(conv)"
          >
            <el-badge :value="conv.unreadCount" :hidden="!conv.unreadCount" class="avatar-badge">
              <el-avatar :src="conv.avatar || defaultAvatar" shape="square" />
            </el-badge>
            <div class="conv-info">
              <div class="conv-top">
                <span class="conv-name">{{ conv.name }}</span>
                <span class="conv-time">{{ formatTime(conv.lastMessageTime) }}</span>
              </div>
              <div class="conv-last-msg">{{ conv.lastMessage }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-main">
        <template v-if="currentConversationId">
          <div class="chat-header">
            <div class="header-info">
              <span class="chat-title">{{ currentConversationName }}</span>
              <span class="status-dot"></span>
            </div>
            <div class="header-actions">
              <el-button circle :icon="MoreFilled" />
            </div>
          </div>
          
          <div class="messages-area" ref="messagesArea">
            <div v-for="msg in messages" :key="msg.id" class="message-row" :class="{ 'message-own': msg.isOwn }">
              <el-avatar :src="msg.isOwn ? myAvatar : (currentConversationAvatar || defaultAvatar)" class="msg-avatar" size="small" />
              <div class="message-content-wrapper">
                <div class="message-bubble" v-html="renderMessage(msg.content)"></div>
                <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="toolbar">
              <el-popover placement="top-start" :width="300" trigger="click">
                <template #reference>
                  <el-button circle text>😀</el-button>
                </template>
                <EmojiPicker @select="onSelectEmoji" />
              </el-popover>
              <el-button circle text :icon="Picture" />
              <el-button circle text :icon="Paperclip" />
            </div>
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入消息 (支持 Markdown)..."
              @keydown.enter.prevent="handleSendMessage"
              resize="none"
              class="input-textarea"
            />
            <div class="input-actions">
              <span class="tip">Enter 发送</span>
              <el-button type="primary" @click="handleSendMessage" :loading="sending" round>发送</el-button>
            </div>
          </div>
        </template>
        <div v-else class="empty-chat">
          <el-empty description="选择一个对话开始聊天" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { getConversations, getMessages, sendMessage } from '../api/social'
import { ElMessage } from 'element-plus'
import { Search, Plus, MoreFilled, Picture, Paperclip } from '@element-plus/icons-vue'
import { marked } from 'marked'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const loadingConversations = ref(false)
const conversations = ref<any[]>([])
const currentConversationId = ref<string | null>(null)
const currentConversationName = ref('')
const currentConversationAvatar = ref('')
const messages = ref<any[]>([])
const inputMessage = ref('')
const sending = ref(false)
const messagesArea = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const showNewChatDialog = ref(false)
let pollInterval: any = null

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const myAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  return conversations.value.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const fetchConversations = async () => {
  loadingConversations.value = true
  try {
    const res = await getConversations()
    conversations.value = (res as any).data || res
  } catch (error) {
    console.error(error)
  } finally {
    loadingConversations.value = false
  }
}

const selectConversation = async (conv: any) => {
  currentConversationId.value = conv.id
  currentConversationName.value = conv.name
  currentConversationAvatar.value = conv.avatar
  await fetchMessages()
}

const fetchMessages = async () => {
  if (!currentConversationId.value) return
  try {
    const res = await getMessages(currentConversationId.value)
    messages.value = (res as any).data || res
    scrollToBottom()
  } catch (error) {
    console.error(error)
  }
}

const handleSendMessage = async (e?: KeyboardEvent) => {
  if (e && e.shiftKey) return // Shift+Enter for new line
  
  if (!inputMessage.value.trim() || !currentConversationId.value) return
  
  sending.value = true
  try {
    await sendMessage({
      receiverId: currentConversationId.value,
      content: inputMessage.value
    })
    inputMessage.value = ''
    await fetchMessages()
  } catch (error) {
    console.error(error)
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

const onSelectEmoji = (emoji: any) => {
  inputMessage.value += emoji.i
}

const renderMessage = (content: string) => {
  return marked(content)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
  })
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchConversations()
  pollInterval = setInterval(() => {
    if (currentConversationId.value) {
      fetchMessages()
    }
  }, 5000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped lang="scss">
.chat-page {
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 20px auto;
  width: 95%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: calc(100vh - 100px);
}

.chat-sidebar {
  width: 320px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background: #fcfcfc;

  .sidebar-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 { margin: 0; font-size: 18px; color: #333; }
  }

  .search-box {
    padding: 0 20px 15px;
  }

  .conversation-list {
    flex: 1;
    overflow-y: auto;
  }

  .conversation-item {
    padding: 15px 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;

    &:hover {
      background-color: #f5f7fa;
    }

    &.active {
      background-color: #e6f7ff;
      border-left-color: #1890ff;
    }

    .avatar-badge {
      margin-right: 12px;
    }

    .conv-info {
      flex: 1;
      overflow: hidden;

      .conv-top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        
        .conv-name {
          font-weight: 600;
          color: #333;
          font-size: 15px;
        }
        
        .conv-time {
          font-size: 12px;
          color: #999;
        }
      }

      .conv-last-msg {
        font-size: 13px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;

  .chat-header {
    padding: 15px 25px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);

    .header-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .chat-title {
        font-size: 18px;
        font-weight: 600;
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        background: #52c41a;
        border-radius: 50%;
      }
    }
  }

  .messages-area {
    flex: 1;
    padding: 20px 30px;
    overflow-y: auto;
    background-color: #f5f7fa;
    background-image: radial-gradient(#e6e6e6 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .message-row {
    display: flex;
    margin-bottom: 24px;
    align-items: flex-start;

    .msg-avatar {
      margin-right: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    .message-content-wrapper {
      max-width: 70%;
      display: flex;
      flex-direction: column;
    }

    .message-bubble {
      background: white;
      padding: 12px 18px;
      border-radius: 0 12px 12px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      line-height: 1.6;
      font-size: 15px;
      color: #333;
      
      :deep(p) { margin: 0; }
      :deep(code) { background: #f0f0f0; padding: 2px 4px; border-radius: 4px; }
    }

    .message-time {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      margin-left: 4px;
    }

    &.message-own {
      flex-direction: row-reverse;

      .msg-avatar {
        margin-right: 0;
        margin-left: 12px;
      }

      .message-content-wrapper {
        align-items: flex-end;
      }

      .message-bubble {
        background: #1890ff;
        color: white;
        border-radius: 12px 0 12px 12px;
        
        :deep(code) { background: rgba(255,255,255,0.2); color: white; }
      }
      
      .message-time {
        margin-right: 4px;
        text-align: right;
      }
    }
  }

  .chat-input-area {
    padding: 20px;
    border-top: 1px solid #f0f0f0;
    background: white;

    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      
      .el-button {
        font-size: 20px;
        color: #666;
        &:hover { color: #1890ff; background: #f0f7ff; }
      }
    }

    .input-textarea {
      :deep(.el-textarea__inner) {
        border: none;
        background: #f5f7fa;
        border-radius: 8px;
        padding: 12px;
        font-size: 14px;
        
        &:focus {
          background: white;
          box-shadow: 0 0 0 1px #1890ff inset;
        }
      }
    }

    .input-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 10px;
      gap: 15px;

      .tip {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .empty-chat {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f9f9f9;
  }
}
</style>

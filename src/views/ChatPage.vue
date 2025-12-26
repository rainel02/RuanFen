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
              <el-avatar :src="conv.avatar || getRetroAvatar(conv.name)" shape="square" />
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
              <el-avatar :src="msg.isOwn ? myAvatar : (currentConversationAvatar || getRetroAvatar(currentConversationName))" class="msg-avatar" size="small" />
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
import { Plus, MoreFilled, Picture, Paperclip } from '@element-plus/icons-vue'
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

const retroColors = ['D4AF37', '8B4513', 'A0522D', 'CD853F', '556B2F', 'B8860B', '800000', '5D4037'];
const getRetroAvatar = (name: string) => {
  if (!name) return defaultAvatar;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = retroColors[hash % retroColors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128&bold=true&font-size=0.5`;
}

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  return conversations.value.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const fetchConversations = async () => {
  loadingConversations.value = true
  try {
    const res = await getConversations()
    // API returns { conversations: [...] }
    conversations.value = (res as any).conversations || (res as any).data || res
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
    // API returns { messages: [...] }
    messages.value = (res as any).messages || (res as any).data || res
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
@import '@/styles/retro-theme.scss';

.chat-page {
  @extend .retro-page-bg;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 20px auto;
  width: 95%;
  @extend .glass-panel;
  padding: 0; /* Override glass-panel padding */
  overflow: hidden;
  height: calc(100vh - 100px);
}

.chat-sidebar {
  width: 320px;
  border-right: 1px solid rgba(184, 134, 11, 0.2);
  display: flex;
  flex-direction: column;
  background: rgba(255, 253, 240, 0.6);

  .sidebar-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
    
    h3 { 
      margin: 0; 
      font-size: 18px; 
      @extend .text-retro-dark;
      @extend .font-serif;
    }
  }

  .search-box {
    padding: 0 20px 15px;
    @extend .retro-input;
  }

  .conversation-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .conversation-item {
    padding: 15px 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 8px;
    border: 1px solid transparent;
    border-radius: 10px;
    position: relative;
    overflow: hidden;

    &:hover {
      background: rgba(212, 175, 55, 0.15);
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateX(4px);
    }

    &.active {
      background: linear-gradient(to right, rgba(212, 175, 55, 0.25), rgba(212, 175, 55, 0.1));
      border-color: #D4AF37;
      box-shadow: 0 4px 12px rgba(184, 134, 11, 0.15);
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: #D4AF37;
      }
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
          color: #654321;
          font-size: 15px;
          font-family: 'Georgia', serif;
        }
        
        .conv-time {
          font-size: 12px;
          color: #8B4513;
          opacity: 0.8;
          font-family: 'Georgia', serif;
        }
      }

      .conv-last-msg {
        font-size: 13px;
        color: #8d6e63;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: 'Georgia', serif;
        opacity: 0.9;
        min-height: 18px; /* Ensure height even if empty */
      }
    }
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.4);

  .chat-header {
    padding: 15px 25px;
    border-bottom: 1px solid rgba(184, 134, 11, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 253, 240, 0.8);
    backdrop-filter: blur(10px);

    .header-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .chat-title {
        font-size: 18px;
        font-weight: 600;
        @extend .text-retro-dark;
        @extend .font-serif;
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        background: #52c41a;
        border-radius: 50%;
        box-shadow: 0 0 4px #52c41a;
      }
    }
  }

  .messages-area {
    flex: 1;
    padding: 20px 30px;
    overflow-y: auto;
    background-color: transparent;
    /* Subtle paper texture */
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4af37' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  }

  .message-row {
    display: flex;
    margin-bottom: 24px;
    align-items: flex-start;

    .msg-avatar {
      margin-right: 12px;
      box-shadow: 0 2px 6px rgba(184, 134, 11, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.8);
    }

    .message-content-wrapper {
      max-width: 70%;
      display: flex;
      flex-direction: column;
    }

    .message-bubble {
      background: #fffdf5;
      padding: 12px 18px;
      border-radius: 0 12px 12px 12px;
      box-shadow: 0 2px 8px rgba(184, 134, 11, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.2);
      line-height: 1.6;
      font-size: 15px;
      color: #5d4037;
      font-family: 'Georgia', serif;
      
      :deep(p) { margin: 0; }
      :deep(code) { background: rgba(212, 175, 55, 0.1); padding: 2px 4px; border-radius: 4px; color: #8B4513; }
    }

    .message-time {
      font-size: 12px;
      color: #a1887f;
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
        background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%);
        color: white;
        border-radius: 12px 0 12px 12px;
        border: none;
        box-shadow: 0 4px 12px rgba(184, 134, 11, 0.25);
        
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
    border-top: 1px solid rgba(184, 134, 11, 0.15);
    background: rgba(255, 253, 240, 0.9);

    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      
      .el-button {
        font-size: 20px;
        color: #8B4513;
        &:hover { color: #D4AF37; background: rgba(212, 175, 55, 0.1); }
      }
    }

    .input-textarea {
      :deep(.el-textarea__inner) {
        border: 1px solid rgba(184, 134, 11, 0.2);
        background: #fff;
        border-radius: 8px;
        padding: 12px;
        font-size: 14px;
        font-family: 'Georgia', serif;
        color: #654321;
        
        &:focus {
          background: #fffdf5;
          box-shadow: 0 0 0 1px #D4AF37 inset;
          border-color: #D4AF37;
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
        color: #a1887f;
      }
      
      .el-button--primary {
        background: #D4AF37;
        border-color: #D4AF37;
        color: #fff;
        font-family: 'Georgia', serif;
        font-weight: 600;
        
        &:hover {
          background: #B8860B;
          border-color: #B8860B;
        }
      }
    }
  }

  .empty-chat {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    opacity: 0.9;
    
    :deep(.el-empty__description p) {
      color: #8B4513;
      font-family: 'Georgia', serif;
      font-size: 16px;
    }
    
    :deep(.el-empty__image svg) {
      filter: sepia(1) hue-rotate(10deg) saturate(1.5);
      opacity: 0.8;
    }
  }
}
</style>

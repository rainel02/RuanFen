<template>
  <div class="chat-window">
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h3>消息</h3>
        <el-button size="small" @click="$emit('close')">
          <el-icon><Close /></el-icon>
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
      </div>
    </div>

    <div class="chat-main" v-if="currentConversation">
      <div class="chat-header">
        <el-avatar :src="currentConversation.participantAvatar" :size="32">
          {{ currentConversation.participantName.charAt(0) }}
        </el-avatar>
        <span class="participant-name">{{ currentConversation.participantName }}</span>
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

    <div v-else class="chat-empty">
      <el-empty description="选择一个对话开始聊天" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '../stores/chat'

defineEmits<{
  close: []
}>()

const chatStore = useChatStore()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()

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
.chat-window {
  display: flex;
  height: 600px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  overflow: hidden;

  .chat-sidebar {
    width: 300px;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .conversations-list {
      flex: 1;
      overflow-y: auto;

      .conversation-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f5f5f5;
        }

        &.active {
          background-color: var(--primary-color);
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
            margin-bottom: 2px;
          }

          .last-message {
            font-size: 12px;
            color: var(--text-light);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .conversation-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;

          .time {
            font-size: 11px;
            color: var(--text-light);
          }
        }
      }
    }
  }

  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;

    .chat-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 12px;

      .participant-name {
        font-weight: 500;
      }
    }

    .messages-container {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .message-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        &.own-message {
          align-items: flex-end;

          .message-content {
            background-color: var(--primary-color);
            color: white;
          }
        }

        .message-content {
          max-width: 70%;
          padding: 8px 12px;
          background-color: #f0f0f0;
          border-radius: 12px;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 11px;
          color: var(--text-light);
          margin-top: 4px;
        }
      }
    }

    .message-input {
      border-top: 1px solid var(--border-color);

      .message-limit-warning {
        padding: 12px 16px;
      }

      .input-area {
        padding: 16px;

        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;

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
  }
}
</style>
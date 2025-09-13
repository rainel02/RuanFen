import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage, ChatConversation } from '../types/chat'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<ChatConversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const currentConversationId = ref<string | null>(null)
  const consecutiveMessageCount = ref<{ [key: string]: number }>({})

  const currentConversation = computed(() => 
    conversations.value.find(c => c.id === currentConversationId.value)
  )

  const currentMessages = computed(() => 
    messages.value.filter(m => {
      if (!currentConversation.value) return false
      return (m.senderId === currentConversation.value.participantId && m.receiverId === 'current-user') ||
             (m.senderId === 'current-user' && m.receiverId === currentConversation.value.participantId)
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  )

  const canSendMessage = computed(() => {
    if (!currentConversation.value) return false
    const conversationKey = currentConversation.value.id
    const count = consecutiveMessageCount.value[conversationKey] || 0
    
    // 检查最后一条消息是否是对方发送的
    const lastMessage = currentMessages.value[currentMessages.value.length - 1]
    if (lastMessage && lastMessage.senderId === currentConversation.value.participantId) {
      return true // 对方回复了，可以继续发送
    }
    
    return count < 3 // 最多连续发送3条消息
  })

  const initMockData = () => {
    // Mock conversations
    conversations.value = [
      {
        id: 'conv-1',
        participantId: 'scholar-1',
        participantName: '张伟教授',
        participantAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
        unreadCount: 2,
        lastActivity: new Date().toISOString(),
        lastMessage: {
          id: 'msg-1',
          senderId: 'scholar-1',
          receiverId: 'current-user',
          content: '您好，我看到您对我的论文很感兴趣，有什么问题可以交流。',
          type: 'text',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: false
        }
      },
      {
        id: 'conv-2',
        participantId: 'scholar-2',
        participantName: '李娜博士',
        participantAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150',
        unreadCount: 0,
        lastActivity: new Date(Date.now() - 86400000).toISOString(),
        lastMessage: {
          id: 'msg-2',
          senderId: 'current-user',
          receiverId: 'scholar-2',
          content: '谢谢您的建议，我会仔细考虑的。',
          type: 'text',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          isRead: true
        }
      }
    ]

    // Mock messages
    messages.value = [
      {
        id: 'msg-1',
        senderId: 'scholar-1',
        receiverId: 'current-user',
        content: '您好，我看到您对我的论文很感兴趣，有什么问题可以交流。',
        type: 'text',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false
      },
      {
        id: 'msg-2',
        senderId: 'current-user',
        receiverId: 'scholar-2',
        content: '谢谢您的建议，我会仔细考虑的。',
        type: 'text',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isRead: true
      }
    ]
  }

  const startConversation = (participantId: string, participantName: string, participantAvatar?: string) => {
    const existingConv = conversations.value.find(c => c.participantId === participantId)
    if (existingConv) {
      currentConversationId.value = existingConv.id
      return existingConv.id
    }

    const newConv: ChatConversation = {
      id: `conv-${Date.now()}`,
      participantId,
      participantName,
      participantAvatar,
      unreadCount: 0,
      lastActivity: new Date().toISOString()
    }

    conversations.value.unshift(newConv)
    currentConversationId.value = newConv.id
    return newConv.id
  }

  const sendMessage = (content: string, type: 'text' | 'image' | 'file' | 'emoji' = 'text', options?: {
    imageUrl?: string
    fileUrl?: string
    fileName?: string
    fileSize?: number
  }) => {
    if (!currentConversation.value || !canSendMessage.value) return false

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      receiverId: currentConversation.value.participantId,
      content,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...options
    }

    messages.value.push(message)
    
    // 更新会话的最后消息
    const conv = conversations.value.find(c => c.id === currentConversationId.value)
    if (conv) {
      conv.lastMessage = message
      conv.lastActivity = message.timestamp
    }

    // 更新连续消息计数
    const conversationKey = currentConversation.value.id
    consecutiveMessageCount.value[conversationKey] = (consecutiveMessageCount.value[conversationKey] || 0) + 1

    return true
  }

  const markAsRead = (conversationId: string) => {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      conv.unreadCount = 0
      // 标记该会话中的所有消息为已读
      messages.value.forEach(msg => {
        if (msg.receiverId === 'current-user' && msg.senderId === conv.participantId) {
          msg.isRead = true
        }
      })
    }
  }

  const setCurrentConversation = (conversationId: string) => {
    currentConversationId.value = conversationId
    markAsRead(conversationId)
  }

  return {
    conversations,
    messages,
    currentConversationId,
    currentConversation,
    currentMessages,
    canSendMessage,
    consecutiveMessageCount,
    initMockData,
    startConversation,
    sendMessage,
    setCurrentConversation,
    markAsRead
  }
})
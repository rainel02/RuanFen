export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface ChatConversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  lastMessage?: ChatMessage
  unreadCount: number
  lastActivity: string
}

export interface UserSettings {
  // 隐私设置
  showFavorites: boolean
  showFollowers: boolean
  showFollowing: boolean
  allowMessages: boolean
  emailNotifications: boolean
  
  // 个性化设置
  userRole: string
  researchFields: string[]
  recommendationFrequency: string
  
  // 功能设置
  enableForum: boolean
  enablePaperGuide: boolean
  enableCircles: boolean
  enableAISummary: boolean
  enableAIRecommendation: boolean
}
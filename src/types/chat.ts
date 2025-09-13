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
  showFavorites: boolean
  showFollowers: boolean
  showFollowing: boolean
  allowMessages: boolean
  emailNotifications: boolean
}
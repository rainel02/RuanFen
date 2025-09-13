export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'image' | 'file' | 'emoji'
  timestamp: string
  isRead: boolean
  fileUrl?: string
  fileName?: string
  fileSize?: number
  imageUrl?: string
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

export interface AcademicSettings {
  isVerified: boolean
  scholarName: string
  institution: string
  researchFields: string[]
  hIndex: number
  totalCitations: number
  paperCount: number
  lastSyncTime: string
  autoSync: boolean
  syncCollaborations: boolean
  googleScholarUrl: string
  orcidId: string
}

export interface GoogleScholarProfile {
  name: string
  institution: string
  email: string
  researchFields: string[]
  hIndex: number
  totalCitations: number
  papers: ScholarPaper[]
}

export interface ScholarPaper {
  id: string
  title: string
  authors: string[]
  year: number
  journal: string
  citations: number
  url: string
  abstract?: string
}
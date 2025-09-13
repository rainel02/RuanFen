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
  // 谷歌学术认证
  googleScholar: {
    isVerified: boolean
    profileUrl: string
    orcidId: string
    lastSyncTime: string
    autoSync: boolean
  }
  
  // 知网认证
  cnki: {
    isVerified: boolean
    username: string
    authorId: string
    lastSyncTime: string
    autoSync: boolean
  }
  
  // 通用设置
  syncCollaborations: boolean
  mergeStrategy: 'google-first' | 'cnki-first' | 'manual'
  
  // 合并后的统计数据
  scholarName: string
  institution: string
  researchFields: string[]
  hIndex: number
  totalCitations: number
  paperCount: number
  lastSyncTime: string
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

export interface CnkiProfile {
  name: string
  institution: string
  authorId: string
  researchFields: string[]
  papers: CnkiPaper[]
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
  source: 'google-scholar' | 'cnki'
  doi?: string
}

export interface CnkiPaper {
  id: string
  title: string
  authors: string[]
  year: number
  journal: string
  downloads: number
  citations: number
  url: string
  abstract?: string
  source: 'cnki'
  doi?: string
  cnkiId: string
}

export interface MergedPaper {
  id: string
  title: string
  authors: string[]
  year: number
  journal: string
  citations: number
  downloads?: number
  url: string
  abstract?: string
  sources: ('google-scholar' | 'cnki')[]
  primarySource: 'google-scholar' | 'cnki'
  doi?: string
  cnkiId?: string
  googleScholarId?: string
}
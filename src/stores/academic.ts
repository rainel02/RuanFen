import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AcademicSettings, GoogleScholarProfile, ScholarPaper } from '../types/chat'

export const useAcademicStore = defineStore('academic', () => {
  const settings = ref<AcademicSettings>({
    isVerified: false,
    scholarName: '',
    institution: '',
    researchFields: [],
    hIndex: 0,
    totalCitations: 0,
    paperCount: 0,
    lastSyncTime: '',
    autoSync: true,
    syncCollaborations: true,
    googleScholarUrl: '',
    orcidId: ''
  })

  const syncedPapers = ref<ScholarPaper[]>([])
  const isSyncing = ref(false)

  const isVerified = computed(() => settings.value.isVerified)
  const hasRecentSync = computed(() => {
    if (!settings.value.lastSyncTime) return false
    const lastSync = new Date(settings.value.lastSyncTime)
    const now = new Date()
    const diffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
    return diffHours < 24 // 24小时内算作最近同步
  })

  // 模拟验证谷歌学术账号
  const verifyGoogleScholar = async (profileUrl: string, orcidId?: string): Promise<{
    success: boolean
    profile?: GoogleScholarProfile
    message?: string
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟API验证
        if (profileUrl.includes('scholar.google.com')) {
          const profile: GoogleScholarProfile = {
            name: '张伟教授',
            institution: '清华大学',
            email: 'zhangwei@tsinghua.edu.cn',
            researchFields: ['人工智能', '机器学习', '深度学习', '计算机视觉'],
            hIndex: 42,
            totalCitations: 8520,
            papers: generateMockPapers()
          }

          // 更新设置
          settings.value = {
            ...settings.value,
            isVerified: true,
            scholarName: profile.name,
            institution: profile.institution,
            researchFields: profile.researchFields,
            hIndex: profile.hIndex,
            totalCitations: profile.totalCitations,
            paperCount: profile.papers.length,
            lastSyncTime: new Date().toISOString(),
            googleScholarUrl: profileUrl,
            orcidId: orcidId || ''
          }

          syncedPapers.value = profile.papers

          resolve({
            success: true,
            profile,
            message: '验证成功'
          })
        } else {
          resolve({
            success: false,
            message: '无效的谷歌学术链接'
          })
        }
      }, 2000)
    })
  }

  // 同步论文数据
  const syncPapers = async (): Promise<{
    success: boolean
    newPapers: number
    message: string
  }> => {
    if (!settings.value.isVerified) {
      return {
        success: false,
        newPapers: 0,
        message: '未完成学术认证'
      }
    }

    isSyncing.value = true

    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟同步新论文
        const newPapers = generateMockPapers(2) // 生成2篇新论文
        syncedPapers.value = [...syncedPapers.value, ...newPapers]
        
        settings.value.paperCount = syncedPapers.value.length
        settings.value.lastSyncTime = new Date().toISOString()
        settings.value.totalCitations += 50 // 模拟增加引用
        
        isSyncing.value = false

        resolve({
          success: true,
          newPapers: newPapers.length,
          message: `同步完成，新增 ${newPapers.length} 篇论文`
        })
      }, 2000)
    })
  }

  // 解除绑定
  const unbindAccount = () => {
    settings.value = {
      isVerified: false,
      scholarName: '',
      institution: '',
      researchFields: [],
      hIndex: 0,
      totalCitations: 0,
      paperCount: 0,
      lastSyncTime: '',
      autoSync: true,
      syncCollaborations: true,
      googleScholarUrl: '',
      orcidId: ''
    }
    syncedPapers.value = []
  }

  // 更新设置
  const updateSettings = (newSettings: Partial<AcademicSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  // 保存设置到本地存储
  const saveSettings = () => {
    localStorage.setItem('academic-settings', JSON.stringify(settings.value))
  }

  // 加载设置
  const loadSettings = () => {
    const saved = localStorage.getItem('academic-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        settings.value = { ...settings.value, ...parsed }
        
        // 如果已认证，加载论文数据
        if (settings.value.isVerified) {
          syncedPapers.value = generateMockPapers(settings.value.paperCount)
        }
      } catch (error) {
        console.error('Failed to load academic settings:', error)
      }
    }
  }

  return {
    settings,
    syncedPapers,
    isSyncing,
    isVerified,
    hasRecentSync,
    verifyGoogleScholar,
    syncPapers,
    unbindAccount,
    updateSettings,
    saveSettings,
    loadSettings
  }
})

// 生成模拟论文数据
function generateMockPapers(count = 15): ScholarPaper[] {
  const mockTitles = [
    'Deep Learning for Computer Vision: A Comprehensive Survey',
    'Transformer Networks in Natural Language Processing',
    'Federated Learning: Challenges and Opportunities',
    'Graph Neural Networks for Social Network Analysis',
    'Adversarial Training in Machine Learning',
    'Multi-modal Learning for Autonomous Driving',
    'Reinforcement Learning for Robotics Applications',
    'Privacy-Preserving Machine Learning Techniques',
    'Explainable AI: Methods and Applications',
    'Neural Architecture Search: A Survey',
    'Transfer Learning in Medical Image Analysis',
    'Attention Mechanisms in Deep Learning',
    'Quantum Machine Learning: Theory and Practice',
    'Edge Computing for IoT Applications',
    'Blockchain Technology in Healthcare Systems'
  ]

  const mockJournals = [
    'Nature Machine Intelligence',
    'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    'Journal of Machine Learning Research',
    'Artificial Intelligence',
    'Neural Networks',
    'IEEE Transactions on Neural Networks and Learning Systems',
    'Computer Vision and Image Understanding',
    'Information Sciences',
    'Knowledge-Based Systems',
    'Expert Systems with Applications'
  ]

  const papers: ScholarPaper[] = []
  const currentYear = new Date().getFullYear()

  for (let i = 0; i < count; i++) {
    papers.push({
      id: `paper-${Date.now()}-${i}`,
      title: mockTitles[i % mockTitles.length],
      authors: ['张伟', '李明', '王芳', '陈浩'].slice(0, Math.floor(Math.random() * 3) + 2),
      year: currentYear - Math.floor(Math.random() * 5),
      journal: mockJournals[Math.floor(Math.random() * mockJournals.length)],
      citations: Math.floor(Math.random() * 200) + 10,
      url: `https://scholar.google.com/paper${i}`,
      abstract: `This paper presents a comprehensive study on ${mockTitles[i % mockTitles.length].toLowerCase()}. We propose novel methods and demonstrate their effectiveness through extensive experiments.`
    })
  }

  return papers.sort((a, b) => b.year - a.year)
}
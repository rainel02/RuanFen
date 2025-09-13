import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AcademicSettings, GoogleScholarProfile, CnkiProfile, ScholarPaper, MergedPaper } from '../types/chat'

export const useAcademicStore = defineStore('academic', () => {
  const settings = ref<AcademicSettings>({
    googleScholar: {
      isVerified: false,
      profileUrl: '',
      orcidId: '',
      lastSyncTime: '',
      autoSync: true
    },
    cnki: {
      isVerified: false,
      username: '',
      authorId: '',
      lastSyncTime: '',
      autoSync: true
    },
    mergeStrategy: 'google-first',
    syncCollaborations: true,
    scholarName: '',
    institution: '',
    researchFields: [],
    hIndex: 0,
    totalCitations: 0,
    paperCount: 0,
    lastSyncTime: ''
  })

  const syncedPapers = ref<ScholarPaper[]>([])
  const isSyncing = ref(false)

  const isVerified = computed(() => 
    settings.value.googleScholar.isVerified || settings.value.cnki.isVerified
  )
  const hasRecentSync = computed(() => {
    if (!settings.value.lastSyncTime) return false
    const lastSync = new Date(settings.value.lastSyncTime)
    const now = new Date()
    const diffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
    return diffHours < 24 // 24小时内算作最近同步
  })

  // 绑定谷歌学术账号
  const bindGoogleScholar = async (data: { 
    profileUrl: string
    orcidId?: string 
  }): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.profileUrl.includes('scholar.google.com')) {
          // 模拟成功绑定
          settings.value.googleScholar = {
            isVerified: true,
            profileUrl: data.profileUrl,
            orcidId: data.orcidId || '',
            lastSyncTime: new Date().toISOString(),
            autoSync: true
          }

          // 更新学者信息
          settings.value.scholarName = '张伟教授'
          settings.value.institution = '清华大学'
          settings.value.researchFields = ['人工智能', '机器学习', '深度学习']
          settings.value.hIndex = 42
          settings.value.totalCitations = 8520
          settings.value.lastSyncTime = new Date().toISOString()

          resolve({ success: true, message: '谷歌学术账号绑定成功' })
        } else {
          resolve({ success: false, message: '无效的谷歌学术链接' })
        }
      }, 2000)
    })
  }

  // 绑定知网账号
  const bindCnki = async (data: { 
    username: string
    authorId: string 
  }): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟成功绑定
        settings.value.cnki = {
          isVerified: true,
          username: data.username,
          authorId: data.authorId,
          lastSyncTime: new Date().toISOString(),
          autoSync: true
        }

        // 如果是第一次绑定学术账号，设置学者信息
        if (!settings.value.googleScholar.isVerified) {
          settings.value.scholarName = '张伟教授'
          settings.value.institution = '清华大学'
          settings.value.researchFields = ['计算机科学', '软件工程', '数据库']
        }
        
        settings.value.lastSyncTime = new Date().toISOString()
        resolve({ success: true, message: '知网账号绑定成功' })
      }, 2000)
    })
  }

  // 同步谷歌学术论文
  const syncGoogleScholarPapers = async (): Promise<{
    success: boolean
    message?: string
  }> => {
    if (!settings.value.googleScholar.isVerified) {
      return { success: false, message: '谷歌学术账号未绑定' }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const newPapers = generateMockPapers(3, 'google-scholar')
        syncedPapers.value = mergePapers([...syncedPapers.value, ...newPapers])
        
        settings.value.paperCount = syncedPapers.value.length
        settings.value.googleScholar.lastSyncTime = new Date().toISOString()
        settings.value.lastSyncTime = new Date().toISOString()
        
        resolve({ success: true, message: '谷歌学术论文同步成功' })
      }, 2000)
    })
  }

  // 同步知网论文
  const syncCnkiPapers = async (): Promise<{
    success: boolean
    message?: string
  }> => {
    if (!settings.value.cnki.isVerified) {
      return { success: false, message: '知网账号未绑定' }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const newPapers = generateMockPapers(2, 'cnki')
        syncedPapers.value = mergePapers([...syncedPapers.value, ...newPapers])
        
        settings.value.paperCount = syncedPapers.value.length
        settings.value.cnki.lastSyncTime = new Date().toISOString()
        settings.value.lastSyncTime = new Date().toISOString()
        
        resolve({ success: true, message: '知网论文同步成功' })
      }, 2000)
    })
  }

  // 解除谷歌学术绑定
  const unbindGoogleScholar = async () => {
    settings.value.googleScholar = {
      isVerified: false,
      profileUrl: '',
      orcidId: '',
      lastSyncTime: '',
      autoSync: true
    }
    // 过滤掉谷歌学术的论文
    syncedPapers.value = syncedPapers.value.filter(paper => paper.source !== 'google-scholar')
    settings.value.paperCount = syncedPapers.value.length
  }

  // 解除知网绑定
  const unbindCnki = async () => {
    settings.value.cnki = {
      isVerified: false,
      username: '',
      authorId: '',
      lastSyncTime: '',
      autoSync: true
    }
    // 过滤掉知网的论文
    syncedPapers.value = syncedPapers.value.filter(paper => paper.source !== 'cnki')
    settings.value.paperCount = syncedPapers.value.length
  }

  // 论文合并逻辑
  const mergePapers = (papers: ScholarPaper[]): ScholarPaper[] => {
    const mergedMap = new Map<string, ScholarPaper>()
    
    for (const paper of papers) {
      const key = paper.title.toLowerCase().replace(/\s+/g, '')
      
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!
        // 根据合并策略处理重复论文
        if (settings.value.mergeStrategy === 'google-first' && paper.source === 'google-scholar') {
          mergedMap.set(key, paper)
        } else if (settings.value.mergeStrategy === 'cnki-first' && paper.source === 'cnki') {
          mergedMap.set(key, paper)
        }
        // manual 策略保持第一个
      } else {
        mergedMap.set(key, paper)
      }
    }
    
    return Array.from(mergedMap.values())
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
        if (settings.value.googleScholar.isVerified || settings.value.cnki.isVerified) {
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
    bindGoogleScholar,
    bindCnki,
    syncGoogleScholarPapers,
    syncCnkiPapers,
    unbindGoogleScholar,
    unbindCnki,
    updateSettings,
    saveSettings,
    loadSettings
  }
})

// 生成模拟论文数据
function generateMockPapers(count = 15, source: 'google-scholar' | 'cnki' = 'google-scholar'): ScholarPaper[] {
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

  const mockJournals = source === 'google-scholar' 
    ? [
        'Nature Machine Intelligence',
        'IEEE Transactions on Pattern Analysis and Machine Intelligence',
        'Journal of Machine Learning Research',
        'Artificial Intelligence',
        'Neural Networks'
      ]
    : [
        '计算机学报',
        '软件学报',
        '中国科学：信息科学',
        '自动化学报',
        '电子学报'
      ]

  const papers: ScholarPaper[] = []
  const currentYear = new Date().getFullYear()

  for (let i = 0; i < count; i++) {
    papers.push({
      id: `paper-${source}-${Date.now()}-${i}`,
      title: mockTitles[i % mockTitles.length],
      authors: ['张伟', '李明', '王芳', '陈浩'].slice(0, Math.floor(Math.random() * 3) + 2),
      year: currentYear - Math.floor(Math.random() * 5),
      journal: mockJournals[Math.floor(Math.random() * mockJournals.length)],
      citations: Math.floor(Math.random() * 200) + 10,
      url: source === 'google-scholar' 
        ? `https://scholar.google.com/paper${i}`
        : `https://kns.cnki.net/paper${i}`,
      abstract: `This paper presents a comprehensive study on ${mockTitles[i % mockTitles.length].toLowerCase()}. We propose novel methods and demonstrate their effectiveness through extensive experiments.`,
      source
    })
  }

  return papers.sort((a, b) => b.year - a.year)
}
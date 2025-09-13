import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserSettings } from '../types/chat'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<UserSettings>({
    // 隐私设置
    showFavorites: true,
    showFollowers: true,
    showFollowing: true,
    allowMessages: true,
    emailNotifications: true,
    
    // 个性化设置
    userRole: '',
    researchFields: [],
    recommendationFrequency: 'weekly',
    
    // 功能设置
    enableForum: true,
    enablePaperGuide: true,
    enableCircles: true,
    enableAISummary: true,
    enableAIRecommendation: true
  })

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
    }
  }

  const saveSettings = (newSettings: Partial<UserSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    localStorage.setItem('userSettings', JSON.stringify(settings.value))
  }

  return {
    settings,
    loadSettings,
    saveSettings
  }
})
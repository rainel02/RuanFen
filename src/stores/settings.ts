import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserSettings } from '../types/chat'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<UserSettings>({
    showFavorites: true,
    showFollowers: true,
    showFollowing: true,
    allowMessages: true,
    emailNotifications: true
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
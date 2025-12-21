import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/user'
import { login as apiLogin } from '../api/auth'
import { get } from '../api/index'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!user.value && !!token.value)

  // 设置用户信息
  const setUser = (userData: Partial<User>) => {
    user.value = {
      id: userData.id || '',
      username: userData.username || '',
      email: userData.email || '',
      role: userData.role || 'user',
      avatar: userData.avatar,
      name: userData.name,
      title: userData.title,
      institution: userData.institution,
      researchFields: userData.researchFields || [],
      hIndex: userData.hIndex,
      citations: userData.citations,
      papers: userData.papers
    } as User
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // 登录（保留兼容性，但实际由LoginPage调用API）
  const login = async (account: string, password: string) => {
    try {
      const response = await apiLogin({ account, password })
      token.value = response.token
      localStorage.setItem('token', response.token)
      
      // 获取用户详细信息
      await fetchUserInfo()
      
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 获取用户详细信息
  const fetchUserInfo = async () => {
    try {
      const userInfo = await get<User>('/users/me')
      setUser(userInfo)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initAuth = async () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      try {
        user.value = JSON.parse(savedUser)
        // 验证token是否有效，如果无效则清除
        await fetchUserInfo()
      } catch (error) {
        // token可能已过期，清除本地数据
        logout()
      }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    initAuth,
    setUser,
    fetchUserInfo
  }
})

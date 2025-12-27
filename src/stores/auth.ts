import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/user'
import * as authApi from '../api/auth'
import * as userApi from '../api/user'

export const useAuthStore = defineStore('auth', () => {
  const storedUser = localStorage.getItem('user')
  const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!user.value && !!token.value)

  const login = async (account: string, password: string) => {
    try {
      console.log('开始登录请求，参数:', { account, password })
      const response = await authApi.login({ account, password })
      console.log('登录响应:', response)

      if (response && response.token && response.user) {
        token.value = response.token
        user.value = response.user as User
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        return { success: true }
      }

      if (response && (response as any).data && (response as any).data.token) {
        const t = (response as any).data.token as string
        token.value = t
        localStorage.setItem('token', t)
        return { success: true }
      }

      if (response && (response as any).token) {
        const t = (response as any).token as string
        token.value = t
        localStorage.setItem('token', t)
        return { success: true }
      }

      console.warn('登录响应格式不正确:', response)
      return { success: false, message: '登录失败：响应格式不正确' }
    } catch (error: any) {
      console.error('登录请求失败:', error)
      const errorMessage = error.message || '登录失败'
      return { success: false, message: errorMessage }
    }
  }

  const register = async (username: string, email: string, password: string, role?: 'user' | 'admin' | 'administrator') => {
    try {
      const response = await authApi.register({ username, email, password, role })
      return { success: true, data: response }
    } catch (error: any) {
      return { success: false, message: error.message || '注册失败' }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initAuth = async () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      try {
        // 获取当前用户信息
        const userData = await userApi.getCurrentUser()
        user.value = userData as User
        localStorage.setItem('user', JSON.stringify(userData))
      } catch (error) {
        // token可能已过期，清除
        logout()
      }
    }
  }

  const refreshUserInfo = async () => {
    try {
      const userData = await userApi.getCurrentUser()
      user.value = userData as User
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    initAuth,
    refreshUserInfo
  }
})

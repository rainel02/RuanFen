import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/user'
import * as authApi from '../api/auth'
import * as userApi from '../api/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!user.value && !!token.value)

  const login = async (account: string, password: string) => {
    try {
      console.log('开始登录请求，参数:', { account, password })
      const response = await authApi.login({ account, password })
      console.log('登录响应:', response)

      // 后端返回格式：{ token, userId, username, email, role }
      if (response && (response as any).token) {
        const loginData = response as any
        token.value = loginData.token
        localStorage.setItem('token', loginData.token)
        
        // 构建user对象
        const userData: User = {
          id: loginData.userId || loginData.id || '',
          username: loginData.username || '',
          email: loginData.email || '',
          name: loginData.username || '',
          title: '',
          institution: '',
          researchFields: [],
          hIndex: 0,
          citations: 0,
          papers: 0,
          role: (loginData.role || 'USER').toLowerCase() as 'user' | 'admin' | 'administrator'
        }
        
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))
        
        // 登录后获取完整用户信息
        try {
          const fullUserData = await userApi.getCurrentUser()
          if (fullUserData) {
            user.value = { ...userData, ...fullUserData } as User
            // 确保role正确设置（后端返回的是 "ADMIN" 或 "USER" 大写）
            if ((fullUserData as any).role) {
              user.value.role = ((fullUserData as any).role as string).toLowerCase() as 'user' | 'admin' | 'administrator'
            }
            localStorage.setItem('user', JSON.stringify(user.value))
          }
        } catch (err) {
          console.warn('获取完整用户信息失败，使用登录响应数据:', err)
        }
        
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
        // 确保 role 字段正确设置（后端返回的是 "ADMIN" 或 "USER" 大写）
        const role = (userData as any).role
        user.value = {
          ...userData,
          role: role ? (role.toLowerCase() as 'user' | 'admin' | 'administrator') : 'user'
        } as User
        localStorage.setItem('user', JSON.stringify(user.value))
      } catch (error) {
        // token可能已过期，清除
        logout()
      }
    }
  }

  const refreshUserInfo = async () => {
    try {
      const userData = await userApi.getCurrentUser()
      // 确保 role 字段正确设置（后端返回的是 "ADMIN" 或 "USER" 大写）
      const role = (userData as any).role
      user.value = {
        ...userData,
        role: role ? (role.toLowerCase() as 'user' | 'admin' | 'administrator') : 'user'
      } as User
      localStorage.setItem('user', JSON.stringify(user.value))
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

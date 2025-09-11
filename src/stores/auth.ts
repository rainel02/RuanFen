import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!user.value && !!token.value)

  const login = async (username: string, password: string) => {
    // Mock login
    if (username === 'admin' && password === '123456') {
      const userData = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
        name: '张教授',
        title: '教授',
        institution: '清华大学',
        researchFields: ['人工智能', '机器学习', '深度学习'],
        hIndex: 45,
        citations: 1234,
        papers: 89
      }

      user.value = userData
      token.value = 'mock-jwt-token'
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    initAuth
  }
})

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

  // 解析后端返回的 preferences 字符串并合并到 user 对象
  const normalizeUser = (userData: any): User => {
    let parsed = userData
    if (userData.preferences && typeof userData.preferences === 'string') {
      try {
        const prefs = JSON.parse(userData.preferences)
        parsed = {
          ...userData,
          bio: prefs.bio || '',
          interests: prefs.interests || [],
          // 保留原始 preferences 字符串
          preferences: userData.preferences
        }
      } catch (e) {
        console.error('Failed to parse user preferences:', e)
      }
    }
    // 确保 name 有值（部分接口只返回 username）
    if (!parsed.name && parsed.username) {
      parsed.name = parsed.username
    }
    console.log('Normalized user data:', parsed)
    // 尝试从多种后端字段推断 role，并保持兼容性
    if (!parsed.role) {
      const maybeRole = parsed.role || (parsed.roles && Array.isArray(parsed.roles) ? parsed.roles[0] : undefined) || parsed.roleName || parsed.userType || (parsed.isAdmin ? 'admin' : undefined)
      if (maybeRole) parsed.role = maybeRole
      console.log('Normalized user role to:', parsed.role)
    }
    // 规范化 role 值为项目内部使用的枚举（admin/administrator/user）
    if (parsed.role) {
      try {
        const r = String(parsed.role).toLowerCase()
        if (r.includes('admin')) parsed.role = 'admin'
        else if (r.includes('administrator')) parsed.role = 'administrator'
        else parsed.role = 'user'
      } catch (e) {
        // 保持原样
      }
    }
    console.log('Normalized user final role:', parsed.role)
    return parsed
  }

  const login = async (account: string, password: string) => {
    try {
      console.log('开始登录请求，参数:', { account, password })
      const response = await authApi.login({ account, password })
      console.log('登录响应:', response)
      // 如果后端返回 token，我们统一处理 token 并尽可能从响应中提取用户信息。
      if (response && (response as any).token) {
        const t = (response as any).token as string
        token.value = t
        localStorage.setItem('token', t)

        // 优先寻找嵌套的 user 字段，其次尝试 data.user，再尝试响应顶层包含的用户字段
        let userPayload: any = null
        if ((response as any).user) userPayload = (response as any).user
        else if ((response as any).data && (response as any).data.user) userPayload = (response as any).data.user
        else {
          // 顶层可能直接包含 userId/username/email/role 等字段
          const top = response as any
          if (top.username || top.userId || top.email || top.role) {
            // 克隆并移除 token 字段，避免污染 user 对象
            const clone = { ...top }
            delete clone.token
            userPayload = clone
          }
        }

        if (userPayload) {
          // 确保从响应各处提取到的 role 明确写入 payload
          const topResp = response as any
          if (!userPayload.role) {
            if (topResp.role) userPayload.role = topResp.role
            else if (topResp.data && topResp.data.role) userPayload.role = topResp.data.role
            else if (topResp.roleName) userPayload.role = topResp.roleName
            else if (topResp.roles && Array.isArray(topResp.roles) && topResp.roles.length) userPayload.role = topResp.roles[0]
          }
          console.log('Login: extracted userPayload keys', Object.keys(userPayload), 'role=', userPayload.role)
          const normalized = normalizeUser(userPayload)
          // ensure role exists before persisting
          if (!normalized.role) normalized.role = (user.value as any)?.role || 'user'
          user.value = normalized as User
          localStorage.setItem('user', JSON.stringify(normalized))
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
      console.log('注册错误信息:', error)
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
        console.log('initAuth: existing in-memory user:', user.value)
        const userData = await userApi.getCurrentUser()
        console.log('initAuth: fetched userData:', userData)
        const normalized = normalizeUser(userData)
        // 如果后端未返回 role，保留已有本地 role（避免覆盖）
        if (!normalized.role && user.value && (user.value as any).role) {
          (normalized as any).role = (user.value as any).role
          console.log('initAuth: preserved existing role ->', (normalized as any).role)
        }
        // ensure role exists before persisting
        if (!normalized.role) normalized.role = (user.value as any)?.role || 'user'
        user.value = normalized as User
        console.log('initAuth: final normalized user saved:', user.value)
        localStorage.setItem('user', JSON.stringify(normalized))
      } catch (error) {
        // token可能已过期，清除
        logout()
      }
    }
  }

  const refreshUserInfo = async () => {
    try {
      console.log('refreshUserInfo: existing in-memory user before refresh:', user.value)
      const userData = await userApi.getCurrentUser()
      console.log('refreshUserInfo: fetched userData:', userData)
      const normalized = normalizeUser(userData)
      if (!normalized.role && user.value && (user.value as any).role) {
        (normalized as any).role = (user.value as any).role
        console.log('refreshUserInfo: preserved existing role ->', (normalized as any).role)
      }
      // ensure role exists before persisting
      if (!normalized.role) normalized.role = (user.value as any)?.role || 'user'
      user.value = normalized as User
      console.log('refreshUserInfo: final normalized user saved:', user.value)
      localStorage.setItem('user', JSON.stringify(normalized))
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

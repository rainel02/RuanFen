import request from './request'

// 认证相关接口

/**
 * 用户注册
 */
export const register = (data: {
  username: string
  email: string
  password: string
  role?: 'user' | 'admin' | 'administrator'
}) => {
  return request.post('/auth/register', data)
}

/**
 * 用户登录
 */
export const login = (data: {
  account: string // 用户名/邮箱
  password: string
}) => {
  return request.post('/auth/login', data)
}

/**
 * 忘记密码 - 发送验证码
 */
export const forgotPassword = (data: {
  email: string
}) => {
  return request.post('/auth/forgot-password', data)
}

/**
 * 重置密码
 */
export const resetPassword = (data: {
  email: string
  verificationCode: string
  newPassword: string
}) => {
  return request.post('/auth/reset-password', data)
}



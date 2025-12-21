import { post } from './index'

// 登录响应类型
export interface LoginResponse {
  token: string
  user: {
    userId: string
    username: string
    role: string
  }
}

// 注册响应类型
export interface RegisterResponse {
  userId: string
  username: string
  email: string
}

// 成功消息响应类型
export interface SuccessMessage {
  message: string
}

// 错误响应类型
export interface ErrorResponse {
  message: string
  code?: string
}

// 用户注册
export function register(data: {
  username: string
  email: string
  password: string
}): Promise<RegisterResponse> {
  return post<RegisterResponse>('/auth/register', data)
}

// 用户登录
export function login(data: {
  account: string
  password: string
}): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', data)
}

// 忘记密码 - 发送验证码
export function forgotPassword(data: {
  email: string
}): Promise<SuccessMessage> {
  return post<SuccessMessage>('/auth/forgot-password', data)
}

// 重置密码
export function resetPassword(data: {
  email: string
  verificationCode: string
  newPassword: string
}): Promise<SuccessMessage> {
  return post<SuccessMessage>('/auth/reset-password', data)
}


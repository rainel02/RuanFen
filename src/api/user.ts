import { get, post, put, del } from './index'

// 用户信息类型
export interface UserInfo {
  userId: string
  username: string
  email: string
  certificationStatus?: 'not_certified' | 'pending' | 'certified'
  preferences?: Record<string, any>
  avatar?: string
  name?: string
  title?: string
  institution?: string
  researchFields?: string[]
  bio?: string
}

// 更新用户信息请求
export interface UpdateUserInfoRequest {
  username?: string
  email?: string
  preferences?: Record<string, any>
  avatar?: string
  name?: string
  title?: string
  institution?: string
  researchFields?: string[]
  bio?: string
}

// 认证申请请求
export interface CertificationRequest {
  realName: string
  organization: string
  orgEmail: string
  title: string
  proofMaterials: string[]
}

// 认证申请响应
export interface CertificationResponse {
  message: string
  status: string
}

// 认证状态响应
export interface CertificationStatus {
  status: 'pending' | 'certified' | 'rejected'
  reason?: string
}

// 申诉请求
export interface AppealRequest {
  appealType: 'identity_stolen' | 'achievement_stolen'
  targetId: string
  reason: string
  evidenceMaterials: string[]
}

// 申诉响应
export interface AppealResponse {
  message: string
  caseId: string
}

// 成果类型
export interface Achievement {
  id: string
  title: string
  authors: string[]
  journal?: string
  year: number
  doi?: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

// 成果列表响应
export interface AchievementsResponse {
  achievements: Achievement[]
  total: number
}

// 创建成果请求
export interface CreateAchievementRequest {
  title: string
  authors: string[]
  journal?: string
  year: number
  doi?: string
  abstract?: string
}

// 更新成果请求
export interface UpdateAchievementRequest {
  title?: string
  authors?: string[]
  journal?: string
  year?: number
  doi?: string
  abstract?: string
}

// 获取当前用户信息
export function getUserInfo(): Promise<UserInfo> {
  return get<UserInfo>('/users/me')
}

// 更新用户信息
export function updateUserInfo(data: UpdateUserInfoRequest): Promise<UserInfo> {
  return put<UserInfo>('/users/me', data)
}

// 提交认证申请
export function submitCertification(data: CertificationRequest): Promise<CertificationResponse> {
  return post<CertificationResponse>('/users/me/certification', data)
}

// 获取认证状态
export function getCertificationStatus(): Promise<CertificationStatus> {
  return get<CertificationStatus>('/users/me/certification')
}

// 提交申诉
export function submitAppeal(data: AppealRequest): Promise<AppealResponse> {
  return post<AppealResponse>('/users/me/appeal', data)
}

// 获取用户成果列表（假设接口，根据实际情况调整）
export function getUserAchievements(): Promise<AchievementsResponse> {
  return get<AchievementsResponse>('/users/me/achievements')
}

// 创建成果（假设接口，根据实际情况调整）
export function createAchievement(data: CreateAchievementRequest): Promise<Achievement> {
  return post<Achievement>('/users/me/achievements', data)
}

// 更新成果（假设接口，根据实际情况调整）
export function updateAchievement(id: string, data: UpdateAchievementRequest): Promise<Achievement> {
  return put<Achievement>(`/users/me/achievements/${id}`, data)
}

// 删除成果（假设接口，根据实际情况调整）
export function deleteAchievement(id: string): Promise<void> {
  return del<void>(`/users/me/achievements/${id}`)
}


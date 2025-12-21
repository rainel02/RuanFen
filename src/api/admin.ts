import { get, post, put } from './index'

// 认证申请类型
export interface CertificationApplication {
  appId: string
  userId: string
  username: string
  email: string
  realName: string
  organization: string
  orgEmail: string
  title: string
  proofMaterials: string[]
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

// 认证申请列表响应
export interface CertificationApplicationsResponse {
  applications: CertificationApplication[]
}

// 申诉类型
export interface Appeal {
  caseId: string
  userId: string
  username: string
  appealType: 'identity_stolen' | 'achievement_stolen'
  targetId: string
  reason: string
  evidenceMaterials: string[]
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  processedAt?: string
  processorId?: string
}

// 申诉列表响应
export interface AppealsResponse {
  appeals: Appeal[]
}

// 成果类型
export interface PendingAchievement {
  achId: string
  scholarId: string
  scholarName: string
  title: string
  authors: string[]
  journal?: string
  year: number
  doi?: string
  abstract?: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

// 待审核成果列表响应
export interface PendingAchievementsResponse {
  pendingAchievements: PendingAchievement[]
}

// 任务类型
export interface Task {
  taskId: string
  name: string
  cron: string
  status: 'enabled' | 'disabled'
  lastRun: string
  nextRun?: string
  description?: string
  params?: Record<string, any>
}

// 任务列表响应
export interface TasksResponse {
  tasks: Task[]
}

// 更新任务请求
export interface UpdateTaskRequest {
  cron?: string
  status?: 'enabled' | 'disabled'
  params?: Record<string, any>
}

// 统计数据类型
export interface DashboardStats {
  totalUsers: number
  totalScholars: number
  totalPapers: number
  pendingCertifications: number
  pendingAppeals: number
  pendingAchievements: number
  recentUsers?: Array<{ userId: string; username: string; createdAt: string }>
}

// 获取认证申请列表
export function getCertificationApplications(status?: string): Promise<CertificationApplicationsResponse> {
  const url = status ? `/admin/certifications?status=${status}` : '/admin/certifications'
  return get<CertificationApplicationsResponse>(url)
}

// 批准认证申请
export function approveCertification(appId: string): Promise<{ message: string }> {
  return post<{ message: string }>(`/admin/certifications/${appId}/approve`)
}

// 驳回认证申请
export function rejectCertification(appId: string, reason: string): Promise<{ message: string }> {
  return post<{ message: string }>(`/admin/certifications/${appId}/reject`, { reason })
}

// 获取申诉列表
export function getAppeals(status?: string): Promise<AppealsResponse> {
  const url = status ? `/admin/appeals?status=${status}` : '/admin/appeals'
  return get<AppealsResponse>(url)
}

// 处理申诉
export function processAppeal(
  caseId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<{ message: string }> {
  return post<{ message: string }>(`/admin/appeals/${caseId}/process`, { action, reason })
}

// 获取待审核成果列表
export function getPendingAchievements(): Promise<PendingAchievementsResponse> {
  return get<PendingAchievementsResponse>('/admin/achievements/pending')
}

// 批准成果
export function approveAchievement(achId: string): Promise<{ message: string }> {
  return post<{ message: string }>(`/admin/achievements/${achId}/approve`)
}

// 驳回成果
export function rejectAchievement(achId: string, reason: string): Promise<{ message: string }> {
  return post<{ message: string }>(`/admin/achievements/${achId}/reject`, { reason })
}

// 获取任务列表
export function getTasks(): Promise<TasksResponse> {
  return get<TasksResponse>('/admin/tasks')
}

// 更新任务配置
export function updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
  return put<Task>(`/admin/tasks/${taskId}`, data)
}

// 手动触发任务
export function runTask(taskId: string): Promise<{ message: string }> {
  return post<{ message: string }>(`/admin/tasks/${taskId}/run`)
}

// 获取仪表盘统计数据（假设接口，根据实际情况调整）
export function getDashboardStats(): Promise<DashboardStats> {
  return get<DashboardStats>('/admin/dashboard/stats')
}


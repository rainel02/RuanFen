import request from './request'

// 管理员相关接口

/**
 * 获取待审核的学者认证列表
 */
export const getCertifications = (params?: {
  status?: string
}) => {
  return request.get('/admin/certifications', { params })
}

/**
 * 批准学者认证
 */
export const approveCertification = (appId: string) => {
  return request.post(`/admin/certifications/${appId}/approve`)
}

/**
 * 驳回学者认证
 */
export const rejectCertification = (appId: string, data: {
  reason: string
}) => {
  return request.post(`/admin/certifications/${appId}/reject`, data)
}

/**
 * 获取待处理的申诉列表
 */
export const getAppeals = (params?: {
  status?: string
}) => {
  return request.get('/admin/appeals', { params })
}

/**
 * 处理申诉（批准或驳回）
 */
export const processAppeal = (caseId: string, data: {
  action: 'approve' | 'reject'
  reason?: string
}) => {
  return request.post(`/admin/appeals/${caseId}/process`, data)
}

/**
 * 获取待审核的学者提交成果
 */
export const getPendingAchievements = () => {
  return request.get('/admin/achievements/pending')
}

/**
 * 批准学者提交的成果
 */
export const approveAchievement = (achId: string) => {
  return request.post(`/admin/achievements/${achId}/approve`)
}

/**
 * 驳回学者提交的成果
 */
export const rejectAchievement = (achId: string, data: {
  reason: string
}) => {
  return request.post(`/admin/achievements/${achId}/reject`, data)
}

/**
 * 查看所有定时任务
 */
export const getTasks = () => {
  return request.get('/admin/tasks')
}

/**
 * 配置定时任务
 */
export const updateTask = (taskId: string, data: {
  cron?: string
  status?: 'enabled' | 'disabled'
  params?: object
}) => {
  return request.put(`/admin/tasks/${taskId}`, data)
}

/**
 * 手动触发一次任务
 */
export const runTask = (taskId: string) => {
  return request.post(`/admin/tasks/${taskId}/run`)
}




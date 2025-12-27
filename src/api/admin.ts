import request from './request'

// 管理员相关接口

/**
 * 获取待审核的学者认证列表
 * 后端实际路径：GET /certifications/pending
 */
export const getPendingCertifications = (status?: string) => {
  return request.get('/certifications/pending', status ? { status } : {})
}

/**
 * 批准学者认证
 */
export const approveCertification = (appId: string) => {
  return request.post(`/certifications/${appId}/approve`, {})
}

/**
 * 驳回学者认证
 * 后端接口使用 @RequestParam，需要作为查询参数传递
 */
export const rejectCertification = (appId: string, reason: string) => {
  return request.post(`/certifications/${appId}/reject?reason=${encodeURIComponent(reason)}`, {})
}

/**
 * 获取待处理的申诉列表
 */
export const getPendingAppeals = (status?: string) => {
  // 根据接口文档，应该是 /admin/appeals，但后端实际可能是其他路径
  // 先尝试 /admin/appeals，如果不行再调整
  return request.get('/admin/appeals', status ? { status } : {})
}

/**
 * 处理申诉（批准或驳回）
 */
export const processAppeal = (caseId: string, action: 'approve' | 'reject', reason?: string) => {
  return request.post(`/admin/appeals/${caseId}/process`, {
    action,
    reason
  })
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
  return request.post(`/admin/achievements/${achId}/approve`, {})
}

/**
 * 驳回学者提交的成果
 */
export const rejectAchievement = (achId: string, reason: string) => {
  return request.post(`/admin/achievements/${achId}/reject`, { reason })
}

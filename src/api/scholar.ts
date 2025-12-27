import request from './request'

// 学者相关接口

/**
 * 检索学者门户
 * 后端实际路径：GET /scholars/search，支持可选参数 name, organization, field
 */
export const searchScholars = (params?: {
  name?: string
  organization?: string
  field?: string
}) => {
  // 后端实际实现使用 /scholars/search
  return request.get('/scholars/search', params)
}

/**
 * 获取特定学者的公开门户主页
 */
export const getScholarDetail = (id: string) => {
  return request.get(`/scholars/${id}`)
}

/**
 * 查看学者合作关系网络
 */
export const getCollaborationNetwork = (id: string) => {
  return request.get(`/scholars/${id}/collaboration-network`)
}




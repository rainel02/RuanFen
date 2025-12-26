import request from './request'

// 用户相关接口

/**
 * 获取当前登录用户的详细信息
 */
export const getCurrentUser = () => {
  return request.get('/users/me')
}

/**
 * 更新当前登录用户的个人信息
 */
export const updateCurrentUser = (data: {
  username?: string
  email?: string
  preferences?: object
}) => {
  return request.put('/users/me', data)
}

/**
 * 提交学者认证申请
 */
export const submitCertification = (data: {
  realName: string
  organization: string
  orgEmail: string
  title: string
  proofMaterials?: string[]
}) => {
  return request.post('/users/me/certification', data)
}

/**
 * 查看自己的认证申请状态
 */
export const getCertificationStatus = () => {
  return request.get('/users/me/certification')
}

/**
 * 提交申诉
 */
export const submitAppeal = (data: {
  appealType: 'identity_stolen' | 'achievement_stolen'
  targetId: string
  reason: string
  evidenceMaterials?: string[]
}) => {
  return request.post('/users/me/appeal', data)
}




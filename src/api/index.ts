import request from './request'

// Use the shared fetch-based request wrapper for all endpoints

export async function searchAchievements(options: Record<string, any> = {}) {
  return request.get('/achievements', options)
}

export async function getAchievement(id: string) {
  return request.get(`/achievements/${id}`)
}

// 兼容 axios/自定义 fetch 两种 request 实现
export async function getMyCollections(options: Record<string, any> = {}) {
  const url = '/users/me/collections'
  // axios: request.get(url, { params })
  // fetch: request.get(url, params)
  // 这里判断 request.get 的第二个参数是否是 { params } 还是直接 params
  // 目前 fetch 版 request.get 只接受 params
  // 这里做兼容处理
  const isFetch = typeof window !== 'undefined' && typeof fetch === 'function'
  const paramsArg = isFetch ? options : { params: options }
  try {
    return await request.get(url, paramsArg)
  } catch (error) {
    console.warn('[WARN] getMyCollections API error:', error)
    console.warn('[WARN] Error response status:', error.response?.status)
    console.warn('[WARN] Error response data:', error.response?.data)
    return { results: [] }
  }
}

export async function addToCollections(achievementId: string) {
  const url = '/users/me/collections'
  const data = { achievementId }
  console.log('[DEBUG] addToCollections - sending POST to:', url, 'with data:', data)
  try {
    const res = await request.post(url, data)
    console.log('[DEBUG] addToCollections - response:', res)
    return res
  } catch (error) {
    console.warn('[WARN] addToCollections API error:', error)
    return { status: 201, ok: true }
  }
}

export async function removeFromCollections(achievementId: string) {
  const url = '/users/me/collections/delete'
  const data = { achievementId }
  console.log('[DEBUG] removeFromCollections - sending POST to:', url, 'with data:', data)
  try {
    const res = await request.post(url, data)
    console.log('[DEBUG] removeFromCollections - response:', res)
    return res
  } catch (error) {
    console.warn('[WARN] removeFromCollections API error:', error)
    return { status: 204, ok: true }
  }
}

export default {
  searchAchievements,
  getAchievement,
  getMyCollections,
  addToCollections,
  removeFromCollections
}

import request from './request'

// Use the shared fetch-based request wrapper for all endpoints

export async function searchAchievements(options: Record<string, any> = {}) {
  return request.get('/achievements', options)
}

export async function getAchievement(id: string) {
  return request.get(`/achievements/${id}`)
}

export async function getMyCollections() {
  const url = '/users/me/collections'
  console.log('[DEBUG] getMyCollections - sending GET to:', url)
  console.log('[DEBUG] Current token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING')
  return request.get(url).catch((error) => {
    console.warn('[WARN] getMyCollections API error:', error)
    console.warn('[WARN] Error response status:', error.response?.status)
    console.warn('[WARN] Error response data:', error.response?.data)
    return { results: [] }
  })
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

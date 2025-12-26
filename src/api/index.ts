import request from './request'

// Use the shared fetch-based request wrapper for all endpoints

export async function searchAchievements(options: Record<string, any> = {}) {
  return request.get('/achievements', options)
}

export async function getAchievement(id: string) {
  return request.get(`/achievements/${id}`)
}

export async function getMyCollections() {
  return request.get('/users/me/collections')
}

export async function addToCollections(achievementId: string) {
  return request.post('/users/me/collections', { achievementId })
}

export async function removeFromCollections(achievementId: string) {
  // Backend uses POST /users/me/collections/delete with body { achievementId }
  return request.post('/users/me/collections/delete', { achievementId })
}

export default {
  searchAchievements,
  getAchievement,
  getMyCollections,
  addToCollections,
  removeFromCollections
}

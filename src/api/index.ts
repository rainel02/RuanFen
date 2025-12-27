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

export async function createAchievement(data: any) {
  return request.post('/achievements', data)
}

export async function updateAchievement(id: string, data: any) {
  return request.put(`/achievements/${id}`, data)
}

export async function deleteAchievement(id: string) {
  return request.delete(`/achievements/${id}`)
}

export default {
  searchAchievements,
  getAchievement,
  getMyCollections,
  addToCollections,
  removeFromCollections,
  createAchievement,
  updateAchievement,
  deleteAchievement
}

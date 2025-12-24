import { APIFOX_BASE_URL } from './config'

const BASE = APIFOX_BASE_URL

function buildUrl(path: string, params: Record<string, any> = {}) {
  const url = new URL(`${BASE}${path}`)
  Object.keys(params).forEach(k => {
    const v = params[k]
    if (v === undefined || v === null || v === '') return
    if (Array.isArray(v)) {
      v.forEach(item => url.searchParams.append(k, item))
    } else {
      url.searchParams.set(k, String(v))
    }
  })
  return url.toString()
}

export async function searchAchievements(options: Record<string, any> = {}) {
  const url = buildUrl('/achievements', options)
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getAchievement(id: string) {
  const url = `${BASE}/achievements/${id}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getMyCollections() {
  const url = `${BASE}/users/me/collections`
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function addToCollections(achievementId: string) {
  const url = `${BASE}/users/me/collections`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ achievementId })
  })
  return res
}

export async function removeFromCollections(achievementId: string) {
  const url = `${BASE}/users/me/collections/${achievementId}`
  const res = await fetch(url, { method: 'DELETE' })
  return res
}

export default {
  searchAchievements,
  getAchievement,
  getMyCollections,
  addToCollections,
  removeFromCollections
}

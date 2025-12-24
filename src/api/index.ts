const BASE = 'http://127.0.0.1:4523/m1/7413325-7146674-6711292/api'

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

// Social
export async function followUser(userId: string) {
  const url = `${BASE}/social/follow/${userId}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function unfollowUser(userId: string) {
  const url = `${BASE}/social/follow/${userId}`
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getFollowers(userId: string) {
  const url = `${BASE}/social/followers/${userId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getFollowing(userId: string) {
  const url = `${BASE}/social/following/${userId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getConversations() {
  const url = `${BASE}/social/dms`
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function sendMessage(data: { recipientId: string; content: string; attachmentUrl?: string }) {
  const url = `${BASE}/social/dms`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getMessages(userId: string) {
  const url = `${BASE}/social/dms/${userId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getForumPosts(boardId?: string) {
  const url = buildUrl('/social/forum/posts', { boardId })
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function createForumPost(data: { title: string; content: string; boardId: string; attachments?: string[] }) {
  const url = `${BASE}/social/forum/posts`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getForumPostDetail(id: string) {
  const url = `${BASE}/social/forum/posts/${id}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function replyToForumPost(id: string, data: { content: string; attachments?: string[] }) {
  const url = `${BASE}/social/forum/posts/${id}/reply`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

// Analysis
export async function getHotTopics(time_range: string = 'all') {
  const url = buildUrl('/analysis/hot-topics', { time_range })
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getInfluenceRanking(domain: string = 'all') {
  const url = buildUrl('/analysis/influence/ranking', { domain })
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function getInfluenceTrend(userId: string, time_range: string = '5y', metric: string = 'citations') {
  const url = buildUrl(`/analysis/influence/trend/${userId}`, { time_range, metric })
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export default {
  searchAchievements,
  getAchievement,
  getMyCollections,
  addToCollections,
  removeFromCollections,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getConversations,
  sendMessage,
  getMessages,
  getForumPosts,
  createForumPost,
  getForumPostDetail,
  replyToForumPost,
  getHotTopics,
  getInfluenceRanking,
  getInfluenceTrend
}

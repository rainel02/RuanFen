import { API_BASE_URL } from './config'
import request from './request'

export interface KnowledgeBase {
  id: string
  name: string
  description?: string
  visibility: 'PRIVATE' | 'PUBLIC'
  createdAt: string
  updatedAt: string
}

export interface KnowledgeDocument {
  id: string
  knowledgeBaseId: string
  originalFilename: string
  status: 'PENDING' | 'PARSING' | 'READY' | 'FAILED'
  fileSize?: number
  pageCount?: number
  summary?: string
  parsedAt?: string
  createdAt?: string
  updatedAt?: string
  parseError?: string
}

export async function listKnowledgeBases(): Promise<KnowledgeBase[]> {
  return request.get('/kb')
}

export async function createKnowledgeBase(payload: {
  name: string
  description?: string
  visibility?: 'PRIVATE' | 'PUBLIC'
}): Promise<KnowledgeBase> {
  return request.post('/kb', payload)
}

export async function deleteKnowledgeBase(id: string): Promise<void> {
  return request.delete(`/kb/${id}`)
}

export async function listDocuments(kbId: string): Promise<KnowledgeDocument[]> {
  return request.get(`/kb/${kbId}/documents`)
}

export async function uploadDocument(kbId: string, file: File): Promise<KnowledgeDocument> {
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {}
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/kb/${kbId}/documents`, {
    method: 'POST',
    headers,
    body: formData
  })

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null)
    const message = errorJson?.message || `上传失败: ${response.status}`
    throw new Error(message)
  }

  const json = await response.json()
  // 后端统一返回 { code, message, data }
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as KnowledgeDocument
  }
  return json as KnowledgeDocument
}

export interface QaResult {
  answer: string
  references?: Array<Record<string, any>>
}

export async function qa(question: string, topK = 5, kbId?: string): Promise<QaResult> {
  const url = `${API_BASE_URL}/kb/qa`
  const body = { question, topK, kbId }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60000) // 60s 超时，避免大模型延迟导致中断
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    })
    if (!resp.ok) {
      const errJson = await resp.json().catch(() => null)
      const msg = errJson?.message || `请求失败: ${resp.status}`
      throw new Error(msg)
    }
    const json = await resp.json()
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as QaResult
    }
    return json as QaResult
  } finally {
    clearTimeout(timer)
  }
}

export default {
  listKnowledgeBases,
  createKnowledgeBase,
  deleteKnowledgeBase,
  listDocuments,
  uploadDocument,
  qa
}

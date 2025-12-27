// 基于 index.ts 模式的请求工具
import { API_BASE_URL } from './config'

const BASE = API_BASE_URL
const DEFAULT_TIMEOUT = 15000

// 构建 URL（支持查询参数，兼容相对 BASE）
function buildUrl(path: string, params: Record<string, any> = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const basePath = `${BASE}${normalizedPath}`
  const search = new URLSearchParams()

  Object.keys(params || {}).forEach(k => {
    const v = params[k]
    // 过滤掉 undefined、null 和空字符串
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) return
    if (Array.isArray(v)) {
      v.forEach(item => search.append(k, String(item)))
    } else {
      search.set(k, String(v))
    }
  })

  const qs = search.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

// 获取请求头（包含 token）
function getHeaders(customHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  }
  
  // 添加 token
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// 处理响应
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: `请求失败: ${response.status}` }
    }
    
    // 创建错误对象，保持与 axios 类似的格式
    const error: any = new Error(errorData.message || `请求失败: ${response.status}`)
    error.response = {
      status: response.status,
      data: errorData
    }
    throw error
  }
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T
  }
  const json = await response.json()
  if (json && typeof json === 'object' && 'code' in json) {
    const code = Number(json.code)
    if (Number.isFinite(code) && code !== 200) {
      const message = json.message || `请求失败: ${code}`
      const error: any = new Error(message)
      error.response = { status: code, data: json }
      throw error
    }
  }
  return (json && typeof json === 'object' && 'data' in json) ? (json.data as T) : (json as T)
}

// 包装 fetch，增加超时控制
async function doFetch(url: string, init: RequestInit, timeoutMs: number = DEFAULT_TIMEOUT) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

// GET 请求
export async function get<T = any>(path: string, params?: Record<string, any>): Promise<T> {
  const url = buildUrl(path, params)
  const response = await doFetch(url, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse<T>(response)
}

// POST 请求
export async function post<T = any>(path: string, data?: any): Promise<T> {
  const url = buildUrl(path)
  const response = await doFetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined
  })
  return handleResponse<T>(response)
}

// PUT 请求
export async function put<T = any>(path: string, data?: any): Promise<T> {
  const url = buildUrl(path)
  const response = await doFetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined
  })
  return handleResponse<T>(response)
}

// DELETE 请求
export async function del<T = any>(path: string): Promise<T> {
  const url = buildUrl(path)
  const response = await doFetch(url, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return handleResponse<T>(response)
}

// 创建类似 axios 的 request 对象，保持兼容性
const request = {
  get,
  post,
  put,
  delete: del
}

export default request

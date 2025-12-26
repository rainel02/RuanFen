// 基于 index.ts 模式的请求工具
import { APIFOX_BASE_URL } from './config'

const BASE = APIFOX_BASE_URL

// 构建 URL（支持查询参数）
function buildUrl(path: string, params: Record<string, any> = {}) {
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${BASE}${normalizedPath}`)
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
  return response.json()
}

// GET 请求
export async function get<T = any>(path: string, params?: Record<string, any>): Promise<T> {
  const url = buildUrl(path, params)
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  })
  return handleResponse<T>(response)
}

// POST 请求
export async function post<T = any>(path: string, data?: any): Promise<T> {
  const url = buildUrl(path)
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined
  })
  return handleResponse<T>(response)
}

// PUT 请求
export async function put<T = any>(path: string, data?: any): Promise<T> {
  const url = buildUrl(path)
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined
  })
  return handleResponse<T>(response)
}

// DELETE 请求
export async function del<T = any>(path: string): Promise<T> {
  const url = buildUrl(path)
  const response = await fetch(url, {
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

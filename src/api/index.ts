// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// 请求拦截器
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers as HeadersInit,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// GET请求
export function get<T>(url: string, options?: RequestInit): Promise<T> {
  return request<T>(url, { ...options, method: 'GET' })
}

// POST请求
export function post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
  return request<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// PUT请求
export function put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
  return request<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// DELETE请求
export function del<T>(url: string, options?: RequestInit): Promise<T> {
  return request<T>(url, { ...options, method: 'DELETE' })
}


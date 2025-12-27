import axios from 'axios'

const DEFAULT_BASE = '/api'
const NODE_DEFAULT_BASE = 'http://localhost:8080/api'
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? (
  typeof window === 'undefined' ? NODE_DEFAULT_BASE : DEFAULT_BASE
)

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
})

// Request interceptor
service.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data && typeof data === 'object' && 'code' in data) {
      const code = Number(data.code)
      if (Number.isFinite(code) && code !== 200) {
        const err: any = new Error(data.message || `请求失败: ${code}`)
        err.response = { status: code, data }
        throw err
      }
    }
    return (data && typeof data === 'object' && 'data' in data) ? data.data : data
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

export default service

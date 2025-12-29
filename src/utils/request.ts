import axios from 'axios'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
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

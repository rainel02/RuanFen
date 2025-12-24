import axios from 'axios'

const service = axios.create({
  baseURL: 'http://127.0.0.1:4523/m1/7413325-7146674-6711292/api',
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
    return response.data
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

export default service

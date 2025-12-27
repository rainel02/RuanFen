// 后端接口基础地址
// 优先使用环境变量 `VITE_API_BASE_URL`
// 浏览器环境默认走相对路径 `/api`（通过 Vite 代理到 `http://localhost:8080`）
// Node/SSR 环境默认使用绝对地址，避免解析相对 URL 报错
const DEFAULT_BASE = '/api'
const NODE_DEFAULT_BASE = 'http://localhost:8080/api'
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? (
	typeof window === 'undefined' ? NODE_DEFAULT_BASE : DEFAULT_BASE
)


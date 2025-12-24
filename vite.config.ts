import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许局域网访问（可选）
    port: 5173, // 开发服务器端口（Vite默认5173）
    open: true, // 启动时自动打开浏览器（可选）
    proxy: {
      // 代理所有以 /api 开头的请求到 Apifox Mock 服务
      // 
      // 📝 如何获取你的 Apifox 项目 ID：
      // 1. 打开 Apifox 客户端
      // 2. 进入你的项目
      // 3. 点击左侧菜单的"Mock"或"Mock服务"
      // 4. 查看 Mock 服务地址，格式类似：http://127.0.0.1:4523/m1/你的项目ID/api
      // 5. 将下面的 "YOUR_APIFOX_PROJECT_ID" 替换为你的项目 ID（例如：7413325-7146674-6711292）
      '/api': {
        target: 'http://127.0.0.1:4523', // 本地 Apifox Mock 服务地址（HTTP，不是HTTPS）
        changeOrigin: true, // 修改请求头中的origin为目标地址
        secure: false, // 本地服务使用 HTTP，设置为 false
        // 重写路径：将 /api 替换为 /m1/你的项目ID
        // 例如：/api/auth/login -> /m1/YOUR_APIFOX_PROJECT_ID/auth/login
       
        // ⚠️ 重要：请将下面的项目 ID 替换为你的 Apifox 项目 ID
        // 格式：/m1/你的项目ID/api
        // 例如：/m1/1234567-8901234-5678901/api
        // 当前使用的是队友的项目 ID，请替换为你的
        rewrite: (path) => {
          // 👇 请将下面的项目 ID 替换为你的 Apifox 项目 ID
          const projectId = '7413325-7146674-6711292' // 这是队友的项目 ID，请替换！
          // 保留 /api 路径：/api/auth/login -> /m1/项目ID/api/auth/login
          return `/m1/${projectId}${path}`
        },
        // 可选：详细日志
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // eslint-disable-next-line no-console
            console.log(`[Vite Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            // eslint-disable-next-line no-console
            console.log(`[Vite Proxy] Response: ${proxyRes.statusCode} for ${req.url}`)
          })
        }
      }
    }
  }
})
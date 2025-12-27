import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // load .env files into `env` according to current mode; third argument '' means load all vars, not just VITE_
  const env = loadEnv(mode, process.cwd(), '')
  const DASHSCOPE_API_KEY = env.DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY || ''

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/mixins.scss";`
        }
      }
    },
    server: {
      proxy: {
        // 代理真实后端 API（/api），不拦截 Apifox Mock 服务
        // Apifox Mock 服务使用完整 URL（http://127.0.0.1:4523/...），不会被代理拦截
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        // 开发时将 /dashscope 转发给 Dashscope（通义万相）并注入本地环境变量中的 Authorization
        // 使用方法：前端 POST 到 /dashscope，Vite dev server 会把请求重写到真实提供方路径并添加 Authorization
        '/dashscope': {
          target: 'https://dashscope.aliyuncs.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/dashscope/, '/api/v1/services/aigc/multimodal-generation/generation'),
          headers: {
            // 在本地开发环境中，请把密钥放到 .env 或 .env.local 中，键名为 DASHSCOPE_API_KEY
            Authorization: DASHSCOPE_API_KEY ? `Bearer ${DASHSCOPE_API_KEY}` : ''
          }
        }
      }
    }
  }
})

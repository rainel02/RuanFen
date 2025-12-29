import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
        '/api': {
          target: 'http://10.128.53.189:8080',
          changeOrigin: true
        },
        '/dashscope': {
          target: 'https://dashscope.aliyuncs.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/dashscope/, '/api/v1/services/aigc/multimodal-generation/generation'),
          headers: {
            Authorization: DASHSCOPE_API_KEY ? `Bearer ${DASHSCOPE_API_KEY}` : ''
          }
        }
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/rzsl/', // 确保这是正确的仓库名称
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: '.', // 将静态资源放在根目录
  },
  server: {
    port: 3000
  }
})
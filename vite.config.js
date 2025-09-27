import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/rzsl/', // 重要：GitHub Pages 需要相对路径
  build: {
    outDir: 'dist',
    emptyOutDir: true // 构建前清空输出目录
  },
  server: {
    port: 3000
  }
})
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite' // 1. Nạp plugin Tailwind

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(), // 2. Kích hoạt Tailwind ở đây
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
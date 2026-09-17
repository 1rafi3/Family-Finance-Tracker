import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const src = (path: string): string => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

export default defineConfig({
  root: rootDir,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': src('components'),
      '@features': src('features'),
      '@hooks': src('hooks'),
      '@lib': src('lib'),
      '@services': src('services'),
      '@types': src('types'),
      '@utils': src('utils'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

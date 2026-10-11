/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const API_URL = process.env.VITE_API_PROXY ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5173,
    // In development the Rails API runs on :3000; in production Rails serves
    // the built SPA itself so these paths are same-origin.
    proxy: {
      '/graphql': API_URL,
      '/exports': API_URL,
    },
  },
  build: {
    // Vendor chunks: keeps the app chunk small and the libraries cacheable.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory-vendor')) return 'charts'
          if (id.includes('@mui')) return 'mui'
          if (id.includes('@apollo') || id.includes('/graphql/')) return 'apollo'
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})

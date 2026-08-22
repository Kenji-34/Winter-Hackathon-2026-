import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // `vercel dev` alone serves /api but not the Vite app reliably; run
    // `vercel dev --listen 3000` alongside `vite` and let this proxy bridge them.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})

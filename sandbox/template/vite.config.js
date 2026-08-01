import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-scroll': fileURLToPath(new URL('./src/shims/react-scroll.jsx', import.meta.url)),
    },
  },
  server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: true
  }
})

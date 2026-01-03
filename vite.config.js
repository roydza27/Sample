import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // This is your frontend port
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // This MUST be your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
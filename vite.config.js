import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        //target: "http://localhost:5000",
        target:"https://interview-backend-10476774711.asia-south1.run.app",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

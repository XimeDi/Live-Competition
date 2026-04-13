import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth": { target: process.env.VITE_API_PROXY_TARGET ?? "http://localhost:3001", changeOrigin: true },
      "/api": { target: process.env.VITE_API_PROXY_TARGET ?? "http://localhost:3001", changeOrigin: true },
    },
    port: 3000,
    allowedHosts: ["vexatiously-dextrocular-esteban.ngrok-free.dev"],
    host: true, // Listen on all network interfaces
  }
})

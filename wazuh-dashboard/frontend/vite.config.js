import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true, // cho phép truy cập từ máy khác trong mạng LAN khi demo
    allowedHosts: true, // Bổ sung cho phép tên miền Cloudflare Tunnel truy cập
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Forward trực tiếp request API sang backend
        changeOrigin: true,
        xfwd: true, // Chuyển tiếp đúng IP thật của máy khách trong header x-forwarded-for
      },
    },
  },
})
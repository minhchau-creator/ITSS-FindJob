import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose ra LAN + cho ngrok forward về
    allowedHosts: ['.ngrok-free.app', '.ngrok.app', '.ngrok.io', 'localhost'],
  },
})

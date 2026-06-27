import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose dev server to local network (LAN)
    port: 5173,
    allowedHosts: true // Allow connections from public tunnel domains
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-core';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})


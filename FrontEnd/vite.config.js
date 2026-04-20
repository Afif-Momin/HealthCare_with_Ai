import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    // Silence rollup warnings that would otherwise abort the build
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress "use client" directive warnings from recharts/third-party libs
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        // Suppress circular dependency warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        warn(warning)
      }
    },
    // Raise chunk size warning limit (recharts is large)
    chunkSizeWarningLimit: 1500,
  }
})

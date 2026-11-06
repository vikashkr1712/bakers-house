import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5000,
    strictPort: true,
    allowedHosts: ['f1n8041h-5000.inc1.devtunnels.ms'],
    watch: {
      ignored: ['**/.publish/**', '**/.publish-tools/**', '**/test-results*/**', '**/playwright-report/**', '**/screenshots/**'],
    },
  },
})

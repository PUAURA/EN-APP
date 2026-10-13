import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps the built dist/ openable as plain static files (no server).
export default defineConfig({
  base: './',
  plugins: [react()],
})

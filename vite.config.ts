
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js and React Three Fiber into separate chunk
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Split postprocessing into separate chunk
          'postprocessing': ['@react-three/postprocessing', 'postprocessing'],
          // Split React into separate chunk
          'react-vendor': ['react', 'react-dom'],
        }
      }
    },
    // Increase chunk size warning limit since we're code splitting
    chunkSizeWarningLimit: 1000,
  },
})

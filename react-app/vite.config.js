// ==========================================
// 📁 react-app/vite.config.js
// Configuration Vite D'URGENCE - Version qui fonctionne
// ==========================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@shared': resolve(__dirname, './src/shared'),
      '@core': resolve(__dirname, './src/core'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/shared/utils'),
      '@stores': resolve(__dirname, './src/shared/stores'),
      '@services': resolve(__dirname, './src/core/services')
    }
  },

  server: {
    port: 3000,
    open: true,
    host: true
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    chunkSizeWarningLimit: 1000
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  css: {
    devSourcemap: true
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'zustand',
      'lucide-react'
    ]
  }
})

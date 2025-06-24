// ==========================================
// 📁 react-app/vite.config.js
// Configuration Vite pour Synergia v3.5
// ==========================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuration des alias de chemins
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

  // Configuration du serveur de développement
  server: {
    port: 3000,
    open: true,
    host: true
  },

  // Configuration du build
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    
    // Optimisation des chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'react-hot-toast', 'lucide-react'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          stores: ['zustand']
        }
      }
    },
    
    // Limites de taille personnalisées
    chunkSizeWarningLimit: 1000
  },

  // Variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // Configuration CSS
  css: {
    devSourcemap: true
  },

  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'zustand',
      'framer-motion',
      'react-hot-toast',
      'lucide-react',
      'recharts',
      'date-fns'
    ]
  }
})

// ==========================================
// 📁 react-app/vite.config.js
// Configuration Vite SIMPLIFIÉE pour résoudre l'erreur de chunk
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

  // Configuration du build SIMPLIFIÉE
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    
    // SUPPRESSION des manualChunks qui causent l'erreur
    rollupOptions: {
      output: {
        // Chunking automatique sans configuration manuelle
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
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

  // Optimisation des dépendances SIMPLIFIÉE
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

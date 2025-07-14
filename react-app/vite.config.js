// ==========================================
// 📁 react-app/vite.config.js
// CONFIGURATION VITE OPTIMISÉE POUR NETLIFY
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
    
    // ✅ OPTIMISATIONS POUR ÉVITER TIMEOUT
    minify: 'esbuild', // Plus rapide que terser
    target: 'es2020', // Moins agressif qu'esnext
    
    rollupOptions: {
      // ✅ CHUNKING OPTIMISÉ POUR RÉDUIRE LE TEMPS DE BUILD
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // ✅ SÉPARATION MANUELLE DES CHUNKS POUR ÉVITER TIMEOUT
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          'vendor-ui': ['lucide-react', 'framer-motion', 'recharts'],
          'vendor-state': ['zustand'],
          
          // App chunks
          'pages': [
            './src/pages/Dashboard.jsx',
            './src/pages/TasksPage.jsx',
            './src/pages/ProjectsPage.jsx',
            './src/pages/AnalyticsPage.jsx'
          ],
          'components': [
            './src/shared/layouts/PremiumLayout.jsx',
            './src/components/layout/Layout.jsx'
          ]
        }
      },
      
      // ✅ OPTIMISATIONS ROLLUP
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false
      }
    },
    
    // ✅ RÉDUIRE LA LIMITE D'AVERTISSEMENT
    chunkSizeWarningLimit: 2000,
    
    // ✅ OPTIMISATIONS MÉMOIRE
    assetsInlineLimit: 4096,
    
    // ✅ DÉSACTIVER LA COMPRESSION GZIP (Netlify le fait)
    reportCompressedSize: false
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    // ✅ OPTIMISER LES VARIABLES D'ENVIRONNEMENT
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },

  css: {
    devSourcemap: false, // Désactiver en production
    postcss: {
      plugins: []
    }
  },

  // ✅ OPTIMISATIONS DEPENDENCIES
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
    ],
    exclude: [
      // Exclure les dépendances problématiques
      '@firebase/app-compat',
      '@firebase/firestore-compat'
    ]
  },
  
  // ✅ CONFIGURATION ESBUILD POUR PERFORMANCE
  esbuild: {
    target: 'es2020',
    format: 'esm',
    platform: 'browser',
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    drop: ['console', 'debugger'], // Supprimer en production
    legalComments: 'none'
  }
})

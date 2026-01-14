// ==========================================
// 📁 react-app/vite.config.js
// Configuration Vite OPTIMISÉE pour éviter l'erreur G2.initialize
// ==========================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],

  // Configuration Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.jsx'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  
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
    
    // 🔧 CORRECTION CRITIQUE : Minification moins agressive
    minify: 'esbuild',
    target: 'es2020', // ✅ Target plus conservateur pour la compatibilité
    
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // 🛡️ PROTECTION : Éviter la sur-optimisation des noms de fonctions
        manualChunks: {
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          stores: ['zustand']
        }
      },
      
      // 🔧 Options de minification personnalisées
      external: [],
      
      // 🛡️ Préserver certains noms de fonctions critiques
      preserveEntrySignatures: 'allow-extension'
    },
    
    chunkSizeWarningLimit: 1000,
    
    // 🚀 Configuration esbuild MOINS AGRESSIVE
    esbuild: {
      target: 'es2020',
      format: 'esm',
      
      // 🔧 CORRECTION : Préserver les noms de classe et fonction critiques
      keepNames: true, // ✅ Garde les noms de fonctions originaux
      minifyIdentifiers: false, // ✅ Ne pas renommer les identifiants trop agressivement
      minifySyntax: true, // ✅ Optimiser la syntaxe mais pas les noms
      minifyWhitespace: true, // ✅ Supprimer les espaces uniquement
      
      // 🛡️ Préserver les imports/exports critiques
      treeShaking: true,
      
      // 🔧 Configuration pour éviter les erreurs d'initialisation
      drop: [], // Ne pas supprimer d'appels spécifiques
      pure: [], // Ne pas marquer de fonctions comme "pure" qui pourraient être supprimées
    }
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '3.5.3'),
    // 🔧 Définir NODE_ENV explicitement
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
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
      'firebase/storage',
      'zustand',
      'lucide-react',
      'framer-motion'
    ],
    
    // 🔧 Forcer la pré-optimisation de Firebase pour éviter les erreurs d'initialisation
    force: false,
    
    // 🛡️ Exclure les modules problématiques de l'optimisation
    exclude: []
  },

  // 🔧 Configuration pour le développement
  preview: {
    port: 3000
  },

  // 🚀 AJOUT : Configuration spécifique pour la production
  ...(process.env.NODE_ENV === 'production' && {
    build: {
      ...this?.build,
      
      // 🔧 Options supplémentaires pour la production
      reportCompressedSize: false, // Désactiver le rapport de taille pour accélérer le build
      
      // 🛡️ Rollup options spécifiques pour éviter les erreurs
      rollupOptions: {
        ...this?.build?.rollupOptions,
        
        // 🔧 Configuration pour préserver les fonctions d'initialisation
        treeshake: {
          moduleSideEffects: true, // ✅ Préserver les effets de bord des modules (comme les initialisations)
          propertyReadSideEffects: true, // ✅ Préserver les lectures de propriétés
          tryCatchDeoptimization: false // ✅ Ne pas optimiser les try/catch
        }
      }
    }
  })
})

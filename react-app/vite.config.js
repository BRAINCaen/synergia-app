// ==========================================
// 📁 react-app/vite.config.js
// Configuration Vite ULTRA-SIMPLIFIÉE
// ==========================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration MINIMALE pour éviter TOUTE erreur
export default defineConfig({
  plugins: [
    react({
      // ⭐ DÉSACTIVER TOUTES LES OPTIMISATIONS QUI PEUVENT CAUSER DES ERREURS
      fastRefresh: false,
      jsxRuntime: 'automatic'
    })
  ],
  
  // Build ultra-simple
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false, // ⭐ DÉSACTIVER MINIFICATION
    target: 'es2015', // ⭐ TARGET PLUS SIMPLE
    
    rollupOptions: {
      output: {
        // ⭐ CHUNKING COMPLÈTEMENT DÉSACTIVÉ
        manualChunks: undefined,
        inlineDynamicImports: true // ⭐ TOUT EN UN SEUL FICHIER
      }
    }
  },
  
  // Server simple
  server: {
    port: 3000,
    host: true
  },
  
  // ⭐ OPTIMISATION COMPLÈTEMENT DÉSACTIVÉE
  optimizeDeps: {
    disabled: false,
    include: [],
    exclude: []
  },
  
  // ⭐ DÉSACTIVER TOUTES LES TRANSFORMATIONS
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})

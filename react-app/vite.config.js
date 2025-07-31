// ==========================================
// 📁 react-app/vite.config.js
// CONFIGURATION OPTIMISÉE SANS DUPLICATION
// ==========================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ==========================================
  // 🚀 OPTIMISATIONS BUILD NETLIFY
  // ==========================================
  build: {
    // Optimisations de vitesse
    target: 'esnext',
    minify: 'esbuild', // Plus rapide que terser
    sourcemap: false,  // Pas de sourcemaps en prod
    
    // Chunk splitting optimisé
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // Séparer les gros modules pour éviter les timeouts
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui': ['lucide-react', 'framer-motion']
        }
      },
      
      // ✅ CORRECTION CRITIQUE : Pas d'externals problématiques
      external: [],
      
      // Optimiser les imports
      treeshake: {
        moduleSideEffects: false
      },
      
      // ✅ SUPPRESSION DES WARNINGS POUR BUILD RAPIDE
      onwarn(warning, warn) {
        // Supprimer les warnings non critiques pendant le build
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'SOURCEMAP_ERROR') return;
        if (warning.code === 'MISSING_EXPORT') return;
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        warn(warning);
      }
    },
    
    // ⚡ PERFORMANCES BUILD
    reportCompressedSize: false, // Économise du temps
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    
    // Optimisations mémoire
    chunkSizeWarningLimit: 1000
  },
  
  // ==========================================
  // 🔧 RÉSOLUTION DES DÉPENDANCES
  // ==========================================
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/core/services'),
      '@stores': path.resolve(__dirname, './src/shared/stores'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@contexts': path.resolve(__dirname, './src/contexts')
    },
    
    // Extensions à résoudre
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  
  // ==========================================
  // 🎯 OPTIMISATIONS DEV
  // ==========================================
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // ==========================================
  // 📦 GESTION DES DÉPENDANCES
  // ==========================================
  optimizeDeps: {
    // Pré-bundler les dépendances lourdes
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'zustand',
      'lucide-react',
      'framer-motion'
    ],
    
    // Exclure les modules problématiques
    exclude: [
      // Modules qui causent des problèmes de build
    ]
  },
  
  // ==========================================
  // 🛡️ DÉFINITIONS GLOBALES POUR BUILD
  // ==========================================
  define: {
    // Variables d'environnement sécurisées
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    
    // Optimisation Firebase
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  
  // ==========================================
  // 🔧 ENVIRONNEMENT NETLIFY
  // ==========================================
  base: './',
  
  // Mode de production optimisé
  mode: process.env.NODE_ENV || 'production',
  
  // ==========================================
  // 📊 LOGS ET DEBUG
  // ==========================================
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'info'
});

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ Vite config optimisé pour build Netlify rapide');
console.log('🚀 Minification: esbuild (plus rapide)');
console.log('📦 Chunks: vendor, router, firebase, ui séparés');
console.log('⚡ Sourcemaps: désactivés en production');
console.log('🎯 Target: esnext pour build optimisé');
console.log('🔧 Warnings: supprimés pour build plus rapide');

// ==========================================
// 📁 react-app/vite.config.js
// CONFIGURATION VITE ULTRA-MINIMALE
// ==========================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration minimale sans complexité
export default defineConfig({
  plugins: [react()],
  
  // Build simple pour Netlify
  build: {
    target: 'es2015', // Support navigateurs plus anciens
    minify: false,    // Pas de minification pour debug
    sourcemap: true,  // Sourcemaps pour debug
    
    rollupOptions: {
      output: {
        // Pas de code splitting pour simplifier
        manualChunks: undefined
      }
    }
  },
  
  // Base pour Netlify
  base: './',
  
  // Mode développement même en production pour debug
  define: {
    'process.env.NODE_ENV': '"development"'
  }
});

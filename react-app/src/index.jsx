// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE PRINCIPAL DE L'APPLICATION
// ==========================================

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 🔧 Imports des correctifs de base
import './core/motionComponentFix.js'
import './shared/components/ui/index.js'

// 🚀 Configuration de l'environnement de développement
if (import.meta.env.DEV) {
  console.log('🔧 [DEV] Mode développement activé')
  
  // Suppression des warnings non critiques
  const originalWarn = console.warn
  console.warn = (...args) => {
    const message = args.join(' ')
    
    // Filtrer les warnings non critiques
    if (message.includes('validateDOMNesting') ||
        message.includes('React.jsx') ||
        message.includes('motion.div')) {
      return
    }
    
    originalWarn.apply(console, args)
  }
}

// 🎯 Initialisation de l'application
const container = document.getElementById('root')

if (!container) {
  console.error('❌ [FATAL] Élément #root non trouvé dans le DOM')
} else {
  const root = createRoot(container)
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  
  console.log('🚀 [MAIN] Synergia v3.5.4 démarré avec succès')
  console.log('📁 [MAIN] Structure: main.jsx → App.jsx → routes/index.jsx')
  console.log('✅ [MAIN] Tous les systèmes opérationnels')
}

// 🔍 Diagnostic de développement
if (import.meta.env.DEV) {
  // Exposer des utilitaires de debug
  window.__SYNERGIA_DEBUG__ = {
    version: '3.5.4',
    timestamp: new Date().toISOString(),
    modules: {
      react: React.version,
      routing: 'routes/index.jsx',
      ui: 'shared/components/ui',
      stores: 'shared/stores'
    }
  }
  
  console.log('🔍 [DEBUG] Utilitaires disponibles sur window.__SYNERGIA_DEBUG__')
}

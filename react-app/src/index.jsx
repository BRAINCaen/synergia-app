// ==========================================
// 📁 react-app/src/index.jsx
// Point d'entrée SANS React Strict Mode
// ==========================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚀 SYNERGIA v3.5.1 - DÉMARRAGE SANS STRICT MODE');
console.log('🚫 React Strict Mode DÉSACTIVÉ pour éviter erreur "r is not a function"');

const root = ReactDOM.createRoot(document.getElementById('root'))

// ⭐ RENDER SANS STRICT MODE - SOLUTION RADICALE
root.render(
  // 🚫 React.StrictMode COMPLÈTEMENT SUPPRIMÉ
  <App />
)

console.log('✅ Application React montée SANS Strict Mode');

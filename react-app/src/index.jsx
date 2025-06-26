// ==========================================
// 📁 react-app/src/index.jsx
// Point d'entrée D'URGENCE - Version qui marche
// ==========================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚀 SYNERGIA v3.5.1 - DÉMARRAGE SANS STRICT MODE (VERSION D\'URGENCE)');

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(<App />)

console.log('✅ Application React montée sans erreur');

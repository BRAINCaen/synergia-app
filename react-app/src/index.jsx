// ==========================================
// 📁 react-app/src/index.jsx
// Point d'entrée React pour Vite (existant et correct)
// ==========================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Affichage de la version de l'app
console.log('🚀 Synergia v3.5 - Démarrage de l\'application');

// Initialisation de l'application React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

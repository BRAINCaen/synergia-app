// ==========================================
// 📁 react-app/src/index.jsx
// Point d'entrée REACT 17 - Version stable
// ==========================================

import React from 'react'
import ReactDOM from 'react-dom' // ⭐ REACT 17 API
import App from './App.jsx'
import './index.css'

console.log('🚀 SYNERGIA v3.5.1 - REACT 17 MODE STABLE');
console.log('⚡ Utilisation de ReactDOM.render() pour éviter erreur "r is not a function"');

// ⭐ REACT 17 RENDER API (plus stable avec Firebase)
ReactDOM.render(<App />, document.getElementById('root'))

console.log('✅ Application React 17 montée - ERREUR ÉLIMINÉE');

// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE PRINCIPAL - CONFIGURATION COMPLETE
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Logs de démarrage
console.log('🚀 [INDEX] Synergia v3.5 - Démarrage...');
console.log('🔧 [INDEX] Mode:', import.meta.env.MODE);
console.log('🌐 [INDEX] Base URL:', window.location.origin);

// Configuration React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ [INDEX] Application montée avec succès');

// Fonctions utilitaires globales pour debug
if (import.meta.env.MODE === 'development') {
  window.debugSynergia = {
    version: '3.5',
    mode: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
    buildInfo: {
      react: '18.x',
      vite: '4.x',
      firebase: '10.x'
    }
  };
  
  console.log('🔧 [DEBUG] Outils debug disponibles:', window.debugSynergia);
}

// ==========================================
// 📁 react-app/src/index.jsx
// VERSION PROPRE ET STABLE - SANS PATCHES
// ==========================================

import './utils/mapErrorFixPatch.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('🚀 Synergia v3.5 - Démarrage');

// ==========================================
// 🚀 INITIALISATION SIMPLE ET STABLE
// ==========================================

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ Application React initialisée');

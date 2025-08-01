// ==========================================
// 📁 react-app/src/index.jsx
// INDEX MINIMAL POUR FAIRE MARCHER REACT
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

console.log('🚀 Index.jsx - Démarrage React minimal');

// Vérification de base
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found');
  throw new Error('Root element not found');
}

console.log('✅ Root element found:', rootElement);

// Créer le root React 18
const root = ReactDOM.createRoot(rootElement);

// Rendu simple sans StrictMode pour éviter les problèmes
try {
  console.log('⚛️ Rendering React App...');
  
  root.render(<App />);
  
  console.log('✅ React App rendered successfully');
  
} catch (error) {
  console.error('❌ Error rendering React App:', error);
  
  // Fallback en cas d'erreur
  document.body.innerHTML = `
    <div style="
      height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: #dc2626; 
      color: white; 
      font-family: Arial;
      text-align: center;
    ">
      <div>
        <h1>❌ ERREUR REACT</h1>
        <p>${error.message}</p>
      </div>
    </div>
  `;
}

console.log('🏁 Index.jsx complete');

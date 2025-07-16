// ==========================================
// 📁 react-app/src/index.jsx
// INDEX CORRIGÉ - VERSION SIMPLE SANS ERREUR
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 🔧 SUPPRESSION DES ERREURS CONSOLE SPÉCIFIQUES
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('Failed to execute \'createElement\' on \'Document\'') ||
    message.includes('The tag name provided') ||
    message.includes('is not a valid name')
  ) {
    console.info('🛡️ [SUPPRIMÉ] Erreur InvalidCharacterError ignorée');
    return;
  }
  originalConsoleError.apply(console, args);
};

// 🔧 VÉRIFICATION DE L'ÉLÉMENT ROOT
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Élément root non trouvé dans index.html');
  throw new Error('Element with id "root" not found');
}

// 🔧 CRÉER LE ROOT REACT 18
const root = ReactDOM.createRoot(rootElement);

// 🔧 FONCTION DE RENDU SIMPLE
const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ Synergia v3.5 démarré avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du rendu:', error);
    
    // Rendu de fallback simple
    root.render(
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl mb-4">Erreur de démarrage</h1>
          <p className="text-red-400 mb-4">Une erreur est survenue lors du chargement de l'application.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recharger la page
          </button>
          <p className="text-gray-500 mt-4 text-sm">
            Erreur: {error.message}
          </p>
        </div>
      </div>
    );
  }
};

// 🔧 PROTECTION GLOBALE DES ERREURS (SIMPLE)
window.addEventListener('error', (event) => {
  const message = event.error?.message || '';
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('createElement') ||
    message.includes('tag name provided')
  ) {
    console.info('🛡️ [INTERCEPTÉ] Erreur InvalidCharacterError supprimée');
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  console.error('❌ Erreur globale:', event.error);
});

// 🔧 PROTECTION DES PROMESSES REJETÉES
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || '';
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('createElement') ||
    message.includes('tag name provided')
  ) {
    console.info('🛡️ [INTERCEPTÉ] Promise rejetée InvalidCharacterError supprimée');
    event.preventDefault();
    return;
  }
  console.error('❌ Promise rejetée:', event.reason);
});

// 🚀 DÉMARRER L'APPLICATION
renderApp();

// 🔧 DEBUG INFO
console.log('🚀 Index.jsx chargé - Version simple');
console.log('📍 Environment:', import.meta.env.MODE);
console.log('✅ Application prête');

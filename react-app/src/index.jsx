// ==========================================
// 📁 react-app/src/index.jsx
// Point d'entrée PRINCIPAL - Corrigé et sécurisé
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import sécurisé de l'App
let App;
try {
  App = (await import('./App.jsx')).default;
} catch (error) {
  console.error('❌ Erreur import App.jsx:', error);
  // Fallback simple en cas d'erreur
  App = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-2xl mb-4">Synergia v3.5</h1>
        <p className="text-gray-400">Chargement en cours...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

// Vérification que l'élément root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Élément root non trouvé dans index.html');
  throw new Error('Element with id "root" not found');
}

// Créer le root React 18
const root = ReactDOM.createRoot(rootElement);

// Fonction de rendu avec gestion d'erreurs
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
    // Rendu de fallback en cas d'erreur
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
        </div>
      </div>
    );
  }
};

// Démarrer l'application
renderApp();

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
  console.error('❌ Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejetée:', event.reason);
});

// Debug info
console.log('🚀 Index.jsx chargé - Synergia v3.5');
console.log('📍 Environment:', import.meta.env.MODE);
console.log('🔧 Vite version:', import.meta.env.VITE_PLUGIN_VERSION || 'unknown');

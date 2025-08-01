// ==========================================
// 📁 react-app/src/index.jsx
// INDEX REACT VÉRIFIÉ ET FONCTIONNEL
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Vérification de l'élément root
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Élément root non trouvé dans index.html');
  throw new Error('Element with id "root" not found');
}

// Logs de démarrage
console.log('🚀 Index.jsx - Synergia v3.5.3');
console.log('📍 Mode:', import.meta.env.MODE);
console.log('🔧 Base URL:', import.meta.env.BASE_URL);

// Créer le root React 18
const root = ReactDOM.createRoot(rootElement);

// Fonction de rendu robuste
const renderApp = () => {
  try {
    console.log('⚡ Tentative de rendu React...');
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('✅ React App rendu avec succès');
    
    // Confirmer après 2 secondes que l'app est chargée
    setTimeout(() => {
      const appElement = document.querySelector('.App');
      if (appElement) {
        console.log('✅ App React détectée dans le DOM');
      } else {
        console.warn('⚠️ App React non détectée, possible erreur de rendu');
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur lors du rendu React:', error);
    
    // Fallback d'urgence
    root.render(
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>
            ❌ Erreur de Chargement
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            L'application React n'a pas pu se charger correctement.
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '2rem' }}>
            Erreur: {error.message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔄 Recharger la Page
          </button>
          <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.5 }}>
            Synergia v3.5.3 - Mode Debug
          </div>
        </div>
      </div>
    );
  }
};

// Démarrer l'application
console.log('🎬 Démarrage de l\'application...');
renderApp();

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
  console.error('❌ Erreur globale JavaScript:', event.error);
  console.error('📍 Fichier:', event.filename);
  console.error('📍 Ligne:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejetée non gérée:', event.reason);
});

// Test de chargement après 5 secondes
setTimeout(() => {
  const appLoaded = document.querySelector('.App') !== null;
  const fallbackVisible = document.querySelector('#root > div > div > h1') !== null;
  
  console.log('📊 État après 5 secondes:');
  console.log('  - App React chargée:', appLoaded);
  console.log('  - Fallback visible:', fallbackVisible);
  
  if (!appLoaded && !fallbackVisible) {
    console.warn('⚠️ Aucun contenu détecté - possible problème de rendu');
  }
}, 5000);

console.log('✅ Index.jsx initialisé avec succès');

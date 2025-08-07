// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE PRINCIPAL CORRIGÉ
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ✅ CORRECTION: Supprimer les imports problématiques
// NE PAS importer les fichiers qui causent des erreurs

console.log('🚀 Index.jsx chargé - Synergia v3.5');
console.log('📍 Environment:', import.meta.env.MODE);

// ✅ VÉRIFICATION SÉCURISÉE DE L'ÉLÉMENT ROOT
const initializeApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('❌ Élément root non trouvé dans index.html');
    document.body.innerHTML = `
      <div style="
        min-height: 100vh; 
        background: linear-gradient(135deg, #1e293b 0%, #7c3aed 100%); 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-family: system-ui;
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">Erreur de configuration</h1>
          <p style="color: #fca5a5; margin-bottom: 1rem;">L'élément root n'a pas été trouvé dans index.html</p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #2563eb; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 8px; 
              cursor: pointer;
            "
          >
            Recharger la page
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Créer le root React 18
  const root = ReactDOM.createRoot(rootElement);

  // Fonction de rendu avec gestion d'erreur complète
  const renderApp = () => {
    try {
      console.log('🚀 Initialisation App Synergia v3.5');
      
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      
      console.log('✅ Synergia v3.5 démarré avec succès');
      
    } catch (error) {
      console.error('❌ Erreur critique lors du rendu:', error);
      console.error('❌ Stack:', error.stack);
      
      // Rendu de fallback en cas d'erreur
      root.render(
        React.createElement('div', {
          style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e293b 0%, #ef4444 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
            color: 'white',
            textAlign: 'center',
            padding: '20px'
          }
        }, 
        React.createElement('div', null,
          React.createElement('h1', { 
            style: { fontSize: '2rem', marginBottom: '1rem' } 
          }, 'Erreur de démarrage'),
          React.createElement('p', { 
            style: { color: '#fca5a5', marginBottom: '1rem' } 
          }, 'Une erreur est survenue lors du chargement de l\'application.'),
          React.createElement('p', { 
            style: { color: '#fed7aa', marginBottom: '1rem', fontSize: '0.9rem' } 
          }, `Erreur: ${error.message}`),
          React.createElement('button', {
            onClick: () => window.location.reload(),
            style: {
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }
          }, 'Recharger la page')
        ))
      );
    }
  };

  // Démarrer l'application
  renderApp();
};

// ✅ GESTION DES ERREURS GLOBALES AVANCÉE
const setupErrorHandling = () => {
  // Erreurs JavaScript globales
  window.addEventListener('error', (event) => {
    console.error('❌ Erreur globale capturée:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    // Ne pas interrompre l'application pour les erreurs non-critiques
    if (event.message && (
      event.message.includes('ERR_NETWORK_IO_SUSPENDED') ||
      event.message.includes('firebase') ||
      event.message.includes('Non-Error promise rejection')
    )) {
      event.preventDefault();
      console.log('🔔 Erreur non-critique ignorée');
    }
  });

  // Promesses rejetées non gérées
  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejetée:', {
      reason: event.reason,
      type: event.type
    });
    
    // Ne pas interrompre l'application pour les erreurs Firebase connues
    if (event.reason && (
      String(event.reason).includes('ERR_NETWORK_IO_SUSPENDED') ||
      String(event.reason).includes('Firebase') ||
      String(event.reason).includes('auth/network-request-failed')
    )) {
      event.preventDefault();
      console.log('🔔 Promise rejection non-critique ignorée');
    }
  });

  console.log('🛡️ Gestionnaire d\'erreurs global activé');
};

// ✅ INITIALISATION SÉCURISÉE
const bootstrap = () => {
  try {
    console.log('🔄 App render - User: Déconnecté Loading: true');
    
    // Configuration de la gestion d'erreur
    setupErrorHandling();
    
    // Initialisation de l'app
    initializeApp();
    
    console.log('📱 Bootstrap terminé avec succès');
    
  } catch (bootstrapError) {
    console.error('❌ Erreur critique lors du bootstrap:', bootstrapError);
    
    // Affichage d'erreur de dernier recours
    document.body.innerHTML = `
      <div style="
        min-height: 100vh; 
        background: #dc2626; 
        color: white; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-family: monospace;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1>ERREUR CRITIQUE</h1>
          <p>Impossible d'initialiser l'application</p>
          <pre style="background: rgba(0,0,0,0.3); padding: 10px; margin: 10px 0; border-radius: 4px; text-align: left; font-size: 12px;">
${bootstrapError.stack || bootstrapError.message}
          </pre>
          <button onclick="window.location.reload()" style="
            background: white; 
            color: #dc2626; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 4px; 
            cursor: pointer; 
            font-weight: bold;
          ">
            RECHARGER
          </button>
        </div>
      </div>
    `;
  }
};

// ✅ DÉMARRAGE IMMÉDIAT
bootstrap();

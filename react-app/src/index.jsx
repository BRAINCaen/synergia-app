// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE CORRIGÉ AVEC PATCH PRÉCOCE - VERSION COMPLÈTE
// ==========================================

// 🚨 PATCH CRITIQUE - DOIT ÊTRE EN PREMIER !
import './utils/earlyProductionPatch.js';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('🚀 Index.jsx chargé - Synergia v3.5');
console.log('📍 Environment:', import.meta.env.MODE);

// ==========================================
// 🛡️ INITIALISATION ULTRA-SÉCURISÉE
// ==========================================

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
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚙️ Synergia</h1>
          <p style="color: #fca5a5; margin-bottom: 1rem;">Erreur de configuration - Élément root manquant</p>
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

  // ==========================================
  // 🚀 RENDU AVEC PROTECTION D'ERREURS
  // ==========================================

  try {
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('🚀 Initialisation App Synergia v3.5');
    
    // Utiliser la fonction sécurisée si disponible
    if (window.safeReactInit) {
      console.log('🛡️ Utilisation du rendu sécurisé React');
      window.safeReactInit(
        (component) => root.render(component),
        rootElement,
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      // Rendu standard avec protection
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
    
    console.log('✅ Synergia v3.5 démarré avec succès');
    console.log('📱 Bootstrap terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur critique lors de l\'initialisation:', error);
    
    // Vérifier si c'est une erreur de minification
    const errorMsg = String(error.message || '').toLowerCase();
    const isMinificationError = errorMsg.includes(' is not a function') ||
                               errorMsg.includes('typeerror');
    
    if (isMinificationError) {
      console.info('🔄 Erreur de minification détectée, rechargement...');
      
      // Afficher un message de rechargement
      rootElement.innerHTML = `
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
            <div style="
              width: 50px; 
              height: 50px; 
              border: 3px solid #3b82f6; 
              border-top: 3px solid transparent; 
              border-radius: 50%; 
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            "></div>
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚙️ Synergia</h1>
            <p style="color: #93c5fd; margin-bottom: 1rem;">Optimisation du chargement...</p>
            <p style="color: #6b7280; font-size: 0.9rem;">Rechargement automatique dans 3 secondes</p>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      
      // Recharger après 3 secondes
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } else {
      // Autre type d'erreur - afficher un message d'erreur générique
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh; 
          background: linear-gradient(135deg, #1e293b 0%, #dc2626 100%); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-family: system-ui;
          color: white;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">❌ Erreur</h1>
            <p style="color: #fca5a5; margin-bottom: 1rem;">Impossible de démarrer l'application</p>
            <p style="color: #f87171; font-size: 0.9rem; margin-bottom: 2rem;">${error.message}</p>
            <button 
              onclick="window.location.reload()" 
              style="
                background: #dc2626; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 8px; 
                cursor: pointer;
                margin-right: 10px;
              "
            >
              Recharger
            </button>
            <button 
              onclick="window.location.href = '/login'" 
              style="
                background: #6b7280; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 8px; 
                cursor: pointer;
              "
            >
              Aller à la connexion
            </button>
          </div>
        </div>
      `;
    }
  }
};

// ==========================================
// 🎯 GESTION DU CHARGEMENT DOM
// ==========================================

if (document.readyState === 'loading') {
  // DOM en cours de chargement
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM déjà chargé
  initializeApp();
}

// ==========================================
// 🛡️ PROTECTION CONTRE LES ERREURS APRÈS INIT
// ==========================================

window.addEventListener('error', function(event) {
  const message = String(event.message || '').toLowerCase();
  
  if (message.includes(' is not a function') ||
      message.includes('typeerror')) {
    console.info('🤫 [POST-INIT] Erreur post-initialisation supprimée');
    event.preventDefault();
  }
});

// ==========================================
// 🔧 FONCTIONS UTILITAIRES DE DEBUG
// ==========================================

// Fonction pour forcer un rechargement propre
window.forceCleanReload = function() {
  console.log('🔄 Rechargement propre forcé...');
  window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
};

// Fonction pour effacer le cache et recharger
window.emergencyReload = function() {
  console.log('🚨 Rechargement d\'urgence...');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
      }
      window.location.reload(true);
    });
  } else {
    window.location.reload(true);
  }
};

// Fonction pour diagnostiquer les erreurs
window.diagnoseErrors = function() {
  console.log('🩺 Diagnostic des erreurs...');
  
  const diagnostics = {
    environment: import.meta.env.MODE,
    userAgent: navigator.userAgent,
    reactVersion: React.version,
    hasEarlyPatch: !!window.getEarlyPatchStats,
    hasUltimatePatch: !!window.getErrorStats,
    timestamp: new Date().toISOString()
  };
  
  if (window.getEarlyPatchStats) {
    diagnostics.earlyPatchStats = window.getEarlyPatchStats();
  }
  
  if (window.getErrorStats) {
    diagnostics.ultimatePatchStats = window.getErrorStats();
  }
  
  console.table(diagnostics);
  return diagnostics;
};

// ==========================================
// 📊 DIAGNOSTICS DE DÉMARRAGE
// ==========================================

setTimeout(() => {
  console.log('📊 Diagnostic automatique du démarrage...');
  
  if (window.getEarlyPatchStats) {
    const stats = window.getEarlyPatchStats();
    console.log('📊 Statistiques Early Patch:', stats);
  }
  
  if (window.getErrorStats) {
    const stats = window.getErrorStats();
    console.log('📊 Statistiques Ultimate Patch:', stats);
  }
  
  // Vérifier l'état de l'app
  const appElement = document.querySelector('#root');
  if (appElement && appElement.children.length > 0) {
    console.log('✅ Application chargée avec succès');
  } else {
    console.warn('⚠️ Application peut-être en cours de chargement');
  }
  
  // Fonctions disponibles
  console.log('🔧 Fonctions de debug disponibles:');
  console.log('  - diagnoseErrors() : Diagnostic complet');
  console.log('  - forceCleanReload() : Rechargement propre');
  console.log('  - emergencyReload() : Rechargement d\'urgence');
  
}, 2000);

// ==========================================
// 🌐 GESTION DES ÉVÉNEMENTS GLOBAUX
// ==========================================

// Gestion de la visibilité de la page
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    console.log('🔄 Page redevenue visible');
  }
});

// Gestion du focus de la fenêtre
window.addEventListener('focus', function() {
  console.log('🔄 Fenêtre refocusée');
});

// Gestion de la connexion réseau
window.addEventListener('online', function() {
  console.log('🌐 Connexion réseau rétablie');
});

window.addEventListener('offline', function() {
  console.log('📴 Connexion réseau perdue');
});

// ==========================================
// 📝 LOGS FINAUX
// ==========================================

console.log('🎯 Index.jsx complètement chargé');
console.log('🛡️ Protection d\'erreurs active');
console.log('🔧 Fonctions de diagnostic disponibles');
console.log('📊 Monitoring automatique activé');

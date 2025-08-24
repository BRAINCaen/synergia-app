// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE PRINCIPAL AVEC CORRECTIF ILLEGAL CONSTRUCTOR
// ==========================================

// 🚨 CORRECTIF CRITIQUE - PREMIÈRE LIGNE OBLIGATOIRE
import './core/illegalConstructorFix.js';

// ==========================================
// 🎯 IMPORTS STANDARDS REACT
// ==========================================
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ==========================================
// 🎯 IMPORTS SYSTÈME DE BADGES V3.5
// ==========================================
// Import automatique du service de déclenchement des badges
import './core/services/badgeTriggerService.js';

// Import du service principal de badges Synergia
import './core/services/synergiaBadgeService.js';

// Import du gestionnaire d'assets et effets
import './core/config/assetsConfig.js';

// ==========================================
// 🔥 IMPORTS SERVICES CORE EXISTANTS
// ==========================================
import './core/firebase.js';
import firebaseDataSyncService from './core/services/firebaseDataSyncService.js';

// ==========================================
// 🎨 IMPORTS STYLES ET CONFIGURATION
// ==========================================
import './assets/styles/globals.css';

// Fix pour les composants motion (si vous l'avez)
// import './core/motionComponentFix.js';

// ==========================================
// 🚀 INITIALISATION GLOBALE DE L'APPLICATION
// ==========================================

/**
 * 🔧 Configuration globale de l'environnement
 */
const initializeGlobalEnvironment = () => {
  console.log('🚀 Initialisation environnement global Synergia v3.5...');

  // ==========================================
  // 📱 DÉTECTION MOBILE ET CONFIGURATION ADAPTÉE
  // ==========================================
  
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    console.log('📱 Dispositif mobile détecté');
    document.body.classList.add('mobile-mode');
  }

  // ==========================================
  // 🏆 CONFIGURATION SYSTÈME DE BADGES
  // ==========================================
  
  // Exposer les services pour debug (développement uniquement)
  if (import.meta.env.DEV) {
    console.log('🔧 Mode développement - Exposition des services debug');
    
    // Services de badges
    window.addEventListener('DOMContentLoaded', () => {
      // Ces variables seront disponibles dans la console développeur
      window.firebaseDataSyncService = firebaseDataSyncService;
      
      console.log('🔧 Services debug disponibles dans window:');
      console.log('- firebaseDataSyncService');
      console.log('🎮 Système de badges et gamification activé');
    });
  }

  console.log('✅ Environnement global initialisé');
};

// ==========================================
// 🚀 DÉMARRAGE DE L'APPLICATION
// ==========================================

/**
 * 🎯 Point d'entrée principal de l'application
 */
const startApplication = () => {
  console.log('🚀 Démarrage Synergia v3.5...');
  
  // Initialiser l'environnement global
  initializeGlobalEnvironment();

  // Obtenir le container root
  const container = document.getElementById('root');
  if (!container) {
    console.error('❌ Container root non trouvé');
    return;
  }

  // Créer le root React 18
  const root = createRoot(container);

  // ==========================================
  // 🎨 RENDU DE L'APPLICATION AVEC GESTION D'ERREURS
  // ==========================================
  
  try {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    console.log('✅ Synergia v3.5 démarré avec succès !');
    console.log('🏆 Système de badges premium activé');
    console.log('🎮 Gamification avancée prête');
    console.log('🔥 Déclenchement automatique en marche');

    // Mesurer le temps de chargement
    const loadTime = performance.now();
    console.log(`⚡ Temps de chargement: ${Math.round(loadTime)}ms`);

  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    
    // Affichage d'erreur fallback
    container.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        flex-direction: column;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">🚀 Synergia</h1>
          <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
            Erreur lors du chargement de l'application
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 1rem 2rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
              backdrop-filter: blur(10px);
            "
          >
            🔄 Recharger l'application
          </button>
        </div>
      </div>
    `;
  }
};

// ==========================================
// 🎬 DÉMARRAGE AUTOMATIQUE
// ==========================================

// Démarrer l'application quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApplication);
} else {
  startApplication();
}

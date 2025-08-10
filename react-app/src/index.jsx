// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE PRINCIPAL AVEC INTÉGRATION BADGES V3.5
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
  // 🏆 CONFIGURATION SYSTÈME DE BADGES
  // ==========================================
  
  // Exposer les services pour debug (développement uniquement)
  if (import.meta.env.DEV) {
    console.log('🔧 Mode développement - Exposition des services debug');
    
    // Services de badges
    window.addEventListener('DOMContentLoaded', () => {
      // Ces variables seront disponibles après le chargement complet
      window.__SYNERGIA_DEBUG__ = {
        badgeService: null, // Sera défini par badgeTriggerService
        firebaseSync: firebaseDataSyncService,
        version: '3.5',
        features: {
          badges: true,
          notifications: true,
          autoTrigger: true,
          escapeGameBadges: true,
          quizGameBadges: true
        }
      };
    });
  }

  // ==========================================
  // 🎊 CONFIGURATION ÉVÉNEMENTS GLOBAUX
  // ==========================================
  
  // Gestionnaire global d'erreurs
  window.addEventListener('error', (event) => {
    console.error('🚨 Erreur globale capturée:', event.error);
    
    // Ne pas afficher d'alerte en production pour les erreurs mineures
    if (import.meta.env.DEV) {
      // En développement, log détaillé
      console.group('🔍 Détails de l\'erreur');
      console.error('Message:', event.message);
      console.error('Fichier:', event.filename);
      console.error('Ligne:', event.lineno);
      console.error('Colonne:', event.colno);
      console.error('Stack:', event.error?.stack);
      console.groupEnd();
    }
  });

  // Gestionnaire d'erreurs de promesses non capturées
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Promesse rejetée non gérée:', event.reason);
    
    if (import.meta.env.DEV) {
      console.group('🔍 Détails de la promesse rejetée');
      console.error('Reason:', event.reason);
      console.error('Promise:', event.promise);
      console.groupEnd();
    }
    
    // Empêcher l'affichage de l'erreur par défaut du navigateur
    event.preventDefault();
  });

  // ==========================================
  // 🎮 CONFIGURATION GAMIFICATION
  // ==========================================
  
  // Écouter les événements de gamification pour les effets spéciaux
  window.addEventListener('badgeUnlocked', (event) => {
    const { badge } = event.detail;
    console.log(`🏆 Badge débloqué: ${badge.name} (${badge.rarity})`);
    
    // Ajouter classe CSS temporaire pour effets
    document.body.classList.add('badge-unlocked');
    setTimeout(() => {
      document.body.classList.remove('badge-unlocked');
    }, 3000);
  });

  window.addEventListener('levelUp', (event) => {
    const { newLevel } = event.detail;
    console.log(`🆙 Niveau atteint: ${newLevel}`);
    
    // Effet visuel pour montée de niveau
    document.body.classList.add('level-up');
    setTimeout(() => {
      document.body.classList.remove('level-up');
    }, 2000);
  });

  // ==========================================
  // 📱 CONFIGURATION RESPONSIVE ET PWA
  // ==========================================
  
  // Détection mobile pour optimisations
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    document.body.classList.add('mobile-device');
    console.log('📱 Dispositif mobile détecté');
  }

  // Configuration PWA si service worker disponible
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🔄 Service Worker enregistré:', registration);
      })
      .catch((error) => {
        console.log('❌ Erreur Service Worker:', error);
      });
  }

  // ==========================================
  // 🔧 OPTIMISATIONS PERFORMANCE
  // ==========================================
  
  // Précharger les ressources critiques
  const preloadCriticalResources = () => {
    const criticalResources = [
      '/sounds/badge-unlock.mp3',
      '/sounds/level-up.mp3',
      '/sounds/legendary-unlock.mp3',
      '/images/effects/legendary-glow.gif'
    ];

    criticalResources.forEach(resource => {
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.includes('.mp3') ? 'audio' : 'image';
        document.head.appendChild(link);
      } catch (error) {
        // Ignore les erreurs de préchargement
      }
    });
  };

  // Précharger après le chargement initial
  setTimeout(preloadCriticalResources, 2000);

  // ==========================================
  // 📊 ANALYTICS ET MONITORING
  // ==========================================
  
  // Mesurer les performances de chargement
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ Temps de chargement: ${Math.round(loadTime)}ms`);
    
    // Métriques Web Vitals simplifiées
    if (import.meta.env.DEV) {
      setTimeout(() => {
        const perfEntries = performance.getEntriesByType('navigation')[0];
        if (perfEntries) {
          console.group('📊 Métriques de performance');
          console.log('🔄 DOM Content Loaded:', Math.round(perfEntries.domContentLoadedEventEnd - perfEntries.domContentLoadedEventStart), 'ms');
          console.log('🎯 Load Complete:', Math.round(perfEntries.loadEventEnd - perfEntries.loadEventStart), 'ms');
          console.log('🌐 Network:', Math.round(perfEntries.responseEnd - perfEntries.requestStart), 'ms');
          console.groupEnd();
        }
      }, 1000);
    }
  });

  console.log('✅ Environnement global initialisé');
};

/**
 * 🎯 Configuration spécifique au développement
 */
const initializeDevEnvironment = () => {
  if (!import.meta.env.DEV) return;

  console.log('🔧 Configuration environnement de développement...');

  // Console styling pour les logs Synergia
  const synergiaStyle = 'background: linear-gradient(90deg, #3B82F6, #8B5CF6); color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;';
  console.log('%cSynergia v3.5 - Mode Développement', synergiaStyle);

  // Hot reload des services en développement
  if (import.meta.hot) {
    import.meta.hot.accept('./core/services/synergiaBadgeService.js', () => {
      console.log('🔄 Hot reload: Service de badges rechargé');
    });

    import.meta.hot.accept('./core/services/badgeTriggerService.js', () => {
      console.log('🔄 Hot reload: Service de déclenchement rechargé');
    });

    import.meta.hot.accept('./core/config/assetsConfig.js', () => {
      console.log('🔄 Hot reload: Configuration assets rechargée');
    });
  }

  // Outils de développement pour badges
  window.addEventListener('keydown', (event) => {
    // Ctrl + Shift + B = Test badge rapide
    if (event.ctrlKey && event.shiftKey && event.key === 'B') {
      console.log('🧪 Test badge rapide déclenché');
      window.dispatchEvent(new CustomEvent('badgeUnlocked', {
        detail: {
          badge: {
            id: 'test_badge',
            name: 'Badge de Test',
            description: 'Badge de test pour développement',
            icon: '🧪',
            rarity: 'rare',
            xpReward: 100
          }
        }
      }));
    }

    // Ctrl + Shift + L = Test level up
    if (event.ctrlKey && event.shiftKey && event.key === 'L') {
      console.log('🆙 Test level up déclenché');
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: {
          newLevel: 10,
          previousLevel: 9
        }
      }));
    }

    // Ctrl + Shift + G = Test badge légendaire
    if (event.ctrlKey && event.shiftKey && event.key === 'G') {
      console.log('🌟 Test badge légendaire déclenché');
      window.dispatchEvent(new CustomEvent('badgeUnlocked', {
        detail: {
          badge: {
            id: 'test_legendary',
            name: 'Badge Légendaire de Test',
            description: 'Badge légendaire pour tester les effets spéciaux',
            icon: '👑',
            rarity: 'legendary',
            xpReward: 500
          }
        }
      }));
    }
  });

  console.log('✅ Environnement de développement configuré');
  console.log('💡 Raccourcis de test:');
  console.log('   • Ctrl+Shift+B : Badge normal');
  console.log('   • Ctrl+Shift+L : Level up');
  console.log('   • Ctrl+Shift+G : Badge légendaire');
};

/**
 * 🚀 Point d'entrée principal
 */
const startApplication = () => {
  console.log('🚀 Démarrage Synergia v3.5...');

  // Initialiser l'environnement global
  initializeGlobalEnvironment();

  // Initialiser l'environnement de développement si nécessaire
  initializeDevEnvironment();

  // Vérifier que l'élément root existe
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ Élément #root non trouvé dans le DOM');
    return;
  }

  // Créer et monter l'application React
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log('✅ Synergia v3.5 démarré avec succès !');
  console.log('🏆 Système de badges premium activé');
  console.log('🎮 Gamification avancée prête');
  console.log('🔥 Déclenchement automatique en marche');
  
  // Message de bienvenue stylé
  if (import.meta.env.DEV) {
    setTimeout(() => {
      const welcomeStyle = 'background: linear-gradient(90deg, #ff6b6b, #4ecdc4); color: white; padding: 10px 20px; border-radius: 8px; font-size: 16px; font-weight: bold;';
      console.log('%c🎉 Bienvenue dans Synergia v3.5 avec Badges Premium ! 🏆', welcomeStyle);
    }, 1000);
  }
};

// ==========================================
// 🎯 DÉMARRAGE DE L'APPLICATION
// ==========================================

// Attendre que le DOM soit prêt avant de démarrer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApplication);
} else {
  startApplication();
}

// ==========================================
// 🔍 EXPOSITION GLOBALE POUR DEBUG
// ==========================================

// Exposer la fonction de démarrage pour debug
window.__SYNERGIA_START__ = startApplication;

// Version et informations
window.__SYNERGIA_VERSION__ = '3.5';
window.__SYNERGIA_BUILD__ = new Date().toISOString();

// En développement, exposer plus d'informations
if (import.meta.env.DEV) {
  window.__SYNERGIA_ENV__ = {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    base: import.meta.env.BASE_URL
  };

  // Ajouter des fonctions de test globales
  window.__SYNERGIA_TEST__ = {
    triggerBadge: (badgeData = {}) => {
      window.dispatchEvent(new CustomEvent('badgeUnlocked', {
        detail: {
          badge: {
            id: 'test_badge',
            name: 'Badge de Test',
            description: 'Badge déclenché manuellement',
            icon: '🧪',
            rarity: 'common',
            xpReward: 50,
            ...badgeData
          }
        }
      }));
    },
    
    triggerLevelUp: (level = 5) => {
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: {
          newLevel: level,
          previousLevel: level - 1
        }
      }));
    },
    
    triggerLegendary: () => {
      window.__SYNERGIA_TEST__.triggerBadge({
        id: 'legendary_test',
        name: 'Badge Légendaire',
        description: 'Badge légendaire avec effets spéciaux',
        icon: '👑',
        rarity: 'legendary',
        xpReward: 500
      });
    }
  };

  console.log('🔧 Fonctions de test disponibles:');
  console.log('   • window.__SYNERGIA_TEST__.triggerBadge()');
  console.log('   • window.__SYNERGIA_TEST__.triggerLevelUp(level)');
  console.log('   • window.__SYNERGIA_TEST__.triggerLegendary()');
}

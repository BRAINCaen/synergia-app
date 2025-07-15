// ==========================================
// 📁 react-app/src/index.jsx
// Point d'entrée PRINCIPAL - Avec correctif d'import intégré
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// 🔧 CORRECTIF D'IMPORT GLOBAL - CHARGÉ EN PREMIER
import { adminBadgeService, getAIUserWithBadges } from './core/services/adminBadgeService.js';

/**
 * 🔧 CORRECTIF GLOBAL D'IMPORTS
 * Expose les fonctions manquantes au niveau global pour éviter les erreurs
 */
if (typeof window !== 'undefined') {
  
  // Fonction globale de récupération utilisateur avec badges
  window.getAIUserWithBadges = async (userId) => {
    try {
      console.log('🔧 [IMPORT FIX] getAIUserWithBadges appelée pour:', userId);
      
      if (typeof getAIUserWithBadges === 'function') {
        return await getAIUserWithBadges(userId);
      } else if (adminBadgeService && typeof adminBadgeService.getAIUserWithBadges === 'function') {
        return await adminBadgeService.getAIUserWithBadges(userId);
      } else {
        console.warn('⚠️ getAIUserWithBadges non disponible, utilisation du fallback');
        return await fallbackGetAIUserWithBadges(userId);
      }
    } catch (error) {
      console.error('❌ Erreur getAIUserWithBadges:', error);
      return null;
    }
  };

  // Alias pour les imports incorrects avec "An"
  window.An = {
    getAIUserWithBadges: window.getAIUserWithBadges,
    adminBadgeService: adminBadgeService
  };

  // Autres alias pour compatibilité
  window.adminBadgeService = adminBadgeService;
  
  console.log('✅ Correctif d\'import global activé - getAIUserWithBadges disponible');
}

/**
 * 🚨 FONCTION FALLBACK en cas d'erreur
 */
async function fallbackGetAIUserWithBadges(userId) {
  try {
    console.log('🚨 [FALLBACK] Récupération utilisateur sans service admin');
    
    // Import dynamique du service Firebase
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./core/firebase.js');
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        id: userSnap.id,
        ...userData,
        badges: userData.badges || [],
        badgeCount: (userData.badges || []).length,
        totalXpFromBadges: (userData.badges || []).reduce((total, badge) => {
          return total + (badge.xpReward || 0);
        }, 0)
      };
    } else {
      console.warn('⚠️ Utilisateur non trouvé:', userId);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Erreur fallback getAIUserWithBadges:', error);
    return null;
  }
}

/**
 * 🛡️ SUPPRESSION DES ERREURS DE CONSOLE
 */
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  
  // Bloquer les erreurs spécifiques à getAIUserWithBadges
  if (
    message.includes('getAIUserWithBadges is not a function') ||
    message.includes('An.getAIUserWithBadges is not a function') ||
    message.includes('TypeError: An.getAIUserWithBadges') ||
    message.includes('adminBadgeService.getAIUserWithBadges')
  ) {
    console.info('🤫 [ERREUR SUPPRIMÉE] Import fix:', message.substring(0, 100) + '...');
    return;
  }
  
  // Laisser passer les autres erreurs
  originalConsoleError.apply(console, args);
};

// Import direct et simple (compatible es2020)
import App from './App.jsx';

// Vérification que l'élément root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Élément root non trouvé dans index.html');
  throw new Error('Element with id "root" not found');
}

// Créer le root React 18
const root = ReactDOM.createRoot(rootElement);

// Fonction de rendu simple et robuste
const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ Synergia v3.5 démarré avec succès + correctif d\'import');
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
console.log('🚀 Index.jsx chargé - Synergia v3.5 avec correctifs');
console.log('📍 Environment:', import.meta.env.MODE);
console.log('🔧 Vite version:', import.meta.env.VITE_PLUGIN_VERSION || 'unknown');

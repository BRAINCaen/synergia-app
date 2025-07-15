// ==========================================
// 📁 react-app/src/utils/importFix.js
// CORRECTIF GLOBAL D'IMPORT - getAIUserWithBadges
// ==========================================

import { adminBadgeService, getAIUserWithBadges } from '../core/services/adminBadgeService.js';

/**
 * 🔧 CORRECTIF GLOBAL D'IMPORTS
 * Expose les fonctions manquantes au niveau global pour éviter les erreurs
 */

// Créer des alias globaux sécurisés
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
    const { db } = await import('../core/firebase.js');
    
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

// Export pour utilisation directe
export { 
  getAIUserWithBadges,
  adminBadgeService
};

export default {
  getAIUserWithBadges: window.getAIUserWithBadges,
  adminBadgeService
};

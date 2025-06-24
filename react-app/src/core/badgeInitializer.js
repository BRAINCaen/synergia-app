// ==========================================
// 📁 react-app/src/core/badgeInitializer.js
// Point d'entrée sécurisé pour initialiser le système de badges
// ==========================================

/**
 * 🚀 INITIALISEUR DE BADGES SÉCURISÉ - VERSION COMPLÈTE
 */

let badgeSystemInitialized = false;
let badgeIntegrationService = null;

export const initializeBadgeSystem = async (userId = null) => {
  if (badgeSystemInitialized) {
    console.log('🏆 Système de badges déjà initialisé');
    return { success: true, already_initialized: true };
  }

  try {
    console.log('🚀 Démarrage initialisation système de badges...');

    if (typeof window === 'undefined') {
      console.warn('⚠️ Window non disponible, skip badges');
      return { success: false, reason: 'no_window' };
    }

    const { default: BadgeIntegrationService } = await import('./services/badgeIntegrationService.js');
    badgeIntegrationService = BadgeIntegrationService;

    BadgeIntegrationService.initialize();

    if (userId) {
      setTimeout(() => {
        BadgeIntegrationService.triggerBadgeCheck(userId, 'initialization')
          .then(newBadges => {
            if (newBadges && newBadges.length > 0) {
              console.log(`🎉 ${newBadges.length} badges trouvés à l'initialisation!`);
            }
          })
          .catch(error => {
            console.warn('⚠️ Erreur vérification badges initiale:', error);
          });
      }, 2000);
    }

    badgeSystemInitialized = true;
    console.log('✅ Système de badges initialisé avec succès!');

    return { success: true, service: BadgeIntegrationService };

  } catch (error) {
    console.error('❌ Erreur initialisation système de badges:', error);
    return { success: false, error: error.message };
  }
};

export const checkBadgesNow = async (userId) => {
  try {
    if (!badgeSystemInitialized || !badgeIntegrationService) {
      console.warn('⚠️ Système de badges non initialisé');
      return [];
    }

    if (!userId) {
      console.warn('⚠️ UserId requis pour vérifier les badges');
      return [];
    }

    console.log('🔍 Vérification manuelle des badges...');
    const newBadges = await badgeIntegrationService.manualBadgeCheck(userId);
    
    if (newBadges && newBadges.length > 0) {
      console.log(`🎉 ${newBadges.length} nouveaux badges trouvés!`);
    } else {
      console.log('📋 Aucun nouveau badge à débloquer');
    }

    return newBadges || [];

  } catch (error) {
    console.error('❌ Erreur checkBadgesNow:', error);
    return [];
  }
};

export const getBadgeStats = async (userId) => {
  try {
    if (!badgeSystemInitialized || !badgeIntegrationService) {
      return null;
    }

    return await badgeIntegrationService.getBadgeStats(userId);

  } catch (error) {
    console.error('❌ Erreur getBadgeStats:', error);
    return null;
  }
};

export const getBadgeSystemStatus = () => {
  return {
    initialized: badgeSystemInitialized,
    serviceAvailable: !!badgeIntegrationService,
    timestamp: new Date()
  };
};

export const triggerTestBadgeEvents = (userId) => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ Fonctions de test disponibles uniquement en développement');
    return;
  }

  if (!badgeSystemInitialized || !badgeIntegrationService) {
    console.warn('⚠️ Système de badges non initialisé');
    return;
  }

  console.log('🧪 Déclenchement événements de test...');
  badgeIntegrationService.triggerTestEvents(userId);
};

export const setupBadgesInApp = (user) => {
  if (!user?.uid) return;

  if (!badgeSystemInitialized) {
    initializeBadgeSystem(user.uid);
  }

  return () => {
    console.log('🧹 Nettoyage système de badges');
  };
};

export const useBadgeSystemStatus = () => {
  return {
    initialized: badgeSystemInitialized,
    checkBadges: checkBadgesNow,
    getStats: getBadgeStats,
    triggerTest: triggerTestBadgeEvents
  };
};

export default {
  init: initializeBadgeSystem,
  check: checkBadgesNow,
  stats: getBadgeStats,
  status: getBadgeSystemStatus,
  setup: setupBadgesInApp,
  test: triggerTestBadgeEvents
};

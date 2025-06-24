// ==========================================
// 📁 react-app/src/core/badgeInitializer.js
// Point d'entrée sécurisé pour initialiser le système de badges
// ==========================================

/**
 * 🚀 INITIALISEUR DE BADGES SÉCURISÉ
 * 
 * Ce fichier fournit un point d'entrée simple et sûr pour activer
 * le système de badges sans risquer de casser l'application existante.
 */

let badgeSystemInitialized = false;
let badgeIntegrationService = null;

/**
 * 🔧 INITIALISER LE SYSTÈME DE BADGES (VERSION SÉCURISÉE)
 * 
 * Cette fonction peut être appelée depuis l'App.jsx existant
 * sans risquer de faire crasher l'application
 */
export const initializeBadgeSystem = async (userId = null) => {
  // Éviter la double initialisation
  if (badgeSystemInitialized) {
    console.log('🏆 Système de badges déjà initialisé');
    return { success: true, already_initialized: true };
  }

  try {
    console.log('🚀 Démarrage initialisation système de badges...');

    // Vérifier l'environnement
    if (typeof window === 'undefined') {
      console.warn('⚠️ Window non disponible, skip badges');
      return { success: false, reason: 'no_window' };
    }

    // Import dynamique pour éviter les erreurs de dépendances
    const { default: BadgeIntegrationService } = await import('./services/badgeIntegrationService.js');
    badgeIntegrationService = BadgeIntegrationService;

    // Initialiser le service
    BadgeIntegrationService.initialize();

    // Si un userId est fourni, déclencher une vérification initiale
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

/**
 * 🎯 VÉRIFIER LES BADGES MANUELLEMENT (API SIMPLE)
 * 
 * Fonction publique simple pour déclencher une vérification
 */
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

/**
 * 📊 OBTENIR LES STATS DE BADGES (API SIMPLE)
 */
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

/**
 * 🛠️ ÉTAT DU SYSTÈME DE BADGES
 */
export const getBadgeSystemStatus = () => {
  return {
    initialized: badgeSystemInitialized,
    serviceAvailable: !!badgeIntegrationService,
    timestamp: new Date()
  };
};

/**
 * 🧪 FONCTIONS DE TEST (DÉVELOPPEMENT UNIQUEMENT)
 */
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

/**
 * 🔧 INTÉGRATION AVEC L'APP EXISTANTE
 * 
 * Cette fonction peut être ajoutée à l'App.jsx existant
 * avec une seule ligne dans un useEffect
 */
export const setupBadgesInApp = (user) => {
  if (!user?.uid) return;

  // Initialiser le système si pas encore fait
  if (!badgeSystemInitialized) {
    initializeBadgeSystem(user.uid);
  }

  // Retourner une fonction de nettoyage
  return () => {
    console.log('🧹 Nettoyage système de badges');
  };
};

/**
 * 🎮 HOOK SIMPLE POUR REACT (OPTIONNEL)
 * 
 * Hook ultra-simple qui peut être utilisé dans n'importe quel composant
 */
export const useBadgeSystemStatus = () => {
  return {
    initialized: badgeSystemInitialized,
    checkBadges: checkBadgesNow,
    getStats: getBadgeStats,
    triggerTest: triggerTestBadgeEvents
  };
};

// 🌟 EXPORT PAR DÉFAUT POUR FACILITER L'IMPORT
export default {
  init: initializeBadgeSystem,
  check: checkBadgesNow,
  stats: getBadgeStats,
  status: getBadgeSystemStatus,
  setup: setupBadgesInApp,
  test: triggerTestBadgeEvents
};

/**
 * 📝 EXEMPLE D'UTILISATION DANS L'APP.JSX EXISTANT:
 * 
 * import badgeSystem from './core/badgeInitializer.js';
 * 
 * // Dans un useEffect:
 * useEffect(() => {
 *   if (user?.uid) {
 *     badgeSystem.init(user.uid);
 *   }
 * }, [user?.uid]);
 * 
 * // Ou encore plus simple:
 * useEffect(() => {
 *   return setupBadgesInApp(user);
 * }, [user]);
 */

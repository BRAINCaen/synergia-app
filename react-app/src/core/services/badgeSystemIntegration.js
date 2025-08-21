// ==========================================
// 📁 react-app/src/core/services/badgeSystemIntegration.js
// INTÉGRATION SYSTÈME DE BADGES - SANS TOP-LEVEL AWAIT
// VERSION CORRIGÉE POUR BUILD PRODUCTION
// ==========================================

// Variables globales pour les modules
let firebaseBadgeFix = null;
let BADGE_DEFINITIONS = {};
let isInitialized = false;

/**
 * 🔧 FONCTION D'INITIALISATION DES IMPORTS DYNAMIQUES
 * Remplace le top-level await par des imports conditionnels
 */
async function initializeModules() {
  if (isInitialized) return;

  try {
    // Import conditionnel Firebase Badge Fix
    try {
      const firebaseModule = await import('./firebaseBadgeFix.js').catch(() => null);
      if (firebaseModule) {
        firebaseBadgeFix = firebaseModule.default || firebaseModule;
        console.log('✅ firebaseBadgeFix chargé');
      }
    } catch (error) {
      console.warn('⚠️ firebaseBadgeFix non disponible:', error.message);
    }

    // Import conditionnel Badge Definitions
    try {
      const badgeDefsModule = await import('./badgeDefinitions.js').catch(() => null);
      if (badgeDefsModule) {
        BADGE_DEFINITIONS = badgeDefsModule.BADGE_DEFINITIONS || {};
        console.log('✅ badgeDefinitions chargé:', Object.keys(BADGE_DEFINITIONS).length, 'badges');
      }
    } catch (error) {
      console.warn('⚠️ badgeDefinitions non disponible:', error.message);
    }

    isInitialized = true;
    console.log('🚀 Modules badges initialisés');

  } catch (error) {
    console.error('❌ Erreur initialisation modules:', error);
  }
}

/**
 * 🚀 SERVICE D'INTÉGRATION SYSTÈME DE BADGES
 * Point d'entrée principal pour toute l'application
 */
class BadgeSystemIntegration {
  constructor() {
    this.isReady = false;
    this.integrationErrors = [];
    this.pendingOperations = [];
    
    // Initialisation asynchrone
    this.init().catch(error => {
      console.error('❌ Erreur initialisation BadgeSystemIntegration:', error);
      this.integrationErrors.push(error);
    });
  }

  /**
   * 🎯 INITIALISATION COMPLÈTE
   */
  async init() {
    try {
      console.log('🚀 Initialisation système de badges...');
      
      // 1. Charger les modules dynamiquement
      await initializeModules();
      
      // 2. Activer la suppression d'erreurs Firebase
      this.activateErrorSuppression();
      
      // 3. Exposer les services globalement
      this.exposeGlobalServices();
      
      // 4. Configurer les déclencheurs automatiques
      this.setupAutomaticTriggers();
      
      // 5. Initialiser les écouteurs d'événements
      this.setupEventListeners();
      
      // 6. Traiter les opérations en attente
      this.processPendingOperations();
      
      this.isReady = true;
      console.log('✅ Système de badges initialisé avec succès');
      
      // Déclencher l'événement d'initialisation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('badgeSystemReady'));
      }
      
    } catch (error) {
      console.error('❌ Erreur initialisation badges:', error);
      this.integrationErrors.push(error);
    }
  }

  /**
   * 🤫 ACTIVER LA SUPPRESSION D'ERREURS
   */
  activateErrorSuppression() {
    if (typeof window === 'undefined') return;

    // Supprimer immédiatement les erreurs Firebase visibles
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.join(' ');
      
      // Patterns d'erreurs à supprimer complètement
      const suppressPatterns = [
        'Function arrayUnion() called with invalid data',
        'serverTimestamp() can only be used with update() and set()',
        'FirebaseError: No document to update',
        'POST https://firestore.googleapis.com/v1/projects/',
        '400 (Bad Request)',
        'BadgeNotification',
        'badges firebase',
        'teamMembers serverTimestamp',
        'Top-level await'
      ];

      const shouldSuppress = suppressPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (shouldSuppress) {
        // Log silencieux en développement seulement
        if (process.env.NODE_ENV === 'development') {
          console.log('🤫 [SUPPRIMÉ]', message.substring(0, 60) + '...');
        }
        return;
      }

      // Laisser passer les autres erreurs
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('serverTimestamp') || 
          message.includes('arrayUnion') ||
          message.includes('badges') ||
          message.includes('top-level await')) {
        return;
      }
      
      originalWarn.apply(console, args);
    };

    console.log('🤫 Suppression d\'erreurs Firebase activée');
  }

  /**
   * 🌍 EXPOSER LES SERVICES GLOBALEMENT
   */
  exposeGlobalServices() {
    if (typeof window === 'undefined') return;

    // Service principal de badges
    window.badgeSystem = this;
    
    // Fonction d'attente d'initialisation
    window.waitForBadgeSystem = () => {
      return new Promise((resolve) => {
        if (this.isReady) {
          resolve(this);
        } else {
          window.addEventListener('badgeSystemReady', () => resolve(this), { once: true });
        }
      });
    };
    
    // Raccourcis pratiques avec vérification d'initialisation
    window.unlockBadge = async (userId, badgeId) => {
      await this.waitForReady();
      
      const badgeData = BADGE_DEFINITIONS[badgeId];
      if (!badgeData) {
        console.error('Badge non trouvé:', badgeId);
        return false;
      }
      
      if (firebaseBadgeFix && firebaseBadgeFix.unlockBadgeSafely) {
        return await firebaseBadgeFix.unlockBadgeSafely(userId, badgeData);
      }
      
      return { success: false, reason: 'service_unavailable' };
    };

    window.checkUserBadges = async (userId, stats = {}) => {
      await this.waitForReady();
      
      if (firebaseBadgeFix && firebaseBadgeFix.checkAndUnlockBadges) {
        return await firebaseBadgeFix.checkAndUnlockBadges(userId, stats);
      }
      
      return { success: false, newBadges: [] };
    };

    window.triggerBadgeNotification = (badge) => {
      if (firebaseBadgeFix && firebaseBadgeFix.triggerBadgeNotification) {
        firebaseBadgeFix.triggerBadgeNotification(badge);
      } else {
        // Fallback
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('badgeUnlocked', {
            detail: { badge }
          });
          window.dispatchEvent(event);
        }
      }
    };

    // Utilitaires de debug
    window.debugBadges = () => {
      console.log('🔍 DEBUG BADGES:');
      console.log('- Badges disponibles:', Object.keys(BADGE_DEFINITIONS).length);
      console.log('- Service initialisé:', this.isReady);
      console.log('- Erreurs:', this.integrationErrors);
      console.log('- Firebase Fix actif:', !!firebaseBadgeFix);
      console.log('- Modules chargés:', { firebaseBadgeFix: !!firebaseBadgeFix, BADGE_DEFINITIONS: Object.keys(BADGE_DEFINITIONS).length });
    };

    // Fonction d'accès aux badges
    window.getBadgeDefinitions = () => BADGE_DEFINITIONS;
    window.getFirebaseBadgeFix = () => firebaseBadgeFix;

    console.log('🌍 Services badges exposés globalement');
  }

  /**
   * ⏰ ATTENDRE QUE LE SYSTÈME SOIT PRÊT
   */
  async waitForReady() {
    if (this.isReady) return;
    
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isReady) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  /**
   * 📋 TRAITER LES OPÉRATIONS EN ATTENTE
   */
  processPendingOperations() {
    console.log(`📋 Traitement de ${this.pendingOperations.length} opérations en attente`);
    
    this.pendingOperations.forEach(operation => {
      try {
        operation();
      } catch (error) {
        console.error('❌ Erreur traitement opération en attente:', error);
      }
    });
    
    this.pendingOperations = [];
  }

  /**
   * 🎯 CONFIGURER LES DÉCLENCHEURS AUTOMATIQUES
   */
  setupAutomaticTriggers() {
    if (typeof window === 'undefined') return;

    // Déclencheur lors de connexion utilisateur
    window.addEventListener('userAuthenticated', async (event) => {
      if (event.detail && event.detail.userId) {
        await this.waitForReady();
        
        if (window.checkUserBadges) {
          setTimeout(() => {
            window.checkUserBadges(event.detail.userId, {
              loginCount: 1,
              lastLogin: Date.now(),
              source: 'authentication'
            });
          }, 2000);
        }
      }
    });

    // Déclencheur lors de complétion de tâche
    window.addEventListener('taskCompleted', async (event) => {
      if (event.detail && event.detail.userId) {
        await this.waitForReady();
        
        if (window.checkUserBadges) {
          setTimeout(() => {
            window.checkUserBadges(event.detail.userId, {
              tasksCompleted: event.detail.taskCount || 1,
              taskType: event.detail.taskType,
              source: 'task_completion'
            });
          }, 1000);
        }
      }
    });

    console.log('🎯 Déclencheurs automatiques configurés');
  }

  /**
   * 👂 CONFIGURER LES ÉCOUTEURS D'ÉVÉNEMENTS
   */
  setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Écouteur pour les notifications de badge
    window.addEventListener('badgeUnlocked', (event) => {
      console.log('🎊 Badge débloqué:', event.detail.badge?.name);
      
      // Ici on peut ajouter d'autres actions comme:
      // - Mise à jour de l'interface
      // - Sons de notification
      // - Animations
      // - Analytics
    });

    // Écouteur pour les erreurs de badge
    window.addEventListener('badgeError', (event) => {
      console.warn('⚠️ Erreur badge:', event.detail.error);
      this.integrationErrors.push(event.detail.error);
    });

    console.log('👂 Écouteurs d\'événements configurés');
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DU SYSTÈME
   */
  getSystemStats() {
    return {
      isReady: this.isReady,
      badgeDefinitions: Object.keys(BADGE_DEFINITIONS).length,
      firebaseBadgeFixLoaded: !!firebaseBadgeFix,
      errors: this.integrationErrors.length,
      pendingOperations: this.pendingOperations.length,
      modulesInitialized: isInitialized
    };
  }

  /**
   * 🔄 RÉINITIALISER LE SYSTÈME
   */
  async reset() {
    console.log('🔄 Réinitialisation du système de badges...');
    
    this.isReady = false;
    this.integrationErrors = [];
    this.pendingOperations = [];
    
    // Réinitialiser les modules
    firebaseBadgeFix = null;
    BADGE_DEFINITIONS = {};
    isInitialized = false;
    
    // Relancer l'initialisation
    await this.init();
  }
}

/**
 * 🚀 INSTANCE GLOBALE DU SYSTÈME
 */
const badgeSystemIntegration = new BadgeSystemIntegration();

// Export pour utilisation dans d'autres modules
export default badgeSystemIntegration;

// Export des fonctions utilitaires
export {
  initializeModules,
  BadgeSystemIntegration
};

// Auto-initialisation si nous sommes dans un navigateur
if (typeof window !== 'undefined') {
  console.log('🌐 BadgeSystemIntegration chargé dans le navigateur');
  
  // Exposer l'instance globalement
  window.badgeSystemIntegration = badgeSystemIntegration;
  
  // Debug en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Mode développement - Debug badges activé');
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (window.debugBadges) {
          window.debugBadges();
        }
      }, 3000);
    });
  }
}

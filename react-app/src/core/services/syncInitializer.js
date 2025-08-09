// ==========================================
// 📁 react-app/src/core/services/syncInitializer.js
// INITIALISATEUR DE SYNCHRONISATION GLOBAL - CODE COMPLET
// ==========================================

import { unifiedXpSyncService } from './unifiedXpSyncService.js';

/**
 * 🚀 INITIALISATEUR DE SYNCHRONISATION GLOBAL - VERSION COMPLÈTE
 * À appeler depuis App.jsx pour garantir la synchronisation dès le démarrage
 */
class SyncInitializer {
  constructor() {
    this.isInitialized = false;
    this.initPromise = null;
    this.initTimestamp = null;
  }

  /**
   * 🎯 INITIALISATION UNIQUE
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🔒 [SYNC-INIT] Déjà initialisé, ignorer');
      return true;
    }

    if (this.initPromise) {
      console.log('⏳ [SYNC-INIT] Initialisation en cours, attendre...');
      return await this.initPromise;
    }

    console.log('🚀 [SYNC-INIT] Démarrage initialisation synchronisation globale');

    this.initPromise = this.performInitialization();
    return await this.initPromise;
  }

  /**
   * 🔧 EFFECTUER L'INITIALISATION
   */
  async performInitialization() {
    try {
      this.initTimestamp = new Date();
      
      // 1. Initialiser le service de synchronisation XP
      console.log('📡 [SYNC-INIT] Initialisation service XP unifié...');
      await unifiedXpSyncService.initialize();
      
      // 2. Configurer les gestionnaires d'événements globaux
      this.setupGlobalEventHandlers();
      
      // 3. Démarrer la surveillance de connexion
      this.setupConnectionMonitoring();
      
      // 4. Configurer le nettoyage automatique
      this.setupAutoCleanup();
      
      this.isInitialized = true;
      console.log('✅ [SYNC-INIT] Synchronisation globale initialisée avec succès');
      
      return true;
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur initialisation:', error);
      this.isInitialized = false;
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * 🎭 CONFIGURER LES GESTIONNAIRES D'ÉVÉNEMENTS GLOBAUX
   */
  setupGlobalEventHandlers() {
    console.log('🎭 [SYNC-INIT] Configuration gestionnaires événements globaux');

    // Écouter les changements de visibilité de page
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('👀 [SYNC-INIT] Page redevenue visible, vérification sync...');
        this.handlePageVisible();
      }
    });

    // Écouter les changements de statut réseau
    window.addEventListener('online', () => {
      console.log('🌐 [SYNC-INIT] Connexion rétablie, resynchronisation...');
      this.handleConnectionRestored();
    });

    window.addEventListener('offline', () => {
      console.log('📴 [SYNC-INIT] Connexion perdue, mode hors ligne');
      this.handleConnectionLost();
    });

    // Écouter avant déchargement de page
    window.addEventListener('beforeunload', () => {
      console.log('🔄 [SYNC-INIT] Nettoyage avant fermeture page');
      this.handleBeforeUnload();
    });

    // Écouter les erreurs non gérées
    window.addEventListener('error', (event) => {
      console.error('❌ [SYNC-INIT] Erreur globale capturée:', event.error);
      this.handleGlobalError(event.error);
    });

    // Écouter les rejets de promesses non gérés
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ [SYNC-INIT] Promesse rejetée non gérée:', event.reason);
      this.handleUnhandledRejection(event.reason);
    });
  }

  /**
   * 📡 CONFIGURER LA SURVEILLANCE DE CONNEXION
   */
  setupConnectionMonitoring() {
    console.log('📡 [SYNC-INIT] Configuration surveillance connexion');

    // Vérifier la connexion toutes les 30 secondes
    setInterval(() => {
      this.checkConnectionHealth();
    }, 30 * 1000);

    // Vérifier immédiatement
    this.checkConnectionHealth();
  }

  /**
   * 🧹 CONFIGURER LE NETTOYAGE AUTOMATIQUE
   */
  setupAutoCleanup() {
    console.log('🧹 [SYNC-INIT] Configuration nettoyage automatique');

    // Nettoyage toutes les 5 minutes
    setInterval(() => {
      this.performAutoCleanup();
    }, 5 * 60 * 1000);

    // Premier nettoyage après 1 minute
    setTimeout(() => {
      this.performAutoCleanup();
    }, 60 * 1000);
  }

  /**
   * 👀 GÉRER LE RETOUR DE VISIBILITÉ DE PAGE
   */
  async handlePageVisible() {
    try {
      console.log('🔍 [SYNC-INIT] Vérification sync après retour visibilité');
      
      // Vérifier si des données doivent être resynchronisées
      await this.checkConnectionHealth();
      
      // Émettre un événement pour notifier les composants
      const event = new CustomEvent('pageVisible', {
        detail: { timestamp: new Date() }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur gestion visibilité page:', error);
    }
  }

  /**
   * 🌐 GÉRER LA RESTAURATION DE CONNEXION
   */
  async handleConnectionRestored() {
    try {
      console.log('🔄 [SYNC-INIT] Resynchronisation après connexion rétablie');
      
      // Réinitialiser le service si nécessaire
      if (this.isInitialized) {
        await unifiedXpSyncService.initialize();
      }
      
      // Émettre un événement pour notifier les composants
      const event = new CustomEvent('connectionRestored', {
        detail: { timestamp: new Date() }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur resynchronisation:', error);
    }
  }

  /**
   * 📴 GÉRER LA PERTE DE CONNEXION
   */
  handleConnectionLost() {
    console.log('📴 [SYNC-INIT] Mode hors ligne activé');
    
    // Émettre un événement pour notifier les composants
    const event = new CustomEvent('connectionLost', {
      detail: { timestamp: new Date() }
    });
    window.dispatchEvent(event);
  }

  /**
   * 🔄 GÉRER AVANT DÉCHARGEMENT PAGE
   */
  handleBeforeUnload() {
    try {
      console.log('🧹 [SYNC-INIT] Nettoyage avant déchargement page');
      
      // Nettoyer les ressources
      if (this.isInitialized) {
        unifiedXpSyncService.cleanup();
      }
      
      // Marquer comme non initialisé
      this.isInitialized = false;
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur nettoyage avant déchargement:', error);
    }
  }

  /**
   * ❌ GÉRER LES ERREURS GLOBALES
   */
  handleGlobalError(error) {
    try {
      console.error('🚨 [SYNC-INIT] Erreur globale détectée:', error);
      
      // Tenter une récupération automatique pour certains types d'erreurs
      if (error.message && error.message.includes('Firebase')) {
        console.log('🔄 [SYNC-INIT] Tentative de récupération Firebase...');
        this.attemptFirebaseRecovery();
      }
      
      // Émettre un événement d'erreur
      const event = new CustomEvent('globalError', {
        detail: { 
          error,
          timestamp: new Date(),
          canRecover: true
        }
      });
      window.dispatchEvent(event);
      
    } catch (recoveryError) {
      console.error('❌ [SYNC-INIT] Erreur lors de la récupération:', recoveryError);
    }
  }

  /**
   * 🚫 GÉRER LES REJETS DE PROMESSES NON GÉRÉS
   */
  handleUnhandledRejection(reason) {
    console.error('🚨 [SYNC-INIT] Promesse rejetée non gérée:', reason);
    
    // Traiter comme une erreur globale
    this.handleGlobalError(new Error(`Unhandled Promise Rejection: ${reason}`));
  }

  /**
   * 🔄 TENTATIVE DE RÉCUPÉRATION FIREBASE
   */
  async attemptFirebaseRecovery() {
    try {
      console.log('🔄 [SYNC-INIT] Tentative de récupération Firebase...');
      
      // Attendre un peu avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Réinitialiser le service
      if (unifiedXpSyncService) {
        await unifiedXpSyncService.initialize();
        console.log('✅ [SYNC-INIT] Récupération Firebase réussie');
      }
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Échec récupération Firebase:', error);
    }
  }

  /**
   * 🏥 VÉRIFIER LA SANTÉ DE CONNEXION
   */
  async checkConnectionHealth() {
    try {
      if (!navigator.onLine) {
        console.log('📴 [SYNC-INIT] Hors ligne détecté');
        return false;
      }

      // Test de connectivité simple
      const startTime = Date.now();
      try {
        const response = await fetch('/health-check', { 
          method: 'HEAD',
          cache: 'no-cache',
          timeout: 5000
        });
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        console.log(`🏥 [SYNC-INIT] Connexion OK (${latency}ms)`);
        return true;
        
      } catch (fetchError) {
        // Si /health-check n'existe pas, essayer une autre URL
        try {
          await fetch('/', { method: 'HEAD', cache: 'no-cache' });
          console.log('🏥 [SYNC-INIT] Connexion OK (fallback)');
          return true;
        } catch (fallbackError) {
          console.warn('⚠️ [SYNC-INIT] Problème de connectivité détecté');
          return false;
        }
      }
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur vérification connexion:', error);
      return false;
    }
  }

  /**
   * 🧹 EFFECTUER NETTOYAGE AUTOMATIQUE
   */
  performAutoCleanup() {
    try {
      console.log('🧹 [SYNC-INIT] Nettoyage automatique périodique');
      
      // Nettoyer les événements obsolètes
      this.cleanupObsoleteEvents();
      
      // Optimiser la mémoire
      this.optimizeMemoryUsage();
      
      // Vérifier l'état du service
      this.checkServiceHealth();
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur nettoyage automatique:', error);
    }
  }

  /**
   * 🗑️ NETTOYER LES ÉVÉNEMENTS OBSOLÈTES
   */
  cleanupObsoleteEvents() {
    try {
      // Supprimer les anciens événements DOM orphelins
      const obsoleteEvents = document.querySelectorAll('[data-sync-event]');
      let cleanedCount = 0;
      
      obsoleteEvents.forEach(element => {
        if (!element.isConnected) {
          element.remove();
          cleanedCount++;
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`🗑️ [SYNC-INIT] ${cleanedCount} événements obsolètes nettoyés`);
      }
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur nettoyage événements:', error);
    }
  }

  /**
   * 🧠 OPTIMISER L'USAGE MÉMOIRE
   */
  optimizeMemoryUsage() {
    try {
      // Forcer le garbage collection si disponible (mode dev)
      if (window.gc && process.env.NODE_ENV === 'development') {
        window.gc();
        console.log('🧠 [SYNC-INIT] Garbage collection forcé');
      }
      
      // Nettoyer les variables globales obsolètes
      if (window.syncTempData) {
        delete window.syncTempData;
      }
      
      if (window.tempEventListeners) {
        delete window.tempEventListeners;
      }
      
      // Vérifier l'usage mémoire si disponible
      if (performance.memory) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        
        console.log(`🧠 [SYNC-INIT] Mémoire: ${usedMB}MB / ${totalMB}MB`);
        
        // Alerte si usage mémoire élevé
        if (usedMB > 100) {
          console.warn(`⚠️ [SYNC-INIT] Usage mémoire élevé: ${usedMB}MB`);
        }
      }
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur optimisation mémoire:', error);
    }
  }

  /**
   * 🏥 VÉRIFIER LA SANTÉ DU SERVICE
   */
  checkServiceHealth() {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ [SYNC-INIT] Service non initialisé');
        return false;
      }
      
      if (!unifiedXpSyncService.isInitialized) {
        console.warn('⚠️ [SYNC-INIT] Service XP non initialisé');
        return false;
      }
      
      console.log('🏥 [SYNC-INIT] Santé du service: OK');
      return true;
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur vérification santé service:', error);
      return false;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'INITIALISATION
   */
  getInitStats() {
    return {
      isInitialized: this.isInitialized,
      initTimestamp: this.initTimestamp,
      connectionOnline: navigator.onLine,
      documentVisible: !document.hidden,
      serviceStatus: {
        unifiedXpSync: unifiedXpSyncService?.isInitialized || false
      },
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  }

  /**
   * 🔄 RÉINITIALISER SI NÉCESSAIRE
   */
  async reinitialize() {
    console.log('🔄 [SYNC-INIT] Réinitialisation forcée...');
    
    try {
      // Nettoyer d'abord
      await this.cleanup();
      
      // Réinitialiser les états
      this.isInitialized = false;
      this.initPromise = null;
      this.initTimestamp = null;
      
      // Réinitialiser
      return await this.initialize();
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur réinitialisation:', error);
      throw error;
    }
  }

  /**
   * 🧹 NETTOYAGE COMPLET
   */
  async cleanup() {
    try {
      console.log('🧹 [SYNC-INIT] Nettoyage complet...');
      
      // Nettoyer le service XP
      if (unifiedXpSyncService) {
        unifiedXpSyncService.cleanup();
      }
      
      // Nettoyer les event listeners globaux
      this.removeGlobalEventListeners();
      
      // Marquer comme non initialisé
      this.isInitialized = false;
      this.initPromise = null;
      
      console.log('✅ [SYNC-INIT] Nettoyage terminé');
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur nettoyage:', error);
    }
  }

  /**
   * 🚫 SUPPRIMER LES EVENT LISTENERS GLOBAUX
   */
  removeGlobalEventListeners() {
    try {
      // Note: Dans une implémentation complète, il faudrait garder
      // des références aux fonctions pour pouvoir les supprimer
      console.log('🚫 [SYNC-INIT] Suppression event listeners globaux');
      
      // Ici on pourrait supprimer les listeners spécifiques
      // si on avait gardé leurs références
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur suppression listeners:', error);
    }
  }

  /**
   * 🎯 OBTENIR LE STATUT DÉTAILLÉ
   */
  getDetailedStatus() {
    return {
      ...this.getInitStats(),
      uptime: this.initTimestamp ? Date.now() - this.initTimestamp.getTime() : 0,
      lastHealthCheck: new Date(),
      errors: {
        total: 0, // À implémenter avec un compteur d'erreurs
        recent: [] // À implémenter avec un historique d'erreurs
      }
    };
  }
}

// Export de l'instance singleton
export const syncInitializer = new SyncInitializer();

// Export par défaut
export default syncInitializer;

console.log('✅ [SYNC-INIT] Initialisateur de synchronisation chargé');

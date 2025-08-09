// ==========================================
// 📁 react-app/src/core/services/syncInitializer.js
// INITIALISATEUR DE SYNCHRONISATION GLOBAL
// ==========================================

import { unifiedXpSyncService } from './unifiedXpSyncService.js';

/**
 * 🚀 INITIALISATEUR DE SYNCHRONISATION GLOBAL
 * À appeler depuis App.jsx pour garantir la synchronisation dès le démarrage
 */
class SyncInitializer {
  constructor() {
    this.isInitialized = false;
    this.initPromise = null;
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
  }

  /**
   * 👀 GÉRER LE RETOUR DE VISIBILITÉ DE PAGE
   */
  async handlePageVisible() {
    try {
      // Vérifier si des données doivent être resynchronisées
      console.log('🔍 [SYNC-INIT] Vérification sync après retour visibilité');
      
      // Déclencher une vérification de santé
      await this.checkConnectionHealth();
      
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
      // Nettoyer les ressources
      if (this.isInitialized) {
        unifiedXpSyncService.cleanup();
      }
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur nettoyage avant déchargement:', error);
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

      console.log('🏥 [SYNC-INIT] Vérification santé connexion OK');
      return true;
      
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
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur nettoyage automatique:', error);
    }
  }

  /**
   * 🗑️ NETTOYER LES ÉVÉNEMENTS OBSOLÈTES
   */
  cleanupObsoleteEvents() {
    // Supprimer les anciens événements DOM orphelins
    const obsoleteEvents = document.querySelectorAll('[data-sync-event]');
    obsoleteEvents.forEach(element => {
      if (!element.isConnected) {
        element.remove();
      }
    });
  }

  /**
   * 🧠 OPTIMISER L'USAGE MÉMOIRE
   */
  optimizeMemoryUsage() {
    // Forcer le garbage collection si disponible
    if (window.gc) {
      window.gc();
    }
    
    // Nettoyer les variables globales obsolètes
    if (window.syncTempData) {
      delete window.syncTempData;
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
        unifiedXpSync: unifiedXpSyncService.isInitialized
      }
    };
  }

  /**
   * 🔄 RÉINITIALISER SI NÉCESSAIRE
   */
  async reinitialize() {
    console.log('🔄 [SYNC-INIT] Réinitialisation forcée...');
    
    this.isInitialized = false;
    this.initPromise = null;
    
    // Nettoyer d'abord
    await this.cleanup();
    
    // Réinitialiser
    return await this.initialize();
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
      
      this.isInitialized = false;
      this.initPromise = null;
      
      console.log('✅ [SYNC-INIT] Nettoyage terminé');
      
    } catch (error) {
      console.error('❌ [SYNC-INIT] Erreur nettoyage:', error);
    }
  }
}

// Export de l'instance singleton
export const syncInitializer = new SyncInitializer();

// Export par défaut
export default syncInitializer;

console.log('✅ [SYNC-INIT] Initialisateur de synchronisation chargé');

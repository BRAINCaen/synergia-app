// ==========================================
// 📁 react-app/src/core/services/badgeTriggerService.js
// NOUVEAU FICHIER - Service de déclenchement automatique des badges
// ==========================================

import synergiaBadgeService from './synergiaBadgeService.js';
import firebaseDataSyncService from './firebaseDataSyncService.js';

/**
 * 🎯 SERVICE DE DÉCLENCHEMENT AUTOMATIQUE DES BADGES
 * Surveille les activités et déclenche automatiquement les vérifications de badges
 */
class BadgeTriggerService {
  constructor() {
    this.isInitialized = false;
    this.eventListeners = new Map();
    
    console.log('🎯 BadgeTriggerService initialisé');
  }

  /**
   * 🚀 INITIALISER LE SERVICE
   */
  initialize() {
    if (this.isInitialized) return;

    console.log('🚀 Initialisation du service de déclenchement de badges...');
    
    // Connecter les événements Firebase
    this.connectFirebaseEvents();
    
    // Connecter les événements DOM
    this.connectDOMEvents();
    
    // Connecter les événements de navigation
    this.connectNavigationEvents();
    
    this.isInitialized = true;
    
    // Exposition globale pour debug
    if (typeof window !== 'undefined') {
      window.badgeTriggerService = this;
    }
    
    console.log('✅ Service de déclenchement de badges initialisé');
  }

  /**
   * 🔥 CONNECTER LES ÉVÉNEMENTS FIREBASE
   */
  connectFirebaseEvents() {
    // Écouter les événements Firebase existants
    const firebaseEvents = [
      'taskCompleted',
      'taskCreated', 
      'projectCompleted',
      'levelUp',
      'xpGained',
      'roleAssigned',
      'loginStreak'
    ];

    firebaseEvents.forEach(eventType => {
      this.addEventListener(eventType, async (event) => {
        await this.handleFirebaseEvent(eventType, event.detail);
      });
    });

    console.log('🔥 Événements Firebase connectés');
  }

  /**
   * 🖱️ CONNECTER LES ÉVÉNEMENTS DOM
   */
  connectDOMEvents() {
    // Surveiller les clics sur les boutons d'action
    document.addEventListener('click', async (event) => {
      const target = event.target.closest('[data-badge-trigger]');
      if (target) {
        const triggerType = target.dataset.badgeTrigger;
        const triggerData = JSON.parse(target.dataset.triggerData || '{}');
        
        await this.handleActionTrigger(triggerType, triggerData);
      }
    });

    // Surveiller les soumissions de formulaire
    document.addEventListener('submit', async (event) => {
      const form = event.target;
      if (form.dataset.badgeTrigger) {
        const triggerType = form.dataset.badgeTrigger;
        const formData = new FormData(form);
        const triggerData = Object.fromEntries(formData.entries());
        
        // Délai pour permettre la soumission
        setTimeout(() => {
          this.handleActionTrigger(triggerType, triggerData);
        }, 1000);
      }
    });

    console.log('🖱️ Événements DOM connectés');
  }

  /**
   * 🧭 CONNECTER LES ÉVÉNEMENTS DE NAVIGATION
   */
  connectNavigationEvents() {
    // Surveiller les changements de page
    let currentPath = window.location.pathname;
    
    const checkPathChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        this.handlePageVisit(newPath, currentPath);
        currentPath = newPath;
      }
    };

    // Écouter les changements d'historique
    window.addEventListener('popstate', checkPathChange);
    
    // Intercepter les clics sur les liens internes
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="/"]');
      if (link) {
        setTimeout(checkPathChange, 100);
      }
    });

    console.log('🧭 Événements de navigation connectés');
  }

  /**
   * 🔥 GÉRER LES ÉVÉNEMENTS FIREBASE
   */
  async handleFirebaseEvent(eventType, eventData) {
    try {
      console.log(`🔥 Événement Firebase détecté: ${eventType}`, eventData);

      const userId = eventData.userId || eventData.uid;
      if (!userId) {
        console.warn('⚠️ userId manquant dans l\'événement Firebase');
        return;
      }

      let activityContext = {
        trigger: eventType,
        timestamp: Date.now(),
        ...eventData
      };

      // Contextes spécifiques selon le type d'événement
      switch (eventType) {
        case 'taskCompleted':
          activityContext = {
            ...activityContext,
            type: 'task_completion',
            roleId: eventData.roleId || 'general',
            category: eventData.category || 'productivity',
            difficulty: eventData.difficulty || 'normal'
          };
          break;

        case 'levelUp':
          activityContext = {
            ...activityContext,
            type: 'level_progression',
            newLevel: eventData.newLevel,
            previousLevel: eventData.previousLevel
          };
          break;

        case 'roleAssigned':
          activityContext = {
            ...activityContext,
            type: 'role_assignment',
            roleId: eventData.roleId,
            assignedBy: eventData.assignedBy
          };
          break;

        case 'loginStreak':
          activityContext = {
            ...activityContext,
            type: 'engagement',
            streakDays: eventData.streakDays
          };
          break;
      }

      // Déclencher la vérification des badges
      await this.triggerBadgeCheck(userId, activityContext);

    } catch (error) {
      console.error(`❌ Erreur traitement événement ${eventType}:`, error);
    }
  }

  /**
   * 🎯 GÉRER LES DÉCLENCHEURS D'ACTION
   */
  async handleActionTrigger(triggerType, triggerData) {
    try {
      console.log(`🎯 Action détectée: ${triggerType}`, triggerData);

      // Récupérer l'utilisateur actuel
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ Utilisateur non connecté');
        return;
      }

      let activityContext = {
        trigger: triggerType,
        timestamp: Date.now(),
        ...triggerData
      };

      // Contextes spécifiques selon le type d'action
      switch (triggerType) {
        case 'maintenance_task':
          activityContext = {
            ...activityContext,
            type: 'technical_work',
            roleId: 'maintenance',
            category: 'repair'
          };
          break;

        case 'reputation_response':
          activityContext = {
            ...activityContext,
            type: 'customer_service',
            roleId: 'reputation',
            category: 'review_management'
          };
          break;

        case 'stock_audit':
          activityContext = {
            ...activityContext,
            type: 'logistics',
            roleId: 'stock',
            category: 'inventory'
          };
          break;

        case 'escape_game_session':
          activityContext = {
            ...activityContext,
            type: 'entertainment',
            activityType: 'escapeGame',
            category: 'game_animation'
          };
          break;

        case 'quiz_game_session':
          activityContext = {
            ...activityContext,
            type: 'education',
            activityType: 'quizGame',
            category: 'knowledge_sharing'
          };
          break;
      }

      // Déclencher la vérification des badges
      await this.triggerBadgeCheck(userId, activityContext);

    } catch (error) {
      console.error(`❌ Erreur traitement action ${triggerType}:`, error);
    }
  }

  /**
   * 📄 GÉRER LES VISITES DE PAGE
   */
  async handlePageVisit(newPath, previousPath) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return;

      // Détecter les pages spéciales
      const specialPages = {
        '/badges': 'badges_page_visit',
        '/profile': 'profile_page_visit',
        '/tasks': 'tasks_page_visit',
        '/dashboard': 'dashboard_visit',
        '/escape-games': 'escape_game_interest',
        '/quiz-games': 'quiz_game_interest'
      };

      const activityType = specialPages[newPath];
      if (activityType) {
        const activityContext = {
          trigger: 'page_visit',
          type: 'navigation',
          page: newPath,
          previousPage: previousPath,
          activityType,
          timestamp: Date.now()
        };

        // Vérification différée pour éviter de surcharger
        setTimeout(() => {
          this.triggerBadgeCheck(userId, activityContext);
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Erreur traitement visite page:', error);
    }
  }

  /**
   * 🏆 DÉCLENCHER LA VÉRIFICATION DES BADGES
   */
  async triggerBadgeCheck(userId, activityContext) {
    try {
      console.log('🏆 Déclenchement vérification badges:', { userId, activityContext });

      // Vérifier les badges Synergia
      const result = await synergiaBadgeService.checkAndUnlockBadges(userId, activityContext);

      if (result.success && result.newBadges.length > 0) {
        console.log(`🎉 ${result.newBadges.length} nouveaux badges débloqués !`);
        
        // Déclencher les événements de notification
        result.newBadges.forEach(badge => {
          const event = new CustomEvent('badgeUnlocked', {
            detail: { badge, activityContext, timestamp: Date.now() }
          });
          window.dispatchEvent(event);
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 👤 RÉCUPÉRER L'ID DE L'UTILISATEUR ACTUEL
   */
  getCurrentUserId() {
    // Essayer plusieurs méthodes pour récupérer l'utilisateur
    try {
      // Via le store auth Zustand
      if (window.useAuthStore) {
        const authState = window.useAuthStore.getState();
        if (authState.user?.uid) {
          return authState.user.uid;
        }
      }

      // Via localStorage
      const userStorage = localStorage.getItem('synergia-auth-user');
      if (userStorage) {
        const user = JSON.parse(userStorage);
        if (user.uid) return user.uid;
      }

      // Via sessionStorage
      const sessionUser = sessionStorage.getItem('current-user-id');
      if (sessionUser) return sessionUser;

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération userId:', error);
      return null;
    }
  }

  /**
   * 📡 AJOUTER UN LISTENER D'ÉVÉNEMENT
   */
  addEventListener(eventType, handler) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType).push(handler);
    window.addEventListener(eventType, handler);
  }

  /**
   * 🗑️ SUPPRIMER UN LISTENER D'ÉVÉNEMENT
   */
  removeEventListener(eventType, handler) {
    const handlers = this.eventListeners.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        window.removeEventListener(eventType, handler);
      }
    }
  }

  /**
   * 🧹 NETTOYER TOUS LES LISTENERS
   */
  cleanup() {
    for (const [eventType, handlers] of this.eventListeners) {
      handlers.forEach(handler => {
        window.removeEventListener(eventType, handler);
      });
    }
    
    this.eventListeners.clear();
    this.isInitialized = false;
    
    console.log('🧹 Service de déclenchement de badges nettoyé');
  }

  /**
   * 🔧 MÉTHODES UTILITAIRES POUR DÉVELOPPEURS
   */

  // Forcer la vérification des badges
  async forceCheckBadges(userId, customContext = {}) {
    const activityContext = {
      trigger: 'manual_check',
      type: 'developer_action',
      timestamp: Date.now(),
      ...customContext
    };

    return await this.triggerBadgeCheck(userId, activityContext);
  }

  // Simuler un événement
  simulateEvent(eventType, eventData = {}) {
    const event = new CustomEvent(eventType, { detail: eventData });
    window.dispatchEvent(event);
  }

  // Obtenir les statistiques du service
  getServiceStats() {
    return {
      isInitialized: this.isInitialized,
      eventListeners: Array.from(this.eventListeners.keys()),
      totalListeners: Array.from(this.eventListeners.values()).reduce((sum, handlers) => sum + handlers.length, 0)
    };
  }
}

// Instance singleton
const badgeTriggerService = new BadgeTriggerService();

// Auto-initialisation quand le DOM est prêt
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      badgeTriggerService.initialize();
    });
  } else {
    badgeTriggerService.initialize();
  }
}

export default badgeTriggerService;
export { BadgeTriggerService };

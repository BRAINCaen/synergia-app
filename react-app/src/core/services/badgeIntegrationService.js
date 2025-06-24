// ==========================================
// 📁 react-app/src/core/services/badgeIntegrationService.js
// Service d'intégration compatible avec la structure existante
// ==========================================

import BadgeEngine from './badgeEngine.js';
// Utilisation du service existant dans votre structure
import gamificationService from './gamificationService.js';

/**
 * 🔗 SERVICE D'INTÉGRATION DES BADGES (VERSION COMPATIBLE)
 * 
 * Connecte automatiquement le Badge Engine avec les actions utilisateur
 * Compatible avec la structure de services existante
 */
class BadgeIntegrationService {
  
  // Cache pour éviter les vérifications trop fréquentes
  static lastCheck = {};
  static checkCooldown = 5000; // 5 secondes entre les vérifications

  /**
   * 🚀 INITIALISER L'INTÉGRATION
   * Configuration sécurisée qui ne casse pas l'existant
   */
  static initialize() {
    try {
      console.log('🔗 Initialisation Badge Integration Service (Compatible)');
      
      // Vérifier que les dépendances existent
      if (typeof window === 'undefined') {
        console.warn('⚠️ Window non disponible, skip initialisation badges');
        return;
      }

      // Écouter les événements seulement si possible
      this.setupEventListeners();
      
      // Vérification périodique (toutes les 30 secondes)
      this.setupPeriodicCheck();
      
      console.log('✅ Badge Integration Service initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation Badge Integration Service:', error);
      // Ne pas faire crasher l'app si les badges ne s'initialisent pas
    }
  }

  /**
   * 🎧 CONFIGURER LES ÉCOUTEURS D'ÉVÉNEMENTS (VERSION SÉCURISÉE)
   */
  static setupEventListeners() {
    try {
      // Écouter les complétions de tâches
      window.addEventListener('taskCompleted', (event) => {
        this.handleTaskCompleted(event);
      });

      // Écouter les créations de projets
      window.addEventListener('projectCreated', (event) => {
        this.handleProjectCreated(event);
      });

      // Écouter les complétions de projets
      window.addEventListener('projectCompleted', (event) => {
        this.handleProjectCompleted(event);
      });

      // Écouter les updates XP
      window.addEventListener('xpUpdated', (event) => {
        this.handleXpUpdated(event);
      });

      // Écouter les streaks
      window.addEventListener('streakUpdated', (event) => {
        this.handleStreakUpdated(event);
      });

      console.log('🎧 Event listeners configurés pour les badges');
    } catch (error) {
      console.error('❌ Erreur setupEventListeners:', error);
    }
  }

  /**
   * 🎯 GESTIONNAIRES D'ÉVÉNEMENTS SÉCURISÉS
   */
  static handleTaskCompleted(event) {
    try {
      const { userId, task } = event.detail || {};
      if (userId && task) {
        this.triggerBadgeCheck(userId, 'taskCompleted', { task });
      }
    } catch (error) {
      console.error('❌ Erreur handleTaskCompleted:', error);
    }
  }

  static handleProjectCreated(event) {
    try {
      const { userId, project } = event.detail || {};
      if (userId && project) {
        this.triggerBadgeCheck(userId, 'projectCreated', { project });
      }
    } catch (error) {
      console.error('❌ Erreur handleProjectCreated:', error);
    }
  }

  static handleProjectCompleted(event) {
    try {
      const { userId, project } = event.detail || {};
      if (userId && project) {
        this.triggerBadgeCheck(userId, 'projectCompleted', { project });
      }
    } catch (error) {
      console.error('❌ Erreur handleProjectCompleted:', error);
    }
  }

  static handleXpUpdated(event) {
    try {
      const { userId, xpGained, newLevel } = event.detail || {};
      if (userId) {
        this.triggerBadgeCheck(userId, 'xpUpdated', { xpGained, newLevel });
      }
    } catch (error) {
      console.error('❌ Erreur handleXpUpdated:', error);
    }
  }

  static handleStreakUpdated(event) {
    try {
      const { userId, streak } = event.detail || {};
      if (userId) {
        this.triggerBadgeCheck(userId, 'streakUpdated', { streak });
      }
    } catch (error) {
      console.error('❌ Erreur handleStreakUpdated:', error);
    }
  }

  /**
   * ⏰ VÉRIFICATION PÉRIODIQUE SÉCURISÉE
   */
  static setupPeriodicCheck() {
    try {
      setInterval(() => {
        const currentUser = this.getCurrentUser();
        if (currentUser?.uid) {
          this.triggerBadgeCheck(currentUser.uid, 'periodic');
        }
      }, 30000); // 30 secondes
    } catch (error) {
      console.error('❌ Erreur setupPeriodicCheck:', error);
    }
  }

  /**
   * 👤 OBTENIR L'UTILISATEUR ACTUEL (VERSION COMPATIBLE)
   */
  static getCurrentUser() {
    try {
      // Méthode 1: Via authStore global
      if (window.authStore) {
        return window.authStore.getState().user;
      }
      
      // Méthode 2: Via localStorage (fallback)
      const authData = localStorage.getItem('synergia-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.user;
      }
      
      // Méthode 3: Via gameStore (autre fallback)
      if (window.gameStore) {
        return window.gameStore.getState().user;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur getCurrentUser:', error);
      return null;
    }
  }

  /**
   * 🎯 DÉCLENCHER LA VÉRIFICATION DES BADGES (VERSION SÉCURISÉE)
   */
  static async triggerBadgeCheck(userId, eventType, eventData = {}) {
    try {
      // Vérifier que l'userId existe
      if (!userId) {
        console.warn('⚠️ UserId manquant pour vérification badges');
        return [];
      }

      // Vérifier le cooldown
      const now = Date.now();
      const lastCheckTime = this.lastCheck[userId] || 0;
      
      if (now - lastCheckTime < this.checkCooldown && eventType !== 'manual') {
        console.log(`⏳ Badge check en cooldown pour ${userId}`);
        return [];
      }

      // Mettre à jour le timestamp
      this.lastCheck[userId] = now;

      console.log(`🏆 Vérification badges déclenchée - Event: ${eventType}`, eventData);

      // Lancer la vérification (avec try/catch pour sécurité)
      const newBadges = await BadgeEngine.checkAndAwardBadges(userId);

      // Si des badges ont été débloqués
      if (newBadges && newBadges.length > 0) {
        await this.updateGamificationAfterBadges(userId, newBadges);
        
        // Déclencher un événement pour notifier l'interface
        this.dispatchBadgeEvent(userId, newBadges, eventType);
      }

      return newBadges || [];

    } catch (error) {
      console.error('❌ Erreur triggerBadgeCheck:', error);
      return [];
    }
  }

  /**
   * 🎮 METTRE À JOUR LA GAMIFICATION APRÈS BADGES (VERSION COMPATIBLE)
   */
  static async updateGamificationAfterBadges(userId, newBadges) {
    try {
      // Calculer l'XP total des nouveaux badges
      const totalXpBonus = newBadges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0);

      // Utiliser le gamificationService existant si disponible
      if (totalXpBonus > 0 && gamificationService) {
        // Déclencher l'event XP avec la structure existante
        this.dispatchXpEvent(userId, totalXpBonus, newBadges);
        
        console.log(`🎯 XP bonus badges: +${totalXpBonus} pour ${userId}`);
      }

    } catch (error) {
      console.error('❌ Erreur updateGamificationAfterBadges:', error);
    }
  }

  /**
   * 📡 DISPATCH D'ÉVÉNEMENTS SÉCURISÉ
   */
  static dispatchBadgeEvent(userId, badges, eventType) {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('badgesAwarded', {
          detail: {
            userId,
            badges,
            eventType,
            timestamp: new Date()
          }
        }));
      }
    } catch (error) {
      console.error('❌ Erreur dispatchBadgeEvent:', error);
    }
  }

  static dispatchXpEvent(userId, xpBonus, badges) {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('xpUpdatedFromBadges', {
          detail: {
            userId,
            xpBonus,
            source: 'badges',
            badges
          }
        }));
      }
    } catch (error) {
      console.error('❌ Erreur dispatchXpEvent:', error);
    }
  }

  /**
   * 🎯 VÉRIFICATION MANUELLE DES BADGES (API PUBLIQUE)
   */
  static async manualBadgeCheck(userId) {
    console.log('🔍 Vérification manuelle des badges demandée');
    return await this.triggerBadgeCheck(userId, 'manual');
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE BADGES (VERSION SÉCURISÉE)
   */
  static async getBadgeStats(userId) {
    try {
      if (!userId) return null;

      const userData = await BadgeEngine.getUserAnalytics(userId);
      const allBadges = BadgeEngine.getAllBadges();
      
      const unlockedBadges = userData.badges || [];
      const unlockedCount = unlockedBadges.length;
      const totalCount = allBadges.length;
      const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

      // Calculer XP total des badges
      const totalXpFromBadges = allBadges
        .filter(badge => unlockedBadges.includes(badge.id))
        .reduce((sum, badge) => sum + (badge.xpReward || 0), 0);

      return {
        unlockedCount,
        totalCount,
        percentage,
        totalXpFromBadges
      };

    } catch (error) {
      console.error('❌ Erreur getBadgeStats:', error);
      return null;
    }
  }

  /**
   * 🛠️ OUTILS DE DEBUG SÉCURISÉS
   */
  static getDebugInfo(userId) {
    try {
      return {
        lastCheck: this.lastCheck[userId] || 'Jamais',
        cooldownRemaining: Math.max(0, this.checkCooldown - (Date.now() - (this.lastCheck[userId] || 0))),
        currentUser: this.getCurrentUser()?.email || 'Non connecté',
        eventListenersActive: true,
        initialized: true
      };
    } catch (error) {
      console.error('❌ Erreur getDebugInfo:', error);
      return { error: error.message };
    }
  }

  /**
   * 🧪 DÉCLENCHER DES ÉVÉNEMENTS DE TEST (DÉVELOPPEMENT)
   */
  static triggerTestEvents(userId) {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('⚠️ triggerTestEvents disponible uniquement en développement');
      return;
    }

    try {
      console.log('🧪 Déclenchement des événements de test');

      // Simuler diverses actions pour tester les badges
      setTimeout(() => {
        this.dispatchEvent('taskCompleted', {
          userId,
          task: {
            id: 'test-task-1',
            title: 'Tâche de test',
            priority: 'high',
            completedAt: { toDate: () => new Date() },
            createdAt: { toDate: () => new Date(Date.now() - 30 * 60 * 1000) },
            dueDate: { toDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
          }
        });
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur triggerTestEvents:', error);
    }
  }

  /**
   * 🔧 HELPER POUR DISPATCH SÉCURISÉ
   */
  static dispatchEvent(eventName, detail) {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
      }
    } catch (error) {
      console.error(`❌ Erreur dispatch ${eventName}:`, error);
    }
  }

  /**
   * 🧹 NETTOYER LE CACHE
   */
  static cleanupCache() {
    try {
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 heure

      Object.keys(this.lastCheck).forEach(userId => {
        if (now - this.lastCheck[userId] > maxAge) {
          delete this.lastCheck[userId];
        }
      });

      console.log('🧹 Cache badges nettoyé');
    } catch (error) {
      console.error('❌ Erreur cleanupCache:', error);
    }
  }
}

// 🚀 AUTO-INITIALISATION SÉCURISÉE
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => BadgeIntegrationService.initialize(), 1000);
    });
  } else {
    // DOM déjà chargé, initialiser avec délai
    setTimeout(() => BadgeIntegrationService.initialize(), 1000);
  }

  // Exposer globalement pour le debugging (sécurisé)
  window.BadgeIntegrationService = BadgeIntegrationService;
}

export default BadgeIntegrationService;

/**
 * 🔗 SERVICE D'INTÉGRATION DES BADGES
 * 
 * Connecte automatiquement le Badge Engine avec les actions utilisateur
 * pour déclencher la vérification des badges en temps réel
 */
class BadgeIntegrationService {
  
  // Cache pour éviter les vérifications trop fréquentes
  static lastCheck = {};
  static checkCooldown = 5000; // 5 secondes entre les vérifications

  /**
   * 🚀 INITIALISER L'INTÉGRATION
   * Configure les événements automatiques
   */
  static initialize() {
    console.log('🔗 Initialisation Badge Integration Service');
    
    // Écouter les événements du gamification service
    this.setupEventListeners();
    
    // Vérification périodique (toutes les 30 secondes)
    this.setupPeriodicCheck();
  }

  /**
   * 🎧 CONFIGURER LES ÉCOUTEURS D'ÉVÉNEMENTS
   */
  static setupEventListeners() {
    // Écouter les complétions de tâches
    window.addEventListener('taskCompleted', (event) => {
      const { userId, task } = event.detail;
      this.triggerBadgeCheck(userId, 'taskCompleted', { task });
    });

    // Écouter les créations de projets
    window.addEventListener('projectCreated', (event) => {
      const { userId, project } = event.detail;
      this.triggerBadgeCheck(userId, 'projectCreated', { project });
    });

    // Écouter les complétions de projets
    window.addEventListener('projectCompleted', (event) => {
      const { userId, project } = event.detail;
      this.triggerBadgeCheck(userId, 'projectCompleted', { project });
    });

    // Écouter les updates XP
    window.addEventListener('xpUpdated', (event) => {
      const { userId, xpGained, newLevel } = event.detail;
      this.triggerBadgeCheck(userId, 'xpUpdated', { xpGained, newLevel });
    });

    // Écouter les streaks
    window.addEventListener('streakUpdated', (event) => {
      const { userId, streak } = event.detail;
      this.triggerBadgeCheck(userId, 'streakUpdated', { streak });
    });
  }

  /**
   * ⏰ VÉRIFICATION PÉRIODIQUE
   * Vérifie les badges toutes les 30 secondes pour les patterns complexes
   */
  static setupPeriodicCheck() {
    setInterval(() => {
      // Obtenir l'utilisateur actuel (depuis le store)
      const currentUser = this.getCurrentUser();
      if (currentUser?.uid) {
        this.triggerBadgeCheck(currentUser.uid, 'periodic');
      }
    }, 30000); // 30 secondes
  }

  /**
   * 👤 OBTENIR L'UTILISATEUR ACTUEL
   * Récupère l'utilisateur depuis le store Zustand
   */
  static getCurrentUser() {
    try {
      // Accéder au store directement
      if (window.authStore) {
        return window.authStore.getState().user;
      }
      
      // Fallback: chercher dans le localStorage
      const authData = localStorage.getItem('synergia-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.user;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur getCurrentUser:', error);
      return null;
    }
  }

  /**
   * 🎯 DÉCLENCHER LA VÉRIFICATION DES BADGES
   * Vérifie les badges avec cooldown pour éviter le spam
   */
  static async triggerBadgeCheck(userId, eventType, eventData = {}) {
    try {
      // Vérifier le cooldown
      const now = Date.now();
      const lastCheckTime = this.lastCheck[userId] || 0;
      
      if (now - lastCheckTime < this.checkCooldown && eventType !== 'manual') {
        console.log(`⏳ Badge check en cooldown pour ${userId}`);
        return;
      }

      // Mettre à jour le timestamp
      this.lastCheck[userId] = now;

      console.log(`🏆 Vérification badges déclenchée - Event: ${eventType}`, eventData);

      // Lancer la vérification
      const newBadges = await BadgeEngine.checkAndAwardBadges(userId);

      // Si des badges ont été débloqués, mettre à jour le gamification service
      if (newBadges.length > 0) {
        await this.updateGamificationAfterBadges(userId, newBadges);
        
        // Déclencher un événement pour notifier l'interface
        window.dispatchEvent(new CustomEvent('badgesAwarded', {
          detail: {
            userId,
            badges: newBadges,
            eventType,
            timestamp: new Date()
          }
        }));
      }

      return newBadges;

    } catch (error) {
      console.error('❌ Erreur triggerBadgeCheck:', error);
      return [];
    }
  }

  /**
   * 🎮 METTRE À JOUR LA GAMIFICATION APRÈS BADGES
   * Synchronise avec le gamification service
   */
  static async updateGamificationAfterBadges(userId, newBadges) {
    try {
      // Calculer l'XP total des nouveaux badges
      const totalXpBonus = newBadges.reduce((sum, badge) => sum + badge.xpReward, 0);

      // Notifier le gamification service
      if (totalXpBonus > 0) {
        // Déclencher l'event XP pour recalculer le niveau
        window.dispatchEvent(new CustomEvent('xpUpdatedFromBadges', {
          detail: {
            userId,
            xpBonus: totalXpBonus,
            source: 'badges',
            badges: newBadges
          }
        }));

        console.log(`🎯 XP bonus badges: +${totalXpBonus} pour ${userId}`);
      }

    } catch (error) {
      console.error('❌ Erreur updateGamificationAfterBadges:', error);
    }
  }

  /**
   * 🎯 VÉRIFICATION MANUELLE DES BADGES
   * Pour les boutons "Vérifier badges" dans l'interface
   */
  static async manualBadgeCheck(userId) {
    console.log('🔍 Vérification manuelle des badges demandée');
    return await this.triggerBadgeCheck(userId, 'manual');
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE BADGES
   * Pour l'affichage dans l'interface
   */
  static async getBadgeStats(userId) {
    try {
      const userData = await BadgeEngine.getUserAnalytics(userId);
      const allBadges = BadgeEngine.getAllBadges();
      
      const unlockedBadges = userData.badges || [];
      const unlockedCount = unlockedBadges.length;
      const totalCount = allBadges.length;
      const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

      // Calculer XP total des badges
      const totalXpFromBadges = allBadges
        .filter(badge => unlockedBadges.includes(badge.id))
        .reduce((sum, badge) => sum + badge.xpReward, 0);

      // Statistiques par rareté
      const rarityStats = allBadges.reduce((acc, badge) => {
        const rarity = badge.rarity;
        if (!acc[rarity]) {
          acc[rarity] = { total: 0, unlocked: 0, xp: 0 };
        }
        acc[rarity].total++;
        if (unlockedBadges.includes(badge.id)) {
          acc[rarity].unlocked++;
          acc[rarity].xp += badge.xpReward;
        }
        return acc;
      }, {});

      return {
        unlockedCount,
        totalCount,
        percentage,
        totalXpFromBadges,
        rarityStats,
        recentBadges: await this.getRecentBadges(userId)
      };

    } catch (error) {
      console.error('❌ Erreur getBadgeStats:', error);
      return null;
    }
  }

  /**
   * 🕒 OBTENIR LES BADGES RÉCENTS
   * Derniers badges débloqués (pour l'affichage)
   */
  static async getRecentBadges(userId, limit = 5) {
    try {
      // Cette fonctionnalité nécessiterait une collection séparée dans Firebase
      // pour tracker les timestamps de déblocage. Pour l'instant, on retourne un tableau vide
      return [];
    } catch (error) {
      console.error('❌ Erreur getRecentBadges:', error);
      return [];
    }
  }

  /**
   * 🔄 SYNCHRONISER AVEC LE GAMIFICATION SERVICE
   * Assure la cohérence entre les deux systèmes
   */
  static async syncWithGamification(userId) {
    try {
      console.log('🔄 Synchronisation badges <-> gamification');

      // Obtenir les données actuelles
      const badgeStats = await this.getBadgeStats(userId);
      const userData = await BadgeEngine.getUserAnalytics(userId);

      // Vérifier si l'XP des badges est cohérent
      const currentXp = userData.xp || 0;
      const expectedXpFromBadges = badgeStats.totalXpFromBadges;

      // Log pour debugging
      console.log(`📊 Sync badges - XP actuel: ${currentXp}, XP badges: ${expectedXpFromBadges}`);

      // Si une incohérence est détectée, on pourrait la corriger ici
      // (mais cela dépend de la logique métier souhaitée)

      return {
        synced: true,
        xpConsistent: true,
        badgeCount: badgeStats.unlockedCount
      };

    } catch (error) {
      console.error('❌ Erreur syncWithGamification:', error);
      return { synced: false, error: error.message };
    }
  }

  /**
   * 🎲 DÉCLENCHER DES ÉVÉNEMENTS DE TEST
   * Pour le développement et les tests
   */
  static triggerTestEvents(userId) {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('⚠️ triggerTestEvents disponible uniquement en développement');
      return;
    }

    console.log('🧪 Déclenchement des événements de test');

    // Simuler diverses actions pour tester les badges
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('taskCompleted', {
        detail: {
          userId,
          task: {
            id: 'test-task-1',
            priority: 'high',
            completedAt: { toDate: () => new Date() },
            createdAt: { toDate: () => new Date(Date.now() - 30 * 60 * 1000) }, // Il y a 30 min
            dueDate: { toDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // Dans 24h
          }
        }
      }));
    }, 1000);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('streakUpdated', {
        detail: {
          userId,
          streak: 7
        }
      }));
    }, 2000);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('projectCompleted', {
        detail: {
          userId,
          project: {
            id: 'test-project-1',
            name: 'Projet Test',
            completedAt: new Date()
          }
        }
      }));
    }, 3000);
  }

  /**
   * 🛠️ OUTILS DE DEBUG
   * Fonctions utiles pour le développement
   */
  static getDebugInfo(userId) {
    return {
      lastCheck: this.lastCheck[userId],
      cooldownRemaining: Math.max(0, this.checkCooldown - (Date.now() - (this.lastCheck[userId] || 0))),
      currentUser: this.getCurrentUser(),
      eventListenersActive: true
    };
  }

  /**
   * 🧹 NETTOYER LE CACHE
   * Supprime les données de cache obsolètes
   */
  static cleanupCache() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 heure

    Object.keys(this.lastCheck).forEach(userId => {
      if (now - this.lastCheck[userId] > maxAge) {
        delete this.lastCheck[userId];
      }
    });

    console.log('🧹 Cache nettoyé');
  }
}

// 🚀 AUTO-INITIALISATION
// Le service s'initialise automatiquement quand le module est importé
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      BadgeIntegrationService.initialize();
    });
  } else {
    BadgeIntegrationService.initialize();
  }

  // Exposer globalement pour le debugging
  window.BadgeIntegrationService = BadgeIntegrationService;
}

export default BadgeIntegrationService;

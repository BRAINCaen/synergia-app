// ==========================================
// 📁 react-app/src/core/services/roleProgressionIntegration.js
// INTÉGRATION COMPLÈTE DU SYSTÈME DE PROGRESSION PAR RÔLES
// Orchestrateur principal qui connecte tous les systèmes de déverrouillage
// ==========================================

import { db } from '../firebase/config.js';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import roleUnlockService from './roleUnlockService.js';
import roleTaskManager from './roleTaskManager.js';
import roleBadgeSystem from './roleBadgeSystem.js';
import { synergiaRolesService } from './synergiaRolesService.js';

/**
 * 🚀 ORCHESTRATEUR PRINCIPAL DE LA PROGRESSION PAR RÔLES
 */
class RoleProgressionIntegration {
  constructor() {
    this.listeners = new Map();
    this.userProgressionCache = new Map();
    this.isInitialized = false;
  }

  /**
   * 🎯 INITIALISER LE SYSTÈME COMPLET
   */
  async initialize(userId) {
    try {
      console.log('🚀 Initialisation du système de progression par rôles...');
      
      if (!userId) {
        throw new Error('UserId requis pour l\'initialisation');
      }

      // Charger les données utilisateur
      await this.loadUserProgression(userId);

      // Configurer les listeners temps réel
      this.setupRealtimeListeners(userId);

      // Intégrer avec les systèmes existants
      this.integrateWithExistingSystems();

      // Générer les tâches automatiques initiales
      await this.generateInitialTasks(userId);

      // Vérifier les badges débloquables
      await this.checkInitialBadges(userId);

      this.isInitialized = true;
      console.log('✅ Système de progression par rôles initialisé!');

      return { success: true, message: 'Système initialisé avec succès' };

    } catch (error) {
      console.error('❌ Erreur initialisation système progression:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 CHARGER LA PROGRESSION UTILISATEUR
   */
  async loadUserProgression(userId) {
    try {
      const userRef = doc(db, 'teamMembers', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userDoc.data();
      const userRoles = userData.roles || {};
      const userStats = userData.stats || {};
      const userBadges = userData.badges || {};

      // Mettre en cache
      this.userProgressionCache.set(userId, {
        roles: userRoles,
        stats: userStats,
        badges: userBadges,
        lastUpdate: new Date()
      });

      console.log('📊 Progression utilisateur chargée:', {
        roles: Object.keys(userRoles).length,
        totalXp: userStats.totalXp || 0,
        badges: Object.keys(userBadges).length
      });

      return { roles: userRoles, stats: userStats, badges: userBadges };

    } catch (error) {
      console.error('❌ Erreur chargement progression:', error);
      throw error;
    }
  }

  /**
   * 🔄 CONFIGURER LES LISTENERS TEMPS RÉEL
   */
  setupRealtimeListeners(userId) {
    try {
      const userRef = doc(db, 'teamMembers', userId);

      // Écouter les changements de progression
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          this.handleProgressionUpdate(userId, userData);
        }
      });

      this.listeners.set(userId, unsubscribe);
      console.log('🔄 Listeners temps réel configurés pour:', userId);

    } catch (error) {
      console.error('❌ Erreur configuration listeners:', error);
    }
  }

  /**
   * 📈 GÉRER LES MISES À JOUR DE PROGRESSION
   */
  async handleProgressionUpdate(userId, userData) {
    try {
      const cachedData = this.userProgressionCache.get(userId);
      const newRoles = userData.roles || {};
      const newStats = userData.stats || {};

      // Détecter les changements significatifs
      const changes = this.detectProgressionChanges(cachedData, userData);

      if (changes.hasChanges) {
        console.log('📈 Changements de progression détectés:', changes);

        // Mettre à jour le cache
        this.userProgressionCache.set(userId, {
          roles: newRoles,
          stats: newStats,
          badges: userData.badges || {},
          lastUpdate: new Date()
        });

        // Traiter les changements
        await this.processProgressionChanges(userId, changes, userData);
      }

    } catch (error) {
      console.error('❌ Erreur traitement mise à jour progression:', error);
    }
  }

  /**
   * 🔍 DÉTECTER LES CHANGEMENTS DE PROGRESSION
   */
  detectProgressionChanges(cachedData, newData) {
    const changes = {
      hasChanges: false,
      levelUps: [],
      newRoles: [],
      xpGains: [],
      taskCompletions: []
    };

    if (!cachedData) {
      changes.hasChanges = true;
      return changes;
    }

    const oldRoles = cachedData.roles || {};
    const newRoles = newData.roles || {};
    const oldStats = cachedData.stats || {};
    const newStats = newData.stats || {};

    // Détecter les level ups
    Object.entries(newRoles).forEach(([roleId, roleData]) => {
      const oldRoleData = oldRoles[roleId];
      
      if (oldRoleData) {
        const oldLevel = roleUnlockService.calculateRoleLevel(oldRoleData.xp || 0);
        const newLevel = roleUnlockService.calculateRoleLevel(roleData.xp || 0);
        
        if (oldLevel !== newLevel) {
          changes.levelUps.push({
            roleId,
            oldLevel,
            newLevel,
            xpGained: (roleData.xp || 0) - (oldRoleData.xp || 0)
          });
          changes.hasChanges = true;
        }
      } else {
        // Nouveau rôle
        changes.newRoles.push(roleId);
        changes.hasChanges = true;
      }
    });

    // Détecter les gains d'XP
    if ((newStats.totalXp || 0) > (oldStats.totalXp || 0)) {
      changes.xpGains.push({
        amount: (newStats.totalXp || 0) - (oldStats.totalXp || 0),
        newTotal: newStats.totalXp || 0
      });
      changes.hasChanges = true;
    }

    // Détecter les completions de tâches
    if ((newStats.tasksCompleted || 0) > (oldStats.tasksCompleted || 0)) {
      changes.taskCompletions.push({
        newCompletions: (newStats.tasksCompleted || 0) - (oldStats.tasksCompleted || 0),
        newTotal: newStats.tasksCompleted || 0
      });
      changes.hasChanges = true;
    }

    return changes;
  }

  /**
   * ⚡ TRAITER LES CHANGEMENTS DE PROGRESSION
   */
  async processProgressionChanges(userId, changes, userData) {
    try {
      // Traiter les level ups
      for (const levelUp of changes.levelUps) {
        await this.handleRoleLevelUp(userId, levelUp, userData);
      }

      // Traiter les nouveaux rôles
      for (const newRole of changes.newRoles) {
        await this.handleNewRoleAssigned(userId, newRole, userData);
      }

      // Traiter les completions de tâches
      for (const completion of changes.taskCompletions) {
        await this.handleTaskCompletions(userId, completion, userData);
      }

      // Vérifier les badges après tous les changements
      await this.checkTriggeredBadges(userId, userData);

    } catch (error) {
      console.error('❌ Erreur traitement changements:', error);
    }
  }

  /**
   * 🎉 GÉRER UN LEVEL UP DE RÔLE
   */
  async handleRoleLevelUp(userId, levelUp, userData) {
    try {
      console.log('🎉 Level up détecté!', levelUp);

      // Obtenir les nouveaux déverrouillages
      const newUnlocks = roleUnlockService.getNewUnlocksForLevel(levelUp.roleId, levelUp.newLevel);

      // Générer de nouvelles tâches débloquées
      await this.generateUnlockedTasks(userId, levelUp.roleId, levelUp.newLevel);

      // Déclencher l'événement de level up
      this.triggerLevelUpEvent(userId, levelUp, newUnlocks);

      // Notification utilisateur
      this.showLevelUpNotification(levelUp, newUnlocks);

    } catch (error) {
      console.error('❌ Erreur traitement level up:', error);
    }
  }

  /**
   * 🆕 GÉRER L'ASSIGNATION D'UN NOUVEAU RÔLE
   */
  async handleNewRoleAssigned(userId, roleId, userData) {
    try {
      console.log('🆕 Nouveau rôle assigné:', roleId);

      // Générer les tâches initiales du rôle
      const userRoles = { [roleId]: userData.roles[roleId] };
      await roleTaskManager.generateAutomaticTasks(userId, userRoles, {
        maxTasks: 3,
        priorityCategories: ['daily', 'basic']
      });

      // Notification de bienvenue
      this.showNewRoleNotification(roleId);

    } catch (error) {
      console.error('❌ Erreur nouveau rôle:', error);
    }
  }

  /**
   * ✅ GÉRER LES COMPLETIONS DE TÂCHES
   */
  async handleTaskCompletions(userId, completion, userData) {
    try {
      console.log('✅ Nouvelles tâches complétées:', completion);

      // Vérifier s'il faut générer de nouvelles tâches
      const shouldGenerateMore = await this.shouldGenerateMoreTasks(userId, userData);
      
      if (shouldGenerateMore) {
        await roleTaskManager.generateAutomaticTasks(userId, userData.roles || {}, {
          maxTasks: 2,
          priorityCategories: ['daily', 'weekly']
        });
      }

    } catch (error) {
      console.error('❌ Erreur traitement completions:', error);
    }
  }

  /**
   * 🏆 VÉRIFIER LES BADGES DÉCLENCHÉS
   */
  async checkTriggeredBadges(userId, userData) {
    try {
      const userRoles = userData.roles || {};
      const userStats = userData.stats || {};

      // Vérifier les badges de rôle
      const badgeResult = await roleBadgeSystem.autoCheckRoleBadges(userId, userRoles, userStats);

      if (badgeResult.success && badgeResult.awardedBadges > 0) {
        console.log(`🏆 ${badgeResult.awardedBadges} nouveaux badges de rôle débloqués!`);
      }

      // Déclencher aussi la vérification des badges généraux
      if (window.badgeSystem) {
        await window.badgeSystem.checkBadges({
          trigger: 'role_progression_update',
          userId,
          context: { roles: userRoles, stats: userStats }
        });
      }

    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
    }
  }

  /**
   * 🎯 GÉNÉRER LES TÂCHES INITIALES
   */
  async generateInitialTasks(userId) {
    try {
      const cachedData = this.userProgressionCache.get(userId);
      if (!cachedData) return;

      const userRoles = cachedData.roles;

      // Générer des tâches pour tous les rôles actifs
      const result = await roleTaskManager.generateAutomaticTasks(userId, userRoles, {
        maxTasks: 5,
        priorityCategories: ['daily', 'weekly', 'basic'],
        forceGenerate: true
      });

      console.log('🎯 Tâches initiales générées:', result);

    } catch (error) {
      console.error('❌ Erreur génération tâches initiales:', error);
    }
  }

  /**
   * 🏆 VÉRIFIER LES BADGES INITIAUX
   */
  async checkInitialBadges(userId) {
    try {
      const cachedData = this.userProgressionCache.get(userId);
      if (!cachedData) return;

      await this.checkTriggeredBadges(userId, {
        roles: cachedData.roles,
        stats: cachedData.stats,
        badges: cachedData.badges
      });

    } catch (error) {
      console.error('❌ Erreur vérification badges initiaux:', error);
    }
  }

  /**
   * 🔧 INTÉGRER AVEC LES SYSTÈMES EXISTANTS
   */
  integrateWithExistingSystems() {
    try {
      // Exposer l'API globalement
      if (typeof window !== 'undefined') {
        window.roleProgressionSystem = this;

        // Écouter les événements de gamification existants
        window.addEventListener('taskCompleted', (event) => {
          this.handleExternalTaskCompletion(event.detail);
        });

        window.addEventListener('xpGained', (event) => {
          this.handleExternalXpGain(event.detail);
        });

        window.addEventListener('badgeEarned', (event) => {
          this.handleExternalBadgeEarned(event.detail);
        });
      }

      console.log('🔧 Intégration avec systèmes existants configurée');

    } catch (error) {
      console.error('❌ Erreur intégration systèmes:', error);
    }
  }

  /**
   * 📱 MÉTHODES D'ÉVÉNEMENTS ET NOTIFICATIONS
   */
  triggerLevelUpEvent(userId, levelUp, newUnlocks) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('roleLevelUp', {
        detail: {
          userId,
          roleId: levelUp.roleId,
          oldLevel: levelUp.oldLevel,
          newLevel: levelUp.newLevel,
          xpGained: levelUp.xpGained,
          newUnlocks,
          timestamp: new Date()
        }
      });
      window.dispatchEvent(event);
    }
  }

  showLevelUpNotification(levelUp, newUnlocks) {
    const message = {
      title: '🎉 Niveau supérieur atteint!',
      description: `${levelUp.roleId}: ${levelUp.oldLevel} → ${levelUp.newLevel}`,
      type: 'success',
      duration: 8000,
      actions: [
        {
          label: 'Voir les nouveautés',
          action: () => this.showUnlocksModal(levelUp.roleId, newUnlocks)
        }
      ]
    };

    if (window.showNotification) {
      window.showNotification(message);
    }
  }

  showNewRoleNotification(roleId) {
    const message = {
      title: '🆕 Nouveau rôle assigné!',
      description: `Bienvenue dans le rôle ${roleId}`,
      type: 'info',
      duration: 6000
    };

    if (window.showNotification) {
      window.showNotification(message);
    }
  }

  /**
   * 🎯 MÉTHODES UTILITAIRES
   */
  async shouldGenerateMoreTasks(userId, userData) {
    // Logique pour déterminer s'il faut générer plus de tâches
    const currentTaskCount = await this.getCurrentTaskCount(userId);
    const optimalTaskCount = 5; // Nombre optimal de tâches actives
    
    return currentTaskCount < optimalTaskCount;
  }

  async getCurrentTaskCount(userId) {
    try {
      // Compter les tâches actives de l'utilisateur
      // Cette méthode nécessiterait une requête Firebase
      return 3; // Placeholder
    } catch (error) {
      console.error('❌ Erreur comptage tâches:', error);
      return 0;
    }
  }

  async generateUnlockedTasks(userId, roleId, newLevel) {
    try {
      const userRoles = { [roleId]: { level: newLevel } };
      await roleTaskManager.generateAutomaticTasks(userId, userRoles, {
        maxTasks: 2,
        priorityCategories: [newLevel.toLowerCase()],
        forceGenerate: true
      });
    } catch (error) {
      console.error('❌ Erreur génération tâches débloquées:', error);
    }
  }

  /**
   * 🧹 NETTOYAGE ET GESTION MÉMOIRE
   */
  cleanup(userId = null) {
    if (userId) {
      // Nettoyer un utilisateur spécifique
      const unsubscribe = this.listeners.get(userId);
      if (unsubscribe) {
        unsubscribe();
        this.listeners.delete(userId);
      }
      this.userProgressionCache.delete(userId);
    } else {
      // Nettoyer tout
      this.listeners.forEach(unsubscribe => unsubscribe());
      this.listeners.clear();
      this.userProgressionCache.clear();
      this.isInitialized = false;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES COMPLÈTES
   */
  async getCompleteProgressionStats(userId) {
    try {
      const cachedData = this.userProgressionCache.get(userId);
      if (!cachedData) {
        await this.loadUserProgression(userId);
      }

      const { roles, stats, badges } = this.userProgressionCache.get(userId);

      return {
        roleProgression: roleUnlockService.getProgressionStats(roles),
        taskStats: await roleTaskManager.getRoleTaskStats(userId),
        badgeStats: roleBadgeSystem.getRoleBadgeStats(roles, Object.values(badges)),
        unlocks: roleUnlockService.getUserUnlocks(roles),
        nextUnlocks: roleUnlockService.getNextUnlocks(roles),
        recommendations: roleTaskManager.getTaskRecommendations(roles)
      };

    } catch (error) {
      console.error('❌ Erreur stats complètes:', error);
      return null;
    }
  }

  /**
   * 🧪 MÉTHODES DE DEBUG
   */
  debugProgression(userId) {
    console.log('🧪 DEBUG - Système de progression par rôles');
    console.log('État d\'initialisation:', this.isInitialized);
    console.log('Cache utilisateur:', this.userProgressionCache.get(userId));
    console.log('Listeners actifs:', this.listeners.size);
    
    return {
      initialized: this.isInitialized,
      hasCache: this.userProgressionCache.has(userId),
      hasListener: this.listeners.has(userId),
      cacheData: this.userProgressionCache.get(userId)
    };
  }
}

// Instance singleton
const roleProgressionIntegration = new RoleProgressionIntegration();

// Auto-configuration globale
if (typeof window !== 'undefined') {
  window.roleProgressionIntegration = roleProgressionIntegration;
}

export default roleProgressionIntegration;

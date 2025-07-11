// ==========================================
// 📁 react-app/src/core/escapeGameIntegration.js
// INTÉGRATION COMPLÈTE DU SYSTÈME ESCAPE GAME POUR SYNERGIA
// ==========================================

import escapeGameRolesService, { 
  ESCAPE_GAME_ROLES, 
  ROLE_MASTERY_LEVELS,
  assignEscapeGameRole,
  updateEscapeGameRoleXP,
  completeEscapeGameTask
} from './services/escapeGameRolesService.js';

import escapeGameBadgeEngine, {
  checkEscapeGameBadges,
  getEscapeGameBadgesByRole,
  ESCAPE_GAME_ROLES as BADGE_ROLES
} from './services/escapeGameBadgeEngine.js';

/**
 * 🎭 SYSTÈME D'INTÉGRATION ESCAPE GAME
 * Coordonne les rôles, badges, quêtes et progression
 */
class EscapeGameIntegration {
  constructor() {
    this.rolesService = escapeGameRolesService;
    this.badgeEngine = escapeGameBadgeEngine;
    this.isInitialized = false;
    
    console.log('🎭 EscapeGameIntegration initialisé');
  }

  /**
   * 🚀 INITIALISER LE SYSTÈME COMPLET
   */
  async initialize() {
    try {
      console.log('🚀 Initialisation système Escape Game...');
      
      // Exposer globalement pour debug
      if (typeof window !== 'undefined') {
        window.escapeGameSystem = this;
        window.escapeGameRoles = ESCAPE_GAME_ROLES;
        window.escapeBadgeEngine = this.badgeEngine;
        
        // Fonctions de test rapide
        window.testEscapeSystem = this.testCompleteSystem.bind(this);
        window.assignMaintenanceRole = (userId) => this.quickAssignRole(userId, 'maintenance');
        window.completeMaintenanceTask = (userId) => this.quickCompleteTask(userId, 'maintenance', 'repair_mechanism');
        window.checkAllBadges = (userId) => this.checkAllUserBadges(userId);
      }

      // Connecter les événements entre systèmes
      this.connectSystemEvents();
      
      this.isInitialized = true;
      console.log('✅ Système Escape Game initialisé avec succès !');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur initialisation Escape Game:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔗 CONNECTER LES ÉVÉNEMENTS ENTRE SYSTÈMES
   */
  connectSystemEvents() {
    // Écouter les assignations de rôles
    window.addEventListener('roleAssigned', (event) => {
      const { userId, roleId } = event.detail;
      console.log(`🎭 Rôle assigné détecté: ${roleId} pour ${userId}`);
      
      // Déclencher vérification badges
      setTimeout(() => {
        this.checkAllUserBadges(userId, {
          trigger: 'role_assigned',
          type: 'first_day',
          roleId
        });
      }, 500);
    });

    // Écouter les montées de niveau
    window.addEventListener('roleLevelUp', (event) => {
      const { userId, roleId, newLevel } = event.detail;
      console.log(`🆙 Montée de niveau détectée: ${roleId} -> ${newLevel.name}`);
      
      // Déclencher vérification badges spéciaux
      setTimeout(() => {
        this.checkAllUserBadges(userId, {
          trigger: 'level_up',
          type: 'level_advancement',
          roleId,
          newLevel: newLevel.id
        });
      }, 500);
    });

    // Écouter les completion de tâches
    window.addEventListener('taskCompleted', (event) => {
      const { userId, roleId, taskId, category } = event.detail;
      console.log(`✅ Tâche complétée détectée: ${taskId} dans ${roleId}`);
      
      // Déclencher vérification badges
      setTimeout(() => {
        this.checkAllUserBadges(userId, {
          trigger: 'task_completed',
          type: this.mapTaskToActivityType(taskId, category),
          roleId,
          taskId
        });
      }, 300);
    });

    console.log('🔗 Événements système connectés');
  }

  /**
   * 🎯 MAPPER LES TÂCHES VERS LES TYPES D'ACTIVITÉ BADGES
   */
  mapTaskToActivityType(taskId, category) {
    const mapping = {
      // Maintenance
      'repair_mechanism': 'repair',
      'change_bulb': 'repair',
      'fix_lock': 'repair',
      
      // Réputation
      'respond_review': 'review_response',
      'handle_negative': 'negative_review_resolved',
      
      // Stock
      'inventory_check': 'inventory',
      'organize_storage': 'space_reorganized',
      
      // Organisation
      'create_schedule': 'schedule_created',
      
      // Contenu
      'create_poster': 'visual_created',
      'design_signage': 'visual_created',
      
      // Mentorat
      'welcome_new': 'onboarding_completed',
      'conduct_training': 'training_conducted',
      
      // Partenariats
      'contact_partner': 'partner_contacted',
      'negotiate_deal': 'partnership_concluded',
      
      // Communication
      'social_post': 'social_post',
      'create_video': 'social_post',
      
      // B2B
      'create_quote': 'quote_sent',
      'organize_event': 'b2b_event_organized'
    };
    
    return mapping[taskId] || 'generic_task_completed';
  }

  /**
   * 👤 INTÉGRATION COMPLÈTE UTILISATEUR
   * Assigne un rôle, vérifie les badges, retourne le statut complet
   */
  async integrateUser(userId, roleId, options = {}) {
    try {
      console.log(`🎭 Intégration utilisateur complète: ${userId} -> ${roleId}`);
      
      const results = {
        roleAssigned: false,
        badgesChecked: false,
        newBadges: [],
        errors: []
      };

      // 1. Assigner le rôle
      try {
        const roleResult = await assignEscapeGameRole(userId, roleId, options.assignedBy || 'system');
        results.roleAssigned = roleResult.success;
        
        if (!roleResult.success) {
          results.errors.push(`Erreur assignation rôle: ${roleResult.message}`);
        }
      } catch (error) {
        results.errors.push(`Erreur rôle: ${error.message}`);
      }

      // 2. Vérifier les badges
      try {
        const badgeResult = await this.checkAllUserBadges(userId, {
          trigger: 'user_integration',
          type: 'first_day',
          roleId
        });
        
        results.badgesChecked = badgeResult.success;
        results.newBadges = badgeResult.newBadges || [];
        
        if (!badgeResult.success) {
          results.errors.push(`Erreur badges: ${badgeResult.error}`);
        }
      } catch (error) {
        results.errors.push(`Erreur badges: ${error.message}`);
      }

      console.log('✅ Intégration utilisateur terminée:', results);
      return results;
      
    } catch (error) {
      console.error('❌ Erreur intégration utilisateur:', error);
      return {
        roleAssigned: false,
        badgesChecked: false,
        newBadges: [],
        errors: [error.message]
      };
    }
  }

  /**
   * 🎯 COMPLÉTER UNE QUÊTE (TÂCHE) AVEC INTÉGRATION COMPLÈTE
   */
  async completeQuest(userId, roleId, taskId, options = {}) {
    try {
      console.log(`🎯 Completion quête: ${taskId} pour ${roleId}`);
      
      const results = {
        taskCompleted: false,
        xpGained: 0,
        badgesChecked: false,
        newBadges: [],
        levelUp: false,
        errors: []
      };

      // 1. Compléter la tâche dans le système de rôles
      try {
        const taskResult = await completeEscapeGameTask(userId, roleId, taskId);
        results.taskCompleted = taskResult.success;
        results.xpGained = taskResult.xpGained || 0;
        
        if (!taskResult.success) {
          results.errors.push(`Erreur tâche: ${taskResult.message}`);
        }
      } catch (error) {
        results.errors.push(`Erreur completion tâche: ${error.message}`);
      }

      // 2. Vérifier les badges
      if (results.taskCompleted) {
        try {
          const badgeResult = await this.checkAllUserBadges(userId, {
            trigger: 'quest_completed',
            type: this.mapTaskToActivityType(taskId, options.category),
            roleId,
            taskId
          });
          
          results.badgesChecked = badgeResult.success;
          results.newBadges = badgeResult.newBadges || [];
        } catch (error) {
          results.errors.push(`Erreur vérification badges: ${error.message}`);
        }
      }

      console.log('✅ Quête complétée:', results);
      return results;
      
    } catch (error) {
      console.error('❌ Erreur completion quête:', error);
      return {
        taskCompleted: false,
        xpGained: 0,
        badgesChecked: false,
        newBadges: [],
        errors: [error.message]
      };
    }
  }

  /**
   * 🏆 VÉRIFIER TOUS LES BADGES D'UN UTILISATEUR
   */
  async checkAllUserBadges(userId, activityData = {}) {
    try {
      return await checkEscapeGameBadges(userId, activityData);
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LE STATUT COMPLET D'UN UTILISATEUR
   */
  async getUserCompleteStatus(userId) {
    try {
      console.log(`📊 Récupération statut complet: ${userId}`);
      
      const status = {
        roles: {},
        badges: [],
        globalStats: {
          totalXp: 0,
          completedTasks: 0,
          earnedBadges: 0,
          activeRoles: 0
        },
        recommendations: [],
        nextObjectives: []
      };

      // Récupérer les statistiques de chaque rôle
      for (const roleId of Object.keys(ESCAPE_GAME_ROLES)) {
        try {
          const roleStats = await this.rolesService.getUserRoleStats(userId, roleId);
          if (roleStats) {
            status.roles[roleId] = roleStats;
            status.globalStats.totalXp += roleStats.roleData.xp || 0;
            status.globalStats.completedTasks += roleStats.roleData.tasksCompleted || 0;
            status.globalStats.earnedBadges += roleStats.badgeCount || 0;
            status.globalStats.activeRoles += 1;
          }
        } catch (error) {
          console.warn(`⚠️ Erreur stats rôle ${roleId}:`, error.message);
        }
      }

      // Récupérer les badges par rôle
      Object.keys(status.roles).forEach(roleId => {
        const roleBadges = getEscapeGameBadgesByRole(roleId);
        status.badges.push(...roleBadges);
      });

      // Générer des recommandations
      status.recommendations = this.generateRecommendations(status);
      status.nextObjectives = this.generateNextObjectives(status);

      console.log('✅ Statut complet récupéré:', status.globalStats);
      return status;
      
    } catch (error) {
      console.error('❌ Erreur récupération statut:', error);
      return null;
    }
  }

  /**
   * 💡 GÉNÉRER DES RECOMMANDATIONS
   */
  generateRecommendations(userStatus) {
    const recommendations = [];
    
    // Recommander des rôles basés sur l'XP actuelle
    const sortedRoles = Object.entries(userStatus.roles)
      .sort((a, b) => (b[1].roleData.xp || 0) - (a[1].roleData.xp || 0));
    
    if (sortedRoles.length > 0) {
      const topRole = sortedRoles[0];
      recommendations.push({
        type: 'role_focus',
        title: `Concentrez-vous sur ${topRole[1].role.name}`,
        description: `Vous excellez dans ce rôle avec ${topRole[1].roleData.xp} XP`,
        priority: 'high'
      });
    }

    // Recommander des badges proches
    if (userStatus.globalStats.earnedBadges < 10) {
      recommendations.push({
        type: 'badge_hunt',
        title: 'Débloquez plus de badges',
        description: 'Complétez des tâches pour gagner des badges et de l\'XP',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * 🎯 GÉNÉRER LES PROCHAINS OBJECTIFS
   */
  generateNextObjectives(userStatus) {
    const objectives = [];
    
    // Objectif XP
    const nextLevelXp = Math.ceil(userStatus.globalStats.totalXp / 1000) * 1000;
    if (nextLevelXp > userStatus.globalStats.totalXp) {
      objectives.push({
        type: 'xp_goal',
        title: `Atteindre ${nextLevelXp.toLocaleString()} XP`,
        current: userStatus.globalStats.totalXp,
        target: nextLevelXp,
        progress: (userStatus.globalStats.totalXp / nextLevelXp) * 100
      });
    }

    // Objectif badges
    const badgeTarget = Math.ceil(userStatus.globalStats.earnedBadges / 5) * 5;
    if (badgeTarget > userStatus.globalStats.earnedBadges) {
      objectives.push({
        type: 'badge_goal',
        title: `Débloquer ${badgeTarget} badges`,
        current: userStatus.globalStats.earnedBadges,
        target: badgeTarget,
        progress: (userStatus.globalStats.earnedBadges / badgeTarget) * 100
      });
    }

    return objectives;
  }

  /**
   * ⚡ FONCTIONS DE TEST RAPIDE
   */
  async quickAssignRole(userId, roleId) {
    console.log(`⚡ Test rapide: Assignation ${roleId} à ${userId}`);
    return await this.integrateUser(userId, roleId, { assignedBy: 'quick_test' });
  }

  async quickCompleteTask(userId, roleId, taskId) {
    console.log(`⚡ Test rapide: Completion tâche ${taskId}`);
    return await this.completeQuest(userId, roleId, taskId, { category: 'test' });
  }

  /**
   * 🧪 TESTER LE SYSTÈME COMPLET
   */
  async testCompleteSystem(userId = 'test_user') {
    console.log('🧪 TEST COMPLET DU SYSTÈME ESCAPE GAME');
    
    const testResults = {
      initialization: false,
      roleAssignment: false,
      taskCompletion: false,
      badgeVerification: false,
      statusRetrieval: false,
      errors: []
    };

    try {
      // 1. Test initialisation
      const initResult = await this.initialize();
      testResults.initialization = initResult.success;
      
      // 2. Test assignation rôle
      const roleResult = await this.quickAssignRole(userId, 'maintenance');
      testResults.roleAssignment = roleResult.roleAssigned;
      
      // 3. Test completion tâche
      const taskResult = await this.quickCompleteTask(userId, 'maintenance', 'repair_mechanism');
      testResults.taskCompletion = taskResult.taskCompleted;
      
      // 4. Test vérification badges
      const badgeResult = await this.checkAllUserBadges(userId, { type: 'test_verification' });
      testResults.badgeVerification = badgeResult.success;
      
      // 5. Test récupération statut
      const status = await this.getUserCompleteStatus(userId);
      testResults.statusRetrieval = status !== null;
      
      console.log('✅ Test système complet terminé:', testResults);
      return testResults;
      
    } catch (error) {
      console.error('❌ Erreur test système:', error);
      testResults.errors.push(error.message);
      return testResults;
    }
  }

  /**
   * 📋 OBTENIR LA LISTE COMPLÈTE DES FONCTIONNALITÉS
   */
  getFeatureList() {
    return {
      roles: {
        total: Object.keys(ESCAPE_GAME_ROLES).length,
        available: Object.keys(ESCAPE_GAME_ROLES),
        masteryLevels: Object.keys(ROLE_MASTERY_LEVELS).length
      },
      badges: {
        total: this.badgeEngine.allBadges.length,
        byRole: Object.keys(BADGE_ROLES).reduce((acc, roleId) => {
          acc[roleId] = getEscapeGameBadgesByRole(roleId).length;
          return acc;
        }, {})
      },
      integration: {
        eventsConnected: true,
        autoProgressionTracking: true,
        badgeAutoUnlock: true,
        xpCalculation: true
      }
    };
  }
}

// Instance singleton
const escapeGameIntegration = new EscapeGameIntegration();

// Auto-initialisation
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      escapeGameIntegration.initialize();
    });
  } else {
    escapeGameIntegration.initialize();
  }
}

// Exports
export default escapeGameIntegration;
export { escapeGameIntegration };

// Fonctions utilitaires exportées
export const initializeEscapeGameSystem = () => escapeGameIntegration.initialize();
export const integrateEscapeGameUser = (userId, roleId, options) => escapeGameIntegration.integrateUser(userId, roleId, options);
export const completeEscapeGameQuest = (userId, roleId, taskId, options) => escapeGameIntegration.completeQuest(userId, roleId, taskId, options);
export const getUserEscapeGameStatus = (userId) => escapeGameIntegration.getUserCompleteStatus(userId);

console.log('🎭 Système d\'intégration Escape Game chargé !');

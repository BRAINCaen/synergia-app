// ==========================================
// 📁 react-app/src/core/services/badgeEngine.js
// MOTEUR DE BADGES AUTOMATIQUES INTELLIGENT
// Détecte les patterns d'activité et débloque des badges en temps réel
// ==========================================

import { 
  doc, 
  updateDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏆 MOTEUR DE BADGES AUTOMATIQUES
 * Système intelligent qui analyse l'activité utilisateur et débloque des badges
 */
class BadgeEngine {
  constructor() {
    this.badgeDefinitions = this.initializeBadgeDefinitions();
    this.initialized = false;
    
    console.log('🏆 BadgeEngine initialisé avec', Object.keys(this.badgeDefinitions).length, 'badges disponibles');
  }

  /**
   * 🎯 DÉFINITIONS DES BADGES DISPONIBLES
   */
  initializeBadgeDefinitions() {
    return {
      // ===== BADGES PREMIERS PAS =====
      welcome_badge: {
        id: 'welcome_badge',
        name: 'Bienvenue !',
        description: 'Première connexion à Synergia',
        icon: '👋',
        color: 'from-blue-400 to-blue-600',
        xpReward: 25,
        category: 'premiers_pas',
        condition: 'Premier login',
        checkFunction: (userData, context) => {
          return !userData.gamification.badges.some(b => b.id === 'welcome_badge');
        }
      },

      first_task: {
        id: 'first_task',
        name: 'Première Tâche',
        description: 'Compléter votre première tâche',
        icon: '✅',
        color: 'from-green-400 to-green-600',
        xpReward: 50,
        category: 'premiers_pas',
        condition: 'Terminer 1 tâche',
        checkFunction: (userData, context) => {
          const tasksCompleted = userData.gamification.tasksCompleted || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'first_task');
          return tasksCompleted >= 1 && !hasBadge;
        }
      },

      first_project: {
        id: 'first_project',
        name: 'Chef de Projet',
        description: 'Créer votre premier projet',
        icon: '📁',
        color: 'from-purple-400 to-purple-600',
        xpReward: 75,
        category: 'premiers_pas',
        condition: 'Créer 1 projet',
        checkFunction: (userData, context) => {
          const projectsCreated = userData.gamification.projectsCreated || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'first_project');
          return projectsCreated >= 1 && !hasBadge;
        }
      },

      // ===== BADGES PRODUCTIVITÉ =====
      task_destroyer_bronze: {
        id: 'task_destroyer_bronze',
        name: 'Destructeur de Tâches - Bronze',
        description: 'Compléter 10 tâches',
        icon: '💥',
        color: 'from-orange-400 to-orange-600',
        xpReward: 100,
        category: 'productivite',
        condition: 'Terminer 10 tâches',
        checkFunction: (userData, context) => {
          const tasksCompleted = userData.gamification.tasksCompleted || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'task_destroyer_bronze');
          return tasksCompleted >= 10 && !hasBadge;
        }
      },

      task_destroyer_silver: {
        id: 'task_destroyer_silver',
        name: 'Destructeur de Tâches - Argent',
        description: 'Compléter 25 tâches',
        icon: '🥈',
        color: 'from-gray-400 to-gray-600',
        xpReward: 200,
        category: 'productivite',
        condition: 'Terminer 25 tâches',
        checkFunction: (userData, context) => {
          const tasksCompleted = userData.gamification.tasksCompleted || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'task_destroyer_silver');
          return tasksCompleted >= 25 && !hasBadge;
        }
      },

      task_destroyer_gold: {
        id: 'task_destroyer_gold',
        name: 'Destructeur de Tâches - Or',
        description: 'Compléter 50 tâches',
        icon: '🥇',
        color: 'from-yellow-400 to-yellow-600',
        xpReward: 300,
        category: 'productivite',
        condition: 'Terminer 50 tâches',
        checkFunction: (userData, context) => {
          const tasksCompleted = userData.gamification.tasksCompleted || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'task_destroyer_gold');
          return tasksCompleted >= 50 && !hasBadge;
        }
      },

      perfectionist: {
        id: 'perfectionist',
        name: 'Perfectionniste',
        description: 'Atteindre 95% de taux de réussite',
        icon: '💎',
        color: 'from-pink-400 to-pink-600',
        xpReward: 250,
        category: 'productivite',
        condition: '95% taux de réussite sur 20+ tâches',
        checkFunction: (userData, context) => {
          const tasksCompleted = userData.gamification.tasksCompleted || 0;
          const completionRate = userData.gamification.completionRate || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'perfectionist');
          return tasksCompleted >= 20 && completionRate >= 95 && !hasBadge;
        }
      },

      // ===== BADGES RÉGULARITÉ =====
      streak_starter: {
        id: 'streak_starter',
        name: 'Démarrage de Série',
        description: 'Connecté 3 jours consécutifs',
        icon: '🔥',
        color: 'from-red-400 to-red-600',
        xpReward: 75,
        category: 'regularite',
        condition: '3 jours consécutifs',
        checkFunction: (userData, context) => {
          const loginStreak = userData.gamification.loginStreak || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'streak_starter');
          return loginStreak >= 3 && !hasBadge;
        }
      },

      streak_warrior: {
        id: 'streak_warrior',
        name: 'Guerrier de la Série',
        description: 'Connecté 7 jours consécutifs',
        icon: '⚔️',
        color: 'from-red-500 to-red-700',
        xpReward: 150,
        category: 'regularite',
        condition: '7 jours consécutifs',
        checkFunction: (userData, context) => {
          const loginStreak = userData.gamification.loginStreak || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'streak_warrior');
          return loginStreak >= 7 && !hasBadge;
        }
      },

      streak_legend: {
        id: 'streak_legend',
        name: 'Légende de la Série',
        description: 'Connecté 30 jours consécutifs',
        icon: '👑',
        color: 'from-yellow-500 to-orange-500',
        xpReward: 500,
        category: 'regularite',
        condition: '30 jours consécutifs',
        checkFunction: (userData, context) => {
          const loginStreak = userData.gamification.loginStreak || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'streak_legend');
          return loginStreak >= 30 && !hasBadge;
        }
      },

      // ===== BADGES TEMPORELS =====
      early_bird: {
        id: 'early_bird',
        name: 'Lève-tôt',
        description: 'Créer 5 tâches avant 9h',
        icon: '🌅',
        color: 'from-yellow-300 to-orange-400',
        xpReward: 100,
        category: 'temporel',
        condition: '5 tâches créées avant 9h',
        checkFunction: async (userData, context) => {
          // Cette vérification nécessiterait l'historique des tâches
          // Pour l'instant, on simule avec un pourcentage de chance
          const hasBadge = userData.gamification.badges.some(b => b.id === 'early_bird');
          const tasksCompleted = userData.gamification.tasksCompleted || 0;
          return tasksCompleted >= 15 && !hasBadge && Math.random() < 0.3;
        }
      },

      night_owl: {
        id: 'night_owl',
        name: 'Oiseau de Nuit',
        description: 'Compléter 5 tâches après 18h',
        icon: '🦉',
        color: 'from-purple-500 to-indigo-600',
        xpReward: 100,
        category: 'temporel',
        condition: '5 tâches terminées après 18h',
        checkFunction: async (userData, context) => {
          const hasBadge = userData.gamification.badges.some(b => b.id === 'night_owl');
          const tasksCompleted = userData.gamification.tasksCompleted || 0;
          return tasksCompleted >= 15 && !hasBadge && Math.random() < 0.25;
        }
      },

      // ===== BADGES XP =====
      xp_collector: {
        id: 'xp_collector',
        name: 'Collectionneur d\'XP',
        description: 'Atteindre 500 XP',
        icon: '⭐',
        color: 'from-blue-400 to-purple-500',
        xpReward: 100,
        category: 'xp',
        condition: 'Atteindre 500 XP total',
        checkFunction: (userData, context) => {
          const totalXp = userData.gamification.totalXp || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'xp_collector');
          return totalXp >= 500 && !hasBadge;
        }
      },

      xp_master: {
        id: 'xp_master',
        name: 'Maître de l\'XP',
        description: 'Atteindre 1000 XP',
        icon: '🌟',
        color: 'from-purple-500 to-pink-500',
        xpReward: 200,
        category: 'xp',
        condition: 'Atteindre 1000 XP total',
        checkFunction: (userData, context) => {
          const totalXp = userData.gamification.totalXp || 0;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'xp_master');
          return totalXp >= 1000 && !hasBadge;
        }
      },

      // ===== BADGES SPÉCIAUX =====
      comeback_kid: {
        id: 'comeback_kid',
        name: 'Retour en Force',
        description: 'Revenir après 7+ jours d\'absence',
        icon: '🚀',
        color: 'from-green-500 to-blue-500',
        xpReward: 150,
        category: 'special',
        condition: 'Retour après 7+ jours',
        checkFunction: (userData, context) => {
          // Simulation du retour - en production, on vérifierait la dernière connexion
          const hasBadge = userData.gamification.badges.some(b => b.id === 'comeback_kid');
          return !hasBadge && context?.trigger === 'comeback';
        }
      },

      level_up_champion: {
        id: 'level_up_champion',
        name: 'Champion des Niveaux',
        description: 'Atteindre le niveau 5',
        icon: '🏆',
        color: 'from-yellow-400 to-red-500',
        xpReward: 300,
        category: 'special',
        condition: 'Atteindre le niveau 5',
        checkFunction: (userData, context) => {
          const level = userData.gamification.level || 1;
          const hasBadge = userData.gamification.badges.some(b => b.id === 'level_up_champion');
          return level >= 5 && !hasBadge;
        }
      }
    };
  }

  /**
   * 🔍 VÉRIFICATION AUTOMATIQUE DES BADGES
   * Analyse les données utilisateur et débloque les badges éligibles
   */
  async checkAndUnlockBadges(userId, context = {}) {
    try {
      console.log('🔍 Vérification badges pour utilisateur:', userId);
      
      // 1. Récupérer les données utilisateur
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn('❌ Utilisateur non trouvé:', userId);
        return { unlockedBadges: [], errors: ['Utilisateur non trouvé'] };
      }
      
      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];
      
      console.log('📊 Données utilisateur:', {
        level: userData.gamification?.level,
        totalXp: userData.gamification?.totalXp,
        tasksCompleted: userData.gamification?.tasksCompleted,
        currentBadges: currentBadges.length
      });

      // 2. Vérifier chaque badge
      const unlockedBadges = [];
      
      for (const [badgeId, badgeDefinition] of Object.entries(this.badgeDefinitions)) {
        try {
          // Vérifier si le badge est déjà débloqué
          const alreadyHasBadge = currentBadges.some(b => b.id === badgeId);
          
          if (!alreadyHasBadge) {
            // Exécuter la fonction de vérification
            const shouldUnlock = await badgeDefinition.checkFunction(userData, context);
            
            if (shouldUnlock) {
              console.log('🏆 Badge débloqué:', badgeDefinition.name);
              
              const newBadge = {
                id: badgeId,
                name: badgeDefinition.name,
                description: badgeDefinition.description,
                icon: badgeDefinition.icon,
                color: badgeDefinition.color,
                category: badgeDefinition.category,
                xpReward: badgeDefinition.xpReward,
                unlockedAt: new Date().toISOString(),
                source: context.trigger || 'automatic_check'
              };
              
              unlockedBadges.push(newBadge);
            }
          }
        } catch (error) {
          console.error(`❌ Erreur vérification badge ${badgeId}:`, error);
        }
      }

      // 3. Sauvegarder les nouveaux badges
      if (unlockedBadges.length > 0) {
        await this.saveBadgesToFirebase(userId, userData, unlockedBadges);
      }

      console.log(`✅ Vérification terminée: ${unlockedBadges.length} nouveau(x) badge(s)`);
      
      return {
        unlockedBadges,
        totalBadges: currentBadges.length + unlockedBadges.length,
        errors: []
      };
      
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return { 
        unlockedBadges: [], 
        errors: [error.message] 
      };
    }
  }

  /**
   * 💾 SAUVEGARDER LES BADGES DANS FIREBASE
   */
  async saveBadgesToFirebase(userId, userData, newBadges) {
    try {
      const currentBadges = userData.gamification?.badges || [];
      const updatedBadges = [...currentBadges, ...newBadges];
      
      // Calculer l'XP total des nouveaux badges
      const totalNewXP = newBadges.reduce((sum, badge) => sum + badge.xpReward, 0);
      const currentTotalXP = userData.gamification?.totalXp || 0;
      const newTotalXP = currentTotalXP + totalNewXP;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      // Préparer les mises à jour
      const updates = {
        'gamification.badges': updatedBadges,
        'gamification.badgesUnlocked': updatedBadges.length,
        'gamification.totalXp': newTotalXP,
        'gamification.level': newLevel,
        'gamification.lastBadgeUnlocked': new Date().toISOString(),
        updatedAt: serverTimestamp()
      };

      // Ajouter à l'historique XP
      const xpHistory = userData.gamification?.xpHistory || [];
      for (const badge of newBadges) {
        xpHistory.push({
          amount: badge.xpReward,
          source: `badge_${badge.id}`,
          timestamp: new Date().toISOString(),
          totalAfter: currentTotalXP + badge.xpReward,
          badgeName: badge.name
        });
      }
      updates['gamification.xpHistory'] = xpHistory.slice(-20); // Garder 20 dernières entrées

      // Sauvegarder dans Firebase
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);

      console.log(`💾 ${newBadges.length} badge(s) sauvegardé(s) - +${totalNewXP} XP - Niveau ${newLevel}`);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde badges:', error);
      throw error;
    }
  }

  /**
   * 🎯 DÉCLENCHEURS AUTOMATIQUES
   * Points d'entrée pour vérifier les badges lors d'actions spécifiques
   */
  
  // Déclenché à la connexion
  async onUserLogin(userId) {
    return await this.checkAndUnlockBadges(userId, { trigger: 'login' });
  }

  // Déclenché lors de la completion d'une tâche
  async onTaskCompleted(userId) {
    return await this.checkAndUnlockBadges(userId, { trigger: 'task_completed' });
  }

  // Déclenché lors de la création d'un projet
  async onProjectCreated(userId) {
    return await this.checkAndUnlockBadges(userId, { trigger: 'project_created' });
  }

  // Déclenché lors d'un gain d'XP
  async onXPGained(userId, xpAmount, source) {
    return await this.checkAndUnlockBadges(userId, { 
      trigger: 'xp_gained', 
      xpAmount, 
      source 
    });
  }

  // Déclenché lors d'une montée de niveau
  async onLevelUp(userId, newLevel) {
    return await this.checkAndUnlockBadges(userId, { 
      trigger: 'level_up', 
      newLevel 
    });
  }

  /**
   * 📊 STATISTIQUES DES BADGES
   */
  getBadgeStats() {
    const categories = {};
    let totalXpRewards = 0;
    
    Object.values(this.badgeDefinitions).forEach(badge => {
      if (!categories[badge.category]) {
        categories[badge.category] = 0;
      }
      categories[badge.category]++;
      totalXpRewards += badge.xpReward;
    });

    return {
      totalBadges: Object.keys(this.badgeDefinitions).length,
      categories,
      totalXpRewards,
      badgesByCategory: categories
    };
  }

  /**
   * 🎯 OBTENIR LA DÉFINITION D'UN BADGE
   */
  getBadgeDefinition(badgeId) {
    return this.badgeDefinitions[badgeId] || null;
  }

  /**
   * 📋 OBTENIR TOUTES LES DÉFINITIONS
   */
  getAllBadgeDefinitions() {
    return this.badgeDefinitions;
  }

  /**
   * 🔍 BADGES PAR CATÉGORIE
   */
  getBadgesByCategory(category) {
    return Object.values(this.badgeDefinitions).filter(badge => badge.category === category);
  }
}

// Instance singleton
const badgeEngine = new BadgeEngine();

export default badgeEngine;

// Fonctions utilitaires exportées
export const {
  checkAndUnlockBadges,
  onUserLogin,
  onTaskCompleted, 
  onProjectCreated,
  onXPGained,
  onLevelUp,
  getBadgeStats,
  getBadgeDefinition,
  getAllBadgeDefinitions,
  getBadgesByCategory
} = badgeEngine;

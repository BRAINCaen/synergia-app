// ==========================================
// 📁 react-app/src/core/services/roleBadgeSystem.js
// SYSTÈME DE BADGES EXCLUSIFS PAR RÔLE
// Badges spéciaux qui se débloquent selon la progression dans les rôles
// ==========================================

import { db } from '../firebase/config.js';
import { doc, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';
import roleUnlockService from './roleUnlockService.js';
import { SYNERGIA_ROLES } from './synergiaRolesService.js';

/**
 * 🏆 DÉFINITION DES BADGES EXCLUSIFS PAR RÔLE
 */
export const ROLE_EXCLUSIVE_BADGES = {
  // 🔧 MAINTENANCE - Badges d'expertise technique
  maintenance: {
    NOVICE: [
      {
        id: 'tool_apprentice',
        name: 'Apprenti Mécanicien',
        description: 'Maîtrise des outils de base et des procédures de sécurité',
        icon: '🔧',
        rarity: 'common',
        color: 'bg-orange-500',
        xpReward: 25,
        condition: {
          tasksCompleted: 5,
          category: 'repair',
          timeInRole: 7 // jours
        }
      },
      {
        id: 'safety_guardian',
        name: 'Gardien de la Sécurité',
        description: 'Vigilance exceptionnelle en matière de sécurité',
        icon: '🛡️',
        rarity: 'uncommon',
        color: 'bg-blue-500',
        xpReward: 50,
        condition: {
          tasksCompleted: 10,
          category: 'safety',
          streakDays: 14
        }
      }
    ],
    APPRENTI: [
      {
        id: 'repair_specialist',
        name: 'Spécialiste Réparation',
        description: 'Expertise avancée en résolution de problèmes techniques',
        icon: '⚙️',
        rarity: 'rare',
        color: 'bg-purple-500',
        xpReward: 100,
        condition: {
          tasksCompleted: 25,
          category: 'repair',
          difficulty: 'Moyen',
          averageTime: 'under_estimate'
        }
      },
      {
        id: 'efficiency_master',
        name: 'Maître de l\'Efficacité',
        description: 'Optimisation remarquable des processus de maintenance',
        icon: '⚡',
        rarity: 'rare',
        color: 'bg-yellow-500',
        xpReward: 150,
        condition: {
          tasksCompleted: 15,
          category: 'optimization',
          efficiency: 85 // pourcentage
        }
      }
    ],
    COMPETENT: [
      {
        id: 'innovation_pioneer',
        name: 'Pionnier de l\'Innovation',
        description: 'Introduction de nouvelles méthodes révolutionnaires',
        icon: '🚀',
        rarity: 'epic',
        color: 'bg-indigo-500',
        xpReward: 250,
        condition: {
          tasksCompleted: 50,
          innovations: 3,
          teamImpact: 'high'
        }
      }
    ],
    EXPERT: [
      {
        id: 'maintenance_sage',
        name: 'Sage de la Maintenance',
        description: 'Maîtrise légendaire de tous les aspects techniques',
        icon: '🧙‍♂️',
        rarity: 'legendary',
        color: 'bg-gradient-to-r from-purple-600 to-pink-600',
        xpReward: 500,
        condition: {
          tasksCompleted: 100,
          mentoring: 10,
          systemsOptimized: 5
        }
      }
    ],
    MAITRE: [
      {
        id: 'facility_deity',
        name: 'Divinité des Installations',
        description: 'Transcendance absolue dans l\'art de la maintenance',
        icon: '🌟',
        rarity: 'mythic',
        color: 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
        xpReward: 1000,
        condition: {
          tasksCompleted: 500,
          yearsExperience: 2,
          industryRecognition: true
        }
      }
    ]
  },

  // ⭐ REPUTATION - Badges de maîtrise relationnelle
  reputation: {
    NOVICE: [
      {
        id: 'voice_listener',
        name: 'Écouteur de Voix',
        description: 'Attention remarquable aux retours clients',
        icon: '👂',
        rarity: 'common',
        color: 'bg-green-500',
        xpReward: 30,
        condition: {
          reviewsProcessed: 50,
          responseTime: 'fast'
        }
      }
    ],
    APPRENTI: [
      {
        id: 'sentiment_analyst',
        name: 'Analyste de Sentiment',
        description: 'Compréhension intuitive des émotions clients',
        icon: '💭',
        rarity: 'rare',
        color: 'bg-blue-500',
        xpReward: 100,
        condition: {
          sentimentAnalyses: 25,
          accuracy: 90
        }
      },
      {
        id: 'crisis_resolver',
        name: 'Résolveur de Crise',
        description: 'Maîtrise exceptionnelle de la gestion de crise',
        icon: '🚨',
        rarity: 'epic',
        color: 'bg-red-500',
        xpReward: 200,
        condition: {
          crisesResolved: 5,
          satisfactionImprovement: 20
        }
      }
    ],
    COMPETENT: [
      {
        id: 'brand_architect',
        name: 'Architecte de Marque',
        description: 'Construction stratégique de l\'image de marque',
        icon: '🏗️',
        rarity: 'epic',
        color: 'bg-purple-500',
        xpReward: 300,
        condition: {
          campaignsLaunched: 10,
          brandMetricsImprovement: 25
        }
      }
    ],
    EXPERT: [
      {
        id: 'reputation_oracle',
        name: 'Oracle de la Réputation',
        description: 'Vision prophétique des tendances de réputation',
        icon: '🔮',
        rarity: 'legendary',
        color: 'bg-gradient-to-r from-blue-600 to-purple-600',
        xpReward: 500,
        condition: {
          predictionsAccurate: 15,
          strategiesImplemented: 8
        }
      }
    ]
  },

  // 📦 STOCK - Badges de maîtrise logistique
  stock: {
    NOVICE: [
      {
        id: 'inventory_tracker',
        name: 'Traqueur d\'Inventaire',
        description: 'Précision remarquable dans le suivi des stocks',
        icon: '📋',
        rarity: 'common',
        color: 'bg-gray-500',
        xpReward: 25,
        condition: {
          inventoriesCompleted: 10,
          accuracy: 95
        }
      }
    ],
    APPRENTI: [
      {
        id: 'supply_chain_navigator',
        name: 'Navigateur de Chaîne d\'Approvisionnement',
        description: 'Maîtrise des flux logistiques complexes',
        icon: '🧭',
        rarity: 'rare',
        color: 'bg-blue-500',
        xpReward: 120,
        condition: {
          suppliersManaged: 15,
          optimizationsImplemented: 5
        }
      }
    ],
    COMPETENT: [
      {
        id: 'logistics_wizard',
        name: 'Magicien de la Logistique',
        description: 'Orchestration magique des approvisionnements',
        icon: '🎩',
        rarity: 'epic',
        color: 'bg-purple-500',
        xpReward: 250,
        condition: {
          costSavings: 50000, // euros
          efficiencyGains: 30
        }
      }
    ]
  },

  // 📋 ORGANIZATION - Badges de maîtrise organisationnelle
  organization: {
    NOVICE: [
      {
        id: 'task_coordinator',
        name: 'Coordinateur de Tâches',
        description: 'Organisation méthodique du travail d\'équipe',
        icon: '📅',
        rarity: 'common',
        color: 'bg-green-500',
        xpReward: 30,
        condition: {
          tasksOrganized: 50,
          teamSatisfaction: 80
        }
      }
    ],
    APPRENTI: [
      {
        id: 'workflow_designer',
        name: 'Designer de Flux',
        description: 'Création de processus élégants et efficaces',
        icon: '🎨',
        rarity: 'rare',
        color: 'bg-blue-500',
        xpReward: 100,
        condition: {
          workflowsCreated: 8,
          efficiencyImprovement: 25
        }
      }
    ],
    COMPETENT: [
      {
        id: 'efficiency_architect',
        name: 'Architecte de l\'Efficacité',
        description: 'Conception de systèmes organisationnels optimaux',
        icon: '🏛️',
        rarity: 'epic',
        color: 'bg-purple-500',
        xpReward: 200,
        condition: {
          systemsDesigned: 5,
          productivityGains: 40
        }
      }
    ]
  },

  // 🎨 CONTENT - Badges de maîtrise créative
  content: {
    NOVICE: [
      {
        id: 'visual_storyteller',
        name: 'Conteur Visuel',
        description: 'Narration captivante par l\'image',
        icon: '🎭',
        rarity: 'common',
        color: 'bg-pink-500',
        xpReward: 35,
        condition: {
          visualsCreated: 25,
          engagement: 75
        }
      }
    ],
    APPRENTI: [
      {
        id: 'brand_artist',
        name: 'Artiste de Marque',
        description: 'Expression créative de l\'identité de marque',
        icon: '🎨',
        rarity: 'rare',
        color: 'bg-purple-500',
        xpReward: 120,
        condition: {
          campaignsCreated: 10,
          brandConsistency: 90
        }
      }
    ],
    COMPETENT: [
      {
        id: 'creative_visionary',
        name: 'Visionnaire Créatif',
        description: 'Innovation révolutionnaire dans la création',
        icon: '👁️',
        rarity: 'epic',
        color: 'bg-indigo-500',
        xpReward: 250,
        condition: {
          innovativeProjects: 5,
          industryRecognition: true
        }
      }
    ]
  },

  // 🎓 MENTORING - Badges de sagesse partagée
  mentoring: {
    NOVICE: [
      {
        id: 'knowledge_sharer',
        name: 'Partageur de Savoir',
        description: 'Générosité dans la transmission des connaissances',
        icon: '🤝',
        rarity: 'common',
        color: 'bg-green-500',
        xpReward: 40,
        condition: {
          helpSessions: 20,
          feedback: 85
        }
      }
    ],
    APPRENTI: [
      {
        id: 'skill_cultivator',
        name: 'Cultivateur de Compétences',
        description: 'Développement méthodique des talents',
        icon: '🌱',
        rarity: 'rare',
        color: 'bg-blue-500',
        xpReward: 150,
        condition: {
          menteesGuided: 5,
          skillImprovements: 15
        }
      }
    ],
    COMPETENT: [
      {
        id: 'wisdom_keeper',
        name: 'Gardien de la Sagesse',
        description: 'Conservation et transmission de la sagesse organisationnelle',
        icon: '📚',
        rarity: 'epic',
        color: 'bg-purple-500',
        xpReward: 300,
        condition: {
          knowledgeBaseContributions: 50,
          mentoringPrograms: 3
        }
      }
    ]
  }
};

/**
 * 🎯 SERVICE PRINCIPAL DES BADGES PAR RÔLE
 */
class RoleBadgeSystem {

  /**
   * 🔍 VÉRIFIER LES BADGES DISPONIBLES POUR UN UTILISATEUR
   */
  checkRoleBadges(userId, userRoles = {}, userStats = {}) {
    const availableBadges = [];
    const earnedBadges = userStats.badges || [];

    Object.entries(userRoles).forEach(([roleId, roleData]) => {
      const roleLevel = roleUnlockService.calculateRoleLevel(roleData.xp || 0);
      const roleBadges = ROLE_EXCLUSIVE_BADGES[roleId];

      if (roleBadges && roleBadges[roleLevel]) {
        const levelBadges = roleBadges[roleLevel];

        levelBadges.forEach(badge => {
          // Vérifier si le badge n'est pas déjà obtenu
          if (!earnedBadges.some(earned => earned.id === badge.id)) {
            // Vérifier les conditions
            if (this.checkBadgeConditions(badge, userStats, roleData)) {
              availableBadges.push({
                ...badge,
                roleId,
                roleLevel,
                canEarn: true
              });
            } else {
              availableBadges.push({
                ...badge,
                roleId,
                roleLevel,
                canEarn: false,
                progress: this.calculateBadgeProgress(badge, userStats, roleData)
              });
            }
          }
        });
      }
    });

    return availableBadges;
  }

  /**
   * ✅ VÉRIFIER LES CONDITIONS D'UN BADGE
   */
  checkBadgeConditions(badge, userStats = {}, roleData = {}) {
    const condition = badge.condition;
    if (!condition) return true;

    // Vérifier chaque condition
    for (const [key, requiredValue] of Object.entries(condition)) {
      switch (key) {
        case 'tasksCompleted':
          if ((userStats.tasksCompleted || 0) < requiredValue) return false;
          break;
          
        case 'category':
          const categoryTasks = userStats.tasksByCategory?.[requiredValue]?.completed || 0;
          if (categoryTasks < (condition.tasksCompleted || 1)) return false;
          break;
          
        case 'difficulty':
          const difficultyTasks = userStats.tasksByDifficulty?.[requiredValue]?.completed || 0;
          if (difficultyTasks < (condition.tasksCompleted || 1)) return false;
          break;
          
        case 'timeInRole':
          const roleAge = this.calculateRoleAge(roleData);
          if (roleAge < requiredValue) return false;
          break;
          
        case 'streakDays':
          if ((userStats.longestStreak || 0) < requiredValue) return false;
          break;
          
        case 'efficiency':
          if ((userStats.averageEfficiency || 0) < requiredValue) return false;
          break;
          
        case 'averageTime':
          if (requiredValue === 'under_estimate') {
            if ((userStats.averageTimeRatio || 1) >= 1) return false;
          }
          break;
          
        case 'reviewsProcessed':
          if ((userStats.reviewsProcessed || 0) < requiredValue) return false;
          break;
          
        case 'responseTime':
          if (requiredValue === 'fast' && (userStats.averageResponseTime || Infinity) > 3600) return false;
          break;
          
        case 'accuracy':
          if ((userStats.accuracy || 0) < requiredValue) return false;
          break;
          
        case 'mentoring':
          if ((userStats.mentoringSessions || 0) < requiredValue) return false;
          break;
          
        case 'innovations':
          if ((userStats.innovations || 0) < requiredValue) return false;
          break;
          
        default:
          // Condition non reconnue, on considère comme vraie
          break;
      }
    }

    return true;
  }

  /**
   * 📊 CALCULER LA PROGRESSION VERS UN BADGE
   */
  calculateBadgeProgress(badge, userStats = {}, roleData = {}) {
    const condition = badge.condition;
    if (!condition) return 100;

    const progress = {};
    let totalProgress = 0;
    let conditionCount = 0;

    for (const [key, requiredValue] of Object.entries(condition)) {
      let currentValue = 0;
      let progressPercent = 0;

      switch (key) {
        case 'tasksCompleted':
          currentValue = userStats.tasksCompleted || 0;
          progressPercent = Math.min((currentValue / requiredValue) * 100, 100);
          break;
          
        case 'timeInRole':
          currentValue = this.calculateRoleAge(roleData);
          progressPercent = Math.min((currentValue / requiredValue) * 100, 100);
          break;
          
        case 'streakDays':
          currentValue = userStats.longestStreak || 0;
          progressPercent = Math.min((currentValue / requiredValue) * 100, 100);
          break;
          
        case 'efficiency':
          currentValue = userStats.averageEfficiency || 0;
          progressPercent = Math.min((currentValue / requiredValue) * 100, 100);
          break;
          
        case 'accuracy':
          currentValue = userStats.accuracy || 0;
          progressPercent = Math.min((currentValue / requiredValue) * 100, 100);
          break;
          
        default:
          progressPercent = 50; // Valeur par défaut pour les conditions non mesurables
          break;
      }

      progress[key] = {
        current: currentValue,
        required: requiredValue,
        percent: progressPercent
      };

      totalProgress += progressPercent;
      conditionCount++;
    }

    return {
      overall: conditionCount > 0 ? totalProgress / conditionCount : 0,
      details: progress
    };
  }

  /**
   * 🕒 CALCULER L'ÂGE D'UN RÔLE EN JOURS
   */
  calculateRoleAge(roleData) {
    if (!roleData.assignedAt) return 0;
    
    const assignedDate = roleData.assignedAt.toDate ? roleData.assignedAt.toDate() : new Date(roleData.assignedAt);
    const now = new Date();
    const diffTime = Math.abs(now - assignedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 🏆 ATTRIBUER UN BADGE AUTOMATIQUEMENT
   */
  async awardRoleBadge(userId, badge, context = {}) {
    try {
      const userRef = doc(db, 'teamMembers', userId);
      
      const badgeData = {
        ...badge,
        earnedAt: serverTimestamp(),
        earnedBy: 'role_system',
        context: {
          ...context,
          automatic: true
        }
      };

      // Ajouter le badge à la collection utilisateur
      await updateDoc(userRef, {
        [`badges.${badge.id}`]: badgeData,
        badgeCount: arrayUnion(badge.id),
        [`stats.totalXp`]: increment(badge.xpReward || 0)
      });

      // Déclencher notification
      this.triggerBadgeNotification(userId, badgeData);

      console.log('🏆 Badge de rôle attribué:', { userId, badgeId: badge.id, xp: badge.xpReward });

      return {
        success: true,
        badge: badgeData
      };

    } catch (error) {
      console.error('❌ Erreur attribution badge de rôle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎊 DÉCLENCHER LA NOTIFICATION DE BADGE
   */
  triggerBadgeNotification(userId, badge) {
    try {
      // Événement personnalisé pour les notifications
      if (typeof window !== 'undefined') {
        const badgeEvent = new CustomEvent('roleBadgeEarned', {
          detail: {
            userId,
            badge,
            timestamp: new Date()
          }
        });
        window.dispatchEvent(badgeEvent);
      }

      // Intégration avec le système de notifications
      if (window.badgeSystem) {
        window.badgeSystem.showNotification?.(badge);
      }

    } catch (error) {
      console.error('❌ Erreur notification badge:', error);
    }
  }

  /**
   * 🔄 VÉRIFICATION AUTOMATIQUE DES BADGES
   */
  async autoCheckRoleBadges(userId, userRoles = {}, userStats = {}) {
    try {
      console.log('🔍 Vérification automatique des badges de rôle pour:', userId);

      const availableBadges = this.checkRoleBadges(userId, userRoles, userStats);
      const earnableBadges = availableBadges.filter(badge => badge.canEarn);
      const awardedBadges = [];

      // Attribuer tous les badges débloqués
      for (const badge of earnableBadges) {
        const result = await this.awardRoleBadge(userId, badge, {
          trigger: 'auto_check',
          roleId: badge.roleId,
          roleLevel: badge.roleLevel
        });

        if (result.success) {
          awardedBadges.push(result.badge);
        }
      }

      return {
        success: true,
        checkedBadges: availableBadges.length,
        awardedBadges: awardedBadges.length,
        badges: awardedBadges
      };

    } catch (error) {
      console.error('❌ Erreur vérification automatique badges:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE BADGES PAR RÔLE
   */
  getRoleBadgeStats(userRoles = {}, earnedBadges = []) {
    const stats = {
      totalAvailable: 0,
      totalEarned: 0,
      byRole: {},
      byRarity: {
        common: { available: 0, earned: 0 },
        uncommon: { available: 0, earned: 0 },
        rare: { available: 0, earned: 0 },
        epic: { available: 0, earned: 0 },
        legendary: { available: 0, earned: 0 },
        mythic: { available: 0, earned: 0 }
      },
      completionPercentage: 0
    };

    // Compter les badges disponibles par rôle et niveau
    Object.entries(userRoles).forEach(([roleId, roleData]) => {
      const roleLevel = roleUnlockService.calculateRoleLevel(roleData.xp || 0);
      const roleBadges = ROLE_EXCLUSIVE_BADGES[roleId];

      if (!stats.byRole[roleId]) {
        stats.byRole[roleId] = {
          available: 0,
          earned: 0,
          byLevel: {}
        };
      }

      if (roleBadges && roleBadges[roleLevel]) {
        const levelBadges = roleBadges[roleLevel];
        stats.byRole[roleId].available += levelBadges.length;
        stats.totalAvailable += levelBadges.length;

        levelBadges.forEach(badge => {
          // Compter par rareté
          if (stats.byRarity[badge.rarity]) {
            stats.byRarity[badge.rarity].available++;
          }

          // Vérifier si le badge est obtenu
          if (earnedBadges.some(earned => earned.id === badge.id)) {
            stats.byRole[roleId].earned++;
            stats.totalEarned++;
            if (stats.byRarity[badge.rarity]) {
              stats.byRarity[badge.rarity].earned++;
            }
          }
        });
      }
    });

    // Calculer le pourcentage de completion
    stats.completionPercentage = stats.totalAvailable > 0 
      ? (stats.totalEarned / stats.totalAvailable) * 100 
      : 0;

    return stats;
  }

  /**
   * 🎯 OBTENIR LES PROCHAINS BADGES À DÉBLOQUER
   */
  getNextBadgesToUnlock(userId, userRoles = {}, userStats = {}, limit = 5) {
    const availableBadges = this.checkRoleBadges(userId, userRoles, userStats);
    const unlockedBadges = availableBadges.filter(badge => !badge.canEarn);

    // Trier par progression (plus proche de être débloqué)
    const sortedBadges = unlockedBadges
      .filter(badge => badge.progress && badge.progress.overall > 0)
      .sort((a, b) => b.progress.overall - a.progress.overall)
      .slice(0, limit);

    return sortedBadges.map(badge => ({
      ...badge,
      estimatedTimeToUnlock: this.estimateTimeToUnlock(badge, userStats),
      priorityScore: this.calculateBadgePriority(badge)
    }));
  }

  /**
   * ⏱️ ESTIMER LE TEMPS POUR DÉBLOQUER UN BADGE
   */
  estimateTimeToUnlock(badge, userStats = {}) {
    const progress = badge.progress;
    if (!progress || progress.overall >= 100) return 0;

    // Estimation basée sur la progression actuelle et le rythme moyen
    const remainingProgress = 100 - progress.overall;
    const averageProgressPerDay = userStats.averageProgressPerDay || 5; // 5% par jour par défaut
    
    return Math.ceil(remainingProgress / averageProgressPerDay);
  }

  /**
   * 🎯 CALCULER LA PRIORITÉ D'UN BADGE
   */
  calculateBadgePriority(badge) {
    let score = 0;

    // Score basé sur la rareté
    const rarityScores = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 5,
      legendary: 8,
      mythic: 13
    };
    score += rarityScores[badge.rarity] || 1;

    // Score basé sur la progression
    if (badge.progress) {
      score += badge.progress.overall / 10;
    }

    // Score basé sur la récompense XP
    score += (badge.xpReward || 0) / 50;

    return score;
  }

  /**
   * 🏆 OBTENIR LE LEADERBOARD DES BADGES PAR RÔLE
   */
  async getRoleBadgeLeaderboard(roleId, limit = 10) {
    try {
      // Cette méthode nécessiterait une requête Firebase pour obtenir les données de tous les utilisateurs
      // Pour l'instant, on retourne un placeholder
      
      const leaderboard = [];
      
      // TODO: Implémenter la logique de leaderboard avec Firebase
      // - Récupérer tous les utilisateurs avec ce rôle
      // - Compter leurs badges de rôle
      // - Trier par nombre de badges et rareté
      
      return {
        success: true,
        roleId,
        leaderboard,
        myRank: null
      };

    } catch (error) {
      console.error('❌ Erreur leaderboard badges:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎨 OBTENIR LES COULEURS ET STYLES PAR RARETÉ
   */
  getRarityStyles(rarity) {
    const styles = {
      common: {
        color: 'text-gray-400',
        bg: 'bg-gray-500/20',
        border: 'border-gray-500',
        glow: '',
        animation: ''
      },
      uncommon: {
        color: 'text-green-400',
        bg: 'bg-green-500/20',
        border: 'border-green-500',
        glow: 'shadow-green-500/20',
        animation: ''
      },
      rare: {
        color: 'text-blue-400',
        bg: 'bg-blue-500/20',
        border: 'border-blue-500',
        glow: 'shadow-blue-500/30',
        animation: 'animate-pulse'
      },
      epic: {
        color: 'text-purple-400',
        bg: 'bg-purple-500/20',
        border: 'border-purple-500',
        glow: 'shadow-purple-500/40',
        animation: 'animate-pulse'
      },
      legendary: {
        color: 'text-yellow-400',
        bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
        border: 'border-yellow-500',
        glow: 'shadow-yellow-500/50',
        animation: 'animate-bounce'
      },
      mythic: {
        color: 'text-pink-400',
        bg: 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20',
        border: 'border-pink-500',
        glow: 'shadow-pink-500/60',
        animation: 'animate-spin'
      }
    };

    return styles[rarity] || styles.common;
  }

  /**
   * 🔗 INTÉGRER AVEC LE SYSTÈME DE GAMIFICATION EXISTANT
   */
  integrateWithGamificationSystem() {
    // Intégration avec le badgeEngine existant
    if (typeof window !== 'undefined') {
      window.roleBadgeSystem = this;

      // Écouter les événements de progression de rôle
      window.addEventListener('roleUnlock', (event) => {
        const { userId, roleId, level } = event.detail;
        
        // Vérifier les nouveaux badges disponibles
        setTimeout(() => {
          this.autoCheckRoleBadges(userId, { [roleId]: { level } }, {})
            .then(result => {
              if (result.success && result.awardedBadges > 0) {
                console.log(`🎉 ${result.awardedBadges} nouveaux badges de rôle débloqués!`);
              }
            });
        }, 1000);
      });

      // Écouter les événements de completion de tâche
      window.addEventListener('taskCompleted', (event) => {
        const { userId, roleId, category } = event.detail;
        
        // Déclencher une vérification ciblée
        setTimeout(() => {
          // Logique de vérification spécifique aux tâches
        }, 500);
      });
    }
  }

  /**
   * 🎮 INITIALISER LE SYSTÈME DE BADGES DE RÔLE
   */
  initialize() {
    console.log('🚀 Initialisation du système de badges de rôle...');
    
    this.integrateWithGamificationSystem();
    
    console.log('✅ Système de badges de rôle initialisé!');
    
    return this;
  }

  /**
   * 🧪 MÉTHODES DE TEST ET DEBUG
   */
  debugBadgeSystem(userId, userRoles = {}) {
    console.log('🧪 DEBUG - Système de badges de rôle');
    console.log('Rôles utilisateur:', userRoles);
    
    const availableBadges = this.checkRoleBadges(userId, userRoles, {});
    console.log('Badges disponibles:', availableBadges);
    
    const stats = this.getRoleBadgeStats(userRoles, []);
    console.log('Statistiques:', stats);
    
    return {
      availableBadges,
      stats,
      totalBadgeDefinitions: Object.keys(ROLE_EXCLUSIVE_BADGES).reduce((total, roleId) => {
        return total + Object.keys(ROLE_EXCLUSIVE_BADGES[roleId]).reduce((roleTotal, level) => {
          return roleTotal + ROLE_EXCLUSIVE_BADGES[roleId][level].length;
        }, 0);
      }, 0)
    };
  }
}

// Instance singleton
const roleBadgeSystem = new RoleBadgeSystem();

// Auto-initialisation
if (typeof window !== 'undefined') {
  roleBadgeSystem.initialize();
}

export default roleBadgeSystem;
export { ROLE_EXCLUSIVE_BADGES };

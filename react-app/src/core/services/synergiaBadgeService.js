// ==========================================
// 📁 react-app/src/core/services/synergiaBadgeService.js
// SERVICE DE BADGES SPÉCIALISÉS SYNERGIA - NOUVEAU FICHIER
// ==========================================

import { doc, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import firebaseDataSyncService from './firebaseDataSyncService.js';

/**
 * 🏆 DÉFINITIONS COMPLÈTES DES BADGES SYNERGIA
 */
export const SYNERGIA_BADGE_DEFINITIONS = {
  // 🔧 BADGES MAINTENANCE & TECHNIQUE
  maintenance_rookie: {
    id: 'maintenance_rookie',
    name: 'Apprenti Mécanicien',
    description: 'Première intervention technique réalisée avec succès',
    icon: '🔧',
    rarity: 'common',
    xpReward: 25,
    category: 'maintenance',
    requirements: {
      role: 'maintenance',
      tasksCompleted: 1,
      category: 'technical'
    },
    checkCondition: (userStats) => {
      const maintenanceStats = userStats.roles?.maintenance || {};
      return maintenanceStats.tasksCompleted >= 1;
    }
  },

  repair_specialist: {
    id: 'repair_specialist',
    name: 'Spécialiste Réparation',
    description: 'Expert reconnu en résolution de problèmes techniques complexes',
    icon: '⚙️',
    rarity: 'rare',
    xpReward: 100,
    category: 'maintenance',
    requirements: {
      role: 'maintenance',
      tasksCompleted: 25,
      difficulty: 'advanced',
      successRate: 85
    },
    checkCondition: (userStats) => {
      const maintenanceStats = userStats.roles?.maintenance || {};
      return maintenanceStats.tasksCompleted >= 25 && 
             maintenanceStats.successRate >= 85;
    }
  },

  safety_guardian: {
    id: 'safety_guardian',
    name: 'Gardien de la Sécurité',
    description: 'Vigilance exceptionnelle et zéro incident de sécurité',
    icon: '🛡️',
    rarity: 'epic',
    xpReward: 200,
    category: 'maintenance',
    requirements: {
      role: 'maintenance',
      safetyChecks: 50,
      incidents: 0,
      trainingCompleted: 5
    },
    checkCondition: (userStats) => {
      const maintenanceStats = userStats.roles?.maintenance || {};
      return maintenanceStats.safetyChecks >= 50 && 
             maintenanceStats.incidents === 0;
    }
  },

  // ⭐ BADGES RÉPUTATION & AVIS
  review_master: {
    id: 'review_master',
    name: 'Maître des Avis',
    description: 'Excellence constante dans la gestion des avis clients',
    icon: '⭐',
    rarity: 'uncommon',
    xpReward: 75,
    category: 'reputation',
    requirements: {
      role: 'reputation',
      reviewsHandled: 10,
      averageRating: 4.5,
      responseTime: 'fast'
    },
    checkCondition: (userStats) => {
      const reputationStats = userStats.roles?.reputation || {};
      return reputationStats.reviewsHandled >= 10 && 
             reputationStats.averageRating >= 4.5;
    }
  },

  crisis_resolver: {
    id: 'crisis_resolver',
    name: 'Résolveur de Crise',
    description: 'Transformation des situations difficiles en succès clients',
    icon: '🚨',
    rarity: 'rare',
    xpReward: 150,
    category: 'reputation',
    requirements: {
      role: 'reputation',
      negativeReviewsResolved: 5,
      satisfactionImprovement: 20,
      conflictResolution: 3
    },
    checkCondition: (userStats) => {
      const reputationStats = userStats.roles?.reputation || {};
      return reputationStats.negativeReviewsResolved >= 5 && 
             reputationStats.satisfactionImprovement >= 20;
    }
  },

  // 📦 BADGES STOCK & LOGISTIQUE
  inventory_ninja: {
    id: 'inventory_ninja',
    name: 'Ninja de l\'Inventaire',
    description: 'Précision et rapidité exceptionnelles dans la gestion des stocks',
    icon: '📦',
    rarity: 'uncommon',
    xpReward: 60,
    category: 'stock',
    requirements: {
      role: 'stock',
      inventoryAccuracy: 98,
      auditsCompleted: 10,
      speedRating: 'excellent'
    },
    checkCondition: (userStats) => {
      const stockStats = userStats.roles?.stock || {};
      return stockStats.inventoryAccuracy >= 98 && 
             stockStats.auditsCompleted >= 10;
    }
  },

  logistics_guru: {
    id: 'logistics_guru',
    name: 'Gourou Logistique',
    description: 'Innovation et optimisation révolutionnaires des flux',
    icon: '🚚',
    rarity: 'epic',
    xpReward: 250,
    category: 'stock',
    requirements: {
      role: 'stock',
      efficiencyImprovement: 30,
      costReduction: 15,
      processesOptimized: 5
    },
    checkCondition: (userStats) => {
      const stockStats = userStats.roles?.stock || {};
      return stockStats.efficiencyImprovement >= 30 && 
             stockStats.costReduction >= 15;
    }
  },

  // 🎮 BADGES ESCAPE GAME SPÉCIFIQUES
  game_master: {
    id: 'game_master',
    name: 'Maître du Jeu',
    description: 'Animation captivante et mémorable d\'escape games',
    icon: '🎭',
    rarity: 'rare',
    xpReward: 120,
    category: 'escape_game',
    requirements: {
      activity: 'escape_game',
      gamesAnimated: 10,
      playerSatisfaction: 4.8,
      immersionScore: 85
    },
    checkCondition: (userStats) => {
      const escapeStats = userStats.activities?.escapeGame || {};
      return escapeStats.gamesAnimated >= 10 && 
             escapeStats.playerSatisfaction >= 4.8;
    }
  },

  puzzle_creator: {
    id: 'puzzle_creator',
    name: 'Créateur d\'Énigmes',
    description: 'Innovation remarquable dans la conception d\'énigmes',
    icon: '🧩',
    rarity: 'epic',
    xpReward: 200,
    category: 'escape_game',
    requirements: {
      activity: 'escape_game',
      puzzlesCreated: 5,
      creativityRating: 4.5,
      originalityScore: 90
    },
    checkCondition: (userStats) => {
      const escapeStats = userStats.activities?.escapeGame || {};
      return escapeStats.puzzlesCreated >= 5 && 
             escapeStats.creativityRating >= 4.5;
    }
  },

  immersion_artist: {
    id: 'immersion_artist',
    name: 'Artiste de l\'Immersion',
    description: 'Création d\'expériences immersives absolument mémorables',
    icon: '🎨',
    rarity: 'legendary',
    xpReward: 500,
    category: 'escape_game',
    requirements: {
      activity: 'escape_game',
      immersionScore: 95,
      testimonials: 20,
      repeatCustomers: 15
    },
    checkCondition: (userStats) => {
      const escapeStats = userStats.activities?.escapeGame || {};
      return escapeStats.immersionScore >= 95 && 
             escapeStats.testimonials >= 20;
    }
  },

  // 🧠 BADGES QUIZ GAME SPÉCIFIQUES
  quiz_master: {
    id: 'quiz_master',
    name: 'Maître du Quiz',
    description: 'Animation dynamique et engagement exceptionnel en quiz',
    icon: '🧠',
    rarity: 'uncommon',
    xpReward: 80,
    category: 'quiz_game',
    requirements: {
      activity: 'quiz_game',
      quizzesAnimated: 5,
      participantEngagement: 85,
      energyLevel: 'high'
    },
    checkCondition: (userStats) => {
      const quizStats = userStats.activities?.quizGame || {};
      return quizStats.quizzesAnimated >= 5 && 
             quizStats.participantEngagement >= 85;
    }
  },

  knowledge_architect: {
    id: 'knowledge_architect',
    name: 'Architecte du Savoir',
    description: 'Création de quiz éducatifs exceptionnellement enrichissants',
    icon: '🏗️',
    rarity: 'rare',
    xpReward: 180,
    category: 'quiz_game',
    requirements: {
      activity: 'quiz_game',
      quizzesCreated: 10,
      educationalValue: 4.7,
      learningOutcomes: 'excellent'
    },
    checkCondition: (userStats) => {
      const quizStats = userStats.activities?.quizGame || {};
      return quizStats.quizzesCreated >= 10 && 
             quizStats.educationalValue >= 4.7;
    }
  },

  trivia_legend: {
    id: 'trivia_legend',
    name: 'Légende du Trivia',
    description: 'Encyclopédie vivante et maître incontesté du trivia',
    icon: '🎓',
    rarity: 'legendary',
    xpReward: 400,
    category: 'quiz_game',
    requirements: {
      activity: 'quiz_game',
      triviaWins: 50,
      knowledgeAreas: 10,
      difficultyLevel: 'expert'
    },
    checkCondition: (userStats) => {
      const quizStats = userStats.activities?.quizGame || {};
      return quizStats.triviaWins >= 50 && 
             quizStats.knowledgeAreas >= 10;
    }
  },

  // 🤝 BADGES COLLABORATION & ÉQUIPE
  team_catalyst: {
    id: 'team_catalyst',
    name: 'Catalyseur d\'Équipe',
    description: 'Inspiration et motivation exceptionnelles de l\'équipe',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 150,
    category: 'collaboration',
    requirements: {
      teamProjectsLed: 3,
      teamSatisfaction: 4.6,
      motivationScore: 90
    },
    checkCondition: (userStats) => {
      const collabStats = userStats.collaboration || {};
      return collabStats.teamProjectsLed >= 3 && 
             collabStats.teamSatisfaction >= 4.6;
    }
  },

  synergy_builder: {
    id: 'synergy_builder',
    name: 'Bâtisseur de Synergie',
    description: 'Création d\'une dynamique d\'équipe parfaite et harmonieuse',
    icon: '🌟',
    rarity: 'epic',
    xpReward: 300,
    category: 'collaboration',
    requirements: {
      successfulCollaborations: 15,
      conflictsResolved: 5,
      teamHarmonyScore: 95
    },
    checkCondition: (userStats) => {
      const collabStats = userStats.collaboration || {};
      return collabStats.successfulCollaborations >= 15 && 
             collabStats.conflictsResolved >= 5;
    }
  },

  // 🎯 BADGES PERFORMANCE & EXCELLENCE
  efficiency_champion: {
    id: 'efficiency_champion',
    name: 'Champion d\'Efficacité',
    description: 'Optimisation constante et mesurable des processus',
    icon: '🚀',
    rarity: 'uncommon',
    xpReward: 90,
    category: 'performance',
    requirements: {
      efficiencyGains: 25,
      processesOptimized: 8,
      timeReduction: 20
    },
    checkCondition: (userStats) => {
      const perfStats = userStats.performance || {};
      return perfStats.efficiencyGains >= 25 && 
             perfStats.processesOptimized >= 8;
    }
  },

  innovation_pioneer: {
    id: 'innovation_pioneer',
    name: 'Pionnier de l\'Innovation',
    description: 'Idées révolutionnaires qui transforment fondamentalement l\'organisation',
    icon: '💡',
    rarity: 'legendary',
    xpReward: 600,
    category: 'performance',
    requirements: {
      innovationsImplemented: 3,
      impactScore: 90,
      adoptionRate: 80
    },
    checkCondition: (userStats) => {
      const perfStats = userStats.performance || {};
      return perfStats.innovationsImplemented >= 3 && 
             perfStats.impactScore >= 90;
    }
  }
};

/**
 * 🏆 SERVICE DE BADGES SPÉCIALISÉS SYNERGIA
 */
class SynergiaBadgeService {
  constructor() {
    this.badgeDefinitions = SYNERGIA_BADGE_DEFINITIONS;
    console.log('🏆 Service de badges Synergia initialisé avec', Object.keys(this.badgeDefinitions).length, 'badges');
  }

  /**
   * 🔍 VÉRIFIER ET DÉBLOQUER LES BADGES D'UN UTILISATEUR
   */
  async checkAndUnlockBadges(userId, activityContext = {}) {
    try {
      console.log('🔍 Vérification badges Synergia pour:', userId);

      // Récupérer les statistiques complètes de l'utilisateur
      const userStats = await firebaseDataSyncService.getUserCompleteStats(userId);
      if (!userStats) {
        console.warn('⚠️ Statistiques utilisateur introuvables');
        return { success: false, newBadges: [], errors: ['Utilisateur non trouvé'] };
      }

      // Récupérer les badges actuels
      const currentBadges = userStats.gamification?.badges || [];
      const currentBadgeIds = currentBadges.map(badge => badge.id);

      const newlyUnlocked = [];
      const errors = [];

      // Vérifier chaque badge
      for (const [badgeId, badgeDefinition] of Object.entries(this.badgeDefinitions)) {
        // Skip si déjà débloqué
        if (currentBadgeIds.includes(badgeId)) {
          continue;
        }

        try {
          // Vérifier la condition avec le contexte d'activité
          const contextualStats = this.enrichStatsWithContext(userStats, activityContext);
          
          if (badgeDefinition.checkCondition(contextualStats)) {
            const unlockedBadge = {
              id: badgeId,
              name: badgeDefinition.name,
              description: badgeDefinition.description,
              icon: badgeDefinition.icon,
              rarity: badgeDefinition.rarity,
              xpReward: badgeDefinition.xpReward,
              category: badgeDefinition.category,
              unlockedAt: new Date().toISOString(),
              unlockedContext: activityContext.trigger || 'automatic_check'
            };

            newlyUnlocked.push(unlockedBadge);
          }
        } catch (conditionError) {
          console.error(`❌ Erreur vérification badge ${badgeId}:`, conditionError);
          errors.push(`Erreur badge ${badgeId}: ${conditionError.message}`);
        }
      }

      // Sauvegarder les nouveaux badges
      if (newlyUnlocked.length > 0) {
        const saveResult = await this.saveBadgesToFirebase(userId, newlyUnlocked);
        if (!saveResult.success) {
          errors.push('Erreur sauvegarde badges');
        }
      }

      console.log(`✅ Vérification terminée: ${newlyUnlocked.length} nouveaux badges`);

      return {
        success: true,
        newBadges: newlyUnlocked,
        totalNewBadges: newlyUnlocked.length,
        errors
      };

    } catch (error) {
      console.error('❌ Erreur vérification badges Synergia:', error);
      return {
        success: false,
        newBadges: [],
        errors: [error.message]
      };
    }
  }

  /**
   * 🎯 ENRICHIR LES STATS AVEC LE CONTEXTE D'ACTIVITÉ
   */
  enrichStatsWithContext(userStats, activityContext) {
    const enrichedStats = { ...userStats };

    // Ajouter des statistiques temporaires basées sur le contexte
    if (activityContext.trigger === 'task_completed') {
      const roleStats = enrichedStats.roles?.[activityContext.roleId] || {};
      roleStats.tasksCompleted = (roleStats.tasksCompleted || 0) + 1;
      
      if (!enrichedStats.roles) enrichedStats.roles = {};
      enrichedStats.roles[activityContext.roleId] = roleStats;
    }

    if (activityContext.trigger === 'game_animated') {
      const activityStats = enrichedStats.activities?.[activityContext.activityType] || {};
      activityStats.gamesAnimated = (activityStats.gamesAnimated || 0) + 1;
      
      if (!enrichedStats.activities) enrichedStats.activities = {};
      enrichedStats.activities[activityContext.activityType] = activityStats;
    }

    return enrichedStats;
  }

  /**
   * 💾 SAUVEGARDER LES BADGES DANS FIREBASE
   */
  async saveBadgesToFirebase(userId, newBadges) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Calculer l'XP total des nouveaux badges
      const totalXpFromNewBadges = newBadges.reduce((total, badge) => 
        total + (badge.xpReward || 0), 0);

      const updates = {
        'gamification.badges': arrayUnion(...newBadges),
        'gamification.totalBadgeXp': (await this.getCurrentBadgeXp(userId)) + totalXpFromNewBadges,
        'stats.lastBadgeUnlock': serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updates);

      // Ajouter l'XP au total de l'utilisateur
      if (totalXpFromNewBadges > 0) {
        await firebaseDataSyncService.addXpToUser(userId, totalXpFromNewBadges, 'badges_unlocked');
      }

      // Déclencher notifications
      newBadges.forEach(badge => {
        this.triggerBadgeNotification(badge);
      });

      console.log(`💾 ${newBadges.length} badges sauvegardés avec +${totalXpFromNewBadges} XP`);

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde badges:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎊 DÉCLENCHER LA NOTIFICATION DE BADGE
   */
  triggerBadgeNotification(badge) {
    // Événement personnalisé pour l'interface
    const event = new CustomEvent('badgeUnlocked', {
      detail: {
        badge,
        timestamp: Date.now()
      }
    });
    
    window.dispatchEvent(event);

    // Log pour debug
    console.log(`🎊 Badge débloqué: ${badge.name} (+${badge.xpReward} XP)`);
  }

  /**
   * 💰 RÉCUPÉRER L'XP ACTUEL DES BADGES
   */
  async getCurrentBadgeXp(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().gamification?.totalBadgeXp || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Erreur récupération XP badges:', error);
      return 0;
    }
  }

  /**
   * 📊 OBTENIR LES BADGES PAR CATÉGORIE
   */
  getBadgesByCategory(category) {
    return Object.values(this.badgeDefinitions).filter(badge => 
      badge.category === category
    );
  }

  /**
   * 🎯 OBTENIR LES BADGES PAR RARETÉ
   */
  getBadgesByRarity(rarity) {
    return Object.values(this.badgeDefinitions).filter(badge => 
      badge.rarity === rarity
    );
  }

  /**
   * 🔍 RECHERCHER UN BADGE PAR ID
   */
  getBadgeById(badgeId) {
    return this.badgeDefinitions[badgeId] || null;
  }

  /**
   * 📈 CALCULER LA PROGRESSION VERS UN BADGE
   */
  calculateBadgeProgress(badgeId, userStats) {
    const badge = this.getBadgeById(badgeId);
    if (!badge) return null;

    // Cette méthode sera étendue selon les besoins spécifiques
    return {
      badgeId,
      current: 0,
      required: 1,
      percentage: 0,
      nextMilestone: 'Conditions non définies'
    };
  }

  /**
   * 🎯 OBTENIR TOUS LES BADGES DISPONIBLES
   */
  getAllBadges() {
    return Object.values(this.badgeDefinitions);
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES BADGES
   */
  getBadgeStatistics() {
    const badges = this.getAllBadges();
    
    return {
      total: badges.length,
      byCategory: this.groupBadgesByCategory(badges),
      byRarity: this.groupBadgesByRarity(badges),
      totalXpPossible: badges.reduce((sum, badge) => sum + badge.xpReward, 0)
    };
  }

  /**
   * 📂 GROUPER LES BADGES PAR CATÉGORIE
   */
  groupBadgesByCategory(badges) {
    return badges.reduce((acc, badge) => {
      if (!acc[badge.category]) acc[badge.category] = [];
      acc[badge.category].push(badge);
      return acc;
    }, {});
  }

  /**
   * ⭐ GROUPER LES BADGES PAR RARETÉ
   */
  groupBadgesByRarity(badges) {
    return badges.reduce((acc, badge) => {
      if (!acc[badge.rarity]) acc[badge.rarity] = [];
      acc[badge.rarity].push(badge);
      return acc;
    }, {});
  }
}

// Instance singleton
const synergiaBadgeService = new SynergiaBadgeService();

// Exposition globale pour debug
if (typeof window !== 'undefined') {
  window.synergiaBadgeService = synergiaBadgeService;
  window.SYNERGIA_BADGES = SYNERGIA_BADGE_DEFINITIONS;
}

export default synergiaBadgeService;
export { SYNERGIA_BADGE_DEFINITIONS, SynergiaBadgeService };

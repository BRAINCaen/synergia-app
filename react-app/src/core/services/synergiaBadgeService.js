// ==========================================
// 📁 react-app/src/core/services/synergiaBadgeService.js
// SERVICE DE BADGES SPÉCIALISÉS SYNERGIA AVEC CORRECTION FIREBASE
// ==========================================

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  arrayUnion, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { firebaseDataSyncService } from './firebaseDataSyncService.js';

/**
 * 🏆 DÉFINITIONS DES BADGES SYNERGIA
 * Collection complète avec conditions automatiques et récompenses XP
 */
const SYNERGIA_BADGE_DEFINITIONS = {
  // 🚀 BADGES DE DÉMARRAGE
  first_steps: {
    id: 'first_steps',
    name: 'Premiers Pas',
    description: 'Première connexion et découverte de Synergia',
    icon: '👋',
    rarity: 'common',
    xpReward: 10,
    category: 'onboarding',
    requirements: {
      loginCount: 1
    },
    checkCondition: (userStats) => {
      return (userStats.loginCount || 0) >= 1;
    }
  },

  profile_complete: {
    id: 'profile_complete',
    name: 'Profil Complet',
    description: 'Profil utilisateur entièrement renseigné',
    icon: '📋',
    rarity: 'common',
    xpReward: 25,
    category: 'onboarding',
    requirements: {
      profileCompletion: 100
    },
    checkCondition: (userStats) => {
      return (userStats.profileCompletion || 0) >= 100;
    }
  },

  first_week: {
    id: 'first_week',
    name: 'Première Semaine',
    description: 'Une semaine d\'utilisation active de Synergia',
    icon: '📅',
    rarity: 'uncommon',
    xpReward: 50,
    category: 'consistency',
    requirements: {
      activeDays: 7
    },
    checkCondition: (userStats) => {
      return (userStats.activeDays || 0) >= 7;
    }
  },

  // 🎯 BADGES DE PRODUCTIVITÉ
  task_master: {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Excellente gestion et finalisation des tâches assignées',
    icon: '✅',
    rarity: 'uncommon',
    xpReward: 75,
    category: 'productivity',
    requirements: {
      tasksCompleted: 50,
      completionRate: 85
    },
    checkCondition: (userStats) => {
      const completed = userStats.tasksCompleted || 0;
      const rate = userStats.completionRate || 0;
      return completed >= 50 && rate >= 85;
    }
  },

  efficiency_expert: {
    id: 'efficiency_expert',
    name: 'Expert en Efficacité',
    description: 'Optimisation remarquable des processus et méthodes de travail',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 120,
    category: 'productivity',
    requirements: {
      efficiencyScore: 90,
      processOptimizations: 5
    },
    checkCondition: (userStats) => {
      return (userStats.efficiencyScore || 0) >= 90 && 
             (userStats.processOptimizations || 0) >= 5;
    }
  },

  deadline_champion: {
    id: 'deadline_champion',
    name: 'Champion des Délais',
    description: 'Respect exemplaire des échéances et planifications',
    icon: '⏰',
    rarity: 'rare',
    xpReward: 100,
    category: 'productivity',
    requirements: {
      onTimeDeliveries: 25,
      punctualityRate: 95
    },
    checkCondition: (userStats) => {
      return (userStats.onTimeDeliveries || 0) >= 25 && 
             (userStats.punctualityRate || 0) >= 95;
    }
  },

  // 📈 BADGES DE PROGRESSION
  rising_star: {
    id: 'rising_star',
    name: 'Étoile Montante',
    description: 'Progression rapide et constante dans l\'organisation',
    icon: '⭐',
    rarity: 'uncommon',
    xpReward: 80,
    category: 'progression',
    requirements: {
      levelUps: 5,
      xpGained: 1000
    },
    checkCondition: (userStats) => {
      return (userStats.level || 1) >= 6 && 
             (userStats.totalXp || 0) >= 1000;
    }
  },

  knowledge_seeker: {
    id: 'knowledge_seeker',
    name: 'Chercheur de Connaissances',
    description: 'Apprentissage continu et développement des compétences',
    icon: '🎓',
    rarity: 'rare',
    xpReward: 150,
    category: 'progression',
    requirements: {
      skillsLearned: 10,
      certificationsEarned: 3
    },
    checkCondition: (userStats) => {
      return (userStats.skillsLearned || 0) >= 10 && 
             (userStats.certificationsEarned || 0) >= 3;
    }
  },

  veteran: {
    id: 'veteran',
    name: 'Vétéran',
    description: 'Ancienneté et expérience significative dans Synergia',
    icon: '🏛️',
    rarity: 'epic',
    xpReward: 250,
    category: 'progression',
    requirements: {
      daysSinceJoined: 365,
      totalXp: 5000
    },
    checkCondition: (userStats) => {
      return (userStats.daysSinceJoined || 0) >= 365 && 
             (userStats.totalXp || 0) >= 5000;
    }
  },

  // 🤝 BADGES DE COLLABORATION
  team_player: {
    id: 'team_player',
    name: 'Esprit d\'Équipe',
    description: 'Collaboration exemplaire et support aux collègues',
    icon: '🤝',
    rarity: 'uncommon',
    xpReward: 60,
    category: 'collaboration',
    requirements: {
      collaborations: 20,
      helpProvided: 15
    },
    checkCondition: (userStats) => {
      return (userStats.collaborations || 0) >= 20 && 
             (userStats.helpProvided || 0) >= 15;
    }
  },

  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Accompagnement et formation d\'autres membres de l\'équipe',
    icon: '👨‍🏫',
    rarity: 'rare',
    xpReward: 130,
    category: 'collaboration',
    requirements: {
      mentorships: 5,
      trainingsProvided: 3
    },
    checkCondition: (userStats) => {
      return (userStats.mentorships || 0) >= 5 && 
             (userStats.trainingsProvided || 0) >= 3;
    }
  },

  conflict_resolver: {
    id: 'conflict_resolver',
    name: 'Résolveur de Conflits',
    description: 'Médiation efficace et résolution constructive des tensions',
    icon: '⚖️',
    rarity: 'epic',
    xpReward: 200,
    category: 'collaboration',
    requirements: {
      conflictsResolved: 10,
      satisfactionRate: 90
    },
    checkCondition: (userStats) => {
      const collabStats = userStats.collaboration || {};
      return collabStats.conflictsResolved >= 10 && 
             collabStats.satisfactionRate >= 90;
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
   * 💾 SAUVEGARDER LES BADGES DANS FIREBASE - VERSION CORRIGÉE
   * 🔥 SOLUTION: Utiliser setDoc avec merge au lieu d'arrayUnion + serverTimestamp
   */
  async saveBadgesToFirebase(userId, newBadges) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // 1. Récupérer les données actuelles
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      
      // 2. Récupérer les badges existants
      const currentBadges = userData.gamification?.badges || [];
      
      // 3. Créer les nouveaux badges avec timestamps corrects
      const badgesWithTimestamps = newBadges.map(badge => ({
        ...badge,
        unlockedAt: new Date().toISOString(), // ✅ STRING au lieu de serverTimestamp
        unlockedTimestamp: Date.now() // ✅ NUMBER timestamp
      }));
      
      // 4. Fusionner tous les badges
      const allBadges = [...currentBadges, ...badgesWithTimestamps];
      
      // 5. Calculer l'XP total des nouveaux badges
      const totalXpFromNewBadges = newBadges.reduce((total, badge) => 
        total + (badge.xpReward || 0), 0);
      
      // 6. Calculer les nouvelles statistiques
      const currentTotalBadgeXp = userData.gamification?.totalBadgeXp || 0;
      const newTotalBadgeXp = currentTotalBadgeXp + totalXpFromNewBadges;
      
      // 7. ✅ MISE À JOUR SÉCURISÉE AVEC setDoc + merge
      await setDoc(userRef, {
        gamification: {
          ...userData.gamification,
          badges: allBadges,
          badgesUnlocked: allBadges.length,
          totalBadgeXp: newTotalBadgeXp,
          lastBadgeUnlock: new Date().toISOString() // ✅ STRING au lieu de serverTimestamp
        },
        stats: {
          ...userData.stats,
          lastBadgeUnlock: new Date().toISOString() // ✅ STRING au lieu de serverTimestamp
        },
        updatedAt: new Date().toISOString() // ✅ STRING au lieu de serverTimestamp
      }, { merge: true });

      // 8. Ajouter l'XP au total de l'utilisateur si disponible
      if (totalXpFromNewBadges > 0 && firebaseDataSyncService?.addXpToUser) {
        try {
          await firebaseDataSyncService.addXpToUser(userId, totalXpFromNewBadges, 'badges_unlocked');
        } catch (xpError) {
          console.warn('⚠️ Impossible d\'ajouter XP via firebaseDataSyncService:', xpError.message);
          // Continuer sans fail - les badges sont sauvegardés
        }
      }

      // 9. Déclencher notifications
      newBadges.forEach(badge => {
        this.triggerBadgeNotification(badge);
      });

      console.log(`✅ ${newBadges.length} badges sauvegardés avec +${totalXpFromNewBadges} XP`);

      return { success: true, badgesSaved: newBadges.length, xpGained: totalXpFromNewBadges };

    } catch (error) {
      console.error('❌ Erreur sauvegarde badges:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔧 FONCTION COMPATIBLE POUR BADGESPAGE.JSX
   * Version corrigée qui peut être utilisée directement dans BadgesPage
   */
  static async checkAndUnlockBadgesForPage(userId, userData, badgeDefinitions) {
    try {
      console.log('🎯 Vérification automatique des badges...');
      
      const currentBadges = userData.gamification?.badges || [];
      const earnedBadgeIds = currentBadges.map(b => b.id || b.badgeId);
      
      let newBadges = [];
      let totalXpGained = 0;

      // Vérifier chaque badge
      for (const badgeDefinition of badgeDefinitions) {
        const isAlreadyEarned = earnedBadgeIds.includes(badgeDefinition.id);
        
        if (!isAlreadyEarned) {
          let shouldUnlock = false;
          
          if (badgeDefinition.autoCheck) {
            if (typeof badgeDefinition.autoCheck === 'function') {
              shouldUnlock = badgeDefinition.autoCheck(userData);
            } else if (badgeDefinition.autoCheckCode) {
              // Reconstruire la fonction depuis le code stocké
              try {
                const autoCheckFunction = new Function('userData', badgeDefinition.autoCheckCode.replace('(userData) => ', 'return '));
                shouldUnlock = autoCheckFunction(userData);
              } catch (error) {
                console.warn('⚠️ Erreur évaluation autoCheck pour badge:', badgeDefinition.id);
              }
            }
          }
          
          if (shouldUnlock) {
            console.log(`🎉 Nouveau badge débloqué: ${badgeDefinition.name}`);
            
            const newBadge = {
              id: badgeDefinition.id,
              badgeId: badgeDefinition.id,
              name: badgeDefinition.name,
              description: badgeDefinition.description,
              icon: badgeDefinition.icon,
              rarity: badgeDefinition.rarity,
              category: badgeDefinition.category,
              xpReward: badgeDefinition.xpReward,
              unlockedAt: new Date().toISOString(), // ✅ STRING au lieu de serverTimestamp
              earnedAt: new Date().toISOString()
            };
            
            newBadges.push(newBadge);
            totalXpGained += badgeDefinition.xpReward;
          }
        }
      }

      // ✅ SAUVEGARDER LES NOUVEAUX BADGES AVEC setDoc + merge
      if (newBadges.length > 0) {
        const userRef = doc(db, 'users', userId);
        const allBadges = [...currentBadges, ...newBadges];
        
        await setDoc(userRef, {
          gamification: {
            ...userData.gamification,
            badges: allBadges, // ✅ Remplacer tout le tableau au lieu d'arrayUnion
            badgesUnlocked: allBadges.length,
            totalXp: (userData.gamification?.totalXp || 0) + totalXpGained,
            lastBadgeCheck: new Date().toISOString() // ✅ STRING au lieu de serverTimestamp
          }
        }, { merge: true });

        console.log(`✅ ${newBadges.length} nouveaux badges débloqués, +${totalXpGained} XP`);
        return { success: true, newBadges, totalXpGained };
      } else {
        console.log('📋 Aucun nouveau badge à débloquer');
        return { success: true, newBadges: [], totalXpGained: 0 };
      }

    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return { success: false, error: error.message, newBadges: [] };
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
export { SynergiaBadgeService };
export { SYNERGIA_BADGE_DEFINITIONS };

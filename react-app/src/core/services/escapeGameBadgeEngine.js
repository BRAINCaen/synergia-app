// ==========================================
// 📁 react-app/src/core/services/escapeGameBadgeEngine.js
// MOTEUR DE BADGES ESCAPE GAME - VERSION CORRIGÉE
// ==========================================

import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎭 BADGES ESCAPE GAME - VERSION CORRIGÉE AVEC TOUTES LES CONDITIONS
 */

// 🔧 BADGES ENTRETIEN & MAINTENANCE
const MAINTENANCE_BADGES = [
  {
    id: "mnt_001", role: "maintenance", icon: "🔨",
    name: "Premier Dépannage", description: "Première réparation effectuée",
    condition: "first_repair", triggerValue: 1, xpReward: 25, rarity: "common"
  },
  {
    id: "mnt_002", role: "maintenance", icon: "⚡",
    name: "Réparateur Express", description: "5 réparations en une journée",
    condition: "daily_repairs", triggerValue: 5, xpReward: 50, rarity: "uncommon"
  },
  {
    id: "mnt_003", role: "maintenance", icon: "🛠️",
    name: "Maître Bricoleur", description: "25 réparations réussies",
    condition: "total_repairs", triggerValue: 25, xpReward: 100, rarity: "rare"
  },
  {
    id: "mnt_004", role: "maintenance", icon: "🏆",
    name: "Gardien des Salles", description: "0 panne pendant 30 jours",
    condition: "zero_breakdown_streak", triggerValue: 30, xpReward: 200, rarity: "epic"
  },
  {
    id: "mnt_005", role: "maintenance", icon: "👑",
    name: "Légende Maintenance", description: "100 interventions parfaites",
    condition: "perfect_repairs", triggerValue: 100, xpReward: 500, rarity: "legendary"
  }
];

// ⭐ BADGES GESTION DES AVIS
const REPUTATION_BADGES = [
  {
    id: "rep_001", role: "reputation", icon: "📝",
    name: "Première Réponse", description: "Premier avis client traité",
    condition: "first_review_response", triggerValue: 1, xpReward: 20, rarity: "common"
  },
  {
    id: "rep_002", role: "reputation", icon: "💬",
    name: "Diplomate", description: "Résoudre un avis négatif avec succès",
    condition: "negative_review_resolved", triggerValue: 1, xpReward: 75, rarity: "uncommon"
  },
  {
    id: "rep_003", role: "reputation", icon: "🌟",
    name: "5 Étoiles", description: "Générer 10 avis positifs",
    condition: "positive_reviews_generated", triggerValue: 10, xpReward: 100, rarity: "rare"
  },
  {
    id: "rep_004", role: "reputation", icon: "🏅",
    name: "Ambassadeur", description: "Maintenir un taux de satisfaction >95%",
    condition: "satisfaction_rate", triggerValue: 95, xpReward: 150, rarity: "epic"
  },
  {
    id: "rep_005", role: "reputation", icon: "👑",
    name: "Réputation d'Or", description: "50 avis 5⭐ générés",
    condition: "five_star_reviews", triggerValue: 50, xpReward: 300, rarity: "legendary"
  }
];

// 📦 BADGES GESTION DES STOCKS
const STOCK_BADGES = [
  {
    id: "stk_001", role: "stock", icon: "📋",
    name: "Premier Inventaire", description: "Premier contrôle de stock réalisé",
    condition: "first_inventory", triggerValue: 1, xpReward: 30, rarity: "common"
  },
  {
    id: "stk_002", role: "stock", icon: "🎯",
    name: "Organisateur", description: "Réorganiser un espace de stockage",
    condition: "space_reorganized", triggerValue: 1, xpReward: 60, rarity: "uncommon"
  },
  {
    id: "stk_003", role: "stock", icon: "📊",
    name: "Gestionnaire Pro", description: "0 rupture de stock pendant 30 jours",
    condition: "zero_stockout_streak", triggerValue: 30, xpReward: 120, rarity: "rare"
  },
  {
    id: "stk_004", role: "stock", icon: "🏪",
    name: "Maître des Stocks", description: "Optimiser 3 espaces de stockage",
    condition: "optimized_spaces", triggerValue: 3, xpReward: 200, rarity: "epic"
  },
  {
    id: "stk_005", role: "stock", icon: "💎",
    name: "Logisticien Expert", description: "Système parfait pendant 6 mois",
    condition: "perfect_system_months", triggerValue: 6, xpReward: 400, rarity: "legendary"
  }
];

// 🎯 BADGES GÉNÉRIQUES (simplifiés)
const GENERAL_BADGES = [
  {
    id: "gen_001", role: "general", icon: "🎯",
    name: "Premier Jour", description: "Bienvenue dans l'équipe !",
    condition: "first_day", triggerValue: 1, xpReward: 25, rarity: "common"
  },
  {
    id: "gen_002", role: "general", icon: "🔥",
    name: "Semaine Complète", description: "7 jours consécutifs d'activité",
    condition: "week_streak", triggerValue: 7, xpReward: 100, rarity: "uncommon"
  },
  {
    id: "gen_003", role: "general", icon: "⭐",
    name: "Polyvalent", description: "Compétent dans 3 rôles différents",
    condition: "multi_role_competent", triggerValue: 3, xpReward: 200, rarity: "rare"
  },
  {
    id: "gen_004", role: "general", icon: "🏆",
    name: "Pilier de l'Équipe", description: "6 mois d'activité régulière",
    condition: "team_pillar", triggerValue: 6, xpReward: 500, rarity: "epic"
  },
  {
    id: "gen_005", role: "general", icon: "👑",
    name: "Légende Synergia", description: "Impact exceptionnel sur l'équipe",
    condition: "synergia_legend", triggerValue: 1, xpReward: 1000, rarity: "legendary"
  }
];

/**
 * 🎮 MOTEUR DE BADGES ESCAPE GAME - VERSION CORRIGÉE
 */
class EscapeGameBadgeEngine {
  constructor() {
    this.allBadges = [
      ...MAINTENANCE_BADGES,
      ...REPUTATION_BADGES,
      ...STOCK_BADGES,
      ...GENERAL_BADGES
    ];
    
    console.log('🎭 EscapeGameBadgeEngine initialisé avec', this.allBadges.length, 'badges spécialisés');
  }

  /**
   * 🎯 Vérifier et attribuer les badges selon l'activité
   */
  async checkAndAwardBadges(userId, activityData = {}) {
    try {
      console.log('🔍 Vérification badges escape game pour:', userId);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('⚠️ Utilisateur non trouvé:', userId);
        return { success: false, awardedBadges: 0 };
      }

      const userData = userDoc.data();
      const userBadges = userData.badges || [];
      const earnedBadgeIds = userBadges.map(b => b.id);

      const availableBadges = this.allBadges.filter(badge => 
        !earnedBadgeIds.includes(badge.id)
      );

      const newBadges = [];
      for (const badge of availableBadges) {
        if (this.checkBadgeCondition(badge, userData, activityData)) {
          newBadges.push({
            ...badge,
            earnedAt: new Date(),
            earnedBy: activityData.trigger || 'system'
          });
        }
      }

      if (newBadges.length > 0) {
        await this.awardBadges(userId, newBadges, userData);
        
        newBadges.forEach(badge => {
          this.triggerBadgeNotification(badge);
        });
      }

      console.log('✅ Vérification terminée. Nouveaux badges:', newBadges.length);
      
      return {
        success: true,
        awardedBadges: newBadges.length,
        newBadges: newBadges
      };

    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 Vérifier si une condition de badge est remplie - VERSION COMPLÈTE
   */
  checkBadgeCondition(badge, userData, activityData) {
    const { condition, triggerValue } = badge;
    const stats = userData.stats || {};
    const gamification = userData.gamification || {};
    const escapeStats = userData.escapeStats || {}; // Nouvelles stats escape game

    console.log(`🔍 Vérification condition: ${condition} (trigger: ${triggerValue})`);

    switch (condition) {
      // ========= BADGES GÉNÉRIQUES =========
      case 'first_day':
        const isFirstDay = activityData.type === 'first_login' || activityData.type === 'first_day';
        console.log(`First day check: ${isFirstDay}, hasFirstDay: ${stats.hasFirstDay}`);
        return isFirstDay && !stats.hasFirstDay;
        
      case 'week_streak':
        const streak = gamification.loginStreak || 0;
        console.log(`Week streak check: ${streak} >= ${triggerValue}`);
        return streak >= triggerValue;
        
      case 'multi_role_competent':
        const competentRoles = escapeStats.competentRoles || 0;
        console.log(`Multi role check: ${competentRoles} >= ${triggerValue}`);
        return competentRoles >= triggerValue;
        
      case 'team_pillar':
        const monthsActive = escapeStats.monthsActive || 0;
        console.log(`Team pillar check: ${monthsActive} >= ${triggerValue}`);
        return monthsActive >= triggerValue;
        
      case 'synergia_legend':
        const isLegend = activityData.type === 'synergia_legend' || escapeStats.isLegend;
        console.log(`Synergia legend check: ${isLegend}`);
        return isLegend;

      // ========= BADGES MAINTENANCE =========
      case 'first_repair':
        const isRepair = activityData.type === 'repair' || activityData.type === 'maintenance_repair';
        console.log(`First repair check: ${isRepair}, hasFirstRepair: ${stats.hasFirstRepair}`);
        return isRepair && !stats.hasFirstRepair;
        
      case 'daily_repairs':
        const repairsToday = escapeStats.repairsToday || 0;
        console.log(`Daily repairs check: ${repairsToday} >= ${triggerValue}`);
        return repairsToday >= triggerValue;
        
      case 'total_repairs':
        const totalRepairs = escapeStats.totalRepairs || 0;
        console.log(`Total repairs check: ${totalRepairs} >= ${triggerValue}`);
        return totalRepairs >= triggerValue;
        
      case 'zero_breakdown_streak':
        const breakdownFreedays = escapeStats.zeroBreakdownDays || 0;
        console.log(`Zero breakdown check: ${breakdownFreedays} >= ${triggerValue}`);
        return breakdownFreedays >= triggerValue;
        
      case 'perfect_repairs':
        const perfectRepairs = escapeStats.perfectRepairs || 0;
        console.log(`Perfect repairs check: ${perfectRepairs} >= ${triggerValue}`);
        return perfectRepairs >= triggerValue;

      // ========= BADGES RÉPUTATION =========
      case 'first_review_response':
        const isReviewResponse = activityData.type === 'review_response' || activityData.type === 'avis_response';
        console.log(`First review response check: ${isReviewResponse}, hasFirstReviewResponse: ${stats.hasFirstReviewResponse}`);
        return isReviewResponse && !stats.hasFirstReviewResponse;
        
      case 'negative_review_resolved':
        const isNegativeResolved = activityData.type === 'negative_review_resolved';
        console.log(`Negative review resolved check: ${isNegativeResolved}`);
        return isNegativeResolved;
        
      case 'positive_reviews_generated':
        const positiveReviews = escapeStats.positiveReviewsGenerated || 0;
        console.log(`Positive reviews check: ${positiveReviews} >= ${triggerValue}`);
        return positiveReviews >= triggerValue;
        
      case 'satisfaction_rate':
        const satisfactionRate = escapeStats.satisfactionRate || 0;
        console.log(`Satisfaction rate check: ${satisfactionRate} >= ${triggerValue}`);
        return satisfactionRate >= triggerValue;
        
      case 'five_star_reviews':
        const fiveStarReviews = escapeStats.fiveStarReviews || 0;
        console.log(`Five star reviews check: ${fiveStarReviews} >= ${triggerValue}`);
        return fiveStarReviews >= triggerValue;

      // ========= BADGES STOCK =========
      case 'first_inventory':
        const isInventory = activityData.type === 'inventory' || activityData.type === 'stock_check';
        console.log(`First inventory check: ${isInventory}, hasFirstInventory: ${stats.hasFirstInventory}`);
        return isInventory && !stats.hasFirstInventory;
        
      case 'space_reorganized':
        const isSpaceReorganized = activityData.type === 'space_reorganized' || activityData.type === 'stock_reorganized';
        console.log(`Space reorganized check: ${isSpaceReorganized}`);
        return isSpaceReorganized;
        
      case 'zero_stockout_streak':
        const stockoutFreeDays = escapeStats.zeroStockoutDays || 0;
        console.log(`Zero stockout check: ${stockoutFreeDays} >= ${triggerValue}`);
        return stockoutFreeDays >= triggerValue;
        
      case 'optimized_spaces':
        const optimizedSpaces = escapeStats.optimizedSpaces || 0;
        console.log(`Optimized spaces check: ${optimizedSpaces} >= ${triggerValue}`);
        return optimizedSpaces >= triggerValue;
        
      case 'perfect_system_months':
        const perfectSystemMonths = escapeStats.perfectSystemMonths || 0;
        console.log(`Perfect system check: ${perfectSystemMonths} >= ${triggerValue}`);
        return perfectSystemMonths >= triggerValue;

      default:
        console.warn('⚠️ Condition de badge inconnue:', condition);
        return false;
    }
  }

  /**
   * 🏆 Attribuer des badges à un utilisateur
   */
  async awardBadges(userId, badges, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      const totalXP = badges.reduce((sum, badge) => sum + badge.xpReward, 0);
      const currentXP = userData.gamification?.totalXp || 0;

      await updateDoc(userRef, {
        badges: arrayUnion(...badges),
        'gamification.totalXp': currentXP + totalXP,
        'gamification.lastBadgeEarned': new Date()
      });

      console.log('✅ Badges attribués avec succès:', badges.length);
      
    } catch (error) {
      console.error('❌ Erreur attribution badges:', error);
    }
  }

  /**
   * 🔔 Déclencher une notification de badge
   */
  triggerBadgeNotification(badge) {
    const event = new CustomEvent('badgeEarned', {
      detail: {
        badge,
        timestamp: new Date()
      }
    });
    window.dispatchEvent(event);
    console.log('🔔 Notification badge escape game:', badge.name);
  }

  /**
   * 📊 Obtenir tous les badges d'un rôle
   */
  getBadgesByRole(role) {
    return this.allBadges.filter(badge => 
      badge.role === role || badge.role === 'general'
    );
  }

  /**
   * 🎯 Obtenir les statistiques de badges
   */
  getBadgeStats(userBadges, userRole) {
    const applicableBadges = this.getBadgesByRole(userRole);
    const earnedCount = userBadges.length;
    const totalCount = applicableBadges.length;
    const completionRate = Math.round((earnedCount / totalCount) * 100);

    return {
      earned: earnedCount,
      total: totalCount,
      completion: completionRate,
      remaining: totalCount - earnedCount
    };
  }

  /**
   * 🎮 FONCTIONS DE TEST ET SIMULATION
   */
  async simulateActivity(userId, activityType, params = {}) {
    console.log(`🎮 Simulation activité: ${activityType} pour ${userId}`);
    
    const activityData = {
      trigger: 'simulation',
      type: activityType,
      ...params
    };

    // Mettre à jour les stats utilisateur selon l'activité
    await this.updateUserStats(userId, activityType, params);
    
    // Vérifier les badges
    return await this.checkAndAwardBadges(userId, activityData);
  }

  async updateUserStats(userId, activityType, params) {
    try {
      const userRef = doc(db, 'users', userId);
      const updates = {};

      switch (activityType) {
        case 'repair':
        case 'maintenance_repair':
          updates['stats.hasFirstRepair'] = true;
          updates['escapeStats.totalRepairs'] = (params.totalRepairs || 0) + 1;
          updates['escapeStats.repairsToday'] = params.repairsToday || 1;
          break;
          
        case 'review_response':
        case 'avis_response':
          updates['stats.hasFirstReviewResponse'] = true;
          break;
          
        case 'inventory':
        case 'stock_check':
          updates['stats.hasFirstInventory'] = true;
          break;
          
        case 'first_day':
        case 'first_login':
          updates['stats.hasFirstDay'] = true;
          break;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        console.log('📊 Stats utilisateur mises à jour:', updates);
      }
      
    } catch (error) {
      console.warn('⚠️ Erreur mise à jour stats:', error);
    }
  }
}

// 🚀 Instance singleton
const escapeGameBadgeEngine = new EscapeGameBadgeEngine();

// Exposition globale pour Synergia
if (typeof window !== 'undefined') {
  window.escapeGameBadgeEngine = escapeGameBadgeEngine;
  
  // Fonctions de test améliorées
  window.testEscapeBadges = async (userId) => {
    console.log('🧪 Test badges escape game pour:', userId);
    return await escapeGameBadgeEngine.simulateActivity(userId, 'first_day');
  };
  
  window.awardMaintenanceBadge = async (userId) => {
    console.log('🔧 Test badge maintenance pour:', userId);
    return await escapeGameBadgeEngine.simulateActivity(userId, 'repair', { repairsToday: 1 });
  };
  
  window.awardReputationBadge = async (userId) => {
    console.log('⭐ Test badge réputation pour:', userId);
    return await escapeGameBadgeEngine.simulateActivity(userId, 'review_response');
  };
  
  window.awardStockBadge = async (userId) => {
    console.log('📦 Test badge stock pour:', userId);
    return await escapeGameBadgeEngine.simulateActivity(userId, 'inventory');
  };
  
  // Fonction pour simuler une progression complète
  window.simulateEscapeGameProgression = async (userId) => {
    console.log('🎮 Simulation progression complète escape game');
    
    const results = [];
    
    // Premier jour
    results.push(await escapeGameBadgeEngine.simulateActivity(userId, 'first_day'));
    
    // Première réparation
    results.push(await escapeGameBadgeEngine.simulateActivity(userId, 'repair', { repairsToday: 1 }));
    
    // Premier avis
    results.push(await escapeGameBadgeEngine.simulateActivity(userId, 'review_response'));
    
    // Premier inventaire
    results.push(await escapeGameBadgeEngine.simulateActivity(userId, 'inventory'));
    
    console.log('🎯 Résultats simulation:', results);
    return results;
  };
  
  console.log('🎭 EscapeGameBadgeEngine v2 chargé dans Synergia !');
  console.log('🧪 Nouvelles fonctions de test:');
  console.log('  • testEscapeBadges("userId")');
  console.log('  • awardMaintenanceBadge("userId")');
  console.log('  • awardReputationBadge("userId")');
  console.log('  • awardStockBadge("userId")');
  console.log('  • simulateEscapeGameProgression("userId")');
}

export default escapeGameBadgeEngine;
export { escapeGameBadgeEngine };

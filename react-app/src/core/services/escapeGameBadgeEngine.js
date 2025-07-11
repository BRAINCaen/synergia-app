// ==========================================
// 📁 react-app/src/core/services/escapeGameBadgeEngine.js
// MOTEUR DE BADGES ESCAPE GAME - VERSION PRODUCTION SYNERGIA
// ==========================================

import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎭 BADGES ESCAPE GAME - BASÉS SUR LES VRAIS RÔLES DE VOTRE ÉQUIPE
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

// 📅 BADGES ORGANISATION INTERNE
const ORGANIZATION_BADGES = [
  {
    id: "org_001", role: "organization", icon: "🗓️",
    name: "Premier Planning", description: "Premier planning équipe créé",
    condition: "first_schedule", triggerValue: 1, xpReward: 40, rarity: "common"
  },
  {
    id: "org_002", role: "organization", icon: "⚖️",
    name: "Équilibriste", description: "Planning sans conflit pendant 1 semaine",
    condition: "conflict_free_week", triggerValue: 1, xpReward: 80, rarity: "uncommon"
  },
  {
    id: "org_003", role: "organization", icon: "📈",
    name: "Coordinateur", description: "Améliorer la productivité de 20%",
    condition: "productivity_improvement", triggerValue: 20, xpReward: 140, rarity: "rare"
  },
  {
    id: "org_004", role: "organization", icon: "🎯",
    name: "Maître Planificateur", description: "0 problème planning pendant 2 mois",
    condition: "perfect_planning_months", triggerValue: 2, xpReward: 250, rarity: "epic"
  },
  {
    id: "org_005", role: "organization", icon: "👑",
    name: "Organisateur Légendaire", description: "Système organisationnel parfait",
    condition: "legendary_organization", triggerValue: 1, xpReward: 500, rarity: "legendary"
  }
];

// 🎨 BADGES CRÉATION DE CONTENU
const CONTENT_BADGES = [
  {
    id: "cnt_001", role: "content", icon: "🎭",
    name: "Premier Visuel", description: "Première création graphique",
    condition: "first_visual", triggerValue: 1, xpReward: 25, rarity: "common"
  },
  {
    id: "cnt_002", role: "content", icon: "🌈",
    name: "Créatif", description: "10 visuels adoptés par l'équipe",
    condition: "adopted_visuals", triggerValue: 10, xpReward: 70, rarity: "uncommon"
  },
  {
    id: "cnt_003", role: "content", icon: "🎪",
    name: "Designer", description: "Refonte visuelle complète d'un espace",
    condition: "visual_overhaul", triggerValue: 1, xpReward: 130, rarity: "rare"
  },
  {
    id: "cnt_004", role: "content", icon: "🏆",
    name: "Artiste Reconnu", description: "Portfolio de 50 créations",
    condition: "portfolio_creations", triggerValue: 50, xpReward: 220, rarity: "epic"
  },
  {
    id: "cnt_005", role: "content", icon: "💎",
    name: "Maître Créateur", description: "Impact visuel mesurable sur l'expérience",
    condition: "measurable_visual_impact", triggerValue: 1, xpReward: 450, rarity: "legendary"
  }
];

// 🎓 BADGES MENTORAT & FORMATION
const MENTORING_BADGES = [
  {
    id: "mtr_001", role: "mentoring", icon: "👋",
    name: "Premier Accueil", description: "Intégrer un nouveau membre",
    condition: "first_onboarding", triggerValue: 1, xpReward: 35, rarity: "common"
  },
  {
    id: "mtr_002", role: "mentoring", icon: "📚",
    name: "Formateur", description: "Former 3 personnes avec succès",
    condition: "people_trained", triggerValue: 3, xpReward: 85, rarity: "uncommon"
  },
  {
    id: "mtr_003", role: "mentoring", icon: "🧠",
    name: "Mentor", description: "Suivi progression de toute l'équipe",
    condition: "team_progress_tracking", triggerValue: 1, xpReward: 160, rarity: "rare"
  },
  {
    id: "mtr_004", role: "mentoring", icon: "🏅",
    name: "Professeur", description: "Expertise reconnue par l'équipe",
    condition: "recognized_expertise", triggerValue: 1, xpReward: 280, rarity: "epic"
  },
  {
    id: "mtr_005", role: "mentoring", icon: "👑",
    name: "Sage", description: "Impact formation mesurable sur les performances",
    condition: "measurable_training_impact", triggerValue: 1, xpReward: 600, rarity: "legendary"
  }
];

// 🤝 BADGES PARTENARIATS
const PARTNERSHIPS_BADGES = [
  {
    id: "prt_001", role: "partnerships", icon: "🌐",
    name: "Premier Contact", description: "Premier partenaire contacté",
    condition: "first_partner_contact", triggerValue: 1, xpReward: 30, rarity: "common"
  },
  {
    id: "prt_002", role: "partnerships", icon: "🤝",
    name: "Négociateur", description: "Conclure un partenariat",
    condition: "partnership_concluded", triggerValue: 1, xpReward: 90, rarity: "uncommon"
  },
  {
    id: "prt_003", role: "partnerships", icon: "📈",
    name: "Business Developer", description: "5 partenariats actifs",
    condition: "active_partnerships", triggerValue: 5, xpReward: 170, rarity: "rare"
  },
  {
    id: "prt_004", role: "partnerships", icon: "🏆",
    name: "Connecteur", description: "Réseau local bien établi",
    condition: "established_network", triggerValue: 1, xpReward: 300, rarity: "epic"
  },
  {
    id: "prt_005", role: "partnerships", icon: "💎",
    name: "Ambassadeur Business", description: "Impact business mesurable",
    condition: "measurable_business_impact", triggerValue: 1, xpReward: 550, rarity: "legendary"
  }
];

// 📱 BADGES COMMUNICATION
const COMMUNICATION_BADGES = [
  {
    id: "com_001", role: "communication", icon: "📸",
    name: "Premier Post", description: "Premier contenu publié",
    condition: "first_post", triggerValue: 1, xpReward: 20, rarity: "common"
  },
  {
    id: "com_002", role: "communication", icon: "🔥",
    name: "Viral", description: "Post avec plus de 100 interactions",
    condition: "viral_post", triggerValue: 100, xpReward: 80, rarity: "uncommon"
  },
  {
    id: "com_003", role: "communication", icon: "📺",
    name: "Créateur Contenu", description: "50 publications réalisées",
    condition: "content_publications", triggerValue: 50, xpReward: 150, rarity: "rare"
  },
  {
    id: "com_004", role: "communication", icon: "🌟",
    name: "Influenceur", description: "Communauté engagée constituée",
    condition: "engaged_community", triggerValue: 1, xpReward: 270, rarity: "epic"
  },
  {
    id: "com_005", role: "communication", icon: "👑",
    name: "Social Media Master", description: "Impact social media mesurable",
    condition: "measurable_social_impact", triggerValue: 1, xpReward: 500, rarity: "legendary"
  }
];

// 💼 BADGES B2B
const B2B_BADGES = [
  {
    id: "b2b_001", role: "b2b", icon: "💰",
    name: "Premier Devis", description: "Premier devis envoyé à un client",
    condition: "first_quote", triggerValue: 1, xpReward: 50, rarity: "common"
  },
  {
    id: "b2b_002", role: "b2b", icon: "🎯",
    name: "Commercial", description: "Premier devis accepté",
    condition: "quote_accepted", triggerValue: 1, xpReward: 120, rarity: "uncommon"
  },
  {
    id: "b2b_003", role: "b2b", icon: "💼",
    name: "Business", description: "10 contrats B2B signés",
    condition: "contracts_signed", triggerValue: 10, xpReward: 200, rarity: "rare"
  },
  {
    id: "b2b_004", role: "b2b", icon: "🏆",
    name: "Deal Maker", description: "Chiffre d'affaires B2B significatif généré",
    condition: "significant_revenue", triggerValue: 1, xpReward: 350, rarity: "epic"
  },
  {
    id: "b2b_005", role: "b2b", icon: "💎",
    name: "B2B Legend", description: "Expertise B2B reconnue par les clients",
    condition: "b2b_expertise_recognized", triggerValue: 1, xpReward: 700, rarity: "legendary"
  }
];

// 🎯 BADGES GÉNÉRIQUES
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
 * 🎮 MOTEUR DE BADGES ESCAPE GAME
 */
class EscapeGameBadgeEngine {
  constructor() {
    this.allBadges = [
      ...MAINTENANCE_BADGES,
      ...REPUTATION_BADGES,
      ...STOCK_BADGES,
      ...ORGANIZATION_BADGES,
      ...CONTENT_BADGES,
      ...MENTORING_BADGES,
      ...PARTNERSHIPS_BADGES,
      ...COMMUNICATION_BADGES,
      ...B2B_BADGES,
      ...GENERAL_BADGES
    ];
    
    console.log('🎭 EscapeGameBadgeEngine initialisé avec', this.allBadges.length, 'badges spécialisés');
  }

  /**
   * 🎯 Vérifier et attribuer les badges selon l'activité
   */
  async checkAndAwardBadges(userId, activityData) {
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
   * 🔍 Vérifier si une condition de badge est remplie
   */
  checkBadgeCondition(badge, userData, activityData) {
    const { condition, triggerValue } = badge;
    const stats = userData.stats || {};
    const gamification = userData.gamification || {};

    switch (condition) {
      // Génériques
      case 'first_day':
        return activityData.type === 'first_login' && !stats.hasFirstDay;
      case 'week_streak':
        return (gamification.loginStreak || 0) >= triggerValue;
        
      // Maintenance
      case 'first_repair':
        return activityData.type === 'repair' && !stats.hasFirstRepair;
      case 'daily_repairs':
        return activityData.type === 'repair' && (stats.repairsToday || 0) >= triggerValue;
      case 'total_repairs':
        return (stats.totalRepairs || 0) >= triggerValue;
        
      // Réputation
      case 'first_review_response':
        return activityData.type === 'review_response' && !stats.hasFirstReviewResponse;
      case 'positive_reviews_generated':
        return (stats.positiveReviewsGenerated || 0) >= triggerValue;
        
      // Stock
      case 'first_inventory':
        return activityData.type === 'inventory' && !stats.hasFirstInventory;
      case 'space_reorganized':
        return activityData.type === 'space_reorganized';
        
      // Communication
      case 'first_post':
        return activityData.type === 'social_post' && !stats.hasFirstPost;
      case 'viral_post':
        return activityData.type === 'viral_post' && (activityData.interactions || 0) >= triggerValue;
        
      // B2B
      case 'first_quote':
        return activityData.type === 'quote_sent' && !stats.hasFirstQuote;
      case 'quote_accepted':
        return activityData.type === 'quote_accepted';

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
}

// 🚀 Instance singleton
const escapeGameBadgeEngine = new EscapeGameBadgeEngine();

// Exposition globale pour Synergia
if (typeof window !== 'undefined') {
  window.escapeGameBadgeEngine = escapeGameBadgeEngine;
  
  // Fonctions de test rapide
  window.testEscapeBadges = async (userId) => {
    console.log('🧪 Test badges escape game pour:', userId);
    return await escapeGameBadgeEngine.checkAndAwardBadges(userId, {
      trigger: 'test',
      type: 'first_day'
    });
  };
  
  window.awardMaintenanceBadge = async (userId) => {
    return await escapeGameBadgeEngine.checkAndAwardBadges(userId, {
      trigger: 'manual',
      type: 'repair'
    });
  };
  
  console.log('🎭 EscapeGameBadgeEngine chargé dans Synergia !');
  console.log('🧪 Test: testEscapeBadges("userId")');
  console.log('🔧 Test maintenance: awardMaintenanceBadge("userId")');
}

// Exports
export default escapeGameBadgeEngine;
export { escapeGameBadgeEngine };

// Fonctions utilitaires
export const checkEscapeGameBadges = async (userId, activityData) => {
  return await escapeGameBadgeEngine.checkAndAwardBadges(userId, activityData);
};

export const getEscapeGameBadgesByRole = (role) => {
  return escapeGameBadgeEngine.getBadgesByRole(role);
};

export const getEscapeGameBadgeStats = (userBadges, userRole) => {
  return escapeGameBadgeEngine.getBadgeStats(userBadges, userRole);
};

console.log('🎭 Système de badges Escape Game prêt pour Synergia !');

// ==========================================
// 📁 react-app/src/features/rewards/index.js
// INDEX DU SYSTÈME DE RÉCOMPENSES SYNERGIA - VERSION ORIGINALE QUI MARCHAIT
// ==========================================

// 🎁 Services
export { default as rewardsService } from '../../core/services/rewardsService.js';

// 🏪 Stores
export { useRewardsStore } from '../../shared/stores/rewardsStore.js';

// 🎯 Hooks
export { useRewards } from '../../shared/hooks/useRewards.js';

// 📄 Pages
export { default as RewardsPage } from '../../pages/RewardsPage.jsx';
export { default as AdminRewardsPage } from '../../pages/AdminRewardsPage.jsx';

// 🧩 Composants
export { default as RewardsWidget } from '../../components/widgets/RewardsWidget.jsx';

// 📊 Types et constants
export const REWARD_TYPES = {
  INDIVIDUAL: 'individual',
  TEAM: 'team'
};

export const REWARD_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const XP_CATEGORIES = {
  MINI_PLEASURES: { min: 50, max: 100, name: 'Mini-plaisirs' },
  SMALL_ADVANTAGES: { min: 100, max: 200, name: 'Petits avantages' },
  USEFUL_PLEASURES: { min: 200, max: 400, name: 'Plaisirs utiles' },
  FOOD_GIFTS: { min: 400, max: 700, name: 'Plaisirs food & cadeaux' },
  WELLNESS: { min: 700, max: 1000, name: 'Bien-être & confort' },
  ENTERTAINMENT: { min: 1000, max: 1500, name: 'Loisirs & sorties' },
  LIFESTYLE: { min: 1500, max: 2500, name: 'Lifestyle & bonus' },
  TIME_ADVANTAGES: { min: 2500, max: 4000, name: 'Avantages temps offert' },
  BIG_PLEASURES: { min: 4000, max: 6000, name: 'Grands plaisirs' },
  PREMIUM: { min: 6000, max: 15000, name: 'Premium' }
};

// 🎯 Fonctions utilitaires
export const rewardsUtils = {
  /**
   * 🎁 Obtenir la catégorie d'une récompense selon son coût XP
   */
  getCategoryByXP: (xpCost) => {
    for (const [key, category] of Object.entries(XP_CATEGORIES)) {
      if (xpCost >= category.min && xpCost <= category.max) {
        return { key, ...category };
      }
    }
    return null;
  },

  /**
   * 💰 Vérifier si un utilisateur peut s'offrir une récompense
   */
  canAfford: (userXP, rewardCost) => {
    return userXP >= rewardCost;
  },

  /**
   * 📊 Calculer le pourcentage de progression vers une récompense
   */
  getProgressToReward: (userXP, rewardCost) => {
    return Math.min((userXP / rewardCost) * 100, 100);
  },

  /**
   * 🎯 Calculer les XP manquants pour une récompense
   */
  getXPNeeded: (userXP, rewardCost) => {
    return Math.max(rewardCost - userXP, 0);
  },

  /**
   * 🏆 Formater l'affichage des XP
   */
  formatXP: (xp) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  },

  /**
   * 📈 Calculer les statistiques d'un utilisateur
   */
  calculateUserStats: (rewardHistory) => {
    const approved = rewardHistory.filter(r => r.status === 'approved');
    const pending = rewardHistory.filter(r => r.status === 'pending');
    const rejected = rewardHistory.filter(r => r.status === 'rejected');

    return {
      totalRequests: rewardHistory.length,
      totalApproved: approved.length,
      totalPending: pending.length,
      totalRejected: rejected.length,
      approvalRate: rewardHistory.length > 0 ?
        (approved.length / rewardHistory.length) * 100 : 0
    };
  },

  /**
   * 🎨 Obtenir la couleur d'une catégorie
   */
  getCategoryColor: (categoryKey) => {
    const colors = {
      MINI_PLEASURES: 'from-green-400 to-blue-500',
      SMALL_ADVANTAGES: 'from-blue-400 to-purple-500',
      USEFUL_PLEASURES: 'from-purple-400 to-pink-500',
      FOOD_GIFTS: 'from-pink-400 to-red-500',
      WELLNESS: 'from-red-400 to-yellow-500',
      ENTERTAINMENT: 'from-yellow-400 to-orange-500',
      LIFESTYLE: 'from-orange-400 to-red-500',
      TIME_ADVANTAGES: 'from-red-400 to-purple-500',
      BIG_PLEASURES: 'from-purple-400 to-blue-500',
      PREMIUM: 'from-blue-400 to-green-500'
    };
    return colors[categoryKey] || 'from-gray-400 to-gray-500';
  }
};

console.log('🎁 Système de récompenses Synergia chargé !');
console.log('📊 Exports disponibles: rewardsService, useRewards, useRewardsStore, RewardsPage, AdminRewardsPage');

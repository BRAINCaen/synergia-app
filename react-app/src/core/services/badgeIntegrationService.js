// ==========================================
// 📁 react-app/src/core/services/badgeIntegrationService.js
// Service d'intégration pour le système de badges automatiques
// ==========================================

import BadgeEngine from './badgeEngine.js';
import { gamificationService } from './gamificationService.js';
import { toast } from 'react-hot-toast';

/**
 * 🔗 SERVICE D'INTÉGRATION BADGES
 * 
 * Interface principale entre l'UI et le Badge Engine
 * - Vérification automatique lors d'actions
 * - Gestion des notifications
 * - Synchronisation avec le système de gamification
 * - Statistiques et analytics
 */
class BadgeIntegrationService {
  static isInitialized = false;
  static eventListeners = new Map();

  /**
   * 🚀 INITIALISATION DU SERVICE
   */
  static init() {
    if (this.isInitialized) return;

    console.log('🏆 Badge Integration Service: Initialisation');

    // Écouter les événements de badges débloqués
    window.addEventListener('badgeUnlocked', this.handleBadgeUnlocked);

    // Écouter les événements de gamification pour déclencher les vérifications
    window.addEventListener('taskCompleted', this.handleTaskCompleted);
    window.addEventListener('projectCompleted', this.handleProjectCompleted);
    window.addEventListener('streakUpdated', this.handleStreakUpdated);
    window.addEventListener('levelUp', this.handleLevelUp);

    this.isInitialized = true;
  }

  /**
   * 🎯 GESTIONNAIRE BADGE DÉBLOQUÉ
   */
  static handleBadgeUnlocked = (event) => {
    const { badge } = event.detail;
    
    console.log('🏆 Badge débloqué:', badge.name);

    // Notification toast
    toast.success(`🏆 Badge débloqué: ${badge.name}`, {
      duration: 4000,
      icon: badge.icon,
      style: {
        background: '#1f2937',
        color: '#fff',
        border: '1px solid #374151'
      }
    });

    // Analytics
    this.trackBadgeUnlock(badge);
  };

  /**
   * ✅ GESTIONNAIRE TÂCHE COMPLÉTÉE
   */
  static handleTaskCompleted = async (event) => {
    const { task, userId } = event.detail;
    console.log('📋 Tâche complétée, vérification badges pour:', userId);
    
    await this.checkBadgesForUser(userId);
  };

  /**
   * 🏁 GESTIONNAIRE PROJET COMPLÉTÉ
   */
  static handleProjectCompleted = async (event) => {
    const { project, userId } = event.detail;
    console.log('📁 Projet complété, vérification badges pour:', userId);
    
    await this.checkBadgesForUser(userId);
  };

  /**
   * 🔥 GESTIONNAIRE STREAK MIS À JOUR
   */
  static handleStreakUpdated = async (event) => {
    const { streak, userId } = event.detail;
    console.log('🔥 Streak mis à jour, vérification badges pour:', userId);
    
    await this.checkBadgesForUser(userId);
  };

  /**
   * ⭐ GESTIONNAIRE LEVEL UP
   */
  static handleLevelUp = async (event) => {
    const { newLevel, userId } = event.detail;
    console.log('⭐ Level up, vérification badges pour:', userId);
    
    await this.checkBadgesForUser(userId);
  };

  /**
   * 🔍 VÉRIFICATION BADGES POUR UN UTILISATEUR
   */
  static async checkBadgesForUser(userId) {
    try {
      await BadgeEngine.checkAndAwardBadges(userId);
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
    }
  }

  /**
   * 🔧 VÉRIFICATION MANUELLE DES BADGES
   */
  static async manualBadgeCheck(userId) {
    try {
      console.log('🔧 Vérification manuelle badges pour:', userId);
      
      const newBadges = await BadgeEngine.checkAndAwardBadges(userId);
      
      if (newBadges && newBadges.length > 0) {
        toast.success(`🎉 ${newBadges.length} nouveau(x) badge(s) débloqué(s)!`);
        return newBadges;
      } else {
        toast('🔍 Aucun nouveau badge disponible', {
          icon: '🤔',
          style: {
            background: '#1f2937',
            color: '#fff'
          }
        });
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur vérification manuelle:', error);
      toast.error('❌ Erreur lors de la vérification des badges');
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES BADGES
   */
  static async getBadgeStats(userId) {
    try {
      const userData = await BadgeEngine.getUserAnalytics(userId);
      const allBadges = BadgeEngine.getAllBadges();
      const unlockedBadges = userData.badges || [];

      const statsByCategory = {};
      const statsByRarity = {};

      allBadges.forEach(badge => {
        // Stats par catégorie
        if (!statsByCategory[badge.category]) {
          statsByCategory[badge.category] = { total: 0, unlocked: 0 };
        }
        statsByCategory[badge.category].total++;
        if (unlockedBadges.includes(badge.id)) {
          statsByCategory[badge.category].unlocked++;
        }

        // Stats par rareté
        if (!statsByRarity[badge.rarity]) {
          statsByRarity[badge.rarity] = { total: 0, unlocked: 0 };
        }
        statsByRarity[badge.rarity].total++;
        if (unlockedBadges.includes(badge.id)) {
          statsByRarity[badge.rarity].unlocked++;
        }
      });

      const totalXpFromBadges = allBadges
        .filter(badge => unlockedBadges.includes(badge.id))
        .reduce((sum, badge) => sum + badge.xpReward, 0);

      return {
        total: allBadges.length,
        unlocked: unlockedBadges.length,
        completion: Math.round((unlockedBadges.length / allBadges.length) * 100),
        totalXpFromBadges,
        byCategory: statsByCategory,
        byRarity: statsByRarity,
        recentBadges: await this.getRecentBadges(userId, 5)
      };

    } catch (error) {
      console.error('❌ Erreur getBadgeStats:', error);
      return null;
    }
  }

  /**
   * 🕐 OBTENIR LES BADGES RÉCENTS
   */
  static async getRecentBadges(userId, limit = 5) {
    try {
      const userData = await BadgeEngine.getUserAnalytics(userId);
      const userBadges = userData.badges || [];
      const allBadges = BadgeEngine.getAllBadges();

      // Pour l'instant, on retourne les derniers badges par ordre d'ajout
      // Dans une vraie implémentation, on stockerait la date de déblocage
      return allBadges
        .filter(badge => userBadges.includes(badge.id))
        .slice(-limit)
        .reverse();

    } catch (error) {
      console.error('❌ Erreur getRecentBadges:', error);
      return [];
    }
  }

  /**
   * 📈 TRACKER UN DÉBLOCAGE DE BADGE
   */
  static trackBadgeUnlock(badge) {
    try {
      // Ici on pourrait envoyer des analytics à un service externe
      const analyticsData = {
        event: 'badge_unlocked',
        badge_id: badge.id,
        badge_name: badge.name,
        badge_category: badge.category,
        badge_rarity: badge.rarity,
        xp_reward: badge.xpReward,
        timestamp: new Date().toISOString()
      };

      console.log('📊 Analytics badge:', analyticsData);

      // Déclencher un événement personnalisé pour d'autres composants
      window.dispatchEvent(new CustomEvent('badgeAnalytics', {
        detail: analyticsData
      }));

    } catch (error) {
      console.error('❌ Erreur trackBadgeUnlock:', error);
    }
  }

  /**
   * 🎯 OBTENIR LES BADGES PROCHES DU DÉBLOCAGE
   */
  static async getNearCompletionBadges(userId, threshold = 80) {
    try {
      const allBadges = BadgeEngine.getAllBadges();
      const userData = await BadgeEngine.getUserAnalytics(userId);
      const userBadges = userData.badges || [];

      const nearCompletion = [];

      for (const badge of allBadges) {
        if (userBadges.includes(badge.id)) continue;

        const progress = await BadgeEngine.getBadgeProgress(badge.id, userId);
        if (progress && progress.percentage >= threshold) {
          nearCompletion.push({
            ...badge,
            progress: progress.percentage
          });
        }
      }

      return nearCompletion.sort((a, b) => b.progress - a.progress);

    } catch (error) {
      console.error('❌ Erreur getNearCompletionBadges:', error);
      return [];
    }
  }

  /**
   * 🗑️ NETTOYAGE DU SERVICE
   */
  static cleanup() {
    if (!this.isInitialized) return;

    window.removeEventListener('badgeUnlocked', this.handleBadgeUnlocked);
    window.removeEventListener('taskCompleted', this.handleTaskCompleted);
    window.removeEventListener('projectCompleted', this.handleProjectCompleted);
    window.removeEventListener('streakUpdated', this.handleStreakUpdated);
    window.removeEventListener('levelUp', this.handleLevelUp);

    this.isInitialized = false;
    console.log('🏆 Badge Integration Service: Nettoyage effectué');
  }

  /**
   * 🔄 SYNCHRONISATION AVEC LE SYSTÈME DE GAMIFICATION
   */
  static async syncWithGamification(userId) {
    try {
      console.log('🔄 Synchronisation badges avec gamification pour:', userId);

      // Obtenir les stats de gamification actuelles
      const gamificationData = await gamificationService.getUserGamificationData(userId);
      
      // Vérifier les badges basés sur ces données
      await this.checkBadgesForUser(userId);

      console.log('✅ Synchronisation terminée');

    } catch (error) {
      console.error('❌ Erreur syncWithGamification:', error);
    }
  }
}

export default BadgeIntegrationService;

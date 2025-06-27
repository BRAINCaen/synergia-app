// ==========================================
// 📁 react-app/src/core/services/badgeIntegrationService.js
// Service d'intégration pour le système de badges automatiques
// ==========================================

import BadgeEngine from './badgeEngine.js';
import { gamificationService } from './gamificationService.js';

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

    // ✅ CORRECTION: Notification simple console au lieu de toast
    // L'UI se chargera d'afficher les notifications via ses propres systèmes
    console.log(`🏆 Badge débloqué: ${badge.name}`, badge);

    // Émettre un événement personnalisé pour l'UI
    window.dispatchEvent(new CustomEvent('badgeNotification', {
      detail: {
        type: 'success',
        title: 'Badge débloqué !',
        message: `${badge.icon} ${badge.name}`,
        badge: badge
      }
    }));

    // Synchroniser avec le système de gamification
    this.syncWithGamification(badge.userId);
  };

  /**
   * 🎯 GESTIONNAIRES D'ÉVÉNEMENTS DE GAMIFICATION
   */
  static handleTaskCompleted = async (event) => {
    const { userId, taskData } = event.detail;
    console.log('📋 Tâche complétée - Vérification badges:', taskData);
    
    try {
      await this.checkBadgesForUser(userId);
    } catch (error) {
      console.error('Erreur vérification badges après tâche:', error);
    }
  };

  static handleProjectCompleted = async (event) => {
    const { userId, projectData } = event.detail;
    console.log('📁 Projet complété - Vérification badges:', projectData);
    
    try {
      await this.checkBadgesForUser(userId);
    } catch (error) {
      console.error('Erreur vérification badges après projet:', error);
    }
  };

  static handleStreakUpdated = async (event) => {
    const { userId, streakData } = event.detail;
    console.log('🔥 Streak mise à jour - Vérification badges:', streakData);
    
    try {
      await this.checkBadgesForUser(userId);
    } catch (error) {
      console.error('Erreur vérification badges après streak:', error);
    }
  };

  static handleLevelUp = async (event) => {
    const { userId, levelData } = event.detail;
    console.log('⭐ Level up - Vérification badges:', levelData);
    
    try {
      await this.checkBadgesForUser(userId);
    } catch (error) {
      console.error('Erreur vérification badges après level up:', error);
    }
  };

  /**
   * 🔄 VÉRIFICATION AUTOMATIQUE DES BADGES
   */
  static async checkBadgesForUser(userId) {
    if (!userId) return [];

    try {
      const newBadges = await BadgeEngine.checkAllBadges(userId);
      
      if (newBadges.length > 0) {
        console.log(`🎉 ${newBadges.length} nouveaux badges débloqués pour ${userId}`);
        
        // Émettre des événements pour chaque badge
        newBadges.forEach(badge => {
          window.dispatchEvent(new CustomEvent('badgeUnlocked', {
            detail: { badge: { ...badge, userId } }
          }));
        });
      }
      
      return newBadges;
    } catch (error) {
      console.error('Erreur lors de la vérification des badges:', error);
      return [];
    }
  }

  /**
   * 🔗 SYNCHRONISATION AVEC GAMIFICATION
   */
  static async syncWithGamification(userId) {
    try {
      // Récupérer les stats de gamification
      const gamificationData = await gamificationService.getUserStats(userId);
      
      // Déclencher une vérification basée sur les nouvelles stats
      await this.checkBadgesForUser(userId);
      
      console.log('✅ Synchronisation gamification terminée');
    } catch (error) {
      console.error('Erreur synchronisation gamification:', error);
    }
  }

  /**
   * 📊 OBTENIR LES BADGES PROCHES DU DÉBLOCAGE
   */
  static async getNearCompletionBadges(userId, threshold = 70) {
    try {
      const allBadges = await BadgeEngine.getAllBadges();
      const userStats = await BadgeEngine.getUserStats(userId);
      const nearCompletionBadges = [];

      for (const badge of allBadges) {
        if (badge.checkProgress) {
          const progress = await badge.checkProgress(userStats);
          
          if (progress >= threshold && progress < 100) {
            nearCompletionBadges.push({
              ...badge,
              progress: progress
            });
          }
        }
      }

      return nearCompletionBadges.sort((a, b) => b.progress - a.progress);
    } catch (error) {
      console.error('Erreur récupération badges proches:', error);
      return [];
    }
  }

  /**
   * 📈 OBTENIR LES STATISTIQUES DES BADGES
   */
  static async getBadgeStats(userId) {
    try {
      const userBadges = await BadgeEngine.getUserBadges(userId);
      const allBadges = await BadgeEngine.getAllBadges();
      
      const stats = {
        total: allBadges.length,
        earned: userBadges.length,
        percentage: Math.round((userBadges.length / allBadges.length) * 100),
        totalXpFromBadges: userBadges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0),
        byRarity: {},
        byCategory: {},
        recent: userBadges
          .filter(badge => badge.earnedAt)
          .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
          .slice(0, 5)
      };

      // Compter par rareté
      userBadges.forEach(badge => {
        const rarity = badge.rarity || 'common';
        stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1;
      });

      // Compter par catégorie
      userBadges.forEach(badge => {
        const category = badge.category || 'general';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erreur calcul statistiques badges:', error);
      return {
        total: 0,
        earned: 0,
        percentage: 0,
        totalXpFromBadges: 0,
        byRarity: {},
        byCategory: {},
        recent: []
      };
    }
  }

  /**
   * 🎯 DÉCLENCHER UNE VÉRIFICATION MANUELLE
   */
  static async triggerManualCheck(userId) {
    console.log('🔍 Vérification manuelle des badges déclenchée');
    
    try {
      const newBadges = await this.checkBadgesForUser(userId);
      
      // Émettre un événement pour informer l'UI
      window.dispatchEvent(new CustomEvent('manualBadgeCheck', {
        detail: { 
          userId, 
          newBadges,
          success: true,
          message: newBadges.length > 0 
            ? `${newBadges.length} nouveaux badges débloqués !`
            : 'Aucun nouveau badge débloqué'
        }
      }));
      
      return newBadges;
    } catch (error) {
      console.error('Erreur vérification manuelle:', error);
      
      // Émettre un événement d'erreur
      window.dispatchEvent(new CustomEvent('manualBadgeCheck', {
        detail: { 
          userId, 
          newBadges: [],
          success: false,
          error: error.message
        }
      }));
      
      throw error;
    }
  }

  /**
   * 🧹 NETTOYAGE DES ÉVÉNEMENTS
   */
  static cleanup() {
    if (!this.isInitialized) return;

    window.removeEventListener('badgeUnlocked', this.handleBadgeUnlocked);
    window.removeEventListener('taskCompleted', this.handleTaskCompleted);
    window.removeEventListener('projectCompleted', this.handleProjectCompleted);
    window.removeEventListener('streakUpdated', this.handleStreakUpdated);
    window.removeEventListener('levelUp', this.handleLevelUp);

    this.isInitialized = false;
    console.log('🧹 Badge Integration Service: Nettoyage terminé');
  }

  /**
   * 📤 EXPORTER LES DONNÉES DE BADGES (pour analytics)
   */
  static async exportBadgeData(userId) {
    try {
      const userBadges = await BadgeEngine.getUserBadges(userId);
      const stats = await this.getBadgeStats(userId);
      
      return {
        userId,
        badges: userBadges,
        stats,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur export données badges:', error);
      return null;
    }
  }
}

export default BadgeIntegrationService;

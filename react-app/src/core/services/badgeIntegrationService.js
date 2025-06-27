// ==========================================
// 📁 react-app/src/core/services/badgeIntegrationService.js
// Service d'intégration des badges - VERSION SIMPLIFIÉE SANS ERREURS
// ==========================================

/**
 * 🎯 SERVICE D'INTÉGRATION DES BADGES - VERSION SIMPLIFIÉE
 * Version temporaire qui évite les erreurs de BadgeEngine
 */
class BadgeIntegrationService {
  static isInitialized = false;

  /**
   * 🚀 INITIALISATION SIMPLIFIÉE
   */
  static initialize() {
    if (this.isInitialized) return;

    console.log('🎯 Badge Integration Service: Initialisation simplifiée');
    this.isInitialized = true;
  }

  /**
   * 📊 OBTENIR LES BADGES PROCHES DU DÉBLOCAGE (VERSION MOCK)
   */
  static async getNearCompletionBadges(userId, threshold = 70) {
    try {
      // Retourner des données mock pour éviter les erreurs
      return [
        {
          id: 'task_master',
          name: 'Maître des Tâches',
          description: 'Compléter 10 tâches',
          progress: 80,
          category: 'productivity',
          rarity: 'uncommon'
        },
        {
          id: 'week_warrior', 
          name: 'Guerrier Hebdomadaire',
          description: 'Une semaine d\'activité',
          progress: 75,
          category: 'consistency',
          rarity: 'rare'
        }
      ];
    } catch (error) {
      console.error('Erreur récupération badges proches (mock):', error);
      return [];
    }
  }

  /**
   * 📈 OBTENIR LES STATISTIQUES DES BADGES (VERSION MOCK)
   */
  static async getBadgeStats(userId) {
    try {
      return {
        total: 5,
        earned: 2,
        percentage: 40,
        totalXpFromBadges: 60,
        byRarity: {
          common: 1,
          uncommon: 1,
          rare: 0,
          epic: 0,
          legendary: 0
        },
        byCategory: {
          onboarding: 1,
          productivity: 1,
          consistency: 0,
          leadership: 0,
          progression: 0
        },
        recent: []
      };
    } catch (error) {
      console.error('Erreur calcul statistiques badges (mock):', error);
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
   * 🎯 VÉRIFICATION MANUELLE DES BADGES (VERSION MOCK)
   */
  static async manualBadgeCheck(userId) {
    try {
      console.log('🔍 Vérification manuelle des badges (mock)');
      
      // Simuler parfois de nouveaux badges
      const newBadges = Math.random() > 0.8 ? [
        {
          id: 'manual_checker',
          name: 'Vérificateur Manuel',
          description: 'Badge obtenu en vérifiant manuellement',
          icon: '🔍',
          xpReward: 25,
          category: 'special',
          rarity: 'rare',
          unlockedAt: new Date().toISOString()
        }
      ] : [];

      return newBadges;
    } catch (error) {
      console.error('Erreur vérification manuelle (mock):', error);
      return [];
    }
  }

  /**
   * 📜 OBTENIR LES BADGES RÉCENTS (VERSION MOCK)
   */
  static async getRecentBadges(userId, limit = 5) {
    try {
      return [
        {
          id: 'welcome_badge',
          name: 'Bienvenue !',
          description: 'Premier pas dans Synergia',
          icon: '🎯',
          xpReward: 10,
          unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'task_master',
          name: 'Maître des Tâches',
          description: 'Compléter 10 tâches',
          icon: '✅',
          xpReward: 50,
          unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ].slice(0, limit);
    } catch (error) {
      console.error('Erreur récupération badges récents (mock):', error);
      return [];
    }
  }

  /**
   * 🔄 VÉRIFICATION DES BADGES POUR UN UTILISATEUR (VERSION MOCK)
   */
  static async checkBadgesForUser(userId) {
    try {
      // Simuler parfois de nouveaux badges
      return Math.random() > 0.9 ? [
        {
          id: 'lucky_badge',
          name: 'Badge Chanceux',
          description: 'Badge rare obtenu par chance',
          icon: '🍀',
          xpReward: 100,
          category: 'special',
          rarity: 'legendary'
        }
      ] : [];
    } catch (error) {
      console.error('Erreur vérification badges utilisateur (mock):', error);
      return [];
    }
  }

  /**
   * 🧹 NETTOYAGE
   */
  static cleanup() {
    console.log('🧹 Badge Integration Service: Nettoyage (mock)');
    this.isInitialized = false;
  }
}

// Auto-initialisation
BadgeIntegrationService.initialize();

export default BadgeIntegrationService;

// ==========================================
// 📁 react-app/src/core/services/progressService.js
// SERVICE DE PROGRESSION - CORRECTIF BUILD
// ==========================================

/**
 * 🛡️ SERVICE DE PROGRESSION SIMPLIFIÉ
 * Pour résoudre l'erreur de build
 */
class ProgressService {
  constructor() {
    this.name = 'ProgressService';
    this.version = '3.5.3';
  }

  /**
   * 📊 MISE À JOUR PROGRESSION UTILISATEUR
   */
  async updateUserProgress(userId, progressData) {
    try {
      console.log('📊 [PROGRESS] updateUserProgress:', userId, progressData);
      
      if (!userId) {
        throw new Error('userId requis');
      }

      if (!progressData) {
        throw new Error('progressData requis');
      }

      // 🛡️ SÉCURISATION xpReward
      if (progressData && typeof progressData.xpReward !== 'undefined') {
        if (typeof progressData.xpReward !== 'number' || progressData.xpReward < 0) {
          console.warn('⚠️ [XP-SAFETY] xpReward invalide corrigé:', progressData.xpReward);
          progressData.xpReward = Math.abs(Number(progressData.xpReward)) || 0;
        }
      }

      // Simuler une mise à jour avec localStorage
      const key = `userProgress_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      
      const updated = {
        ...existing,
        ...progressData,
        userId,
        lastUpdated: new Date().toISOString(),
        version: this.version
      };

      // Calculer niveau basé sur expérience
      if (updated.experience) {
        updated.level = Math.floor(updated.experience / 100) + 1;
        updated.experienceToNext = ((updated.level) * 100) - updated.experience;
      }

      localStorage.setItem(key, JSON.stringify(updated));
      
      console.log('✅ [PROGRESS] Progression mise à jour:', updated);
      return { success: true, data: updated };

    } catch (error) {
      console.error('❌ [PROGRESS] Erreur updateUserProgress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 RÉCUPÉRATION PROGRESSION UTILISATEUR
   */
  async getUserProgress(userId) {
    try {
      console.log('📊 [PROGRESS] getUserProgress:', userId);
      
      if (!userId) {
        throw new Error('userId requis');
      }

      const key = `userProgress_${userId}`;
      const data = JSON.parse(localStorage.getItem(key) || 'null');
      
      if (data) {
        // 🛡️ SÉCURISATION des données retournées
        if (data.xpReward && typeof data.xpReward !== 'number') {
          console.warn('⚠️ [XP-SAFETY] xpReward dans données utilisateur corrigé');
          data.xpReward = Number(data.xpReward) || 0;
        }

        console.log('✅ [PROGRESS] Progression récupérée:', data);
        return { success: true, data };
      }
      
      // Créer progression par défaut
      const defaultData = {
        userId,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        streak: 0,
        longestStreak: 0,
        totalTasks: 0,
        completedTasks: 0,
        stats: {
          tasksCompleted: 0,
          currentStreak: 0,
          totalPoints: 0,
          highPriorityTasks: 0,
          tasksCompletedEarly: 0
        },
        achievements: [],
        badges: [],
        milestones: [],
        lastActivityDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: this.version
      };

      // Sauvegarder les données par défaut
      localStorage.setItem(key, JSON.stringify(defaultData));
      
      console.log('✅ [PROGRESS] Progression par défaut créée:', defaultData);
      return { success: true, data: defaultData };

    } catch (error) {
      console.error('❌ [PROGRESS] Erreur getUserProgress:', error);
      return { 
        success: false, 
        error: error.message, 
        data: {
          userId,
          level: 1,
          experience: 0,
          stats: { tasksCompleted: 0 },
          error: error.message
        }
      };
    }
  }

  /**
   * 🎯 AJOUTER XP
   */
  async addExperience(userId, xpAmount, description = '') {
    try {
      console.log('🎯 [PROGRESS] addExperience:', userId, xpAmount, description);

      if (!userId || !xpAmount) {
        throw new Error('userId et xpAmount requis');
      }

      // 🛡️ SÉCURISATION xpAmount
      const safeXP = Math.abs(Number(xpAmount)) || 0;
      
      const currentProgress = await this.getUserProgress(userId);
      if (!currentProgress.success) {
        throw new Error('Impossible de récupérer la progression');
      }

      const currentData = currentProgress.data;
      const newExperience = (currentData.experience || 0) + safeXP;
      const newLevel = Math.floor(newExperience / 100) + 1;
      const experienceToNext = (newLevel * 100) - newExperience;

      const updateData = {
        experience: newExperience,
        level: newLevel,
        experienceToNext: Math.max(0, experienceToNext),
        stats: {
          ...currentData.stats,
          totalPoints: (currentData.stats?.totalPoints || 0) + safeXP
        },
        lastXpGain: {
          amount: safeXP,
          description,
          timestamp: new Date().toISOString()
        }
      };

      const result = await this.updateUserProgress(userId, updateData);
      
      console.log('✅ [PROGRESS] XP ajouté avec succès:', {
        userId,
        xpAdded: safeXP,
        newExperience,
        newLevel
      });

      return result;

    } catch (error) {
      console.error('❌ [PROGRESS] Erreur addExperience:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏆 AJOUTER RÉALISATION
   */
  async addAchievement(userId, achievement) {
    try {
      const currentProgress = await this.getUserProgress(userId);
      if (!currentProgress.success) {
        throw new Error('Impossible de récupérer la progression');
      }

      const currentData = currentProgress.data;
      const newAchievements = [...(currentData.achievements || []), {
        ...achievement,
        unlockedAt: new Date().toISOString(),
        id: achievement.id || `achievement_${Date.now()}`
      }];

      const updateData = {
        achievements: newAchievements
      };

      return await this.updateUserProgress(userId, updateData);

    } catch (error) {
      console.error('❌ [PROGRESS] Erreur addAchievement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 RÉINITIALISER PROGRESSION
   */
  async resetUserProgress(userId) {
    try {
      if (!userId) {
        throw new Error('userId requis');
      }

      const key = `userProgress_${userId}`;
      localStorage.removeItem(key);
      
      console.log('🔄 [PROGRESS] Progression réinitialisée pour:', userId);
      return { success: true, message: 'Progression réinitialisée' };

    } catch (error) {
      console.error('❌ [PROGRESS] Erreur resetUserProgress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR STATISTIQUES
   */
  async getProgressStats(userId) {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress.success) {
        return progress;
      }

      const data = progress.data;
      const stats = {
        level: data.level || 1,
        experience: data.experience || 0,
        experienceToNext: data.experienceToNext || 100,
        totalTasks: data.stats?.tasksCompleted || 0,
        currentStreak: data.stats?.currentStreak || 0,
        totalPoints: data.stats?.totalPoints || 0,
        achievementsCount: data.achievements?.length || 0,
        badgesCount: data.badges?.length || 0
      };

      return { success: true, data: stats };

    } catch (error) {
      console.error('❌ [PROGRESS] Erreur getProgressStats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Créer l'instance du service
const progressService = new ProgressService();

// Export par défaut
export default progressService;

// Export nommé pour compatibilité
export { progressService };

// Log de confirmation
console.log('📊 ProgressService créé pour résoudre l\'erreur de build');
console.log('✅ Service disponible avec protection XP Safety intégrée');

// src/core/services/gamificationService.js
import { 
  collection, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { firebaseDb } from '../firebase.js';

const USER_STATS_COLLECTION = 'userStats';
const LEADERBOARD_COLLECTION = 'leaderboard';

// Configuration des niveaux et badges
const LEVEL_CONFIG = {
  1: { min: 0, max: 99, name: 'Novice', color: '#9CA3AF' },
  2: { min: 100, max: 249, name: 'Apprenti', color: '#10B981' },
  3: { min: 250, max: 499, name: 'Explorateur', color: '#3B82F6' },
  4: { min: 500, max: 999, name: 'Expert', color: '#8B5CF6' },
  5: { min: 1000, max: 1999, name: 'Maître', color: '#F59E0B' },
  6: { min: 2000, max: 4999, name: 'Champion', color: '#EF4444' },
  7: { min: 5000, max: 9999, name: 'Légende', color: '#EC4899' },
  8: { min: 10000, max: Infinity, name: 'Mythique', color: '#7C3AED' }
};

const BADGES_CONFIG = {
  FIRST_TASK: {
    id: 'first_task',
    name: 'Premier Pas',
    description: 'Première tâche créée',
    icon: '🎯',
    xp: 10,
    condition: (stats) => stats.tasksCreated >= 1
  },
  TASK_MASTER: {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Complétez 10 tâches',
    icon: '✅',
    xp: 50,
    condition: (stats) => stats.tasksCompleted >= 10
  },
  PRODUCTIVITY_GURU: {
    id: 'productivity_guru',
    name: 'Guru de la Productivité',
    description: 'Complétez 50 tâches',
    icon: '🚀',
    xp: 200,
    condition: (stats) => stats.tasksCompleted >= 50
  },
  WEEK_STREAK: {
    id: 'week_streak',
    name: 'Série Hebdomadaire',
    description: 'Connectez-vous 7 jours consécutifs',
    icon: '🔥',
    xp: 100,
    condition: (stats) => stats.loginStreak >= 7
  },
  PROJECT_STARTER: {
    id: 'project_starter',
    name: 'Lanceur de Projets',
    description: 'Créez votre premier projet',
    icon: '📁',
    xp: 25,
    condition: (stats) => stats.projectsCreated >= 1
  },
  COLLABORATOR: {
    id: 'collaborator',
    name: 'Collaborateur',
    description: 'Rejoignez un projet d\'équipe',
    icon: '🤝',
    xp: 30,
    condition: (stats) => stats.projectsJoined >= 1
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Démon de Vitesse',
    description: 'Complétez 5 tâches en une journée',
    icon: '⚡',
    xp: 75,
    condition: (stats) => stats.maxTasksPerDay >= 5
  },
  PERFECTIONIST: {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Maintenez un taux de complétion de 90%',
    icon: '💎',
    xp: 150,
    condition: (stats) => stats.completionRate >= 90 && stats.tasksCreated >= 20
  }
};

class GamificationService {
  constructor() {
    this.db = firebaseDb;
  }

  // Initialiser les statistiques d'un utilisateur
  async initializeUserStats(userId, userEmail) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);
      const statsSnap = await getDoc(userStatsRef);

      if (!statsSnap.exists()) {
        const initialStats = {
          userId,
          email: userEmail,
          totalXp: 0,
          level: 1,
          tasksCreated: 0,
          tasksCompleted: 0,
          projectsCreated: 0,
          projectsJoined: 0,
          badges: [],
          loginStreak: 1,
          lastLoginDate: serverTimestamp(),
          completionRate: 0,
          maxTasksPerDay: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(userStatsRef, initialStats);
        console.log('✅ Statistiques utilisateur initialisées');
        return initialStats;
      }

      return { id: statsSnap.id, ...statsSnap.data() };
    } catch (error) {
      console.error('❌ Erreur initialisation stats:', error);
      throw error;
    }
  }

  // Ajouter des points XP
  async addXP(userId, xpAmount, reason = 'Activité') {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);
      const statsSnap = await getDoc(userStatsRef);

      if (!statsSnap.exists()) {
        throw new Error('Statistiques utilisateur non trouvées');
      }

      const currentStats = statsSnap.data();
      const newTotalXp = currentStats.totalXp + xpAmount;
      const newLevel = this.calculateLevel(newTotalXp);

      // Mettre à jour les statistiques
      await updateDoc(userStatsRef, {
        totalXp: newTotalXp,
        level: newLevel,
        updatedAt: serverTimestamp()
      });

      // Mettre à jour le leaderboard
      await this.updateLeaderboard(userId, currentStats.email, newTotalXp, newLevel);

      // Vérifier les nouveaux badges
      const newBadges = await this.checkForNewBadges(userId);

      console.log(`✅ +${xpAmount} XP ajoutés (${reason}). Total: ${newTotalXp} XP`);

      return {
        xpGained: xpAmount,
        totalXp: newTotalXp,
        level: newLevel,
        levelUp: newLevel > currentStats.level,
        newBadges,
        reason
      };
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      throw error;
    }
  }

  // Calculer le niveau basé sur l'XP total
  calculateLevel(totalXp) {
    for (const [level, config] of Object.entries(LEVEL_CONFIG)) {
      if (totalXp >= config.min && totalXp <= config.max) {
        return parseInt(level);
      }
    }
    return 1;
  }

  // Obtenir les informations de niveau
  getLevelInfo(level) {
    return LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  }

  // Calculer la progression vers le niveau suivant
  calculateLevelProgress(totalXp, currentLevel) {
    const currentLevelConfig = LEVEL_CONFIG[currentLevel];
    const nextLevelConfig = LEVEL_CONFIG[currentLevel + 1];

    if (!nextLevelConfig) {
      return { progress: 100, xpNeeded: 0, xpCurrent: totalXp };
    }

    const xpInCurrentLevel = totalXp - currentLevelConfig.min;
    const xpRequiredForNextLevel = nextLevelConfig.min - currentLevelConfig.min;
    const progress = Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100);

    return {
      progress: Math.min(progress, 100),
      xpNeeded: nextLevelConfig.min - totalXp,
      xpCurrent: xpInCurrentLevel,
      xpRequired: xpRequiredForNextLevel
    };
  }

  // Mettre à jour les statistiques de tâche
  async updateTaskStats(userId, action) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);
      const updates = { updatedAt: serverTimestamp() };

      switch (action) {
        case 'created':
          updates.tasksCreated = increment(1);
          break;
        case 'completed':
          updates.tasksCompleted = increment(1);
          break;
      }

      await updateDoc(userStatsRef, updates);

      // Recalculer le taux de complétion
      await this.updateCompletionRate(userId);

      console.log(`✅ Statistiques de tâche mises à jour: ${action}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour stats tâche:', error);
      throw error;
    }
  }

  // Mettre à jour le taux de complétion
  async updateCompletionRate(userId) {
    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);
      const statsSnap = await getDoc(userStatsRef);

      if (statsSnap.exists()) {
        const stats = statsSnap.data();
        const completionRate = stats.tasksCreated > 0 
          ? Math.round((stats.tasksCompleted / stats.tasksCreated) * 100)
          : 0;

        await updateDoc(userStatsRef, {
          completionRate,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour taux complétion:', error);
    }
  }

  // Vérifier et débloquer de nouveaux badges
  async checkForNewBadges(userId) {
    if (!this.db) {
      return [];
    }

    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);
      const statsSnap = await getDoc(userStatsRef);

      if (!statsSnap.exists()) {
        return [];
      }

      const stats = statsSnap.data();
      const currentBadges = stats.badges || [];
      const newBadges = [];

      for (const badge of Object.values(BADGES_CONFIG)) {
        // Vérifier si le badge n'est pas déjà débloqué
        if (!currentBadges.some(b => b.id === badge.id) && badge.condition(stats)) {
          newBadges.push(badge);
          
          // Ajouter le badge à l'utilisateur
          await updateDoc(userStatsRef, {
            badges: arrayUnion({
              id: badge.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              unlockedAt: serverTimestamp()
            }),
            totalXp: increment(badge.xp),
            updatedAt: serverTimestamp()
          });

          console.log(`🏆 Nouveau badge débloqué: ${badge.name} (+${badge.xp} XP)`);
        }
      }

      return newBadges;
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return [];
    }
  }

  // Mettre à jour le leaderboard
  async updateLeaderboard(userId, userEmail, totalXp, level) {
    try {
      const leaderboardRef = doc(this.db, LEADERBOARD_COLLECTION, userId);
      
      await setDoc(leaderboardRef, {
        userId,
        email: userEmail,
        totalXp,
        level,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error('❌ Erreur mise à jour leaderboard:', error);
    }
  }

  // Récupérer le leaderboard
  async getLeaderboard(limitCount = 10) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const q = query(
        collection(this.db, LEADERBOARD_COLLECTION),
        orderBy('totalXp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const leaderboard = [];

      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        leaderboard.push({
          rank: index + 1,
          ...data,
          levelInfo: this.getLevelInfo(data.level)
        });
      });

      return leaderboard;
    } catch (error) {
      console.error('❌ Erreur récupération leaderboard:', error);
      throw error;
    }
  }

  // Récupérer les statistiques d'un utilisateur
  async getUserStats(userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);
      const statsSnap = await getDoc(userStatsRef);

      if (!statsSnap.exists()) {
        return null;
      }

      const stats = statsSnap.data();
      const levelInfo = this.getLevelInfo(stats.level);
      const levelProgress = this.calculateLevelProgress(stats.totalXp, stats.level);

      return {
        ...stats,
        levelInfo,
        levelProgress,
        badges: stats.badges || []
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats utilisateur:', error);
      throw error;
    }
  }

  // Écouter les changements de statistiques en temps réel
  subscribeToUserStats(userId, callback) {
    if (!this.db) {
      console.warn('Firebase non configuré - Mode offline');
      return () => {};
    }

    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);

      const unsubscribe = onSnapshot(userStatsRef, (doc) => {
        if (doc.exists()) {
          const stats = doc.data();
          const levelInfo = this.getLevelInfo(stats.level);
          const levelProgress = this.calculateLevelProgress(stats.totalXp, stats.level);

          callback({
            ...stats,
            levelInfo,
            levelProgress,
            badges: stats.badges || []
          });
        }
      }, (error) => {
        console.error('❌ Erreur écoute stats:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur abonnement stats:', error);
      return () => {};
    }
  }

  // Mettre à jour la série de connexions
  async updateLoginStreak(userId) {
    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);
      const statsSnap = await getDoc(userStatsRef);

      if (statsSnap.exists()) {
        const stats = statsSnap.data();
        const lastLogin = stats.lastLoginDate?.toDate();
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = 1;
        
        if (lastLogin) {
          const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
          const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          
          if (lastLoginDate.getTime() === yesterdayDate.getTime()) {
            newStreak = (stats.loginStreak || 0) + 1;
          }
        }

        await updateDoc(userStatsRef, {
          loginStreak: newStreak,
          lastLoginDate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Vérifier les badges liés à la série de connexions
        await this.checkForNewBadges(userId);

        return newStreak;
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour série connexions:', error);
    }
  }
}

// Instance singleton
export const gamificationService = new GamificationService();
export default gamificationService;

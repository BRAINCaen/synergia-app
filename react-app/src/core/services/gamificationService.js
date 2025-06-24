// src/core/services/gamificationService.js - Service Firebase pour remplacer la démo
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
  }
};

class GamificationService {
  constructor() {
    this.db = firebaseDb;
  }

  // Données mock pour mode démo/développement
  getMockUserData() {
    return {
      userId: 'demo-user',
      email: 'demo@synergia.com',
      totalXp: 240,
      level: 3,
      tasksCreated: 15,
      tasksCompleted: 12,
      projectsCreated: 2,
      projectsJoined: 0,
      badges: [
        {
          id: 'first_task',
          name: 'Premier Pas',
          description: 'Première tâche créée',
          icon: '🎯',
          unlockedAt: new Date()
        }
      ],
      loginStreak: 5,
      lastLoginDate: new Date(),
      completionRate: 80,
      maxTasksPerDay: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Initialiser les statistiques d'un utilisateur
  async initializeUserData(userId, userEmail = 'user@example.com') {
    // Si Firebase non configuré, retourner données mock
    if (!this.db) {
      console.warn('⚠️ Firebase non configuré - Mode démo');
      return this.getMockUserData();
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
        return { ...initialStats, lastLoginDate: new Date(), createdAt: new Date(), updatedAt: new Date() };
      }

      const data = statsSnap.data();
      return {
        ...data,
        lastLoginDate: data.lastLoginDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    } catch (error) {
      console.error('❌ Erreur initialisation stats:', error);
      // Fallback sur données mock en cas d'erreur
      return this.getMockUserData();
    }
  }

  // Ajouter des points XP
  async addXP(userId, xpAmount, reason = 'Activité') {
    // Si Firebase non configuré, simuler
    if (!this.db) {
      console.log(`🎮 [MOCK] +${xpAmount} XP pour ${reason}`);
      return {
        xpGained: xpAmount,
        totalXp: 240 + xpAmount,
        level: 3,
        levelUp: false,
        newBadges: [],
        reason
      };
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
      // Fallback mode démo
      return {
        xpGained: xpAmount,
        totalXp: 240 + xpAmount,
        level: 3,
        levelUp: false,
        newBadges: [],
        reason,
        error: error.message
      };
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

  // Calculer l'XP requis pour le prochain niveau
  getXPForNextLevel(currentLevel) {
    const nextLevelConfig = LEVEL_CONFIG[currentLevel + 1];
    if (!nextLevelConfig) return 0;
    return nextLevelConfig.min;
  }

  // Mettre à jour les statistiques de tâche
  async updateTaskStats(userId, action) {
    if (!this.db) {
      console.log(`🔧 [MOCK] Stats tâche mises à jour: ${action}`);
      return;
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

  // Écouter les changements de statistiques en temps réel
  subscribeToUserData(userId, callback) {
    if (!this.db) {
      console.warn('⚠️ Firebase non configuré - Mode mock');
      callback(this.getMockUserData());
      return () => {};
    }

    try {
      const userStatsRef = doc(this.db, USER_STATS_COLLECTION, userId);

      const unsubscribe = onSnapshot(userStatsRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            ...data,
            lastLoginDate: data.lastLoginDate?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          });
        } else {
          // Initialiser si pas de données
          this.initializeUserData(userId).then(data => callback(data));
        }
      }, (error) => {
        console.error('❌ Erreur écoute stats:', error);
        // Fallback sur données mock
        callback(this.getMockUserData());
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur abonnement stats:', error);
      callback(this.getMockUserData());
      return () => {};
    }
  }

  // Actions rapides pour compléter des tâches
  async completeTask(userId, taskDifficulty = 'normal') {
    const xpRewards = {
      easy: 20,
      normal: 40, 
      hard: 60,
      expert: 100
    };
    
    const xpReward = xpRewards[taskDifficulty] || 40;
    return await this.addXP(userId, xpReward, `Tâche ${taskDifficulty} complétée`);
  }

  async dailyLogin(userId) {
    return await this.addXP(userId, 10, 'Connexion quotidienne');
  }

  // Récupérer le leaderboard
  async getLeaderboard(limitCount = 10) {
    if (!this.db) {
      // Données mock pour leaderboard
      return [
        { rank: 1, userId: 'user1', email: 'leader@example.com', totalXp: 2500, level: 5 },
        { rank: 2, userId: 'user2', email: 'second@example.com', totalXp: 1800, level: 4 },
        { rank: 3, userId: 'demo-user', email: 'demo@synergia.com', totalXp: 240, level: 3 }
      ];
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
      return [];
    }
  }
}

// Instance singleton
const gamificationService = new GamificationService();

// Exports compatibles avec l'ancien code
export default gamificationService;
export { gamificationService };

// Exports pour compatibilité
export const initializeUserData = (userId, email) => gamificationService.initializeUserData(userId, email);
export const getMockUserData = () => gamificationService.getMockUserData();
export const addXP = (userId, amount, reason) => gamificationService.addXP(userId, amount, reason);
export const completeTask = (userId, difficulty) => gamificationService.completeTask(userId, difficulty);
export const subscribeToUserData = (userId, callback) => gamificationService.subscribeToUserData(userId, callback);

// ==========================================
// 📁 react-app/src/services/leaderboardService.js
// Service pour le leaderboard en temps réel
// ==========================================

import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  where,
  startAfter,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import userService from './userService.js';

class LeaderboardService {
  constructor() {
    this.listeners = new Map();
  }

  // Récupérer le leaderboard global par XP
  async getGlobalLeaderboard(limitCount = 50) {
    try {
      console.log('📊 Récupération leaderboard global...');
      
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('gamification.totalXp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(usersQuery);
      const leaderboard = [];

      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        leaderboard.push({
          rank: index + 1,
          uid: doc.id,
          displayName: userData.displayName || 'Utilisateur',
          photoURL: userData.photoURL,
          department: userData.profile?.department,
          xp: userData.gamification?.totalXp || 0,
          level: userData.gamification?.level || 1,
          badges: (userData.gamification?.badges || []).length,
          tasksCompleted: userData.gamification?.tasksCompleted || 0,
          loginStreak: userData.gamification?.loginStreak || 0
        });
      });

      console.log(`✅ Leaderboard chargé: ${leaderboard.length} utilisateurs`);
      return { data: leaderboard, error: null };

    } catch (error) {
      console.error('❌ Erreur récupération leaderboard:', error);
      return { data: [], error: error.message };
    }
  }

  // Récupérer le leaderboard hebdomadaire
  async getWeeklyLeaderboard(limitCount = 20) {
    try {
      console.log('📅 Récupération leaderboard hebdomadaire...');
      
      // Calculer le début de la semaine
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Récupérer les activités de cette semaine
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('type', '==', 'xp_gained'),
        where('timestamp', '>=', startOfWeek),
        orderBy('timestamp', 'desc')
      );

      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      // Calculer l'XP par utilisateur cette semaine
      const weeklyXP = new Map();
      activitiesSnapshot.forEach(doc => {
        const activity = doc.data();
        const userId = activity.userId;
        const xp = activity.data?.xpAmount || 0;
        
        weeklyXP.set(userId, (weeklyXP.get(userId) || 0) + xp);
      });

      // Récupérer les infos utilisateurs
      const leaderboard = [];
      for (const [userId, xp] of weeklyXP.entries()) {
        const userResult = await userService.getUserProfile(userId);
        if (!userResult.error && userResult.data) {
          const userData = userResult.data;
          leaderboard.push({
            uid: userId,
            displayName: userData.displayName || 'Utilisateur',
            photoURL: userData.photoURL,
            department: userData.profile?.department,
            weeklyXP: xp,
            level: userData.gamification?.level || 1,
            badges: (userData.gamification?.badges || []).length
          });
        }
      }

      // Trier et ajouter les rangs
      leaderboard.sort((a, b) => b.weeklyXP - a.weeklyXP);
      leaderboard.forEach((user, index) => {
        user.rank = index + 1;
      });

      return { 
        data: leaderboard.slice(0, limitCount), 
        error: null 
      };

    } catch (error) {
      console.error('❌ Erreur leaderboard hebdomadaire:', error);
      return { data: [], error: error.message };
    }
  }

  // Récupérer le leaderboard par département
  async getDepartmentLeaderboard(department, limitCount = 20) {
    try {
      console.log('🏢 Récupération leaderboard département:', department);
      
      const usersQuery = query(
        collection(db, 'users'),
        where('profile.department', '==', department),
        orderBy('gamification.totalXp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(usersQuery);
      const leaderboard = [];

      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        leaderboard.push({
          rank: index + 1,
          uid: doc.id,
          displayName: userData.displayName || 'Utilisateur',
          photoURL: userData.photoURL,
          xp: userData.gamification?.totalXp || 0,
          level: userData.gamification?.level || 1,
          badges: (userData.gamification?.badges || []).length,
          tasksCompleted: userData.gamification?.tasksCompleted || 0
        });
      });

      return { data: leaderboard, error: null };

    } catch (error) {
      console.error('❌ Erreur leaderboard département:', error);
      return { data: [], error: error.message };
    }
  }

  // Obtenir la position d'un utilisateur dans le leaderboard global
  async getUserRank(userId) {
    try {
      console.log('🎯 Calcul rang utilisateur:', userId);
      
      const userResult = await userService.getUserProfile(userId);
      if (userResult.error) return { rank: null, error: userResult.error };
      
      const userXP = userResult.data.gamification?.totalXp || 0;
      
      // Compter combien d'utilisateurs ont plus d'XP
      const higherXPQuery = query(
        collection(db, 'users'),
        where('gamification.totalXp', '>', userXP)
      );
      
      const snapshot = await getDocs(higherXPQuery);
      const rank = snapshot.size + 1;
      
      console.log(`✅ Rang utilisateur ${userId}: ${rank}`);
      return { rank, error: null };

    } catch (error) {
      console.error('❌ Erreur calcul rang:', error);
      return { rank: null, error: error.message };
    }
  }

  // Écouter les changements du leaderboard en temps réel
  onLeaderboardChange(type = 'global', callback, options = {}) {
    const { limit: limitCount = 20, department } = options;
    
    let leaderboardQuery;
    
    switch (type) {
      case 'global':
        leaderboardQuery = query(
          collection(db, 'users'),
          orderBy('gamification.totalXp', 'desc'),
          limit(limitCount)
        );
        break;
      
      case 'department':
        if (!department) throw new Error('Département requis pour le leaderboard départemental');
        leaderboardQuery = query(
          collection(db, 'users'),
          where('profile.department', '==', department),
          orderBy('gamification.totalXp', 'desc'),
          limit(limitCount)
        );
        break;
      
      default:
        throw new Error(`Type de leaderboard non supporté: ${type}`);
    }

    const unsubscribe = onSnapshot(leaderboardQuery, (snapshot) => {
      const leaderboard = [];
      
      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        leaderboard.push({
          rank: index + 1,
          uid: doc.id,
          displayName: userData.displayName || 'Utilisateur',
          photoURL: userData.photoURL,
          department: userData.profile?.department,
          xp: userData.gamification?.totalXp || 0,
          level: userData.gamification?.level || 1,
          badges: (userData.gamification?.badges || []).length,
          tasksCompleted: userData.gamification?.tasksCompleted || 0,
          loginStreak: userData.gamification?.loginStreak || 0
        });
      });
      
      callback(leaderboard);
    }, (error) => {
      console.error('❌ Erreur écoute leaderboard:', error);
      callback([], error);
    });

    // Stocker l'unsubscriber
    const listenerId = `${type}_${department || 'global'}_${Date.now()}`;
    this.listeners.set(listenerId, unsubscribe);
    
    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  // Obtenir les statistiques de comparaison
  async getComparisonStats(userId) {
    try {
      const userResult = await userService.getUserProfile(userId);
      if (userResult.error) return { stats: null, error: userResult.error };
      
      const user = userResult.data;
      const userXP = user.gamification?.totalXp || 0;
      const userLevel = user.gamification?.level || 1;
      const userBadges = (user.gamification?.badges || []).length;
      
      // Calculer les moyennes globales
      const allUsersQuery = query(collection(db, 'users'));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      let totalXP = 0;
      let totalLevels = 0;
      let totalBadges = 0;
      let userCount = 0;
      
      allUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        totalXP += userData.gamification?.totalXp || 0;
        totalLevels += userData.gamification?.level || 1;
        totalBadges += (userData.gamification?.badges || []).length;
        userCount++;
      });
      
      const avgXP = userCount > 0 ? Math.round(totalXP / userCount) : 0;
      const avgLevel = userCount > 0 ? Math.round(totalLevels / userCount) : 1;
      const avgBadges = userCount > 0 ? Math.round(totalBadges / userCount) : 0;
      
      // Calculer les percentiles
      const xpPercentile = await this.calculatePercentile(userXP, 'gamification.totalXp');
      
      return {
        stats: {
          user: {
            xp: userXP,
            level: userLevel,
            badges: userBadges
          },
          averages: {
            xp: avgXP,
            level: avgLevel,
            badges: avgBadges
          },
          comparisons: {
            xpVsAvg: userXP - avgXP,
            levelVsAvg: userLevel - avgLevel,
            badgesVsAvg: userBadges - avgBadges,
            percentile: xpPercentile
          },
          totalUsers: userCount
        },
        error: null
      };

    } catch (error) {
      console.error('❌ Erreur stats comparaison:', error);
      return { stats: null, error: error.message };
    }
  }

  // Calculer le percentile d'un utilisateur
  async calculatePercentile(userValue, field) {
    try {
      const lowerQuery = query(
        collection(db, 'users'),
        where(field, '<', userValue)
      );
      
      const snapshot = await getDocs(lowerQuery);
      const lowerCount = snapshot.size;
      
      const totalQuery = query(collection(db, 'users'));
      const totalSnapshot = await getDocs(totalQuery);
      const totalCount = totalSnapshot.size;
      
      return totalCount > 0 ? Math.round((lowerCount / totalCount) * 100) : 0;

    } catch (error) {
      console.error('❌ Erreur calcul percentile:', error);
      return 0;
    }
  }

  // Nettoyer tous les listeners
  cleanup() {
    console.log('🧹 Nettoyage listeners leaderboard...');
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  // Obtenir les tendances (qui monte/descend dans le classement)
  async getTrends(timeframe = 'week') {
    try {
      // Pour l'instant, retourner des données simulées
      // Dans une vraie implémentation, on comparerait avec les données historiques
      const currentLeaderboard = await this.getGlobalLeaderboard(10);
      
      if (currentLeaderboard.error) return currentLeaderboard;
      
      const trends = currentLeaderboard.data.map((user, index) => ({
        ...user,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.floor(Math.random() * 5) + 1
      }));
      
      return { data: trends, error: null };

    } catch (error) {
      console.error('❌ Erreur récupération tendances:', error);
      return { data: [], error: error.message };
    }
  }
}

export default new LeaderboardService();

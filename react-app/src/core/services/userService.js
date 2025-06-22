// ==========================================
// 📁 react-app/src/core/services/userService.js
// Service pour la gestion des utilisateurs
// ==========================================

import { 
  doc, 
  getDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { COLLECTIONS } from '../constants.js';

class UserService {
  
  // Récupérer le profil utilisateur
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { data: userSnap.data(), error: null };
      } else {
        return { data: null, error: 'Profil utilisateur introuvable' };
      }
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return { data: null, error: error.message };
    }
  }
  
  // Mettre à jour le profil utilisateur
  async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      console.log(`✅ Profil ${userId} mis à jour`);
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      return { error: error.message };
    }
  }
  
  // Écouter les changements du profil utilisateur
  onUserProfileChange(userId, callback) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('❌ Erreur snapshot profil:', error);
      callback(null, error);
    });
  }
  
  // Mettre à jour la dernière connexion
  async updateLastLogin(userId) {
    return await this.updateUserProfile(userId, {
      lastLoginAt: new Date()
    });
  }
}

export default new UserService();

// ==========================================
// 📁 react-app/src/core/services/taskService.js
// Service pour la gestion des tâches
// ==========================================

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase.js';

class TaskService {
  
  // Récupérer les tâches d'un utilisateur
  async getUserTasks(userId) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ ${tasks.length} tâches récupérées pour ${userId}`);
      return { data: tasks, error: null };
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      return { data: [], error: error.message };
    }
  }
  
  // Obtenir les statistiques des tâches
  async getTaskStats(userId) {
    const result = await this.getUserTasks(userId);
    if (result.error) return result;
    
    const tasks = result.data;
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      completionRate: 0
    };
    
    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.completed / stats.total) * 100);
    }
    
    return { data: stats, error: null };
  }
}

export default new TaskService();

// ==========================================
// 📁 react-app/src/core/services/gameService.js
// Service pour la gamification
// ==========================================

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import userService from './userService.js';
import { GAMIFICATION } from '../constants.js';

class GameService {
  
  // Ajouter de l'XP à un utilisateur
  async addXP(userId, xpAmount, reason = '') {
    try {
      console.log(`🎮 Ajout ${xpAmount} XP à ${userId} - ${reason}`);
      
      // Récupérer le profil utilisateur actuel
      const userResult = await userService.getUserProfile(userId);
      if (userResult.error) return userResult;
      
      const currentUser = userResult.data;
      const currentXP = currentUser.gamification?.xp || 0;
      const currentTotalXP = currentUser.gamification?.totalXp || 0;
      const currentLevel = currentUser.gamification?.level || 1;
      
      const newTotalXP = currentTotalXP + xpAmount;
      const newLevel = this.calculateLevel(newTotalXP);
      const levelUp = newLevel > currentLevel;
      
      // Mettre à jour les données de gamification
      const updates = {
        'gamification.xp': currentXP + xpAmount,
        'gamification.totalXp': newTotalXP,
        'gamification.level': newLevel
      };
      
      const updateResult = await userService.updateUserProfile(userId, updates);
      
      // Créer une activité
      if (!updateResult.error) {
        await this.createActivity(userId, 'xp_gained', {
          xpAmount,
          reason,
          levelUp,
          newLevel: levelUp ? newLevel : null
        });
      }
      
      return { 
        data: { xpGained: xpAmount, levelUp, newLevel }, 
        error: updateResult.error 
      };
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      return { data: null, error: error.message };
    }
  }
  
  // Calculer le niveau basé sur l'XP total
  calculateLevel(totalXP) {
    const levels = Object.values(GAMIFICATION.LEVELS);
    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalXP >= levels[i].min) {
        return i + 1;
      }
    }
    return 1;
  }
  
  // Débloquer un badge
  async unlockBadge(userId, badgeId, badgeName, category = 'general') {
    try {
      console.log(`🏆 Déblocage badge ${badgeName} pour ${userId}`);
      
      const userResult = await userService.getUserProfile(userId);
      if (userResult.error) return userResult;
      
      const currentUser = userResult.data;
      const badges = currentUser.gamification?.badges || [];
      
      // Vérifier si le badge n'est pas déjà débloqué
      if (badges.find(b => b.id === badgeId)) {
        return { data: { alreadyUnlocked: true }, error: null };
      }
      
      // Ajouter le nouveau badge
      const newBadge = {
        id: badgeId,
        name: badgeName,
        category,
        unlockedAt: new Date()
      };
      
      badges.push(newBadge);
      
      const updates = {
        'gamification.badges': badges
      };
      
      const updateResult = await userService.updateUserProfile(userId, updates);
      
      // Créer une activité
      if (!updateResult.error) {
        await this.createActivity(userId, 'badge_unlocked', {
          badge: newBadge
        });
      }
      
      return { data: { badge: newBadge }, error: updateResult.error };
    } catch (error) {
      console.error('❌ Erreur déblocage badge:', error);
      return { data: null, error: error.message };
    }
  }
  
  // Créer une activité
  async createActivity(userId, type, data = {}) {
    try {
      const activity = {
        userId,
        type,
        data,
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'activities'), activity);
      console.log(`✅ Activité ${type} créée pour ${userId}`);
      
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur création activité:', error);
      return { error: error.message };
    }
  }
  
  // Récupérer les activités d'un utilisateur
  async getUserActivities(userId, limitCount = 20) {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(activitiesQuery);
      const activities = [];
      
      snapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      
      return { data: activities, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération activités:', error);
      return { data: [], error: error.message };
    }
  }
  
  // Récupérer le leaderboard
  async getLeaderboard(limitCount = 10) {
    try {
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
          xp: userData.gamification?.totalXp || 0,
          level: userData.gamification?.level || 1,
          badges: (userData.gamification?.badges || []).length
        });
      });
      
      return { data: leaderboard, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération leaderboard:', error);
      return { data: [], error: error.message };
    }
  }
  
  // Récompenser une connexion quotidienne
  async rewardDailyLogin(userId) {
    const xpReward = GAMIFICATION.XP_REWARDS.DAILY_LOGIN;
    return await this.addXP(userId, xpReward, 'Connexion quotidienne');
  }
  
  // Récompenser la completion d'une tâche
  async rewardTaskCompletion(userId, taskData) {
    const xpReward = taskData.xpReward || GAMIFICATION.XP_REWARDS.TASK_COMPLETE;
    return await this.addXP(userId, xpReward, `Tâche complétée: ${taskData.title}`);
  }
}

export default new GameService();

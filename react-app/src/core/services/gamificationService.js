// ==========================================
// 📁 react-app/src/core/services/gamificationService.js
// Service de gamification mis à jour pour intégration badges
// ==========================================

import { collection, doc, updateDoc, setDoc, getDoc, query, where, getDocs, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎮 SERVICE DE GAMIFICATION SYNERGIA v3.5
 * 
 * Gère le système XP, niveaux, streaks et événements
 * Intégré avec le nouveau système de badges automatiques
 */
class GamificationService {
  
  // 🎯 CONFIGURATION DES NIVEAUX ET XP
  static XP_CONFIG = {
    TASK_COMPLETION: {
      low: 10,
      medium: 25,
      high: 50
    },
    PROJECT_COMPLETION: 100,
    STREAK_BONUS: 5,
    BADGE_BONUS_MULTIPLIER: 1.2
  };

  static LEVEL_THRESHOLDS = [
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 6000
  ];

  /**
   * 👤 INITIALISER UN UTILISATEUR DANS LE SYSTÈME
   */
  static async initializeUser(userId) {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        // Créer un nouveau profil utilisateur
        const newUserData = {
          uid: userId,
          xp: 0,
          level: 1,
          streak: 0,
          badges: [],
          lastActivity: new Date(),
          totalTasksCompleted: 0,
          totalProjectsCompleted: 0,
          createdAt: new Date()
        };

        const userDocRef = doc(collection(db, 'users'));
        await setDoc(userDocRef, newUserData);
        
        console.log('✅ Nouveau utilisateur initialisé:', userId);
        return newUserData;
      } else {
        const userData = userSnapshot.docs[0].data();
        console.log('👤 Utilisateur existant chargé:', userId);
        return userData;
      }

    } catch (error) {
      console.error('❌ Erreur initializeUser:', error);
      throw error;
    }
  }

  /**
   * ⭐ ATTRIBUTION D'XP POUR COMPLÉTION DE TÂCHE
   */
  static async awardTaskXP(userId, task) {
    try {
      console.log('⭐ Attribution XP pour tâche:', task.title);

      // Calculer XP selon priorité
      const priority = task.priority || 'medium';
      const baseXP = this.XP_CONFIG.TASK_COMPLETION[priority] || this.XP_CONFIG.TASK_COMPLETION.medium;
      
      // Bonus pour tâches rapides (moins de 2h)
      let speedBonus = 0;
      if (task.createdAt && task.completedAt) {
        const timeSpent = new Date(task.completedAt.toDate()) - new Date(task.createdAt.toDate());
        const hoursSpent = timeSpent / (1000 * 60 * 60);
        if (hoursSpent < 2) {
          speedBonus = Math.floor(baseXP * 0.2); // 20% bonus
        }
      }

      const totalXP = baseXP + speedBonus;
      
      // Mettre à jour l'utilisateur
      const updatedData = await this.updateUserXP(userId, totalXP);
      
      // 🎉 DÉCLENCHER ÉVÉNEMENT POUR LE SYSTÈME DE BADGES
      window.dispatchEvent(new CustomEvent('taskCompleted', {
        detail: {
          userId,
          task,
          xpGained: totalXP,
          speedBonus,
          timestamp: new Date()
        }
      }));

      console.log(`✅ XP attribué: +${totalXP} (base: ${baseXP}, bonus: ${speedBonus})`);
      return { xpGained: totalXP, newLevel: updatedData.level, speedBonus };

    } catch (error) {
      console.error('❌ Erreur awardTaskXP:', error);
      throw error;
    }
  }

  /**
   * 🏁 ATTRIBUTION D'XP POUR COMPLÉTION DE PROJET
   */
  static async awardProjectXP(userId, project) {
    try {
      console.log('🏁 Attribution XP pour projet:', project.name);

      const baseXP = this.XP_CONFIG.PROJECT_COMPLETION;
      
      // Bonus selon la complexité (nombre de tâches)
      const complexityBonus = Math.min(50, (project.taskCount || 0) * 5);
      
      // Bonus pour complétion dans les temps
      let timeBonus = 0;
      if (project.dueDate && project.completedAt) {
        const dueDate = new Date(project.dueDate.toDate());
        const completedDate = new Date(project.completedAt);
        if (completedDate <= dueDate) {
          timeBonus = 25; // Bonus ponctualité
        }
      }

      const totalXP = baseXP + complexityBonus + timeBonus;
      
      // Mettre à jour l'utilisateur
      const updatedData = await this.updateUserXP(userId, totalXP);
      
      // Incrémenter compteur projets
      await this.incrementProjectCount(userId);

      // 🎉 DÉCLENCHER ÉVÉNEMENT POUR LE SYSTÈME DE BADGES
      window.dispatchEvent(new CustomEvent('projectCompleted', {
        detail: {
          userId,
          project,
          xpGained: totalXP,
          complexityBonus,
          timeBonus,
          timestamp: new Date()
        }
      }));

      console.log(`✅ XP projet attribué: +${totalXP} (base: ${baseXP}, complexité: ${complexityBonus}, temps: ${timeBonus})`);
      return { xpGained: totalXP, newLevel: updatedData.level };

    } catch (error) {
      console.error('❌ Erreur awardProjectXP:', error);
      throw error;
    }
  }

  /**
   * 🎯 METTRE À JOUR L'XP D'UN UTILISATEUR
   */
  static async updateUserXP(userId, xpToAdd) {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('Utilisateur non trouvé');
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const currentXP = userData.xp || 0;
      const newXP = currentXP + xpToAdd;
      
      // Calculer nouveau niveau
      const oldLevel = userData.level || 1;
      const newLevel = this.calculateLevel(newXP);
      const leveledUp = newLevel > oldLevel;

      // Mettre à jour dans Firebase
      await updateDoc(doc(db, 'users', userDoc.id), {
        xp: newXP,
        level: newLevel,
        lastActivity: new Date(),
        totalTasksCompleted: increment(1)
      });

      // 🎉 DÉCLENCHER ÉVÉNEMENT LEVEL UP
      if (leveledUp) {
        window.dispatchEvent(new CustomEvent('levelUp', {
          detail: {
            userId,
            oldLevel,
            newLevel,
            currentXP: newXP,
            timestamp: new Date()
          }
        }));

        console.log(`🎊 LEVEL UP! ${oldLevel} → ${newLevel}`);
      }

      // 📊 DÉCLENCHER ÉVÉNEMENT XP UPDATED
      window.dispatchEvent(new CustomEvent('xpUpdated', {
        detail: {
          userId,
          xpGained: xpToAdd,
          totalXP: newXP,
          newLevel,
          leveledUp,
          timestamp: new Date()
        }
      }));

      return { xp: newXP, level: newLevel, leveledUp };

    } catch (error) {
      console.error('❌ Erreur updateUserXP:', error);
      throw error;
    }
  }

  /**
   * 📊 CALCULER LE NIVEAU BASÉ SUR L'XP
   */
  static calculateLevel(xp) {
    for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= this.LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * 🔥 GÉRER LE SYSTÈME DE STREAK
   */
  static async updateStreak(userId) {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) return;

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const lastActivity = userData.lastActivity;
      const currentStreak = userData.streak || 0;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActivityDate = lastActivity ? new Date(lastActivity.toDate()) : null;
      const lastActivityDay = lastActivityDate ? 
        new Date(lastActivityDate.getFullYear(), lastActivityDate.getMonth(), lastActivityDate.getDate()) : null;

      let newStreak = currentStreak;
      
      if (!lastActivityDay) {
        // Première activité
        newStreak = 1;
      } else {
        const daysDiff = Math.floor((today - lastActivityDay) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Même jour - pas de changement
          return currentStreak;
        } else if (daysDiff === 1) {
          // Jour consécutif - augmenter streak
          newStreak = currentStreak + 1;
        } else {
          // Trop de jours - reset streak
          newStreak = 1;
        }
      }

      // Mettre à jour le streak
      await updateDoc(doc(db, 'users', userDoc.id), {
        streak: newStreak,
        lastActivity: now,
        maxStreak: Math.max(userData.maxStreak || 0, newStreak)
      });

      // Bonus XP pour streak
      if (newStreak > currentStreak && newStreak > 1) {
        const streakBonus = this.XP_CONFIG.STREAK_BONUS * newStreak;
        await this.updateUserXP(userId, streakBonus);
        
        console.log(`🔥 Streak bonus: +${streakBonus} XP (streak: ${newStreak})`);
      }

      // 🎉 DÉCLENCHER ÉVÉNEMENT STREAK
      window.dispatchEvent(new CustomEvent('streakUpdated', {
        detail: {
          userId,
          oldStreak: currentStreak,
          newStreak,
          streakIncreased: newStreak > currentStreak,
          timestamp: new Date()
        }
      }));

      console.log(`🔥 Streak mis à jour: ${currentStreak} → ${newStreak}`);
      return newStreak;

    } catch (error) {
      console.error('❌ Erreur updateStreak:', error);
      throw error;
    }
  }

  /**
   * 📈 INCRÉMENTER LE COMPTEUR DE PROJETS
   */
  static async incrementProjectCount(userId) {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          totalProjectsCompleted: increment(1)
        });
      }

    } catch (error) {
      console.error('❌ Erreur incrementProjectCount:', error);
    }
  }

  /**
   * 🏆 ATTRIBUTION DE BADGE (intégration avec nouveau système)
   */
  static async awardBadge(userId, badgeId) {
    try {
      console.log('🏆 Attribution badge:', badgeId);

      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) return;

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const currentBadges = userData.badges || [];

      // Vérifier si le badge n'est pas déjà possédé
      if (currentBadges.includes(badgeId)) {
        console.log('⚠️ Badge déjà possédé:', badgeId);
        return;
      }

      // Ajouter le badge
      await updateDoc(doc(db, 'users', userDoc.id), {
        badges: arrayUnion(badgeId),
        lastBadgeUnlock: new Date()
      });

      // 🎉 DÉCLENCHER ÉVÉNEMENT BADGE
      window.dispatchEvent(new CustomEvent('badgeAwarded', {
        detail: {
          userId,
          badgeId,
          timestamp: new Date()
        }
      }));

      console.log(`✅ Badge attribué: ${badgeId}`);
      return true;

    } catch (error) {
      console.error('❌ Erreur awardBadge:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES DONNÉES UTILISATEUR
   */
  static async getUserData(userId) {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        return await this.initializeUser(userId);
      }

      const userData = userSnapshot.docs[0].data();
      return {
        ...userData,
        level: userData.level || 1,
        xp: userData.xp || 0,
        streak: userData.streak || 0,
        badges: userData.badges || [],
        totalTasksCompleted: userData.totalTasksCompleted || 0,
        totalProjectsCompleted: userData.totalProjectsCompleted || 0
      };

    } catch (error) {
      console.error('❌ Erreur getUserData:', error);
      throw error;
    }
  }

  /**
   * 🎯 OBTENIR XP REQUIS POUR NIVEAU SUIVANT
   */
  static getXPForNextLevel(currentLevel) {
    if (currentLevel >= this.LEVEL_THRESHOLDS.length) {
      return null; // Niveau maximum atteint
    }
    return this.LEVEL_THRESHOLDS[currentLevel];
  }

  /**
   * 📈 OBTENIR PROGRESSION VERS NIVEAU SUIVANT
   */
  static getLevelProgress(currentXP, currentLevel) {
    const currentLevelXP = this.LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextLevelXP = this.getXPForNextLevel(currentLevel);
    
    if (!nextLevelXP) {
      return { progress: 100, xpNeeded: 0 }; // Niveau max
    }

    const xpInCurrentLevel = currentXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    const progress = Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
    const xpNeeded = nextLevelXP - currentXP;

    return { 
      progress: Math.min(100, Math.max(0, progress)), 
      xpNeeded: Math.max(0, xpNeeded),
      xpInCurrentLevel,
      xpNeededForLevel
    };
  }

  /**
   * 🏆 OBTENIR LE LEADERBOARD
   */
  static async getLeaderboard(limit = 10) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        limitToFirst(limit)
      );
      const snapshot = await getDocs(usersQuery);
      
      return snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1
      }));

    } catch (error) {
      console.error('❌ Erreur getLeaderboard:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR STATISTIQUES GLOBALES
   */
  static async getGlobalStats() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());

      const totalUsers = users.length;
      const totalXP = users.reduce((sum, user) => sum + (user.xp || 0), 0);
      const totalBadges = users.reduce((sum, user) => sum + (user.badges || []).length, 0);
      const averageLevel = users.length > 0 ? 
        Math.round(users.reduce((sum, user) => sum + (user.level || 1), 0) / users.length) : 1;

      return {
        totalUsers,
        totalXP,
        totalBadges,
        averageLevel,
        averageXP: users.length > 0 ? Math.round(totalXP / users.length) : 0
      };

    } catch (error) {
      console.error('❌ Erreur getGlobalStats:', error);
      return null;
    }
  }

  /**
   * 🔧 RECALCULER TOUTES LES DONNÉES UTILISATEUR
   * Utile pour la maintenance et les corrections
   */
  static async recalculateUserData(userId) {
    try {
      console.log('🔧 Recalcul des données utilisateur:', userId);

      // Récupérer toutes les tâches complétées
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('status', '==', 'completed')
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const completedTasks = tasksSnapshot.docs.map(doc => doc.data());

      // Récupérer tous les projets complétés
      const projectsQuery = query(
        collection(db, 'projects'),
        where('ownerId', '==', userId),
        where('status', '==', 'completed')
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const completedProjects = projectsSnapshot.docs.map(doc => doc.data());

      // Recalculer XP total
      let totalXP = 0;
      
      // XP des tâches
      completedTasks.forEach(task => {
        const priority = task.priority || 'medium';
        totalXP += this.XP_CONFIG.TASK_COMPLETION[priority] || this.XP_CONFIG.TASK_COMPLETION.medium;
      });

      // XP des projets
      totalXP += completedProjects.length * this.XP_CONFIG.PROJECT_COMPLETION;

      // Recalculer niveau
      const newLevel = this.calculateLevel(totalXP);

      // Mettre à jour dans Firebase
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          xp: totalXP,
          level: newLevel,
          totalTasksCompleted: completedTasks.length,
          totalProjectsCompleted: completedProjects.length,
          lastRecalculation: new Date()
        });
      }

      console.log(`✅ Recalcul terminé - XP: ${totalXP}, Niveau: ${newLevel}`);
      return { totalXP, newLevel, tasksCount: completedTasks.length, projectsCount: completedProjects.length };

    } catch (error) {
      console.error('❌ Erreur recalculateUserData:', error);
      throw error;
    }
  }
}

// 🚀 EXPORT DU SERVICE
export const gamificationService = GamificationService;

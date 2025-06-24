// ==========================================
// 📁 react-app/src/core/services/gamificationService.js
// Service de gamification avec intégration système de badges
// ==========================================

import { 
  collection, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎮 SERVICE GAMIFICATION AVANCÉ
 * 
 * Gestion complète du système de gamification avec :
 * - Attribution XP contextuelle
 * - Système de niveaux progressifs
 * - Déclenchement automatique des badges
 * - Gestion des streaks et statistiques
 * - Leaderboard temps réel
 */
class GamificationService {
  static LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];

  /**
   * 📊 ATTRIBUTION XP POUR TÂCHE COMPLÉTÉE
   */
  static async awardTaskCompletionXP(userId, task) {
    try {
      console.log('🎮 Attribution XP pour tâche:', task.title);

      // Calcul XP basé sur difficulté et priorité
      let baseXP = 10;
      
      // Bonus difficulté
      const difficultyMultiplier = {
        'facile': 1,
        'moyen': 1.5,
        'difficile': 2
      };
      
      // Bonus priorité
      const priorityMultiplier = {
        'basse': 1,
        'moyenne': 1.2,
        'haute': 1.5,
        'urgente': 2
      };

      const finalXP = Math.round(
        baseXP * 
        (difficultyMultiplier[task.difficulty] || 1) * 
        (priorityMultiplier[task.priority] || 1)
      );

      // Mettre à jour les données utilisateur
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const newXP = (userData.xp || 0) + finalXP;
        const newLevel = this.calculateLevel(newXP);
        const oldLevel = this.calculateLevel(userData.xp || 0);

        // Mettre à jour les statistiques
        const updateData = {
          xp: newXP,
          level: newLevel,
          tasksCompleted: increment(1),
          lastActivity: new Date(),
          totalXpEarned: increment(finalXP)
        };

        // Gestion des streaks
        const today = new Date().toDateString();
        const lastActivityDate = userData.lastActivity?.toDate?.()?.toDateString();
        
        if (lastActivityDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          if (lastActivityDate === yesterday) {
            // Continuer la streak
            updateData.currentStreak = (userData.currentStreak || 0) + 1;
            updateData.maxStreak = Math.max(userData.maxStreak || 0, updateData.currentStreak);
          } else {
            // Nouvelle streak
            updateData.currentStreak = 1;
            if (!userData.maxStreak) updateData.maxStreak = 1;
          }

          // Déclencher événement streak
          window.dispatchEvent(new CustomEvent('streakUpdated', {
            detail: { 
              streak: updateData.currentStreak, 
              userId,
              isNewRecord: updateData.currentStreak > (userData.maxStreak || 0)
            }
          }));
        }

        await updateDoc(doc(db, 'users', userDoc.id), updateData);

        // Événements pour le système de badges
        window.dispatchEvent(new CustomEvent('taskCompleted', {
          detail: { 
            task, 
            userId, 
            xpAwarded: finalXP,
            newXP,
            taskCompletedToday: await this.getTasksCompletedToday(userId)
          }
        }));

        // Level up événement
        if (newLevel > oldLevel) {
          window.dispatchEvent(new CustomEvent('levelUp', {
            detail: { 
              oldLevel, 
              newLevel, 
              userId,
              totalXP: newXP
            }
          }));
        }

        console.log(`✅ XP attribué: +${finalXP} (Total: ${newXP}, Niveau: ${newLevel})`);
        return { xpAwarded: finalXP, newXP, newLevel, levelUp: newLevel > oldLevel };
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur awardTaskCompletionXP:', error);
      throw error;
    }
  }

  /**
   * 🏁 ATTRIBUTION XP POUR PROJET COMPLÉTÉ
   */
  static async awardProjectCompletionXP(userId, project) {
    try {
      console.log('🎮 Attribution XP pour projet:', project.name);

      // XP basé sur le nombre de tâches et la complexité du projet
      const baseXP = 50;
      const taskCountBonus = (project.taskCount || 0) * 5;
      const finalXP = baseXP + taskCountBonus;

      // Mettre à jour les données utilisateur
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const newXP = (userData.xp || 0) + finalXP;
        const newLevel = this.calculateLevel(newXP);
        const oldLevel = this.calculateLevel(userData.xp || 0);

        await updateDoc(doc(db, 'users', userDoc.id), {
          xp: newXP,
          level: newLevel,
          projectsCompleted: increment(1),
          totalXpEarned: increment(finalXP),
          lastActivity: new Date()
        });

        // Événements pour le système de badges
        window.dispatchEvent(new CustomEvent('projectCompleted', {
          detail: { 
            project, 
            userId, 
            xpAwarded: finalXP,
            newXP,
            projectsCompleted: (userData.projectsCompleted || 0) + 1
          }
        }));

        // Level up événement
        if (newLevel > oldLevel) {
          window.dispatchEvent(new CustomEvent('levelUp', {
            detail: { 
              oldLevel, 
              newLevel, 
              userId,
              totalXP: newXP
            }
          }));
        }

        console.log(`🏁 XP projet attribué: +${finalXP} (Total: ${newXP})`);
        return { xpAwarded: finalXP, newXP, newLevel, levelUp: newLevel > oldLevel };
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur awardProjectCompletionXP:', error);
      throw error;
    }
  }

  /**
   * 🏆 ATTRIBUTION XP POUR BADGE DÉBLOQUÉ
   */
  static async awardBadgeXP(userId, badge) {
    try {
      console.log('🏆 Attribution XP pour badge:', badge.name);

      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const newXP = (userData.xp || 0) + badge.xpReward;
        const newLevel = this.calculateLevel(newXP);
        const oldLevel = this.calculateLevel(userData.xp || 0);

        await updateDoc(doc(db, 'users', userDoc.id), {
          xp: newXP,
          level: newLevel,
          totalXpEarned: increment(badge.xpReward),
          badgesUnlocked: increment(1),
          lastBadgeUnlock: new Date()
        });

        // Level up événement si nécessaire
        if (newLevel > oldLevel) {
          window.dispatchEvent(new CustomEvent('levelUp', {
            detail: { 
              oldLevel, 
              newLevel, 
              userId,
              totalXP: newXP,
              fromBadge: true
            }
          }));
        }

        console.log(`🏆 XP badge attribué: +${badge.xpReward} (Total: ${newXP})`);
        return { xpAwarded: badge.xpReward, newXP, newLevel, levelUp: newLevel > oldLevel };
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur awardBadgeXP:', error);
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
   * 📈 CALCULER LA PROGRESSION VERS LE NIVEAU SUIVANT
   */
  static calculateLevelProgress(xp) {
    const currentLevel = this.calculateLevel(xp);
    const currentThreshold = this.LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextThreshold = this.LEVEL_THRESHOLDS[currentLevel] || this.LEVEL_THRESHOLDS[this.LEVEL_THRESHOLDS.length - 1];
    
    if (currentLevel >= this.LEVEL_THRESHOLDS.length) {
      return { current: 100, total: 100, percentage: 100 };
    }

    const progressInLevel = xp - currentThreshold;
    const xpNeededForNext = nextThreshold - currentThreshold;
    const percentage = Math.min(100, Math.round((progressInLevel / xpNeededForNext) * 100));

    return {
      current: progressInLevel,
      total: xpNeededForNext,
      percentage,
      nextLevel: currentLevel + 1,
      xpNeeded: nextThreshold - xp
    };
  }

  /**
   * 👤 OBTENIR LES DONNÉES DE GAMIFICATION D'UN UTILISATEUR
   */
  static async getUserGamificationData(userId) {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        return {
          xp: userData.xp || 0,
          level: userData.level || 1,
          currentStreak: userData.currentStreak || 0,
          maxStreak: userData.maxStreak || 0,
          tasksCompleted: userData.tasksCompleted || 0,
          projectsCompleted: userData.projectsCompleted || 0,
          badgesUnlocked: userData.badgesUnlocked || 0,
          totalXpEarned: userData.totalXpEarned || 0,
          badges: userData.badges || [],
          lastActivity: userData.lastActivity,
          lastBadgeUnlock: userData.lastBadgeUnlock
        };
      }

      return this.getDefaultGamificationData();
    } catch (error) {
      console.error('❌ Erreur getUserGamificationData:', error);
      return this.getDefaultGamificationData();
    }
  }

  /**
   * 📋 OBTENIR LE NOMBRE DE TÂCHES COMPLÉTÉES AUJOURD'HUI
   */
  static async getTasksCompletedToday(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId),
        where('status', '==', 'completed'),
        where('completedAt', '>=', today),
        where('completedAt', '<', tomorrow)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      return tasksSnapshot.size;
    } catch (error) {
      console.error('❌ Erreur getTasksCompletedToday:', error);
      return 0;
    }
  }

  /**
   * 🏆 OBTENIR LE LEADERBOARD
   */
  static async getLeaderboard(limitCount = 10) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        limit(limitCount)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      return usersSnapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: doc.id,
          rank: index + 1,
          displayName: data.displayName || data.email?.split('@')[0] || 'Utilisateur',
          email: data.email,
          photoURL: data.photoURL,
          xp: data.xp || 0,
          level: data.level || 1,
          tasksCompleted: data.tasksCompleted || 0,
          projectsCompleted: data.projectsCompleted || 0,
          badgesUnlocked: data.badgesUnlocked || 0,
          currentStreak: data.currentStreak || 0
        };
      });
    } catch (error) {
      console.error('❌ Erreur getLeaderboard:', error);
      return [];
    }
  }

  /**
   * 📊 DONNÉES DE GAMIFICATION PAR DÉFAUT
   */
  static getDefaultGamificationData() {
    return {
      xp: 0,
      level: 1,
      currentStreak: 0,
      maxStreak: 0,
      tasksCompleted: 0,
      projectsCompleted: 0,
      badgesUnlocked: 0,
      totalXpEarned: 0,
      badges: [],
      lastActivity: null,
      lastBadgeUnlock: null
    };
  }

  /**
   * 🎯 ATTRIBUTION BADGE MANUEL (pour tests)
   */
  static async awardBadge(userId, badgeId, badgeName = 'Badge de test', xpReward = 50) {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        
        // Vérifier si le badge n'est pas déjà débloqué
        if (userData.badges && userData.badges.includes(badgeId)) {
          console.log('Badge déjà débloqué:', badgeId);
          return false;
        }

        await updateDoc(doc(db, 'users', userDoc.id), {
          badges: arrayUnion(badgeId),
          badgesUnlocked: increment(1),
          lastBadgeUnlock: new Date()
        });

        // Déclencher l'événement badge débloqué
        window.dispatchEvent(new CustomEvent('badgeUnlocked', {
          detail: {
            badge: {
              id: badgeId,
              name: badgeName,
              xpReward
            },
            userId
          }
        }));

        // Attribuer l'XP du badge
        await this.awardBadgeXP(userId, { xpReward });

        console.log(`🏆 Badge attribué: ${badgeName} (+${xpReward} XP)`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur awardBadge:', error);
      throw error;
    }
  }
}

export const gamificationService = new GamificationService();
export default GamificationService;

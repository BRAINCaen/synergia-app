// ==========================================
// 📁 react-app/src/core/services/gamificationService.js
// Service de gamification corrigé avec updateDoc complet
// ==========================================

import { 
  doc, 
  updateDoc, 
  getDoc, 
  writeBatch, 
  increment, 
  arrayUnion,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Collections Firestore
const COLLECTIONS = {
  USERS: 'users',
  ACTIVITIES: 'activities',
  LEADERBOARD: 'leaderboard'
};

// Configuration XP simplifiée
const XP_CONFIG = {
  REWARDS: {
    DAILY_LOGIN: 10,
    FIRST_LOGIN: 50,
    TASK_COMPLETE_EASY: 20,
    TASK_COMPLETE_NORMAL: 40,
    TASK_COMPLETE_HARD: 60,
    TASK_COMPLETE_EXPERT: 100
  },
  
  LEVEL_SYSTEM: {
    BASE_XP: 100,
    MULTIPLIER: 1.5,
    MAX_LEVEL: 100
  }
};

class GamificationService {

  /**
   * 🎯 AJOUTER XP ET GÉRER PROGRESSION
   */
  async addXP(userId, xpGain, action = 'unknown', metadata = {}) {
    if (!userId || !xpGain || xpGain <= 0) {
      console.warn('⚠️ Paramètres XP invalides:', { userId, xpGain, action });
      return { success: false, error: 'Paramètres invalides' };
    }

    try {
      console.log(`🎯 Ajout XP: ${xpGain} pour ${action} (utilisateur: ${userId})`);
      
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('❌ Utilisateur introuvable:', userId);
        return { success: false, error: 'Utilisateur introuvable' };
      }
      
      const userData = userDoc.data();
      const currentGamification = userData.gamification || {};
      
      const currentXP = currentGamification.xp || 0;
      const currentLevel = currentGamification.level || 1;
      const totalXP = currentGamification.totalXp || 0;
      
      // Calculer nouveau XP et niveau
      const newXP = currentXP + xpGain;
      const newTotalXP = totalXP + xpGain;
      const { newLevel, leveledUp, xpForNextLevel, progressPercent } = this.calculateLevel(newXP, currentLevel);
      
      // Préparer les mises à jour
      const now = new Date();
      const updates = {
        'gamification.xp': newXP,
        'gamification.totalXp': newTotalXP,
        'gamification.level': newLevel,
        'gamification.lastActivityAt': now,
        'gamification.lastXpGainAt': now,
        'stats.lastActionAt': now,
        updatedAt: now
      };
      
      // Ajouter stats spécifiques selon l'action
      switch (action) {
        case 'task_complete':
          updates['stats.tasksCompleted'] = increment(1);
          break;
        case 'daily_login':
          updates['stats.loginCount'] = increment(1);
          updates['gamification.streakDays'] = increment(1);
          break;
      }
      
      // 🔧 CORRECTION: Appliquer les mises à jour Firebase
      await updateDoc(userRef, updates);
      
      // Créer l'historique d'activité
      await this.createActivityLog({
        userId,
        action,
        xpGain,
        metadata: {
          ...metadata,
          previousXP: currentXP,
          newXP,
          previousLevel: currentLevel,
          newLevel,
          leveledUp
        }
      });
      
      console.log(`✅ XP mis à jour: ${currentXP} → ${newXP} (niveau ${currentLevel} → ${newLevel})`);
      
      return {
        success: true,
        xpGain,
        previousXP: currentXP,
        newXP,
        previousLevel: currentLevel,
        newLevel,
        leveledUp,
        xpForNextLevel,
        progressPercent,
        message: this.getXPMessage(action, xpGain, leveledUp)
      };
      
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      return { 
        success: false, 
        error: error.message,
        xpGain: 0 
      };
    }
  }

  /**
   * 📊 CALCULER NIVEAU BASÉ SUR XP
   */
  calculateLevel(xp, currentLevel = 1) {
    let level = 1;
    let totalXpNeeded = 0;
    
    // Calculer le niveau basé sur le système progressif
    while (level < XP_CONFIG.LEVEL_SYSTEM.MAX_LEVEL) {
      const xpForThisLevel = Math.floor(
        XP_CONFIG.LEVEL_SYSTEM.BASE_XP * Math.pow(XP_CONFIG.LEVEL_SYSTEM.MULTIPLIER, level - 1)
      );
      
      if (totalXpNeeded + xpForThisLevel > xp) {
        break;
      }
      
      totalXpNeeded += xpForThisLevel;
      level++;
    }
    
    const leveledUp = level > currentLevel;
    
    // Calculer progression dans le niveau actuel
    const xpForNextLevel = level < XP_CONFIG.LEVEL_SYSTEM.MAX_LEVEL 
      ? Math.floor(XP_CONFIG.LEVEL_SYSTEM.BASE_XP * Math.pow(XP_CONFIG.LEVEL_SYSTEM.MULTIPLIER, level - 1))
      : 0;
    
    const xpInCurrentLevel = level < XP_CONFIG.LEVEL_SYSTEM.MAX_LEVEL 
      ? xp - totalXpNeeded 
      : xpForNextLevel > 0 
        ? xpForCurrentLevel 
        : 0;
    
    const progressPercent = xpForNextLevel > 0 ? Math.floor((xpInCurrentLevel / xpForNextLevel) * 100) : 100;
    
    return {
      newLevel: level,
      leveledUp,
      xpForNextLevel,
      xpInCurrentLevel,
      progressPercent
    };
  }

  /**
   * 📝 CRÉER LOG D'ACTIVITÉ
   */
  async createActivityLog(activityData) {
    try {
      const activityRef = collection(db, COLLECTIONS.ACTIVITIES);
      await addDoc(activityRef, {
        ...activityData,
        timestamp: new Date(),
        type: 'gamification'
      });
    } catch (error) {
      console.warn('⚠️ Erreur création log activité:', error);
      // Ne pas faire échouer le processus principal
    }
  }

  /**
   * 📊 OBTENIR PROGRESSION UTILISATEUR
   */
  async getUserProgression(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const data = userDoc.data();
      const gamification = data.gamification || {};
      const stats = data.stats || {};
      
      const currentXP = gamification.xp || 0;
      const currentLevel = gamification.level || 1;
      const totalXP = gamification.totalXp || 0;
      
      const { xpForNextLevel, xpInCurrentLevel, progressPercent } = this.calculateLevel(currentXP, currentLevel);
      
      return {
        xp: currentXP,
        level: currentLevel,
        totalXp: totalXP,
        xpInCurrentLevel,
        xpForNextLevel,
        progressPercent,
        badges: gamification.badges || [],
        tasksCompleted: stats.tasksCompleted || 0,
        loginCount: stats.loginCount || 0,
        streakDays: gamification.streakDays || 0,
        joinedAt: gamification.joinedAt,
        lastActivityAt: gamification.lastActivityAt
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération progression:', error);
      return null;
    }
  }

  /**
   * 🎯 ACTIONS XP PRÉDÉFINIES
   */
  async completeTask(userId, taskDifficulty = 'normal') {
    const xpRewards = {
      'easy': XP_CONFIG.REWARDS.TASK_COMPLETE_EASY,
      'normal': XP_CONFIG.REWARDS.TASK_COMPLETE_NORMAL,
      'hard': XP_CONFIG.REWARDS.TASK_COMPLETE_HARD,
      'expert': XP_CONFIG.REWARDS.TASK_COMPLETE_EXPERT
    };
    
    const xpGain = xpRewards[taskDifficulty] || XP_CONFIG.REWARDS.TASK_COMPLETE_NORMAL;
    return await this.addXP(userId, xpGain, 'task_complete', { difficulty: taskDifficulty });
  }

  async dailyLogin(userId) {
    return await this.addXP(userId, XP_CONFIG.REWARDS.DAILY_LOGIN, 'daily_login');
  }

  /**
   * 📝 MÉTHODES UTILITAIRES
   */
  
  // Message XP personnalisé
  getXPMessage(action, xpGain, leveledUp) {
    const actionMessages = {
      'task_complete': `Tâche terminée ! +${xpGain} XP`,
      'daily_login': `Connexion quotidienne ! +${xpGain} XP`
    };
    
    let message = actionMessages[action] || `Action récompensée ! +${xpGain} XP`;
    
    if (leveledUp) {
      message += ' 🎊 LEVEL UP !';
    }
    
    return message;
  }

  /**
   * 🔧 DIAGNOSTIC FIREBASE
   */
  async diagnoseUser(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      console.log('🔍 Diagnostic utilisateur:', {
        exists: userDoc.exists(),
        data: userDoc.exists() ? userDoc.data() : null,
        gamification: userDoc.exists() ? userDoc.data().gamification : null
      });
      
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      return null;
    }
  }
}

export default new GamificationService();
// À ajouter à la fin de votre gamificationService.js existant
export { XP_CONFIG, BADGES_CONFIG }

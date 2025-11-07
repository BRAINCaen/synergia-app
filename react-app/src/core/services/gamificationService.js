// ==========================================
// 📁 react-app/src/core/services/gamificationService.js
// Service Gamification COMPLET avec toutes les méthodes
// ==========================================

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { db } from '../firebase.js';

class GamificationService {
  constructor() {
    this.listeners = new Map();
    this.initialized = false;
  }

  /**
   * 🚀 INITIALISATION DES DONNÉES UTILISATEUR
   */
  async initializeUserData(userId) {
    try {
      console.log('🎮 Initialisation données gamification pour:', userId);
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      let userData;
      
      if (userSnap.exists()) {
        userData = userSnap.data();
        
        // Vérifier et initialiser la structure gamification si manquante
        if (!userData.gamification) {
          const defaultGamificationData = this.getDefaultGamificationData();
          
          await updateDoc(userRef, {
            gamification: defaultGamificationData,
            lastActivity: serverTimestamp()
          });
          
          userData.gamification = defaultGamificationData;
          console.log('🔧 Structure gamification initialisée');
        }
      } else {
        // Créer un nouvel utilisateur avec données par défaut
        userData = {
          uid: userId,
          gamification: this.getDefaultGamificationData(),
          createdAt: serverTimestamp(),
          lastActivity: serverTimestamp()
        };
        
        await setDoc(userRef, userData);
        console.log('✅ Nouvel utilisateur créé');
      }
      
      this.initialized = true;
      return userData.gamification || this.getDefaultGamificationData();
      
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      throw error;
    }
  }

  /**
   * 🎨 DONNÉES PAR DÉFAUT
   */
  getDefaultGamificationData() {
    return {
      totalXp: 0,
      weeklyXp: 0,
      monthlyXp: 0,
      level: 1,
      tasksCompleted: 0,
      tasksCreated: 0,
      projectsCompleted: 0,
      projectsCreated: 0,
      badges: [],
      achievements: [],
      loginStreak: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastLoginDate: new Date().toISOString().split('T')[0],
      totalLogins: 0,
      lastXpGain: 0,
      lastXpReason: '',
      xpHistory: [],
      levelHistory: []
    };
  }

  /**
   * 📊 CALCULER LE NIVEAU BASÉ SUR L'XP
   */
  calculateLevel(totalXp) {
    return Math.floor(totalXp / 100) + 1;
  }

  /**
   * 📈 XP REQUIS POUR UN NIVEAU
   */
  getXpForLevel(level) {
    return (level - 1) * 100;
  }

  /**
   * 🎯 AJOUTER DE L'XP
   */
  async addXP(userId, amount, reason = 'Action') {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await this.initializeUserData(userId);
        return await this.addXP(userId, amount, reason); // Retry après initialisation
      }
      
      const currentGameData = userSnap.data().gamification || {};
      const currentXp = currentGameData.totalXp || 0;
      const newTotalXp = currentXp + amount;

      const currentLevel = currentGameData.level || 1;
      const newLevel = this.calculateLevel(newTotalXp);
      const leveledUp = newLevel > currentLevel;
      
      // Mettre à jour les données
      await updateDoc(userRef, {
        'gamification.totalXp': newTotalXp,
        'gamification.level': newLevel,
        'gamification.lastXpGain': amount,
        'gamification.lastXpReason': reason,
        lastActivity: serverTimestamp()
      });
      
      console.log(`🎯 +${amount} XP pour ${reason} (Total: ${newTotalXp} XP, Niveau: ${newLevel})`);
      
      return {
        success: true,
        newXP: newTotalXp,
        newLevel,
        leveledUp,
        xpGained: amount
      };
      
    } catch (error) {
      console.error('❌ Erreur addXP:', error);
      throw error;
    }
  }

  /**
   * 🌅 CONNEXION QUOTIDIENNE - VERSION CORRIGÉE
   */
  async dailyLogin(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await this.initializeUserData(userId);
        return await this.dailyLogin(userId); // Retry après initialisation
      }
      
      const userData = userSnap.data();
      const gameData = userData.gamification || this.getDefaultGamificationData();
      
      // ✅ CORRECTION: Utiliser le format ISO YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = gameData.lastLoginDate;
      
      console.log('🔍 Vérification connexion quotidienne:', { today, lastLogin });
      
      // Vérifier si c'est une nouvelle journée
      if (lastLogin !== today) {
        // ✅ CORRECTION: Calculer hier en format ISO
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const wasYesterday = lastLogin === yesterdayStr;
        
        const newStreak = wasYesterday ? (gameData.currentStreak || 0) + 1 : 1;
        const maxStreak = Math.max(newStreak, gameData.maxStreak || 0);
        
        await updateDoc(userRef, {
          'gamification.currentStreak': newStreak,
          'gamification.loginStreak': newStreak,
          'gamification.maxStreak': maxStreak,
          'gamification.lastLoginDate': today,
          'gamification.totalLogins': increment(1),
          lastActivity: serverTimestamp()
        });
        
        // Bonus XP pour connexion quotidienne
        await this.addXP(userId, 10, 'Connexion quotidienne');
        
        console.log(`🌅 Connexion quotidienne: Streak ${newStreak} jours (était hier: ${wasYesterday})`);
        
        return {
          isNewDay: true,
          streak: newStreak,
          maxStreak,
          xpBonus: 10
        };
      }
      
      console.log('ℹ️ Déjà connecté aujourd\'hui');
      return { isNewDay: false, streak: gameData.currentStreak || 0 };
      
    } catch (error) {
      console.error('❌ Erreur dailyLogin:', error);
      throw error;
    }
  }

  /**
   * ✅ MARQUER UNE TÂCHE COMME TERMINÉE
   */
  async completeTask(userId, difficulty = 'normal', taskData = {}) {
    try {
      const xpValues = {
        easy: 5,
        normal: 10,
        hard: 20,
        critical: 30
      };
      
      const xpReward = xpValues[difficulty] || 10;
      
      // Ajouter l'XP
      const xpResult = await this.addXP(userId, xpReward, `Tâche complétée (${difficulty})`);
      
      // Incrémenter le compteur
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.tasksCompleted': increment(1),
        lastActivity: serverTimestamp()
      });
      
      console.log(`✅ Tâche complétée: +${xpReward} XP`);
      
      return {
        success: true,
        xpGained: xpReward,
        newXP: xpResult.newXP,
        newLevel: xpResult.newLevel,
        leveledUp: xpResult.leveledUp
      };
      
    } catch (error) {
      console.error('❌ Erreur completeTask:', error);
      throw error;
    }
  }

  /**
   * 🏆 DÉBLOQUER UN BADGE
   */
  async unlockBadge(userId, badgeId, badgeName) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur introuvable');
      }
      
      const currentBadges = userSnap.data().gamification?.badges || [];
      
      // Vérifier si le badge n'est pas déjà débloqué
      if (currentBadges.includes(badgeId)) {
        console.log(`ℹ️ Badge ${badgeId} déjà débloqué`);
        return { success: false, message: 'Badge déjà débloqué' };
      }
      
      await updateDoc(userRef, {
        'gamification.badges': arrayUnion(badgeId),
        lastActivity: serverTimestamp()
      });
      
      // Bonus XP pour badge
      await this.addXP(userId, 25, `Badge débloqué: ${badgeName}`);
      
      console.log(`🏆 Badge débloqué: ${badgeId}`);
      
      return {
        success: true,
        badgeId,
        xpBonus: 25
      };
      
    } catch (error) {
      console.error('❌ Erreur unlockBadge:', error);
      throw error;
    }
  }

  /**
   * 🎖️ VÉRIFIER ET DÉBLOQUER BADGES AUTOMATIQUEMENT
   */
  async checkAndUnlockBadges(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return [];
      
      const userData = userSnap.data();
      const gameData = userData.gamification || {};
      const currentBadges = gameData.badges || [];
      const newBadges = [];
      
      // Définition des badges et conditions
      const badgeConditions = [
        {
          id: 'first_task',
          name: 'Premier Pas',
          condition: () => gameData.tasksCompleted >= 1
        },
        {
          id: 'task_rookie',
          name: 'Novice',
          condition: () => gameData.tasksCompleted >= 5
        },
        {
          id: 'task_master',
          name: 'Maître',
          condition: () => gameData.tasksCompleted >= 25
        },
        {
          id: 'task_legend',
          name: 'Légende',
          condition: () => gameData.tasksCompleted >= 100
        },
        {
          id: 'week_warrior',
          name: 'Guerrier de la Semaine',
          condition: () => gameData.currentStreak >= 7
        },
        {
          id: 'month_champion',
          name: 'Champion du Mois',
          condition: () => gameData.currentStreak >= 30
        }
      ];
      
      // Vérifier chaque badge
      for (const badge of badgeConditions) {
        if (!currentBadges.includes(badge.id) && badge.condition()) {
          await this.unlockBadge(userId, badge.id, badge.name);
          newBadges.push(badge.id);
        }
      }
      
      return newBadges;
      
    } catch (error) {
      console.error('❌ Erreur checkAndUnlockBadges:', error);
      return [];
    }
  }

  /**
   * 📊 LEADERBOARD
   */
  async getLeaderboard(limitCount = 10) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('gamification.totalXp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(usersQuery);
      const leaderboard = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        leaderboard.push({
          uid: doc.id,
          displayName: data.displayName || data.email || 'Utilisateur',
          totalXp: data.gamification?.totalXp || 0,
          level: data.gamification?.level || 1,
          badges: (data.gamification?.badges || []).length,
          photoURL: data.photoURL
        });
      });
      
      return leaderboard;
      
    } catch (error) {
      console.error('❌ Erreur getLeaderboard:', error);
      return [];
    }
  }

  /**
   * 👂 S'ABONNER AUX DONNÉES UTILISATEUR
   */
  subscribeToUserData(userId, callback) {
    try {
      const userRef = doc(db, 'users', userId);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback(data.gamification || this.getDefaultGamificationData());
        }
      });
      
      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur subscribeToUserData:', error);
      throw error;
    }
  }

  /**
   * 🧹 SE DÉSABONNER DE TOUTES LES ÉCOUTES
   */
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe, key) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('🧹 Tous les listeners gamification nettoyés');
  }

  /**
   * 📈 OBTENIR DONNÉES UTILISATEUR
   */
  async getUserData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await this.initializeUserData(userId);
        return await this.getUserData(userId); // Retry
      }
      
      return userSnap.data().gamification || this.getDefaultGamificationData();
      
    } catch (error) {
      console.error('❌ Erreur getUserData:', error);
      return this.getDefaultGamificationData();
    }
  }

  /**
   * 🔄 RÉINITIALISER DONNÉES UTILISATEUR (ADMIN)
   */
  async resetUserData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        gamification: this.getDefaultGamificationData(),
        lastActivity: serverTimestamp()
      });
      
      console.log('🔄 Données gamification réinitialisées');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur resetUserData:', error);
      throw error;
    }
  }

  /**
   * 📊 DONNÉES PAR DÉFAUT UTILISATEUR
   */
  getDefaultUserData() {
    return this.getDefaultGamificationData();
  }
}

// Export singleton
export const gamificationService = new GamificationService();
export default gamificationService;

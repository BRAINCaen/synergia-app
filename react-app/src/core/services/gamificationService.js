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
        console.log('👤 Nouvel utilisateur créé avec gamification');
      }
      
      this.initialized = true;
      return userData.gamification;
      
    } catch (error) {
      console.error('❌ Erreur initializeUserData:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER LE LEADERBOARD
   */
  async getLeaderboard(limitCount = 10, orderField = 'gamification.totalXp') {
    try {
      console.log('📊 Chargement leaderboard Firebase...');
      
      const usersQuery = query(
        collection(db, 'users'),
        where('gamification.totalXp', '>', 0), // Seulement les utilisateurs avec XP
        orderBy(orderField, 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(usersQuery);
      const leaderboard = [];
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        const gamificationData = data.gamification || {};
        
        leaderboard.push({
          id: doc.id,
          uid: data.uid || doc.id,
          rank: index + 1,
          displayName: data.displayName || data.email?.split('@')[0] || 'Utilisateur',
          email: data.email || '',
          photoURL: data.photoURL || null,
          level: gamificationData.level || 1,
          totalXp: gamificationData.totalXp || 0,
          tasksCompleted: gamificationData.tasksCompleted || 0,
          projectsCompleted: gamificationData.projectsCompleted || 0,
          badgesUnlocked: gamificationData.badgesUnlocked || 0,
          currentStreak: gamificationData.currentStreak || 0,
          badges: gamificationData.badges || [],
          lastActivity: data.lastActivity
        });
      });
      
      console.log('✅ Leaderboard chargé:', leaderboard.length, 'utilisateurs');
      return leaderboard;
      
    } catch (error) {
      console.error('❌ Erreur getLeaderboard:', error);
      return [];
    }
  }

  /**
   * 👥 S'ABONNER AUX DONNÉES UTILISATEUR EN TEMPS RÉEL
   */
  subscribeToUserData(userId, callback) {
    try {
      const userRef = doc(db, 'users', userId);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const gamificationData = data.gamification || this.getDefaultGamificationData();
          callback(gamificationData);
        } else {
          callback(this.getDefaultGamificationData());
        }
      });
      
      // Stocker la fonction de désabonnement
      this.listeners.set(userId, unsubscribe);
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur subscribeToUserData:', error);
      return () => {}; // Fonction vide comme fallback
    }
  }

  /**
   * 🎯 AJOUTER DE L'XP À UN UTILISATEUR
   */
  async addXP(userId, amount, reason = 'Activité') {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await this.initializeUserData(userId);
        return await this.addXP(userId, amount, reason); // Retry après initialisation
      }
      
      const userData = userSnap.data();
      const currentGameData = userData.gamification || this.getDefaultGamificationData();
      
      const newTotalXp = (currentGameData.totalXp || 0) + amount;
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
   * 🌅 CONNEXION QUOTIDIENNE
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
      
      const today = new Date().toDateString();
      const lastLogin = gameData.lastLoginDate;
      
      // Vérifier si c'est une nouvelle journée
      if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = lastLogin === yesterday.toDateString();
        
        const newStreak = wasYesterday ? (gameData.currentStreak || 0) + 1 : 1;
        const maxStreak = Math.max(newStreak, gameData.maxStreak || 0);
        
        await updateDoc(userRef, {
          'gamification.currentStreak': newStreak,
          'gamification.maxStreak': maxStreak,
          'gamification.lastLoginDate': today,
          'gamification.totalLogins': increment(1),
          lastActivity: serverTimestamp()
        });
        
        // Bonus XP pour connexion quotidienne
        await this.addXP(userId, 10, 'Connexion quotidienne');
        
        console.log(`🌅 Connexion quotidienne: Streak ${newStreak} jours`);
        
        return {
          isNewDay: true,
          streak: newStreak,
          maxStreak,
          xpBonus: 10
        };
      }
      
      return { isNewDay: false };
      
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
      const xpResult = await this.addXP(userId, xpReward, `Tâche ${difficulty} terminée`);
      
      // Incrémenter le compteur de tâches
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.tasksCompleted': increment(1),
        'gamification.lastTaskCompleted': serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      
      console.log(`✅ Tâche ${difficulty} terminée: +${xpReward} XP`);
      
      return {
        ...xpResult,
        xpReward,
        difficulty
      };
      
    } catch (error) {
      console.error('❌ Erreur completeTask:', error);
      throw error;
    }
  }

  /**
   * 📊 CALCULER LE NIVEAU BASÉ SUR L'XP
   */
  calculateLevel(totalXp) {
    if (totalXp < 100) return 1;
    if (totalXp < 250) return 2;
    if (totalXp < 500) return 3;
    if (totalXp < 1000) return 4;
    if (totalXp < 2000) return 5;
    if (totalXp < 4000) return 6;
    if (totalXp < 8000) return 7;
    if (totalXp < 15000) return 8;
    if (totalXp < 25000) return 9;
    return 10; // Niveau maximum
  }

  /**
   * 🎯 OBTENIR L'XP REQUIS POUR UN NIVEAU
   */
  getXpForLevel(level) {
    const xpThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 25000, 50000];
    return xpThresholds[level] || xpThresholds[xpThresholds.length - 1];
  }

  /**
   * 🏆 VÉRIFIER ET DÉBLOQUER DES BADGES
   */
  async checkAndUnlockBadges(userId) {
    try {
      // Cette méthode sera implémentée avec le système de badges avancés
      // Pour l'instant, retourner un tableau vide
      return [];
    } catch (error) {
      console.error('❌ Erreur checkAndUnlockBadges:', error);
      return [];
    }
  }

  /**
   * 📊 DONNÉES DE GAMIFICATION PAR DÉFAUT
   */
  getDefaultGamificationData() {
    return {
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      maxStreak: 0,
      tasksCompleted: 0,
      projectsCompleted: 0,
      badgesUnlocked: 0,
      badges: [],
      totalLogins: 0,
      lastLoginDate: null,
      lastActivity: null,
      lastXpGain: 0,
      lastXpReason: null,
      lastTaskCompleted: null,
      lastBadgeUnlock: null
    };
  }

  /**
   * 🧹 NETTOYER LES ABONNEMENTS
   */
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }

  /**
   * 📊 OBTENIR LES DONNÉES UTILISATEUR PAR DÉFAUT (COMPATIBLE)
   */
  getDefaultUserData() {
    return this.getDefaultGamificationData();
  }
}

// Export singleton
export const gamificationService = new GamificationService();
export default gamificationService;

// react-app/src/core/services/gamificationService.js

import { 
  collection, 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  arrayUnion, 
  increment,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎮 SERVICE DE GAMIFICATION SYNERGIA v3.5
 * 
 * Gère le système XP, niveaux, badges et récompenses
 * Compatible avec la structure Firebase existante
 */
class GamificationService {
  
  constructor() {
    this.listeners = new Map();
  }

  // 🎯 CONFIGURATION DES NIVEAUX ET XP
  static XP_CONFIG = {
    TASK_COMPLETION: {
      low: 10,
      medium: 25,
      high: 50
    },
    PROJECT_CREATION: 25,
    PROJECT_COMPLETION: 100,
    DAILY_LOGIN: 5,
    STREAK_BONUS: 5,
    LEVEL_MULTIPLIER: 1.2
  };

  static LEVEL_THRESHOLDS = [
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 6000
  ];

  // 📊 Calculer le niveau basé sur l'XP total
  calculateLevel(totalXP) {
    if (totalXP < 0) return 1;
    
    for (let i = GamificationService.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXP >= GamificationService.LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  // 📊 Calculer la progression vers le niveau suivant
  calculateLevelProgress(totalXP, currentLevel = null) {
    const level = currentLevel || this.calculateLevel(totalXP);
    const currentLevelXP = this.getXpForLevel(level);
    const nextLevelXP = this.getXpForLevel(level + 1);
    const progressXP = totalXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    const percentage = neededXP > 0 ? Math.round((progressXP / neededXP) * 100) : 0;

    return {
      current: progressXP,
      needed: neededXP,
      percentage: Math.max(0, Math.min(100, percentage)),
      remaining: Math.max(0, nextLevelXP - totalXP),
      currentLevelXP,
      nextLevelXP
    };
  }

  // 🎯 Calculer l'XP nécessaire pour un niveau donné
  getXpForLevel(level) {
    if (level <= 1) return 0;
    if (level > GamificationService.LEVEL_THRESHOLDS.length) {
      // Pour les niveaux très élevés, utiliser une formule
      const baseXP = GamificationService.LEVEL_THRESHOLDS[GamificationService.LEVEL_THRESHOLDS.length - 1];
      const extraLevels = level - GamificationService.LEVEL_THRESHOLDS.length;
      return baseXP + (extraLevels * 1000);
    }
    return GamificationService.LEVEL_THRESHOLDS[level - 1];
  }

  // 👤 Initialiser les données d'un utilisateur
  async initializeUserData(userId) {
    try {
      console.log('🎮 Initialisation données gamification pour:', userId);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Créer un nouveau document utilisateur avec données gamification
        const initialData = {
          uid: userId,
          totalXp: 0,
          level: 1,
          streak: 0,
          badges: [],
          tasksCompleted: 0,
          projectsCompleted: 0,
          loginStreak: 0,
          lastActivity: serverTimestamp(),
          lastLoginDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userRef, initialData);
        console.log('✅ Nouveau utilisateur créé avec données gamification');
        return initialData;
      } else {
        // Vérifier et ajouter les champs manquants
        const userData = userDoc.data();
        const updates = {};
        
        if (userData.totalXp === undefined) updates.totalXp = 0;
        if (userData.level === undefined) updates.level = 1;
        if (userData.streak === undefined) updates.streak = 0;
        if (userData.badges === undefined) updates.badges = [];
        if (userData.tasksCompleted === undefined) updates.tasksCompleted = 0;
        if (userData.projectsCompleted === undefined) updates.projectsCompleted = 0;
        if (userData.loginStreak === undefined) updates.loginStreak = 0;
        
        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(userRef, updates);
          console.log('✅ Données gamification mises à jour');
        }
        
        return { ...userData, ...updates };
      }
    } catch (error) {
      console.error('❌ Erreur initialisation utilisateur:', error);
      throw error;
    }
  }

  // ⭐ Ajouter de l'XP à un utilisateur
  async addXP(userId, xpAmount, reason = 'Activité') {
    try {
      console.log(`🎯 Ajout ${xpAmount} XP pour ${userId}: ${reason}`);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await this.initializeUserData(userId);
        return this.addXP(userId, xpAmount, reason);
      }
      
      const userData = userDoc.data();
      const currentXP = userData.totalXp || 0;
      const currentLevel = userData.level || 1;
      
      const newTotalXP = currentXP + xpAmount;
      const newLevel = this.calculateLevel(newTotalXP);
      const leveledUp = newLevel > currentLevel;
      
      const updates = {
        totalXp: newTotalXP,
        level: newLevel,
        lastActivity: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updates);
      
      // Déclencher l'événement pour les badges
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('xpUpdated', {
          detail: { userId, xpGained: xpAmount, totalXP: newTotalXP, leveledUp, newLevel, reason }
        }));
      }
      
      console.log('✅ XP ajoutés avec succès');
      
      return {
        success: true,
        xpGained: xpAmount,
        totalXP: newTotalXP,
        leveledUp,
        newLevel,
        reason
      };
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      throw error;
    }
  }

  // ✅ Compléter une tâche
  async completeTask(userId, difficulty = 'medium') {
    try {
      const xpGained = GamificationService.XP_CONFIG.TASK_COMPLETION[difficulty] || 25;
      
      // Mettre à jour le compteur de tâches
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        tasksCompleted: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Ajouter l'XP
      const result = await this.addXP(userId, xpGained, `Tâche complétée (${difficulty})`);
      
      // Déclencher l'événement pour les badges
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('taskCompleted', {
          detail: { userId, difficulty, xpGained }
        }));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      throw error;
    }
  }

  // 📁 Créer un projet
  async createProject(userId) {
    try {
      const xpGained = GamificationService.XP_CONFIG.PROJECT_CREATION;
      
      const result = await this.addXP(userId, xpGained, 'Projet créé');
      
      // Déclencher l'événement pour les badges
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('projectCreated', {
          detail: { userId, xpGained }
        }));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      throw error;
    }
  }

  // ✅ Compléter un projet
  async completeProject(userId) {
    try {
      const xpGained = GamificationService.XP_CONFIG.PROJECT_COMPLETION;
      
      // Mettre à jour le compteur de projets
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        projectsCompleted: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Ajouter l'XP
      const result = await this.addXP(userId, xpGained, 'Projet complété');
      
      // Déclencher l'événement pour les badges
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('projectCompleted', {
          detail: { userId, xpGained }
        }));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur completion projet:', error);
      throw error;
    }
  }

  // 🔥 Connexion quotidienne
  async dailyLogin(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await this.initializeUserData(userId);
        return this.dailyLogin(userId);
      }
      
      const userData = userDoc.data();
      const now = new Date();
      const today = now.toDateString();
      
      // Vérifier si l'utilisateur s'est déjà connecté aujourd'hui
      const lastLoginDate = userData.lastLoginDate?.toDate?.() || new Date(0);
      const lastLoginDateString = lastLoginDate.toDateString();
      
      if (lastLoginDateString === today) {
        console.log('ℹ️ Connexion quotidienne déjà enregistrée');
        return { success: true, alreadyLoggedToday: true };
      }
      
      // Calculer le nouveau streak
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      let newStreak = 1;
      if (lastLoginDateString === yesterdayString) {
        newStreak = (userData.loginStreak || 0) + 1;
      }
      
      // XP de base + bonus streak
      const baseXP = GamificationService.XP_CONFIG.DAILY_LOGIN;
      const streakBonus = Math.min(newStreak - 1, 10) * GamificationService.XP_CONFIG.STREAK_BONUS;
      const totalXP = baseXP + streakBonus;
      
      // Mettre à jour les données
      await updateDoc(userRef, {
        loginStreak: newStreak,
        lastLoginDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Ajouter l'XP
      const result = await this.addXP(userId, totalXP, `Connexion quotidienne (série: ${newStreak})`);
      
      // Déclencher l'événement pour les badges
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('streakUpdated', {
          detail: { userId, streak: newStreak, xpGained: totalXP }
        }));
      }
      
      return {
        ...result,
        streak: newStreak,
        streakBonus
      };
    } catch (error) {
      console.error('❌ Erreur connexion quotidienne:', error);
      throw error;
    }
  }

  // 🏆 Attribuer un badge
  async awardBadge(userId, badgeId) {
    try {
      console.log(`🏆 Attribution badge ${badgeId} à ${userId}`);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const currentBadges = userData.badges || [];
      
      if (currentBadges.includes(badgeId)) {
        console.log('ℹ️ Badge déjà possédé');
        return { success: false, message: 'Badge déjà possédé' };
      }
      
      await updateDoc(userRef, {
        badges: arrayUnion(badgeId),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Badge attribué avec succès');
      
      return {
        success: true,
        badgeId,
        message: 'Badge obtenu !'
      };
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      throw error;
    }
  }

  // 📊 Récupérer les données d'un utilisateur
  async getUserData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return await this.initializeUserData(userId);
      }
      
      const userData = userDoc.data();
      
      // Calculer les données dérivées
      const currentLevel = userData.level || 1;
      const currentXP = userData.totalXp || 0;
      const currentLevelXP = this.getXpForLevel(currentLevel);
      const nextLevelXP = this.getXpForLevel(currentLevel + 1);
      const progressXP = currentXP - currentLevelXP;
      const neededXP = nextLevelXP - currentLevelXP;
      const progressPercentage = neededXP > 0 ? Math.round((progressXP / neededXP) * 100) : 0;
      
      return {
        ...userData,
        currentLevelXP,
        nextLevelXP,
        progressXP,
        neededXP,
        progressPercentage
      };
    } catch (error) {
      console.error('❌ Erreur récupération données utilisateur:', error);
      throw error;
    }
  }

  // 📈 S'abonner aux changements de données utilisateur
  subscribeToUserData(userId, callback) {
    try {
      const userRef = doc(db, 'users', userId);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          
          // Calculer les données dérivées
          const currentLevel = userData.level || 1;
          const currentXP = userData.totalXp || 0;
          const currentLevelXP = this.getXpForLevel(currentLevel);
          const nextLevelXP = this.getXpForLevel(currentLevel + 1);
          const progressXP = currentXP - currentLevelXP;
          const neededXP = nextLevelXP - currentLevelXP;
          const progressPercentage = neededXP > 0 ? Math.round((progressXP / neededXP) * 100) : 0;
          
          const enrichedData = {
            ...userData,
            currentLevelXP,
            nextLevelXP,
            progressXP,
            neededXP,
            progressPercentage
          };
          
          callback(enrichedData);
        }
      }, (error) => {
        console.error('❌ Erreur écoute données utilisateur:', error);
      });
      
      // Stocker l'unsubscribe pour nettoyage
      this.listeners.set(userId, unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur abonnement données utilisateur:', error);
      throw error;
    }
  }

  // 🏅 Récupérer le leaderboard
  async getLeaderboard(limitCount = 10) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('totalXp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(usersQuery);
      const leaderboard = [];
      
      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        leaderboard.push({
          rank: index + 1,
          userId: doc.id,
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
          email: userData.email,
          totalXp: userData.totalXp || 0,
          level: userData.level || 1,
          badges: userData.badges || [],
          tasksCompleted: userData.tasksCompleted || 0,
          projectsCompleted: userData.projectsCompleted || 0,
          loginStreak: userData.loginStreak || 0
        });
      });
      
      return leaderboard;
    } catch (error) {
      console.error('❌ Erreur récupération leaderboard:', error);
      throw error;
    }
  }

  // 🏆 Récupérer tous les badges disponibles
  getAllBadges() {
    // Badges de base du système
    const systemBadges = {
      first_login: {
        id: 'first_login',
        name: 'Premier Pas',
        description: 'Première connexion à Synergia',
        icon: '🚀',
        color: '#3B82F6',
        rarity: 'common'
      },
      task_master: {
        id: 'task_master',
        name: 'Maître des Tâches',
        description: 'Compléter 10 tâches',
        icon: '⚡',
        color: '#10B981',
        rarity: 'uncommon'
      },
      level_5: {
        id: 'level_5',
        name: 'Niveau 5',
        description: 'Atteindre le niveau 5',
        icon: '⭐',
        color: '#F59E0B',
        rarity: 'rare'
      },
      perfectionist: {
        id: 'perfectionist',
        name: 'Perfectionniste',
        description: 'Compléter 50 tâches',
        icon: '💎',
        color: '#8B5CF6',
        rarity: 'epic'
      },
      legend: {
        id: 'legend',
        name: 'Légende',
        description: 'Atteindre le niveau 10',
        icon: '👑',
        color: '#EF4444',
        rarity: 'legendary'
      }
    };

    return systemBadges;
  }

  // 🧹 Nettoyer les listeners
  unsubscribe(userId) {
    const unsubscribe = this.listeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(userId);
    }
  }

  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }
}

// Export d'une instance unique
export const gamificationService = new GamificationService();
export default gamificationService;

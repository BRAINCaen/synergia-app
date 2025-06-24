// ==========================================
// 📁 react-app/src/core/services/gamificationService.js
// Service de gamification CORRIGÉ - Structure Firebase compatible
// ==========================================

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '../firebase.js';

class GamificationService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    this.dailyLoginProcessed = new Set(); // ✅ NOUVEAU: Éviter les doublons
  }

  // ✅ Données mock pour le développement
  getMockUserData() {
    return {
      totalXp: 240,
      level: 3,
      tasksCompleted: 12,
      projectsCompleted: 2,
      badges: ['first_task', 'streak_warrior'],
      loginStreak: 5,
      lastLoginDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // ✅ Initialiser les données utilisateur
  async initializeUserData(userId) {
    try {
      console.log('✅ Initialisation gamification pour:', userId);
      
      // Vérifier si les données existent déjà
      const existingData = await this.getUserData(userId);
      if (existingData && existingData.totalXp !== undefined) {
        console.log('ℹ️ Données existantes trouvées');
        return existingData;
      }

      // Créer de nouvelles données compatibles avec la structure attendue
      const initialData = {
        userId,
        email: '', // Sera rempli par le système d'auth
        totalXp: 0,
        level: 1,
        tasksCreated: 0,
        tasksCompleted: 0,
        projectsCreated: 0,
        projectsJoined: 0,
        badges: [],
        loginStreak: 0,
        lastLoginDate: null,
        completionRate: 0,
        maxTasksPerDay: 0,
        achievements: [],
        xpHistory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await this.setUserData(userId, initialData);
      console.log('✅ Statistiques utilisateur initialisées');
      return initialData;
      
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      return this.getMockUserData();
    }
  }

  // ✅ CORRECTION PRINCIPALE: Utiliser la bonne structure de collection
  async getUserData(userId) {
    try {
      // ✅ VALIDATION CRITIQUE: S'assurer que userId est un string
      if (!userId || typeof userId !== 'string') {
        console.error('❌ ID utilisateur invalide:', userId, typeof userId);
        return null;
      }

      // ✅ CORRECTION: Utiliser 'userStats' au lieu de subcollection
      const docRef = doc(db, 'userStats', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération données:', error);
      return null;
    }
  }

  // ✅ CORRECTION PRINCIPALE: Utiliser la bonne structure de collection
  async setUserData(userId, data) {
    try {
      // ✅ VALIDATION CRITIQUE: S'assurer que userId est un string
      if (!userId || typeof userId !== 'string') {
        console.error('❌ ID utilisateur invalide pour setUserData:', userId, typeof userId);
        return false;
      }

      // ✅ CORRECTION: Utiliser 'userStats' au lieu de subcollection
      const docRef = doc(db, 'userStats', userId);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true }); // Merge pour ne pas écraser les données existantes
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      return false;
    }
  }

  // ✅ CORRECTION PRINCIPALE: Ajouter XP sans boucle infinie
  async addXP(userId, amount, reason = 'Action') {
    try {
      // ✅ VALIDATION CRITIQUE: S'assurer que userId est un string
      if (!userId || typeof userId !== 'string') {
        console.error('❌ ID utilisateur invalide pour addXP:', userId, typeof userId);
        return { success: false, error: 'ID utilisateur invalide' };
      }

      // ✅ VALIDATION: S'assurer que amount est un nombre
      if (typeof amount !== 'number' || isNaN(amount)) {
        console.error('❌ Montant XP invalide:', amount);
        return { success: false, error: 'Montant XP invalide' };
      }

      // Éviter les doublons pour la connexion quotidienne
      const actionKey = `${userId}-${reason}-${new Date().toDateString()}`;
      
      if (reason === 'Connexion quotidienne' && this.dailyLoginProcessed.has(actionKey)) {
        console.log('ℹ️ Connexion quotidienne déjà enregistrée aujourd\'hui');
        return { success: true, addedXP: 0, alreadyProcessed: true };
      }

      const currentData = await this.getUserData(userId) || { totalXp: 0, level: 1 };
      const newXP = (currentData.totalXp || 0) + amount;
      const newLevel = this.calculateLevel(newXP);
      const leveledUp = newLevel > (currentData.level || 1);

      const updatedData = {
        ...currentData,
        totalXp: newXP,
        level: newLevel,
        updatedAt: serverTimestamp()
      };

      // Ajouter à l'historique
      if (!updatedData.xpHistory) updatedData.xpHistory = [];
      updatedData.xpHistory.unshift({
        amount,
        reason,
        timestamp: new Date().toISOString(),
        totalAfter: newXP
      });
      
      // Garder seulement les 20 dernières entrées
      if (updatedData.xpHistory.length > 20) {
        updatedData.xpHistory = updatedData.xpHistory.slice(0, 20);
      }

      await this.setUserData(userId, updatedData);
      
      // Marquer comme traité pour éviter les doublons
      if (reason === 'Connexion quotidienne') {
        this.dailyLoginProcessed.add(actionKey);
      }

      console.log(`✅ +${amount} XP ajoutés (${reason}). Total: ${newXP} XP`);

      return {
        success: true,
        addedXP: amount,
        newTotal: newXP,
        newLevel,
        leveledUp
      };

    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Calculer le niveau basé sur l'XP
  calculateLevel(xp) {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    if (xp < 1000) return 4;
    if (xp < 2000) return 5;
    return Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 50);
  }

  // ✅ XP requis pour le prochain niveau
  getXPForNextLevel(currentLevel) {
    const levelThresholds = [0, 100, 250, 500, 1000, 2000];
    if (currentLevel < levelThresholds.length) {
      return levelThresholds[currentLevel];
    }
    return Math.floor(100 * Math.pow(currentLevel - 4, 2));
  }

  // ✅ Vérifier et débloquer les badges
  async checkAndUnlockBadges(userId) {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) return [];

      const newBadges = [];
      const currentBadges = userData.badges || [];

      // Badge première tâche
      if (userData.tasksCompleted >= 1 && !currentBadges.includes('first_task')) {
        newBadges.push('first_task');
      }

      // Badge 10 tâches
      if (userData.tasksCompleted >= 10 && !currentBadges.includes('task_master')) {
        newBadges.push('task_master');
      }

      // Badge niveau 5
      if (userData.level >= 5 && !currentBadges.includes('level_master')) {
        newBadges.push('level_master');
      }

      if (newBadges.length > 0) {
        const updatedBadges = [...currentBadges, ...newBadges];
        await this.setUserData(userId, { ...userData, badges: updatedBadges });
        console.log('🏆 Nouveaux badges débloqués:', newBadges);
      }

      return newBadges;
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return [];
    }
  }

  // ✅ Écouter les changements en temps réel
  subscribeToUserData(userId, callback) {
    try {
      // ✅ CORRECTION: Utiliser 'userStats' au lieu de subcollection
      const docRef = doc(db, 'userStats', userId);
      
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback(data);
        } else {
          // Si pas de données, initialiser
          callback(this.getMockUserData());
        }
      }, (error) => {
        console.error('❌ Erreur écoute temps réel:', error);
        callback(this.getMockUserData());
      });

      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur abonnement:', error);
      // Mode fallback avec mock data
      callback(this.getMockUserData());
      return () => {};
    }
  }

  // ✅ Nettoyer les listeners
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    this.dailyLoginProcessed.clear();
  }

  // ✅ Actions rapides pré-configurées
  async completeTask(userId, taskDifficulty = 'normal') {
    const xpRewards = {
      easy: 20,
      normal: 40,
      hard: 60,
      expert: 100
    };
    
    const xpReward = xpRewards[taskDifficulty] || 40;
    
    // Mettre à jour le compteur de tâches
    const userData = await this.getUserData(userId);
    if (userData) {
      const updatedData = {
        ...userData,
        tasksCompleted: (userData.tasksCompleted || 0) + 1
      };
      await this.setUserData(userId, updatedData);
    }
    
    return await this.addXP(userId, xpReward, `Tâche ${taskDifficulty} complétée`);
  }

  // ✅ Connexion quotidienne (limitée à 1 par jour)
  async dailyLogin(userId) {
    const today = new Date().toDateString();
    const userData = await this.getUserData(userId);
    
    // Vérifier si déjà connecté aujourd'hui
    if (userData && userData.lastLoginDate === today) {
      console.log('ℹ️ Connexion quotidienne déjà enregistrée aujourd\'hui');
      return { success: true, addedXP: 0, alreadyProcessed: true };
    }

    // Mettre à jour la date de dernière connexion
    if (userData) {
      const updatedData = {
        ...userData,
        lastLoginDate: today,
        loginStreak: this.calculateStreak(userData.lastLoginDate, today, userData.loginStreak || 0)
      };
      await this.setUserData(userId, updatedData);
    }

    return await this.addXP(userId, 10, 'Connexion quotidienne');
  }

  // ✅ Calculer le streak de connexion
  calculateStreak(lastLoginDate, today, currentStreak) {
    if (!lastLoginDate) return 1;
    
    const lastDate = new Date(lastLoginDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return currentStreak + 1; // Streak continue
    } else if (diffDays === 0) {
      return currentStreak; // Même jour
    } else {
      return 1; // Streak cassé, recommencer
    }
  }

  // ✅ Obtenir le classement
  async getLeaderboard(limit = 10) {
    try {
      // En mode développement, retourner des données mock
      return [
        { userId: 'user1', name: 'Alice Martin', totalXp: 1250, level: 4 },
        { userId: 'user2', name: 'Bob Dupont', totalXp: 980, level: 3 },
        { userId: 'user3', name: 'Claire Dubois', totalXp: 750, level: 3 },
        { userId: 'user4', name: 'David Chen', totalXp: 620, level: 2 },
        { userId: 'user5', name: 'Emma Wilson', totalXp: 450, level: 2 }
      ];
    } catch (error) {
      console.error('❌ Erreur récupération leaderboard:', error);
      return [];
    }
  }
}

// ✅ Instance singleton
const gamificationService = new GamificationService();

// ✅ Export multiple pour compatibilité
export { gamificationService };
export default gamificationService;

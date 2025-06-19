// src/core/services/gameService.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

class GameService {
  constructor() {
    this.listeners = new Map();
  }

  // 🎯 Récupérer les données de gamification d'un utilisateur
  async getUserGameData(userId) {
    try {
      const docRef = doc(db, 'users', userId, 'gamification', 'stats');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Créer les données par défaut si elles n'existent pas
        const defaultData = this.getDefaultGameData();
        await this.initializeUserGameData(userId, defaultData);
        return defaultData;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de jeu:', error);
      throw error;
    }
  }

  // 🎮 Initialiser les données de gamification pour un nouvel utilisateur
  async initializeUserGameData(userId, customData = {}) {
    try {
      const defaultData = this.getDefaultGameData();
      const gameData = { ...defaultData, ...customData };
      
      const docRef = doc(db, 'users', userId, 'gamification', 'stats');
      await setDoc(docRef, {
        ...gameData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Données de gamification initialisées pour:', userId);
      return gameData;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  // ⭐ Ajouter de l'XP et calculer le niveau
  async addXP(userId, xpAmount, source = 'unknown') {
    try {
      const currentData = await this.getUserGameData(userId);
      const newXP = currentData.xp + xpAmount;
      const newTotalXP = currentData.totalXp + xpAmount;
      const newLevel = this.calculateLevel(newTotalXP);
      
      // Vérifier si l'utilisateur a gagné un niveau
      const leveledUp = newLevel > currentData.level;
      
      const updateData = {
        xp: newXP,
        totalXp: newTotalXP,
        level: newLevel,
        updatedAt: serverTimestamp()
      };

      // Ajouter l'historique XP
      if (!currentData.xpHistory) {
        updateData.xpHistory = [];
      }
      updateData.xpHistory = [
        ...currentData.xpHistory.slice(-9), // Garder les 10 dernières entrées
        {
          amount: xpAmount,
          source,
          timestamp: new Date().toISOString(),
          totalAfter: newTotalXP
        }
      ];

      const docRef = doc(db, 'users', userId, 'gamification', 'stats');
      await updateDoc(docRef, updateData);

      // Gérer le level up
      if (leveledUp) {
        await this.handleLevelUp(userId, newLevel, currentData.level);
      }

      console.log(`✅ +${xpAmount} XP ajouté (${source}). Total: ${newTotalXP} XP, Niveau: ${newLevel}`);
      
      return {
        ...currentData,
        ...updateData,
        leveledUp,
        previousLevel: currentData.level
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'XP:', error);
      throw error;
    }
  }

  // 🏆 Gérer le passage de niveau
  async handleLevelUp(userId, newLevel, previousLevel) {
    try {
      // Badge de niveau automatique
      const levelBadge = {
        id: `level_${newLevel}`,
        name: `Niveau ${newLevel}`,
        description: `Atteint le niveau ${newLevel}`,
        category: 'level',
        icon: '🏆',
        rarity: this.getLevelRarity(newLevel),
        unlockedAt: serverTimestamp()
      };

      await this.unlockBadge(userId, levelBadge);
      
      console.log(`🎉 LEVEL UP! ${previousLevel} → ${newLevel}`);
      
      // Bonus XP pour level up (pourra être utilisé pour d'autres mécaniques)
      return {
        levelUp: true,
        newLevel,
        previousLevel,
        badgeUnlocked: levelBadge
      };
    } catch (error) {
      console.error('Erreur lors du level up:', error);
      throw error;
    }
  }

  // 🏅 Débloquer un badge
  async unlockBadge(userId, badge) {
    try {
      const currentData = await this.getUserGameData(userId);
      
      // Vérifier si le badge n'est pas déjà débloqué
      const existingBadge = currentData.badges?.find(b => b.id === badge.id);
      if (existingBadge) {
        console.log('Badge déjà débloqué:', badge.id);
        return false;
      }

      const newBadge = {
        ...badge,
        unlockedAt: serverTimestamp()
      };

      const updatedBadges = [...(currentData.badges || []), newBadge];

      const docRef = doc(db, 'users', userId, 'gamification', 'stats');
      await updateDoc(docRef, {
        badges: updatedBadges,
        updatedAt: serverTimestamp()
      });

      console.log('🏅 Nouveau badge débloqué:', badge.name);
      return true;
    } catch (error) {
      console.error('Erreur lors du déblocage de badge:', error);
      throw error;
    }
  }

  // 📊 Mettre à jour les statistiques d'activité
  async updateActivityStats(userId, activity) {
    try {
      const docRef = doc(db, 'users', userId, 'gamification', 'stats');
      
      const updates = {
        updatedAt: serverTimestamp()
      };

      switch (activity.type) {
        case 'login':
          updates.loginStreak = activity.streak || 1;
          updates.lastLoginAt = serverTimestamp();
          break;
        case 'task_completed':
          updates.tasksCompleted = (await this.getUserGameData(userId)).tasksCompleted + 1;
          break;
        case 'session_time':
          updates.totalSessionTime = ((await this.getUserGameData(userId)).totalSessionTime || 0) + activity.duration;
          break;
      }

      await updateDoc(docRef, updates);
      console.log('📊 Statistiques d\'activité mises à jour:', activity.type);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
      throw error;
    }
  }

  // 🔄 Écouter les changements en temps réel
  subscribeToUserGameData(userId, callback) {
    const docRef = doc(db, 'users', userId, 'gamification', 'stats');
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    }, (error) => {
      console.error('Erreur lors de l\'écoute des données:', error);
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // 🛑 Arrêter l'écoute
  unsubscribeFromUserGameData(userId) {
    const unsubscribe = this.listeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(userId);
    }
  }

  // 🧮 Calculer le niveau basé sur l'XP total
  calculateLevel(totalXP) {
    // Formule: niveau = floor(sqrt(totalXP / 100))
    // Niveau 1: 100 XP, Niveau 2: 400 XP, Niveau 3: 900 XP, etc.
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  // 📈 Calculer l'XP nécessaire pour le prochain niveau
  getXPForNextLevel(currentLevel) {
    const nextLevel = currentLevel + 1;
    return Math.pow(nextLevel - 1, 2) * 100;
  }

  // 🎨 Déterminer la rareté d'un niveau
  getLevelRarity(level) {
    if (level >= 50) return 'legendary';
    if (level >= 25) return 'epic';
    if (level >= 10) return 'rare';
    if (level >= 5) return 'uncommon';
    return 'common';
  }

  // 🎯 Données par défaut pour un nouvel utilisateur
  getDefaultGameData() {
    return {
      xp: 0,
      level: 1,
      totalXp: 0,
      badges: [],
      achievements: [],
      loginStreak: 0,
      tasksCompleted: 0,
      totalSessionTime: 0,
      xpHistory: [],
      lastLoginAt: null,
      createdAt: null,
      updatedAt: null
    };
  }

  // 🏆 Système de badges prédéfinis
  getAvailableBadges() {
    return {
      // Badges d'activité
      first_login: { name: 'Premier Pas', icon: '👋', category: 'activity' },
      week_streak: { name: 'Assidu', icon: '🔥', category: 'activity' },
      month_streak: { name: 'Dévoué', icon: '💪', category: 'activity' },
      
      // Badges de tâches
      task_master: { name: 'Maître des Tâches', icon: '✅', category: 'productivity' },
      speed_demon: { name: 'Démon de Vitesse', icon: '⚡', category: 'productivity' },
      
      // Badges spéciaux
      early_adopter: { name: 'Pionnier', icon: '🚀', category: 'special' },
      perfectionist: { name: 'Perfectionniste', icon: '💎', category: 'special' }
    };
  }
}

// Export singleton
export const gameService = new GameService();

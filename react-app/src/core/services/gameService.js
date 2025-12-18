// ==========================================
// 📁 react-app/src/core/services/gameService.js
// Service Gamification COMPLET - Version Corrigée
// ==========================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { calculateLevel as calcLevel, getXPForLevel as getXPForLvl } from './levelService.js';
// 🔔 IMPORT NOTIFICATION SERVICE
import { notificationService } from './notificationService.js';

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
        const data = docSnap.data();
        return {
          ...data,
          // Assurer la cohérence des données
          level: data.level || 1,
          totalXp: data.totalXp || 0,
          badges: data.badges || [],
          tasksCompleted: data.tasksCompleted || 0,
          loginStreak: data.loginStreak || 0
        };
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

  // ⭐ Ajouter de l'XP et calculer le niveau - VERSION CORRIGÉE
  async addXP(userId, xpAmount, source = 'unknown', metadata = {}) {
    try {
      const currentData = await this.getUserGameData(userId);
      const newTotalXP = (currentData.totalXp || 0) + xpAmount;
      const newLevel = this.calculateLevel(newTotalXP);
      
      // Vérifier si l'utilisateur a gagné un niveau
      const leveledUp = newLevel > (currentData.level || 1);
      
      const updateData = {
        totalXp: newTotalXP,
        level: newLevel,
        tasksCompleted: currentData.tasksCompleted || 0,
        updatedAt: serverTimestamp()
      };

      // ✅ CORRECTION: Gérer xpHistory avec des dates normales
      const historyEntry = {
        amount: xpAmount,
        source,
        timestamp: new Date().toISOString(), // ✅ CORRECTED: String au lieu de serverTimestamp()
        totalAfter: newTotalXP,
        ...metadata
      };

      // Ajouter à l'historique (garder les 10 dernières)
      const currentHistory = currentData.xpHistory || [];
      updateData.xpHistory = [
        ...currentHistory.slice(-9),
        historyEntry
      ];

      const docRef = doc(db, 'users', userId, 'gamification', 'stats');
      await updateDoc(docRef, updateData);

      console.log(`✅ XP mis à jour: ${currentData.totalXp || 0} → ${newTotalXP} (niveau ${currentData.level || 1} → ${newLevel})`);

      // Gérer le level up APRÈS la mise à jour principale
      if (leveledUp) {
        try {
          await this.handleLevelUp(userId, newLevel, currentData.level || 1);
        } catch (levelUpError) {
          console.warn('⚠️ Erreur level up (non bloquant):', levelUpError);
        }
      }
      
      return {
        ...currentData,
        ...updateData,
        leveledUp,
        previousLevel: currentData.level || 1,
        xpGain: xpAmount
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'XP:', error);
      throw error;
    }
  }

  // 🏆 Gérer le passage de niveau - VERSION CORRIGÉE + NOTIFICATIONS
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
        unlockedAt: new Date() // ✅ CORRECTED: Date normale
      };

      await this.unlockBadge(userId, levelBadge);

      // 🔔 NOTIFICATION LEVEL UP
      try {
        await notificationService.notifyLevelUp(userId, {
          newLevel,
          previousLevel
        });
        console.log(`🔔 [NOTIF] Level up notification envoyée: ${previousLevel} → ${newLevel}`);
      } catch (notifError) {
        console.warn('⚠️ Erreur notification level up (non bloquant):', notifError);
      }

      console.log(`🎉 LEVEL UP! ${previousLevel} → ${newLevel}`);

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

  // 🏅 Débloquer un badge - VERSION CORRIGÉE + NOTIFICATIONS
  async unlockBadge(userId, badge) {
    try {
      const currentData = await this.getUserGameData(userId);

      // Vérifier si le badge n'est pas déjà débloqué
      const existingBadge = currentData.badges?.find(b => b.id === badge.id);
      if (existingBadge) {
        console.log('Badge déjà débloqué:', badge.id);
        return false;
      }

      // ✅ CORRECTION: Utiliser new Date() au lieu de serverTimestamp() dans l'array
      const newBadge = {
        ...badge,
        unlockedAt: new Date() // ✅ CORRECTED: Date normale au lieu de serverTimestamp()
      };

      const updatedBadges = [...(currentData.badges || []), newBadge];

      const docRef = doc(db, 'users', userId, 'gamification', 'stats');
      await updateDoc(docRef, {
        badges: updatedBadges,
        updatedAt: serverTimestamp() // ✅ serverTimestamp() OK ici (pas dans array)
      });

      // 🔔 NOTIFICATION BADGE (sauf pour badges de niveau - éviter doublon)
      if (!badge.category?.includes('level')) {
        try {
          await notificationService.notifyBadgeEarned(userId, {
            badgeId: badge.id,
            badgeName: badge.name,
            badgeIcon: badge.icon || '🏆',
            badgeDescription: badge.description
          });
          console.log(`🔔 [NOTIF] Badge notification envoyée: ${badge.name}`);
        } catch (notifError) {
          console.warn('⚠️ Erreur notification badge (non bloquant):', notifError);
        }
      }

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
          updates.lastLoginAt = new Date(); // ✅ Date normale
          break;
        case 'task_completed':
          const currentData = await this.getUserGameData(userId);
          updates.tasksCompleted = (currentData.tasksCompleted || 0) + 1;
          break;
        case 'session_time':
          const userData = await this.getUserGameData(userId);
          updates.totalSessionTime = (userData.totalSessionTime || 0) + (activity.duration || 0);
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
        const data = doc.data();
        callback({
          ...data,
          // Assurer la cohérence des données
          level: data.level || 1,
          totalXp: data.totalXp || 0,
          badges: data.badges || [],
          tasksCompleted: data.tasksCompleted || 0
        });
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
  // Utilise le nouveau système de niveaux calibré (~1000 XP/mois, ~4 ans max)
  calculateLevel(totalXP) {
    return calcLevel(totalXP);
  }

  // 📈 Calculer l'XP nécessaire pour le prochain niveau
  // Utilise le nouveau système de niveaux calibré
  getXPForNextLevel(currentLevel) {
    return getXPForLvl(currentLevel + 1);
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

  // 🧹 Nettoyer tous les listeners
  cleanup() {
    this.listeners.forEach((unsubscribe, userId) => {
      unsubscribe();
      console.log('🛑 Listener nettoyé pour:', userId);
    });
    this.listeners.clear();
  }
}

// Export singleton
export const gameService = new GameService();
export default gameService;

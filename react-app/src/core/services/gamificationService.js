// src/services/gamificationService.js - SYSTÈME XP AUTOMATIQUE
import { doc, updateDoc, increment, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { COLLECTIONS, GAMIFICATION } from '../core/constants.js';

class GamificationService {

  /**
   * 🎯 AJOUTER XP ET GÉRER PROGRESSION
   * @param {string} userId - ID de l'utilisateur
   * @param {number} xpGain - XP à ajouter
   * @param {string} action - Action qui a donné l'XP
   * @param {Object} metadata - Métadonnées de l'action
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
      const currentXP = userData.gamification?.xp || 0;
      const currentLevel = userData.gamification?.level || 1;
      const totalXP = userData.gamification?.totalXp || 0;
      
      // Calculer nouveau XP et niveau
      const newXP = currentXP + xpGain;
      const newTotalXP = totalXP + xpGain;
      const { newLevel, leveledUp } = this.calculateLevel(newXP, currentLevel);
      
      // Préparer les mises à jour
      const updates = {
        'gamification.xp': newXP,
        'gamification.totalXp': newTotalXP,
        'gamification.level': newLevel,
        'gamification.lastActivityAt': new Date(),
        'gamification.lastXpGainAt': new Date(),
        'stats.lastActionAt': new Date(),
        updatedAt: new Date()
      };
      
      // Ajouter stats spécifiques selon l'action
      if (action === 'task_complete') {
        updates['stats.tasksCompleted'] = increment(1);
      } else if (action === 'project_create') {
        updates['stats.projectsCreated'] = increment(1);
      } else if (action === 'help_colleague') {
        updates['stats.helpProvided'] = increment(1);
      }
      
      // Appliquer les mises à jour
      await updateDoc(userRef, updates);
      
      // Gérer level up si nécessaire
      let levelUpRewards = [];
      if (leveledUp) {
        levelUpRewards = await this.handleLevelUp(userId, newLevel);
      }
      
      // Vérifier débloquage de badges
      const newBadges = await this.checkBadgeUnlocks(userId, action, metadata, newTotalXP);
      
      console.log(`✅ XP ajouté avec succès:`, {
        xpGain,
        newXP,
        newLevel,
        leveledUp,
        newBadges: newBadges.length
      });
      
      return {
        success: true,
        xpGain,
        newXP,
        newLevel,
        leveledUp,
        levelUpRewards,
        newBadges,
        message: this.getXPMessage(action, xpGain, leveledUp)
      };
      
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 CALCULER NIVEAU BASÉ SUR XP
   */
  calculateLevel(xp, currentLevel) {
    // Système de niveaux progressif : 100, 250, 450, 700, 1000, 1350, 1750, etc.
    let requiredXP = 0;
    let level = 1;
    
    while (level <= 100) { // Max niveau 100
      const xpForThisLevel = 100 + (level - 1) * 50;
      
      if (xp < requiredXP + xpForThisLevel) {
        break;
      }
      
      requiredXP += xpForThisLevel;
      level++;
    }
    
    const leveledUp = level > currentLevel;
    
    return { newLevel: level, leveledUp, xpForCurrentLevel: xp - requiredXP };
  }

  /**
   * 🎊 GÉRER LEVEL UP
   */
  async handleLevelUp(userId, newLevel) {
    try {
      const rewards = [];
      
      // Récompenses par paliers
      if (newLevel % 5 === 0) {
        // Tous les 5 niveaux : badge spécial
        rewards.push({
          type: 'badge',
          id: `level_${newLevel}`,
          name: `Niveau ${newLevel}`,
          description: `Atteint le niveau ${newLevel} !`,
          rarity: newLevel >= 25 ? 'legendary' : newLevel >= 15 ? 'epic' : 'rare'
        });
      }
      
      if (newLevel % 10 === 0) {
        // Tous les 10 niveaux : XP bonus
        const bonusXP = newLevel * 10;
        rewards.push({
          type: 'xp_bonus',
          amount: bonusXP,
          description: `Bonus de niveau : +${bonusXP} XP`
        });
      }
      
      // Sauvegarder les récompenses
      if (rewards.length > 0) {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const batch = writeBatch(db);
        
        rewards.forEach(reward => {
          if (reward.type === 'badge') {
            batch.update(userRef, {
              'gamification.badges': increment([{
                ...reward,
                unlockedAt: new Date()
              }])
            });
          }
        });
        
        await batch.commit();
      }
      
      console.log(`🎊 Level Up ! Niveau ${newLevel} atteint avec ${rewards.length} récompenses`);
      
      return rewards;
      
    } catch (error) {
      console.error('❌ Erreur level up:', error);
      return [];
    }
  }

  /**
   * 🏆 VÉRIFIER DÉBLOQUAGE DE BADGES
   */
  async checkBadgeUnlocks(userId, action, metadata, totalXP) {
    try {
      const newBadges = [];
      
      // Badges basés sur l'action
      const actionBadges = {
        'task_complete': [
          { threshold: 1, id: 'first_task', name: 'Première Tâche', rarity: 'common' },
          { threshold: 10, id: 'task_veteran', name: 'Vétéran des Tâches', rarity: 'uncommon' },
          { threshold: 50, id: 'task_master', name: 'Maître des Tâches', rarity: 'rare' },
          { threshold: 100, id: 'task_legend', name: 'Légende des Tâches', rarity: 'legendary' }
        ],
        'daily_login': [
          { threshold: 7, id: 'week_warrior', name: 'Guerrier de la Semaine', rarity: 'common' },
          { threshold: 30, id: 'month_master', name: 'Maître du Mois', rarity: 'rare' }
        ]
      };
      
      // Badges basés sur XP total
      const xpBadges = [
        { threshold: 100, id: 'xp_100', name: 'Première Centaine', rarity: 'common' },
        { threshold: 500, id: 'xp_500', name: 'Collectionneur d\'XP', rarity: 'uncommon' },
        { threshold: 1000, id: 'xp_1000', name: 'Millionnaire d\'XP', rarity: 'rare' },
        { threshold: 5000, id: 'xp_5000', name: 'Légende XP', rarity: 'legendary' }
      ];
      
      // Vérifier badges XP
      for (const badge of xpBadges) {
        if (totalXP >= badge.threshold) {
          const userRef = doc(db, COLLECTIONS.USERS, userId);
          const userDoc = await getDoc(userRef);
          const existingBadges = userDoc.data().gamification?.badges || [];
          
          if (!existingBadges.find(b => b.id === badge.id)) {
            newBadges.push({
              ...badge,
              description: `Obtenu ${badge.threshold} XP total`,
              unlockedAt: new Date(),
              category: 'progression'
            });
          }
        }
      }
      
      // Sauvegarder nouveaux badges
      if (newBadges.length > 0) {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        await updateDoc(userRef, {
          'gamification.badges': increment(newBadges),
          'stats.badgesEarned': increment(newBadges.length)
        });
      }
      
      return newBadges;
      
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return [];
    }
  }

  /**
   * 💬 MESSAGES XP PERSONNALISÉS
   */
  getXPMessage(action, xpGain, leveledUp) {
    const actionMessages = {
      'task_complete': `Tâche terminée ! +${xpGain} XP`,
      'project_create': `Projet créé ! +${xpGain} XP`,
      'daily_login': `Connexion quotidienne ! +${xpGain} XP`,
      'help_colleague': `Aide apportée ! +${xpGain} XP`,
      'profile_complete': `Profil complété ! +${xpGain} XP`
    };
    
    let message = actionMessages[action] || `Action récompensée ! +${xpGain} XP`;
    
    if (leveledUp) {
      message += ' 🎊 LEVEL UP !';
    }
    
    return message;
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
      
      const currentXP = gamification.xp || 0;
      const currentLevel = gamification.level || 1;
      const { newLevel, xpForCurrentLevel } = this.calculateLevel(currentXP, currentLevel);
      const xpForNextLevel = 100 + (currentLevel - 1) * 50;
      const progressPercent = Math.floor((xpForCurrentLevel / xpForNextLevel) * 100);
      
      return {
        xp: currentXP,
        level: currentLevel,
        xpForCurrentLevel,
        xpForNextLevel,
        progressPercent,
        totalXp: gamification.totalXp || 0,
        badges: gamification.badges || [],
        achievements: gamification.achievements || []
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
      'easy': 20,
      'normal': 40,
      'hard': 60,
      'expert': 100
    };
    
    const xpGain = xpRewards[taskDifficulty] || 40;
    return await this.addXP(userId, xpGain, 'task_complete', { difficulty: taskDifficulty });
  }

  async dailyLogin(userId) {
    return await this.addXP(userId, 10, 'daily_login');
  }

  async createProject(userId) {
    return await this.addXP(userId, 100, 'project_create');
  }

  async helpColleague(userId) {
    return await this.addXP(userId, 50, 'help_colleague');
  }

  async completeProfile(userId) {
    return await this.addXP(userId, 200, 'profile_complete');
  }
}

export default new GamificationService();

// src/services/gamificationService.js - SERVICE COMPLET DE GAMIFICATION
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
import { db } from '../core/firebase.js';

// Collections Firestore
const COLLECTIONS = {
  USERS: 'users',
  ACTIVITIES: 'activities',
  LEADERBOARD: 'leaderboard',
  BADGES: 'badges',
  ACHIEVEMENTS: 'achievements'
};

// Configuration XP et Niveaux
const XP_CONFIG = {
  // Récompenses XP par action
  REWARDS: {
    DAILY_LOGIN: 10,
    FIRST_LOGIN: 50,
    TASK_COMPLETE_EASY: 20,
    TASK_COMPLETE_NORMAL: 40,
    TASK_COMPLETE_HARD: 60,
    TASK_COMPLETE_EXPERT: 100,
    PROJECT_CREATE: 100,
    PROJECT_COMPLETE: 200,
    HELP_COLLEAGUE: 50,
    PROFILE_COMPLETE: 200,
    TUTORIAL_COMPLETE: 25,
    FEEDBACK_GIVEN: 15,
    BUG_REPORT: 30,
    SUGGESTION_ACCEPTED: 75
  },
  
  // Système de niveaux progressif
  LEVEL_SYSTEM: {
    BASE_XP: 100,        // XP requis pour niveau 2
    MULTIPLIER: 1.5,     // Facteur d'augmentation par niveau
    MAX_LEVEL: 100       // Niveau maximum
  },
  
  // Paliers de niveaux spéciaux
  LEVEL_MILESTONES: [5, 10, 15, 20, 25, 30, 40, 50, 75, 100]
};

// Définitions des badges
const BADGE_DEFINITIONS = {
  // Badges de progression XP
  xp_collector: {
    name: 'Collectionneur d\'XP',
    description: 'Atteindre 500 XP total',
    category: 'progression',
    rarity: 'common',
    icon: '💰',
    threshold: 500
  },
  xp_master: {
    name: 'Maître de l\'XP',
    description: 'Atteindre 2000 XP total',
    category: 'progression',
    rarity: 'rare',
    icon: '👑',
    threshold: 2000
  },
  xp_legend: {
    name: 'Légende XP',
    description: 'Atteindre 10000 XP total',
    category: 'progression',
    rarity: 'legendary',
    icon: '🌟',
    threshold: 10000
  },
  
  // Badges de tâches
  first_task: {
    name: 'Première Mission',
    description: 'Compléter votre première tâche',
    category: 'tasks',
    rarity: 'common',
    icon: '🎯',
    threshold: 1
  },
  task_veteran: {
    name: 'Vétéran des Tâches',
    description: 'Compléter 25 tâches',
    category: 'tasks',
    rarity: 'uncommon',
    icon: '⚔️',
    threshold: 25
  },
  task_master: {
    name: 'Maître des Tâches',
    description: 'Compléter 100 tâches',
    category: 'tasks',
    rarity: 'rare',
    icon: '🏆',
    threshold: 100
  },
  task_legend: {
    name: 'Légende des Tâches',
    description: 'Compléter 500 tâches',
    category: 'tasks',
    rarity: 'legendary',
    icon: '👑',
    threshold: 500
  },
  
  // Badges de connexion
  early_bird: {
    name: 'Lève-tôt',
    description: 'Se connecter avant 7h du matin',
    category: 'activity',
    rarity: 'uncommon',
    icon: '🌅',
    special: true
  },
  night_owl: {
    name: 'Oiseau de Nuit',
    description: 'Se connecter après 23h',
    category: 'activity',
    rarity: 'uncommon',
    icon: '🦉',
    special: true
  },
  week_warrior: {
    name: 'Guerrier de la Semaine',
    description: 'Se connecter 7 jours consécutifs',
    category: 'activity',
    rarity: 'rare',
    icon: '⚔️',
    threshold: 7
  },
  month_master: {
    name: 'Maître du Mois',
    description: 'Se connecter 30 jours consécutifs',
    category: 'activity',
    rarity: 'epic',
    icon: '📅',
    threshold: 30
  },
  
  // Badges de niveau
  level_5: {
    name: 'Apprenti',
    description: 'Atteindre le niveau 5',
    category: 'levels',
    rarity: 'common',
    icon: '🎓',
    threshold: 5
  },
  level_10: {
    name: 'Compagnon',
    description: 'Atteindre le niveau 10',
    category: 'levels',
    rarity: 'uncommon',
    icon: '🛡️',
    threshold: 10
  },
  level_25: {
    name: 'Expert',
    description: 'Atteindre le niveau 25',
    category: 'levels',
    rarity: 'rare',
    icon: '⭐',
    threshold: 25
  },
  level_50: {
    name: 'Maître',
    description: 'Atteindre le niveau 50',
    category: 'levels',
    rarity: 'epic',
    icon: '🔮',
    threshold: 50
  },
  level_100: {
    name: 'Grand Maître',
    description: 'Atteindre le niveau maximum',
    category: 'levels',
    rarity: 'legendary',
    icon: '👑',
    threshold: 100
  },
  
  // Badges spéciaux
  perfectionist: {
    name: 'Perfectionniste',
    description: 'Compléter 10 tâches expertes',
    category: 'special',
    rarity: 'epic',
    icon: '💎',
    threshold: 10
  },
  speed_demon: {
    name: 'Démon de Vitesse',
    description: 'Compléter 5 tâches en une journée',
    category: 'special',
    rarity: 'rare',
    icon: '⚡',
    threshold: 5
  },
  helper: {
    name: 'Bon Samaritain',
    description: 'Aider 10 collègues',
    category: 'social',
    rarity: 'uncommon',
    icon: '🤝',
    threshold: 10
  }
};

class GamificationService {

  /**
   * 🎯 AJOUTER XP ET GÉRER PROGRESSION COMPLÈTE
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
      const currentGamification = userData.gamification || {};
      
      const currentXP = currentGamification.xp || 0;
      const currentLevel = currentGamification.level || 1;
      const totalXP = currentGamification.totalXp || 0;
      const currentBadges = currentGamification.badges || [];
      
      // Calculer nouveau XP et niveau
      const newXP = currentXP + xpGain;
      const newTotalXP = totalXP + xpGain;
      const { newLevel, leveledUp, xpForNextLevel, progressPercent } = this.calculateLevel(newXP, currentLevel);
      
      // Préparer les mises à jour de base
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
          if (metadata.difficulty === 'expert') {
            updates['stats.expertTasksCompleted'] = increment(1);
          }
          break;
        case 'project_create':
          updates['stats.projectsCreated'] = increment(1);
          break;
        case 'project_complete':
          updates['stats.projectsCompleted'] = increment(1);
          break;
        case 'help_colleague':
          updates['stats.helpProvided'] = increment(1);
          break;
        case 'daily_login':
          updates['stats.loginCount'] = increment(1);
          updates['gamification.streakDays'] = increment(1);
          break;
      }
      
      // Appliquer les mises à jour de base
      await updateDoc(userRef, updates);
      
      // Gérer level up et récompenses
      let levelUpRewards = [];
      if (leveledUp) {
        levelUpRewards = await this.handleLevelUp(userId, newLevel, currentLevel);
      }
      
      // Vérifier débloquage de badges
      const newBadges = await this.checkAndUnlockBadges(userId, action, metadata, {
        newTotalXP,
        newLevel,
        tasksCompleted: (userData.stats?.tasksCompleted || 0) + (action === 'task_complete' ? 1 : 0),
        expertTasksCompleted: (userData.stats?.expertTasksCompleted || 0) + (action === 'task_complete' && metadata.difficulty === 'expert' ? 1 : 0),
        helpProvided: (userData.stats?.helpProvided || 0) + (action === 'help_colleague' ? 1 : 0),
        currentBadges
      });
      
      // Créer l'entrée dans l'historique
      await this.createXPHistoryEntry(userId, {
        xpGain,
        action,
        metadata,
        newXP,
        newLevel,
        leveledUp,
        badgesUnlocked: newBadges.length,
        timestamp: now
      });
      
      // Mettre à jour le leaderboard
      await this.updateLeaderboard(userId, newTotalXP, newLevel);
      
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
        xpForNextLevel,
        progressPercent,
        levelUpRewards,
        newBadges,
        message: this.getXPMessage(action, xpGain, leveledUp, newBadges.length)
      };
      
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 CALCULER NIVEAU BASÉ SUR XP (SYSTÈME PROGRESSIF)
   */
  calculateLevel(xp, currentLevel = 1) {
    let level = 1;
    let totalXpRequired = 0;
    let xpForCurrentLevel = XP_CONFIG.LEVEL_SYSTEM.BASE_XP;
    
    // Calculer le niveau basé sur l'XP total
    while (level < XP_CONFIG.LEVEL_SYSTEM.MAX_LEVEL) {
      if (xp < totalXpRequired + xpForCurrentLevel) {
        break;
      }
      
      totalXpRequired += xpForCurrentLevel;
      level++;
      
      // Augmenter progressivement les requis XP
      xpForCurrentLevel = Math.floor(
        XP_CONFIG.LEVEL_SYSTEM.BASE_XP * Math.pow(XP_CONFIG.LEVEL_SYSTEM.MULTIPLIER, level - 1)
      );
    }
    
    const leveledUp = level > currentLevel;
    const xpInCurrentLevel = xp - totalXpRequired;
    const xpForNextLevel = level < XP_CONFIG.LEVEL_SYSTEM.MAX_LEVEL ? xpForCurrentLevel : 0;
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
   * 🎊 GÉRER LEVEL UP AVEC RÉCOMPENSES
   */
  async handleLevelUp(userId, newLevel, previousLevel) {
    try {
      const rewards = [];
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      
      // Récompenses par paliers
      if (XP_CONFIG.LEVEL_MILESTONES.includes(newLevel)) {
        // Badge de niveau spécial
        const levelBadge = {
          id: `level_${newLevel}`,
          name: `Niveau ${newLevel}`,
          description: `Atteint le niveau ${newLevel} !`,
          category: 'levels',
          rarity: newLevel >= 50 ? 'legendary' : newLevel >= 25 ? 'epic' : newLevel >= 10 ? 'rare' : 'common',
          icon: this.getLevelIcon(newLevel),
          unlockedAt: new Date()
        };
        
        rewards.push(levelBadge);
        
        // Ajouter le badge
        await updateDoc(userRef, {
          'gamification.badges': arrayUnion(levelBadge),
          'stats.badgesEarned': increment(1)
        });
      }
      
      // Bonus XP pour certains niveaux
      if (newLevel % 10 === 0) {
        const bonusXP = newLevel * 10;
        rewards.push({
          type: 'xp_bonus',
          amount: bonusXP,
          description: `Bonus de niveau : +${bonusXP} XP`
        });
        
        // Appliquer le bonus XP
        await updateDoc(userRef, {
          'gamification.xp': increment(bonusXP),
          'gamification.totalXp': increment(bonusXP)
        });
      }
      
      console.log(`🎊 Level Up ! Niveau ${newLevel} atteint avec ${rewards.length} récompense(s)`);
      
      return rewards;
      
    } catch (error) {
      console.error('❌ Erreur level up:', error);
      return [];
    }
  }

  /**
   * 🏆 VÉRIFIER ET DÉBLOQUER BADGES
   */
  async checkAndUnlockBadges(userId, action, metadata, stats) {
    try {
      const newBadges = [];
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      
      // Badges basés sur l'XP total
      for (const [badgeId, badgeData] of Object.entries(BADGE_DEFINITIONS)) {
        if (badgeData.category === 'progression' && badgeData.threshold <= stats.newTotalXP) {
          if (!stats.currentBadges.find(b => b.id === badgeId)) {
            newBadges.push({
              id: badgeId,
              ...badgeData,
              unlockedAt: new Date()
            });
          }
        }
      }
      
      // Badges basés sur les tâches
      if (action === 'task_complete') {
        for (const [badgeId, badgeData] of Object.entries(BADGE_DEFINITIONS)) {
          if (badgeData.category === 'tasks' && badgeData.threshold <= stats.tasksCompleted) {
            if (!stats.currentBadges.find(b => b.id === badgeId)) {
              newBadges.push({
                id: badgeId,
                ...badgeData,
                unlockedAt: new Date()
              });
            }
          }
        }
        
        // Badge perfectionniste (tâches expertes)
        if (metadata.difficulty === 'expert' && stats.expertTasksCompleted >= 10) {
          if (!stats.currentBadges.find(b => b.id === 'perfectionist')) {
            newBadges.push({
              id: 'perfectionist',
              ...BADGE_DEFINITIONS.perfectionist,
              unlockedAt: new Date()
            });
          }
        }
      }
      
      // Badges basés sur le niveau
      for (const [badgeId, badgeData] of Object.entries(BADGE_DEFINITIONS)) {
        if (badgeData.category === 'levels' && badgeData.threshold <= stats.newLevel) {
          if (!stats.currentBadges.find(b => b.id === badgeId)) {
            newBadges.push({
              id: badgeId,
              ...badgeData,
              unlockedAt: new Date()
            });
          }
        }
      }
      
      // Badges basés sur l'aide fournie
      if (action === 'help_colleague') {
        for (const [badgeId, badgeData] of Object.entries(BADGE_DEFINITIONS)) {
          if (badgeData.category === 'social' && badgeData.threshold <= stats.helpProvided) {
            if (!stats.currentBadges.find(b => b.id === badgeId)) {
              newBadges.push({
                id: badgeId,
                ...badgeData,
                unlockedAt: new Date()
              });
            }
          }
        }
      }
      
      // Badges spéciaux basés sur l'heure
      if (action === 'daily_login') {
        const hour = new Date().getHours();
        
        // Early bird (avant 7h)
        if (hour < 7 && !stats.currentBadges.find(b => b.id === 'early_bird')) {
          newBadges.push({
            id: 'early_bird',
            ...BADGE_DEFINITIONS.early_bird,
            unlockedAt: new Date()
          });
        }
        
        // Night owl (après 23h)
        if (hour >= 23 && !stats.currentBadges.find(b => b.id === 'night_owl')) {
          newBadges.push({
            id: 'night_owl',
            ...BADGE_DEFINITIONS.night_owl,
            unlockedAt: new Date()
          });
        }
      }
      
      // Sauvegarder les nouveaux badges
      if (newBadges.length > 0) {
        await updateDoc(userRef, {
          'gamification.badges': arrayUnion(...newBadges),
          'stats.badgesEarned': increment(newBadges.length)
        });
        
        console.log(`🏆 ${newBadges.length} nouveau(x) badge(s) débloqué(s):`, newBadges.map(b => b.name));
      }
      
      return newBadges;
      
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR PROGRESSION UTILISATEUR COMPLÈTE
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
      
      // Calculer le rang dans le leaderboard
      const rank = await this.getUserRank(userId);
      
      return {
        // XP et niveaux
        xp: currentXP,
        level: currentLevel,
        totalXp: totalXP,
        xpInCurrentLevel,
        xpForNextLevel,
        progressPercent,
        
        // Collections
        badges: gamification.badges || [],
        achievements: gamification.achievements || [],
        
        // Statistiques
        tasksCompleted: stats.tasksCompleted || 0,
        projectsCreated: stats.projectsCreated || 0,
        helpProvided: stats.helpProvided || 0,
        loginCount: stats.loginCount || 0,
        streakDays: gamification.streakDays || 0,
        
        // Classement
        rank,
        
        // Métadonnées
        joinedAt: gamification.joinedAt,
        lastActivityAt: gamification.lastActivityAt,
        lastXpGainAt: gamification.lastXpGainAt
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération progression:', error);
      return null;
    }
  }

  /**
   * 🏅 OBTENIR LEADERBOARD
   */
  async getLeaderboard(limit = 10) {
    try {
      const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARD);
      const q = query(
        leaderboardRef,
        orderBy('totalXp', 'desc'),
        orderBy('level', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const leaderboard = [];
      
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        leaderboard.push({
          rank: index + 1,
          userId: doc.id,
          displayName: data.displayName,
          email: data.email,
          photoURL: data.photoURL,
          level: data.level,
          totalXp: data.totalXp,
          badgeCount: data.badgeCount || 0,
          lastActiveAt: data.lastActiveAt
        });
      });
      
      return leaderboard;
      
    } catch (error) {
      console.error('❌ Erreur récupération leaderboard:', error);
      return [];
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

  async createProject(userId) {
    return await this.addXP(userId, XP_CONFIG.REWARDS.PROJECT_CREATE, 'project_create');
  }

  async completeProject(userId) {
    return await this.addXP(userId, XP_CONFIG.REWARDS.PROJECT_COMPLETE, 'project_complete');
  }

  async helpColleague(userId) {
    return await this.addXP(userId, XP_CONFIG.REWARDS.HELP_COLLEAGUE, 'help_colleague');
  }

  async completeProfile(userId) {
    return await this.addXP(userId, XP_CONFIG.REWARDS.PROFILE_COMPLETE, 'profile_complete');
  }

  async giveFeedback(userId) {
    return await this.addXP(userId, XP_CONFIG.REWARDS.FEEDBACK_GIVEN, 'feedback_given');
  }

  async reportBug(userId) {
    return await this.addXP(userId, XP_CONFIG.REWARDS.BUG_REPORT, 'bug_report');
  }

  /**
   * 📝 MÉTHODES UTILITAIRES
   */
  
  // Créer entrée historique XP
  async createXPHistoryEntry(userId, data) {
    try {
      const historyRef = collection(db, COLLECTIONS.ACTIVITIES);
      await addDoc(historyRef, {
        userId,
        type: 'xp_gained',
        ...data
      });
    } catch (error) {
      console.warn('⚠️ Erreur création historique XP:', error);
    }
  }
  
  // Mettre à jour le leaderboard
  async updateLeaderboard(userId, totalXp, level) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, userId);
        
        await updateDoc(leaderboardRef, {
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
          email: userData.email,
          photoURL: userData.photoURL || '',
          level,
          totalXp,
          badgeCount: userData.gamification?.badges?.length || 0,
          lastActiveAt: new Date()
        });
      }
    } catch (error) {
      console.warn('⚠️ Erreur mise à jour leaderboard:', error);
    }
  }
  
  // Obtenir le rang d'un utilisateur
  async getUserRank(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return null;
      
      const userData = userDoc.data();
      const userTotalXP = userData.gamification?.totalXp || 0;
      
      const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARD);
      const q = query(
        leaderboardRef,
        where('totalXp', '>', userTotalXP)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size + 1; // Position dans le classement
      
    } catch (error) {
      console.error('❌ Erreur calcul rang:', error);
      return null;
    }
  }
  
  // Obtenir icône de niveau
  getLevelIcon(level) {
    if (level >= 100) return '👑';
    if (level >= 50) return '🔮';
    if (level >= 25) return '⭐';
    if (level >= 10) return '🛡️';
    if (level >= 5) return '🎓';
    return '🌱';
  }
  
  // Message XP personnalisé
  getXPMessage(action, xpGain, leveledUp, badgeCount = 0) {
    const actionMessages = {
      'task_complete': `Tâche terminée ! +${xpGain} XP`,
      'project_create': `Projet créé ! +${xpGain} XP`,
      'project_complete': `Projet terminé ! +${xpGain} XP`,
      'daily_login': `Connexion quotidienne ! +${xpGain} XP`,
      'help_colleague': `Aide apportée ! +${xpGain} XP`,
      'profile_complete': `Profil complété ! +${xpGain} XP`,
      'feedback_given': `Feedback donné ! +${xpGain} XP`,
      'bug_report': `Bug signalé ! +${xpGain} XP`
    };
    
    let message = actionMessages[action] || `Action récompensée ! +${xpGain} XP`;
    
    if (leveledUp) {
      message += ' 🎊 LEVEL UP !';
    }
    
    if (badgeCount > 0) {
      message += ` 🏆 ${badgeCount} badge(s) débloqué(s) !`;
    }
    
    return message;
  }

  /**
   * 📈 STATISTIQUES AVANCÉES
   */
  async getGamificationStats() {
    try {
      // Statistiques globales de la gamification
      const usersRef = collection(db, COLLECTIONS.USERS);
      const usersSnapshot = await getDocs(usersRef);
      
      let totalUsers = 0;
      let totalXP = 0;
      let totalBadges = 0;
      let averageLevel = 0;
      let maxLevel = 0;
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const gamification = data.gamification || {};
        
        totalUsers++;
        totalXP += gamification.totalXp || 0;
        totalBadges += gamification.badges?.length || 0;
        averageLevel += gamification.level || 1;
        maxLevel = Math.max(maxLevel, gamification.level || 1);
      });
      
      return {
        totalUsers,
        totalXP,
        totalBadges,
        averageLevel: Math.round(averageLevel / totalUsers),
        maxLevel,
        averageXPPerUser: Math.round(totalXP / totalUsers),
        averageBadgesPerUser: Math.round(totalBadges / totalUsers)
      };
      
    } catch (error) {
      console.error('❌ Erreur statistiques gamification:', error);
      return null;
    }
  }
}

export default new GamificationService();

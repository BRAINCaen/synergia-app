// react-app/src/core/services/gamificationService.js

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  arrayUnion, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ONBOARDING_BADGES } from './onboardingService';

// Configuration XP et niveaux
const XP_CONFIG = {
  TASK_BASE: 10,
  PRIORITY_MULTIPLIERS: {
    low: 1,
    medium: 1.5,
    high: 2,
    urgent: 2.5
  },
  LEVEL_BASE: 100,
  LEVEL_MULTIPLIER: 1.2
};

// Badges du système principal
const SYSTEM_BADGES = {
  first_login: {
    id: 'first_login',
    name: 'Premier Pas',
    description: 'Première connexion à Synergia',
    icon: '🚀',
    color: '#3B82F6',
    rarity: 'common',
    condition: 'first_login'
  },
  task_master: {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Compléter 10 tâches',
    icon: '⚡',
    color: '#10B981',
    rarity: 'uncommon',
    condition: 'complete_tasks',
    threshold: 10
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Démon de Vitesse',
    description: 'Compléter 5 tâches en une journée',
    icon: '🏃‍♂️',
    color: '#F59E0B',
    rarity: 'rare',
    condition: 'daily_tasks',
    threshold: 5
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Compléter 5 tâches priorité haute',
    icon: '💎',
    color: '#8B5CF6',
    rarity: 'epic',
    condition: 'high_priority_tasks',
    threshold: 5
  },
  team_player: {
    id: 'team_player',
    name: 'Esprit d\'Équipe',
    description: 'Participer à 3 projets',
    icon: '🤝',
    color: '#EC4899',
    rarity: 'rare',
    condition: 'participate_projects',
    threshold: 3
  },
  week_warrior: {
    id: 'week_warrior',
    name: 'Guerrier de la Semaine',
    description: 'Compléter des tâches 7 jours consécutifs',
    icon: '🗡️',
    color: '#EF4444',
    rarity: 'epic',
    condition: 'weekly_streak',
    threshold: 7
  },
  xp_collector: {
    id: 'xp_collector',
    name: 'Collectionneur d\'XP',
    description: 'Atteindre 1000 XP',
    icon: '⭐',
    color: '#F59E0B',
    rarity: 'rare',
    condition: 'total_xp',
    threshold: 1000
  },
  level_master: {
    id: 'level_master',
    name: 'Maître des Niveaux',
    description: 'Atteindre le niveau 5',
    icon: '👑',
    color: '#8B5CF6',
    rarity: 'epic',
    condition: 'reach_level',
    threshold: 5
  }
};

// Combinaison de tous les badges
const ALL_BADGES = {
  ...SYSTEM_BADGES,
  ...ONBOARDING_BADGES
};

class GamificationService {
  
  // Calculer le niveau basé sur l'XP total
  calculateLevel(totalXP) {
    if (totalXP < XP_CONFIG.LEVEL_BASE) return 1;
    
    let level = 1;
    let xpNeeded = XP_CONFIG.LEVEL_BASE;
    let currentXP = totalXP;
    
    while (currentXP >= xpNeeded) {
      currentXP -= xpNeeded;
      level++;
      xpNeeded = Math.floor(XP_CONFIG.LEVEL_BASE * Math.pow(XP_CONFIG.LEVEL_MULTIPLIER, level - 1));
    }
    
    return level;
  }
  
  // Calculer l'XP nécessaire pour le prochain niveau
  calculateXPForNextLevel(totalXP) {
    const currentLevel = this.calculateLevel(totalXP);
    const xpForCurrentLevel = this.calculateXPForLevel(currentLevel);
    const xpForNextLevel = this.calculateXPForLevel(currentLevel + 1);
    
    return {
      currentLevelXP: totalXP - xpForCurrentLevel,
      nextLevelXP: xpForNextLevel - xpForCurrentLevel,
      progressPercentage: Math.round(((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100)
    };
  }
  
  // Calculer l'XP total nécessaire pour un niveau donné
  calculateXPForLevel(level) {
    if (level <= 1) return 0;
    
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += Math.floor(XP_CONFIG.LEVEL_BASE * Math.pow(XP_CONFIG.LEVEL_MULTIPLIER, i - 1));
    }
    
    return totalXP;
  }
  
  // Calculer l'XP pour une tâche
  calculateTaskXP(difficulty, priority) {
    let baseXP = XP_CONFIG.TASK_BASE;
    
    // Multiplicateur de difficulté
    const difficultyMultipliers = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      expert: 3
    };
    
    baseXP *= difficultyMultipliers[difficulty] || 1;
    
    // Multiplicateur de priorité
    baseXP *= XP_CONFIG.PRIORITY_MULTIPLIERS[priority] || 1;
    
    return Math.round(baseXP);
  }
  
  // Attribuer de l'XP à un utilisateur
  async awardXP(userId, xpAmount, reason = '') {
    try {
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (!userStatsDoc.exists()) {
        await this.initializeUserStats(userId);
      }
      
      const currentStats = userStatsDoc.exists() ? userStatsDoc.data() : {};
      const currentXP = currentStats.totalXP || 0;
      const newTotalXP = currentXP + xpAmount;
      
      const oldLevel = this.calculateLevel(currentXP);
      const newLevel = this.calculateLevel(newTotalXP);
      const leveledUp = newLevel > oldLevel;
      
      // Mettre à jour les stats
      await updateDoc(userStatsRef, {
        totalXP: newTotalXP,
        level: newLevel,
        lastXPGain: {
          amount: xpAmount,
          reason,
          timestamp: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
      
      // Vérifier les badges automatiques
      await this.checkAutomaticBadges(userId);
      
      return {
        success: true,
        xpGained: xpAmount,
        totalXP: newTotalXP,
        leveledUp,
        newLevel,
        reason
      };
    } catch (error) {
      console.error('Erreur attribution XP:', error);
      throw error;
    }
  }
  
  // Attribuer un badge à un utilisateur
  async awardBadge(userId, badgeId, reason = '') {
    try {
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (!userStatsDoc.exists()) {
        await this.initializeUserStats(userId);
      }
      
      const currentStats = userStatsDoc.data();
      const currentBadges = currentStats.badges || [];
      
      // Vérifier si le badge existe déjà
      if (currentBadges.includes(badgeId)) {
        return { success: false, message: 'Badge déjà obtenu' };
      }
      
      // Vérifier si le badge existe
      const badge = ALL_BADGES[badgeId];
      if (!badge) {
        throw new Error(`Badge ${badgeId} non trouvé`);
      }
      
      // Ajouter le badge
      await updateDoc(userStatsRef, {
        badges: arrayUnion(badgeId),
        lastBadgeEarned: {
          badgeId,
          badge,
          reason,
          timestamp: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        badge,
        reason,
        message: `Badge "${badge.name}" obtenu !`
      };
    } catch (error) {
      console.error('Erreur attribution badge:', error);
      throw error;
    }
  }
  
  // Vérifier les badges automatiques
  async checkAutomaticBadges(userId) {
    try {
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (!userStatsDoc.exists()) return;
      
      const stats = userStatsDoc.data();
      const currentBadges = stats.badges || [];
      const badgesToAward = [];
      
      // Vérifier chaque badge système
      for (const [badgeId, badge] of Object.entries(SYSTEM_BADGES)) {
        if (currentBadges.includes(badgeId)) continue;
        
        let shouldAward = false;
        
        switch (badge.condition) {
          case 'first_login':
            shouldAward = true; // Déjà connecté donc premier login fait
            break;
            
          case 'complete_tasks':
            shouldAward = (stats.completedTasks || 0) >= badge.threshold;
            break;
            
          case 'total_xp':
            shouldAward = (stats.totalXP ||

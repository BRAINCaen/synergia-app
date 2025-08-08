// ==========================================
// 📁 react-app/src/shared/utils/xpCalculator.js
// CALCULATEUR XP POUR TÂCHES - FICHIER MANQUANT CRÉÉ
// ==========================================

/**
 * 🏆 CONFIGURATION XP DE BASE
 */
const XP_CONFIG = {
  // XP de base selon la difficulté
  difficulty: {
    easy: 15,
    normal: 20,
    medium: 25,
    hard: 40,
    expert: 60
  },
  
  // Multiplicateurs de priorité
  priority: {
    low: 1.0,
    medium: 1.2,
    high: 1.5,
    urgent: 2.0
  },
  
  // Multiplicateurs de récurrence
  recurrence: {
    none: 1.0,
    daily: 0.8,    // Moins car répétitif
    weekly: 1.0,   // Normal
    monthly: 1.5,  // Plus car espacé
    yearly: 3.0,   // Beaucoup plus car très espacé
    custom: 1.2    // Personnalisé
  }
};

/**
 * 🧮 FONCTION PRINCIPALE DE CALCUL XP
 * Calcule les XP d'une tâche selon sa difficulté, priorité et récurrence
 */
export const calculateXP = (difficulty = 'medium', priority = 'medium', recurrence = 'none') => {
  try {
    // Valeurs par défaut sécurisées
    const safeDifficulty = difficulty || 'medium';
    const safePriority = priority || 'medium';
    const safeRecurrence = recurrence || 'none';

    // XP de base selon la difficulté
    const baseXP = XP_CONFIG.difficulty[safeDifficulty] || XP_CONFIG.difficulty.medium;
    
    // Multiplicateur de priorité
    const priorityMultiplier = XP_CONFIG.priority[safePriority] || XP_CONFIG.priority.medium;
    
    // Multiplicateur de récurrence
    const recurrenceMultiplier = XP_CONFIG.recurrence[safeRecurrence] || XP_CONFIG.recurrence.none;
    
    // Calcul final
    const finalXP = Math.round(baseXP * priorityMultiplier * recurrenceMultiplier);
    
    // Assurer un minimum de 5 XP
    const result = Math.max(5, finalXP);
    
    console.log('🧮 Calcul XP:', {
      input: { difficulty: safeDifficulty, priority: safePriority, recurrence: safeRecurrence },
      baseXP,
      priorityMultiplier,
      recurrenceMultiplier,
      finalXP,
      result
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur calcul XP:', error);
    return 25; // Valeur par défaut en cas d'erreur
  }
};

/**
 * 🎯 CALCUL XP POUR DIFFÉRENTS TYPES D'ACTIONS
 */

// Calcul XP pour une tâche complète
export const calculateTaskXP = (taskData) => {
  if (!taskData) return 25;
  
  return calculateXP(
    taskData.difficulty || 'medium',
    taskData.priority || 'medium',
    taskData.recurrenceType || 'none'
  );
};

// Calcul XP pour une action simple
export const calculateActionXP = (actionType) => {
  const actionXP = {
    'daily_login': 5,
    'task_created': 3,
    'task_completed': 10,
    'project_created': 15,
    'project_completed': 50,
    'badge_earned': 25,
    'level_up': 100,
    'streak_bonus': 20,
    'collaboration': 15,
    'validation': 10,
    'mentoring': 30
  };
  
  return actionXP[actionType] || 5;
};

// Calcul XP pour les badges selon la rareté
export const calculateBadgeXP = (rarity = 'common') => {
  const rarityXP = {
    'common': 25,
    'uncommon': 50,
    'rare': 100,
    'epic': 200,
    'legendary': 500
  };
  
  return rarityXP[rarity] || 25;
};

/**
 * 📊 CALCULS AVANCÉS XP
 */

// Calcul avec bonus de collaboration
export const calculateCollaborativeXP = (baseXP, memberCount) => {
  if (memberCount <= 1) return baseXP;
  
  // Bonus de 10% par membre supplémentaire, plafonné à 50%
  const collaborationBonus = Math.min(0.5, (memberCount - 1) * 0.1);
  return Math.round(baseXP * (1 + collaborationBonus));
};

// Calcul avec bonus de streak (série)
export const calculateStreakXP = (baseXP, streakDays) => {
  if (streakDays <= 1) return baseXP;
  
  // Bonus de 5% par jour de streak, plafonné à 100%
  const streakBonus = Math.min(1.0, (streakDays - 1) * 0.05);
  return Math.round(baseXP * (1 + streakBonus));
};

// Calcul avec bonus de niveau utilisateur
export const calculateLevelBonusXP = (baseXP, userLevel) => {
  if (userLevel <= 1) return baseXP;
  
  // Bonus de 2% par niveau, plafonné à 50%
  const levelBonus = Math.min(0.5, (userLevel - 1) * 0.02);
  return Math.round(baseXP * (1 + levelBonus));
};

/**
 * 🔢 SYSTÈME DE NIVEAU BASÉ SUR L'XP
 */

// Calculer le niveau d'un utilisateur selon son XP total
export const calculateLevel = (totalXP) => {
  if (totalXP < 100) return 1;
  if (totalXP < 250) return 2;
  if (totalXP < 500) return 3;
  if (totalXP < 850) return 4;
  if (totalXP < 1300) return 5;
  if (totalXP < 1900) return 6;
  if (totalXP < 2600) return 7;
  if (totalXP < 3500) return 8;
  if (totalXP < 4600) return 9;
  if (totalXP < 6000) return 10;
  
  // Au-delà du niveau 10
  return Math.floor(10 + (totalXP - 6000) / 1000);
};

// Calculer l'XP nécessaire pour le prochain niveau
export const getXPForNextLevel = (currentLevel) => {
  const levelThresholds = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000];
  
  if (currentLevel < levelThresholds.length) {
    return levelThresholds[currentLevel];
  }
  
  // Au-delà du niveau 10
  return 6000 + (currentLevel - 10) * 1000;
};

// Calculer les progrès vers le prochain niveau
export const calculateLevelProgress = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = getXPForNextLevel(currentLevel - 1);
  const nextLevelXP = getXPForNextLevel(currentLevel);
  
  const progressXP = totalXP - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const percentage = Math.round((progressXP / neededXP) * 100);
  
  return {
    currentLevel,
    totalXP,
    progressXP,
    neededXP,
    percentage: Math.max(0, Math.min(100, percentage)),
    nextLevelXP
  };
};

/**
 * 🎮 FONCTIONS UTILITAIRES
 */

// Formater l'affichage des XP
export const formatXP = (xp) => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M XP`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K XP`;
  }
  return `${xp} XP`;
};

// Valider une valeur XP
export const validateXP = (xp) => {
  const numXP = Number(xp);
  return !isNaN(numXP) && numXP >= 0 && numXP <= 10000;
};

// Obtenir une description du niveau de difficulté
export const getDifficultyDescription = (difficulty) => {
  const descriptions = {
    easy: 'Tâche simple, accessible à tous',
    normal: 'Tâche standard, compétences de base requises',
    medium: 'Tâche modérée, expérience recommandée',
    hard: 'Tâche complexe, expertise nécessaire',
    expert: 'Tâche très complexe, niveau expert requis'
  };
  
  return descriptions[difficulty] || descriptions.medium;
};

// Obtenir une description du niveau de priorité
export const getPriorityDescription = (priority) => {
  const descriptions = {
    low: 'Peut être traitée quand vous avez du temps',
    medium: 'À traiter dans les délais normaux',
    high: 'Importante, à traiter rapidement',
    urgent: 'Critique, à traiter immédiatement'
  };
  
  return descriptions[priority] || descriptions.medium;
};

/**
 * 📈 ANALYTICS ET STATISTIQUES XP
 */

// Calculer les XP moyens par jour
export const calculateDailyAverageXP = (totalXP, daysSinceStart) => {
  if (daysSinceStart <= 0) return 0;
  return Math.round(totalXP / daysSinceStart);
};

// Prédire les XP futurs
export const predictFutureXP = (currentXP, dailyAverage, days) => {
  return currentXP + (dailyAverage * days);
};

// Calculer le classement approximatif
export const estimateRanking = (userXP, totalUsers = 100) => {
  // Estimation basée sur une distribution normale
  const averageXP = 1000; // XP moyen estimé
  const standardDeviation = 500;
  
  const zScore = (userXP - averageXP) / standardDeviation;
  const percentile = (1 + erf(zScore / Math.sqrt(2))) / 2;
  
  return Math.max(1, Math.round(totalUsers * (1 - percentile)));
};

// Fonction d'erreur approximative pour le calcul de percentile
function erf(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}

/**
 * 🛡️ EXPORT PAR DÉFAUT ET NAMED EXPORTS
 */
export default calculateXP;

// Exporter la configuration pour les tests
export { XP_CONFIG };

// Exporter les constantes utiles
export const XP_CONSTANTS = {
  MIN_XP: 5,
  MAX_XP: 10000,
  DEFAULT_XP: 25,
  MAX_LEVEL: 100
};

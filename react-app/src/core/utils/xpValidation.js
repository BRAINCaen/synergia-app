// ==========================================
// 📁 react-app/src/core/utils/xpValidation.js
// UTILITAIRE DE VALIDATION DES DONNÉES XP
// ==========================================

/**
 * 🔍 VALIDER ET CORRIGER LES DONNÉES XP
 * 
 * RÈGLES DE VALIDATION :
 * - weeklyXp NE PEUT JAMAIS dépasser totalXp
 * - monthlyXp NE PEUT JAMAIS dépasser totalXp  
 * - Les valeurs négatives sont impossibles
 * - Le niveau doit correspondre à l'XP total (100 XP par niveau)
 * 
 * @param {Object} gamificationData - Données brutes de gamification depuis Firebase
 * @returns {Object} - Données validées et corrigées
 */
export const validateAndFixXPData = (gamificationData) => {
  if (!gamificationData) {
    return {
      totalXp: 0,
      level: 1,
      weeklyXp: 0,
      monthlyXp: 0,
      badges: 0,
      streak: 1,
      progressToNext: 0,
      xpForNextLevel: 100,
      tasksCompleted: 0,
      projectsCreated: 0,
      completionRate: 0,
      consecutiveDays: 1
    };
  }

  // 📊 RÉCUPÉRATION DES DONNÉES BRUTES
  const totalXp = Math.max(0, gamificationData.totalXp || 0);
  const rawWeeklyXp = Math.max(0, gamificationData.weeklyXp || 0);
  const rawMonthlyXp = Math.max(0, gamificationData.monthlyXp || 0);
  
  // ✅ VALIDATION ET CORRECTION AUTOMATIQUE
  // Les XP hebdomadaires/mensuels ne peuvent JAMAIS dépasser l'XP total
  const weeklyXp = Math.min(rawWeeklyXp, totalXp);
  const monthlyXp = Math.min(rawMonthlyXp, totalXp);
  
  // 🎯 CALCUL DU NIVEAU CORRECT
  // Formule: 100 XP par niveau, donc niveau = floor(totalXp / 100) + 1
  const correctLevel = Math.floor(totalXp / 100) + 1;
  
  // 📈 CALCUL DE LA PROGRESSION
  const currentLevelXp = totalXp % 100; // XP dans le niveau actuel
  const xpForNextLevel = 100; // Toujours 100 XP pour passer au niveau suivant
  const progressToNext = Math.round((currentLevelXp / xpForNextLevel) * 100);
  
  // 🏆 AUTRES STATISTIQUES
  const tasksCompleted = Math.max(0, gamificationData.tasksCompleted || 0);
  const tasksCreated = Math.max(0, gamificationData.tasksCreated || 0);
  const projectsCreated = Math.max(0, gamificationData.projectsCreated || 0);
  const badges = Array.isArray(gamificationData.badges) ? gamificationData.badges.length : 0;
  const streak = Math.max(1, gamificationData.loginStreak || 1);
  const consecutiveDays = Math.max(1, gamificationData.currentStreak || 1);
  
  // 📊 TAUX DE COMPLÉTION
  const completionRate = tasksCreated > 0 
    ? Math.round((tasksCompleted / tasksCreated) * 100) 
    : 0;

  // 🚨 LOGGING DES CORRECTIONS (si nécessaire)
  if (rawWeeklyXp > totalXp) {
    console.warn(`⚠️ [XP VALIDATION] weeklyXp corrigé: ${rawWeeklyXp} → ${weeklyXp} (ne peut pas dépasser totalXp: ${totalXp})`);
  }
  
  if (rawMonthlyXp > totalXp) {
    console.warn(`⚠️ [XP VALIDATION] monthlyXp corrigé: ${rawMonthlyXp} → ${monthlyXp} (ne peut pas dépasser totalXp: ${totalXp})`);
  }
  
  if (gamificationData.level && gamificationData.level !== correctLevel) {
    console.warn(`⚠️ [XP VALIDATION] Niveau corrigé: ${gamificationData.level} → ${correctLevel} (basé sur ${totalXp} XP)`);
  }

  // ✅ RETOUR DES DONNÉES VALIDÉES ET CORRIGÉES
  return {
    // Données de base (corrigées)
    totalXp,
    weeklyXp,
    monthlyXp,
    level: correctLevel,
    
    // Progression
    progressToNext,
    xpForNextLevel,
    currentLevelXp,
    xpToNextLevel: xpForNextLevel - currentLevelXp,
    
    // Statistiques
    badges,
    streak,
    consecutiveDays,
    tasksCompleted,
    projectsCreated,
    completionRate,
    tasksCreated,
    
    // Métadonnées
    lastActivityAt: gamificationData.lastActivityAt,
    badgesArray: gamificationData.badges || [],
    xpHistory: gamificationData.xpHistory || []
  };
};

/**
 * 🔄 RÉINITIALISER LES XP PÉRIODIQUES (À APPELER PAR UN CRON)
 * 
 * Cette fonction devrait être appelée:
 * - Chaque lundi à minuit pour weeklyXp
 * - Chaque 1er du mois à minuit pour monthlyXp
 * 
 * @param {Object} userGamificationData - Données de gamification de l'utilisateur
 * @param {string} period - 'weekly' ou 'monthly'
 * @returns {Object} - Mises à jour à appliquer dans Firebase
 */
export const resetPeriodicXP = (userGamificationData, period = 'weekly') => {
  const updates = {};
  
  if (period === 'weekly') {
    updates['gamification.weeklyXp'] = 0;
    console.log('📅 Réinitialisation weeklyXp pour nouvelle semaine');
  } else if (period === 'monthly') {
    updates['gamification.monthlyXp'] = 0;
    console.log('📅 Réinitialisation monthlyXp pour nouveau mois');
  }
  
  updates['gamification.lastPeriodReset'] = new Date().toISOString();
  
  return updates;
};

/**
 * 📊 CALCULER LES STATISTIQUES DÉRIVÉES
 * 
 * @param {Object} validatedData - Données XP validées
 * @returns {Object} - Statistiques calculées
 */
export const calculateXPStats = (validatedData) => {
  return {
    // Moyennes
    weeklyAverage: Math.round(validatedData.weeklyXp / 7),
    monthlyAverage: Math.round(validatedData.monthlyXp / 30),
    dailyAverage: Math.round(validatedData.totalXp / Math.max(1, validatedData.consecutiveDays)),
    
    // Projections
    xpPerTask: validatedData.tasksCompleted > 0 
      ? Math.round(validatedData.totalXp / validatedData.tasksCompleted) 
      : 0,
    tasksToNextLevel: validatedData.xpPerTask > 0 
      ? Math.ceil(validatedData.xpToNextLevel / validatedData.xpPerTask) 
      : 0,
    
    // Taux et pourcentages
    completionRate: validatedData.completionRate,
    levelProgressPercent: validatedData.progressToNext,
    
    // Classement virtuel (basé sur totalXp)
    estimatedRank: `Top ${Math.min(100, Math.ceil(validatedData.level * 10))}%`
  };
};

/**
 * 🚨 VÉRIFIER LA COHÉRENCE DES DONNÉES
 * 
 * @param {Object} gamificationData - Données de gamification
 * @returns {Array} - Liste des problèmes détectés
 */
export const checkDataIntegrity = (gamificationData) => {
  const issues = [];
  
  if (!gamificationData) {
    issues.push('Données de gamification manquantes');
    return issues;
  }
  
  const totalXp = gamificationData.totalXp || 0;
  const weeklyXp = gamificationData.weeklyXp || 0;
  const monthlyXp = gamificationData.monthlyXp || 0;
  const level = gamificationData.level || 1;
  const expectedLevel = Math.floor(totalXp / 100) + 1;
  
  // Vérifications
  if (weeklyXp > totalXp) {
    issues.push(`weeklyXp (${weeklyXp}) dépasse totalXp (${totalXp})`);
  }
  
  if (monthlyXp > totalXp) {
    issues.push(`monthlyXp (${monthlyXp}) dépasse totalXp (${totalXp})`);
  }
  
  if (level !== expectedLevel) {
    issues.push(`Niveau incorrect: ${level} au lieu de ${expectedLevel}`);
  }
  
  if (totalXp < 0) {
    issues.push(`totalXp négatif: ${totalXp}`);
  }
  
  return issues;
};

export default validateAndFixXPData;

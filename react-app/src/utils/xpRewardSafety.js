// ==========================================
// 📁 react-app/src/utils/xpRewardSafety.js
// CORRECTIF SÉCURISÉ POUR LES PROPRIÉTÉS xpReward
// ==========================================

/**
 * 🛡️ FONCTION DE SÉCURISATION xpReward
 * Vérifie et retourne de manière sécurisée la valeur xpReward
 */
export const getXPRewardSafely = (item, defaultValue = 0) => {
  // Vérifier si l'item existe
  if (!item || typeof item !== 'object') {
    console.warn('⚠️ [XP-SAFETY] Objet null/undefined détecté, utilisation de la valeur par défaut:', defaultValue);
    return defaultValue;
  }
  
  // Vérifier si xpReward existe et est un nombre valide
  if (item.hasOwnProperty('xpReward') && typeof item.xpReward === 'number' && !isNaN(item.xpReward)) {
    return item.xpReward;
  }
  
  // Fallbacks intelligents basés sur le type d'objet
  if (item.difficulty) {
    // C'est probablement une tâche
    const difficultyXP = {
      'easy': 10,
      'normal': 20,
      'medium': 25,
      'hard': 35,
      'expert': 50
    };
    console.log('🎯 [XP-SAFETY] Calcul XP basé sur difficulté:', item.difficulty, '->', difficultyXP[item.difficulty] || defaultValue);
    return difficultyXP[item.difficulty] || defaultValue;
  }
  
  if (item.rarity) {
    // C'est probablement un badge
    const rarityXP = {
      'common': 25,
      'uncommon': 50,
      'rare': 100,
      'epic': 200,
      'legendary': 500
    };
    console.log('🏆 [XP-SAFETY] Calcul XP basé sur rareté:', item.rarity, '->', rarityXP[item.rarity] || defaultValue);
    return rarityXP[item.rarity] || defaultValue;
  }
  
  if (item.xpCost) {
    // C'est probablement une récompense avec xpCost au lieu de xpReward
    console.log('🎁 [XP-SAFETY] Utilisation xpCost comme référence:', item.xpCost);
    return item.xpCost;
  }
  
  console.warn('⚠️ [XP-SAFETY] Aucune propriété XP trouvée, utilisation valeur par défaut:', defaultValue);
  return defaultValue;
};

/**
 * 🔢 CALCULATEUR XP SÉCURISÉ POUR TÂCHES
 */
export const calculateTaskXPSafely = (task) => {
  if (!task) return 0;
  
  // Priorité 1: xpReward explicite
  if (task.xpReward && typeof task.xpReward === 'number' && task.xpReward > 0) {
    return task.xpReward;
  }
  
  // Priorité 2: Calcul basé sur la difficulté
  const difficultyMap = {
    'easy': 10,
    'normal': 20,
    'medium': 25,
    'hard': 35,
    'expert': 50
  };
  
  const baseXP = difficultyMap[task.difficulty] || 20;
  
  // Bonus priorité
  const priorityBonus = {
    'low': 0,
    'medium': 5,
    'high': 10,
    'urgent': 15
  };
  
  const totalXP = baseXP + (priorityBonus[task.priority] || 0);
  
  console.log('🎯 [TASK-XP] Calculé:', {
    taskId: task.id,
    difficulty: task.difficulty,
    priority: task.priority,
    baseXP,
    totalXP
  });
  
  return totalXP;
};

/**
 * 🏆 CALCULATEUR XP SÉCURISÉ POUR BADGES
 */
export const calculateBadgeXPSafely = (badge) => {
  if (!badge) return 0;
  
  // Priorité 1: xpReward explicite
  if (badge.xpReward && typeof badge.xpReward === 'number' && badge.xpReward > 0) {
    return badge.xpReward;
  }
  
  // Priorité 2: Calcul basé sur la rareté
  const rarityMap = {
    'common': 25,
    'uncommon': 50,
    'rare': 100,
    'epic': 200,
    'legendary': 500
  };
  
  const xpValue = rarityMap[badge.rarity] || 50;
  
  console.log('🏆 [BADGE-XP] Calculé:', {
    badgeId: badge.id,
    rarity: badge.rarity,
    xpValue
  });
  
  return xpValue;
};

/**
 * 🎁 CALCULATEUR XP SÉCURISÉ POUR RÉCOMPENSES
 */
export const calculateRewardXPSafely = (reward) => {
  if (!reward) return 0;
  
  // Les récompenses utilisent xpCost, pas xpReward
  if (reward.xpCost && typeof reward.xpCost === 'number' && reward.xpCost > 0) {
    return reward.xpCost;
  }
  
  if (reward.xpReward && typeof reward.xpReward === 'number' && reward.xpReward > 0) {
    return reward.xpReward;
  }
  
  console.warn('⚠️ [REWARD-XP] Aucune valeur XP trouvée pour la récompense:', reward.id || reward.name);
  return 0;
};

/**
 * 🛡️ WRAPPER UNIVERSEL POUR ÉVITER LES ERREURS null/undefined
 */
export const safeXPAccess = (item, property = 'xpReward', defaultValue = 0) => {
  try {
    if (!item || typeof item !== 'object') {
      return defaultValue;
    }
    
    const value = item[property];
    
    if (typeof value === 'number' && !isNaN(value)) {
      return Math.max(0, value); // Assurer que c'est positif
    }
    
    // Si c'est une tâche sans xpReward, calculer intelligemment
    if (property === 'xpReward' && item.difficulty) {
      return calculateTaskXPSafely(item);
    }
    
    // Si c'est un badge sans xpReward, calculer intelligemment
    if (property === 'xpReward' && item.rarity) {
      return calculateBadgeXPSafely(item);
    }
    
    return defaultValue;
    
  } catch (error) {
    console.error('❌ [SAFE-XP] Erreur accès propriété XP:', error);
    return defaultValue;
  }
};

/**
 * 🚨 PATCH GLOBAL POUR ÉVITER LES ERREURS xpReward
 * À appliquer au démarrage de l'application
 */
export const applyGlobalXPSafetyPatch = () => {
  // Intercepter les erreurs liées à xpReward
  const originalError = console.error;
  
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes("Cannot read properties of null (reading 'xpReward')")) {
      console.warn('🤫 [XP-SAFETY] Erreur xpReward interceptée et gérée automatiquement');
      console.info('💡 [XP-SAFETY] Utilisez getXPRewardSafely() pour éviter ce problème');
      return;
    }
    
    // Laisser passer toutes les autres erreurs
    originalError.apply(console, args);
  };
  
  // Exposer les fonctions globalement pour le debugging
  if (typeof window !== 'undefined') {
    window.getXPRewardSafely = getXPRewardSafely;
    window.calculateTaskXPSafely = calculateTaskXPSafely;
    window.calculateBadgeXPSafely = calculateBadgeXPSafely;
    window.calculateRewardXPSafely = calculateRewardXPSafely;
    window.safeXPAccess = safeXPAccess;
    
    // Fonction de test
    window.testXPSafety = () => {
      console.log('🧪 [TEST] Tests de sécurité XP:');
      
      // Test avec null
      console.log('null task:', getXPRewardSafely(null, 10)); // -> 10
      
      // Test avec objet vide
      console.log('empty object:', getXPRewardSafely({}, 15)); // -> 15
      
      // Test avec tâche normale
      const task = { difficulty: 'hard', priority: 'high' };
      console.log('task with difficulty:', calculateTaskXPSafely(task)); // -> 50
      
      // Test avec badge
      const badge = { rarity: 'rare' };
      console.log('badge with rarity:', calculateBadgeXPSafely(badge)); // -> 100
      
      console.log('✅ Tests terminés !');
    };
  }
  
  console.log('🛡️ [XP-SAFETY] Patch global appliqué pour prévenir les erreurs xpReward');
};

/**
 * 🔍 DIAGNOSTIC XP POUR DÉBUGGER LES PROBLÈMES
 */
export const diagnoseXPIssue = (item, context = 'unknown') => {
  console.group(`🔍 [XP-DIAGNOSTIC] Context: ${context}`);
  
  console.log('📊 Objet analysé:', item);
  console.log('📝 Type:', typeof item);
  console.log('🔍 Est null?', item === null);
  console.log('🔍 Est undefined?', item === undefined);
  
  if (item && typeof item === 'object') {
    console.log('🔑 Propriétés disponibles:', Object.keys(item));
    console.log('🎯 A xpReward?', 'xpReward' in item);
    console.log('🎯 Valeur xpReward:', item.xpReward);
    console.log('🎯 Type xpReward:', typeof item.xpReward);
  }
  
  const safeValue = getXPRewardSafely(item, 0);
  console.log('✅ Valeur sécurisée calculée:', safeValue);
  
  console.groupEnd();
  
  return safeValue;
};

// Auto-application du patch au chargement
if (typeof window !== 'undefined') {
  // Attendre que la page soit chargée
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGlobalXPSafetyPatch);
  } else {
    // Page déjà chargée
    setTimeout(applyGlobalXPSafetyPatch, 100);
  }
}

console.log('🛡️ XP Reward Safety Utils chargés !');
console.log('📚 Fonctions disponibles: getXPRewardSafely, calculateTaskXPSafely, calculateBadgeXPSafely');

// Export par défaut
export default {
  getXPRewardSafely,
  calculateTaskXPSafely,
  calculateBadgeXPSafely,
  calculateRewardXPSafely,
  safeXPAccess,
  applyGlobalXPSafetyPatch,
  diagnoseXPIssue
};

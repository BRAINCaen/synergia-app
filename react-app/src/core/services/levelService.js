// ==========================================
// 📁 react-app/src/core/services/levelService.js
// SERVICE NIVEAUX & RANGS - SYNERGIA v4.0 - MODULE 4
// Formule calibrée pour progression sur 2+ ans
// ==========================================

import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎖️ SYSTÈME DE RANGS
 * Chaque rang représente un palier de progression
 */
export const RANKS = {
  apprenti: {
    id: 'apprenti',
    name: 'Apprenti',
    icon: '🌱',
    color: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-300',
    minLevel: 1,
    maxLevel: 4,
    description: 'Nouveau membre de la guilde',
    perks: ['Accès aux quêtes de base']
  },
  initie: {
    id: 'initie',
    name: 'Initié',
    icon: '⚔️',
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-400',
    minLevel: 5,
    maxLevel: 9,
    description: 'A prouvé sa valeur',
    perks: ['Peut créer des défis', 'Badge Initié']
  },
  aventurier: {
    id: 'aventurier',
    name: 'Aventurier',
    icon: '🏹',
    color: 'from-blue-500 to-cyan-600',
    textColor: 'text-blue-400',
    minLevel: 10,
    maxLevel: 14,
    description: 'Membre confirmé de la guilde',
    perks: ['Quêtes avancées', 'Boost x1.1', 'Badge Aventurier']
  },
  heros: {
    id: 'heros',
    name: 'Héros',
    icon: '🛡️',
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-400',
    minLevel: 15,
    maxLevel: 19,
    description: 'Reconnu pour ses exploits',
    perks: ['Mentor de nouveaux membres', 'Boost x1.2', 'Badge Héros']
  },
  champion: {
    id: 'champion',
    name: 'Champion',
    icon: '🏆',
    color: 'from-yellow-500 to-orange-600',
    textColor: 'text-yellow-400',
    minLevel: 20,
    maxLevel: 29,
    description: 'Pilier de la guilde',
    perks: ['Campagnes exclusives', 'Boost x1.3', 'Badge Champion']
  },
  maitre: {
    id: 'maitre',
    name: 'Maître',
    icon: '👑',
    color: 'from-orange-500 to-red-600',
    textColor: 'text-orange-400',
    minLevel: 30,
    maxLevel: 39,
    description: 'Expert reconnu',
    perks: ['Valider les défis', 'Boost x1.5', 'Badge Maître']
  },
  legende: {
    id: 'legende',
    name: 'Légende',
    icon: '✨',
    color: 'from-pink-500 to-rose-600',
    textColor: 'text-pink-400',
    minLevel: 40,
    maxLevel: 49,
    description: 'Nom gravé dans l\'histoire',
    perks: ['Récompenses légendaires', 'Boost x1.75', 'Badge Légende']
  },
  immortel: {
    id: 'immortel',
    name: 'Immortel',
    icon: '🌟',
    color: 'from-amber-400 via-yellow-500 to-amber-600',
    textColor: 'text-amber-400',
    minLevel: 50,
    maxLevel: 999,
    description: 'A transcendé tous les défis',
    perks: ['Statut spécial', 'Boost x2.0', 'Badge Immortel', 'Profil doré']
  }
};

/**
 * 📊 CONFIGURATION DU SYSTÈME DE NIVEAUX - CALIBRÉ POUR ~1000 XP/MOIS
 * Formule: XP requis = BASE * niveau^EXPOSANT
 *
 * OBJECTIF: Progression challengeante mais motivante
 * - Niveau 10 = ~1 an
 * - Niveau 20 = ~4-5 ans
 * - Niveau 50 = Quasi-impossible (30+ ans)
 */
const LEVEL_CONFIG = {
  BASE_XP: 150,           // XP de base pour niveau 2
  EXPONENT: 2.0,          // Exposant quadratique
  MAX_LEVEL: 100          // Niveau maximum théorique
};

/**
 * 🧮 Calculer le niveau basé sur l'XP total
 * Formule inversée: niveau = floor((totalXP / BASE)^(1/EXPOSANT)) + 1
 *
 * Exemples avec calibration (~1000 XP/mois):
 * - Niveau 5:  ~2,400 XP (~2.5 mois)
 * - Niveau 10: ~12,000 XP (~1 an)
 * - Niveau 15: ~29,000 XP (~2.5 ans)
 * - Niveau 20: ~54,000 XP (~4.5 ans)
 * - Niveau 30: ~126,000 XP (~10.5 ans)
 * - Niveau 50: ~360,000 XP (~30 ans - LÉGENDAIRE)
 */
export const calculateLevel = (totalXP) => {
  if (!totalXP || totalXP <= 0) return 1;

  const { BASE_XP, EXPONENT } = LEVEL_CONFIG;
  const level = Math.floor(Math.pow(totalXP / BASE_XP, 1 / EXPONENT)) + 1;

  return Math.min(level, LEVEL_CONFIG.MAX_LEVEL);
};

/**
 * 📈 Calculer l'XP requis pour atteindre un niveau
 * Formule: XP = BASE * (niveau - 1)^EXPOSANT
 */
export const getXPForLevel = (level) => {
  if (level <= 1) return 0;

  const { BASE_XP, EXPONENT } = LEVEL_CONFIG;
  return Math.floor(BASE_XP * Math.pow(level - 1, EXPONENT));
};

/**
 * 📊 Calculer la progression vers le prochain niveau
 * @returns {Object} { currentXP, xpForCurrentLevel, xpForNextLevel, progress, xpNeeded }
 */
export const getLevelProgress = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);

  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpRequiredForNext = xpForNextLevel - xpForCurrentLevel;

  const progress = Math.min((xpInCurrentLevel / xpRequiredForNext) * 100, 100);
  const xpNeeded = xpForNextLevel - totalXP;

  return {
    currentLevel,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpInCurrentLevel,
    xpRequiredForNext,
    progress: Math.round(progress * 100) / 100,
    xpNeeded: Math.max(0, xpNeeded)
  };
};

/**
 * 🎖️ Obtenir le rang basé sur le niveau
 */
export const getRankForLevel = (level) => {
  const ranks = Object.values(RANKS);

  for (const rank of ranks) {
    if (level >= rank.minLevel && level <= rank.maxLevel) {
      return rank;
    }
  }

  return RANKS.apprenti;
};

/**
 * 🎖️ Obtenir le rang basé sur l'XP total
 */
export const getRankForXP = (totalXP) => {
  const level = calculateLevel(totalXP);
  return getRankForLevel(level);
};

/**
 * 🎯 Obtenir le prochain rang
 */
export const getNextRank = (currentRank) => {
  const rankOrder = ['apprenti', 'initie', 'aventurier', 'heros', 'champion', 'maitre', 'legende', 'immortel'];
  const currentIndex = rankOrder.indexOf(currentRank?.id || 'apprenti');

  if (currentIndex < rankOrder.length - 1) {
    return RANKS[rankOrder[currentIndex + 1]];
  }

  return null; // Déjà au rang max
};

/**
 * 📊 Obtenir les informations complètes de progression
 */
export const getFullProgressInfo = (totalXP) => {
  const levelProgress = getLevelProgress(totalXP);
  const currentRank = getRankForLevel(levelProgress.currentLevel);
  const nextRank = getNextRank(currentRank);

  // Calculer la progression vers le prochain rang
  let rankProgress = 100;
  let xpToNextRank = 0;

  if (nextRank) {
    const xpForNextRank = getXPForLevel(nextRank.minLevel);
    xpToNextRank = xpForNextRank - totalXP;

    const xpForCurrentRankStart = getXPForLevel(currentRank.minLevel);
    const totalXpForRank = xpForNextRank - xpForCurrentRankStart;
    const xpInRank = totalXP - xpForCurrentRankStart;

    rankProgress = Math.min((xpInRank / totalXpForRank) * 100, 100);
  }

  return {
    ...levelProgress,
    currentRank,
    nextRank,
    rankProgress: Math.round(rankProgress * 100) / 100,
    xpToNextRank: Math.max(0, xpToNextRank),
    levelsToNextRank: nextRank ? nextRank.minLevel - levelProgress.currentLevel : 0
  };
};

/**
 * 📋 Générer la grille de niveaux (pour affichage)
 */
export const generateLevelGrid = (maxLevel = 50) => {
  const grid = [];

  for (let level = 1; level <= maxLevel; level++) {
    const xpRequired = getXPForLevel(level);
    const rank = getRankForLevel(level);
    const xpToNext = getXPForLevel(level + 1) - xpRequired;

    grid.push({
      level,
      xpRequired,
      xpToNext,
      rank: rank.name,
      rankIcon: rank.icon
    });
  }

  return grid;
};

/**
 * 🔄 SERVICE DE MISE À JOUR DES NIVEAUX
 */
class LevelService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Mettre à jour le niveau d'un utilisateur
   */
  async updateUserLevel(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.warn('❌ [LEVEL] Utilisateur non trouvé:', userId);
        return null;
      }

      const userData = userDoc.data();
      const totalXP = userData.gamification?.totalXp || userData.totalXp || 0;

      // Calculer le nouveau niveau avec la nouvelle formule
      const newLevel = calculateLevel(totalXP);
      const oldLevel = userData.gamification?.level || userData.level || 1;

      // Obtenir le rang
      const rank = getRankForLevel(newLevel);

      // Mettre à jour si le niveau a changé
      if (newLevel !== oldLevel) {
        await updateDoc(userRef, {
          'gamification.level': newLevel,
          'gamification.rank': rank.id,
          'gamification.rankName': rank.name,
          'gamification.rankIcon': rank.icon,
          'gamification.levelUpdatedAt': serverTimestamp()
        });

        console.log(`🎉 [LEVEL] ${userId}: Niveau ${oldLevel} → ${newLevel} (${rank.name})`);

        // Émettre un événement si level up
        if (newLevel > oldLevel && typeof window !== 'undefined') {
          const event = new CustomEvent('userLevelUp', {
            detail: {
              userId,
              oldLevel,
              newLevel,
              rank: rank.id,
              rankName: rank.name
            }
          });
          window.dispatchEvent(event);
        }

        return {
          leveledUp: newLevel > oldLevel,
          oldLevel,
          newLevel,
          rank
        };
      }

      return {
        leveledUp: false,
        oldLevel,
        newLevel,
        rank
      };

    } catch (error) {
      console.error('❌ [LEVEL] Erreur mise à jour niveau:', error);
      throw error;
    }
  }

  /**
   * Récupérer les données de niveau d'un utilisateur
   */
  async getUserLevelData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return this.getDefaultLevelData();
      }

      const userData = userDoc.data();
      const totalXP = userData.gamification?.totalXp || userData.totalXp || 0;

      return getFullProgressInfo(totalXP);

    } catch (error) {
      console.error('❌ [LEVEL] Erreur récupération données:', error);
      return this.getDefaultLevelData();
    }
  }

  /**
   * Données par défaut
   */
  getDefaultLevelData() {
    return getFullProgressInfo(0);
  }

  /**
   * Migrer tous les utilisateurs vers la nouvelle formule
   */
  async migrateAllUsersToNewFormula() {
    console.log('🔄 [LEVEL] Migration vers nouvelle formule...');
    // Cette méthode serait appelée une fois pour recalculer tous les niveaux
    // Implémentation à faire via une Cloud Function ou script admin
  }
}

// Singleton
export const levelService = new LevelService();

// ==========================================
// 📊 TABLE DE RÉFÉRENCE DES NIVEAUX
// ==========================================
/**
 * Niveau | XP Requis | Rang        | Temps estimé (~1000 XP/mois)
 * -------|-----------|-------------|------------------------------
 *   1    |       0   | Apprenti    | Départ
 *   2    |     150   | Apprenti    | ~1 semaine
 *   3    |     600   | Apprenti    | ~3 semaines
 *   5    |   2,400   | Initié      | ~2.5 mois
 *  10    |  12,150   | Aventurier  | ~1 an
 *  15    |  29,400   | Héros       | ~2.5 ans
 *  20    |  54,150   | Champion    | ~4.5 ans
 *  30    | 126,150   | Maître      | ~10.5 ans
 *  40    | 228,150   | Légende     | ~19 ans
 *  50    | 360,150   | Immortel    | ~30 ans (LÉGENDAIRE!)
 *
 * NOTE: Atteindre Immortel est un exploit quasi-impossible!
 */

export default levelService;

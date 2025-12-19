// ==========================================
// react-app/src/core/services/levelService.js
// SERVICE NIVEAUX & RANGS - SYNERGIA v5.0
// Formule calibrée: 30 niveaux/an, max 100 niveaux
// Rangs configurables par admin via Firebase
// ==========================================

import { doc, updateDoc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎖️ RANGS PAR DÉFAUT (utilisés si pas de config Firebase)
 * Configurables par admin via /admin/ranks
 */
export const DEFAULT_RANKS = {
  apprenti: {
    id: 'apprenti',
    name: 'Apprenti',
    icon: '🌱',
    color: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-300',
    minLevel: 1,
    maxLevel: 9,
    description: 'Nouveau membre de la guilde',
    perks: ['Accès aux quêtes de base'],
    boost: 1.0
  },
  initie: {
    id: 'initie',
    name: 'Initié',
    icon: '⚔️',
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-400',
    minLevel: 10,
    maxLevel: 19,
    description: 'A prouvé sa valeur',
    perks: ['Peut créer des défis', 'Badge Initié'],
    boost: 1.05
  },
  aventurier: {
    id: 'aventurier',
    name: 'Aventurier',
    icon: '🏹',
    color: 'from-blue-500 to-cyan-600',
    textColor: 'text-blue-400',
    minLevel: 20,
    maxLevel: 29,
    description: 'Membre confirmé de la guilde',
    perks: ['Quêtes avancées', 'Boost x1.1', 'Badge Aventurier'],
    boost: 1.1
  },
  heros: {
    id: 'heros',
    name: 'Héros',
    icon: '🛡️',
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-400',
    minLevel: 30,
    maxLevel: 44,
    description: 'Reconnu pour ses exploits',
    perks: ['Mentor de nouveaux membres', 'Boost x1.15', 'Badge Héros'],
    boost: 1.15
  },
  champion: {
    id: 'champion',
    name: 'Champion',
    icon: '🏆',
    color: 'from-yellow-500 to-orange-600',
    textColor: 'text-yellow-400',
    minLevel: 45,
    maxLevel: 59,
    description: 'Pilier de la guilde',
    perks: ['Campagnes exclusives', 'Boost x1.2', 'Badge Champion'],
    boost: 1.2
  },
  maitre: {
    id: 'maitre',
    name: 'Maître',
    icon: '👑',
    color: 'from-orange-500 to-red-600',
    textColor: 'text-orange-400',
    minLevel: 60,
    maxLevel: 74,
    description: 'Expert reconnu',
    perks: ['Valider les défis', 'Boost x1.3', 'Badge Maître'],
    boost: 1.3
  },
  legende: {
    id: 'legende',
    name: 'Légende',
    icon: '✨',
    color: 'from-pink-500 to-rose-600',
    textColor: 'text-pink-400',
    minLevel: 75,
    maxLevel: 89,
    description: 'Nom gravé dans l\'histoire',
    perks: ['Récompenses légendaires', 'Boost x1.5', 'Badge Légende'],
    boost: 1.5
  },
  immortel: {
    id: 'immortel',
    name: 'Immortel',
    icon: '🌟',
    color: 'from-amber-400 via-yellow-500 to-amber-600',
    textColor: 'text-amber-400',
    minLevel: 90,
    maxLevel: 99,
    description: 'A transcendé tous les défis',
    perks: ['Statut spécial', 'Boost x1.75', 'Badge Immortel', 'Profil doré'],
    boost: 1.75
  },
  transcendant: {
    id: 'transcendant',
    name: 'Transcendant',
    icon: '💎',
    color: 'from-cyan-400 via-blue-500 to-purple-600',
    textColor: 'text-cyan-300',
    minLevel: 100,
    maxLevel: 100,
    description: 'Le sommet absolu - Maître parmi les Maîtres',
    perks: ['Tous les privilèges', 'Boost x2.0', 'Badge Transcendant', 'Aura spéciale'],
    boost: 2.0
  }
};

// Cache local des rangs (chargés depuis Firebase ou défauts)
let cachedRanks = { ...DEFAULT_RANKS };
let ranksLoaded = false;
let ranksListener = null;

/**
 * 📊 CONFIGURATION DU SYSTÈME DE NIVEAUX
 * Formule linéaire: XP = 500 × (niveau - 1)
 *
 * Objectif: ~30 niveaux/an avec 1000-1500 XP/mois
 * - Niveau 30: ~1 an
 * - Niveau 60: ~2 ans
 * - Niveau 90: ~3 ans
 * - Niveau 100: ~3.3 ans (max réaliste)
 */
const LEVEL_CONFIG = {
  XP_PER_LEVEL: 500,    // XP fixe par niveau
  MAX_LEVEL: 100        // Niveau maximum
};

/**
 * 🧮 Calculer le niveau basé sur l'XP total
 * Formule: niveau = floor(totalXP / 500) + 1
 *
 * Exemples (~1250 XP/mois = 30 niveaux/an):
 * - Niveau 10:  4,500 XP (~3-4 mois)
 * - Niveau 30: 14,500 XP (~1 an)
 * - Niveau 60: 29,500 XP (~2 ans)
 * - Niveau 90: 44,500 XP (~3 ans)
 * - Niveau 100: 49,500 XP (~3.3 ans)
 */
export const calculateLevel = (totalXP) => {
  if (!totalXP || totalXP <= 0) return 1;

  const { XP_PER_LEVEL, MAX_LEVEL } = LEVEL_CONFIG;
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;

  return Math.min(level, MAX_LEVEL);
};

/**
 * 📈 Calculer l'XP requis pour atteindre un niveau
 * Formule: XP = 500 × (niveau - 1)
 */
export const getXPForLevel = (level) => {
  if (level <= 1) return 0;
  return LEVEL_CONFIG.XP_PER_LEVEL * (level - 1);
};

/**
 * 📊 Calculer la progression vers le prochain niveau
 */
export const getLevelProgress = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);

  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpRequiredForNext = LEVEL_CONFIG.XP_PER_LEVEL;

  const progress = currentLevel >= LEVEL_CONFIG.MAX_LEVEL
    ? 100
    : Math.min((xpInCurrentLevel / xpRequiredForNext) * 100, 100);

  const xpNeeded = currentLevel >= LEVEL_CONFIG.MAX_LEVEL
    ? 0
    : xpForNextLevel - totalXP;

  return {
    currentLevel,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpInCurrentLevel,
    xpRequiredForNext,
    progress: Math.round(progress * 100) / 100,
    xpNeeded: Math.max(0, xpNeeded),
    isMaxLevel: currentLevel >= LEVEL_CONFIG.MAX_LEVEL
  };
};

/**
 * 📊 Alias pour getLevelProgress
 */
export const getXPProgress = (totalXP) => {
  const progress = getLevelProgress(totalXP);
  return {
    level: progress.currentLevel,
    progressXP: progress.xpInCurrentLevel,
    progressPercent: Math.round(progress.progress),
    xpToNextLevel: progress.xpNeeded,
    currentLevelXP: progress.xpForCurrentLevel,
    nextLevelXP: progress.xpForNextLevel,
    isMaxLevel: progress.isMaxLevel
  };
};

// ==========================================
// 🎖️ GESTION DES RANGS (CONFIGURABLES)
// ==========================================

/**
 * 🔄 Charger les rangs depuis Firebase
 */
export const loadRanksFromFirebase = async () => {
  try {
    const ranksDoc = await getDoc(doc(db, 'config', 'ranks'));

    if (ranksDoc.exists()) {
      const data = ranksDoc.data();
      if (data.ranks && Object.keys(data.ranks).length > 0) {
        cachedRanks = data.ranks;
        console.log('✅ [RANKS] Rangs chargés depuis Firebase');
      }
    } else {
      // Créer la config par défaut dans Firebase
      await setDoc(doc(db, 'config', 'ranks'), {
        ranks: DEFAULT_RANKS,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      console.log('✅ [RANKS] Config par défaut créée dans Firebase');
    }

    ranksLoaded = true;
    return cachedRanks;
  } catch (error) {
    console.error('❌ [RANKS] Erreur chargement:', error);
    return DEFAULT_RANKS;
  }
};

/**
 * 🔔 Écouter les changements de rangs en temps réel
 */
export const subscribeToRanks = (callback) => {
  if (ranksListener) {
    ranksListener();
  }

  ranksListener = onSnapshot(doc(db, 'config', 'ranks'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.ranks) {
        cachedRanks = data.ranks;
        ranksLoaded = true;
        console.log('🔄 [RANKS] Rangs mis à jour en temps réel');
        if (callback) callback(cachedRanks);
      }
    }
  }, (error) => {
    console.error('❌ [RANKS] Erreur listener:', error);
  });

  return ranksListener;
};

/**
 * 📋 Obtenir tous les rangs (depuis cache ou défauts)
 */
export const getRanks = () => {
  return ranksLoaded ? cachedRanks : DEFAULT_RANKS;
};

/**
 * Alias pour compatibilité
 */
export const RANKS = new Proxy({}, {
  get: (target, prop) => {
    const ranks = getRanks();
    return ranks[prop];
  },
  ownKeys: () => {
    return Object.keys(getRanks());
  },
  getOwnPropertyDescriptor: (target, prop) => {
    const ranks = getRanks();
    if (prop in ranks) {
      return { enumerable: true, configurable: true, value: ranks[prop] };
    }
    return undefined;
  }
});

/**
 * 🎖️ Obtenir le rang basé sur le niveau
 */
export const getRankForLevel = (level) => {
  const ranks = getRanks();
  const ranksList = Object.values(ranks);

  for (const rank of ranksList) {
    if (level >= rank.minLevel && level <= rank.maxLevel) {
      return rank;
    }
  }

  // Fallback au premier rang
  return ranksList[0] || DEFAULT_RANKS.apprenti;
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
  const ranks = getRanks();
  const rankOrder = Object.keys(ranks).sort((a, b) =>
    ranks[a].minLevel - ranks[b].minLevel
  );

  const currentIndex = rankOrder.indexOf(currentRank?.id || 'apprenti');

  if (currentIndex < rankOrder.length - 1) {
    return ranks[rankOrder[currentIndex + 1]];
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
    levelsToNextRank: nextRank ? nextRank.minLevel - levelProgress.currentLevel : 0,
    xpBoost: currentRank?.boost || 1.0
  };
};

/**
 * 📋 Générer la grille de niveaux (pour affichage)
 */
export const generateLevelGrid = (maxLevel = 100) => {
  const grid = [];

  for (let level = 1; level <= maxLevel; level++) {
    const xpRequired = getXPForLevel(level);
    const rank = getRankForLevel(level);
    const xpToNext = level < LEVEL_CONFIG.MAX_LEVEL ? LEVEL_CONFIG.XP_PER_LEVEL : 0;

    grid.push({
      level,
      xpRequired,
      xpToNext,
      rank: rank.name,
      rankIcon: rank.icon,
      rankId: rank.id
    });
  }

  return grid;
};

// ==========================================
// 🔧 SERVICE ADMIN - MODIFICATION DES RANGS
// ==========================================

/**
 * 💾 Sauvegarder un rang modifié (ADMIN ONLY)
 */
export const updateRank = async (rankId, updates) => {
  try {
    const currentRanks = getRanks();

    if (!currentRanks[rankId]) {
      throw new Error(`Rang "${rankId}" non trouvé`);
    }

    const updatedRanks = {
      ...currentRanks,
      [rankId]: {
        ...currentRanks[rankId],
        ...updates,
        id: rankId // Préserver l'ID
      }
    };

    await setDoc(doc(db, 'config', 'ranks'), {
      ranks: updatedRanks,
      updatedAt: serverTimestamp()
    }, { merge: true });

    cachedRanks = updatedRanks;
    console.log(`✅ [RANKS] Rang "${rankId}" mis à jour`);

    return updatedRanks[rankId];
  } catch (error) {
    console.error('❌ [RANKS] Erreur mise à jour:', error);
    throw error;
  }
};

/**
 * 💾 Sauvegarder tous les rangs (ADMIN ONLY)
 */
export const saveAllRanks = async (ranks) => {
  try {
    await setDoc(doc(db, 'config', 'ranks'), {
      ranks,
      updatedAt: serverTimestamp()
    }, { merge: true });

    cachedRanks = ranks;
    console.log('✅ [RANKS] Tous les rangs sauvegardés');

    return ranks;
  } catch (error) {
    console.error('❌ [RANKS] Erreur sauvegarde:', error);
    throw error;
  }
};

/**
 * 🔄 Réinitialiser les rangs par défaut (ADMIN ONLY)
 */
export const resetRanksToDefault = async () => {
  try {
    await setDoc(doc(db, 'config', 'ranks'), {
      ranks: DEFAULT_RANKS,
      updatedAt: serverTimestamp(),
      resetAt: serverTimestamp()
    });

    cachedRanks = { ...DEFAULT_RANKS };
    console.log('✅ [RANKS] Rangs réinitialisés par défaut');

    return DEFAULT_RANKS;
  } catch (error) {
    console.error('❌ [RANKS] Erreur réinitialisation:', error);
    throw error;
  }
};

// ==========================================
// 🔄 SERVICE DE MISE À JOUR DES NIVEAUX
// ==========================================

class LevelService {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
  }

  /**
   * 🚀 Initialiser le service (charger les rangs)
   */
  async initialize() {
    if (this.initialized) return;

    await loadRanksFromFirebase();
    this.initialized = true;
    console.log('✅ [LEVEL SERVICE] Initialisé');
  }

  /**
   * Mettre à jour le niveau d'un utilisateur
   */
  async updateUserLevel(userId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.warn('❌ [LEVEL] Utilisateur non trouvé:', userId);
        return null;
      }

      const userData = userDoc.data();
      const totalXP = userData.gamification?.totalXp || userData.totalXp || 0;

      const newLevel = calculateLevel(totalXP);
      const oldLevel = userData.gamification?.level || userData.level || 1;
      const rank = getRankForLevel(newLevel);

      if (newLevel !== oldLevel) {
        await updateDoc(userRef, {
          'gamification.level': newLevel,
          'gamification.rank': rank.id,
          'gamification.rankName': rank.name,
          'gamification.rankIcon': rank.icon,
          'gamification.xpBoost': rank.boost || 1.0,
          'gamification.levelUpdatedAt': serverTimestamp()
        });

        console.log(`🎉 [LEVEL] ${userId}: Niveau ${oldLevel} → ${newLevel} (${rank.name})`);

        if (newLevel > oldLevel && typeof window !== 'undefined') {
          const event = new CustomEvent('userLevelUp', {
            detail: {
              userId,
              oldLevel,
              newLevel,
              rank: rank.id,
              rankName: rank.name,
              rankIcon: rank.icon
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
      if (!this.initialized) {
        await this.initialize();
      }

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

  getDefaultLevelData() {
    return getFullProgressInfo(0);
  }
}

// Singleton
export const levelService = new LevelService();

// ==========================================
// 💰 HELPER XP DÉPENSABLES (BOUTIQUE)
// ==========================================

export const getSpendableXP = (gamificationData) => {
  const totalXP = gamificationData?.totalXp || 0;
  const totalSpentXP = gamificationData?.totalSpentXp || 0;
  return Math.max(0, totalXP - totalSpentXP);
};

export const canAffordReward = (gamificationData, cost) => {
  const spendableXP = getSpendableXP(gamificationData);
  const canAfford = spendableXP >= cost;
  const missing = canAfford ? 0 : cost - spendableXP;
  return { canAfford, spendableXP, missing };
};

// ==========================================
// 📊 TABLE DE RÉFÉRENCE DES NIVEAUX
// ==========================================
/**
 * Calibration: 500 XP/niveau, ~1250 XP/mois = 30 niveaux/an
 *
 * Niveau | XP Requis | Rang         | Temps estimé
 * -------|-----------|--------------|------------------------------
 *   1    |       0   | Apprenti     | Départ
 *   5    |   2,000   | Apprenti     | ~1.5 mois
 *  10    |   4,500   | Initié       | ~3-4 mois
 *  20    |   9,500   | Aventurier   | ~7-8 mois
 *  30    |  14,500   | Héros        | ~1 an
 *  45    |  22,000   | Champion     | ~1.5 ans
 *  60    |  29,500   | Maître       | ~2 ans
 *  75    |  37,000   | Légende      | ~2.5 ans
 *  90    |  44,500   | Immortel     | ~3 ans
 * 100    |  49,500   | Transcendant | ~3.3 ans (MAX!)
 */

export default levelService;

// ==========================================
// react-app/src/core/services/profileCustomizationService.js
// SERVICE PERSONNALISATION PROFIL - SYNERGIA v4.0
// Module 13: Avatars, Titres, Bannieres + Avatar Builder
// ==========================================

import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

// Import du nouveau systeme d'avatar builder
import {
  CHARACTER_CLASSES,
  COLOR_VARIANTS,
  HEADGEAR,
  WEAPONS,
  COMPANIONS,
  EFFECTS,
  EMBLEMS,
  BACKGROUNDS,
  isUnlocked,
  getUnlockText,
  getUnlockProgress,
  getCategoryItems,
  getUnlockStats as getAvatarBuilderUnlockStats,
  DEFAULT_AVATAR_CONFIG
} from './avatarDefinitions.js';

// Re-export pour faciliter l'acces
export {
  CHARACTER_CLASSES,
  COLOR_VARIANTS,
  HEADGEAR,
  WEAPONS,
  COMPANIONS,
  EFFECTS,
  EMBLEMS,
  BACKGROUNDS,
  isUnlocked,
  getUnlockText,
  getUnlockProgress,
  DEFAULT_AVATAR_CONFIG
};

// ==========================================
// AVATARS DEBLOCABLES
// ==========================================
export const UNLOCKABLE_AVATARS = {
  // Avatars de base (toujours disponibles)
  default_blue: {
    id: 'default_blue',
    name: 'Cercle Bleu',
    emoji: '🔵',
    gradient: 'from-blue-500 to-cyan-500',
    category: 'base',
    unlockCondition: null,
    unlockDescription: 'Disponible par defaut'
  },
  default_purple: {
    id: 'default_purple',
    name: 'Cercle Violet',
    emoji: '🟣',
    gradient: 'from-purple-500 to-pink-500',
    category: 'base',
    unlockCondition: null,
    unlockDescription: 'Disponible par defaut'
  },
  default_green: {
    id: 'default_green',
    name: 'Cercle Vert',
    emoji: '🟢',
    gradient: 'from-green-500 to-emerald-500',
    category: 'base',
    unlockCondition: null,
    unlockDescription: 'Disponible par defaut'
  },

  // Avatars par niveau
  warrior: {
    id: 'warrior',
    name: 'Guerrier',
    emoji: '⚔️',
    gradient: 'from-red-600 to-orange-500',
    category: 'level',
    unlockCondition: { type: 'level', value: 5 },
    unlockDescription: 'Atteindre niveau 5'
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    emoji: '🧙',
    gradient: 'from-purple-600 to-blue-500',
    category: 'level',
    unlockCondition: { type: 'level', value: 10 },
    unlockDescription: 'Atteindre niveau 10'
  },
  knight: {
    id: 'knight',
    name: 'Chevalier',
    emoji: '🛡️',
    gradient: 'from-slate-600 to-gray-400',
    category: 'level',
    unlockCondition: { type: 'level', value: 15 },
    unlockDescription: 'Atteindre niveau 15'
  },
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    emoji: '🐉',
    gradient: 'from-red-700 to-yellow-500',
    category: 'level',
    unlockCondition: { type: 'level', value: 25 },
    unlockDescription: 'Atteindre niveau 25'
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix',
    emoji: '🔥',
    gradient: 'from-orange-500 to-red-600',
    category: 'level',
    unlockCondition: { type: 'level', value: 35 },
    unlockDescription: 'Atteindre niveau 35'
  },
  legend: {
    id: 'legend',
    name: 'Legende',
    emoji: '👑',
    gradient: 'from-yellow-400 to-amber-600',
    category: 'level',
    unlockCondition: { type: 'level', value: 50 },
    unlockDescription: 'Atteindre niveau 50'
  },

  // Avatars par XP
  xp_hunter: {
    id: 'xp_hunter',
    name: 'Chasseur XP',
    emoji: '⚡',
    gradient: 'from-yellow-500 to-orange-500',
    category: 'xp',
    unlockCondition: { type: 'totalXp', value: 5000 },
    unlockDescription: 'Accumuler 5 000 XP'
  },
  xp_master: {
    id: 'xp_master',
    name: 'Maitre XP',
    emoji: '💫',
    gradient: 'from-amber-400 to-yellow-600',
    category: 'xp',
    unlockCondition: { type: 'totalXp', value: 25000 },
    unlockDescription: 'Accumuler 25 000 XP'
  },
  xp_legend: {
    id: 'xp_legend',
    name: 'Legende XP',
    emoji: '🌟',
    gradient: 'from-yellow-300 to-orange-400',
    category: 'xp',
    unlockCondition: { type: 'totalXp', value: 100000 },
    unlockDescription: 'Accumuler 100 000 XP'
  },

  // Avatars par taches
  task_rookie: {
    id: 'task_rookie',
    name: 'Debutant',
    emoji: '📋',
    gradient: 'from-green-500 to-teal-500',
    category: 'tasks',
    unlockCondition: { type: 'tasksCompleted', value: 10 },
    unlockDescription: 'Completer 10 taches'
  },
  task_pro: {
    id: 'task_pro',
    name: 'Professionnel',
    emoji: '✅',
    gradient: 'from-emerald-500 to-green-600',
    category: 'tasks',
    unlockCondition: { type: 'tasksCompleted', value: 50 },
    unlockDescription: 'Completer 50 taches'
  },
  task_master: {
    id: 'task_master',
    name: 'Maitre des Taches',
    emoji: '🏆',
    gradient: 'from-green-600 to-emerald-700',
    category: 'tasks',
    unlockCondition: { type: 'tasksCompleted', value: 200 },
    unlockDescription: 'Completer 200 taches'
  },

  // Avatars par badges
  badge_collector: {
    id: 'badge_collector',
    name: 'Collectionneur',
    emoji: '🎖️',
    gradient: 'from-indigo-500 to-purple-600',
    category: 'badges',
    unlockCondition: { type: 'badgesCount', value: 5 },
    unlockDescription: 'Obtenir 5 badges'
  },
  badge_champion: {
    id: 'badge_champion',
    name: 'Champion',
    emoji: '🏅',
    gradient: 'from-violet-500 to-purple-700',
    category: 'badges',
    unlockCondition: { type: 'badgesCount', value: 15 },
    unlockDescription: 'Obtenir 15 badges'
  },

  // Avatars speciaux
  streak_fire: {
    id: 'streak_fire',
    name: 'Flamme',
    emoji: '🔥',
    gradient: 'from-red-500 to-orange-600',
    category: 'special',
    unlockCondition: { type: 'streak', value: 7 },
    unlockDescription: 'Serie de 7 jours consecutifs'
  },
  streak_blaze: {
    id: 'streak_blaze',
    name: 'Brasier',
    emoji: '💥',
    gradient: 'from-orange-500 to-red-700',
    category: 'special',
    unlockCondition: { type: 'streak', value: 30 },
    unlockDescription: 'Serie de 30 jours consecutifs'
  },
  team_player: {
    id: 'team_player',
    name: 'Esprit d\'Equipe',
    emoji: '🤝',
    gradient: 'from-blue-500 to-indigo-600',
    category: 'special',
    unlockCondition: { type: 'teamContributions', value: 10 },
    unlockDescription: '10 contributions aux defis equipe'
  }
};

// ==========================================
// TITRES DEBLOCABLES
// ==========================================
export const UNLOCKABLE_TITLES = {
  // Titres de base
  member: {
    id: 'member',
    name: 'Membre',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    category: 'base',
    unlockCondition: null,
    unlockDescription: 'Titre par defaut'
  },

  // Titres par niveau
  apprentice: {
    id: 'apprentice',
    name: 'Apprenti',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    category: 'level',
    unlockCondition: { type: 'level', value: 3 },
    unlockDescription: 'Atteindre niveau 3'
  },
  adventurer: {
    id: 'adventurer',
    name: 'Aventurier',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    category: 'level',
    unlockCondition: { type: 'level', value: 7 },
    unlockDescription: 'Atteindre niveau 7'
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    category: 'level',
    unlockCondition: { type: 'level', value: 15 },
    unlockDescription: 'Atteindre niveau 15'
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    category: 'level',
    unlockCondition: { type: 'level', value: 25 },
    unlockDescription: 'Atteindre niveau 25'
  },
  master: {
    id: 'master',
    name: 'Maitre',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    category: 'level',
    unlockCondition: { type: 'level', value: 35 },
    unlockDescription: 'Atteindre niveau 35'
  },
  grandmaster: {
    id: 'grandmaster',
    name: 'Grand Maitre',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30',
    category: 'level',
    unlockCondition: { type: 'level', value: 45 },
    unlockDescription: 'Atteindre niveau 45'
  },
  legend: {
    id: 'legend',
    name: 'Legende Vivante',
    color: 'text-yellow-400',
    bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/50',
    category: 'level',
    unlockCondition: { type: 'level', value: 50 },
    unlockDescription: 'Atteindre niveau 50'
  },

  // Titres speciaux
  speedrunner: {
    id: 'speedrunner',
    name: 'Speedrunner',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    category: 'special',
    unlockCondition: { type: 'tasksCompletedToday', value: 5 },
    unlockDescription: '5 taches en un jour'
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionniste',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    category: 'special',
    unlockCondition: { type: 'completionRate', value: 95 },
    unlockDescription: 'Taux de completion >= 95%'
  },
  team_leader: {
    id: 'team_leader',
    name: 'Leader d\'Equipe',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    category: 'special',
    unlockCondition: { type: 'teamChallengesCompleted', value: 3 },
    unlockDescription: 'Participer a 3 defis equipe completes'
  },
  early_bird: {
    id: 'early_bird',
    name: 'Leve-Tot',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/30',
    category: 'special',
    unlockCondition: { type: 'earlyMorningTasks', value: 10 },
    unlockDescription: '10 taches completees avant 9h'
  },
  night_owl: {
    id: 'night_owl',
    name: 'Oiseau de Nuit',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/30',
    category: 'special',
    unlockCondition: { type: 'lateNightTasks', value: 10 },
    unlockDescription: '10 taches completees apres 22h'
  },
  unstoppable: {
    id: 'unstoppable',
    name: 'Inarretable',
    color: 'text-red-500',
    bgColor: 'bg-gradient-to-r from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-500/50',
    category: 'special',
    unlockCondition: { type: 'streak', value: 30 },
    unlockDescription: 'Serie de 30 jours'
  },
  contributor: {
    id: 'contributor',
    name: 'Contributeur',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    borderColor: 'border-teal-500/30',
    category: 'special',
    unlockCondition: { type: 'poolContributions', value: 5 },
    unlockDescription: '5 contributions a la cagnotte'
  }
};

// ==========================================
// BANNIERES DE PROFIL
// ==========================================
export const UNLOCKABLE_BANNERS = {
  // Bannieres de base
  default: {
    id: 'default',
    name: 'Classique',
    gradient: 'from-slate-800 to-slate-900',
    pattern: null,
    category: 'base',
    unlockCondition: null,
    unlockDescription: 'Disponible par defaut'
  },
  night_sky: {
    id: 'night_sky',
    name: 'Ciel Nocturne',
    gradient: 'from-slate-900 via-purple-900 to-slate-900',
    pattern: 'stars',
    category: 'base',
    unlockCondition: null,
    unlockDescription: 'Disponible par defaut'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    gradient: 'from-blue-900 via-cyan-800 to-blue-900',
    pattern: 'waves',
    category: 'base',
    unlockCondition: null,
    unlockDescription: 'Disponible par defaut'
  },

  // Bannieres par niveau
  forest: {
    id: 'forest',
    name: 'Foret Enchantee',
    gradient: 'from-green-900 via-emerald-800 to-green-900',
    pattern: 'leaves',
    category: 'level',
    unlockCondition: { type: 'level', value: 5 },
    unlockDescription: 'Atteindre niveau 5'
  },
  sunset: {
    id: 'sunset',
    name: 'Coucher de Soleil',
    gradient: 'from-orange-600 via-red-600 to-purple-700',
    pattern: null,
    category: 'level',
    unlockCondition: { type: 'level', value: 10 },
    unlockDescription: 'Atteindre niveau 10'
  },
  aurora: {
    id: 'aurora',
    name: 'Aurore Boreale',
    gradient: 'from-green-500 via-blue-500 to-purple-600',
    pattern: 'aurora',
    category: 'level',
    unlockCondition: { type: 'level', value: 15 },
    unlockDescription: 'Atteindre niveau 15'
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxie',
    gradient: 'from-purple-900 via-pink-800 to-indigo-900',
    pattern: 'stars',
    category: 'level',
    unlockCondition: { type: 'level', value: 20 },
    unlockDescription: 'Atteindre niveau 20'
  },
  fire: {
    id: 'fire',
    name: 'Inferno',
    gradient: 'from-red-700 via-orange-600 to-yellow-600',
    pattern: 'flames',
    category: 'level',
    unlockCondition: { type: 'level', value: 25 },
    unlockDescription: 'Atteindre niveau 25'
  },
  ice: {
    id: 'ice',
    name: 'Royaume de Glace',
    gradient: 'from-cyan-500 via-blue-400 to-white',
    pattern: 'snowflakes',
    category: 'level',
    unlockCondition: { type: 'level', value: 30 },
    unlockDescription: 'Atteindre niveau 30'
  },
  void: {
    id: 'void',
    name: 'Le Vide',
    gradient: 'from-gray-900 via-black to-gray-900',
    pattern: 'void',
    category: 'level',
    unlockCondition: { type: 'level', value: 40 },
    unlockDescription: 'Atteindre niveau 40'
  },
  legendary: {
    id: 'legendary',
    name: 'Legendaire',
    gradient: 'from-yellow-500 via-amber-400 to-orange-500',
    pattern: 'sparkles',
    category: 'level',
    unlockCondition: { type: 'level', value: 50 },
    unlockDescription: 'Atteindre niveau 50'
  },

  // Bannieres speciales
  team_spirit: {
    id: 'team_spirit',
    name: 'Esprit d\'Equipe',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    pattern: 'team',
    category: 'special',
    unlockCondition: { type: 'teamChallengesCompleted', value: 5 },
    unlockDescription: 'Participer a 5 defis equipe completes'
  },
  achievement_hunter: {
    id: 'achievement_hunter',
    name: 'Chasseur de Succes',
    gradient: 'from-amber-600 via-yellow-500 to-amber-600',
    pattern: 'badges',
    category: 'special',
    unlockCondition: { type: 'badgesCount', value: 10 },
    unlockDescription: 'Obtenir 10 badges'
  },
  productivity_king: {
    id: 'productivity_king',
    name: 'Roi de la Productivite',
    gradient: 'from-green-600 via-emerald-500 to-teal-600',
    pattern: 'crown',
    category: 'special',
    unlockCondition: { type: 'tasksCompleted', value: 100 },
    unlockDescription: 'Completer 100 taches'
  }
};

// ==========================================
// SERVICE DE PERSONNALISATION
// ==========================================
class ProfileCustomizationService {

  /**
   * Verifier si un element est debloque
   */
  checkUnlockCondition(condition, userStats) {
    if (!condition) return true; // Pas de condition = toujours debloque

    const { type, value } = condition;

    switch (type) {
      case 'level':
        return (userStats.level || 1) >= value;
      case 'totalXp':
        return (userStats.totalXp || 0) >= value;
      case 'tasksCompleted':
        return (userStats.tasksCompleted || 0) >= value;
      case 'badgesCount':
        return (userStats.badgesCount || 0) >= value;
      case 'streak':
        return (userStats.streak || 0) >= value;
      case 'teamContributions':
        return (userStats.teamContributions || 0) >= value;
      case 'teamChallengesCompleted':
        return (userStats.teamChallengesCompleted || 0) >= value;
      case 'completionRate':
        return (userStats.completionRate || 0) >= value;
      case 'poolContributions':
        return (userStats.poolContributions || 0) >= value;
      default:
        return false;
    }
  }

  /**
   * Obtenir tous les avatars avec leur statut de deblocage
   */
  getAvatarsWithStatus(userStats) {
    const avatars = [];

    Object.values(UNLOCKABLE_AVATARS).forEach(avatar => {
      const isUnlocked = this.checkUnlockCondition(avatar.unlockCondition, userStats);
      avatars.push({
        ...avatar,
        isUnlocked,
        progress: this.getProgress(avatar.unlockCondition, userStats)
      });
    });

    return avatars;
  }

  /**
   * Obtenir tous les titres avec leur statut de deblocage
   */
  getTitlesWithStatus(userStats) {
    const titles = [];

    Object.values(UNLOCKABLE_TITLES).forEach(title => {
      const isUnlocked = this.checkUnlockCondition(title.unlockCondition, userStats);
      titles.push({
        ...title,
        isUnlocked,
        progress: this.getProgress(title.unlockCondition, userStats)
      });
    });

    return titles;
  }

  /**
   * Obtenir toutes les bannieres avec leur statut de deblocage
   */
  getBannersWithStatus(userStats) {
    const banners = [];

    Object.values(UNLOCKABLE_BANNERS).forEach(banner => {
      const isUnlocked = this.checkUnlockCondition(banner.unlockCondition, userStats);
      banners.push({
        ...banner,
        isUnlocked,
        progress: this.getProgress(banner.unlockCondition, userStats)
      });
    });

    return banners;
  }

  /**
   * Calculer la progression vers un deblocage
   */
  getProgress(condition, userStats) {
    if (!condition) return { current: 0, target: 0, percent: 100 };

    const { type, value } = condition;
    let current = 0;

    switch (type) {
      case 'level':
        current = userStats.level || 1;
        break;
      case 'totalXp':
        current = userStats.totalXp || 0;
        break;
      case 'tasksCompleted':
        current = userStats.tasksCompleted || 0;
        break;
      case 'badgesCount':
        current = userStats.badgesCount || 0;
        break;
      case 'streak':
        current = userStats.streak || 0;
        break;
      case 'teamContributions':
        current = userStats.teamContributions || 0;
        break;
      case 'teamChallengesCompleted':
        current = userStats.teamChallengesCompleted || 0;
        break;
      case 'completionRate':
        current = userStats.completionRate || 0;
        break;
      case 'poolContributions':
        current = userStats.poolContributions || 0;
        break;
    }

    return {
      current,
      target: value,
      percent: Math.min(100, Math.round((current / value) * 100))
    };
  }

  /**
   * Obtenir la personnalisation actuelle d'un utilisateur
   */
  async getUserCustomization(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          selectedAvatar: 'default_purple',
          selectedTitle: 'member',
          selectedBanner: 'default'
        };
      }

      const data = userDoc.data();
      return {
        selectedAvatar: data.customization?.selectedAvatar || 'default_purple',
        selectedTitle: data.customization?.selectedTitle || 'member',
        selectedBanner: data.customization?.selectedBanner || 'default'
      };
    } catch (error) {
      console.error('Erreur recuperation personnalisation:', error);
      throw error;
    }
  }

  /**
   * Mettre a jour l'avatar selectionne
   */
  async updateSelectedAvatar(userId, avatarId, userStats) {
    try {
      // Verifier que l'avatar est debloque
      const avatar = UNLOCKABLE_AVATARS[avatarId];
      if (!avatar) {
        return { success: false, error: 'Avatar invalide' };
      }

      if (!this.checkUnlockCondition(avatar.unlockCondition, userStats)) {
        return { success: false, error: 'Avatar non debloque' };
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'customization.selectedAvatar': avatarId,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur mise a jour avatar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre a jour le titre selectionne
   */
  async updateSelectedTitle(userId, titleId, userStats) {
    try {
      // Verifier que le titre est debloque
      const title = UNLOCKABLE_TITLES[titleId];
      if (!title) {
        return { success: false, error: 'Titre invalide' };
      }

      if (!this.checkUnlockCondition(title.unlockCondition, userStats)) {
        return { success: false, error: 'Titre non debloque' };
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'customization.selectedTitle': titleId,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur mise a jour titre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre a jour la banniere selectionnee
   */
  async updateSelectedBanner(userId, bannerId, userStats) {
    try {
      // Verifier que la banniere est debloquee
      const banner = UNLOCKABLE_BANNERS[bannerId];
      if (!banner) {
        return { success: false, error: 'Banniere invalide' };
      }

      if (!this.checkUnlockCondition(banner.unlockCondition, userStats)) {
        return { success: false, error: 'Banniere non debloquee' };
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'customization.selectedBanner': bannerId,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur mise a jour banniere:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * S'abonner aux changements de personnalisation
   */
  subscribeToCustomization(userId, callback) {
    const userRef = doc(db, 'users', userId);

    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          selectedAvatar: data.customization?.selectedAvatar || 'default_purple',
          selectedTitle: data.customization?.selectedTitle || 'member',
          selectedBanner: data.customization?.selectedBanner || 'default'
        });
      }
    });
  }

  /**
   * Obtenir les statistiques de deblocage
   */
  getUnlockStats(userStats) {
    const avatars = this.getAvatarsWithStatus(userStats);
    const titles = this.getTitlesWithStatus(userStats);
    const banners = this.getBannersWithStatus(userStats);

    return {
      avatars: {
        total: avatars.length,
        unlocked: avatars.filter(a => a.isUnlocked).length
      },
      titles: {
        total: titles.length,
        unlocked: titles.filter(t => t.isUnlocked).length
      },
      banners: {
        total: banners.length,
        unlocked: banners.filter(b => b.isUnlocked).length
      }
    };
  }

  // ==========================================
  // AVATAR BUILDER - NOUVEAU SYSTEME
  // ==========================================

  /**
   * Obtenir la configuration d'avatar builder d'un utilisateur
   */
  async getAvatarBuilderConfig(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return DEFAULT_AVATAR_CONFIG;
      }

      const data = userDoc.data();
      return data.avatarBuilder || DEFAULT_AVATAR_CONFIG;
    } catch (error) {
      console.error('Erreur recuperation avatar builder:', error);
      return DEFAULT_AVATAR_CONFIG;
    }
  }

  /**
   * Sauvegarder la configuration d'avatar builder
   */
  async saveAvatarBuilderConfig(userId, config, userStats) {
    try {
      // Verifier que tous les elements sont debloques
      const categories = [
        { key: 'class', items: CHARACTER_CLASSES },
        { key: 'color', items: COLOR_VARIANTS },
        { key: 'headgear', items: HEADGEAR },
        { key: 'weapon', items: WEAPONS },
        { key: 'companion', items: COMPANIONS },
        { key: 'effect', items: EFFECTS },
        { key: 'emblem', items: EMBLEMS },
        { key: 'background', items: BACKGROUNDS }
      ];

      for (const cat of categories) {
        const itemId = config[cat.key];
        const item = cat.items[itemId];

        if (item && !isUnlocked(item, userStats)) {
          return {
            success: false,
            error: `Element "${item.name}" non debloque dans ${cat.key}`
          };
        }
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        avatarBuilder: config,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur sauvegarde avatar builder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir les statistiques de deblocage pour l'avatar builder
   */
  getAvatarBuilderUnlockStats(userStats) {
    return getAvatarBuilderUnlockStats(userStats);
  }

  /**
   * Obtenir les items d'une categorie avec statut de deblocage
   */
  getAvatarBuilderCategoryItems(category, userStats) {
    return getCategoryItems(category, userStats);
  }

  // ==========================================
  // DICEBEAR AVATAR SYSTEM (NOUVEAU v4.1)
  // ==========================================

  /**
   * Obtenir la configuration DiceBear d'un utilisateur
   */
  async getDiceBearConfig(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return data.diceBearAvatar || null;
    } catch (error) {
      console.error('Erreur récupération DiceBear config:', error);
      return null;
    }
  }

  /**
   * Sauvegarder la configuration DiceBear
   */
  async saveDiceBearConfig(userId, config, userStats) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        diceBearAvatar: config,
        avatarType: 'dicebear', // Marquer le type d'avatar utilisé
        updatedAt: new Date()
      });

      console.log('✅ Config DiceBear sauvegardée:', config);
      return { success: true };
    } catch (error) {
      console.error('Erreur sauvegarde DiceBear:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // PIXEL ART RPG AVATAR SYSTEM (NOUVEAU v4.1)
  // ==========================================

  /**
   * Obtenir la configuration PixelArt d'un utilisateur
   */
  async getPixelArtConfig(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return data.pixelArtAvatar || null;
    } catch (error) {
      console.error('Erreur récupération PixelArt config:', error);
      return null;
    }
  }

  /**
   * Sauvegarder la configuration PixelArt RPG
   */
  async savePixelArtConfig(userId, config, userStats) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        pixelArtAvatar: config,
        avatarType: 'pixelart', // Marquer le type d'avatar utilisé
        updatedAt: new Date()
      });

      console.log('✅ Config PixelArt sauvegardée:', config);
      return { success: true };
    } catch (error) {
      console.error('Erreur sauvegarde PixelArt:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * S'abonner aux changements d'avatar builder
   */
  subscribeToAvatarBuilder(userId, callback) {
    const userRef = doc(db, 'users', userId);

    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.avatarBuilder || DEFAULT_AVATAR_CONFIG);
      }
    });
  }

  /**
   * Obtenir les elements recommandes (prochains a debloquer)
   */
  getRecommendedItems(userStats) {
    const recommendations = [];
    const categories = [
      { key: 'classes', items: CHARACTER_CLASSES, label: 'Classe' },
      { key: 'colors', items: COLOR_VARIANTS, label: 'Couleur' },
      { key: 'headgear', items: HEADGEAR, label: 'Coiffe' },
      { key: 'weapons', items: WEAPONS, label: 'Arme' },
      { key: 'companions', items: COMPANIONS, label: 'Compagnon' },
      { key: 'effects', items: EFFECTS, label: 'Effet' }
    ];

    categories.forEach(cat => {
      Object.values(cat.items).forEach(item => {
        if (!isUnlocked(item, userStats)) {
          const progress = getUnlockProgress(item, userStats);
          if (progress >= 50 && progress < 100) {
            recommendations.push({
              ...item,
              category: cat.label,
              categoryKey: cat.key,
              progress,
              unlockText: getUnlockText(item)
            });
          }
        }
      });
    });

    // Trier par progression (les plus proches en premier)
    return recommendations.sort((a, b) => b.progress - a.progress).slice(0, 5);
  }

  /**
   * Convertir les stats utilisateur du format existant vers le format avatar builder
   */
  normalizeUserStats(userData) {
    return {
      level: userData?.level || userData?.gamification?.level || 1,
      totalXp: userData?.totalXp || userData?.gamification?.totalXp || 0,
      tasksCompleted: userData?.tasksCompleted || userData?.stats?.tasksCompleted || 0,
      badgesCount: userData?.badgesCount || userData?.badges?.length || 0,
      currentStreak: userData?.streak || userData?.gamification?.streak || 0,
      challengesCompleted: userData?.challengesCompleted || 0,
      specialEvents: userData?.specialEvents || []
    };
  }
}

// Export instance singleton
export const profileCustomizationService = new ProfileCustomizationService();
export default profileCustomizationService;

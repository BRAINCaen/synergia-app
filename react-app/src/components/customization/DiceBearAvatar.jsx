// ==========================================
// SYNERGIA v4.1 - RPG Avatar System avec DiceBear
// Interface RPG + Vrais avatars personnalisables
// ==========================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, Crown, Sword, Heart, Sparkles, Shield, Image,
  Lock, Check, ChevronRight, Star, Zap, Trophy, RefreshCw,
  Eye, EyeOff, RotateCcw, Save, Wand2
} from 'lucide-react';

// ==========================================
// CLASSES RPG → Configurations DiceBear
// Chaque classe a un look distinct
// ==========================================
export const RPG_CLASSES = {
  mage: {
    id: 'mage',
    name: 'Mage',
    description: 'Maître des arcanes',
    icon: '🧙',
    // Config DiceBear pour ce look
    dicebear: {
      hair: 'long09',
      hairColor: '9b59b6', // Violet
      skinColor: 'f2d3b1',
      eyebrows: 'variant10',
      eyes: 'variant26',
      mouth: 'variant01'
    },
    unlockCondition: { type: 'default' }
  },
  warrior: {
    id: 'warrior',
    name: 'Guerrier',
    description: 'Force et honneur',
    icon: '⚔️',
    dicebear: {
      hair: 'short04',
      hairColor: '6a4e35',
      skinColor: 'd08b5b',
      eyebrows: 'variant06',
      eyes: 'variant14',
      mouth: 'variant07'
    },
    unlockCondition: { type: 'level', value: 3 }
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    description: 'Précision et agilité',
    icon: '🏹',
    dicebear: {
      hair: 'long03',
      hairColor: 'c9b291',
      skinColor: 'ecad80',
      eyebrows: 'variant04',
      eyes: 'variant05',
      mouth: 'variant05'
    },
    unlockCondition: { type: 'level', value: 5 }
  },
  knight: {
    id: 'knight',
    name: 'Chevalier',
    description: 'Défenseur de la justice',
    icon: '🛡️',
    dicebear: {
      hair: 'short02',
      hairColor: '3a3a3a',
      skinColor: 'f2d3b1',
      eyebrows: 'variant09',
      eyes: 'variant17',
      mouth: 'variant12'
    },
    unlockCondition: { type: 'level', value: 8 }
  },
  healer: {
    id: 'healer',
    name: 'Soigneur',
    description: 'Gardien de la vie',
    icon: '💚',
    dicebear: {
      hair: 'long06',
      hairColor: 'e5c293',
      skinColor: 'f2d3b1',
      eyebrows: 'variant02',
      eyes: 'variant23',
      mouth: 'variant02'
    },
    unlockCondition: { type: 'badges', value: 5 }
  },
  rogue: {
    id: 'rogue',
    name: 'Voleur',
    description: 'Rapide et furtif',
    icon: '🗡️',
    dicebear: {
      hair: 'short05',
      hairColor: '0e0e0e',
      skinColor: 'ae5d29',
      eyebrows: 'variant07',
      eyes: 'variant12',
      mouth: 'variant09'
    },
    unlockCondition: { type: 'streak', value: 7 }
  },
  necromancer: {
    id: 'necromancer',
    name: 'Nécromancien',
    description: 'Maître des ombres',
    icon: '💀',
    dicebear: {
      hair: 'long12',
      hairColor: '0e0e0e',
      skinColor: 'c0aede', // Pâle/violet
      eyebrows: 'variant12',
      eyes: 'variant08',
      mouth: 'variant11'
    },
    unlockCondition: { type: 'level', value: 15 }
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    description: 'Champion de la lumière',
    icon: '✨',
    dicebear: {
      hair: 'short03',
      hairColor: 'f39c12', // Doré
      skinColor: 'ecad80',
      eyebrows: 'variant01',
      eyes: 'variant19',
      mouth: 'variant03'
    },
    unlockCondition: { type: 'level', value: 20 }
  },
  ranger: {
    id: 'ranger',
    name: 'Rôdeur',
    description: 'Un avec la nature',
    icon: '🌿',
    dicebear: {
      hair: 'long04',
      hairColor: '6a4e35',
      skinColor: 'd08b5b',
      eyebrows: 'variant05',
      eyes: 'variant10',
      mouth: 'variant06'
    },
    unlockCondition: { type: 'xp', value: 3000 }
  },
  villager: {
    id: 'villager',
    name: 'Villageois',
    description: 'Travailleur acharné',
    icon: '👨‍🌾',
    dicebear: {
      hair: 'short01',
      hairColor: '977e63',
      skinColor: 'ecad80',
      eyebrows: 'variant03',
      eyes: 'variant01',
      mouth: 'variant04'
    },
    unlockCondition: { type: 'default' }
  }
};

// ==========================================
// COULEURS (appliquées sur l'avatar)
// ==========================================
export const RPG_COLORS = {
  natural: { id: 'natural', name: 'Naturel', color: null, icon: '🎨', unlockCondition: { type: 'default' } },
  fire: { id: 'fire', name: 'Feu', hairColor: 'e74c3c', icon: '🔥', unlockCondition: { type: 'level', value: 3 } },
  ice: { id: 'ice', name: 'Glace', hairColor: '3498db', icon: '❄️', unlockCondition: { type: 'level', value: 5 } },
  nature: { id: 'nature', name: 'Nature', hairColor: '2ecc71', icon: '🌿', unlockCondition: { type: 'level', value: 7 } },
  shadow: { id: 'shadow', name: 'Ombre', hairColor: '2c3e50', icon: '🌑', unlockCondition: { type: 'level', value: 10 } },
  light: { id: 'light', name: 'Lumière', hairColor: 'f1c40f', icon: '☀️', unlockCondition: { type: 'badges', value: 5 } },
  arcane: { id: 'arcane', name: 'Arcane', hairColor: '9b59b6', icon: '🔮', unlockCondition: { type: 'level', value: 12 } },
  blood: { id: 'blood', name: 'Sang', hairColor: 'c0392b', icon: '🩸', unlockCondition: { type: 'level', value: 15 } },
  storm: { id: 'storm', name: 'Tempête', hairColor: '1abc9c', icon: '⚡', unlockCondition: { type: 'xp', value: 5000 } },
  void: { id: 'void', name: 'Néant', hairColor: '000000', icon: '🕳️', unlockCondition: { type: 'level', value: 20 } },
  celestial: { id: 'celestial', name: 'Céleste', hairColor: 'ffffff', icon: '⭐', unlockCondition: { type: 'streak', value: 30 } },
  rainbow: { id: 'rainbow', name: 'Arc-en-ciel', hairColor: 'e91e63', icon: '🌈', unlockCondition: { type: 'badges', value: 20 } },
  phoenix: { id: 'phoenix', name: 'Phénix', hairColor: 'ff5722', icon: '🦅', unlockCondition: { type: 'challenges', value: 10 } },
  ocean: { id: 'ocean', name: 'Océan', hairColor: '00bcd4', icon: '🌊', unlockCondition: { type: 'tasks', value: 50 } },
  forest: { id: 'forest', name: 'Forêt', hairColor: '4caf50', icon: '🌲', unlockCondition: { type: 'level', value: 8 } },
  desert: { id: 'desert', name: 'Désert', hairColor: 'ff9800', icon: '🏜️', unlockCondition: { type: 'level', value: 6 } },
  mystic: { id: 'mystic', name: 'Mystique', hairColor: '673ab7', icon: '🔯', unlockCondition: { type: 'level', value: 18 } },
  royal: { id: 'royal', name: 'Royal', hairColor: 'ffc107', icon: '👑', unlockCondition: { type: 'level', value: 25 } }
};

// ==========================================
// COIFFES (styles de cheveux/accessoires tête)
// ==========================================
export const RPG_HEADGEAR = {
  none: { id: 'none', name: 'Aucun', icon: '❌', hair: null, unlockCondition: { type: 'default' } },
  short: { id: 'short', name: 'Courts', icon: '💇', hair: 'short01', unlockCondition: { type: 'default' } },
  medium: { id: 'medium', name: 'Mi-longs', icon: '💇', hair: 'short04', unlockCondition: { type: 'default' } },
  long: { id: 'long', name: 'Longs', icon: '💇‍♀️', hair: 'long01', unlockCondition: { type: 'default' } },
  warrior_helm: { id: 'warrior_helm', name: 'Casque guerrier', icon: '⚔️', hair: 'short02', glasses: 'variant02', unlockCondition: { type: 'level', value: 5 } },
  mage_hood: { id: 'mage_hood', name: 'Capuche mage', icon: '🧙', hair: 'long09', unlockCondition: { type: 'level', value: 5 } },
  crown: { id: 'crown', name: 'Couronne', icon: '👑', hair: 'long05', earrings: 'variant05', unlockCondition: { type: 'level', value: 15 } },
  bandana: { id: 'bandana', name: 'Bandana', icon: '🎀', hair: 'short05', unlockCondition: { type: 'level', value: 3 } },
  ponytail: { id: 'ponytail', name: 'Queue de cheval', icon: '🎀', hair: 'long03', unlockCondition: { type: 'level', value: 4 } },
  braids: { id: 'braids', name: 'Tresses', icon: '🎀', hair: 'long07', unlockCondition: { type: 'level', value: 6 } },
  mohawk: { id: 'mohawk', name: 'Crête', icon: '💀', hair: 'short03', unlockCondition: { type: 'badges', value: 5 } },
  wild: { id: 'wild', name: 'Sauvage', icon: '🦁', hair: 'long11', unlockCondition: { type: 'streak', value: 14 } },
  elegant: { id: 'elegant', name: 'Élégant', icon: '✨', hair: 'long06', earrings: 'variant03', unlockCondition: { type: 'level', value: 10 } }
};

// ==========================================
// ARMES (affichées à côté de l'avatar)
// ==========================================
export const RPG_WEAPONS = {
  none: { id: 'none', name: 'Aucune', icon: '❌', emoji: null, unlockCondition: { type: 'default' } },
  sword: { id: 'sword', name: 'Épée', icon: '⚔️', emoji: '⚔️', unlockCondition: { type: 'default' } },
  staff: { id: 'staff', name: 'Bâton', icon: '🪄', emoji: '🪄', unlockCondition: { type: 'default' } },
  bow: { id: 'bow', name: 'Arc', icon: '🏹', emoji: '🏹', unlockCondition: { type: 'level', value: 3 } },
  axe: { id: 'axe', name: 'Hache', icon: '🪓', emoji: '🪓', unlockCondition: { type: 'level', value: 5 } },
  dagger: { id: 'dagger', name: 'Dague', icon: '🗡️', emoji: '🗡️', unlockCondition: { type: 'level', value: 4 } },
  shield: { id: 'shield', name: 'Bouclier', icon: '🛡️', emoji: '🛡️', unlockCondition: { type: 'level', value: 6 } },
  hammer: { id: 'hammer', name: 'Marteau', icon: '🔨', emoji: '🔨', unlockCondition: { type: 'level', value: 8 } },
  scythe: { id: 'scythe', name: 'Faux', icon: '⚰️', emoji: '💀', unlockCondition: { type: 'level', value: 15 } },
  trident: { id: 'trident', name: 'Trident', icon: '🔱', emoji: '🔱', unlockCondition: { type: 'level', value: 12 } },
  crystal: { id: 'crystal', name: 'Cristal', icon: '💎', emoji: '💎', unlockCondition: { type: 'badges', value: 10 } },
  fire_sword: { id: 'fire_sword', name: 'Épée de feu', icon: '🔥', emoji: '🔥⚔️', unlockCondition: { type: 'level', value: 18 } },
  ice_staff: { id: 'ice_staff', name: 'Bâton de glace', icon: '❄️', emoji: '❄️🪄', unlockCondition: { type: 'level', value: 18 } },
  holy_sword: { id: 'holy_sword', name: 'Épée sacrée', icon: '✨', emoji: '✨⚔️', unlockCondition: { type: 'level', value: 20 } },
  dark_blade: { id: 'dark_blade', name: 'Lame obscure', icon: '🌑', emoji: '🌑⚔️', unlockCondition: { type: 'level', value: 20 } },
  legendary: { id: 'legendary', name: 'Arme légendaire', icon: '⭐', emoji: '⭐⚔️', unlockCondition: { type: 'level', value: 25 } },
  dual_blades: { id: 'dual_blades', name: 'Doubles lames', icon: '⚔️', emoji: '⚔️⚔️', unlockCondition: { type: 'challenges', value: 10 } },
  magic_book: { id: 'magic_book', name: 'Grimoire', icon: '📖', emoji: '📖', unlockCondition: { type: 'xp', value: 5000 } }
};

// ==========================================
// COMPAGNONS (affichés à côté de l'avatar)
// ==========================================
export const RPG_COMPANIONS = {
  none: { id: 'none', name: 'Aucun', icon: '❌', emoji: null, unlockCondition: { type: 'default' } },
  wolf: { id: 'wolf', name: 'Loup', icon: '🐺', emoji: '🐺', unlockCondition: { type: 'level', value: 3 } },
  cat: { id: 'cat', name: 'Chat', icon: '🐱', emoji: '🐱', unlockCondition: { type: 'default' } },
  owl: { id: 'owl', name: 'Hibou', icon: '🦉', emoji: '🦉', unlockCondition: { type: 'level', value: 5 } },
  dragon: { id: 'dragon', name: 'Dragon', icon: '🐉', emoji: '🐉', unlockCondition: { type: 'level', value: 15 } },
  phoenix: { id: 'phoenix', name: 'Phénix', icon: '🔥', emoji: '🦅🔥', unlockCondition: { type: 'level', value: 20 } },
  unicorn: { id: 'unicorn', name: 'Licorne', icon: '🦄', emoji: '🦄', unlockCondition: { type: 'badges', value: 10 } },
  fairy: { id: 'fairy', name: 'Fée', icon: '🧚', emoji: '🧚', unlockCondition: { type: 'level', value: 8 } },
  raven: { id: 'raven', name: 'Corbeau', icon: '🐦‍⬛', emoji: '🐦‍⬛', unlockCondition: { type: 'level', value: 10 } },
  snake: { id: 'snake', name: 'Serpent', icon: '🐍', emoji: '🐍', unlockCondition: { type: 'streak', value: 7 } },
  bear: { id: 'bear', name: 'Ours', icon: '🐻', emoji: '🐻', unlockCondition: { type: 'level', value: 12 } },
  eagle: { id: 'eagle', name: 'Aigle', icon: '🦅', emoji: '🦅', unlockCondition: { type: 'level', value: 7 } },
  fox: { id: 'fox', name: 'Renard', icon: '🦊', emoji: '🦊', unlockCondition: { type: 'level', value: 4 } },
  tiger: { id: 'tiger', name: 'Tigre', icon: '🐯', emoji: '🐯', unlockCondition: { type: 'level', value: 18 } },
  ghost: { id: 'ghost', name: 'Fantôme', icon: '👻', emoji: '👻', unlockCondition: { type: 'level', value: 13 } },
  spirit: { id: 'spirit', name: 'Esprit', icon: '✨', emoji: '✨👻', unlockCondition: { type: 'xp', value: 8000 } },
  golem: { id: 'golem', name: 'Golem', icon: '🪨', emoji: '🗿', unlockCondition: { type: 'challenges', value: 5 } },
  familiar: { id: 'familiar', name: 'Familier', icon: '🔮', emoji: '🔮', unlockCondition: { type: 'tasks', value: 30 } }
};

// ==========================================
// EFFETS (aura/particules autour de l'avatar)
// ==========================================
export const RPG_EFFECTS = {
  none: { id: 'none', name: 'Aucun', icon: '❌', cssClass: '', unlockCondition: { type: 'default' } },
  sparkle: { id: 'sparkle', name: 'Étincelles', icon: '✨', cssClass: 'animate-pulse', color: '#ffd700', unlockCondition: { type: 'level', value: 3 } },
  fire_aura: { id: 'fire_aura', name: 'Aura de feu', icon: '🔥', cssClass: '', color: '#ff4500', unlockCondition: { type: 'level', value: 8 } },
  ice_aura: { id: 'ice_aura', name: 'Aura de glace', icon: '❄️', cssClass: '', color: '#00bfff', unlockCondition: { type: 'level', value: 8 } },
  lightning: { id: 'lightning', name: 'Éclairs', icon: '⚡', cssClass: '', color: '#ffff00', unlockCondition: { type: 'level', value: 10 } },
  shadow: { id: 'shadow', name: 'Ombre', icon: '🌑', cssClass: '', color: '#2c3e50', unlockCondition: { type: 'level', value: 12 } },
  holy: { id: 'holy', name: 'Lumière sacrée', icon: '☀️', cssClass: '', color: '#fff9c4', unlockCondition: { type: 'level', value: 15 } },
  nature: { id: 'nature', name: 'Nature', icon: '🌿', cssClass: '', color: '#4caf50', unlockCondition: { type: 'badges', value: 8 } },
  arcane: { id: 'arcane', name: 'Arcane', icon: '🔮', cssClass: '', color: '#9c27b0', unlockCondition: { type: 'level', value: 18 } },
  void: { id: 'void', name: 'Néant', icon: '🕳️', cssClass: '', color: '#1a1a2e', unlockCondition: { type: 'level', value: 20 } },
  rainbow: { id: 'rainbow', name: 'Arc-en-ciel', icon: '🌈', cssClass: '', color: 'rainbow', unlockCondition: { type: 'streak', value: 30 } },
  legendary: { id: 'legendary', name: 'Légendaire', icon: '⭐', cssClass: '', color: '#ffd700', unlockCondition: { type: 'level', value: 25 } }
};

// ==========================================
// FONDS
// ==========================================
export const RPG_BACKGROUNDS = {
  default: { id: 'default', name: 'Classique', gradient: 'from-indigo-900 to-purple-900', color: 'b6e3f4', unlockCondition: { type: 'default' } },
  forest: { id: 'forest', name: 'Forêt', gradient: 'from-green-900 to-emerald-900', color: '2ecc71', unlockCondition: { type: 'level', value: 2 } },
  fire: { id: 'fire', name: 'Flammes', gradient: 'from-red-900 to-orange-900', color: 'e74c3c', unlockCondition: { type: 'level', value: 4 } },
  ice: { id: 'ice', name: 'Glace', gradient: 'from-cyan-900 to-blue-900', color: '3498db', unlockCondition: { type: 'level', value: 4 } },
  shadow: { id: 'shadow', name: 'Ombres', gradient: 'from-gray-900 to-slate-900', color: '2c3e50', unlockCondition: { type: 'level', value: 6 } },
  celestial: { id: 'celestial', name: 'Céleste', gradient: 'from-violet-900 to-purple-900', color: 'c0aede', unlockCondition: { type: 'level', value: 8 } },
  ocean: { id: 'ocean', name: 'Océan', gradient: 'from-blue-900 to-teal-900', color: '00bcd4', unlockCondition: { type: 'level', value: 10 } },
  desert: { id: 'desert', name: 'Désert', gradient: 'from-amber-900 to-orange-900', color: 'ff9800', unlockCondition: { type: 'level', value: 12 } },
  void: { id: 'void', name: 'Néant', gradient: 'from-black to-gray-900', color: '1a1a2e', unlockCondition: { type: 'level', value: 15 } },
  holy: { id: 'holy', name: 'Sacré', gradient: 'from-yellow-800 to-amber-900', color: 'fff9c4', unlockCondition: { type: 'level', value: 18 } },
  legendary: { id: 'legendary', name: 'Légendaire', gradient: 'from-yellow-600 via-red-600 to-purple-600', color: 'ffd700', unlockCondition: { type: 'level', value: 25 } }
};

// Configuration par défaut
export const DEFAULT_DICEBEAR_CONFIG = {
  class: 'mage',
  color: 'natural',
  headgear: 'none',
  weapon: 'staff',
  companion: 'none',
  effect: 'none',
  background: 'default'
};

// ==========================================
// UTILITAIRES
// ==========================================

export const isUnlocked = (item, userStats = {}) => {
  if (!item?.unlockCondition) return true;
  const condition = item.unlockCondition;

  switch (condition.type) {
    case 'default': return true;
    case 'level': return (userStats.level || 1) >= condition.value;
    case 'xp': return (userStats.totalXp || 0) >= condition.value;
    case 'tasks': return (userStats.tasksCompleted || 0) >= condition.value;
    case 'badges': return (userStats.badgesCount || 0) >= condition.value;
    case 'streak': return (userStats.currentStreak || 0) >= condition.value;
    case 'challenges': return (userStats.challengesCompleted || 0) >= condition.value;
    default: return false;
  }
};

export const getUnlockText = (item) => {
  if (!item?.unlockCondition) return '';
  const condition = item.unlockCondition;

  switch (condition.type) {
    case 'default': return 'Disponible';
    case 'level': return `Niveau ${condition.value}`;
    case 'xp': return `${condition.value} XP`;
    case 'tasks': return `${condition.value} tâches`;
    case 'badges': return `${condition.value} badges`;
    case 'streak': return `${condition.value}j série`;
    case 'challenges': return `${condition.value} défis`;
    default: return 'Verrouillé';
  }
};

export const getUnlockProgress = (item, userStats = {}) => {
  if (!item?.unlockCondition || item.unlockCondition.type === 'default') return 100;
  const condition = item.unlockCondition;
  let current = 0;

  switch (condition.type) {
    case 'level': current = userStats.level || 1; break;
    case 'xp': current = userStats.totalXp || 0; break;
    case 'tasks': current = userStats.tasksCompleted || 0; break;
    case 'badges': current = userStats.badgesCount || 0; break;
    case 'streak': current = userStats.currentStreak || 0; break;
    case 'challenges': current = userStats.challengesCompleted || 0; break;
    default: return 0;
  }

  return Math.min(100, Math.round((current / condition.value) * 100));
};

// Générer l'URL DiceBear avec les options RPG
export const generateDiceBearUrl = (config, size = 200) => {
  const rpgClass = RPG_CLASSES[config.class] || RPG_CLASSES.mage;
  const rpgColor = RPG_COLORS[config.color];
  const rpgHeadgear = RPG_HEADGEAR[config.headgear];
  const rpgBackground = RPG_BACKGROUNDS[config.background];

  const params = new URLSearchParams();

  // Seed basé sur la classe pour consistance
  params.append('seed', `synergia-${config.class}-${Date.now()}`);
  params.append('size', size);

  // Appliquer les options de la classe
  if (rpgClass.dicebear) {
    Object.entries(rpgClass.dicebear).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  // Override avec la couleur si pas "natural"
  if (rpgColor && rpgColor.hairColor) {
    params.append('hairColor', rpgColor.hairColor);
  }

  // Override avec le headgear
  if (rpgHeadgear && rpgHeadgear.hair) {
    params.append('hair', rpgHeadgear.hair);
  }
  if (rpgHeadgear && rpgHeadgear.glasses) {
    params.append('glasses', rpgHeadgear.glasses);
  }
  if (rpgHeadgear && rpgHeadgear.earrings) {
    params.append('earrings', rpgHeadgear.earrings);
  }

  // Background
  if (rpgBackground && rpgBackground.color) {
    params.append('backgroundColor', rpgBackground.color);
  }

  return `https://api.dicebear.com/7.x/adventurer/svg?${params.toString()}`;
};

// ==========================================
// COMPOSANT AVATAR PREVIEW RPG
// ==========================================
export const DiceBearAvatarPreview = ({
  config,
  size = 'large',
  showEffects = true,
  animated = true,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    tiny: 'w-8 h-8',
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40',
    xlarge: 'w-56 h-56'
  };

  const sizePx = { tiny: 32, small: 64, medium: 96, large: 160, xlarge: 224 };

  const avatarUrl = useMemo(() => {
    return generateDiceBearUrl(config, sizePx[size] * 2);
  }, [config, size]);

  const bgConfig = RPG_BACKGROUNDS[config.background] || RPG_BACKGROUNDS.default;
  const weapon = RPG_WEAPONS[config.weapon];
  const companion = RPG_COMPANIONS[config.companion];
  const effect = RPG_EFFECTS[config.effect];

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [avatarUrl]);

  return (
    <motion.div
      className={`relative ${className}`}
      animate={animated ? { y: [0, -3, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Effet d'aura */}
      {showEffects && effect && effect.id !== 'none' && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              `0 0 20px ${effect.color}40`,
              `0 0 40px ${effect.color}60`,
              `0 0 20px ${effect.color}40`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            filter: effect.color === 'rainbow' ? 'hue-rotate(360deg)' : 'none',
          }}
        />
      )}

      {/* Container principal */}
      <div className={`
        ${sizeClasses[size]} rounded-2xl overflow-hidden
        bg-gradient-to-br ${bgConfig.gradient}
        border-4 border-white/20 shadow-2xl
        flex items-center justify-center relative
      `}>
        {/* Avatar */}
        {!imageError ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-4xl">{RPG_CLASSES[config.class]?.icon || '👤'}</div>
        )}

        {/* Loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50" />
          </div>
        )}

        {/* Arme (coin bas droit) */}
        {weapon && weapon.emoji && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`absolute ${size === 'xlarge' ? 'bottom-2 right-2 text-3xl' : size === 'large' ? 'bottom-1 right-1 text-2xl' : 'bottom-0 right-0 text-lg'}`}
          >
            {weapon.emoji}
          </motion.div>
        )}

        {/* Compagnon (coin bas gauche) */}
        {companion && companion.emoji && (
          <motion.div
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`absolute ${size === 'xlarge' ? 'bottom-2 left-2 text-2xl' : size === 'large' ? 'bottom-1 left-1 text-xl' : 'bottom-0 left-0 text-base'}`}
          >
            {companion.emoji}
          </motion.div>
        )}
      </div>

      {/* Particules d'effet */}
      {showEffects && effect && effect.id !== 'none' && imageLoaded && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: effect.color === 'rainbow' ? ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#0099ff', '#9900ff'][i] : effect.color,
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                x: [0, (Math.random() - 0.5) * 60],
                y: [0, (Math.random() - 0.5) * 60]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT ITEM SELECTOR RPG
// ==========================================
const ItemSelector = ({ items, selectedId, onSelect, userStats, columns = 4 }) => {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Object.values(items).map((item) => {
        const unlocked = isUnlocked(item, userStats);
        const isSelected = selectedId === item.id;

        return (
          <motion.button
            key={item.id}
            onClick={() => unlocked && onSelect(item.id)}
            disabled={!unlocked}
            whileHover={unlocked ? { scale: 1.05 } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            className={`
              relative p-3 rounded-xl border-2 transition-all
              ${unlocked
                ? 'border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer'
                : 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-50'
              }
              ${isSelected ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-500/20' : ''}
            `}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs font-medium text-center ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </div>

            {isSelected && unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}

            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                <div className="text-center">
                  <Lock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-[9px] text-gray-400">{getUnlockText(item)}</p>
                </div>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL - RPG AVATAR BUILDER
// ==========================================
const DiceBearAvatarBuilder = ({
  initialConfig = DEFAULT_DICEBEAR_CONFIG,
  userStats = {},
  onSave,
  onCancel,
  saving = false
}) => {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState('class');

  const categories = [
    { id: 'class', label: 'Classe', icon: User, items: RPG_CLASSES },
    { id: 'color', label: 'Couleur', icon: Palette, items: RPG_COLORS },
    { id: 'headgear', label: 'Coiffe', icon: Crown, items: RPG_HEADGEAR },
    { id: 'weapon', label: 'Arme', icon: Sword, items: RPG_WEAPONS },
    { id: 'companion', label: 'Compagnon', icon: Heart, items: RPG_COMPANIONS },
    { id: 'effect', label: 'Effet', icon: Sparkles, items: RPG_EFFECTS },
    { id: 'background', label: 'Fond', icon: Image, items: RPG_BACKGROUNDS }
  ];

  const unlockStats = useMemo(() => {
    let total = 0, unlocked = 0;
    categories.forEach(cat => {
      const items = Object.values(cat.items);
      total += items.length;
      unlocked += items.filter(item => isUnlocked(item, userStats)).length;
    });
    return { total, unlocked, percentage: Math.round((unlocked / total) * 100) };
  }, [userStats]);

  const handleSelect = (categoryId, itemId) => {
    setConfig(prev => ({ ...prev, [categoryId]: itemId }));
  };

  const handleRandomize = () => {
    const newConfig = { ...config };
    categories.forEach(cat => {
      const items = Object.values(cat.items).filter(item => isUnlocked(item, userStats));
      if (items.length > 0) {
        newConfig[cat.id] = items[Math.floor(Math.random() * items.length)].id;
      }
    });
    setConfig(newConfig);
  };

  const handleReset = () => setConfig(DEFAULT_DICEBEAR_CONFIG);
  const handleSave = () => onSave && onSave(config);

  const currentCategory = categories.find(c => c.id === activeTab);
  const currentClass = RPG_CLASSES[config.class];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Preview */}
      <div className="lg:col-span-1 space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Aperçu
            </h3>
          </div>

          <div className="flex justify-center py-4">
            <DiceBearAvatarPreview config={config} size="xlarge" />
          </div>

          {/* Info classe */}
          <div className="mt-4 p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{currentClass?.icon}</span>
              <div>
                <p className="text-white font-semibold">{currentClass?.name}</p>
                <p className="text-xs text-gray-400">{currentClass?.description}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <motion.button
              onClick={handleRandomize}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-300 text-sm font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Aléatoire
            </motion.button>
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Débloqués</span>
              <span className="text-sm font-bold text-purple-300">{unlockStats.unlocked}/{unlockStats.total}</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${unlockStats.percentage}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>

          {/* Save */}
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sauvegarde...</>
            ) : (
              <><Save className="w-4 h-4" /> Sauvegarder</>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Options */}
      <div className="lg:col-span-2 space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const itemCount = Object.keys(cat.items).length;
            const unlockedCount = Object.values(cat.items).filter(item => isUnlocked(item, userStats)).length;

            return (
              <motion.button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                  ${activeTab === cat.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                <span className={`text-xs px-1.5 py-0.5 rounded ${activeTab === cat.id ? 'bg-white/20' : 'bg-white/10'}`}>
                  {unlockedCount}/{itemCount}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              {currentCategory && <currentCategory.icon className="w-5 h-5 text-purple-400" />}
              {currentCategory?.label}
            </h3>
            <span className="text-sm text-gray-400">
              {currentCategory?.items[config[activeTab]]?.name || 'Aucun'}
            </span>
          </div>

          <ItemSelector
            items={currentCategory?.items || {}}
            selectedId={config[activeTab]}
            onSelect={(id) => handleSelect(activeTab, id)}
            userStats={userStats}
            columns={activeTab === 'class' ? 5 : 6}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DiceBearAvatarBuilder;
export { DiceBearAvatarBuilder };

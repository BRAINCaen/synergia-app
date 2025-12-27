// ==========================================
// SYNERGIA v5.0 - DETAILED PIXEL ART AVATAR SYSTEM
// Avatars RPG ultra-détaillés style rétro avec personnalisation complète
// Inspiré des sprites de jeux RPG classiques
// ==========================================

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, Sword, Shield, Crown, Sparkles,
  Lock, Check, ChevronRight, ChevronLeft, Star, Zap,
  RefreshCw, Save, Eye, Axe, Wand2, Target, Heart,
  Cat, Bird, Gem, Shirt
} from 'lucide-react';

// ==========================================
// GENRES
// ==========================================
export const GENDERS = {
  male: { id: 'male', name: 'Masculin', icon: '♂️', unlockCondition: { type: 'default' } },
  female: { id: 'female', name: 'Féminin', icon: '♀️', unlockCondition: { type: 'default' } }
};

// ==========================================
// RACES DISPONIBLES
// ==========================================
export const RACES = {
  human: {
    id: 'human',
    name: 'Humain',
    icon: '🧑',
    description: 'Polyvalent et adaptable',
    heightMod: 0,
    widthMod: 0,
    skinTones: ['fair', 'light', 'medium', 'tan', 'dark', 'ebony'],
    canHaveBeard: true,
    unlockCondition: { type: 'default' }
  },
  dwarf: {
    id: 'dwarf',
    name: 'Nain',
    icon: '⛏️',
    description: 'Robuste et résistant',
    heightMod: -8,
    widthMod: 4,
    skinTones: ['fair', 'light', 'medium', 'tan', 'ruddy'],
    canHaveBeard: true,
    defaultBeard: 'full',
    unlockCondition: { type: 'default' }
  },
  elf: {
    id: 'elf',
    name: 'Elfe',
    icon: '🧝',
    description: 'Gracieux et agile',
    heightMod: 4,
    widthMod: -2,
    skinTones: ['pale', 'fair', 'golden', 'silver', 'woodland'],
    canHaveBeard: false,
    unlockCondition: { type: 'level', value: 2 }
  },
  orc: {
    id: 'orc',
    name: 'Orc',
    icon: '👹',
    description: 'Puissant et féroce',
    heightMod: 6,
    widthMod: 6,
    skinTones: ['green', 'olive', 'gray', 'brown', 'pale_green'],
    canHaveBeard: true,
    unlockCondition: { type: 'level', value: 3 }
  },
  goblin: {
    id: 'goblin',
    name: 'Gobelin',
    icon: '👺',
    description: 'Petit mais rusé',
    heightMod: -10,
    widthMod: -2,
    skinTones: ['green', 'olive', 'yellow_green', 'gray'],
    canHaveBeard: false,
    unlockCondition: { type: 'level', value: 4 }
  },
  undead: {
    id: 'undead',
    name: 'Mort-vivant',
    icon: '💀',
    description: 'Revenu d\'entre les morts',
    heightMod: 0,
    widthMod: 0,
    skinTones: ['pale_gray', 'green_decay', 'bone', 'dark_purple'],
    canHaveBeard: false,
    unlockCondition: { type: 'level', value: 6 }
  },
  troll: {
    id: 'troll',
    name: 'Troll',
    icon: '🧌',
    description: 'Géant régénérant',
    heightMod: 10,
    widthMod: 8,
    skinTones: ['moss_green', 'stone_gray', 'swamp', 'blue_troll'],
    canHaveBeard: false,
    unlockCondition: { type: 'level', value: 8 }
  },
  tiefling: {
    id: 'tiefling',
    name: 'Tieffelin',
    icon: '😈',
    description: 'Descendant démoniaque',
    heightMod: 2,
    widthMod: 0,
    skinTones: ['red_demon', 'purple_demon', 'blue_demon', 'dark_demon'],
    canHaveBeard: true,
    hasHorns: true,
    unlockCondition: { type: 'level', value: 10 }
  },
  fairy: {
    id: 'fairy',
    name: 'Fée',
    icon: '🧚',
    description: 'Créature magique ailée',
    heightMod: -12,
    widthMod: -4,
    skinTones: ['fairy_pink', 'fairy_blue', 'fairy_green', 'fairy_gold'],
    canHaveBeard: false,
    hasWings: true,
    unlockCondition: { type: 'level', value: 12 }
  },
  dragonborn: {
    id: 'dragonborn',
    name: 'Drakéide',
    icon: '🐲',
    description: 'Descendant des dragons',
    heightMod: 6,
    widthMod: 4,
    skinTones: ['dragon_red', 'dragon_blue', 'dragon_green', 'dragon_gold', 'dragon_black'],
    canHaveBeard: false,
    hasScales: true,
    unlockCondition: { type: 'level', value: 15 }
  }
};

// ==========================================
// COULEURS DE PEAU PAR RACE
// ==========================================
export const SKIN_COLORS = {
  // Humains
  fair: { base: '#FFE4C4', light: '#FFF0DB', dark: '#E8C9A4', shadow: '#D4A574' },
  light: { base: '#F5DEB3', light: '#FFF8DC', dark: '#DEC591', shadow: '#C4A574' },
  medium: { base: '#DEB887', light: '#F5DEB3', dark: '#C4A574', shadow: '#A68B5B' },
  tan: { base: '#D2A679', light: '#E8C9A4', dark: '#B8956A', shadow: '#8B7355' },
  dark: { base: '#8B7355', light: '#A68B5B', dark: '#6B5344', shadow: '#4A3728' },
  ebony: { base: '#5D4E37', light: '#6B5344', dark: '#4A3728', shadow: '#2D1F17' },
  // Nains
  ruddy: { base: '#E8B89D', light: '#FFD4BB', dark: '#C49A7E', shadow: '#A67B5B' },
  // Elfes
  pale: { base: '#FFF5EE', light: '#FFFFFF', dark: '#F0E6DC', shadow: '#E0D0C0' },
  golden: { base: '#FFEFD5', light: '#FFF8E7', dark: '#E8D5B5', shadow: '#D4C4A8' },
  silver: { base: '#E8E8F0', light: '#F5F5FF', dark: '#D0D0E0', shadow: '#B8B8D0' },
  woodland: { base: '#C9E4C5', light: '#E0F0DC', dark: '#A8C4A4', shadow: '#88A484' },
  // Orcs
  green: { base: '#6B8E23', light: '#8FBC3F', dark: '#556B2F', shadow: '#3D4F1F' },
  olive: { base: '#808000', light: '#9ACD32', dark: '#6B6B00', shadow: '#4F4F00' },
  gray: { base: '#708090', light: '#8899AA', dark: '#5A6A7A', shadow: '#4A5A6A' },
  pale_green: { base: '#98FB98', light: '#B0FFB0', dark: '#7AD97A', shadow: '#5CB85C' },
  // Gobelins
  yellow_green: { base: '#9ACD32', light: '#ADFF2F', dark: '#6B8E23', shadow: '#556B2F' },
  // Morts-vivants
  pale_gray: { base: '#A0A0A0', light: '#C0C0C0', dark: '#707070', shadow: '#505050' },
  green_decay: { base: '#6B8B6B', light: '#8FAF8F', dark: '#4A6B4A', shadow: '#2A4B2A' },
  bone: { base: '#E8DCC8', light: '#FFF8E7', dark: '#C4B8A4', shadow: '#A09080' },
  dark_purple: { base: '#5C4B6B', light: '#7B6A8B', dark: '#3C2B4B', shadow: '#2C1B3B' },
  // Trolls
  moss_green: { base: '#5A7A4A', light: '#7A9A6A', dark: '#3A5A2A', shadow: '#2A4A1A' },
  stone_gray: { base: '#6A6A6A', light: '#8A8A8A', dark: '#4A4A4A', shadow: '#3A3A3A' },
  swamp: { base: '#4A5A2A', light: '#6A7A4A', dark: '#2A3A0A', shadow: '#1A2A00' },
  blue_troll: { base: '#4A5A7A', light: '#6A7A9A', dark: '#2A3A5A', shadow: '#1A2A4A' },
  // Tieffelins (démons)
  red_demon: { base: '#A02020', light: '#C04040', dark: '#801010', shadow: '#600000' },
  purple_demon: { base: '#6B2D6B', light: '#8B4D8B', dark: '#4B0D4B', shadow: '#3B003B' },
  blue_demon: { base: '#2D4D8B', light: '#4D6DAB', dark: '#0D2D6B', shadow: '#001D5B' },
  dark_demon: { base: '#2D2D3D', light: '#4D4D5D', dark: '#1D1D2D', shadow: '#0D0D1D' },
  // Fées
  fairy_pink: { base: '#FFB6C1', light: '#FFD0D5', dark: '#FF9AAD', shadow: '#FF7A8D' },
  fairy_blue: { base: '#B0E0E6', light: '#D0F0F6', dark: '#90C0D6', shadow: '#70A0B6' },
  fairy_green: { base: '#98FB98', light: '#B8FFB8', dark: '#78DB78', shadow: '#58BB58' },
  fairy_gold: { base: '#FFD700', light: '#FFE740', dark: '#DDB700', shadow: '#BB9700' },
  // Drakéides (dragons)
  dragon_red: { base: '#8B2500', light: '#AB4520', dark: '#6B0500', shadow: '#4B0000' },
  dragon_blue: { base: '#25558B', light: '#4575AB', dark: '#05356B', shadow: '#00254B' },
  dragon_green: { base: '#228B22', light: '#42AB42', dark: '#026B02', shadow: '#004B00' },
  dragon_gold: { base: '#B8860B', light: '#D8A62B', dark: '#986600', shadow: '#785600' },
  dragon_black: { base: '#2D2D2D', light: '#4D4D4D', dark: '#1D1D1D', shadow: '#0D0D0D' }
};

// ==========================================
// COULEURS DE CHEVEUX
// ==========================================
export const HAIR_COLORS = {
  black: { base: '#1A1A1A', light: '#2D2D2D', dark: '#0D0D0D', highlight: '#404040' },
  brown: { base: '#4A3728', light: '#5C4533', dark: '#2D1F17', highlight: '#6B5344' },
  auburn: { base: '#8B4513', light: '#A0522D', dark: '#5C2E0C', highlight: '#CD853F' },
  red: { base: '#B22222', light: '#CD5C5C', dark: '#8B0000', highlight: '#DC143C' },
  blonde: { base: '#DAA520', light: '#FFD700', dark: '#B8860B', highlight: '#FFEC8B' },
  platinum: { base: '#E8E8E8', light: '#FFFFFF', dark: '#C0C0C0', highlight: '#F5F5F5' },
  white: { base: '#F5F5F5', light: '#FFFFFF', dark: '#E0E0E0', highlight: '#FFFFFF' },
  blue: { base: '#4169E1', light: '#6495ED', dark: '#2E4A9E', highlight: '#87CEEB' },
  green: { base: '#228B22', light: '#32CD32', dark: '#155615', highlight: '#90EE90' },
  purple: { base: '#9932CC', light: '#BA55D3', dark: '#6B1F8A', highlight: '#DA70D6' }
};

// ==========================================
// STYLES DE CHEVEUX
// ==========================================
export const HAIR_STYLES = {
  none: { id: 'none', name: 'Chauve', icon: '👨‍🦲', unlockCondition: { type: 'default' } },
  short: { id: 'short', name: 'Court', icon: '💇', unlockCondition: { type: 'default' } },
  medium: { id: 'medium', name: 'Mi-long', icon: '💇‍♂️', unlockCondition: { type: 'default' } },
  long: { id: 'long', name: 'Long', icon: '💇‍♀️', unlockCondition: { type: 'level', value: 2 } },
  mohawk: { id: 'mohawk', name: 'Crête', icon: '🦔', unlockCondition: { type: 'level', value: 4 } },
  ponytail: { id: 'ponytail', name: 'Queue', icon: '🎀', unlockCondition: { type: 'level', value: 3 } },
  braids: { id: 'braids', name: 'Tresses', icon: '🪢', unlockCondition: { type: 'level', value: 5 } },
  wild: { id: 'wild', name: 'Sauvage', icon: '🦁', unlockCondition: { type: 'level', value: 6 } }
};

// ==========================================
// STYLES DE BARBE
// ==========================================
export const BEARD_STYLES = {
  none: { id: 'none', name: 'Rasé', icon: '😶', unlockCondition: { type: 'default' } },
  stubble: { id: 'stubble', name: 'Barbe 3 jours', icon: '🧔‍♂️', unlockCondition: { type: 'default' } },
  short: { id: 'short', name: 'Courte', icon: '🧔', unlockCondition: { type: 'default' } },
  full: { id: 'full', name: 'Complète', icon: '🧔‍♂️', unlockCondition: { type: 'level', value: 2 } },
  long: { id: 'long', name: 'Longue', icon: '🧙', unlockCondition: { type: 'level', value: 4 } },
  braided: { id: 'braided', name: 'Tressée', icon: '⛓️', unlockCondition: { type: 'level', value: 6 } },
  forked: { id: 'forked', name: 'Fourchue', icon: '🔱', unlockCondition: { type: 'level', value: 8 } },
  massive: { id: 'massive', name: 'Massive', icon: '🦁', unlockCondition: { type: 'level', value: 10 } }
};

// ==========================================
// TYPES D'ARMURE
// ==========================================
export const ARMOR_TYPES = {
  cloth: {
    id: 'cloth',
    name: 'Tissu',
    icon: '👕',
    description: 'Léger et confortable',
    unlockCondition: { type: 'default' }
  },
  leather: {
    id: 'leather',
    name: 'Cuir',
    icon: '🥋',
    description: 'Souple et résistant',
    unlockCondition: { type: 'default' }
  },
  chainmail: {
    id: 'chainmail',
    name: 'Cotte de mailles',
    icon: '⛓️',
    description: 'Protection intermédiaire',
    unlockCondition: { type: 'level', value: 3 }
  },
  plate: {
    id: 'plate',
    name: 'Plaques',
    icon: '🛡️',
    description: 'Protection maximale',
    unlockCondition: { type: 'level', value: 5 }
  },
  robe: {
    id: 'robe',
    name: 'Robe',
    icon: '🧥',
    description: 'Tenue de mage',
    unlockCondition: { type: 'level', value: 2 }
  },
  barbarian: {
    id: 'barbarian',
    name: 'Barbare',
    icon: '💪',
    description: 'Armure minimale',
    unlockCondition: { type: 'level', value: 4 }
  }
};

// ==========================================
// COULEURS D'ARMURE
// ==========================================
export const ARMOR_COLORS = {
  brown: { base: '#8B4513', light: '#A0522D', dark: '#5C2E0C', accent: '#CD853F' },
  gray: { base: '#708090', light: '#8899AA', dark: '#4A5A6A', accent: '#A8B8C8' },
  silver: { base: '#C0C0C0', light: '#E0E0E0', dark: '#808080', accent: '#FFFFFF' },
  gold: { base: '#DAA520', light: '#FFD700', dark: '#B8860B', accent: '#FFEC8B' },
  red: { base: '#DC143C', light: '#FF4040', dark: '#8B0A0A', accent: '#FF6B6B' },
  blue: { base: '#4169E1', light: '#6495ED', dark: '#2E4A9E', accent: '#87CEEB' },
  green: { base: '#228B22', light: '#32CD32', dark: '#155615', accent: '#90EE90' },
  purple: { base: '#9932CC', light: '#BA55D3', dark: '#6B1F8A', accent: '#DA70D6' },
  black: { base: '#2D2D2D', light: '#404040', dark: '#1A1A1A', accent: '#606060' },
  white: { base: '#F0F0F0', light: '#FFFFFF', dark: '#D0D0D0', accent: '#FFFFFF' }
};

// ==========================================
// TYPES D'ARMES
// ==========================================
export const WEAPON_TYPES = {
  none: { id: 'none', name: 'Aucune', icon: '✋', unlockCondition: { type: 'default' } },
  sword: { id: 'sword', name: 'Épée', icon: '⚔️', twoHanded: false, unlockCondition: { type: 'default' } },
  axe: { id: 'axe', name: 'Hache', icon: '🪓', twoHanded: false, unlockCondition: { type: 'default' } },
  hammer: { id: 'hammer', name: 'Marteau', icon: '🔨', twoHanded: false, unlockCondition: { type: 'level', value: 2 } },
  greatsword: { id: 'greatsword', name: 'Espadon', icon: '🗡️', twoHanded: true, unlockCondition: { type: 'level', value: 4 } },
  battleaxe: { id: 'battleaxe', name: 'Hache de guerre', icon: '⚒️', twoHanded: true, unlockCondition: { type: 'level', value: 4 } },
  bow: { id: 'bow', name: 'Arc', icon: '🏹', twoHanded: true, unlockCondition: { type: 'level', value: 2 } },
  crossbow: { id: 'crossbow', name: 'Arbalète', icon: '🎯', twoHanded: true, unlockCondition: { type: 'level', value: 5 } },
  staff: { id: 'staff', name: 'Bâton', icon: '🪄', twoHanded: true, unlockCondition: { type: 'level', value: 2 } },
  dagger: { id: 'dagger', name: 'Dague', icon: '🗡️', twoHanded: false, unlockCondition: { type: 'level', value: 1 } },
  mace: { id: 'mace', name: 'Masse', icon: '🔱', twoHanded: false, unlockCondition: { type: 'level', value: 3 } },
  spear: { id: 'spear', name: 'Lance', icon: '🔱', twoHanded: true, unlockCondition: { type: 'level', value: 3 } }
};

// ==========================================
// TYPES DE BOUCLIER
// ==========================================
export const SHIELD_TYPES = {
  none: { id: 'none', name: 'Aucun', icon: '✋', unlockCondition: { type: 'default' } },
  buckler: { id: 'buckler', name: 'Rondache', icon: '🛡️', unlockCondition: { type: 'default' } },
  kite: { id: 'kite', name: 'Écu', icon: '🛡️', unlockCondition: { type: 'level', value: 2 } },
  tower: { id: 'tower', name: 'Pavois', icon: '🛡️', unlockCondition: { type: 'level', value: 5 } },
  round: { id: 'round', name: 'Rond', icon: '⭕', unlockCondition: { type: 'level', value: 3 } }
};

// ==========================================
// TYPES DE CASQUE
// ==========================================
export const HELMET_TYPES = {
  none: { id: 'none', name: 'Aucun', icon: '😶', unlockCondition: { type: 'default' } },
  cap: { id: 'cap', name: 'Chapeau', icon: '🎩', unlockCondition: { type: 'default' } },
  hood: { id: 'hood', name: 'Capuche', icon: '🧥', unlockCondition: { type: 'default' } },
  helm: { id: 'helm', name: 'Heaume', icon: '⛑️', unlockCondition: { type: 'level', value: 3 } },
  crown: { id: 'crown', name: 'Couronne', icon: '👑', unlockCondition: { type: 'level', value: 10 } },
  horned: { id: 'horned', name: 'Cornes', icon: '🐂', unlockCondition: { type: 'level', value: 5 } },
  winged: { id: 'winged', name: 'Ailé', icon: '🪽', unlockCondition: { type: 'level', value: 8 } },
  wizard: { id: 'wizard', name: 'Mage', icon: '🧙', unlockCondition: { type: 'level', value: 4 } }
};

// ==========================================
// CAPES
// ==========================================
export const CAPE_TYPES = {
  none: { id: 'none', name: 'Aucune', icon: '✋', unlockCondition: { type: 'default' } },
  short: { id: 'short', name: 'Courte', icon: '🧣', unlockCondition: { type: 'level', value: 2 } },
  long: { id: 'long', name: 'Longue', icon: '🦸', unlockCondition: { type: 'level', value: 4 } },
  tattered: { id: 'tattered', name: 'Déchirée', icon: '💨', unlockCondition: { type: 'level', value: 3 } },
  royal: { id: 'royal', name: 'Royale', icon: '👑', unlockCondition: { type: 'level', value: 8 } }
};

// ==========================================
// COULEURS DE CAPE
// ==========================================
export const CAPE_COLORS = {
  red: { base: '#DC143C', light: '#FF4040', dark: '#8B0A0A' },
  blue: { base: '#4169E1', light: '#6495ED', dark: '#2E4A9E' },
  green: { base: '#228B22', light: '#32CD32', dark: '#155615' },
  purple: { base: '#9932CC', light: '#BA55D3', dark: '#6B1F8A' },
  black: { base: '#2D2D2D', light: '#404040', dark: '#1A1A1A' },
  white: { base: '#F0F0F0', light: '#FFFFFF', dark: '#D0D0D0' },
  gold: { base: '#DAA520', light: '#FFD700', dark: '#B8860B' }
};

// ==========================================
// FONDS
// ==========================================
export const BACKGROUNDS = {
  none: { id: 'none', name: 'Aucun', gradient: 'transparent', unlockCondition: { type: 'default' } },
  forest: { id: 'forest', name: 'Forêt', gradient: 'linear-gradient(180deg, #1a3a1a 0%, #0d2a0d 100%)', unlockCondition: { type: 'default' } },
  dungeon: { id: 'dungeon', name: 'Donjon', gradient: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', unlockCondition: { type: 'default' } },
  mountain: { id: 'mountain', name: 'Montagne', gradient: 'linear-gradient(180deg, #4a4a6a 0%, #2a2a4a 100%)', unlockCondition: { type: 'level', value: 2 } },
  volcano: { id: 'volcano', name: 'Volcan', gradient: 'linear-gradient(180deg, #4a1a1a 0%, #2a0d0d 100%)', unlockCondition: { type: 'level', value: 4 } },
  ice: { id: 'ice', name: 'Glacial', gradient: 'linear-gradient(180deg, #2a4a6a 0%, #1a2a4a 100%)', unlockCondition: { type: 'level', value: 3 } },
  desert: { id: 'desert', name: 'Désert', gradient: 'linear-gradient(180deg, #6a5a3a 0%, #4a3a2a 100%)', unlockCondition: { type: 'level', value: 5 } },
  abyss: { id: 'abyss', name: 'Abysses', gradient: 'linear-gradient(180deg, #1a0a2a 0%, #0d0510 100%)', unlockCondition: { type: 'level', value: 8 } },
  celestial: { id: 'celestial', name: 'Céleste', gradient: 'linear-gradient(180deg, #2a2a5a 0%, #1a1a3a 50%, #3a2a4a 100%)', unlockCondition: { type: 'level', value: 10 } }
};

// ==========================================
// MONTURES
// ==========================================
export const MOUNTS = {
  none: { id: 'none', name: 'Aucune', icon: '🚶', unlockCondition: { type: 'default' } },
  horse: { id: 'horse', name: 'Cheval', icon: '🐎', unlockCondition: { type: 'level', value: 3 } },
  war_horse: { id: 'war_horse', name: 'Destrier', icon: '🏇', unlockCondition: { type: 'level', value: 6 } },
  wolf: { id: 'wolf', name: 'Loup', icon: '🐺', unlockCondition: { type: 'level', value: 5 } },
  bear: { id: 'bear', name: 'Ours', icon: '🐻', unlockCondition: { type: 'level', value: 8 } },
  boar: { id: 'boar', name: 'Sanglier', icon: '🐗', unlockCondition: { type: 'level', value: 4 } },
  ram: { id: 'ram', name: 'Bélier', icon: '🐏', unlockCondition: { type: 'level', value: 4 } },
  raptor: { id: 'raptor', name: 'Raptor', icon: '🦖', unlockCondition: { type: 'level', value: 10 } },
  wyvern: { id: 'wyvern', name: 'Wyverne', icon: '🐉', unlockCondition: { type: 'level', value: 15 } },
  griffin: { id: 'griffin', name: 'Griffon', icon: '🦅', unlockCondition: { type: 'level', value: 12 } },
  unicorn: { id: 'unicorn', name: 'Licorne', icon: '🦄', unlockCondition: { type: 'level', value: 10 } },
  nightmare: { id: 'nightmare', name: 'Cauchemar', icon: '🔥', unlockCondition: { type: 'level', value: 14 } },
  spider: { id: 'spider', name: 'Araignée géante', icon: '🕷️', unlockCondition: { type: 'level', value: 8 } },
  skeletal_horse: { id: 'skeletal_horse', name: 'Cheval squelette', icon: '💀', unlockCondition: { type: 'level', value: 12 } }
};

// ==========================================
// ANIMAUX TOTEMS
// ==========================================
export const TOTEM_ANIMALS = {
  none: { id: 'none', name: 'Aucun', icon: '✨', unlockCondition: { type: 'default' } },
  wolf: { id: 'wolf', name: 'Loup', icon: '🐺', description: 'Loyauté et meute', unlockCondition: { type: 'level', value: 2 } },
  eagle: { id: 'eagle', name: 'Aigle', icon: '🦅', description: 'Vision et liberté', unlockCondition: { type: 'level', value: 2 } },
  bear: { id: 'bear', name: 'Ours', icon: '🐻', description: 'Force et protection', unlockCondition: { type: 'level', value: 3 } },
  lion: { id: 'lion', name: 'Lion', icon: '🦁', description: 'Courage et noblesse', unlockCondition: { type: 'level', value: 4 } },
  snake: { id: 'snake', name: 'Serpent', icon: '🐍', description: 'Sagesse et transformation', unlockCondition: { type: 'level', value: 3 } },
  owl: { id: 'owl', name: 'Hibou', icon: '🦉', description: 'Connaissance et mystère', unlockCondition: { type: 'level', value: 3 } },
  raven: { id: 'raven', name: 'Corbeau', icon: '🐦‍⬛', description: 'Magie et prophétie', unlockCondition: { type: 'level', value: 4 } },
  stag: { id: 'stag', name: 'Cerf', icon: '🦌', description: 'Grâce et spiritualité', unlockCondition: { type: 'level', value: 3 } },
  fox: { id: 'fox', name: 'Renard', icon: '🦊', description: 'Ruse et adaptabilité', unlockCondition: { type: 'level', value: 2 } },
  dragon: { id: 'dragon', name: 'Dragon', icon: '🐲', description: 'Puissance et magie ancienne', unlockCondition: { type: 'level', value: 10 } },
  phoenix: { id: 'phoenix', name: 'Phénix', icon: '🔥', description: 'Renaissance et immortalité', unlockCondition: { type: 'level', value: 12 } },
  turtle: { id: 'turtle', name: 'Tortue', icon: '🐢', description: 'Patience et longévité', unlockCondition: { type: 'level', value: 2 } },
  spider: { id: 'spider', name: 'Araignée', icon: '🕷️', description: 'Création et destin', unlockCondition: { type: 'level', value: 5 } },
  bat: { id: 'bat', name: 'Chauve-souris', icon: '🦇', description: 'Intuition et renaissance', unlockCondition: { type: 'level', value: 4 } },
  cat: { id: 'cat', name: 'Chat', icon: '🐱', description: 'Indépendance et mystère', unlockCondition: { type: 'level', value: 2 } },
  horse: { id: 'horse', name: 'Cheval', icon: '🐴', description: 'Liberté et endurance', unlockCondition: { type: 'level', value: 2 } },
  boar: { id: 'boar', name: 'Sanglier', icon: '🐗', description: 'Bravoure et férocité', unlockCondition: { type: 'level', value: 3 } },
  crow: { id: 'crow', name: 'Corneille', icon: '🐦', description: 'Intelligence et mémoire', unlockCondition: { type: 'level', value: 3 } }
};

// ==========================================
// ACCESSOIRES SUPPLÉMENTAIRES
// ==========================================
export const ACCESSORIES = {
  none: { id: 'none', name: 'Aucun', icon: '✋', unlockCondition: { type: 'default' } },
  necklace: { id: 'necklace', name: 'Collier', icon: '📿', unlockCondition: { type: 'level', value: 2 } },
  earring: { id: 'earring', name: 'Boucle d\'oreille', icon: '💎', unlockCondition: { type: 'level', value: 2 } },
  eyepatch: { id: 'eyepatch', name: 'Cache-œil', icon: '🏴‍☠️', unlockCondition: { type: 'level', value: 3 } },
  scar: { id: 'scar', name: 'Cicatrice', icon: '⚔️', unlockCondition: { type: 'level', value: 3 } },
  tattoo: { id: 'tattoo', name: 'Tatouage', icon: '🎨', unlockCondition: { type: 'level', value: 4 } },
  glasses: { id: 'glasses', name: 'Lunettes', icon: '👓', unlockCondition: { type: 'level', value: 2 } },
  monocle: { id: 'monocle', name: 'Monocle', icon: '🧐', unlockCondition: { type: 'level', value: 4 } },
  pipe: { id: 'pipe', name: 'Pipe', icon: '🚬', unlockCondition: { type: 'level', value: 3 } },
  scarf: { id: 'scarf', name: 'Écharpe', icon: '🧣', unlockCondition: { type: 'level', value: 2 } },
  shoulder_pet: { id: 'shoulder_pet', name: 'Familier', icon: '🐦', unlockCondition: { type: 'level', value: 6 } },
  backpack: { id: 'backpack', name: 'Sac à dos', icon: '🎒', unlockCondition: { type: 'level', value: 2 } },
  quiver: { id: 'quiver', name: 'Carquois', icon: '🏹', unlockCondition: { type: 'level', value: 3 } },
  tome: { id: 'tome', name: 'Grimoire', icon: '📖', unlockCondition: { type: 'level', value: 4 } },
  belt_pouch: { id: 'belt_pouch', name: 'Sacoche', icon: '👝', unlockCondition: { type: 'level', value: 2 } },
  warpaint: { id: 'warpaint', name: 'Peinture de guerre', icon: '🎭', unlockCondition: { type: 'level', value: 5 } }
};

// ==========================================
// CONFIGURATION PAR DÉFAUT
// ==========================================
export const DEFAULT_DETAILED_CONFIG = {
  gender: 'male',
  race: 'human',
  skinColor: 'medium',
  hairStyle: 'short',
  hairColor: 'brown',
  beardStyle: 'none',
  beardColor: 'brown',
  armorType: 'leather',
  armorColor: 'brown',
  weapon: 'sword',
  shield: 'none',
  helmet: 'none',
  cape: 'none',
  capeColor: 'red',
  background: 'none',
  mount: 'none',
  totemAnimal: 'none',
  accessory: 'none',
  pose: 'idle'
};

// ==========================================
// POSES
// ==========================================
export const POSES = {
  idle: { id: 'idle', name: 'Repos', icon: '🧍', unlockCondition: { type: 'default' } },
  combat: { id: 'combat', name: 'Combat', icon: '⚔️', unlockCondition: { type: 'default' } },
  defend: { id: 'defend', name: 'Défense', icon: '🛡️', unlockCondition: { type: 'level', value: 2 } },
  cast: { id: 'cast', name: 'Incantation', icon: '✨', unlockCondition: { type: 'level', value: 3 } },
  victory: { id: 'victory', name: 'Victoire', icon: '🏆', unlockCondition: { type: 'level', value: 5 } }
};

// ==========================================
// VÉRIFICATION DÉVERROUILLAGE
// ==========================================
export const isUnlocked = (item, userStats) => {
  if (!item?.unlockCondition) return true;
  const { type, value } = item.unlockCondition;

  switch (type) {
    case 'default': return true;
    case 'level': return (userStats?.level || 1) >= value;
    case 'quests': return (userStats?.completedQuests || 0) >= value;
    case 'badges': return (userStats?.badgesCount || 0) >= value;
    default: return true;
  }
};

// ==========================================
// GÉNÉRATION SVG PIXEL ART DÉTAILLÉ
// ==========================================
const generateDetailedPixelArt = (config) => {
  const {
    gender = 'male',
    race = 'human',
    skinColor = 'medium',
    hairStyle = 'short',
    hairColor = 'brown',
    beardStyle = 'none',
    beardColor = 'brown',
    armorType = 'leather',
    armorColor = 'brown',
    weapon = 'sword',
    shield = 'none',
    helmet = 'none',
    cape = 'none',
    capeColor = 'red',
    mount = 'none',
    totemAnimal = 'none',
    accessory = 'none',
    pose = 'idle'
  } = config;

  const raceData = RACES[race] || RACES.human;
  const skin = SKIN_COLORS[skinColor] || SKIN_COLORS.medium;
  const hair = HAIR_COLORS[hairColor] || HAIR_COLORS.brown;
  const beard = HAIR_COLORS[beardColor] || HAIR_COLORS.brown;
  const armor = ARMOR_COLORS[armorColor] || ARMOR_COLORS.brown;
  const capeCol = CAPE_COLORS[capeColor] || CAPE_COLORS.red;
  const isFemale = gender === 'female';

  // Ajustements selon la race
  const heightMod = raceData.heightMod || 0;
  const widthMod = raceData.widthMod || 0;

  // Position de base du corps (centré dans le viewBox élargi 96x88)
  const baseX = 48 - widthMod / 2;
  const baseY = 20 - heightMod / 2;

  let svgContent = '';

  // ===== CAPE (derrière le personnage) =====
  if (cape !== 'none') {
    const capeStyles = {
      short: `
        <rect x="${baseX - 2}" y="${baseY + 18}" width="4" height="20" fill="${capeCol.dark}"/>
        <rect x="${baseX + 26 + widthMod}" y="${baseY + 18}" width="4" height="20" fill="${capeCol.dark}"/>
        <rect x="${baseX}" y="${baseY + 16}" width="${28 + widthMod}" height="22" fill="${capeCol.base}"/>
        <rect x="${baseX + 2}" y="${baseY + 18}" width="${24 + widthMod}" height="18" fill="${capeCol.light}"/>
      `,
      long: `
        <rect x="${baseX - 4}" y="${baseY + 16}" width="4" height="36" fill="${capeCol.dark}"/>
        <rect x="${baseX + 28 + widthMod}" y="${baseY + 16}" width="4" height="36" fill="${capeCol.dark}"/>
        <rect x="${baseX - 2}" y="${baseY + 14}" width="${32 + widthMod}" height="40" fill="${capeCol.base}"/>
        <rect x="${baseX}" y="${baseY + 16}" width="${28 + widthMod}" height="36" fill="${capeCol.light}"/>
        <rect x="${baseX + 4}" y="${baseY + 48}" width="6" height="4" fill="${capeCol.dark}"/>
        <rect x="${baseX + 18 + widthMod}" y="${baseY + 48}" width="6" height="4" fill="${capeCol.dark}"/>
      `,
      tattered: `
        <rect x="${baseX - 2}" y="${baseY + 16}" width="${32 + widthMod}" height="32" fill="${capeCol.base}"/>
        <rect x="${baseX}" y="${baseY + 44}" width="4" height="6" fill="${capeCol.base}"/>
        <rect x="${baseX + 8}" y="${baseY + 46}" width="4" height="4" fill="${capeCol.base}"/>
        <rect x="${baseX + 16 + widthMod}" y="${baseY + 44}" width="4" height="8" fill="${capeCol.base}"/>
        <rect x="${baseX + 24 + widthMod}" y="${baseY + 46}" width="4" height="4" fill="${capeCol.base}"/>
      `,
      royal: `
        <rect x="${baseX - 6}" y="${baseY + 14}" width="4" height="42" fill="${capeCol.dark}"/>
        <rect x="${baseX + 30 + widthMod}" y="${baseY + 14}" width="4" height="42" fill="${capeCol.dark}"/>
        <rect x="${baseX - 4}" y="${baseY + 12}" width="${36 + widthMod}" height="46" fill="${capeCol.base}"/>
        <rect x="${baseX - 2}" y="${baseY + 14}" width="${32 + widthMod}" height="42" fill="${capeCol.light}"/>
        <!-- Fourrure dorée -->
        <rect x="${baseX - 4}" y="${baseY + 12}" width="${36 + widthMod}" height="4" fill="#DAA520"/>
        <rect x="${baseX - 2}" y="${baseY + 14}" width="2" height="4" fill="#FFD700"/>
        <rect x="${baseX + 4}" y="${baseY + 14}" width="2" height="4" fill="#FFD700"/>
        <rect x="${baseX + 22 + widthMod}" y="${baseY + 14}" width="2" height="4" fill="#FFD700"/>
        <rect x="${baseX + 28 + widthMod}" y="${baseY + 14}" width="2" height="4" fill="#FFD700"/>
      `
    };
    svgContent += capeStyles[cape] || '';
  }

  // ===== JAMBES =====
  const legY = baseY + 40 - heightMod;
  svgContent += `
    <!-- Jambe gauche -->
    <rect x="${baseX + 6}" y="${legY}" width="8" height="16" fill="${armor.dark}"/>
    <rect x="${baseX + 8}" y="${legY + 2}" width="4" height="12" fill="${armor.base}"/>
    <!-- Botte gauche -->
    <rect x="${baseX + 4}" y="${legY + 12}" width="10" height="6" fill="#4a3728"/>
    <rect x="${baseX + 6}" y="${legY + 14}" width="6" height="2" fill="#5c4533"/>

    <!-- Jambe droite -->
    <rect x="${baseX + 14 + widthMod}" y="${legY}" width="8" height="16" fill="${armor.dark}"/>
    <rect x="${baseX + 16 + widthMod}" y="${legY + 2}" width="4" height="12" fill="${armor.base}"/>
    <!-- Botte droite -->
    <rect x="${baseX + 14 + widthMod}" y="${legY + 12}" width="10" height="6" fill="#4a3728"/>
    <rect x="${baseX + 16 + widthMod}" y="${legY + 14}" width="6" height="2" fill="#5c4533"/>
  `;

  // ===== CORPS / ARMURE =====
  const torsoY = baseY + 16;
  const armorStyles = {
    cloth: `
      <rect x="${baseX + 2}" y="${torsoY}" width="${24 + widthMod}" height="26" fill="${armor.base}"/>
      <rect x="${baseX + 4}" y="${torsoY + 2}" width="${20 + widthMod}" height="22" fill="${armor.light}"/>
      <rect x="${baseX + 10}" y="${torsoY + 4}" width="${8 + widthMod}" height="4" fill="${skin.base}"/>
    `,
    leather: `
      <rect x="${baseX + 2}" y="${torsoY}" width="${24 + widthMod}" height="26" fill="${armor.dark}"/>
      <rect x="${baseX + 4}" y="${torsoY + 2}" width="${20 + widthMod}" height="22" fill="${armor.base}"/>
      <!-- Détails cuir -->
      <rect x="${baseX + 6}" y="${torsoY + 6}" width="2" height="12" fill="${armor.dark}"/>
      <rect x="${baseX + 20 + widthMod}" y="${torsoY + 6}" width="2" height="12" fill="${armor.dark}"/>
      <!-- Ceinture -->
      <rect x="${baseX + 2}" y="${torsoY + 20}" width="${24 + widthMod}" height="4" fill="${armor.accent}"/>
      <rect x="${baseX + 12}" y="${torsoY + 20}" width="4" height="4" fill="#DAA520"/>
    `,
    chainmail: `
      <rect x="${baseX + 2}" y="${torsoY}" width="${24 + widthMod}" height="26" fill="${armor.dark}"/>
      <rect x="${baseX + 4}" y="${torsoY + 2}" width="${20 + widthMod}" height="22" fill="${armor.base}"/>
      <!-- Mailles pattern -->
      ${Array.from({length: 5}, (_, row) =>
        Array.from({length: 4}, (_, col) =>
          `<rect x="${baseX + 6 + col * 5}" y="${torsoY + 4 + row * 4}" width="2" height="2" fill="${armor.light}"/>`
        ).join('')
      ).join('')}
      <!-- Col -->
      <rect x="${baseX + 8}" y="${torsoY}" width="${12 + widthMod}" height="4" fill="${armor.light}"/>
    `,
    plate: `
      <rect x="${baseX}" y="${torsoY - 2}" width="${28 + widthMod}" height="30" fill="${armor.dark}"/>
      <rect x="${baseX + 2}" y="${torsoY}" width="${24 + widthMod}" height="26" fill="${armor.base}"/>
      <!-- Plastron central -->
      <rect x="${baseX + 8}" y="${torsoY + 4}" width="${12 + widthMod}" height="16" fill="${armor.light}"/>
      <rect x="${baseX + 10}" y="${torsoY + 6}" width="${8 + widthMod}" height="12" fill="${armor.accent}"/>
      <!-- Épaulières -->
      <rect x="${baseX - 2}" y="${torsoY}" width="6" height="8" fill="${armor.light}"/>
      <rect x="${baseX + 24 + widthMod}" y="${torsoY}" width="6" height="8" fill="${armor.light}"/>
      <!-- Ceinture décorée -->
      <rect x="${baseX}" y="${torsoY + 22}" width="${28 + widthMod}" height="4" fill="#DAA520"/>
      <rect x="${baseX + 12}" y="${torsoY + 22}" width="4" height="4" fill="#FFD700"/>
    `,
    robe: `
      <rect x="${baseX}" y="${torsoY}" width="${28 + widthMod}" height="36" fill="${armor.base}"/>
      <rect x="${baseX + 2}" y="${torsoY + 2}" width="${24 + widthMod}" height="32" fill="${armor.light}"/>
      <!-- Ouverture robe -->
      <rect x="${baseX + 12}" y="${torsoY + 4}" width="4" height="28" fill="${armor.dark}"/>
      <!-- Col -->
      <rect x="${baseX + 6}" y="${torsoY}" width="${16 + widthMod}" height="4" fill="${armor.accent}"/>
      <!-- Ceinture -->
      <rect x="${baseX + 2}" y="${torsoY + 16}" width="${24 + widthMod}" height="3" fill="${armor.accent}"/>
    `,
    barbarian: `
      <!-- Torse nu avec sangles -->
      <rect x="${baseX + 4}" y="${torsoY}" width="${20 + widthMod}" height="24" fill="${skin.base}"/>
      <rect x="${baseX + 6}" y="${torsoY + 2}" width="${16 + widthMod}" height="20" fill="${skin.light}"/>
      <!-- Muscles -->
      <rect x="${baseX + 8}" y="${torsoY + 6}" width="4" height="8" fill="${skin.dark}"/>
      <rect x="${baseX + 16 + widthMod}" y="${torsoY + 6}" width="4" height="8" fill="${skin.dark}"/>
      <!-- Sangle -->
      <rect x="${baseX + 4}" y="${torsoY + 2}" width="4" height="22" fill="${armor.base}"/>
      <rect x="${baseX + 20 + widthMod}" y="${torsoY + 2}" width="4" height="22" fill="${armor.base}"/>
      <!-- Ceinture -->
      <rect x="${baseX + 2}" y="${torsoY + 20}" width="${24 + widthMod}" height="4" fill="${armor.dark}"/>
      <rect x="${baseX + 10}" y="${torsoY + 20}" width="8" height="4" fill="#DAA520"/>
    `
  };
  svgContent += armorStyles[armorType] || armorStyles.leather;

  // ===== BRAS =====
  const armY = torsoY + 2;
  svgContent += `
    <!-- Bras gauche -->
    <rect x="${baseX - 4}" y="${armY}" width="8" height="20" fill="${armor.dark}"/>
    <rect x="${baseX - 2}" y="${armY + 2}" width="4" height="16" fill="${armor.base}"/>
    <!-- Main gauche -->
    <rect x="${baseX - 4}" y="${armY + 18}" width="8" height="6" fill="${skin.base}"/>
    <rect x="${baseX - 2}" y="${armY + 20}" width="4" height="2" fill="${skin.light}"/>

    <!-- Bras droit -->
    <rect x="${baseX + 24 + widthMod}" y="${armY}" width="8" height="20" fill="${armor.dark}"/>
    <rect x="${baseX + 26 + widthMod}" y="${armY + 2}" width="4" height="16" fill="${armor.base}"/>
    <!-- Main droite -->
    <rect x="${baseX + 24 + widthMod}" y="${armY + 18}" width="8" height="6" fill="${skin.base}"/>
    <rect x="${baseX + 26 + widthMod}" y="${armY + 20}" width="4" height="2" fill="${skin.light}"/>
  `;

  // ===== TÊTE =====
  const headY = baseY;
  const headW = 20 + widthMod;
  const headX = baseX + 4;

  svgContent += `
    <!-- Tête base -->
    <rect x="${headX}" y="${headY}" width="${headW}" height="18" fill="${skin.dark}"/>
    <rect x="${headX + 2}" y="${headY + 2}" width="${headW - 4}" height="14" fill="${skin.base}"/>
    <rect x="${headX + 4}" y="${headY + 4}" width="${headW - 8}" height="10" fill="${skin.light}"/>
  `;

  // Yeux
  const eyeY = headY + 6;
  svgContent += `
    <!-- Œil gauche -->
    <rect x="${headX + 4}" y="${eyeY}" width="4" height="4" fill="#FFFFFF"/>
    <rect x="${headX + 5}" y="${eyeY + 1}" width="2" height="2" fill="#000000"/>
    <!-- Œil droit -->
    <rect x="${headX + headW - 8}" y="${eyeY}" width="4" height="4" fill="#FFFFFF"/>
    <rect x="${headX + headW - 7}" y="${eyeY + 1}" width="2" height="2" fill="#000000"/>
  `;

  // Nez et bouche
  svgContent += `
    <!-- Nez -->
    <rect x="${headX + headW/2 - 1}" y="${eyeY + 4}" width="2" height="3" fill="${skin.dark}"/>
    <!-- Bouche -->
    <rect x="${headX + headW/2 - 2}" y="${eyeY + 8}" width="4" height="1" fill="${skin.shadow}"/>
  `;

  // Oreilles (pointues pour elfes)
  if (race === 'elf') {
    svgContent += `
      <rect x="${headX - 2}" y="${headY + 4}" width="4" height="8" fill="${skin.base}"/>
      <rect x="${headX - 4}" y="${headY + 2}" width="2" height="4" fill="${skin.light}"/>
      <rect x="${headX + headW - 2}" y="${headY + 4}" width="4" height="8" fill="${skin.base}"/>
      <rect x="${headX + headW + 2}" y="${headY + 2}" width="2" height="4" fill="${skin.light}"/>
    `;
  } else {
    svgContent += `
      <rect x="${headX - 2}" y="${headY + 6}" width="4" height="6" fill="${skin.base}"/>
      <rect x="${headX + headW - 2}" y="${headY + 6}" width="4" height="6" fill="${skin.base}"/>
    `;
  }

  // Traits spéciaux orcs (défenses)
  if (race === 'orc') {
    svgContent += `
      <rect x="${headX + 2}" y="${headY + 14}" width="2" height="4" fill="#FFFAFA"/>
      <rect x="${headX + headW - 4}" y="${headY + 14}" width="2" height="4" fill="#FFFAFA"/>
    `;
  }

  // ===== CHEVEUX =====
  if (hairStyle !== 'none') {
    const hairStyles = {
      short: `
        <rect x="${headX}" y="${headY - 2}" width="${headW}" height="6" fill="${hair.dark}"/>
        <rect x="${headX + 2}" y="${headY}" width="${headW - 4}" height="4" fill="${hair.base}"/>
        <rect x="${headX + 4}" y="${headY + 1}" width="4" height="2" fill="${hair.highlight}"/>
      `,
      medium: `
        <rect x="${headX - 2}" y="${headY - 2}" width="${headW + 4}" height="8" fill="${hair.dark}"/>
        <rect x="${headX}" y="${headY}" width="${headW}" height="6" fill="${hair.base}"/>
        <rect x="${headX + 4}" y="${headY + 1}" width="6" height="3" fill="${hair.highlight}"/>
        <!-- Côtés -->
        <rect x="${headX - 4}" y="${headY + 4}" width="6" height="10" fill="${hair.base}"/>
        <rect x="${headX + headW - 2}" y="${headY + 4}" width="6" height="10" fill="${hair.base}"/>
      `,
      long: `
        <rect x="${headX - 4}" y="${headY - 4}" width="${headW + 8}" height="10" fill="${hair.dark}"/>
        <rect x="${headX - 2}" y="${headY - 2}" width="${headW + 4}" height="8" fill="${hair.base}"/>
        <rect x="${headX + 4}" y="${headY}" width="8" height="4" fill="${hair.highlight}"/>
        <!-- Cheveux longs côtés -->
        <rect x="${headX - 6}" y="${headY + 4}" width="8" height="26" fill="${hair.base}"/>
        <rect x="${headX - 4}" y="${headY + 6}" width="4" height="22" fill="${hair.light}"/>
        <rect x="${headX + headW - 2}" y="${headY + 4}" width="8" height="26" fill="${hair.base}"/>
        <rect x="${headX + headW}" y="${headY + 6}" width="4" height="22" fill="${hair.light}"/>
      `,
      mohawk: `
        <rect x="${headX + headW/2 - 3}" y="${headY - 10}" width="6" height="14" fill="${hair.dark}"/>
        <rect x="${headX + headW/2 - 2}" y="${headY - 8}" width="4" height="10" fill="${hair.base}"/>
        <rect x="${headX + headW/2 - 1}" y="${headY - 6}" width="2" height="4" fill="${hair.highlight}"/>
      `,
      ponytail: `
        <rect x="${headX}" y="${headY - 2}" width="${headW}" height="6" fill="${hair.dark}"/>
        <rect x="${headX + 2}" y="${headY}" width="${headW - 4}" height="4" fill="${hair.base}"/>
        <!-- Queue de cheval -->
        <rect x="${headX + headW/2 - 2}" y="${headY + 2}" width="4" height="4" fill="${hair.dark}"/>
        <rect x="${headX + headW/2 - 3}" y="${headY + 6}" width="6" height="20" fill="${hair.base}"/>
        <rect x="${headX + headW/2 - 2}" y="${headY + 8}" width="4" height="16" fill="${hair.light}"/>
      `,
      braids: `
        <rect x="${headX - 2}" y="${headY - 2}" width="${headW + 4}" height="8" fill="${hair.dark}"/>
        <rect x="${headX}" y="${headY}" width="${headW}" height="6" fill="${hair.base}"/>
        <!-- Tresses -->
        <rect x="${headX - 4}" y="${headY + 4}" width="4" height="28" fill="${hair.base}"/>
        <rect x="${headX - 3}" y="${headY + 8}" width="2" height="2" fill="${hair.dark}"/>
        <rect x="${headX - 3}" y="${headY + 14}" width="2" height="2" fill="${hair.dark}"/>
        <rect x="${headX - 3}" y="${headY + 20}" width="2" height="2" fill="${hair.dark}"/>
        <rect x="${headX - 3}" y="${headY + 26}" width="2" height="2" fill="${hair.dark}"/>
        <rect x="${headX + headW}" y="${headY + 4}" width="4" height="28" fill="${hair.base}"/>
        <rect x="${headX + headW + 1}" y="${headY + 8}" width="2" height="2" fill="${hair.dark}"/>
        <rect x="${headX + headW + 1}" y="${headY + 14}" width="2" height="2" fill="${hair.dark}"/>
        <rect x="${headX + headW + 1}" y="${headY + 20}" width="2" height="2" fill="${hair.dark}"/>
        <rect x="${headX + headW + 1}" y="${headY + 26}" width="2" height="2" fill="${hair.dark}"/>
        <!-- Perles -->
        <rect x="${headX - 4}" y="${headY + 30}" width="4" height="4" fill="#DAA520"/>
        <rect x="${headX + headW}" y="${headY + 30}" width="4" height="4" fill="#DAA520"/>
      `,
      wild: `
        <rect x="${headX - 6}" y="${headY - 6}" width="${headW + 12}" height="14" fill="${hair.dark}"/>
        <rect x="${headX - 4}" y="${headY - 4}" width="${headW + 8}" height="10" fill="${hair.base}"/>
        <rect x="${headX}" y="${headY - 2}" width="${headW}" height="6" fill="${hair.light}"/>
        <!-- Mèches sauvages -->
        <rect x="${headX - 8}" y="${headY}" width="4" height="8" fill="${hair.base}"/>
        <rect x="${headX + headW + 4}" y="${headY - 2}" width="4" height="10" fill="${hair.base}"/>
        <rect x="${headX + headW/2 - 2}" y="${headY - 8}" width="4" height="6" fill="${hair.base}"/>
        <rect x="${headX - 6}" y="${headY + 6}" width="6" height="18" fill="${hair.base}"/>
        <rect x="${headX + headW}" y="${headY + 4}" width="6" height="20" fill="${hair.base}"/>
      `
    };
    svgContent += hairStyles[hairStyle] || '';
  }

  // ===== BARBE =====
  if (beardStyle !== 'none' && raceData.canHaveBeard) {
    const beardStyles = {
      stubble: `
        <rect x="${headX + 2}" y="${headY + 12}" width="${headW - 4}" height="4" fill="${beard.dark}" opacity="0.5"/>
      `,
      short: `
        <rect x="${headX + 2}" y="${headY + 12}" width="${headW - 4}" height="6" fill="${beard.dark}"/>
        <rect x="${headX + 4}" y="${headY + 14}" width="${headW - 8}" height="4" fill="${beard.base}"/>
      `,
      full: `
        <rect x="${headX}" y="${headY + 10}" width="${headW}" height="12" fill="${beard.dark}"/>
        <rect x="${headX + 2}" y="${headY + 12}" width="${headW - 4}" height="8" fill="${beard.base}"/>
        <rect x="${headX + 4}" y="${headY + 14}" width="${headW - 8}" height="4" fill="${beard.light}"/>
      `,
      long: `
        <rect x="${headX - 2}" y="${headY + 10}" width="${headW + 4}" height="20" fill="${beard.dark}"/>
        <rect x="${headX}" y="${headY + 12}" width="${headW}" height="16" fill="${beard.base}"/>
        <rect x="${headX + 2}" y="${headY + 14}" width="${headW - 4}" height="12" fill="${beard.light}"/>
        <rect x="${headX + headW/2 - 2}" y="${headY + 26}" width="4" height="4" fill="${beard.base}"/>
      `,
      braided: `
        <rect x="${headX}" y="${headY + 10}" width="${headW}" height="10" fill="${beard.dark}"/>
        <rect x="${headX + 2}" y="${headY + 12}" width="${headW - 4}" height="6" fill="${beard.base}"/>
        <!-- Tresses de barbe -->
        <rect x="${headX + 4}" y="${headY + 18}" width="4" height="16" fill="${beard.base}"/>
        <rect x="${headX + 5}" y="${headY + 22}" width="2" height="2" fill="${beard.dark}"/>
        <rect x="${headX + 5}" y="${headY + 28}" width="2" height="2" fill="${beard.dark}"/>
        <rect x="${headX + headW - 8}" y="${headY + 18}" width="4" height="16" fill="${beard.base}"/>
        <rect x="${headX + headW - 7}" y="${headY + 22}" width="2" height="2" fill="${beard.dark}"/>
        <rect x="${headX + headW - 7}" y="${headY + 28}" width="2" height="2" fill="${beard.dark}"/>
        <!-- Perles -->
        <rect x="${headX + 4}" y="${headY + 32}" width="4" height="3" fill="#DAA520"/>
        <rect x="${headX + headW - 8}" y="${headY + 32}" width="4" height="3" fill="#DAA520"/>
      `,
      forked: `
        <rect x="${headX}" y="${headY + 10}" width="${headW}" height="10" fill="${beard.dark}"/>
        <rect x="${headX + 2}" y="${headY + 12}" width="${headW - 4}" height="6" fill="${beard.base}"/>
        <!-- Fourche -->
        <rect x="${headX + 2}" y="${headY + 18}" width="6" height="14" fill="${beard.base}"/>
        <rect x="${headX + headW - 8}" y="${headY + 18}" width="6" height="14" fill="${beard.base}"/>
        <rect x="${headX + 4}" y="${headY + 20}" width="2" height="10" fill="${beard.light}"/>
        <rect x="${headX + headW - 6}" y="${headY + 20}" width="2" height="10" fill="${beard.light}"/>
      `,
      massive: `
        <rect x="${headX - 4}" y="${headY + 8}" width="${headW + 8}" height="28" fill="${beard.dark}"/>
        <rect x="${headX - 2}" y="${headY + 10}" width="${headW + 4}" height="24" fill="${beard.base}"/>
        <rect x="${headX}" y="${headY + 12}" width="${headW}" height="20" fill="${beard.light}"/>
        <!-- Détails -->
        <rect x="${headX + 2}" y="${headY + 14}" width="2" height="16" fill="${beard.dark}"/>
        <rect x="${headX + headW - 4}" y="${headY + 14}" width="2" height="16" fill="${beard.dark}"/>
        <rect x="${headX + headW/2 - 1}" y="${headY + 16}" width="2" height="14" fill="${beard.dark}"/>
        <!-- Perles multiples -->
        <rect x="${headX - 2}" y="${headY + 32}" width="3" height="3" fill="#DAA520"/>
        <rect x="${headX + headW/2 - 1}" y="${headY + 34}" width="3" height="3" fill="#DAA520"/>
        <rect x="${headX + headW - 1}" y="${headY + 32}" width="3" height="3" fill="#DAA520"/>
      `
    };
    svgContent += beardStyles[beardStyle] || '';
  }

  // ===== CASQUE =====
  if (helmet !== 'none') {
    const helmetStyles = {
      cap: `
        <rect x="${headX - 2}" y="${headY - 4}" width="${headW + 4}" height="8" fill="${armor.base}"/>
        <rect x="${headX}" y="${headY - 2}" width="${headW}" height="4" fill="${armor.light}"/>
      `,
      hood: `
        <rect x="${headX - 4}" y="${headY - 4}" width="${headW + 8}" height="14" fill="${armor.dark}"/>
        <rect x="${headX - 2}" y="${headY - 2}" width="${headW + 4}" height="10" fill="${armor.base}"/>
        <rect x="${headX + 4}" y="${headY + 2}" width="${headW - 8}" height="4" fill="#000" opacity="0.3"/>
      `,
      helm: `
        <rect x="${headX - 4}" y="${headY - 6}" width="${headW + 8}" height="16" fill="${armor.dark}"/>
        <rect x="${headX - 2}" y="${headY - 4}" width="${headW + 4}" height="12" fill="${armor.base}"/>
        <rect x="${headX}" y="${headY - 2}" width="${headW}" height="8" fill="${armor.light}"/>
        <!-- Visière -->
        <rect x="${headX + 2}" y="${headY + 4}" width="${headW - 4}" height="4" fill="#1a1a1a"/>
        <rect x="${headX + 4}" y="${headY + 5}" width="3" height="2" fill="#404040"/>
        <rect x="${headX + headW - 7}" y="${headY + 5}" width="3" height="2" fill="#404040"/>
        <!-- Crête -->
        <rect x="${headX + headW/2 - 2}" y="${headY - 8}" width="4" height="6" fill="#DC143C"/>
      `,
      crown: `
        <rect x="${headX - 2}" y="${headY - 6}" width="${headW + 4}" height="8" fill="#DAA520"/>
        <rect x="${headX}" y="${headY - 4}" width="${headW}" height="4" fill="#FFD700"/>
        <!-- Pointes -->
        <rect x="${headX}" y="${headY - 10}" width="4" height="6" fill="#FFD700"/>
        <rect x="${headX + headW/2 - 2}" y="${headY - 12}" width="4" height="8" fill="#FFD700"/>
        <rect x="${headX + headW - 4}" y="${headY - 10}" width="4" height="6" fill="#FFD700"/>
        <!-- Gemmes -->
        <rect x="${headX + 1}" y="${headY - 8}" width="2" height="2" fill="#DC143C"/>
        <rect x="${headX + headW/2 - 1}" y="${headY - 10}" width="2" height="2" fill="#4169E1"/>
        <rect x="${headX + headW - 3}" y="${headY - 8}" width="2" height="2" fill="#228B22"/>
      `,
      horned: `
        <rect x="${headX - 2}" y="${headY - 4}" width="${headW + 4}" height="10" fill="${armor.dark}"/>
        <rect x="${headX}" y="${headY - 2}" width="${headW}" height="6" fill="${armor.base}"/>
        <!-- Cornes -->
        <rect x="${headX - 6}" y="${headY - 8}" width="6" height="4" fill="#E8D5B5"/>
        <rect x="${headX - 8}" y="${headY - 12}" width="4" height="6" fill="#E8D5B5"/>
        <rect x="${headX - 10}" y="${headY - 14}" width="4" height="4" fill="#D4C4A8"/>
        <rect x="${headX + headW}" y="${headY - 8}" width="6" height="4" fill="#E8D5B5"/>
        <rect x="${headX + headW + 4}" y="${headY - 12}" width="4" height="6" fill="#E8D5B5"/>
        <rect x="${headX + headW + 6}" y="${headY - 14}" width="4" height="4" fill="#D4C4A8"/>
      `,
      winged: `
        <rect x="${headX - 2}" y="${headY - 4}" width="${headW + 4}" height="10" fill="${armor.base}"/>
        <rect x="${headX}" y="${headY - 2}" width="${headW}" height="6" fill="${armor.light}"/>
        <!-- Ailes -->
        <rect x="${headX - 8}" y="${headY - 8}" width="8" height="4" fill="#F0F0F0"/>
        <rect x="${headX - 10}" y="${headY - 6}" width="4" height="6" fill="#F0F0F0"/>
        <rect x="${headX - 12}" y="${headY - 4}" width="4" height="4" fill="#E0E0E0"/>
        <rect x="${headX + headW}" y="${headY - 8}" width="8" height="4" fill="#F0F0F0"/>
        <rect x="${headX + headW + 6}" y="${headY - 6}" width="4" height="6" fill="#F0F0F0"/>
        <rect x="${headX + headW + 8}" y="${headY - 4}" width="4" height="4" fill="#E0E0E0"/>
      `,
      wizard: `
        <rect x="${headX - 4}" y="${headY - 16}" width="${headW + 8}" height="20" fill="${armor.dark}"/>
        <rect x="${headX - 2}" y="${headY - 14}" width="${headW + 4}" height="16" fill="${armor.base}"/>
        <!-- Pointe -->
        <rect x="${headX + headW/2 - 3}" y="${headY - 22}" width="6" height="8" fill="${armor.base}"/>
        <rect x="${headX + headW/2 - 2}" y="${headY - 24}" width="4" height="4" fill="${armor.light}"/>
        <!-- Bord -->
        <rect x="${headX - 6}" y="${headY + 2}" width="${headW + 12}" height="4" fill="${armor.dark}"/>
        <!-- Étoile -->
        <rect x="${headX + headW/2 - 2}" y="${headY - 10}" width="4" height="4" fill="#FFD700"/>
      `
    };
    svgContent += helmetStyles[helmet] || '';
  }

  // ===== ARME =====
  if (weapon !== 'none') {
    const weaponX = baseX + 28 + widthMod;
    const weaponY = armY + 10;
    const weaponStyles = {
      sword: `
        <!-- Poignée -->
        <rect x="${weaponX + 4}" y="${weaponY + 8}" width="4" height="10" fill="#4a3728"/>
        <rect x="${weaponX + 2}" y="${weaponY + 6}" width="8" height="4" fill="#DAA520"/>
        <!-- Lame -->
        <rect x="${weaponX + 4}" y="${weaponY - 16}" width="4" height="24" fill="#C0C0C0"/>
        <rect x="${weaponX + 5}" y="${weaponY - 14}" width="2" height="20" fill="#E0E0E0"/>
        <rect x="${weaponX + 4}" y="${weaponY - 18}" width="4" height="4" fill="#E0E0E0"/>
      `,
      axe: `
        <!-- Manche -->
        <rect x="${weaponX + 5}" y="${weaponY}" width="3" height="20" fill="#4a3728"/>
        <!-- Tête de hache -->
        <rect x="${weaponX}" y="${weaponY - 12}" width="12" height="14" fill="#808080"/>
        <rect x="${weaponX + 2}" y="${weaponY - 10}" width="8" height="10" fill="#A0A0A0"/>
        <rect x="${weaponX - 2}" y="${weaponY - 8}" width="4" height="8" fill="#808080"/>
        <rect x="${weaponX}" y="${weaponY - 6}" width="2" height="4" fill="#C0C0C0"/>
      `,
      hammer: `
        <!-- Manche -->
        <rect x="${weaponX + 5}" y="${weaponY}" width="3" height="22" fill="#4a3728"/>
        <!-- Tête de marteau -->
        <rect x="${weaponX - 2}" y="${weaponY - 10}" width="16" height="12" fill="#808080"/>
        <rect x="${weaponX}" y="${weaponY - 8}" width="12" height="8" fill="#A0A0A0"/>
      `,
      greatsword: `
        <!-- Poignée longue -->
        <rect x="${weaponX + 4}" y="${weaponY + 10}" width="4" height="14" fill="#4a3728"/>
        <rect x="${weaponX + 2}" y="${weaponY + 8}" width="8" height="4" fill="#DAA520"/>
        <rect x="${weaponX}" y="${weaponY + 6}" width="12" height="4" fill="#DAA520"/>
        <!-- Grande lame -->
        <rect x="${weaponX + 2}" y="${weaponY - 26}" width="8" height="34" fill="#C0C0C0"/>
        <rect x="${weaponX + 4}" y="${weaponY - 24}" width="4" height="30" fill="#E0E0E0"/>
        <rect x="${weaponX + 2}" y="${weaponY - 28}" width="8" height="4" fill="#E0E0E0"/>
      `,
      battleaxe: `
        <!-- Manche long -->
        <rect x="${weaponX + 5}" y="${weaponY}" width="3" height="26" fill="#4a3728"/>
        <!-- Double tête de hache -->
        <rect x="${weaponX - 4}" y="${weaponY - 14}" width="20" height="16" fill="#808080"/>
        <rect x="${weaponX - 2}" y="${weaponY - 12}" width="6" height="12" fill="#A0A0A0"/>
        <rect x="${weaponX + 8}" y="${weaponY - 12}" width="6" height="12" fill="#A0A0A0"/>
        <rect x="${weaponX - 6}" y="${weaponY - 10}" width="4" height="8" fill="#808080"/>
        <rect x="${weaponX + 14}" y="${weaponY - 10}" width="4" height="8" fill="#808080"/>
      `,
      bow: `
        <!-- Arc -->
        <rect x="${weaponX + 10}" y="${weaponY - 20}" width="3" height="44" fill="#8B4513"/>
        <rect x="${weaponX + 8}" y="${weaponY - 18}" width="4" height="4" fill="#8B4513"/>
        <rect x="${weaponX + 6}" y="${weaponY - 14}" width="4" height="4" fill="#8B4513"/>
        <rect x="${weaponX + 8}" y="${weaponY + 18}" width="4" height="4" fill="#8B4513"/>
        <rect x="${weaponX + 6}" y="${weaponY + 14}" width="4" height="4" fill="#8B4513"/>
        <!-- Corde -->
        <rect x="${weaponX + 6}" y="${weaponY - 16}" width="1" height="36" fill="#E8D5B5"/>
      `,
      crossbow: `
        <!-- Corps -->
        <rect x="${weaponX}" y="${weaponY}" width="16" height="6" fill="#4a3728"/>
        <rect x="${weaponX + 2}" y="${weaponY + 2}" width="12" height="2" fill="#5c4533"/>
        <!-- Arc -->
        <rect x="${weaponX - 4}" y="${weaponY - 4}" width="24" height="4" fill="#808080"/>
        <rect x="${weaponX - 6}" y="${weaponY - 6}" width="4" height="4" fill="#808080"/>
        <rect x="${weaponX + 18}" y="${weaponY - 6}" width="4" height="4" fill="#808080"/>
        <!-- Corde -->
        <rect x="${weaponX - 4}" y="${weaponY - 2}" width="24" height="1" fill="#E8D5B5"/>
      `,
      staff: `
        <!-- Bâton -->
        <rect x="${weaponX + 5}" y="${weaponY - 24}" width="4" height="48" fill="#4a3728"/>
        <rect x="${weaponX + 6}" y="${weaponY - 22}" width="2" height="44" fill="#5c4533"/>
        <!-- Gemme -->
        <rect x="${weaponX + 2}" y="${weaponY - 30}" width="10" height="10" fill="#9932CC"/>
        <rect x="${weaponX + 4}" y="${weaponY - 28}" width="6" height="6" fill="#BA55D3"/>
        <rect x="${weaponX + 5}" y="${weaponY - 27}" width="4" height="4" fill="#DA70D6"/>
        <!-- Lueur -->
        <rect x="${weaponX + 6}" y="${weaponY - 26}" width="2" height="2" fill="#FFFFFF"/>
      `,
      dagger: `
        <!-- Poignée -->
        <rect x="${weaponX + 5}" y="${weaponY + 4}" width="3" height="8" fill="#4a3728"/>
        <rect x="${weaponX + 4}" y="${weaponY + 2}" width="5" height="3" fill="#DAA520"/>
        <!-- Lame -->
        <rect x="${weaponX + 5}" y="${weaponY - 8}" width="3" height="12" fill="#C0C0C0"/>
        <rect x="${weaponX + 6}" y="${weaponY - 6}" width="1" height="8" fill="#E0E0E0"/>
        <rect x="${weaponX + 5}" y="${weaponY - 10}" width="3" height="3" fill="#E0E0E0"/>
      `,
      mace: `
        <!-- Manche -->
        <rect x="${weaponX + 5}" y="${weaponY + 2}" width="3" height="14" fill="#4a3728"/>
        <!-- Tête -->
        <rect x="${weaponX + 2}" y="${weaponY - 10}" width="10" height="14" fill="#808080"/>
        <rect x="${weaponX + 4}" y="${weaponY - 8}" width="6" height="10" fill="#A0A0A0"/>
        <!-- Pointes -->
        <rect x="${weaponX}" y="${weaponY - 6}" width="3" height="6" fill="#808080"/>
        <rect x="${weaponX + 11}" y="${weaponY - 6}" width="3" height="6" fill="#808080"/>
        <rect x="${weaponX + 4}" y="${weaponY - 12}" width="6" height="3" fill="#808080"/>
      `,
      spear: `
        <!-- Manche long -->
        <rect x="${weaponX + 5}" y="${weaponY - 10}" width="3" height="36" fill="#4a3728"/>
        <!-- Pointe -->
        <rect x="${weaponX + 4}" y="${weaponY - 22}" width="5" height="14" fill="#C0C0C0"/>
        <rect x="${weaponX + 5}" y="${weaponY - 24}" width="3" height="4" fill="#E0E0E0"/>
        <rect x="${weaponX + 6}" y="${weaponY - 26}" width="1" height="4" fill="#E0E0E0"/>
      `
    };
    svgContent += weaponStyles[weapon] || '';
  }

  // ===== BOUCLIER =====
  if (shield !== 'none' && !WEAPON_TYPES[weapon]?.twoHanded) {
    const shieldX = baseX - 12;
    const shieldY = armY + 6;
    const shieldStyles = {
      buckler: `
        <rect x="${shieldX}" y="${shieldY}" width="12" height="12" fill="${armor.dark}" rx="6"/>
        <rect x="${shieldX + 2}" y="${shieldY + 2}" width="8" height="8" fill="${armor.base}"/>
        <rect x="${shieldX + 4}" y="${shieldY + 4}" width="4" height="4" fill="${armor.light}"/>
      `,
      kite: `
        <rect x="${shieldX - 2}" y="${shieldY - 2}" width="14" height="10" fill="${armor.dark}"/>
        <rect x="${shieldX}" y="${shieldY}" width="10" height="6" fill="${armor.base}"/>
        <rect x="${shieldX}" y="${shieldY + 8}" width="10" height="8" fill="${armor.dark}"/>
        <rect x="${shieldX + 2}" y="${shieldY + 10}" width="6" height="4" fill="${armor.base}"/>
        <rect x="${shieldX + 3}" y="${shieldY + 14}" width="4" height="4" fill="${armor.dark}"/>
        <rect x="${shieldX + 4}" y="${shieldY + 16}" width="2" height="2" fill="${armor.base}"/>
        <!-- Emblème -->
        <rect x="${shieldX + 3}" y="${shieldY + 2}" width="4" height="4" fill="#DAA520"/>
      `,
      tower: `
        <rect x="${shieldX - 4}" y="${shieldY - 4}" width="16" height="28" fill="${armor.dark}"/>
        <rect x="${shieldX - 2}" y="${shieldY - 2}" width="12" height="24" fill="${armor.base}"/>
        <rect x="${shieldX}" y="${shieldY}" width="8" height="20" fill="${armor.light}"/>
        <!-- Renforts -->
        <rect x="${shieldX - 2}" y="${shieldY + 6}" width="12" height="2" fill="${armor.dark}"/>
        <rect x="${shieldX - 2}" y="${shieldY + 14}" width="12" height="2" fill="${armor.dark}"/>
        <!-- Emblème -->
        <rect x="${shieldX + 1}" y="${shieldY + 2}" width="6" height="3" fill="#DAA520"/>
      `,
      round: `
        <rect x="${shieldX - 2}" y="${shieldY - 2}" width="16" height="16" fill="${armor.dark}"/>
        <rect x="${shieldX}" y="${shieldY}" width="12" height="12" fill="${armor.base}"/>
        <rect x="${shieldX + 2}" y="${shieldY + 2}" width="8" height="8" fill="${armor.light}"/>
        <!-- Boss central -->
        <rect x="${shieldX + 4}" y="${shieldY + 4}" width="4" height="4" fill="#DAA520"/>
      `
    };
    svgContent += shieldStyles[shield] || '';
  }

  // ===== TRAITS SPÉCIAUX DE RACE =====
  // Cornes de Tieffelin
  if (raceData.hasHorns) {
    const hornX = headX;
    const hornY = headY - 6;
    svgContent += `
      <!-- Cornes démoniaques -->
      <rect x="${hornX - 4}" y="${hornY}" width="4" height="6" fill="#4a3728"/>
      <rect x="${hornX - 6}" y="${hornY - 4}" width="4" height="6" fill="#3d2d1f"/>
      <rect x="${hornX - 8}" y="${hornY - 8}" width="4" height="6" fill="#2d1d0f"/>
      <rect x="${hornX + headW}" y="${hornY}" width="4" height="6" fill="#4a3728"/>
      <rect x="${hornX + headW + 2}" y="${hornY - 4}" width="4" height="6" fill="#3d2d1f"/>
      <rect x="${hornX + headW + 4}" y="${hornY - 8}" width="4" height="6" fill="#2d1d0f"/>
    `;
  }

  // Ailes de Fée
  if (raceData.hasWings) {
    const wingX = baseX;
    const wingY = baseY + 10;
    svgContent += `
      <!-- Ailes de fée -->
      <rect x="${wingX - 18}" y="${wingY - 6}" width="16" height="28" fill="rgba(255,255,255,0.4)"/>
      <rect x="${wingX - 16}" y="${wingY - 4}" width="12" height="24" fill="rgba(200,255,255,0.5)"/>
      <rect x="${wingX - 14}" y="${wingY - 2}" width="8" height="20" fill="rgba(255,200,255,0.4)"/>
      <rect x="${wingX - 12}" y="${wingY}" width="4" height="16" fill="rgba(255,255,200,0.5)"/>
      <rect x="${wingX + 28 + widthMod}" y="${wingY - 6}" width="16" height="28" fill="rgba(255,255,255,0.4)"/>
      <rect x="${wingX + 30 + widthMod}" y="${wingY - 4}" width="12" height="24" fill="rgba(200,255,255,0.5)"/>
      <rect x="${wingX + 32 + widthMod}" y="${wingY - 2}" width="8" height="20" fill="rgba(255,200,255,0.4)"/>
      <rect x="${wingX + 34 + widthMod}" y="${wingY}" width="4" height="16" fill="rgba(255,255,200,0.5)"/>
      <!-- Paillettes -->
      <rect x="${wingX - 14}" y="${wingY + 2}" width="2" height="2" fill="#FFD700"/>
      <rect x="${wingX - 10}" y="${wingY + 8}" width="2" height="2" fill="#FF69B4"/>
      <rect x="${wingX + 32 + widthMod}" y="${wingY + 4}" width="2" height="2" fill="#87CEEB"/>
      <rect x="${wingX + 38 + widthMod}" y="${wingY + 10}" width="2" height="2" fill="#FFD700"/>
    `;
  }

  // Écailles de Drakéide
  if (raceData.hasScales) {
    const scaleY = headY + 4;
    svgContent += `
      <!-- Écailles sur le visage -->
      <rect x="${headX + 2}" y="${scaleY}" width="2" height="2" fill="${skin.dark}"/>
      <rect x="${headX + 4}" y="${scaleY + 2}" width="2" height="2" fill="${skin.dark}"/>
      <rect x="${headX + headW - 4}" y="${scaleY}" width="2" height="2" fill="${skin.dark}"/>
      <rect x="${headX + headW - 6}" y="${scaleY + 2}" width="2" height="2" fill="${skin.dark}"/>
      <!-- Petites cornes/crêtes -->
      <rect x="${headX + headW/2 - 3}" y="${headY - 4}" width="6" height="4" fill="${skin.base}"/>
      <rect x="${headX + headW/2 - 2}" y="${headY - 6}" width="4" height="4" fill="${skin.light}"/>
    `;
  }

  // ===== ANIMAL TOTEM (petit esprit flottant) =====
  if (totemAnimal !== 'none') {
    const totemX = baseX - 16;
    const totemY = baseY - 4;
    const totemColors = {
      wolf: { base: '#808080', accent: '#A0A0A0' },
      eagle: { base: '#8B4513', accent: '#D2691E' },
      bear: { base: '#6B4423', accent: '#8B5A2B' },
      lion: { base: '#DAA520', accent: '#FFD700' },
      snake: { base: '#228B22', accent: '#32CD32' },
      owl: { base: '#A0522D', accent: '#CD853F' },
      raven: { base: '#2D2D2D', accent: '#4D4D4D' },
      stag: { base: '#8B4513', accent: '#D2691E' },
      fox: { base: '#FF6B35', accent: '#FF8C42' },
      dragon: { base: '#DC143C', accent: '#FF4040' },
      phoenix: { base: '#FF4500', accent: '#FFD700' },
      turtle: { base: '#228B22', accent: '#8FBC8F' },
      spider: { base: '#2D2D2D', accent: '#4D4D4D' },
      bat: { base: '#4D4D4D', accent: '#6B6B6B' },
      cat: { base: '#FF8C00', accent: '#FFA500' },
      horse: { base: '#8B4513', accent: '#A0522D' },
      boar: { base: '#6B4423', accent: '#8B5A2B' },
      crow: { base: '#1A1A1A', accent: '#2D2D2D' }
    };
    const tc = totemColors[totemAnimal] || totemColors.wolf;
    svgContent += `
      <!-- Animal totem (esprit) -->
      <g opacity="0.7">
        <rect x="${totemX}" y="${totemY}" width="8" height="8" fill="${tc.base}"/>
        <rect x="${totemX + 2}" y="${totemY + 2}" width="4" height="4" fill="${tc.accent}"/>
        <rect x="${totemX + 1}" y="${totemY + 1}" width="2" height="2" fill="#FFFFFF"/>
        <!-- Aura magique -->
        <rect x="${totemX - 2}" y="${totemY + 4}" width="2" height="2" fill="rgba(147,112,219,0.5)"/>
        <rect x="${totemX + 10}" y="${totemY + 2}" width="2" height="2" fill="rgba(147,112,219,0.5)"/>
        <rect x="${totemX + 4}" y="${totemY - 2}" width="2" height="2" fill="rgba(147,112,219,0.5)"/>
      </g>
    `;
  }

  // ===== ACCESSOIRES =====
  if (accessory !== 'none') {
    const accStyles = {
      eyepatch: `
        <rect x="${headX + 2}" y="${eyeY - 1}" width="6" height="6" fill="#1a1a1a"/>
        <rect x="${headX}" y="${eyeY + 1}" width="2" height="1" fill="#4a3728"/>
        <rect x="${headX + 8}" y="${eyeY + 1}" width="${headW - 8}" height="1" fill="#4a3728"/>
      `,
      scar: `
        <rect x="${headX + headW/2 - 1}" y="${eyeY - 2}" width="2" height="8" fill="${skin.shadow}"/>
        <rect x="${headX + headW/2}" y="${eyeY}" width="1" height="4" fill="${skin.dark}"/>
      `,
      necklace: `
        <rect x="${headX + 4}" y="${headY + 16}" width="${headW - 8}" height="2" fill="#DAA520"/>
        <rect x="${headX + headW/2 - 2}" y="${headY + 18}" width="4" height="4" fill="#DC143C"/>
        <rect x="${headX + headW/2 - 1}" y="${headY + 19}" width="2" height="2" fill="#FF4040"/>
      `,
      earring: `
        <rect x="${headX - 2}" y="${headY + 8}" width="2" height="4" fill="#DAA520"/>
        <rect x="${headX - 3}" y="${headY + 10}" width="2" height="2" fill="#DC143C"/>
      `,
      glasses: `
        <rect x="${headX + 2}" y="${eyeY - 1}" width="6" height="6" fill="rgba(100,149,237,0.4)"/>
        <rect x="${headX + headW - 8}" y="${eyeY - 1}" width="6" height="6" fill="rgba(100,149,237,0.4)"/>
        <rect x="${headX + 8}" y="${eyeY + 1}" width="${headW - 16}" height="1" fill="#4a3728"/>
        <rect x="${headX + 2}" y="${eyeY - 1}" width="1" height="6" fill="#4a3728"/>
        <rect x="${headX + 7}" y="${eyeY - 1}" width="1" height="6" fill="#4a3728"/>
        <rect x="${headX + headW - 8}" y="${eyeY - 1}" width="1" height="6" fill="#4a3728"/>
        <rect x="${headX + headW - 3}" y="${eyeY - 1}" width="1" height="6" fill="#4a3728"/>
      `,
      monocle: `
        <rect x="${headX + headW - 10}" y="${eyeY - 2}" width="8" height="8" fill="rgba(200,200,200,0.3)"/>
        <rect x="${headX + headW - 10}" y="${eyeY - 2}" width="1" height="8" fill="#DAA520"/>
        <rect x="${headX + headW - 3}" y="${eyeY - 2}" width="1" height="8" fill="#DAA520"/>
        <rect x="${headX + headW - 10}" y="${eyeY - 2}" width="8" height="1" fill="#DAA520"/>
        <rect x="${headX + headW - 10}" y="${eyeY + 5}" width="8" height="1" fill="#DAA520"/>
        <rect x="${headX + headW - 6}" y="${eyeY + 6}" width="1" height="8" fill="#DAA520"/>
      `,
      scarf: `
        <rect x="${headX - 2}" y="${headY + 14}" width="${headW + 4}" height="4" fill="#DC143C"/>
        <rect x="${headX}" y="${headY + 16}" width="${headW}" height="2" fill="#B22222"/>
        <rect x="${headX + headW - 4}" y="${headY + 18}" width="6" height="12" fill="#DC143C"/>
        <rect x="${headX + headW - 2}" y="${headY + 20}" width="4" height="8" fill="#B22222"/>
      `,
      shoulder_pet: `
        <!-- Petit familier sur l'épaule -->
        <rect x="${baseX - 6}" y="${torsoY - 4}" width="8" height="6" fill="#4169E1"/>
        <rect x="${baseX - 4}" y="${torsoY - 2}" width="4" height="4" fill="#6495ED"/>
        <rect x="${baseX - 5}" y="${torsoY - 3}" width="2" height="2" fill="#FFFFFF"/>
        <rect x="${baseX - 2}" y="${torsoY - 5}" width="3" height="3" fill="#4169E1"/>
      `,
      warpaint: `
        <rect x="${headX + 2}" y="${eyeY + 4}" width="4" height="2" fill="#DC143C"/>
        <rect x="${headX + headW - 6}" y="${eyeY + 4}" width="4" height="2" fill="#DC143C"/>
        <rect x="${headX + headW/2 - 2}" y="${headY + 2}" width="4" height="3" fill="#DC143C"/>
      `
    };
    if (accStyles[accessory]) {
      svgContent += accStyles[accessory];
    }
  }

  // ===== MONTURE (sous le personnage) =====
  if (mount !== 'none') {
    const mountY = baseY + 52;
    const mountColors = {
      horse: { body: '#8B4513', mane: '#4a3728', accent: '#A0522D' },
      war_horse: { body: '#2D2D2D', mane: '#1a1a1a', accent: '#4D4D4D', armor: '#C0C0C0' },
      wolf: { body: '#808080', mane: '#606060', accent: '#A0A0A0' },
      bear: { body: '#6B4423', mane: '#4a3728', accent: '#8B5A2B' },
      boar: { body: '#6B4423', mane: '#3d2d1f', accent: '#8B5A2B' },
      ram: { body: '#F5F5DC', mane: '#D4C4A8', accent: '#E8E8D0' },
      raptor: { body: '#228B22', mane: '#155615', accent: '#32CD32' },
      wyvern: { body: '#4B0082', mane: '#2E0854', accent: '#8A2BE2' },
      griffin: { body: '#DAA520', mane: '#8B4513', accent: '#FFD700' },
      unicorn: { body: '#FFFFFF', mane: '#FFB6C1', accent: '#F0F0F0' },
      nightmare: { body: '#1a1a1a', mane: '#FF4500', accent: '#FF6B35' },
      spider: { body: '#2D2D2D', mane: '#1a1a1a', accent: '#4D4D4D' },
      skeletal_horse: { body: '#E8DCC8', mane: '#C4B8A4', accent: '#D4C4A8' }
    };
    const mc = mountColors[mount] || mountColors.horse;

    // Corps de la monture (simplifié en pixel art)
    svgContent += `
      <!-- Monture -->
      <rect x="${baseX - 10}" y="${mountY}" width="48" height="20" fill="${mc.body}"/>
      <rect x="${baseX - 8}" y="${mountY + 2}" width="44" height="16" fill="${mc.accent}"/>
      <!-- Tête -->
      <rect x="${baseX - 20}" y="${mountY - 8}" width="16" height="14" fill="${mc.body}"/>
      <rect x="${baseX - 18}" y="${mountY - 6}" width="12" height="10" fill="${mc.accent}"/>
      <!-- Œil -->
      <rect x="${baseX - 16}" y="${mountY - 4}" width="3" height="3" fill="#FFFFFF"/>
      <rect x="${baseX - 15}" y="${mountY - 3}" width="2" height="2" fill="#000000"/>
      <!-- Crinière -->
      <rect x="${baseX - 8}" y="${mountY - 6}" width="12" height="8" fill="${mc.mane}"/>
      <!-- Jambes -->
      <rect x="${baseX - 6}" y="${mountY + 18}" width="6" height="12" fill="${mc.body}"/>
      <rect x="${baseX + 28}" y="${mountY + 18}" width="6" height="12" fill="${mc.body}"/>
    `;

    // Éléments spéciaux selon la monture
    if (mount === 'unicorn') {
      svgContent += `<rect x="${baseX - 22}" y="${mountY - 14}" width="4" height="10" fill="#FFD700"/>`;
    }
    if (mount === 'war_horse') {
      svgContent += `
        <rect x="${baseX - 20}" y="${mountY - 6}" width="14" height="4" fill="${mc.armor}"/>
        <rect x="${baseX - 8}" y="${mountY}" width="44" height="4" fill="${mc.armor}"/>
      `;
    }
    if (mount === 'nightmare') {
      svgContent += `
        <rect x="${baseX - 6}" y="${mountY + 28}" width="4" height="4" fill="#FF4500"/>
        <rect x="${baseX + 30}" y="${mountY + 28}" width="4" height="4" fill="#FF4500"/>
      `;
    }
    if (mount === 'wyvern' || mount === 'griffin') {
      svgContent += `
        <!-- Ailes -->
        <rect x="${baseX - 24}" y="${mountY - 10}" width="16" height="20" fill="${mc.mane}"/>
        <rect x="${baseX + 36}" y="${mountY - 10}" width="16" height="20" fill="${mc.mane}"/>
      `;
    }
  }

  return svgContent;
};

// ==========================================
// COMPOSANT PREVIEW AVATAR
// ==========================================
export const DetailedPixelAvatarPreview = ({
  config = DEFAULT_DETAILED_CONFIG,
  size = 128,
  showBackground = true,
  className = '',
  animate = true
}) => {
  const svgContent = useMemo(() => generateDetailedPixelArt(config), [config]);
  const background = BACKGROUNDS[config.background] || BACKGROUNDS.none;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={animate ? { scale: 0.9, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background */}
      {showBackground && config.background !== 'none' && (
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: background.gradient }}
        />
      )}

      {/* Avatar SVG */}
      <svg
        viewBox="0 0 96 88"
        width={size}
        height={size}
        className="relative z-10"
        style={{ imageRendering: 'pixelated' }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </motion.div>
  );
};

// ==========================================
// COMPOSANT SÉLECTEUR D'OPTION
// ==========================================
const OptionSelector = ({
  title,
  icon: Icon,
  options,
  value,
  onChange,
  userStats,
  colorOptions,
  colorValue,
  onColorChange,
  showColors = false
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-3 grid grid-cols-4 gap-2">
              {Object.entries(options).map(([key, option]) => {
                const unlocked = isUnlocked(option, userStats);
                const selected = value === key;

                return (
                  <button
                    key={key}
                    onClick={() => unlocked && onChange(key)}
                    disabled={!unlocked}
                    className={`
                      relative p-2 rounded-lg text-center transition-all
                      ${selected
                        ? 'bg-amber-500/30 border-2 border-amber-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'}
                      ${!unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <p className="text-xs text-gray-300 mt-1 truncate">{option.name}</p>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    {selected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sélecteur de couleur */}
            {showColors && colorOptions && (
              <div className="px-3 pb-3 border-t border-white/10 pt-3">
                <p className="text-xs text-gray-400 mb-2">Couleur</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(colorOptions).map(([key, color]) => (
                    <button
                      key={key}
                      onClick={() => onColorChange(key)}
                      className={`
                        w-8 h-8 rounded-lg border-2 transition-all
                        ${colorValue === key ? 'border-amber-400 scale-110' : 'border-transparent'}
                      `}
                      style={{ backgroundColor: color.base }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// COMPOSANT BUILDER PRINCIPAL
// ==========================================
export const DetailedPixelAvatarBuilder = ({
  config = DEFAULT_DETAILED_CONFIG,
  onChange,
  userStats = { level: 1 },
  onSave,
  saving = false
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [activeCategory, setActiveCategory] = useState('race');

  const handleChange = useCallback((key, value) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onChange?.(newConfig);
  }, [localConfig, onChange]);

  const categories = [
    { id: 'identity', name: 'Identité', icon: Heart },
    { id: 'appearance', name: 'Apparence', icon: Eye },
    { id: 'armor', name: 'Équipement', icon: Shirt },
    { id: 'weapons', name: 'Combat', icon: Sword },
    { id: 'accessories', name: 'Accessoires', icon: Gem },
    { id: 'companions', name: 'Compagnons', icon: Cat },
    { id: 'background', name: 'Fond', icon: Sparkles }
  ];

  const raceData = RACES[localConfig.race] || RACES.human;

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <DetailedPixelAvatarPreview
            config={localConfig}
            size={200}
            className="rounded-xl overflow-hidden shadow-2xl"
          />
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="text-xs font-bold text-white">
              {RACES[localConfig.race]?.name || 'Humain'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Catégories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all
              ${activeCategory === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'}
            `}
          >
            <cat.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Options selon la catégorie */}
      <div className="space-y-3">
        {activeCategory === 'identity' && (
          <>
            <OptionSelector
              title="Genre"
              icon={Heart}
              options={GENDERS}
              value={localConfig.gender}
              onChange={(v) => handleChange('gender', v)}
              userStats={userStats}
            />
            <OptionSelector
              title="Race"
              icon={User}
              options={RACES}
              value={localConfig.race}
              onChange={(v) => handleChange('race', v)}
              userStats={userStats}
            />
            <OptionSelector
              title="Teint de peau"
              icon={Palette}
              options={Object.fromEntries(
                raceData.skinTones.map(tone => [tone, {
                  id: tone,
                  name: tone.charAt(0).toUpperCase() + tone.slice(1).replace('_', ' '),
                  icon: '🎨',
                  unlockCondition: { type: 'default' }
                }])
              )}
              value={localConfig.skinColor}
              onChange={(v) => handleChange('skinColor', v)}
              userStats={userStats}
            />
          </>
        )}

        {activeCategory === 'appearance' && (
          <>
            <OptionSelector
              title="Coiffure"
              icon={User}
              options={HAIR_STYLES}
              value={localConfig.hairStyle}
              onChange={(v) => handleChange('hairStyle', v)}
              userStats={userStats}
              showColors
              colorOptions={HAIR_COLORS}
              colorValue={localConfig.hairColor}
              onColorChange={(v) => handleChange('hairColor', v)}
            />
            {raceData.canHaveBeard && (
              <OptionSelector
                title="Barbe"
                icon={User}
                options={BEARD_STYLES}
                value={localConfig.beardStyle}
                onChange={(v) => handleChange('beardStyle', v)}
                userStats={userStats}
                showColors
                colorOptions={HAIR_COLORS}
                colorValue={localConfig.beardColor}
                onColorChange={(v) => handleChange('beardColor', v)}
              />
            )}
          </>
        )}

        {activeCategory === 'armor' && (
          <OptionSelector
            title="Type d'armure"
            icon={Shield}
            options={ARMOR_TYPES}
            value={localConfig.armorType}
            onChange={(v) => handleChange('armorType', v)}
            userStats={userStats}
            showColors
            colorOptions={ARMOR_COLORS}
            colorValue={localConfig.armorColor}
            onColorChange={(v) => handleChange('armorColor', v)}
          />
        )}

        {activeCategory === 'weapons' && (
          <>
            <OptionSelector
              title="Arme"
              icon={Sword}
              options={WEAPON_TYPES}
              value={localConfig.weapon}
              onChange={(v) => handleChange('weapon', v)}
              userStats={userStats}
            />
            {!WEAPON_TYPES[localConfig.weapon]?.twoHanded && (
              <OptionSelector
                title="Bouclier"
                icon={Shield}
                options={SHIELD_TYPES}
                value={localConfig.shield}
                onChange={(v) => handleChange('shield', v)}
                userStats={userStats}
              />
            )}
          </>
        )}

        {activeCategory === 'accessories' && (
          <>
            <OptionSelector
              title="Casque"
              icon={Crown}
              options={HELMET_TYPES}
              value={localConfig.helmet}
              onChange={(v) => handleChange('helmet', v)}
              userStats={userStats}
            />
            <OptionSelector
              title="Cape"
              icon={Sparkles}
              options={CAPE_TYPES}
              value={localConfig.cape}
              onChange={(v) => handleChange('cape', v)}
              userStats={userStats}
              showColors
              colorOptions={CAPE_COLORS}
              colorValue={localConfig.capeColor}
              onColorChange={(v) => handleChange('capeColor', v)}
            />
            <OptionSelector
              title="Accessoire"
              icon={Gem}
              options={ACCESSORIES}
              value={localConfig.accessory}
              onChange={(v) => handleChange('accessory', v)}
              userStats={userStats}
            />
          </>
        )}

        {activeCategory === 'companions' && (
          <>
            <OptionSelector
              title="Monture"
              icon={Cat}
              options={MOUNTS}
              value={localConfig.mount}
              onChange={(v) => handleChange('mount', v)}
              userStats={userStats}
            />
            <OptionSelector
              title="Animal Totem"
              icon={Bird}
              options={TOTEM_ANIMALS}
              value={localConfig.totemAnimal}
              onChange={(v) => handleChange('totemAnimal', v)}
              userStats={userStats}
            />
          </>
        )}

        {activeCategory === 'background' && (
          <OptionSelector
            title="Fond"
            icon={Sparkles}
            options={BACKGROUNDS}
            value={localConfig.background}
            onChange={(v) => handleChange('background', v)}
            userStats={userStats}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setLocalConfig(DEFAULT_DETAILED_CONFIG);
            onChange?.(DEFAULT_DETAILED_CONFIG);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Réinitialiser</span>
        </button>

        <button
          onClick={() => onSave?.(localConfig)}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="text-sm font-medium text-white">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default DetailedPixelAvatarBuilder;

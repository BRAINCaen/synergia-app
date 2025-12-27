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
  RefreshCw, Save, Eye, Axe, Wand2, Target
} from 'lucide-react';

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
    unlockCondition: { type: 'level', value: 3 }
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
    unlockCondition: { type: 'level', value: 5 }
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
  pale_green: { base: '#98FB98', light: '#B0FFB0', dark: '#7AD97A', shadow: '#5CB85C' }
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
// CONFIGURATION PAR DÉFAUT
// ==========================================
export const DEFAULT_DETAILED_CONFIG = {
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
    pose = 'idle'
  } = config;

  const raceData = RACES[race] || RACES.human;
  const skin = SKIN_COLORS[skinColor] || SKIN_COLORS.medium;
  const hair = HAIR_COLORS[hairColor] || HAIR_COLORS.brown;
  const beard = HAIR_COLORS[beardColor] || HAIR_COLORS.brown;
  const armor = ARMOR_COLORS[armorColor] || ARMOR_COLORS.brown;
  const capeCol = CAPE_COLORS[capeColor] || CAPE_COLORS.red;

  // Ajustements selon la race
  const heightMod = raceData.heightMod || 0;
  const widthMod = raceData.widthMod || 0;

  // Position de base du corps
  const baseX = 32 - widthMod / 2;
  const baseY = 16 - heightMod / 2;

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
        viewBox="0 0 64 72"
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
    { id: 'race', name: 'Race', icon: User },
    { id: 'appearance', name: 'Apparence', icon: Eye },
    { id: 'armor', name: 'Armure', icon: Shield },
    { id: 'weapons', name: 'Armes', icon: Sword },
    { id: 'accessories', name: 'Accessoires', icon: Crown },
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
        {activeCategory === 'race' && (
          <>
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

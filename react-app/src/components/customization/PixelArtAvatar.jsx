// ==========================================
// SYNERGIA v4.1 - Pixel Art RPG Avatar System
// Vrais personnages RPG en pixel art
// ==========================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, Sword, Shield, Crown, Sparkles, Image,
  Lock, Check, ChevronRight, ChevronLeft, Star, Zap,
  RefreshCw, RotateCcw, Save, Eye, Heart, Flame, Snowflake
} from 'lucide-react';

// ==========================================
// CLASSES DE PERSONNAGES RPG
// Chaque classe a plusieurs variantes de couleur
// ==========================================
export const PIXEL_CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Guerrier',
    description: 'Maître des armes et du combat',
    icon: '⚔️',
    baseColor: '#8B4513',
    poses: ['idle', 'attack', 'mounted'],
    unlockCondition: { type: 'default' }
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    description: 'Précision mortelle à distance',
    icon: '🏹',
    baseColor: '#228B22',
    poses: ['idle', 'attack', 'mounted'],
    unlockCondition: { type: 'default' }
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    description: 'Maître des arcanes',
    icon: '🧙',
    baseColor: '#9932CC',
    poses: ['idle', 'cast', 'mounted'],
    unlockCondition: { type: 'level', value: 3 }
  },
  knight: {
    id: 'knight',
    name: 'Chevalier',
    description: 'Défenseur en armure',
    icon: '🛡️',
    baseColor: '#4682B4',
    poses: ['idle', 'attack', 'mounted'],
    unlockCondition: { type: 'level', value: 5 }
  },
  rogue: {
    id: 'rogue',
    name: 'Voleur',
    description: 'Rapide et furtif',
    icon: '🗡️',
    baseColor: '#2F4F4F',
    poses: ['idle', 'attack', 'stealth'],
    unlockCondition: { type: 'level', value: 7 }
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    description: 'Guerrier sacré',
    icon: '✨',
    baseColor: '#FFD700',
    poses: ['idle', 'attack', 'mounted'],
    unlockCondition: { type: 'level', value: 10 }
  },
  necromancer: {
    id: 'necromancer',
    name: 'Nécromancien',
    description: 'Maître des ombres',
    icon: '💀',
    baseColor: '#4B0082',
    poses: ['idle', 'cast', 'summon'],
    unlockCondition: { type: 'level', value: 15 }
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    description: 'Fureur dévastatrice',
    icon: '🔥',
    baseColor: '#DC143C',
    poses: ['idle', 'rage', 'attack'],
    unlockCondition: { type: 'level', value: 12 }
  }
};

// ==========================================
// PALETTES DE COULEURS
// ==========================================
export const PIXEL_PALETTES = {
  default: {
    id: 'default',
    name: 'Classique',
    icon: '🎨',
    colors: { primary: null, secondary: null, accent: null },
    filter: 'none',
    unlockCondition: { type: 'default' }
  },
  forest: {
    id: 'forest',
    name: 'Forêt',
    icon: '🌲',
    colors: { primary: '#228B22', secondary: '#2E8B57', accent: '#90EE90' },
    filter: 'hue-rotate(80deg) saturate(1.2)',
    unlockCondition: { type: 'default' }
  },
  fire: {
    id: 'fire',
    name: 'Feu',
    icon: '🔥',
    colors: { primary: '#DC143C', secondary: '#FF4500', accent: '#FFD700' },
    filter: 'hue-rotate(-30deg) saturate(1.5)',
    unlockCondition: { type: 'level', value: 3 }
  },
  ice: {
    id: 'ice',
    name: 'Glace',
    icon: '❄️',
    colors: { primary: '#4169E1', secondary: '#87CEEB', accent: '#E0FFFF' },
    filter: 'hue-rotate(180deg) saturate(1.3)',
    unlockCondition: { type: 'level', value: 3 }
  },
  shadow: {
    id: 'shadow',
    name: 'Ombre',
    icon: '🌑',
    colors: { primary: '#2F2F2F', secondary: '#4A4A4A', accent: '#696969' },
    filter: 'saturate(0.3) brightness(0.8)',
    unlockCondition: { type: 'level', value: 5 }
  },
  royal: {
    id: 'royal',
    name: 'Royal',
    icon: '👑',
    colors: { primary: '#4B0082', secondary: '#9932CC', accent: '#FFD700' },
    filter: 'hue-rotate(270deg) saturate(1.4)',
    unlockCondition: { type: 'level', value: 8 }
  },
  blood: {
    id: 'blood',
    name: 'Sang',
    icon: '🩸',
    colors: { primary: '#8B0000', secondary: '#DC143C', accent: '#FF6347' },
    filter: 'hue-rotate(-10deg) saturate(1.6) brightness(0.9)',
    unlockCondition: { type: 'level', value: 10 }
  },
  celestial: {
    id: 'celestial',
    name: 'Céleste',
    icon: '⭐',
    colors: { primary: '#FFD700', secondary: '#FFF8DC', accent: '#FFFACD' },
    filter: 'hue-rotate(40deg) saturate(1.2) brightness(1.2)',
    unlockCondition: { type: 'level', value: 15 }
  },
  void: {
    id: 'void',
    name: 'Néant',
    icon: '🕳️',
    colors: { primary: '#0D0D0D', secondary: '#1A1A2E', accent: '#16213E' },
    filter: 'saturate(0.5) brightness(0.6) contrast(1.2)',
    unlockCondition: { type: 'level', value: 20 }
  }
};

// ==========================================
// POSES / VARIANTES
// ==========================================
export const PIXEL_POSES = {
  idle: { id: 'idle', name: 'Repos', icon: '🧍', unlockCondition: { type: 'default' } },
  attack: { id: 'attack', name: 'Attaque', icon: '⚔️', unlockCondition: { type: 'default' } },
  cast: { id: 'cast', name: 'Sort', icon: '✨', unlockCondition: { type: 'level', value: 3 } },
  mounted: { id: 'mounted', name: 'Monture', icon: '🐴', unlockCondition: { type: 'level', value: 5 } },
  stealth: { id: 'stealth', name: 'Furtif', icon: '🌫️', unlockCondition: { type: 'level', value: 7 } },
  rage: { id: 'rage', name: 'Rage', icon: '😤', unlockCondition: { type: 'level', value: 10 } },
  summon: { id: 'summon', name: 'Invocation', icon: '👻', unlockCondition: { type: 'level', value: 12 } }
};

// ==========================================
// FONDS
// ==========================================
export const PIXEL_BACKGROUNDS = {
  none: { id: 'none', name: 'Aucun', gradient: 'transparent', unlockCondition: { type: 'default' } },
  dungeon: { id: 'dungeon', name: 'Donjon', gradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)', unlockCondition: { type: 'default' } },
  forest: { id: 'forest', name: 'Forêt', gradient: 'linear-gradient(180deg, #0d3b0d 0%, #1a4a1a 100%)', unlockCondition: { type: 'level', value: 2 } },
  castle: { id: 'castle', name: 'Château', gradient: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)', unlockCondition: { type: 'level', value: 4 } },
  volcano: { id: 'volcano', name: 'Volcan', gradient: 'linear-gradient(180deg, #4a1a1a 0%, #8b0000 100%)', unlockCondition: { type: 'level', value: 6 } },
  tundra: { id: 'tundra', name: 'Toundra', gradient: 'linear-gradient(180deg, #2c3e50 0%, #5d6d7e 100%)', unlockCondition: { type: 'level', value: 8 } },
  abyss: { id: 'abyss', name: 'Abysses', gradient: 'linear-gradient(180deg, #0d0d0d 0%, #1a0a2e 100%)', unlockCondition: { type: 'level', value: 12 } },
  celestial: { id: 'celestial', name: 'Céleste', gradient: 'linear-gradient(180deg, #1a237e 0%, #4a148c 100%)', unlockCondition: { type: 'level', value: 15 } }
};

// Configuration par défaut
export const DEFAULT_PIXEL_CONFIG = {
  class: 'warrior',
  palette: 'default',
  pose: 'idle',
  background: 'dungeon'
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
    case 'badges': return (userStats.badgesCount || 0) >= condition.value;
    case 'streak': return (userStats.currentStreak || 0) >= condition.value;
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
    case 'badges': return `${condition.value} badges`;
    case 'streak': return `${condition.value}j série`;
    default: return 'Verrouillé';
  }
};

// ==========================================
// GÉNÉRATION SVG PIXEL ART
// Crée des personnages pixel art en SVG
// ==========================================
const generatePixelCharacter = (classId, palette, pose) => {
  const charClass = PIXEL_CLASSES[classId] || PIXEL_CLASSES.warrior;
  const colorPalette = PIXEL_PALETTES[palette] || PIXEL_PALETTES.default;

  // Couleurs de base selon la classe
  const classColors = {
    warrior: { skin: '#deb887', armor: '#8B4513', accent: '#CD853F', weapon: '#C0C0C0' },
    archer: { skin: '#deb887', armor: '#228B22', accent: '#32CD32', weapon: '#8B4513' },
    mage: { skin: '#deb887', armor: '#9932CC', accent: '#BA55D3', weapon: '#FFD700' },
    knight: { skin: '#deb887', armor: '#4682B4', accent: '#87CEEB', weapon: '#C0C0C0' },
    rogue: { skin: '#deb887', armor: '#2F4F4F', accent: '#696969', weapon: '#C0C0C0' },
    paladin: { skin: '#deb887', armor: '#FFD700', accent: '#FFF8DC', weapon: '#FFFFFF' },
    necromancer: { skin: '#c0aede', armor: '#4B0082', accent: '#9370DB', weapon: '#00FF00' },
    berserker: { skin: '#deb887', armor: '#DC143C', accent: '#FF6347', weapon: '#C0C0C0' }
  };

  const colors = classColors[classId] || classColors.warrior;

  // Générer le SVG selon la classe et la pose
  const svgParts = {
    warrior: {
      idle: `
        <!-- Guerrier en repos -->
        <rect x="12" y="4" width="8" height="8" fill="${colors.skin}"/> <!-- Tête -->
        <rect x="14" y="6" width="2" height="2" fill="#000"/> <!-- Œil -->
        <rect x="10" y="12" width="12" height="10" fill="${colors.armor}"/> <!-- Corps -->
        <rect x="8" y="14" width="4" height="8" fill="${colors.armor}"/> <!-- Bras gauche -->
        <rect x="20" y="14" width="4" height="8" fill="${colors.armor}"/> <!-- Bras droit -->
        <rect x="12" y="22" width="4" height="8" fill="${colors.armor}"/> <!-- Jambe gauche -->
        <rect x="16" y="22" width="4" height="8" fill="${colors.armor}"/> <!-- Jambe droite -->
        <rect x="24" y="10" width="2" height="14" fill="${colors.weapon}"/> <!-- Épée -->
        <rect x="22" y="8" width="6" height="2" fill="${colors.weapon}"/> <!-- Garde -->
        <rect x="6" y="14" width="4" height="6" fill="${colors.weapon}"/> <!-- Bouclier -->
        <rect x="10" y="2" width="4" height="4" fill="${colors.accent}"/> <!-- Casque -->
      `,
      attack: `
        <!-- Guerrier attaque -->
        <rect x="12" y="4" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="6" width="2" height="2" fill="#000"/>
        <rect x="10" y="12" width="12" height="10" fill="${colors.armor}"/>
        <rect x="6" y="10" width="4" height="8" fill="${colors.armor}" transform="rotate(-45 8 14)"/>
        <rect x="22" y="8" width="4" height="8" fill="${colors.armor}" transform="rotate(45 24 12)"/>
        <rect x="12" y="22" width="4" height="8" fill="${colors.armor}"/>
        <rect x="16" y="22" width="4" height="8" fill="${colors.armor}"/>
        <rect x="26" y="2" width="2" height="16" fill="${colors.weapon}" transform="rotate(30 27 10)"/>
        <rect x="24" y="0" width="6" height="2" fill="${colors.weapon}" transform="rotate(30 27 1)"/>
        <rect x="10" y="2" width="4" height="4" fill="${colors.accent}"/>
      `,
      mounted: `
        <!-- Guerrier monté -->
        <rect x="14" y="2" width="6" height="6" fill="${colors.skin}"/> <!-- Tête -->
        <rect x="15" y="4" width="2" height="2" fill="#000"/>
        <rect x="12" y="8" width="10" height="8" fill="${colors.armor}"/> <!-- Corps -->
        <rect x="24" y="6" width="2" height="10" fill="${colors.weapon}"/> <!-- Épée -->
        <rect x="12" y="2" width="4" height="3" fill="${colors.accent}"/> <!-- Casque -->
        <!-- Cheval -->
        <rect x="6" y="16" width="20" height="10" fill="#8B4513"/> <!-- Corps cheval -->
        <rect x="2" y="12" width="6" height="8" fill="#8B4513"/> <!-- Tête cheval -->
        <rect x="4" y="14" width="2" height="2" fill="#000"/> <!-- Œil cheval -->
        <rect x="6" y="26" width="4" height="6" fill="#8B4513"/> <!-- Jambe avant -->
        <rect x="20" y="26" width="4" height="6" fill="#8B4513"/> <!-- Jambe arrière -->
      `
    },
    archer: {
      idle: `
        <!-- Archer en repos -->
        <rect x="12" y="4" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="6" width="2" height="2" fill="#000"/>
        <rect x="10" y="12" width="12" height="10" fill="${colors.armor}"/>
        <rect x="8" y="14" width="4" height="8" fill="${colors.armor}"/>
        <rect x="20" y="12" width="4" height="10" fill="${colors.armor}"/>
        <rect x="12" y="22" width="4" height="8" fill="${colors.armor}"/>
        <rect x="16" y="22" width="4" height="8" fill="${colors.armor}"/>
        <!-- Arc -->
        <path d="M 26 8 Q 30 16 26 24" stroke="${colors.weapon}" stroke-width="2" fill="none"/>
        <line x1="26" y1="8" x2="26" y2="24" stroke="#DEB887" stroke-width="1"/>
        <rect x="12" y="2" width="8" height="3" fill="${colors.accent}"/> <!-- Capuche -->
      `,
      attack: `
        <!-- Archer tire -->
        <rect x="10" y="4" width="8" height="8" fill="${colors.skin}"/>
        <rect x="12" y="6" width="2" height="2" fill="#000"/>
        <rect x="8" y="12" width="12" height="10" fill="${colors.armor}"/>
        <rect x="4" y="14" width="6" height="6" fill="${colors.armor}"/> <!-- Bras tendu -->
        <rect x="20" y="14" width="4" height="8" fill="${colors.armor}"/>
        <rect x="10" y="22" width="4" height="8" fill="${colors.armor}"/>
        <rect x="14" y="22" width="4" height="8" fill="${colors.armor}"/>
        <!-- Arc bandé -->
        <path d="M 2 10 Q 6 16 2 22" stroke="${colors.weapon}" stroke-width="2" fill="none"/>
        <line x1="2" y1="10" x2="8" y2="16" stroke="#DEB887" stroke-width="1"/>
        <line x1="2" y1="22" x2="8" y2="16" stroke="#DEB887" stroke-width="1"/>
        <!-- Flèche -->
        <line x1="8" y1="16" x2="24" y2="16" stroke="#8B4513" stroke-width="2"/>
        <polygon points="24,14 28,16 24,18" fill="${colors.weapon}"/>
        <rect x="10" y="2" width="8" height="3" fill="${colors.accent}"/>
      `,
      mounted: `
        <!-- Archer monté -->
        <rect x="14" y="2" width="6" height="6" fill="${colors.skin}"/>
        <rect x="15" y="4" width="2" height="2" fill="#000"/>
        <rect x="12" y="8" width="10" height="8" fill="${colors.armor}"/>
        <path d="M 24 6 Q 28 10 24 14" stroke="${colors.weapon}" stroke-width="2" fill="none"/>
        <rect x="14" y="0" width="6" height="3" fill="${colors.accent}"/>
        <!-- Cheval -->
        <rect x="6" y="16" width="20" height="10" fill="#8B4513"/>
        <rect x="2" y="12" width="6" height="8" fill="#8B4513"/>
        <rect x="4" y="14" width="2" height="2" fill="#000"/>
        <rect x="6" y="26" width="4" height="6" fill="#8B4513"/>
        <rect x="20" y="26" width="4" height="6" fill="#8B4513"/>
      `
    },
    mage: {
      idle: `
        <!-- Mage en repos -->
        <rect x="12" y="6" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="8" width="2" height="2" fill="#000"/>
        <rect x="10" y="14" width="12" height="12" fill="${colors.armor}"/> <!-- Robe -->
        <rect x="8" y="16" width="4" height="8" fill="${colors.armor}"/>
        <rect x="20" y="16" width="4" height="8" fill="${colors.armor}"/>
        <rect x="10" y="26" width="12" height="4" fill="${colors.armor}"/> <!-- Bas de robe -->
        <!-- Chapeau pointu -->
        <polygon points="16,0 10,8 22,8" fill="${colors.accent}"/>
        <rect x="8" y="6" width="16" height="2" fill="${colors.accent}"/>
        <!-- Bâton -->
        <rect x="24" y="4" width="2" height="24" fill="#8B4513"/>
        <circle cx="25" cy="4" r="3" fill="${colors.weapon}"/>
      `,
      cast: `
        <!-- Mage lance un sort -->
        <rect x="12" y="6" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="8" width="2" height="2" fill="#000"/>
        <rect x="10" y="14" width="12" height="12" fill="${colors.armor}"/>
        <rect x="4" y="12" width="8" height="6" fill="${colors.armor}" transform="rotate(-30 8 15)"/>
        <rect x="20" y="12" width="8" height="6" fill="${colors.armor}" transform="rotate(30 24 15)"/>
        <rect x="10" y="26" width="12" height="4" fill="${colors.armor}"/>
        <polygon points="16,0 10,8 22,8" fill="${colors.accent}"/>
        <rect x="8" y="6" width="16" height="2" fill="${colors.accent}"/>
        <!-- Énergie magique -->
        <circle cx="16" cy="4" r="4" fill="${colors.weapon}" opacity="0.6"/>
        <circle cx="4" cy="12" r="3" fill="${colors.weapon}" opacity="0.5"/>
        <circle cx="28" cy="12" r="3" fill="${colors.weapon}" opacity="0.5"/>
      `,
      mounted: `
        <!-- Mage monté -->
        <rect x="14" y="2" width="6" height="6" fill="${colors.skin}"/>
        <rect x="15" y="4" width="2" height="2" fill="#000"/>
        <rect x="12" y="8" width="10" height="8" fill="${colors.armor}"/>
        <polygon points="17,0 13,4 21,4" fill="${colors.accent}"/>
        <rect x="24" y="4" width="2" height="12" fill="#8B4513"/>
        <circle cx="25" cy="4" r="2" fill="${colors.weapon}"/>
        <!-- Cheval magique -->
        <rect x="6" y="16" width="20" height="10" fill="#4B0082"/>
        <rect x="2" y="12" width="6" height="8" fill="#4B0082"/>
        <rect x="4" y="14" width="2" height="2" fill="${colors.weapon}"/>
        <rect x="6" y="26" width="4" height="6" fill="#4B0082"/>
        <rect x="20" y="26" width="4" height="6" fill="#4B0082"/>
      `
    },
    knight: {
      idle: `
        <!-- Chevalier en repos -->
        <rect x="12" y="4" width="8" height="8" fill="${colors.armor}"/> <!-- Casque -->
        <rect x="14" y="6" width="4" height="2" fill="#000" opacity="0.5"/> <!-- Visière -->
        <rect x="10" y="12" width="12" height="12" fill="${colors.armor}"/>
        <rect x="8" y="14" width="4" height="10" fill="${colors.armor}"/>
        <rect x="20" y="14" width="4" height="10" fill="${colors.armor}"/>
        <rect x="10" y="24" width="6" height="8" fill="${colors.armor}"/>
        <rect x="16" y="24" width="6" height="8" fill="${colors.armor}"/>
        <!-- Détails armure -->
        <rect x="14" y="14" width="4" height="4" fill="${colors.accent}"/>
        <!-- Épée et bouclier -->
        <rect x="24" y="8" width="2" height="18" fill="${colors.weapon}"/>
        <rect x="22" y="6" width="6" height="2" fill="${colors.weapon}"/>
        <rect x="4" y="14" width="6" height="10" fill="${colors.accent}"/>
        <rect x="5" y="16" width="4" height="6" fill="${colors.armor}"/>
        <!-- Plume -->
        <rect x="14" y="0" width="2" height="6" fill="#DC143C"/>
      `,
      attack: `
        <!-- Chevalier attaque -->
        <rect x="12" y="4" width="8" height="8" fill="${colors.armor}"/>
        <rect x="14" y="6" width="4" height="2" fill="#000" opacity="0.5"/>
        <rect x="10" y="12" width="12" height="12" fill="${colors.armor}"/>
        <rect x="4" y="10" width="8" height="6" fill="${colors.armor}" transform="rotate(-45 8 13)"/>
        <rect x="20" y="10" width="8" height="6" fill="${colors.armor}" transform="rotate(60 24 13)"/>
        <rect x="10" y="24" width="6" height="8" fill="${colors.armor}"/>
        <rect x="16" y="24" width="6" height="8" fill="${colors.armor}"/>
        <rect x="14" y="14" width="4" height="4" fill="${colors.accent}"/>
        <!-- Épée levée -->
        <rect x="28" y="0" width="2" height="16" fill="${colors.weapon}" transform="rotate(45 29 8)"/>
        <rect x="4" y="8" width="6" height="8" fill="${colors.accent}"/>
        <rect x="14" y="0" width="2" height="6" fill="#DC143C"/>
      `,
      mounted: `
        <!-- Chevalier monté -->
        <rect x="14" y="2" width="6" height="6" fill="${colors.armor}"/>
        <rect x="15" y="4" width="4" height="2" fill="#000" opacity="0.5"/>
        <rect x="12" y="8" width="10" height="8" fill="${colors.armor}"/>
        <rect x="14" y="10" width="4" height="3" fill="${colors.accent}"/>
        <rect x="24" y="4" width="2" height="12" fill="${colors.weapon}"/>
        <rect x="15" y="0" width="2" height="4" fill="#DC143C"/>
        <!-- Cheval en armure -->
        <rect x="6" y="16" width="20" height="10" fill="${colors.accent}"/>
        <rect x="2" y="12" width="6" height="8" fill="${colors.armor}"/>
        <rect x="4" y="14" width="2" height="2" fill="#000"/>
        <rect x="6" y="26" width="4" height="6" fill="${colors.accent}"/>
        <rect x="20" y="26" width="4" height="6" fill="${colors.accent}"/>
      `
    },
    rogue: {
      idle: `
        <!-- Voleur en repos -->
        <rect x="12" y="4" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="6" width="2" height="2" fill="#000"/>
        <rect x="10" y="2" width="12" height="4" fill="${colors.armor}"/> <!-- Capuche -->
        <rect x="10" y="12" width="12" height="10" fill="${colors.armor}"/>
        <rect x="8" y="14" width="4" height="6" fill="${colors.armor}"/>
        <rect x="20" y="14" width="4" height="6" fill="${colors.armor}"/>
        <rect x="12" y="22" width="4" height="8" fill="${colors.armor}"/>
        <rect x="16" y="22" width="4" height="8" fill="${colors.armor}"/>
        <!-- Dagues -->
        <rect x="4" y="16" width="6" height="2" fill="${colors.weapon}"/>
        <polygon points="4,16 2,17 4,18" fill="${colors.weapon}"/>
        <rect x="22" y="16" width="6" height="2" fill="${colors.weapon}"/>
        <polygon points="28,16 30,17 28,18" fill="${colors.weapon}"/>
      `,
      attack: `
        <!-- Voleur attaque -->
        <rect x="12" y="6" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="8" width="2" height="2" fill="#000"/>
        <rect x="10" y="4" width="12" height="4" fill="${colors.armor}"/>
        <rect x="8" y="14" width="14" height="10" fill="${colors.armor}"/>
        <rect x="4" y="10" width="6" height="6" fill="${colors.armor}"/>
        <rect x="22" y="10" width="6" height="6" fill="${colors.armor}"/>
        <rect x="10" y="24" width="4" height="8" fill="${colors.armor}"/>
        <rect x="16" y="24" width="4" height="8" fill="${colors.armor}"/>
        <!-- Dagues en action -->
        <rect x="0" y="10" width="8" height="2" fill="${colors.weapon}"/>
        <rect x="24" y="10" width="8" height="2" fill="${colors.weapon}"/>
      `,
      stealth: `
        <!-- Voleur furtif -->
        <rect x="12" y="8" width="8" height="8" fill="${colors.skin}" opacity="0.7"/>
        <rect x="14" y="10" width="2" height="2" fill="#000" opacity="0.7"/>
        <rect x="10" y="6" width="12" height="4" fill="${colors.armor}" opacity="0.7"/>
        <rect x="10" y="16" width="12" height="8" fill="${colors.armor}" opacity="0.7"/>
        <rect x="10" y="24" width="4" height="6" fill="${colors.armor}" opacity="0.7"/>
        <rect x="16" y="24" width="4" height="6" fill="${colors.armor}" opacity="0.7"/>
        <!-- Effet d'ombre -->
        <rect x="8" y="4" width="16" height="28" fill="#000" opacity="0.3"/>
      `
    },
    paladin: {
      idle: `
        <!-- Paladin en repos -->
        <rect x="12" y="4" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="6" width="2" height="2" fill="#4169E1"/> <!-- Yeux brillants -->
        <rect x="10" y="12" width="12" height="12" fill="${colors.armor}"/>
        <rect x="8" y="14" width="4" height="10" fill="${colors.armor}"/>
        <rect x="20" y="14" width="4" height="10" fill="${colors.armor}"/>
        <rect x="10" y="24" width="6" height="8" fill="${colors.armor}"/>
        <rect x="16" y="24" width="6" height="8" fill="${colors.armor}"/>
        <!-- Détails dorés -->
        <rect x="14" y="14" width="4" height="6" fill="${colors.accent}"/>
        <rect x="15" y="15" width="2" height="4" fill="#FFFFFF"/>
        <!-- Épée sacrée -->
        <rect x="24" y="6" width="2" height="20" fill="${colors.weapon}"/>
        <rect x="22" y="4" width="6" height="2" fill="${colors.weapon}"/>
        <!-- Halo -->
        <ellipse cx="16" cy="2" rx="6" ry="2" fill="${colors.weapon}" opacity="0.5"/>
        <rect x="10" y="2" width="4" height="4" fill="${colors.accent}"/>
      `,
      attack: `
        <!-- Paladin attaque -->
        <rect x="12" y="4" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="6" width="2" height="2" fill="#4169E1"/>
        <rect x="10" y="12" width="12" height="12" fill="${colors.armor}"/>
        <rect x="4" y="10" width="8" height="6" fill="${colors.armor}" transform="rotate(-30 8 13)"/>
        <rect x="20" y="10" width="8" height="6" fill="${colors.armor}" transform="rotate(60 24 13)"/>
        <rect x="10" y="24" width="6" height="8" fill="${colors.armor}"/>
        <rect x="16" y="24" width="6" height="8" fill="${colors.armor}"/>
        <rect x="14" y="14" width="4" height="6" fill="${colors.accent}"/>
        <!-- Lumière sacrée -->
        <rect x="26" y="0" width="3" height="16" fill="${colors.weapon}"/>
        <circle cx="27" cy="0" r="4" fill="${colors.weapon}" opacity="0.6"/>
        <ellipse cx="16" cy="2" rx="6" ry="2" fill="${colors.weapon}" opacity="0.5"/>
      `,
      mounted: `
        <!-- Paladin monté -->
        <rect x="14" y="2" width="6" height="6" fill="${colors.skin}"/>
        <rect x="15" y="4" width="2" height="2" fill="#4169E1"/>
        <rect x="12" y="8" width="10" height="8" fill="${colors.armor}"/>
        <rect x="14" y="10" width="4" height="4" fill="${colors.accent}"/>
        <ellipse cx="17" cy="0" rx="4" ry="2" fill="${colors.weapon}" opacity="0.5"/>
        <rect x="24" y="2" width="2" height="14" fill="${colors.weapon}"/>
        <!-- Destrier sacré -->
        <rect x="6" y="16" width="20" height="10" fill="#FFFFFF"/>
        <rect x="2" y="12" width="6" height="8" fill="#FFFFFF"/>
        <rect x="4" y="14" width="2" height="2" fill="#4169E1"/>
        <rect x="6" y="26" width="4" height="6" fill="#FFFFFF"/>
        <rect x="20" y="26" width="4" height="6" fill="#FFFFFF"/>
      `
    },
    necromancer: {
      idle: `
        <!-- Nécromancien en repos -->
        <rect x="12" y="6" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="8" width="2" height="2" fill="#00FF00"/> <!-- Yeux verts -->
        <rect x="8" y="14" width="16" height="14" fill="${colors.armor}"/>
        <rect x="6" y="16" width="4" height="10" fill="${colors.armor}"/>
        <rect x="22" y="16" width="4" height="10" fill="${colors.armor}"/>
        <rect x="10" y="28" width="12" height="4" fill="${colors.armor}"/>
        <!-- Capuche sinistre -->
        <polygon points="16,0 8,10 24,10" fill="${colors.armor}"/>
        <!-- Bâton maléfique -->
        <rect x="26" y="4" width="2" height="26" fill="#2F4F4F"/>
        <rect x="24" y="2" width="6" height="6" fill="${colors.weapon}"/>
        <!-- Aura sombre -->
        <circle cx="16" cy="20" r="12" fill="${colors.weapon}" opacity="0.2"/>
      `,
      cast: `
        <!-- Nécromancien invoque -->
        <rect x="12" y="6" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="8" width="2" height="2" fill="#00FF00"/>
        <rect x="8" y="14" width="16" height="14" fill="${colors.armor}"/>
        <rect x="2" y="12" width="8" height="6" fill="${colors.armor}"/>
        <rect x="22" y="12" width="8" height="6" fill="${colors.armor}"/>
        <rect x="10" y="28" width="12" height="4" fill="${colors.armor}"/>
        <polygon points="16,0 8,10 24,10" fill="${colors.armor}"/>
        <!-- Énergie nécromantique -->
        <circle cx="4" cy="10" r="4" fill="${colors.weapon}" opacity="0.7"/>
        <circle cx="28" cy="10" r="4" fill="${colors.weapon}" opacity="0.7"/>
        <circle cx="16" cy="4" r="5" fill="${colors.weapon}" opacity="0.5"/>
        <!-- Crânes -->
        <circle cx="4" cy="10" r="2" fill="#FFFFFF"/>
        <circle cx="28" cy="10" r="2" fill="#FFFFFF"/>
      `,
      summon: `
        <!-- Nécromancien avec invocation -->
        <rect x="12" y="6" width="8" height="8" fill="${colors.skin}"/>
        <rect x="14" y="8" width="2" height="2" fill="#00FF00"/>
        <rect x="8" y="14" width="16" height="12" fill="${colors.armor}"/>
        <polygon points="16,0 8,10 24,10" fill="${colors.armor}"/>
        <rect x="8" y="26" width="16" height="4" fill="${colors.armor}"/>
        <!-- Créature invoquée (squelette) -->
        <rect x="2" y="18" width="4" height="4" fill="#FFFFFF"/> <!-- Tête squelette -->
        <rect x="2" y="22" width="4" height="6" fill="#D3D3D3"/> <!-- Corps -->
        <rect x="3" y="19" width="1" height="1" fill="#000"/> <!-- Œil -->
        <circle cx="16" cy="24" r="8" fill="${colors.weapon}" opacity="0.3"/>
      `
    },
    berserker: {
      idle: `
        <!-- Berserker en repos -->
        <rect x="10" y="4" width="12" height="10" fill="${colors.skin}"/>
        <rect x="12" y="6" width="3" height="2" fill="#000"/>
        <rect x="17" y="6" width="3" height="2" fill="#000"/>
        <rect x="8" y="14" width="16" height="12" fill="${colors.armor}"/>
        <rect x="4" y="16" width="6" height="10" fill="${colors.skin}"/> <!-- Bras musclé -->
        <rect x="22" y="16" width="6" height="10" fill="${colors.skin}"/>
        <rect x="10" y="26" width="6" height="8" fill="${colors.armor}"/>
        <rect x="16" y="26" width="6" height="8" fill="${colors.armor}"/>
        <!-- Grande hache -->
        <rect x="26" y="8" width="2" height="20" fill="#8B4513"/>
        <rect x="24" y="6" width="8" height="6" fill="${colors.weapon}"/>
        <!-- Cheveux sauvages -->
        <rect x="8" y="2" width="4" height="6" fill="${colors.accent}"/>
        <rect x="20" y="2" width="4" height="6" fill="${colors.accent}"/>
      `,
      rage: `
        <!-- Berserker en rage -->
        <rect x="10" y="4" width="12" height="10" fill="${colors.skin}"/>
        <rect x="12" y="6" width="3" height="3" fill="#FF0000"/> <!-- Yeux rouges -->
        <rect x="17" y="6" width="3" height="3" fill="#FF0000"/>
        <rect x="8" y="14" width="16" height="12" fill="${colors.armor}"/>
        <rect x="2" y="12" width="8" height="10" fill="${colors.skin}"/>
        <rect x="22" y="12" width="8" height="10" fill="${colors.skin}"/>
        <rect x="10" y="26" width="6" height="8" fill="${colors.armor}"/>
        <rect x="16" y="26" width="6" height="8" fill="${colors.armor}"/>
        <!-- Aura de rage -->
        <circle cx="16" cy="16" r="14" fill="${colors.accent}" opacity="0.3"/>
        <!-- Hache levée -->
        <rect x="26" y="0" width="2" height="20" fill="#8B4513" transform="rotate(15 27 10)"/>
        <rect x="24" y="-2" width="8" height="6" fill="${colors.weapon}" transform="rotate(15 28 1)"/>
        <rect x="8" y="0" width="4" height="8" fill="${colors.accent}"/>
        <rect x="20" y="0" width="4" height="8" fill="${colors.accent}"/>
      `,
      attack: `
        <!-- Berserker attaque -->
        <rect x="10" y="6" width="12" height="10" fill="${colors.skin}"/>
        <rect x="12" y="8" width="3" height="2" fill="#FF0000"/>
        <rect x="17" y="8" width="3" height="2" fill="#FF0000"/>
        <rect x="8" y="16" width="16" height="10" fill="${colors.armor}"/>
        <rect x="0" y="8" width="10" height="8" fill="${colors.skin}"/>
        <rect x="22" y="8" width="10" height="8" fill="${colors.skin}"/>
        <rect x="10" y="26" width="6" height="6" fill="${colors.armor}"/>
        <rect x="16" y="26" width="6" height="6" fill="${colors.armor}"/>
        <!-- Double haches -->
        <rect x="-2" y="4" width="8" height="6" fill="${colors.weapon}"/>
        <rect x="26" y="4" width="8" height="6" fill="${colors.weapon}"/>
        <rect x="8" y="2" width="4" height="6" fill="${colors.accent}"/>
        <rect x="20" y="2" width="4" height="6" fill="${colors.accent}"/>
      `
    }
  };

  const classSvg = svgParts[classId] || svgParts.warrior;
  const poseSvg = classSvg[pose] || classSvg.idle;

  return poseSvg;
};

// ==========================================
// COMPOSANT AVATAR PREVIEW
// ==========================================
export const PixelArtAvatarPreview = ({
  config,
  size = 'large',
  showEffects = true,
  animated = true,
  className = ''
}) => {
  const sizeClasses = {
    tiny: 'w-8 h-8',
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40',
    xlarge: 'w-56 h-56'
  };

  const palette = PIXEL_PALETTES[config.palette] || PIXEL_PALETTES.default;
  const background = PIXEL_BACKGROUNDS[config.background] || PIXEL_BACKGROUNDS.dungeon;
  const svgContent = generatePixelCharacter(config.class, config.palette, config.pose);

  return (
    <motion.div
      className={`relative ${className}`}
      animate={animated ? { y: [0, -4, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className={`
          ${sizeClasses[size]} rounded-xl overflow-hidden
          border-4 border-white/20 shadow-2xl
          flex items-center justify-center relative
        `}
        style={{
          background: background.gradient,
          imageRendering: 'pixelated'
        }}
      >
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full"
          style={{
            filter: palette.filter,
            imageRendering: 'pixelated'
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />

        {/* Effet de brillance */}
        {showEffects && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </div>

      {/* Ombre */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/30 rounded-full blur-sm" />
    </motion.div>
  );
};

// ==========================================
// COMPOSANT ITEM SELECTOR
// ==========================================
const ItemSelector = ({ items, selectedId, onSelect, userStats, columns = 4, showIcon = true }) => {
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
              ${isSelected ? 'ring-2 ring-yellow-500 border-yellow-500 bg-yellow-500/20' : ''}
            `}
          >
            <div className="flex flex-col items-center gap-1">
              {showIcon && <span className="text-2xl">{item.icon}</span>}
              <span className={`text-xs font-medium text-center ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </div>

            {isSelected && unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-black" />
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
// COMPOSANT PRINCIPAL - PIXEL ART AVATAR BUILDER
// ==========================================
const PixelArtAvatarBuilder = ({
  initialConfig = DEFAULT_PIXEL_CONFIG,
  userStats = {},
  onSave,
  onCancel,
  saving = false
}) => {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState('class');

  const categories = [
    { id: 'class', label: 'Classe', icon: Sword, items: PIXEL_CLASSES, columns: 4 },
    { id: 'palette', label: 'Couleur', icon: Palette, items: PIXEL_PALETTES, columns: 3 },
    { id: 'pose', label: 'Pose', icon: User, items: PIXEL_POSES, columns: 4 },
    { id: 'background', label: 'Fond', icon: Image, items: PIXEL_BACKGROUNDS, columns: 4 }
  ];

  // Filtrer les poses disponibles pour la classe sélectionnée
  const availablePoses = useMemo(() => {
    const charClass = PIXEL_CLASSES[config.class];
    if (!charClass?.poses) return PIXEL_POSES;

    return Object.fromEntries(
      Object.entries(PIXEL_POSES).filter(([id]) => charClass.poses.includes(id))
    );
  }, [config.class]);

  const unlockStats = useMemo(() => {
    let total = 0, unlocked = 0;
    categories.forEach(cat => {
      const items = cat.id === 'pose' ? availablePoses : cat.items;
      const itemsArray = Object.values(items);
      total += itemsArray.length;
      unlocked += itemsArray.filter(item => isUnlocked(item, userStats)).length;
    });
    return { total, unlocked, percentage: Math.round((unlocked / total) * 100) };
  }, [userStats, availablePoses]);

  const handleSelect = (categoryId, itemId) => {
    setConfig(prev => {
      const newConfig = { ...prev, [categoryId]: itemId };

      // Si on change de classe, vérifier que la pose est toujours valide
      if (categoryId === 'class') {
        const newClass = PIXEL_CLASSES[itemId];
        if (newClass?.poses && !newClass.poses.includes(prev.pose)) {
          newConfig.pose = newClass.poses[0] || 'idle';
        }
      }

      return newConfig;
    });
  };

  const handleRandomize = () => {
    const newConfig = { ...config };

    // Classe aléatoire
    const unlockedClasses = Object.values(PIXEL_CLASSES).filter(c => isUnlocked(c, userStats));
    if (unlockedClasses.length > 0) {
      const randomClass = unlockedClasses[Math.floor(Math.random() * unlockedClasses.length)];
      newConfig.class = randomClass.id;

      // Pose aléatoire pour cette classe
      const classPoses = randomClass.poses || ['idle'];
      const unlockedPoses = classPoses.filter(p => isUnlocked(PIXEL_POSES[p], userStats));
      if (unlockedPoses.length > 0) {
        newConfig.pose = unlockedPoses[Math.floor(Math.random() * unlockedPoses.length)];
      }
    }

    // Palette aléatoire
    const unlockedPalettes = Object.values(PIXEL_PALETTES).filter(p => isUnlocked(p, userStats));
    if (unlockedPalettes.length > 0) {
      newConfig.palette = unlockedPalettes[Math.floor(Math.random() * unlockedPalettes.length)].id;
    }

    // Fond aléatoire
    const unlockedBgs = Object.values(PIXEL_BACKGROUNDS).filter(b => isUnlocked(b, userStats));
    if (unlockedBgs.length > 0) {
      newConfig.background = unlockedBgs[Math.floor(Math.random() * unlockedBgs.length)].id;
    }

    setConfig(newConfig);
  };

  const handleReset = () => setConfig(DEFAULT_PIXEL_CONFIG);
  const handleSave = () => onSave && onSave(config);

  const currentCategory = categories.find(c => c.id === activeTab);
  const currentClass = PIXEL_CLASSES[config.class];

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
              <Eye className="w-5 h-5 text-yellow-400" />
              Aperçu
            </h3>
          </div>

          <div className="flex justify-center py-4">
            <PixelArtAvatarPreview config={config} size="xlarge" />
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
              className="flex-1 py-2 px-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm font-medium flex items-center justify-center gap-2"
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
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Débloqués</span>
              <span className="text-sm font-bold text-yellow-300">{unlockStats.unlocked}/{unlockStats.total}</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${unlockStats.percentage}%` }}
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
              />
            </div>
          </div>

          {/* Save */}
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
            const items = cat.id === 'pose' ? availablePoses : cat.items;
            const itemCount = Object.keys(items).length;
            const unlockedCount = Object.values(items).filter(item => isUnlocked(item, userStats)).length;

            return (
              <motion.button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                  ${activeTab === cat.id
                    ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/30'
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
              {currentCategory && <currentCategory.icon className="w-5 h-5 text-yellow-400" />}
              {currentCategory?.label}
            </h3>
          </div>

          <ItemSelector
            items={activeTab === 'pose' ? availablePoses : currentCategory?.items || {}}
            selectedId={config[activeTab]}
            onSelect={(id) => handleSelect(activeTab, id)}
            userStats={userStats}
            columns={currentCategory?.columns || 4}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default PixelArtAvatarBuilder;
export { PixelArtAvatarBuilder };

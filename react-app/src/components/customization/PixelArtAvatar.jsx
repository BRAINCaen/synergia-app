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
// GÉNÉRATION SVG PIXEL ART 64x64
// Crée des personnages pixel art détaillés en SVG
// ==========================================
const generatePixelCharacter = (classId, palette, pose) => {
  const charClass = PIXEL_CLASSES[classId] || PIXEL_CLASSES.warrior;
  const colorPalette = PIXEL_PALETTES[palette] || PIXEL_PALETTES.default;

  // Couleurs de base selon la classe avec nuances pour le shading
  const classColors = {
    warrior: {
      skin: '#deb887', skinLight: '#f5deb3', skinDark: '#c4a574',
      armor: '#8B4513', armorLight: '#a0522d', armorDark: '#5c2e0c',
      accent: '#CD853F', accentLight: '#daa520', accentDark: '#8b6914',
      weapon: '#C0C0C0', weaponLight: '#e0e0e0', weaponDark: '#808080',
      hair: '#4a3728', hairLight: '#5c4533', hairDark: '#2d1f17'
    },
    archer: {
      skin: '#deb887', skinLight: '#f5deb3', skinDark: '#c4a574',
      armor: '#228B22', armorLight: '#2e8b2e', armorDark: '#155615',
      accent: '#32CD32', accentLight: '#50fa50', accentDark: '#228b22',
      weapon: '#8B4513', weaponLight: '#a0522d', weaponDark: '#5c2e0c',
      hair: '#654321', hairLight: '#7a5a32', hairDark: '#3e2a15'
    },
    mage: {
      skin: '#deb887', skinLight: '#f5deb3', skinDark: '#c4a574',
      armor: '#9932CC', armorLight: '#ba55d3', armorDark: '#6b1f8a',
      accent: '#BA55D3', accentLight: '#da70d6', accentDark: '#8b3a9b',
      weapon: '#FFD700', weaponLight: '#ffec8b', weaponDark: '#b8860b',
      hair: '#f0f0f0', hairLight: '#ffffff', hairDark: '#c0c0c0'
    },
    knight: {
      skin: '#deb887', skinLight: '#f5deb3', skinDark: '#c4a574',
      armor: '#4682B4', armorLight: '#5a9bd4', armorDark: '#2c5576',
      accent: '#87CEEB', accentLight: '#b0e0e6', accentDark: '#5cacdb',
      weapon: '#C0C0C0', weaponLight: '#e0e0e0', weaponDark: '#808080',
      hair: '#2d2d2d', hairLight: '#404040', hairDark: '#1a1a1a'
    },
    rogue: {
      skin: '#deb887', skinLight: '#f5deb3', skinDark: '#c4a574',
      armor: '#2F4F4F', armorLight: '#3d6666', armorDark: '#1e3232',
      accent: '#696969', accentLight: '#808080', accentDark: '#4a4a4a',
      weapon: '#C0C0C0', weaponLight: '#e0e0e0', weaponDark: '#808080',
      hair: '#1a1a1a', hairLight: '#2d2d2d', hairDark: '#0d0d0d'
    },
    paladin: {
      skin: '#deb887', skinLight: '#f5deb3', skinDark: '#c4a574',
      armor: '#FFD700', armorLight: '#ffec8b', armorDark: '#b8860b',
      accent: '#FFF8DC', accentLight: '#ffffff', accentDark: '#f5deb3',
      weapon: '#FFFFFF', weaponLight: '#ffffff', weaponDark: '#c0c0c0',
      hair: '#f0e68c', hairLight: '#fffacd', hairDark: '#daa520'
    },
    necromancer: {
      skin: '#c0aede', skinLight: '#d8cff0', skinDark: '#9580c0',
      armor: '#4B0082', armorLight: '#663399', armorDark: '#2e004d',
      accent: '#9370DB', accentLight: '#b8a0e8', accentDark: '#6a50a7',
      weapon: '#00FF00', weaponLight: '#50ff50', weaponDark: '#00b800',
      hair: '#1a0033', hairLight: '#2d004d', hairDark: '#0d001a'
    },
    berserker: {
      skin: '#deb887', skinLight: '#f5deb3', skinDark: '#c4a574',
      armor: '#DC143C', armorLight: '#ff3050', armorDark: '#8b0a25',
      accent: '#FF6347', accentLight: '#ff8066', accentDark: '#cc4f38',
      weapon: '#C0C0C0', weaponLight: '#e0e0e0', weaponDark: '#808080',
      hair: '#8b0000', hairLight: '#b22222', hairDark: '#5c0000'
    }
  };

  const colors = classColors[classId] || classColors.warrior;

  // Générer le SVG selon la classe et la pose - 64x64 pixels avec détails
  const svgParts = {
    warrior: {
      idle: `
        <!-- GUERRIER 64x64 - IDLE -->
        <!-- Cheveux -->
        <rect x="22" y="4" width="20" height="4" fill="${colors.hair}"/>
        <rect x="20" y="6" width="4" height="6" fill="${colors.hair}"/>
        <rect x="40" y="6" width="4" height="6" fill="${colors.hair}"/>
        <rect x="24" y="6" width="16" height="2" fill="${colors.hairLight}"/>

        <!-- Casque -->
        <rect x="22" y="2" width="20" height="4" fill="${colors.accent}"/>
        <rect x="24" y="0" width="16" height="2" fill="${colors.accentLight}"/>
        <rect x="28" y="0" width="8" height="6" fill="${colors.accentDark}"/>
        <rect x="30" y="-2" width="4" height="4" fill="${colors.accent}"/>

        <!-- Tête -->
        <rect x="22" y="8" width="20" height="16" fill="${colors.skin}"/>
        <rect x="24" y="10" width="16" height="12" fill="${colors.skinLight}"/>
        <rect x="20" y="12" width="2" height="8" fill="${colors.skinDark}"/>
        <rect x="42" y="12" width="2" height="8" fill="${colors.skinDark}"/>

        <!-- Yeux -->
        <rect x="26" y="14" width="4" height="4" fill="#fff"/>
        <rect x="34" y="14" width="4" height="4" fill="#fff"/>
        <rect x="28" y="15" width="2" height="3" fill="#4a3728"/>
        <rect x="36" y="15" width="2" height="3" fill="#4a3728"/>
        <rect x="28" y="16" width="1" height="1" fill="#000"/>
        <rect x="36" y="16" width="1" height="1" fill="#000"/>

        <!-- Sourcils -->
        <rect x="26" y="12" width="4" height="1" fill="${colors.hairDark}"/>
        <rect x="34" y="12" width="4" height="1" fill="${colors.hairDark}"/>

        <!-- Nez -->
        <rect x="31" y="17" width="2" height="3" fill="${colors.skinDark}"/>

        <!-- Bouche -->
        <rect x="29" y="21" width="6" height="1" fill="#8b5a5a"/>
        <rect x="30" y="22" width="4" height="1" fill="${colors.skinDark}"/>

        <!-- Cou -->
        <rect x="28" y="24" width="8" height="4" fill="${colors.skin}"/>

        <!-- Armure corps -->
        <rect x="18" y="28" width="28" height="20" fill="${colors.armor}"/>
        <rect x="20" y="30" width="24" height="16" fill="${colors.armorLight}"/>
        <rect x="18" y="28" width="4" height="20" fill="${colors.armorDark}"/>
        <rect x="42" y="28" width="4" height="20" fill="${colors.armorDark}"/>

        <!-- Détails armure -->
        <rect x="28" y="32" width="8" height="10" fill="${colors.accent}"/>
        <rect x="30" y="34" width="4" height="6" fill="${colors.accentLight}"/>
        <rect x="24" y="36" width="2" height="2" fill="${colors.accentDark}"/>
        <rect x="38" y="36" width="2" height="2" fill="${colors.accentDark}"/>

        <!-- Ceinture -->
        <rect x="20" y="46" width="24" height="3" fill="${colors.accentDark}"/>
        <rect x="30" y="45" width="4" height="4" fill="${colors.accent}"/>

        <!-- Bras gauche -->
        <rect x="10" y="28" width="8" height="16" fill="${colors.armor}"/>
        <rect x="12" y="30" width="4" height="12" fill="${colors.armorLight}"/>
        <rect x="10" y="28" width="2" height="16" fill="${colors.armorDark}"/>
        <!-- Gant gauche -->
        <rect x="10" y="44" width="8" height="6" fill="${colors.accentDark}"/>
        <rect x="8" y="48" width="4" height="4" fill="${colors.skin}"/>

        <!-- Bras droit avec épée -->
        <rect x="46" y="28" width="8" height="16" fill="${colors.armor}"/>
        <rect x="48" y="30" width="4" height="12" fill="${colors.armorLight}"/>
        <rect x="52" y="28" width="2" height="16" fill="${colors.armorDark}"/>
        <!-- Gant droit -->
        <rect x="46" y="44" width="8" height="6" fill="${colors.accentDark}"/>
        <rect x="52" y="48" width="4" height="4" fill="${colors.skin}"/>

        <!-- Épée -->
        <rect x="56" y="20" width="4" height="30" fill="${colors.weapon}"/>
        <rect x="57" y="22" width="2" height="26" fill="${colors.weaponLight}"/>
        <rect x="54" y="48" width="8" height="4" fill="${colors.weaponDark}"/>
        <rect x="55" y="52" width="6" height="6" fill="${colors.accentDark}"/>
        <rect x="56" y="18" width="4" height="4" fill="${colors.weaponLight}"/>

        <!-- Bouclier (gauche) -->
        <rect x="2" y="32" width="10" height="16" fill="${colors.weapon}"/>
        <rect x="4" y="34" width="6" height="12" fill="${colors.weaponDark}"/>
        <rect x="5" y="36" width="4" height="8" fill="${colors.accent}"/>
        <rect x="6" y="38" width="2" height="4" fill="${colors.accentLight}"/>

        <!-- Jambe gauche -->
        <rect x="20" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="22" y="50" width="6" height="8" fill="${colors.armorLight}"/>
        <!-- Botte gauche -->
        <rect x="18" y="58" width="12" height="6" fill="${colors.armorDark}"/>
        <rect x="16" y="60" width="4" height="4" fill="${colors.armorDark}"/>

        <!-- Jambe droite -->
        <rect x="34" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="36" y="50" width="6" height="8" fill="${colors.armorLight}"/>
        <!-- Botte droite -->
        <rect x="34" y="58" width="12" height="6" fill="${colors.armorDark}"/>
        <rect x="44" y="60" width="4" height="4" fill="${colors.armorDark}"/>
      `,
      attack: `
        <!-- GUERRIER 64x64 - ATTACK -->
        <!-- Casque -->
        <rect x="22" y="2" width="20" height="4" fill="${colors.accent}"/>
        <rect x="24" y="0" width="16" height="2" fill="${colors.accentLight}"/>
        <rect x="28" y="0" width="8" height="6" fill="${colors.accentDark}"/>

        <!-- Tête tournée -->
        <rect x="20" y="8" width="20" height="16" fill="${colors.skin}"/>
        <rect x="22" y="10" width="16" height="12" fill="${colors.skinLight}"/>

        <!-- Yeux déterminés -->
        <rect x="24" y="14" width="4" height="3" fill="#fff"/>
        <rect x="32" y="14" width="4" height="3" fill="#fff"/>
        <rect x="26" y="14" width="2" height="3" fill="#4a3728"/>
        <rect x="34" y="14" width="2" height="3" fill="#4a3728"/>

        <!-- Sourcils froncés -->
        <rect x="24" y="12" width="5" height="2" fill="${colors.hairDark}"/>
        <rect x="31" y="12" width="5" height="2" fill="${colors.hairDark}"/>

        <!-- Bouche cri -->
        <rect x="28" y="20" width="6" height="3" fill="#5a2020"/>

        <!-- Cou -->
        <rect x="26" y="24" width="8" height="4" fill="${colors.skin}"/>

        <!-- Armure corps -->
        <rect x="16" y="28" width="28" height="20" fill="${colors.armor}"/>
        <rect x="18" y="30" width="24" height="16" fill="${colors.armorLight}"/>
        <rect x="28" y="32" width="8" height="10" fill="${colors.accent}"/>

        <!-- Ceinture -->
        <rect x="18" y="46" width="24" height="3" fill="${colors.accentDark}"/>

        <!-- Bras gauche (bouclier levé) -->
        <rect x="4" y="20" width="12" height="8" fill="${colors.armor}"/>
        <rect x="6" y="22" width="8" height="4" fill="${colors.armorLight}"/>
        <!-- Bouclier en défense -->
        <rect x="0" y="12" width="12" height="18" fill="${colors.weapon}"/>
        <rect x="2" y="14" width="8" height="14" fill="${colors.weaponDark}"/>
        <rect x="3" y="16" width="6" height="10" fill="${colors.accent}"/>

        <!-- Bras droit (épée haute) -->
        <rect x="44" y="12" width="8" height="16" fill="${colors.armor}"/>
        <rect x="46" y="14" width="4" height="12" fill="${colors.armorLight}"/>
        <!-- Main -->
        <rect x="48" y="8" width="6" height="6" fill="${colors.skin}"/>

        <!-- Épée levée -->
        <rect x="52" y="0" width="4" height="28" fill="${colors.weapon}"/>
        <rect x="53" y="2" width="2" height="24" fill="${colors.weaponLight}"/>
        <rect x="50" y="26" width="8" height="4" fill="${colors.weaponDark}"/>
        <rect x="54" y="0" width="6" height="6" fill="${colors.weaponLight}"/>
        <rect x="58" y="2" width="4" height="4" fill="${colors.accent}"/>

        <!-- Jambes écartées -->
        <rect x="16" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="18" y="50" width="6" height="8" fill="${colors.armorLight}"/>
        <rect x="14" y="58" width="12" height="6" fill="${colors.armorDark}"/>

        <rect x="34" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="36" y="50" width="6" height="8" fill="${colors.armorLight}"/>
        <rect x="34" y="58" width="12" height="6" fill="${colors.armorDark}"/>
      `,
      mounted: `
        <!-- GUERRIER 64x64 - MOUNTED -->
        <!-- Casque -->
        <rect x="24" y="0" width="16" height="4" fill="${colors.accent}"/>
        <rect x="26" y="-2" width="12" height="2" fill="${colors.accentLight}"/>
        <rect x="30" y="-4" width="4" height="4" fill="${colors.accentDark}"/>

        <!-- Tête -->
        <rect x="24" y="4" width="16" height="12" fill="${colors.skin}"/>
        <rect x="26" y="6" width="12" height="8" fill="${colors.skinLight}"/>
        <!-- Yeux -->
        <rect x="28" y="8" width="3" height="3" fill="#fff"/>
        <rect x="34" y="8" width="3" height="3" fill="#fff"/>
        <rect x="29" y="9" width="2" height="2" fill="#4a3728"/>
        <rect x="35" y="9" width="2" height="2" fill="#4a3728"/>

        <!-- Corps sur cheval -->
        <rect x="22" y="16" width="20" height="14" fill="${colors.armor}"/>
        <rect x="24" y="18" width="16" height="10" fill="${colors.armorLight}"/>
        <rect x="30" y="20" width="4" height="6" fill="${colors.accent}"/>

        <!-- Bras avec épée -->
        <rect x="42" y="16" width="6" height="12" fill="${colors.armor}"/>
        <rect x="48" y="12" width="4" height="20" fill="${colors.weapon}"/>
        <rect x="46" y="10" width="8" height="4" fill="${colors.weaponDark}"/>

        <!-- CHEVAL -->
        <!-- Corps cheval -->
        <rect x="8" y="32" width="48" height="20" fill="#8B4513"/>
        <rect x="12" y="34" width="40" height="16" fill="#a0522d"/>
        <rect x="8" y="32" width="4" height="20" fill="#5c2e0c"/>
        <rect x="52" y="32" width="4" height="20" fill="#5c2e0c"/>

        <!-- Tête cheval -->
        <rect x="0" y="24" width="14" height="16" fill="#8B4513"/>
        <rect x="2" y="26" width="10" height="12" fill="#a0522d"/>
        <!-- Œil cheval -->
        <rect x="4" y="30" width="4" height="3" fill="#fff"/>
        <rect x="5" y="31" width="2" height="2" fill="#000"/>
        <!-- Naseaux -->
        <rect x="2" y="36" width="2" height="2" fill="#5c2e0c"/>
        <rect x="6" y="36" width="2" height="2" fill="#5c2e0c"/>
        <!-- Crinière -->
        <rect x="12" y="22" width="4" height="12" fill="#2d1f17"/>
        <rect x="16" y="24" width="4" height="10" fill="#2d1f17"/>

        <!-- Selle -->
        <rect x="20" y="30" width="24" height="6" fill="${colors.accent}"/>
        <rect x="22" y="28" width="20" height="4" fill="${colors.accentLight}"/>

        <!-- Jambes cheval -->
        <rect x="10" y="52" width="6" height="12" fill="#8B4513"/>
        <rect x="12" y="54" width="2" height="8" fill="#a0522d"/>
        <rect x="8" y="62" width="8" height="2" fill="#5c2e0c"/>

        <rect x="20" y="52" width="6" height="12" fill="#8B4513"/>
        <rect x="22" y="54" width="2" height="8" fill="#a0522d"/>
        <rect x="18" y="62" width="8" height="2" fill="#5c2e0c"/>

        <rect x="38" y="52" width="6" height="12" fill="#8B4513"/>
        <rect x="40" y="54" width="2" height="8" fill="#a0522d"/>
        <rect x="36" y="62" width="8" height="2" fill="#5c2e0c"/>

        <rect x="48" y="52" width="6" height="12" fill="#8B4513"/>
        <rect x="50" y="54" width="2" height="8" fill="#a0522d"/>
        <rect x="46" y="62" width="8" height="2" fill="#5c2e0c"/>

        <!-- Queue cheval -->
        <rect x="54" y="36" width="4" height="16" fill="#2d1f17"/>
        <rect x="56" y="40" width="4" height="14" fill="#2d1f17"/>
      `
    },
    archer: {
      idle: `
        <!-- ARCHER 64x64 - IDLE -->
        <!-- Capuche -->
        <rect x="20" y="2" width="24" height="8" fill="${colors.armor}"/>
        <rect x="22" y="4" width="20" height="4" fill="${colors.armorLight}"/>
        <rect x="18" y="6" width="4" height="10" fill="${colors.armor}"/>
        <rect x="42" y="6" width="4" height="10" fill="${colors.armor}"/>
        <rect x="24" y="0" width="16" height="4" fill="${colors.armorDark}"/>

        <!-- Tête -->
        <rect x="22" y="8" width="20" height="16" fill="${colors.skin}"/>
        <rect x="24" y="10" width="16" height="12" fill="${colors.skinLight}"/>

        <!-- Yeux perçants -->
        <rect x="26" y="14" width="4" height="4" fill="#fff"/>
        <rect x="34" y="14" width="4" height="4" fill="#fff"/>
        <rect x="28" y="15" width="2" height="3" fill="#2e8b2e"/>
        <rect x="36" y="15" width="2" height="3" fill="#2e8b2e"/>
        <rect x="28" y="16" width="1" height="1" fill="#000"/>
        <rect x="36" y="16" width="1" height="1" fill="#000"/>

        <!-- Sourcils -->
        <rect x="26" y="12" width="4" height="1" fill="${colors.hairDark}"/>
        <rect x="34" y="12" width="4" height="1" fill="${colors.hairDark}"/>

        <!-- Nez et bouche -->
        <rect x="31" y="17" width="2" height="3" fill="${colors.skinDark}"/>
        <rect x="29" y="21" width="6" height="1" fill="#8b5a5a"/>

        <!-- Cou -->
        <rect x="28" y="24" width="8" height="4" fill="${colors.skin}"/>

        <!-- Tunique -->
        <rect x="18" y="28" width="28" height="20" fill="${colors.armor}"/>
        <rect x="20" y="30" width="24" height="16" fill="${colors.armorLight}"/>
        <rect x="18" y="28" width="4" height="20" fill="${colors.armorDark}"/>
        <rect x="42" y="28" width="4" height="20" fill="${colors.armorDark}"/>

        <!-- Ceinture avec carquois -->
        <rect x="20" y="46" width="24" height="3" fill="${colors.accentDark}"/>
        <rect x="30" y="45" width="4" height="4" fill="${colors.accent}"/>

        <!-- Carquois (dos) -->
        <rect x="44" y="26" width="6" height="24" fill="${colors.weaponDark}"/>
        <rect x="45" y="24" width="4" height="4" fill="${colors.accent}"/>
        <rect x="46" y="22" width="2" height="6" fill="${colors.weapon}"/>
        <rect x="48" y="20" width="2" height="8" fill="${colors.weapon}"/>
        <rect x="50" y="18" width="2" height="10" fill="${colors.weapon}"/>

        <!-- Bras gauche -->
        <rect x="10" y="28" width="8" height="14" fill="${colors.armor}"/>
        <rect x="12" y="30" width="4" height="10" fill="${colors.armorLight}"/>
        <!-- Main gauche -->
        <rect x="10" y="42" width="6" height="6" fill="${colors.skin}"/>

        <!-- Bras droit tenant l'arc -->
        <rect x="46" y="30" width="8" height="14" fill="${colors.armor}"/>
        <rect x="48" y="32" width="4" height="10" fill="${colors.armorLight}"/>
        <!-- Main droite -->
        <rect x="52" y="44" width="6" height="6" fill="${colors.skin}"/>

        <!-- Arc -->
        <path d="M 58 20 Q 64 40 58 60" stroke="${colors.weapon}" stroke-width="4" fill="none"/>
        <line x1="58" y1="20" x2="58" y2="60" stroke="#DEB887" stroke-width="2"/>

        <!-- Jambe gauche -->
        <rect x="20" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="22" y="50" width="6" height="8" fill="${colors.armorLight}"/>
        <!-- Botte gauche -->
        <rect x="18" y="58" width="12" height="6" fill="${colors.armorDark}"/>

        <!-- Jambe droite -->
        <rect x="34" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="36" y="50" width="6" height="8" fill="${colors.armorLight}"/>
        <!-- Botte droite -->
        <rect x="34" y="58" width="12" height="6" fill="${colors.armorDark}"/>
      `,
      attack: `
        <!-- ARCHER 64x64 - ATTACK (tire) -->
        <!-- Capuche -->
        <rect x="18" y="2" width="24" height="8" fill="${colors.armor}"/>
        <rect x="20" y="4" width="20" height="4" fill="${colors.armorLight}"/>
        <rect x="16" y="6" width="4" height="10" fill="${colors.armor}"/>
        <rect x="40" y="6" width="4" height="10" fill="${colors.armor}"/>

        <!-- Tête concentrée -->
        <rect x="20" y="8" width="20" height="16" fill="${colors.skin}"/>
        <rect x="22" y="10" width="16" height="12" fill="${colors.skinLight}"/>

        <!-- Yeux qui visent -->
        <rect x="24" y="14" width="4" height="3" fill="#fff"/>
        <rect x="32" y="14" width="4" height="3" fill="#fff"/>
        <rect x="26" y="14" width="2" height="3" fill="#2e8b2e"/>
        <rect x="34" y="14" width="2" height="3" fill="#2e8b2e"/>

        <!-- Œil fermé (visée) -->
        <rect x="24" y="15" width="4" height="1" fill="${colors.hairDark}"/>

        <!-- Bouche serrée -->
        <rect x="28" y="20" width="4" height="2" fill="#8b5a5a"/>

        <!-- Cou -->
        <rect x="26" y="24" width="8" height="4" fill="${colors.skin}"/>

        <!-- Tunique -->
        <rect x="16" y="28" width="28" height="20" fill="${colors.armor}"/>
        <rect x="18" y="30" width="24" height="16" fill="${colors.armorLight}"/>

        <!-- Ceinture -->
        <rect x="18" y="46" width="24" height="3" fill="${colors.accentDark}"/>

        <!-- Bras gauche tendu (tire la corde) -->
        <rect x="44" y="30" width="16" height="6" fill="${colors.armor}"/>
        <rect x="46" y="32" width="12" height="2" fill="${colors.armorLight}"/>
        <!-- Main tirant la corde -->
        <rect x="58" y="30" width="6" height="6" fill="${colors.skin}"/>

        <!-- Bras droit (tient l'arc) -->
        <rect x="4" y="28" width="14" height="8" fill="${colors.armor}"/>
        <rect x="6" y="30" width="10" height="4" fill="${colors.armorLight}"/>
        <!-- Main tenant l'arc -->
        <rect x="2" y="32" width="6" height="6" fill="${colors.skin}"/>

        <!-- Arc bandé -->
        <path d="M 0 16 Q 8 36 0 56" stroke="${colors.weapon}" stroke-width="4" fill="none"/>
        <!-- Corde -->
        <line x1="0" y1="16" x2="58" y2="33" stroke="#DEB887" stroke-width="2"/>
        <line x1="0" y1="56" x2="58" y2="33" stroke="#DEB887" stroke-width="2"/>

        <!-- Flèche -->
        <line x1="6" y1="36" x2="50" y2="36" stroke="#8B4513" stroke-width="3"/>
        <polygon points="50,33 58,36 50,39" fill="${colors.weaponDark}"/>
        <rect x="2" y="34" width="6" height="4" fill="${colors.accent}"/>

        <!-- Jambes -->
        <rect x="18" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="16" y="58" width="12" height="6" fill="${colors.armorDark}"/>

        <rect x="32" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="32" y="58" width="12" height="6" fill="${colors.armorDark}"/>
      `,
      mounted: `
        <!-- ARCHER 64x64 - MOUNTED -->
        <!-- Capuche -->
        <rect x="22" y="0" width="20" height="6" fill="${colors.armor}"/>
        <rect x="24" y="2" width="16" height="2" fill="${colors.armorLight}"/>

        <!-- Tête -->
        <rect x="24" y="4" width="16" height="12" fill="${colors.skin}"/>
        <rect x="26" y="6" width="12" height="8" fill="${colors.skinLight}"/>
        <!-- Yeux -->
        <rect x="28" y="8" width="3" height="3" fill="#fff"/>
        <rect x="34" y="8" width="3" height="3" fill="#fff"/>
        <rect x="29" y="9" width="2" height="2" fill="#2e8b2e"/>
        <rect x="35" y="9" width="2" height="2" fill="#2e8b2e"/>

        <!-- Corps -->
        <rect x="22" y="16" width="20" height="14" fill="${colors.armor}"/>
        <rect x="24" y="18" width="16" height="10" fill="${colors.armorLight}"/>

        <!-- Bras avec arc -->
        <rect x="42" y="16" width="6" height="10" fill="${colors.armor}"/>
        <!-- Arc -->
        <path d="M 50 10 Q 56 24 50 38" stroke="${colors.weapon}" stroke-width="3" fill="none"/>
        <line x1="50" y1="10" x2="50" y2="38" stroke="#DEB887" stroke-width="2"/>

        <!-- Carquois -->
        <rect x="16" y="18" width="4" height="12" fill="${colors.weaponDark}"/>

        <!-- CHEVAL -->
        <rect x="8" y="32" width="48" height="20" fill="#8B4513"/>
        <rect x="12" y="34" width="40" height="16" fill="#a0522d"/>

        <!-- Tête cheval -->
        <rect x="0" y="24" width="14" height="16" fill="#8B4513"/>
        <rect x="2" y="26" width="10" height="12" fill="#a0522d"/>
        <rect x="4" y="30" width="4" height="3" fill="#fff"/>
        <rect x="5" y="31" width="2" height="2" fill="#000"/>

        <!-- Crinière -->
        <rect x="12" y="22" width="4" height="12" fill="#2d1f17"/>

        <!-- Selle -->
        <rect x="20" y="30" width="24" height="6" fill="${colors.accent}"/>

        <!-- Jambes cheval -->
        <rect x="10" y="52" width="6" height="12" fill="#8B4513"/>
        <rect x="20" y="52" width="6" height="12" fill="#8B4513"/>
        <rect x="38" y="52" width="6" height="12" fill="#8B4513"/>
        <rect x="48" y="52" width="6" height="12" fill="#8B4513"/>

        <!-- Queue -->
        <rect x="54" y="36" width="4" height="16" fill="#2d1f17"/>
      `
    },
    mage: {
      idle: `
        <!-- MAGE 64x64 - IDLE -->
        <!-- Chapeau pointu -->
        <polygon points="32,0 18,16 46,16" fill="${colors.accent}"/>
        <rect x="16" y="14" width="32" height="4" fill="${colors.accentLight}"/>
        <rect x="20" y="16" width="24" height="2" fill="${colors.accentDark}"/>
        <rect x="30" y="2" width="4" height="4" fill="${colors.weapon}"/>

        <!-- Cheveux blancs/gris -->
        <rect x="20" y="16" width="8" height="8" fill="${colors.hair}"/>
        <rect x="36" y="16" width="8" height="8" fill="${colors.hair}"/>

        <!-- Tête -->
        <rect x="22" y="16" width="20" height="16" fill="${colors.skin}"/>
        <rect x="24" y="18" width="16" height="12" fill="${colors.skinLight}"/>

        <!-- Yeux mystiques -->
        <rect x="26" y="22" width="4" height="4" fill="#fff"/>
        <rect x="34" y="22" width="4" height="4" fill="#fff"/>
        <rect x="28" y="23" width="2" height="3" fill="${colors.weapon}"/>
        <rect x="36" y="23" width="2" height="3" fill="${colors.weapon}"/>

        <!-- Barbe -->
        <rect x="28" y="28" width="8" height="6" fill="${colors.hair}"/>
        <rect x="26" y="32" width="12" height="4" fill="${colors.hairLight}"/>
        <rect x="30" y="36" width="4" height="4" fill="${colors.hair}"/>

        <!-- Robe longue -->
        <rect x="16" y="34" width="32" height="26" fill="${colors.armor}"/>
        <rect x="18" y="36" width="28" height="22" fill="${colors.armorLight}"/>
        <rect x="16" y="34" width="4" height="26" fill="${colors.armorDark}"/>
        <rect x="44" y="34" width="4" height="26" fill="${colors.armorDark}"/>

        <!-- Détails robe -->
        <rect x="28" y="38" width="8" height="12" fill="${colors.accent}"/>
        <rect x="30" y="40" width="4" height="8" fill="${colors.accentLight}"/>
        <rect x="20" y="50" width="24" height="3" fill="${colors.accentDark}"/>

        <!-- Bras gauche -->
        <rect x="8" y="36" width="8" height="14" fill="${colors.armor}"/>
        <rect x="10" y="38" width="4" height="10" fill="${colors.armorLight}"/>
        <!-- Main -->
        <rect x="8" y="50" width="6" height="6" fill="${colors.skin}"/>

        <!-- Bras droit avec bâton -->
        <rect x="48" y="36" width="8" height="14" fill="${colors.armor}"/>
        <rect x="50" y="38" width="4" height="10" fill="${colors.armorLight}"/>
        <!-- Main -->
        <rect x="52" y="50" width="6" height="6" fill="${colors.skin}"/>

        <!-- Bâton magique -->
        <rect x="58" y="8" width="4" height="52" fill="#8B4513"/>
        <rect x="59" y="10" width="2" height="48" fill="#a0522d"/>
        <!-- Orbe magique -->
        <circle cx="60" cy="8" r="6" fill="${colors.weapon}"/>
        <circle cx="58" cy="6" r="2" fill="${colors.weaponLight}"/>

        <!-- Bas de robe -->
        <rect x="14" y="58" width="36" height="6" fill="${colors.armor}"/>
        <rect x="16" y="60" width="32" height="4" fill="${colors.armorDark}"/>
      `,
      cast: `
        <!-- MAGE 64x64 - CAST -->
        <!-- Chapeau -->
        <polygon points="32,0 18,16 46,16" fill="${colors.accent}"/>
        <rect x="16" y="14" width="32" height="4" fill="${colors.accentLight}"/>

        <!-- Tête -->
        <rect x="22" y="16" width="20" height="16" fill="${colors.skin}"/>
        <rect x="24" y="18" width="16" height="12" fill="${colors.skinLight}"/>

        <!-- Yeux brillants (magie) -->
        <rect x="26" y="22" width="4" height="4" fill="${colors.weapon}"/>
        <rect x="34" y="22" width="4" height="4" fill="${colors.weapon}"/>

        <!-- Barbe -->
        <rect x="28" y="28" width="8" height="6" fill="${colors.hair}"/>
        <rect x="26" y="32" width="12" height="4" fill="${colors.hairLight}"/>

        <!-- Robe -->
        <rect x="16" y="34" width="32" height="26" fill="${colors.armor}"/>
        <rect x="18" y="36" width="28" height="22" fill="${colors.armorLight}"/>
        <rect x="28" y="38" width="8" height="12" fill="${colors.accent}"/>

        <!-- Bras levés pour le sort -->
        <rect x="4" y="20" width="14" height="8" fill="${colors.armor}"/>
        <rect x="6" y="22" width="10" height="4" fill="${colors.armorLight}"/>
        <rect x="2" y="16" width="6" height="6" fill="${colors.skin}"/>

        <rect x="46" y="20" width="14" height="8" fill="${colors.armor}"/>
        <rect x="48" y="22" width="10" height="4" fill="${colors.armorLight}"/>
        <rect x="56" y="16" width="6" height="6" fill="${colors.skin}"/>

        <!-- Énergie magique -->
        <circle cx="32" cy="10" r="8" fill="${colors.weapon}" opacity="0.7"/>
        <circle cx="32" cy="10" r="5" fill="${colors.weaponLight}" opacity="0.8"/>
        <circle cx="4" cy="14" r="5" fill="${colors.weapon}" opacity="0.5"/>
        <circle cx="60" cy="14" r="5" fill="${colors.weapon}" opacity="0.5"/>
        <circle cx="32" cy="10" r="3" fill="#fff" opacity="0.9"/>

        <!-- Particules magiques -->
        <rect x="20" y="6" width="2" height="2" fill="${colors.weaponLight}"/>
        <rect x="42" y="8" width="2" height="2" fill="${colors.weaponLight}"/>
        <rect x="28" y="2" width="2" height="2" fill="${colors.weaponLight}"/>
        <rect x="36" y="4" width="2" height="2" fill="${colors.weaponLight}"/>

        <!-- Bas de robe -->
        <rect x="14" y="58" width="36" height="6" fill="${colors.armor}"/>
      `,
      mounted: `
        <!-- MAGE 64x64 - MOUNTED -->
        <!-- Chapeau -->
        <polygon points="32,0 22,12 42,12" fill="${colors.accent}"/>
        <rect x="20" y="10" width="24" height="4" fill="${colors.accentLight}"/>

        <!-- Tête -->
        <rect x="24" y="10" width="16" height="12" fill="${colors.skin}"/>
        <rect x="26" y="12" width="12" height="8" fill="${colors.skinLight}"/>
        <!-- Yeux -->
        <rect x="28" y="14" width="3" height="3" fill="${colors.weapon}"/>
        <rect x="34" y="14" width="3" height="3" fill="${colors.weapon}"/>
        <!-- Barbe courte -->
        <rect x="28" y="20" width="8" height="4" fill="${colors.hair}"/>

        <!-- Corps -->
        <rect x="22" y="22" width="20" height="12" fill="${colors.armor}"/>
        <rect x="24" y="24" width="16" height="8" fill="${colors.armorLight}"/>

        <!-- Bâton -->
        <rect x="44" y="8" width="3" height="26" fill="#8B4513"/>
        <circle cx="46" cy="8" r="5" fill="${colors.weapon}"/>
        <circle cx="44" cy="6" r="2" fill="${colors.weaponLight}"/>

        <!-- CHEVAL MAGIQUE -->
        <rect x="8" y="34" width="48" height="20" fill="#4B0082"/>
        <rect x="12" y="36" width="40" height="16" fill="#663399"/>

        <!-- Tête cheval -->
        <rect x="0" y="26" width="14" height="16" fill="#4B0082"/>
        <rect x="2" y="28" width="10" height="12" fill="#663399"/>
        <!-- Œil magique -->
        <rect x="4" y="32" width="4" height="3" fill="${colors.weapon}"/>

        <!-- Crinière magique -->
        <rect x="12" y="24" width="4" height="12" fill="${colors.accent}"/>

        <!-- Selle -->
        <rect x="20" y="32" width="24" height="6" fill="${colors.accent}"/>

        <!-- Jambes cheval -->
        <rect x="10" y="54" width="6" height="10" fill="#4B0082"/>
        <rect x="20" y="54" width="6" height="10" fill="#4B0082"/>
        <rect x="38" y="54" width="6" height="10" fill="#4B0082"/>
        <rect x="48" y="54" width="6" height="10" fill="#4B0082"/>

        <!-- Queue magique -->
        <rect x="54" y="38" width="4" height="16" fill="${colors.accent}"/>
      `
    },
    knight: {
      idle: `
        <!-- CHEVALIER 64x64 - IDLE -->
        <!-- Casque complet -->
        <rect x="20" y="4" width="24" height="20" fill="${colors.armor}"/>
        <rect x="22" y="6" width="20" height="16" fill="${colors.armorLight}"/>
        <rect x="20" y="4" width="4" height="20" fill="${colors.armorDark}"/>
        <rect x="40" y="4" width="4" height="20" fill="${colors.armorDark}"/>
        <!-- Visière -->
        <rect x="24" y="12" width="16" height="6" fill="#1a1a1a"/>
        <rect x="26" y="14" width="4" height="2" fill="${colors.armorDark}"/>
        <rect x="34" y="14" width="4" height="2" fill="${colors.armorDark}"/>
        <!-- Plume -->
        <rect x="30" y="0" width="4" height="8" fill="#DC143C"/>
        <rect x="32" y="-2" width="2" height="4" fill="#ff3050"/>
        <!-- Cimier -->
        <rect x="28" y="2" width="8" height="4" fill="${colors.accent}"/>

        <!-- Cou armure -->
        <rect x="26" y="24" width="12" height="4" fill="${colors.armor}"/>

        <!-- Armure corps -->
        <rect x="16" y="28" width="32" height="22" fill="${colors.armor}"/>
        <rect x="18" y="30" width="28" height="18" fill="${colors.armorLight}"/>
        <rect x="16" y="28" width="4" height="22" fill="${colors.armorDark}"/>
        <rect x="44" y="28" width="4" height="22" fill="${colors.armorDark}"/>

        <!-- Détails armure (croix) -->
        <rect x="28" y="32" width="8" height="14" fill="${colors.accent}"/>
        <rect x="24" y="36" width="16" height="6" fill="${colors.accent}"/>
        <rect x="30" y="34" width="4" height="10" fill="${colors.accentLight}"/>
        <rect x="26" y="38" width="12" height="2" fill="${colors.accentLight}"/>

        <!-- Ceinture -->
        <rect x="18" y="48" width="28" height="3" fill="${colors.accentDark}"/>
        <rect x="30" y="47" width="4" height="4" fill="${colors.accent}"/>

        <!-- Bras gauche -->
        <rect x="8" y="28" width="8" height="18" fill="${colors.armor}"/>
        <rect x="10" y="30" width="4" height="14" fill="${colors.armorLight}"/>
        <!-- Gantelet -->
        <rect x="6" y="46" width="10" height="8" fill="${colors.armor}"/>
        <rect x="4" y="52" width="6" height="4" fill="${colors.armorDark}"/>

        <!-- Bras droit -->
        <rect x="48" y="28" width="8" height="18" fill="${colors.armor}"/>
        <rect x="50" y="30" width="4" height="14" fill="${colors.armorLight}"/>
        <!-- Gantelet -->
        <rect x="48" y="46" width="10" height="8" fill="${colors.armor}"/>
        <rect x="54" y="52" width="6" height="4" fill="${colors.armorDark}"/>

        <!-- Épée -->
        <rect x="58" y="16" width="4" height="36" fill="${colors.weapon}"/>
        <rect x="59" y="18" width="2" height="32" fill="${colors.weaponLight}"/>
        <rect x="56" y="50" width="8" height="4" fill="${colors.weaponDark}"/>
        <rect x="57" y="54" width="6" height="8" fill="${colors.accentDark}"/>
        <rect x="60" y="14" width="4" height="4" fill="${colors.weaponLight}"/>

        <!-- Bouclier -->
        <rect x="0" y="32" width="10" height="18" fill="${colors.accent}"/>
        <rect x="2" y="34" width="6" height="14" fill="${colors.accentLight}"/>
        <rect x="3" y="36" width="4" height="10" fill="${colors.armor}"/>
        <rect x="4" y="38" width="2" height="6" fill="${colors.armorLight}"/>

        <!-- Jambières -->
        <rect x="18" y="50" width="12" height="12" fill="${colors.armor}"/>
        <rect x="20" y="52" width="8" height="8" fill="${colors.armorLight}"/>
        <rect x="34" y="50" width="12" height="12" fill="${colors.armor}"/>
        <rect x="36" y="52" width="8" height="8" fill="${colors.armorLight}"/>

        <!-- Sabaton -->
        <rect x="16" y="60" width="14" height="4" fill="${colors.armorDark}"/>
        <rect x="34" y="60" width="14" height="4" fill="${colors.armorDark}"/>
      `,
      attack: `
        <!-- CHEVALIER 64x64 - ATTACK -->
        <!-- Casque -->
        <rect x="18" y="4" width="24" height="18" fill="${colors.armor}"/>
        <rect x="20" y="6" width="20" height="14" fill="${colors.armorLight}"/>
        <rect x="22" y="12" width="16" height="4" fill="#1a1a1a"/>
        <rect x="28" y="0" width="4" height="6" fill="#DC143C"/>
        <rect x="26" y="2" width="8" height="4" fill="${colors.accent}"/>

        <!-- Corps -->
        <rect x="14" y="24" width="32" height="24" fill="${colors.armor}"/>
        <rect x="16" y="26" width="28" height="20" fill="${colors.armorLight}"/>
        <rect x="26" y="28" width="8" height="14" fill="${colors.accent}"/>

        <!-- Bras gauche (bouclier haut) -->
        <rect x="2" y="16" width="14" height="10" fill="${colors.armor}"/>
        <!-- Bouclier levé -->
        <rect x="0" y="8" width="12" height="20" fill="${colors.accent}"/>
        <rect x="2" y="10" width="8" height="16" fill="${colors.accentLight}"/>

        <!-- Bras droit (épée haute) -->
        <rect x="44" y="10" width="10" height="18" fill="${colors.armor}"/>
        <rect x="50" y="6" width="6" height="8" fill="${colors.armorDark}"/>

        <!-- Épée levée -->
        <rect x="54" y="0" width="4" height="30" fill="${colors.weapon}"/>
        <rect x="55" y="2" width="2" height="26" fill="${colors.weaponLight}"/>
        <rect x="52" y="28" width="8" height="4" fill="${colors.weaponDark}"/>
        <rect x="56" y="0" width="6" height="6" fill="${colors.weaponLight}"/>

        <!-- Jambières -->
        <rect x="16" y="48" width="12" height="14" fill="${colors.armor}"/>
        <rect x="32" y="48" width="12" height="14" fill="${colors.armor}"/>
        <rect x="14" y="60" width="14" height="4" fill="${colors.armorDark}"/>
        <rect x="32" y="60" width="14" height="4" fill="${colors.armorDark}"/>
      `,
      mounted: `
        <!-- CHEVALIER 64x64 - MOUNTED -->
        <!-- Casque -->
        <rect x="22" y="0" width="20" height="14" fill="${colors.armor}"/>
        <rect x="24" y="2" width="16" height="10" fill="${colors.armorLight}"/>
        <rect x="26" y="6" width="12" height="4" fill="#1a1a1a"/>
        <rect x="30" y="-2" width="4" height="4" fill="#DC143C"/>

        <!-- Corps -->
        <rect x="20" y="14" width="24" height="16" fill="${colors.armor}"/>
        <rect x="22" y="16" width="20" height="12" fill="${colors.armorLight}"/>
        <rect x="28" y="18" width="8" height="8" fill="${colors.accent}"/>

        <!-- Épée -->
        <rect x="46" y="8" width="3" height="22" fill="${colors.weapon}"/>
        <rect x="44" y="6" width="8" height="4" fill="${colors.weaponDark}"/>

        <!-- CHEVAL EN ARMURE -->
        <rect x="6" y="32" width="52" height="22" fill="${colors.accent}"/>
        <rect x="10" y="34" width="44" height="18" fill="${colors.accentLight}"/>

        <!-- Tête cheval -->
        <rect x="0" y="24" width="14" height="18" fill="${colors.armor}"/>
        <rect x="2" y="26" width="10" height="14" fill="${colors.armorLight}"/>
        <rect x="4" y="30" width="4" height="4" fill="#1a1a1a"/>

        <!-- Selle -->
        <rect x="18" y="30" width="28" height="6" fill="${colors.armorDark}"/>

        <!-- Jambes cheval (avec armure) -->
        <rect x="8" y="54" width="8" height="10" fill="${colors.accent}"/>
        <rect x="20" y="54" width="8" height="10" fill="${colors.accent}"/>
        <rect x="36" y="54" width="8" height="10" fill="${colors.accent}"/>
        <rect x="48" y="54" width="8" height="10" fill="${colors.accent}"/>

        <!-- Caparaçon -->
        <rect x="54" y="36" width="6" height="18" fill="${colors.accent}"/>
      `
    },
    rogue: {
      idle: `
        <!-- VOLEUR 64x64 - IDLE -->
        <!-- Capuche -->
        <rect x="18" y="2" width="28" height="14" fill="${colors.armor}"/>
        <rect x="20" y="4" width="24" height="10" fill="${colors.armorDark}"/>
        <rect x="16" y="8" width="4" height="14" fill="${colors.armor}"/>
        <rect x="44" y="8" width="4" height="14" fill="${colors.armor}"/>

        <!-- Visage dans l'ombre -->
        <rect x="22" y="10" width="20" height="14" fill="${colors.skin}"/>
        <rect x="24" y="12" width="16" height="10" fill="${colors.skinDark}"/>

        <!-- Yeux perçants -->
        <rect x="26" y="14" width="4" height="3" fill="#fff"/>
        <rect x="34" y="14" width="4" height="3" fill="#fff"/>
        <rect x="28" y="14" width="2" height="3" fill="#2d2d2d"/>
        <rect x="36" y="14" width="2" height="3" fill="#2d2d2d"/>

        <!-- Masque/foulard -->
        <rect x="24" y="18" width="16" height="6" fill="${colors.armorDark}"/>

        <!-- Cou -->
        <rect x="28" y="24" width="8" height="4" fill="${colors.skin}"/>

        <!-- Tunique -->
        <rect x="18" y="28" width="28" height="20" fill="${colors.armor}"/>
        <rect x="20" y="30" width="24" height="16" fill="${colors.armorLight}"/>
        <rect x="18" y="28" width="4" height="20" fill="${colors.armorDark}"/>
        <rect x="42" y="28" width="4" height="20" fill="${colors.armorDark}"/>

        <!-- Ceinture à dagues -->
        <rect x="20" y="46" width="24" height="3" fill="${colors.accentDark}"/>
        <rect x="24" y="44" width="4" height="6" fill="${colors.accent}"/>
        <rect x="36" y="44" width="4" height="6" fill="${colors.accent}"/>

        <!-- Bras gauche -->
        <rect x="10" y="30" width="8" height="12" fill="${colors.armor}"/>
        <rect x="12" y="32" width="4" height="8" fill="${colors.armorLight}"/>
        <!-- Main avec dague -->
        <rect x="8" y="42" width="8" height="6" fill="${colors.skin}"/>
        <!-- Dague gauche -->
        <rect x="2" y="40" width="10" height="3" fill="${colors.weapon}"/>
        <polygon points="2,40 0,42 2,43" fill="${colors.weaponLight}"/>

        <!-- Bras droit -->
        <rect x="46" y="30" width="8" height="12" fill="${colors.armor}"/>
        <rect x="48" y="32" width="4" height="8" fill="${colors.armorLight}"/>
        <!-- Main avec dague -->
        <rect x="48" y="42" width="8" height="6" fill="${colors.skin}"/>
        <!-- Dague droite -->
        <rect x="52" y="40" width="10" height="3" fill="${colors.weapon}"/>
        <polygon points="62,40 64,42 62,43" fill="${colors.weaponLight}"/>

        <!-- Jambes -->
        <rect x="20" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="22" y="50" width="6" height="8" fill="${colors.armorLight}"/>
        <rect x="34" y="48" width="10" height="12" fill="${colors.armor}"/>
        <rect x="36" y="50" width="6" height="8" fill="${colors.armorLight}"/>

        <!-- Bottes souples -->
        <rect x="18" y="58" width="12" height="6" fill="${colors.armorDark}"/>
        <rect x="34" y="58" width="12" height="6" fill="${colors.armorDark}"/>
      `,
      attack: `
        <!-- VOLEUR 64x64 - ATTACK -->
        <!-- Capuche -->
        <rect x="16" y="4" width="28" height="12" fill="${colors.armor}"/>
        <rect x="18" y="6" width="24" height="8" fill="${colors.armorDark}"/>

        <!-- Visage -->
        <rect x="20" y="10" width="20" height="14" fill="${colors.skin}"/>
        <rect x="22" y="12" width="16" height="10" fill="${colors.skinDark}"/>

        <!-- Yeux -->
        <rect x="24" y="14" width="4" height="3" fill="#fff"/>
        <rect x="32" y="14" width="4" height="3" fill="#fff"/>
        <rect x="26" y="14" width="2" height="3" fill="#2d2d2d"/>
        <rect x="34" y="14" width="2" height="3" fill="#2d2d2d"/>

        <!-- Masque -->
        <rect x="22" y="18" width="16" height="6" fill="${colors.armorDark}"/>

        <!-- Corps en mouvement -->
        <rect x="14" y="26" width="32" height="22" fill="${colors.armor}"/>
        <rect x="16" y="28" width="28" height="18" fill="${colors.armorLight}"/>

        <!-- Bras gauche (attaque) -->
        <rect x="0" y="22" width="16" height="8" fill="${colors.armor}"/>
        <rect x="2" y="24" width="12" height="4" fill="${colors.armorLight}"/>
        <!-- Dague -->
        <rect x="-4" y="24" width="12" height="3" fill="${colors.weapon}"/>
        <polygon points="-4,24 -8,26 -4,27" fill="${colors.weaponLight}"/>

        <!-- Bras droit (attaque) -->
        <rect x="48" y="22" width="16" height="8" fill="${colors.armor}"/>
        <rect x="50" y="24" width="12" height="4" fill="${colors.armorLight}"/>
        <!-- Dague -->
        <rect x="56" y="24" width="12" height="3" fill="${colors.weapon}"/>
        <polygon points="68,24 72,26 68,27" fill="${colors.weaponLight}"/>

        <!-- Jambes écartées -->
        <rect x="14" y="48" width="12" height="14" fill="${colors.armor}"/>
        <rect x="34" y="48" width="12" height="14" fill="${colors.armor}"/>
        <rect x="12" y="60" width="14" height="4" fill="${colors.armorDark}"/>
        <rect x="34" y="60" width="14" height="4" fill="${colors.armorDark}"/>
      `,
      stealth: `
        <!-- VOLEUR 64x64 - STEALTH -->
        <!-- Personnage semi-transparent (furtif) -->
        <g opacity="0.6">
          <!-- Capuche -->
          <rect x="18" y="6" width="28" height="12" fill="${colors.armor}"/>
          <!-- Visage -->
          <rect x="22" y="12" width="20" height="12" fill="${colors.skin}"/>
          <!-- Yeux brillants -->
          <rect x="28" y="16" width="3" height="3" fill="#fff"/>
          <rect x="34" y="16" width="3" height="3" fill="#fff"/>
          <!-- Corps accroupi -->
          <rect x="16" y="24" width="32" height="18" fill="${colors.armor}"/>
          <rect x="18" y="26" width="28" height="14" fill="${colors.armorLight}"/>
          <!-- Bras -->
          <rect x="8" y="28" width="10" height="10" fill="${colors.armor}"/>
          <rect x="46" y="28" width="10" height="10" fill="${colors.armor}"/>
          <!-- Jambes pliées -->
          <rect x="16" y="42" width="14" height="16" fill="${colors.armor}"/>
          <rect x="34" y="42" width="14" height="16" fill="${colors.armor}"/>
        </g>
        <!-- Ombre -->
        <ellipse cx="32" cy="62" rx="20" ry="4" fill="#000" opacity="0.4"/>
        <!-- Particules d'ombre -->
        <rect x="10" y="20" width="3" height="3" fill="#000" opacity="0.3"/>
        <rect x="50" y="24" width="3" height="3" fill="#000" opacity="0.3"/>
        <rect x="14" y="40" width="3" height="3" fill="#000" opacity="0.3"/>
        <rect x="46" y="44" width="3" height="3" fill="#000" opacity="0.3"/>
      `
    },
    paladin: {
      idle: `
        <!-- PALADIN 64x64 - IDLE -->
        <!-- Halo doré -->
        <ellipse cx="32" cy="4" rx="12" ry="4" fill="${colors.weapon}" opacity="0.6"/>

        <!-- Cheveux dorés -->
        <rect x="20" y="4" width="24" height="6" fill="${colors.hair}"/>
        <rect x="18" y="8" width="4" height="8" fill="${colors.hair}"/>
        <rect x="42" y="8" width="4" height="8" fill="${colors.hair}"/>

        <!-- Tête -->
        <rect x="22" y="8" width="20" height="16" fill="${colors.skin}"/>
        <rect x="24" y="10" width="16" height="12" fill="${colors.skinLight}"/>

        <!-- Yeux brillants (bleus) -->
        <rect x="26" y="14" width="4" height="4" fill="#4169E1"/>
        <rect x="34" y="14" width="4" height="4" fill="#4169E1"/>
        <rect x="27" y="15" width="2" height="2" fill="#87CEEB"/>
        <rect x="35" y="15" width="2" height="2" fill="#87CEEB"/>

        <!-- Nez et bouche -->
        <rect x="31" y="17" width="2" height="3" fill="${colors.skinDark}"/>
        <rect x="29" y="21" width="6" height="1" fill="#c49a6c"/>

        <!-- Cou -->
        <rect x="28" y="24" width="8" height="4" fill="${colors.skin}"/>

        <!-- Armure dorée -->
        <rect x="16" y="28" width="32" height="22" fill="${colors.armor}"/>
        <rect x="18" y="30" width="28" height="18" fill="${colors.armorLight}"/>
        <rect x="16" y="28" width="4" height="22" fill="${colors.armorDark}"/>
        <rect x="44" y="28" width="4" height="22" fill="${colors.armorDark}"/>

        <!-- Symbole sacré (croix) -->
        <rect x="28" y="32" width="8" height="14" fill="${colors.accent}"/>
        <rect x="24" y="36" width="16" height="6" fill="${colors.accent}"/>
        <rect x="30" y="34" width="4" height="10" fill="#fff"/>
        <rect x="26" y="38" width="12" height="2" fill="#fff"/>

        <!-- Ceinture -->
        <rect x="18" y="48" width="28" height="3" fill="${colors.accentDark}"/>

        <!-- Bras gauche -->
        <rect x="8" y="28" width="8" height="16" fill="${colors.armor}"/>
        <rect x="10" y="30" width="4" height="12" fill="${colors.armorLight}"/>
        <rect x="6" y="44" width="10" height="8" fill="${colors.armorDark}"/>
        <rect x="4" y="50" width="6" height="4" fill="${colors.skin}"/>

        <!-- Bras droit -->
        <rect x="48" y="28" width="8" height="16" fill="${colors.armor}"/>
        <rect x="50" y="30" width="4" height="12" fill="${colors.armorLight}"/>
        <rect x="48" y="44" width="10" height="8" fill="${colors.armorDark}"/>
        <rect x="54" y="50" width="6" height="4" fill="${colors.skin}"/>

        <!-- Épée sacrée -->
        <rect x="58" y="14" width="4" height="38" fill="${colors.weapon}"/>
        <rect x="59" y="16" width="2" height="34" fill="#fff"/>
        <rect x="56" y="50" width="8" height="4" fill="${colors.armorDark}"/>
        <rect x="57" y="54" width="6" height="8" fill="${colors.accent}"/>
        <!-- Lame brillante -->
        <rect x="60" y="12" width="4" height="6" fill="#fff"/>

        <!-- Jambières -->
        <rect x="18" y="50" width="12" height="12" fill="${colors.armor}"/>
        <rect x="20" y="52" width="8" height="8" fill="${colors.armorLight}"/>
        <rect x="34" y="50" width="12" height="12" fill="${colors.armor}"/>
        <rect x="36" y="52" width="8" height="8" fill="${colors.armorLight}"/>

        <!-- Sabaton -->
        <rect x="16" y="60" width="14" height="4" fill="${colors.armorDark}"/>
        <rect x="34" y="60" width="14" height="4" fill="${colors.armorDark}"/>
      `,
      attack: `
        <!-- PALADIN 64x64 - ATTACK -->
        <!-- Halo brillant -->
        <ellipse cx="32" cy="2" rx="14" ry="5" fill="${colors.weapon}" opacity="0.8"/>
        <ellipse cx="32" cy="2" rx="10" ry="3" fill="#fff" opacity="0.6"/>

        <!-- Tête -->
        <rect x="20" y="6" width="20" height="14" fill="${colors.skin}"/>
        <rect x="22" y="8" width="16" height="10" fill="${colors.skinLight}"/>
        <!-- Cheveux -->
        <rect x="18" y="4" width="24" height="4" fill="${colors.hair}"/>

        <!-- Yeux brillants -->
        <rect x="24" y="10" width="4" height="4" fill="${colors.weapon}"/>
        <rect x="32" y="10" width="4" height="4" fill="${colors.weapon}"/>

        <!-- Corps -->
        <rect x="14" y="22" width="32" height="26" fill="${colors.armor}"/>
        <rect x="16" y="24" width="28" height="22" fill="${colors.armorLight}"/>
        <rect x="26" y="26" width="8" height="12" fill="${colors.accent}"/>

        <!-- Bras gauche -->
        <rect x="4" y="20" width="12" height="10" fill="${colors.armor}"/>
        <rect x="2" y="18" width="8" height="8" fill="${colors.skin}"/>

        <!-- Bras droit (épée haute) -->
        <rect x="44" y="8" width="10" height="20" fill="${colors.armor}"/>
        <rect x="50" y="4" width="8" height="8" fill="${colors.skin}"/>

        <!-- Épée sacrée (levée avec lumière) -->
        <rect x="54" y="0" width="4" height="32" fill="${colors.weapon}"/>
        <rect x="55" y="2" width="2" height="28" fill="#fff"/>
        <!-- Lumière divine -->
        <circle cx="56" cy="0" r="6" fill="${colors.weapon}" opacity="0.7"/>
        <circle cx="56" cy="0" r="4" fill="#fff" opacity="0.8"/>

        <!-- Aura sacrée -->
        <circle cx="56" cy="16" r="10" fill="${colors.weapon}" opacity="0.3"/>

        <!-- Jambières -->
        <rect x="16" y="48" width="12" height="14" fill="${colors.armor}"/>
        <rect x="32" y="48" width="12" height="14" fill="${colors.armor}"/>
        <rect x="14" y="60" width="14" height="4" fill="${colors.armorDark}"/>
        <rect x="32" y="60" width="14" height="4" fill="${colors.armorDark}"/>
      `,
      mounted: `
        <!-- PALADIN 64x64 - MOUNTED -->
        <!-- Halo -->
        <ellipse cx="32" cy="2" rx="10" ry="3" fill="${colors.weapon}" opacity="0.6"/>

        <!-- Tête -->
        <rect x="24" y="4" width="16" height="12" fill="${colors.skin}"/>
        <rect x="26" y="6" width="12" height="8" fill="${colors.skinLight}"/>
        <!-- Cheveux -->
        <rect x="22" y="2" width="20" height="4" fill="${colors.hair}"/>
        <!-- Yeux -->
        <rect x="28" y="8" width="3" height="3" fill="#4169E1"/>
        <rect x="34" y="8" width="3" height="3" fill="#4169E1"/>

        <!-- Corps -->
        <rect x="22" y="16" width="20" height="14" fill="${colors.armor}"/>
        <rect x="24" y="18" width="16" height="10" fill="${colors.armorLight}"/>
        <rect x="28" y="20" width="8" height="6" fill="${colors.accent}"/>

        <!-- Épée sacrée -->
        <rect x="44" y="6" width="3" height="24" fill="${colors.weapon}"/>
        <rect x="45" y="8" width="1" height="20" fill="#fff"/>
        <circle cx="46" cy="6" r="4" fill="${colors.weapon}" opacity="0.6"/>

        <!-- DESTRIER SACRÉ (blanc) -->
        <rect x="6" y="32" width="52" height="22" fill="#fff"/>
        <rect x="10" y="34" width="44" height="18" fill="#f5f5f5"/>

        <!-- Tête cheval -->
        <rect x="0" y="24" width="14" height="18" fill="#fff"/>
        <rect x="2" y="26" width="10" height="14" fill="#f5f5f5"/>
        <!-- Œil sacré -->
        <rect x="4" y="30" width="4" height="3" fill="#4169E1"/>

        <!-- Crinière dorée -->
        <rect x="12" y="22" width="4" height="14" fill="${colors.hair}"/>

        <!-- Caparaçon doré -->
        <rect x="18" y="30" width="28" height="8" fill="${colors.accent}"/>
        <rect x="20" y="32" width="24" height="4" fill="${colors.accentLight}"/>

        <!-- Jambes cheval -->
        <rect x="8" y="54" width="8" height="10" fill="#fff"/>
        <rect x="20" y="54" width="8" height="10" fill="#fff"/>
        <rect x="36" y="54" width="8" height="10" fill="#fff"/>
        <rect x="48" y="54" width="8" height="10" fill="#fff"/>

        <!-- Queue dorée -->
        <rect x="54" y="36" width="6" height="18" fill="${colors.hair}"/>
      `
    },
    necromancer: {
      idle: `
        <!-- NECROMANCIEN 64x64 - IDLE -->
        <!-- Capuche sinistre -->
        <polygon points="32,0 14,20 50,20" fill="${colors.armor}"/>
        <polygon points="32,4 18,18 46,18" fill="${colors.armorDark}"/>
        <rect x="12" y="16" width="40" height="6" fill="${colors.armor}"/>

        <!-- Visage pâle -->
        <rect x="22" y="14" width="20" height="14" fill="${colors.skin}"/>
        <rect x="24" y="16" width="16" height="10" fill="${colors.skinLight}"/>

        <!-- Yeux verts brillants -->
        <rect x="26" y="18" width="4" height="4" fill="${colors.weapon}"/>
        <rect x="34" y="18" width="4" height="4" fill="${colors.weapon}"/>
        <rect x="27" y="19" width="2" height="2" fill="${colors.weaponLight}"/>
        <rect x="35" y="19" width="2" height="2" fill="${colors.weaponLight}"/>

        <!-- Nez et bouche sinistres -->
        <rect x="31" y="22" width="2" height="2" fill="${colors.skinDark}"/>
        <rect x="29" y="25" width="6" height="2" fill="#4a3060"/>

        <!-- Cou -->
        <rect x="28" y="28" width="8" height="4" fill="${colors.skin}"/>

        <!-- Robe longue -->
        <rect x="14" y="32" width="36" height="28" fill="${colors.armor}"/>
        <rect x="16" y="34" width="32" height="24" fill="${colors.armorLight}"/>
        <rect x="14" y="32" width="4" height="28" fill="${colors.armorDark}"/>
        <rect x="46" y="32" width="4" height="28" fill="${colors.armorDark}"/>

        <!-- Symbole nécromancie -->
        <rect x="28" y="38" width="8" height="8" fill="${colors.accent}"/>
        <rect x="26" y="40" width="12" height="4" fill="${colors.accent}"/>
        <circle cx="32" cy="42" r="3" fill="${colors.weapon}"/>

        <!-- Bras gauche -->
        <rect x="6" y="34" width="8" height="16" fill="${colors.armor}"/>
        <rect x="8" y="36" width="4" height="12" fill="${colors.armorLight}"/>
        <rect x="4" y="50" width="8" height="6" fill="${colors.skin}"/>

        <!-- Bras droit avec bâton -->
        <rect x="50" y="34" width="8" height="16" fill="${colors.armor}"/>
        <rect x="52" y="36" width="4" height="12" fill="${colors.armorLight}"/>
        <rect x="54" y="50" width="6" height="6" fill="${colors.skin}"/>

        <!-- Bâton maléfique -->
        <rect x="58" y="8" width="4" height="54" fill="#2F4F4F"/>
        <rect x="59" y="10" width="2" height="50" fill="#3d6666"/>
        <!-- Crâne au sommet -->
        <circle cx="60" cy="8" r="6" fill="#d3d3d3"/>
        <rect x="57" y="6" width="2" height="2" fill="${colors.weapon}"/>
        <rect x="61" y="6" width="2" height="2" fill="${colors.weapon}"/>
        <rect x="58" y="10" width="4" height="2" fill="#1a1a1a"/>

        <!-- Aura sombre -->
        <circle cx="32" cy="48" r="18" fill="${colors.weapon}" opacity="0.15"/>

        <!-- Bas de robe -->
        <rect x="12" y="58" width="40" height="6" fill="${colors.armor}"/>
        <rect x="14" y="60" width="36" height="4" fill="${colors.armorDark}"/>
      `,
      cast: `
        <!-- NECROMANCIEN 64x64 - CAST -->
        <!-- Capuche -->
        <polygon points="32,2 16,18 48,18" fill="${colors.armor}"/>
        <rect x="14" y="16" width="36" height="4" fill="${colors.armorDark}"/>

        <!-- Visage -->
        <rect x="22" y="14" width="20" height="12" fill="${colors.skin}"/>
        <!-- Yeux brillants intenses -->
        <rect x="26" y="16" width="4" height="4" fill="${colors.weapon}"/>
        <rect x="34" y="16" width="4" height="4" fill="${colors.weapon}"/>

        <!-- Robe -->
        <rect x="14" y="28" width="36" height="32" fill="${colors.armor}"/>
        <rect x="16" y="30" width="32" height="28" fill="${colors.armorLight}"/>

        <!-- Bras levés -->
        <rect x="2" y="18" width="14" height="10" fill="${colors.armor}"/>
        <rect x="0" y="14" width="8" height="8" fill="${colors.skin}"/>
        <rect x="48" y="18" width="14" height="10" fill="${colors.armor}"/>
        <rect x="56" y="14" width="8" height="8" fill="${colors.skin}"/>

        <!-- Énergie nécromantique -->
        <circle cx="4" cy="12" r="6" fill="${colors.weapon}" opacity="0.8"/>
        <circle cx="60" cy="12" r="6" fill="${colors.weapon}" opacity="0.8"/>
        <circle cx="32" cy="8" r="8" fill="${colors.weapon}" opacity="0.6"/>
        <circle cx="32" cy="8" r="5" fill="${colors.weaponLight}" opacity="0.7"/>

        <!-- Crânes flottants -->
        <circle cx="6" cy="12" r="4" fill="#d3d3d3"/>
        <rect x="4" y="10" width="1" height="2" fill="#000"/>
        <rect x="7" y="10" width="1" height="2" fill="#000"/>
        <circle cx="58" cy="12" r="4" fill="#d3d3d3"/>
        <rect x="56" y="10" width="1" height="2" fill="#000"/>
        <rect x="59" y="10" width="1" height="2" fill="#000"/>

        <!-- Bas de robe -->
        <rect x="12" y="58" width="40" height="6" fill="${colors.armor}"/>
      `,
      summon: `
        <!-- NECROMANCIEN 64x64 - SUMMON -->
        <!-- Capuche -->
        <polygon points="40,2 26,16 54,16" fill="${colors.armor}"/>
        <rect x="24" y="14" width="32" height="4" fill="${colors.armorDark}"/>

        <!-- Visage -->
        <rect x="30" y="12" width="16" height="10" fill="${colors.skin}"/>
        <!-- Yeux -->
        <rect x="32" y="14" width="3" height="3" fill="${colors.weapon}"/>
        <rect x="39" y="14" width="3" height="3" fill="${colors.weapon}"/>

        <!-- Corps -->
        <rect x="28" y="24" width="28" height="24" fill="${colors.armor}"/>
        <rect x="30" y="26" width="24" height="20" fill="${colors.armorLight}"/>

        <!-- Bras pointant -->
        <rect x="20" y="28" width="10" height="8" fill="${colors.armor}"/>
        <rect x="14" y="30" width="8" height="6" fill="${colors.skin}"/>

        <!-- SQUELETTE INVOQUÉ -->
        <!-- Crâne -->
        <rect x="2" y="24" width="10" height="10" fill="#d3d3d3"/>
        <rect x="4" y="26" width="2" height="3" fill="#000"/>
        <rect x="8" y="26" width="2" height="3" fill="#000"/>
        <rect x="4" y="32" width="6" height="2" fill="#1a1a1a"/>
        <!-- Corps squelette -->
        <rect x="4" y="34" width="6" height="12" fill="#a0a0a0"/>
        <rect x="5" y="36" width="4" height="8" fill="#c0c0c0"/>
        <!-- Bras squelette -->
        <rect x="0" y="36" width="4" height="8" fill="#a0a0a0"/>
        <rect x="10" y="36" width="4" height="8" fill="#a0a0a0"/>
        <!-- Jambes squelette -->
        <rect x="4" y="46" width="2" height="10" fill="#a0a0a0"/>
        <rect x="8" y="46" width="2" height="10" fill="#a0a0a0"/>

        <!-- Cercle d'invocation -->
        <ellipse cx="7" cy="58" rx="10" ry="4" fill="${colors.weapon}" opacity="0.5"/>
        <ellipse cx="7" cy="58" rx="7" ry="3" fill="${colors.weaponLight}" opacity="0.4"/>

        <!-- Bas de robe nécro -->
        <rect x="26" y="48" width="30" height="14" fill="${colors.armor}"/>
        <rect x="28" y="50" width="26" height="10" fill="${colors.armorDark}"/>
      `
    },
    berserker: {
      idle: `
        <!-- BERSERKER 64x64 - IDLE -->
        <!-- Cheveux sauvages -->
        <rect x="16" y="2" width="8" height="12" fill="${colors.hair}"/>
        <rect x="18" y="0" width="4" height="8" fill="${colors.hairLight}"/>
        <rect x="40" y="2" width="8" height="12" fill="${colors.hair}"/>
        <rect x="42" y="0" width="4" height="8" fill="${colors.hairLight}"/>
        <rect x="22" y="4" width="20" height="4" fill="${colors.hair}"/>

        <!-- Tête musclée -->
        <rect x="20" y="6" width="24" height="18" fill="${colors.skin}"/>
        <rect x="22" y="8" width="20" height="14" fill="${colors.skinLight}"/>

        <!-- Yeux féroces -->
        <rect x="24" y="12" width="5" height="4" fill="#fff"/>
        <rect x="35" y="12" width="5" height="4" fill="#fff"/>
        <rect x="26" y="13" width="3" height="3" fill="#8b0000"/>
        <rect x="37" y="13" width="3" height="3" fill="#8b0000"/>

        <!-- Sourcils épais -->
        <rect x="24" y="10" width="6" height="2" fill="${colors.hairDark}"/>
        <rect x="34" y="10" width="6" height="2" fill="${colors.hairDark}"/>

        <!-- Nez cassé et cicatrice -->
        <rect x="31" y="15" width="2" height="4" fill="${colors.skinDark}"/>
        <rect x="36" y="14" width="1" height="6" fill="#8b5a5a"/>

        <!-- Bouche -->
        <rect x="28" y="20" width="8" height="2" fill="#8b5a5a"/>

        <!-- Cou épais -->
        <rect x="26" y="24" width="12" height="6" fill="${colors.skin}"/>

        <!-- Torse nu musclé -->
        <rect x="16" y="30" width="32" height="20" fill="${colors.skin}"/>
        <rect x="18" y="32" width="28" height="16" fill="${colors.skinLight}"/>
        <!-- Muscles pectoraux -->
        <rect x="20" y="34" width="10" height="8" fill="${colors.skinDark}"/>
        <rect x="34" y="34" width="10" height="8" fill="${colors.skinDark}"/>
        <!-- Abdos -->
        <rect x="28" y="40" width="8" height="8" fill="${colors.skinDark}"/>
        <rect x="30" y="42" width="4" height="4" fill="${colors.skin}"/>

        <!-- Ceinture de guerre -->
        <rect x="18" y="48" width="28" height="4" fill="${colors.armor}"/>
        <rect x="30" y="47" width="4" height="5" fill="${colors.accent}"/>

        <!-- Bras musclés -->
        <rect x="6" y="30" width="10" height="18" fill="${colors.skin}"/>
        <rect x="8" y="32" width="6" height="14" fill="${colors.skinLight}"/>
        <!-- Bracelet -->
        <rect x="6" y="44" width="10" height="4" fill="${colors.accent}"/>
        <rect x="4" y="48" width="8" height="6" fill="${colors.skin}"/>

        <rect x="48" y="30" width="10" height="18" fill="${colors.skin}"/>
        <rect x="50" y="32" width="6" height="14" fill="${colors.skinLight}"/>
        <!-- Bracelet -->
        <rect x="48" y="44" width="10" height="4" fill="${colors.accent}"/>
        <rect x="52" y="48" width="8" height="6" fill="${colors.skin}"/>

        <!-- Grande hache -->
        <rect x="58" y="12" width="4" height="44" fill="#5c2e0c"/>
        <rect x="59" y="14" width="2" height="40" fill="#8B4513"/>
        <!-- Lame de hache -->
        <rect x="54" y="8" width="10" height="14" fill="${colors.weapon}"/>
        <rect x="56" y="10" width="6" height="10" fill="${colors.weaponLight}"/>

        <!-- Pantalon -->
        <rect x="18" y="52" width="12" height="10" fill="${colors.armor}"/>
        <rect x="34" y="52" width="12" height="10" fill="${colors.armor}"/>
        <rect x="20" y="54" width="8" height="6" fill="${colors.armorLight}"/>
        <rect x="36" y="54" width="8" height="6" fill="${colors.armorLight}"/>

        <!-- Bottes -->
        <rect x="16" y="60" width="14" height="4" fill="${colors.armorDark}"/>
        <rect x="34" y="60" width="14" height="4" fill="${colors.armorDark}"/>
      `,
      rage: `
        <!-- BERSERKER 64x64 - RAGE -->
        <!-- Aura de rage -->
        <circle cx="32" cy="36" r="28" fill="${colors.accent}" opacity="0.3"/>

        <!-- Cheveux dressés -->
        <rect x="14" y="0" width="8" height="14" fill="${colors.hair}"/>
        <rect x="16" y="-2" width="4" height="10" fill="${colors.hairLight}"/>
        <rect x="42" y="0" width="8" height="14" fill="${colors.hair}"/>
        <rect x="44" y="-2" width="4" height="10" fill="${colors.hairLight}"/>
        <rect x="20" y="2" width="24" height="6" fill="${colors.hair}"/>

        <!-- Tête -->
        <rect x="18" y="6" width="28" height="18" fill="${colors.skin}"/>
        <rect x="20" y="8" width="24" height="14" fill="${colors.skinLight}"/>

        <!-- Yeux rouges furieux -->
        <rect x="22" y="12" width="6" height="5" fill="#ff0000"/>
        <rect x="36" y="12" width="6" height="5" fill="#ff0000"/>
        <rect x="24" y="13" width="3" height="3" fill="#ffff00"/>
        <rect x="38" y="13" width="3" height="3" fill="#ffff00"/>

        <!-- Bouche hurlante -->
        <rect x="26" y="18" width="12" height="5" fill="#5a2020"/>
        <rect x="28" y="20" width="8" height="2" fill="#fff"/>

        <!-- Corps tendu -->
        <rect x="14" y="26" width="36" height="22" fill="${colors.skin}"/>
        <rect x="16" y="28" width="32" height="18" fill="${colors.skinLight}"/>
        <!-- Muscles gonflés -->
        <rect x="18" y="30" width="12" height="10" fill="${colors.skinDark}"/>
        <rect x="34" y="30" width="12" height="10" fill="${colors.skinDark}"/>
        <!-- Veines -->
        <rect x="20" y="32" width="1" height="6" fill="#b08070"/>
        <rect x="42" y="32" width="1" height="6" fill="#b08070"/>

        <!-- Ceinture -->
        <rect x="16" y="46" width="32" height="4" fill="${colors.armor}"/>

        <!-- Bras tendus -->
        <rect x="2" y="24" width="12" height="20" fill="${colors.skin}"/>
        <rect x="4" y="26" width="8" height="16" fill="${colors.skinLight}"/>
        <rect x="2" y="40" width="10" height="4" fill="${colors.accent}"/>
        <rect x="0" y="44" width="8" height="8" fill="${colors.skin}"/>

        <rect x="50" y="24" width="12" height="20" fill="${colors.skin}"/>
        <rect x="52" y="26" width="8" height="16" fill="${colors.skinLight}"/>
        <rect x="52" y="40" width="10" height="4" fill="${colors.accent}"/>
        <rect x="56" y="44" width="8" height="8" fill="${colors.skin}"/>

        <!-- Hache levée -->
        <rect x="58" y="4" width="4" height="40" fill="#5c2e0c"/>
        <rect x="52" y="0" width="12" height="16" fill="${colors.weapon}"/>
        <rect x="54" y="2" width="8" height="12" fill="${colors.weaponLight}"/>

        <!-- Jambes écartées -->
        <rect x="14" y="50" width="14" height="12" fill="${colors.armor}"/>
        <rect x="36" y="50" width="14" height="12" fill="${colors.armor}"/>
        <rect x="12" y="60" width="16" height="4" fill="${colors.armorDark}"/>
        <rect x="36" y="60" width="16" height="4" fill="${colors.armorDark}"/>
      `,
      attack: `
        <!-- BERSERKER 64x64 - ATTACK -->
        <!-- Cheveux -->
        <rect x="12" y="2" width="8" height="10" fill="${colors.hair}"/>
        <rect x="38" y="2" width="8" height="10" fill="${colors.hair}"/>

        <!-- Tête -->
        <rect x="18" y="6" width="24" height="16" fill="${colors.skin}"/>
        <!-- Yeux -->
        <rect x="22" y="10" width="5" height="4" fill="#ff0000"/>
        <rect x="33" y="10" width="5" height="4" fill="#ff0000"/>
        <!-- Cri -->
        <rect x="26" y="16" width="8" height="4" fill="#5a2020"/>

        <!-- Corps penché -->
        <rect x="12" y="24" width="36" height="20" fill="${colors.skin}"/>
        <rect x="14" y="26" width="32" height="16" fill="${colors.skinLight}"/>

        <!-- Bras avec double haches -->
        <rect x="0" y="16" width="14" height="12" fill="${colors.skin}"/>
        <rect x="2" y="18" width="10" height="8" fill="${colors.skinLight}"/>
        <!-- Hache gauche -->
        <rect x="-4" y="10" width="10" height="12" fill="${colors.weapon}"/>
        <rect x="-2" y="12" width="6" height="8" fill="${colors.weaponLight}"/>

        <rect x="50" y="16" width="14" height="12" fill="${colors.skin}"/>
        <rect x="52" y="18" width="10" height="8" fill="${colors.skinLight}"/>
        <!-- Hache droite -->
        <rect x="58" y="10" width="10" height="12" fill="${colors.weapon}"/>
        <rect x="60" y="12" width="6" height="8" fill="${colors.weaponLight}"/>

        <!-- Ceinture -->
        <rect x="14" y="42" width="32" height="4" fill="${colors.armor}"/>

        <!-- Jambes en mouvement -->
        <rect x="14" y="46" width="14" height="16" fill="${colors.armor}"/>
        <rect x="32" y="46" width="14" height="16" fill="${colors.armor}"/>
        <rect x="10" y="60" width="16" height="4" fill="${colors.armorDark}"/>
        <rect x="34" y="60" width="16" height="4" fill="${colors.armorDark}"/>
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
          viewBox="0 0 64 64"
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
export { PixelArtAvatarBuilder, generatePixelCharacter };

// ==========================================
// SYNERGIA v4.1 - DiceBear Avatar System
// Vrais avatars personnalisables avec accessoires intégrés
// ==========================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, Crown, Sword, Heart, Sparkles, Shield, Image,
  Lock, Check, ChevronRight, Star, Zap, Trophy, RefreshCw,
  Eye, EyeOff, RotateCcw, Save, Shirt, Glasses, Smile
} from 'lucide-react';

// ==========================================
// CONFIGURATION DICEBEAR
// ==========================================

// Styles d'avatars disponibles
export const AVATAR_STYLES = {
  adventurer: {
    id: 'adventurer',
    name: 'Aventurier',
    description: 'Style cartoon coloré',
    icon: '🧙',
    unlockCondition: { type: 'default' }
  },
  'adventurer-neutral': {
    id: 'adventurer-neutral',
    name: 'Aventurier Neutre',
    description: 'Style simplifié',
    icon: '🧝',
    unlockCondition: { type: 'level', value: 5 }
  },
  'pixel-art': {
    id: 'pixel-art',
    name: 'Pixel Art',
    description: 'Style rétro 8-bit',
    icon: '👾',
    unlockCondition: { type: 'level', value: 3 }
  },
  lorelei: {
    id: 'lorelei',
    name: 'Artistique',
    description: 'Dessins élégants',
    icon: '🎨',
    unlockCondition: { type: 'level', value: 10 }
  },
  bottts: {
    id: 'bottts',
    name: 'Robot',
    description: 'Avatars robotiques',
    icon: '🤖',
    unlockCondition: { type: 'badges', value: 5 }
  },
  'fun-emoji': {
    id: 'fun-emoji',
    name: 'Emoji Fun',
    description: 'Emojis expressifs',
    icon: '😎',
    unlockCondition: { type: 'streak', value: 7 }
  },
  micah: {
    id: 'micah',
    name: 'Illustré',
    description: 'Portraits modernes',
    icon: '👤',
    unlockCondition: { type: 'xp', value: 2000 }
  },
  notionists: {
    id: 'notionists',
    name: 'Minimaliste',
    description: 'Style Notion épuré',
    icon: '✨',
    unlockCondition: { type: 'tasks', value: 25 }
  }
};

// Options de cheveux pour adventurer
export const HAIR_OPTIONS = {
  short01: { id: 'short01', name: 'Court 1', icon: '💇', unlockCondition: { type: 'default' } },
  short02: { id: 'short02', name: 'Court 2', icon: '💇', unlockCondition: { type: 'default' } },
  short03: { id: 'short03', name: 'Court 3', icon: '💇', unlockCondition: { type: 'default' } },
  short04: { id: 'short04', name: 'Court 4', icon: '💇', unlockCondition: { type: 'level', value: 2 } },
  short05: { id: 'short05', name: 'Court 5', icon: '💇', unlockCondition: { type: 'level', value: 3 } },
  long01: { id: 'long01', name: 'Long 1', icon: '💇‍♀️', unlockCondition: { type: 'default' } },
  long02: { id: 'long02', name: 'Long 2', icon: '💇‍♀️', unlockCondition: { type: 'default' } },
  long03: { id: 'long03', name: 'Long 3', icon: '💇‍♀️', unlockCondition: { type: 'level', value: 2 } },
  long04: { id: 'long04', name: 'Long 4', icon: '💇‍♀️', unlockCondition: { type: 'level', value: 4 } },
  long05: { id: 'long05', name: 'Long 5', icon: '💇‍♀️', unlockCondition: { type: 'level', value: 5 } },
  long06: { id: 'long06', name: 'Long 6', icon: '💇‍♀️', unlockCondition: { type: 'level', value: 6 } },
  long07: { id: 'long07', name: 'Long 7', icon: '💇‍♀️', unlockCondition: { type: 'level', value: 7 } },
  long08: { id: 'long08', name: 'Long 8', icon: '💇‍♀️', unlockCondition: { type: 'level', value: 8 } },
  long09: { id: 'long09', name: 'Long 9', icon: '💇‍♀️', unlockCondition: { type: 'badges', value: 5 } },
  long10: { id: 'long10', name: 'Long 10', icon: '💇‍♀️', unlockCondition: { type: 'badges', value: 10 } },
  long11: { id: 'long11', name: 'Long 11', icon: '💇‍♀️', unlockCondition: { type: 'xp', value: 1000 } },
  long12: { id: 'long12', name: 'Long 12', icon: '💇‍♀️', unlockCondition: { type: 'xp', value: 2000 } },
  long13: { id: 'long13', name: 'Long 13', icon: '💇‍♀️', unlockCondition: { type: 'xp', value: 3000 } }
};

// Couleurs de cheveux
export const HAIR_COLORS = {
  '0e0e0e': { id: '0e0e0e', name: 'Noir', color: '#0e0e0e', unlockCondition: { type: 'default' } },
  '3a3a3a': { id: '3a3a3a', name: 'Gris foncé', color: '#3a3a3a', unlockCondition: { type: 'default' } },
  '6a4e35': { id: '6a4e35', name: 'Brun', color: '#6a4e35', unlockCondition: { type: 'default' } },
  '977e63': { id: '977e63', name: 'Châtain', color: '#977e63', unlockCondition: { type: 'default' } },
  'c9b291': { id: 'c9b291', name: 'Blond foncé', color: '#c9b291', unlockCondition: { type: 'level', value: 2 } },
  'e5c293': { id: 'e5c293', name: 'Blond', color: '#e5c293', unlockCondition: { type: 'level', value: 3 } },
  'f5d5b8': { id: 'f5d5b8', name: 'Blond clair', color: '#f5d5b8', unlockCondition: { type: 'level', value: 4 } },
  'b55239': { id: 'b55239', name: 'Roux', color: '#b55239', unlockCondition: { type: 'level', value: 5 } },
  'd6542e': { id: 'd6542e', name: 'Orange', color: '#d6542e', unlockCondition: { type: 'badges', value: 3 } },
  'e74c3c': { id: 'e74c3c', name: 'Rouge', color: '#e74c3c', unlockCondition: { type: 'badges', value: 5 } },
  '9b59b6': { id: '9b59b6', name: 'Violet', color: '#9b59b6', unlockCondition: { type: 'badges', value: 8 } },
  '3498db': { id: '3498db', name: 'Bleu', color: '#3498db', unlockCondition: { type: 'level', value: 10 } },
  '2ecc71': { id: '2ecc71', name: 'Vert', color: '#2ecc71', unlockCondition: { type: 'level', value: 12 } },
  'f39c12': { id: 'f39c12', name: 'Or', color: '#f39c12', unlockCondition: { type: 'xp', value: 5000 } },
  'e91e63': { id: 'e91e63', name: 'Rose', color: '#e91e63', unlockCondition: { type: 'streak', value: 14 } },
  '00bcd4': { id: '00bcd4', name: 'Cyan', color: '#00bcd4', unlockCondition: { type: 'tasks', value: 50 } },
  'ff5722': { id: 'ff5722', name: 'Feu', color: '#ff5722', unlockCondition: { type: 'challenges', value: 5 } },
  'ffffff': { id: 'ffffff', name: 'Blanc', color: '#ffffff', unlockCondition: { type: 'level', value: 20 } }
};

// Couleurs de peau
export const SKIN_COLORS = {
  'f2d3b1': { id: 'f2d3b1', name: 'Claire', color: '#f2d3b1', unlockCondition: { type: 'default' } },
  'ecad80': { id: 'ecad80', name: 'Moyenne claire', color: '#ecad80', unlockCondition: { type: 'default' } },
  'd08b5b': { id: 'd08b5b', name: 'Moyenne', color: '#d08b5b', unlockCondition: { type: 'default' } },
  'ae5d29': { id: 'ae5d29', name: 'Mate', color: '#ae5d29', unlockCondition: { type: 'default' } },
  '614335': { id: '614335', name: 'Foncée', color: '#614335', unlockCondition: { type: 'default' } },
  // Couleurs fantaisie (débloquables)
  'b6e3f4': { id: 'b6e3f4', name: 'Glace', color: '#b6e3f4', unlockCondition: { type: 'level', value: 15 } },
  'c0aede': { id: 'c0aede', name: 'Lavande', color: '#c0aede', unlockCondition: { type: 'badges', value: 15 } },
  'd1d4f9': { id: 'd1d4f9', name: 'Céleste', color: '#d1d4f9', unlockCondition: { type: 'xp', value: 10000 } },
  'ffd5dc': { id: 'ffd5dc', name: 'Rose', color: '#ffd5dc', unlockCondition: { type: 'streak', value: 30 } },
  'a8e6cf': { id: 'a8e6cf', name: 'Menthe', color: '#a8e6cf', unlockCondition: { type: 'tasks', value: 100 } }
};

// Styles de lunettes
export const GLASSES_OPTIONS = {
  none: { id: 'none', name: 'Aucune', icon: '❌', unlockCondition: { type: 'default' } },
  variant01: { id: 'variant01', name: 'Rondes', icon: '👓', unlockCondition: { type: 'default' } },
  variant02: { id: 'variant02', name: 'Carrées', icon: '🤓', unlockCondition: { type: 'level', value: 3 } },
  variant03: { id: 'variant03', name: 'Sport', icon: '🥽', unlockCondition: { type: 'level', value: 5 } },
  variant04: { id: 'variant04', name: 'Soleil', icon: '🕶️', unlockCondition: { type: 'badges', value: 3 } },
  variant05: { id: 'variant05', name: 'Futuristes', icon: '😎', unlockCondition: { type: 'level', value: 8 } }
};

// Styles de boucles d'oreilles
export const EARRINGS_OPTIONS = {
  none: { id: 'none', name: 'Aucune', icon: '❌', unlockCondition: { type: 'default' } },
  variant01: { id: 'variant01', name: 'Anneaux', icon: '⭕', unlockCondition: { type: 'level', value: 2 } },
  variant02: { id: 'variant02', name: 'Gouttes', icon: '💧', unlockCondition: { type: 'level', value: 4 } },
  variant03: { id: 'variant03', name: 'Studs', icon: '✨', unlockCondition: { type: 'badges', value: 3 } },
  variant04: { id: 'variant04', name: 'Plumes', icon: '🪶', unlockCondition: { type: 'level', value: 7 } },
  variant05: { id: 'variant05', name: 'Étoiles', icon: '⭐', unlockCondition: { type: 'xp', value: 3000 } },
  variant06: { id: 'variant06', name: 'Diamants', icon: '💎', unlockCondition: { type: 'level', value: 15 } }
};

// Couleurs de fond
export const BACKGROUND_COLORS = {
  transparent: { id: 'transparent', name: 'Transparent', gradient: 'from-gray-800 to-gray-900', unlockCondition: { type: 'default' } },
  b6e3f4: { id: 'b6e3f4', name: 'Ciel', color: '#b6e3f4', gradient: 'from-sky-400 to-blue-500', unlockCondition: { type: 'default' } },
  c0aede: { id: 'c0aede', name: 'Lavande', color: '#c0aede', gradient: 'from-purple-400 to-indigo-500', unlockCondition: { type: 'level', value: 2 } },
  d1d4f9: { id: 'd1d4f9', name: 'Pervenche', color: '#d1d4f9', gradient: 'from-indigo-300 to-purple-400', unlockCondition: { type: 'level', value: 3 } },
  ffd5dc: { id: 'ffd5dc', name: 'Rose', color: '#ffd5dc', gradient: 'from-pink-300 to-rose-400', unlockCondition: { type: 'level', value: 4 } },
  ffdfbf: { id: 'ffdfbf', name: 'Pêche', color: '#ffdfbf', gradient: 'from-orange-200 to-amber-300', unlockCondition: { type: 'level', value: 5 } },
  '3498db': { id: '3498db', name: 'Océan', color: '#3498db', gradient: 'from-blue-500 to-cyan-600', unlockCondition: { type: 'badges', value: 5 } },
  '2ecc71': { id: '2ecc71', name: 'Nature', color: '#2ecc71', gradient: 'from-green-400 to-emerald-500', unlockCondition: { type: 'badges', value: 8 } },
  e74c3c: { id: 'e74c3c', name: 'Passion', color: '#e74c3c', gradient: 'from-red-500 to-pink-600', unlockCondition: { type: 'level', value: 10 } },
  f39c12: { id: 'f39c12', name: 'Soleil', color: '#f39c12', gradient: 'from-yellow-400 to-orange-500', unlockCondition: { type: 'xp', value: 5000 } },
  '9b59b6': { id: '9b59b6', name: 'Mystique', color: '#9b59b6', gradient: 'from-purple-500 to-violet-600', unlockCondition: { type: 'level', value: 15 } },
  '1a1a2e': { id: '1a1a2e', name: 'Nuit', color: '#1a1a2e', gradient: 'from-slate-900 to-gray-900', unlockCondition: { type: 'streak', value: 14 } },
  'gradient1': { id: 'gradient1', name: 'Arc-en-ciel', color: 'rainbow', gradient: 'from-red-500 via-yellow-500 to-blue-500', unlockCondition: { type: 'level', value: 20 } }
};

// Configuration par défaut
export const DEFAULT_DICEBEAR_CONFIG = {
  style: 'adventurer',
  seed: '',
  hair: 'short01',
  hairColor: '6a4e35',
  skinColor: 'ecad80',
  glasses: 'none',
  earrings: 'none',
  backgroundColor: 'b6e3f4',
  flip: false
};

// ==========================================
// UTILITAIRES
// ==========================================

export const isUnlocked = (item, userStats = {}) => {
  if (!item.unlockCondition) return true;

  const condition = item.unlockCondition;

  switch (condition.type) {
    case 'default':
      return true;
    case 'level':
      return (userStats.level || 1) >= condition.value;
    case 'xp':
      return (userStats.totalXp || 0) >= condition.value;
    case 'tasks':
      return (userStats.tasksCompleted || 0) >= condition.value;
    case 'badges':
      return (userStats.badgesCount || 0) >= condition.value;
    case 'streak':
      return (userStats.currentStreak || 0) >= condition.value;
    case 'challenges':
      return (userStats.challengesCompleted || 0) >= condition.value;
    default:
      return false;
  }
};

export const getUnlockText = (item) => {
  if (!item.unlockCondition) return '';

  const condition = item.unlockCondition;

  switch (condition.type) {
    case 'default':
      return 'Disponible';
    case 'level':
      return `Niveau ${condition.value}`;
    case 'xp':
      return `${condition.value} XP`;
    case 'tasks':
      return `${condition.value} tâches`;
    case 'badges':
      return `${condition.value} badges`;
    case 'streak':
      return `${condition.value}j série`;
    case 'challenges':
      return `${condition.value} défis`;
    default:
      return 'Verrouillé';
  }
};

export const getUnlockProgress = (item, userStats = {}) => {
  if (!item.unlockCondition || item.unlockCondition.type === 'default') return 100;

  const condition = item.unlockCondition;
  let current = 0;

  switch (condition.type) {
    case 'level':
      current = userStats.level || 1;
      break;
    case 'xp':
      current = userStats.totalXp || 0;
      break;
    case 'tasks':
      current = userStats.tasksCompleted || 0;
      break;
    case 'badges':
      current = userStats.badgesCount || 0;
      break;
    case 'streak':
      current = userStats.currentStreak || 0;
      break;
    case 'challenges':
      current = userStats.challengesCompleted || 0;
      break;
    default:
      return 0;
  }

  return Math.min(100, Math.round((current / condition.value) * 100));
};

// Générer l'URL DiceBear
export const generateDiceBearUrl = (config, size = 200) => {
  const style = config.style || 'adventurer';
  const params = new URLSearchParams();

  // Seed unique basé sur les options
  const seed = config.seed || `synergia-${Date.now()}`;
  params.append('seed', seed);
  params.append('size', size);

  // Style spécifiques selon le type d'avatar
  if (style === 'adventurer' || style === 'adventurer-neutral') {
    if (config.hair && config.hair !== 'none') params.append('hair', config.hair);
    if (config.hairColor) params.append('hairColor', config.hairColor);
    if (config.skinColor) params.append('skinColor', config.skinColor);
    if (config.glasses && config.glasses !== 'none') params.append('glasses', config.glasses);
    if (config.earrings && config.earrings !== 'none') params.append('earrings', config.earrings);
  }

  // Background
  if (config.backgroundColor && config.backgroundColor !== 'transparent') {
    params.append('backgroundColor', config.backgroundColor);
  }

  // Flip
  if (config.flip) {
    params.append('flip', 'true');
  }

  return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
};

// ==========================================
// COMPOSANT AVATAR PREVIEW DICEBEAR
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

  const sizePx = {
    tiny: 32,
    small: 64,
    medium: 96,
    large: 160,
    xlarge: 224
  };

  const avatarUrl = useMemo(() => {
    return generateDiceBearUrl(config, sizePx[size] * 2); // 2x pour retina
  }, [config, size]);

  const bgConfig = BACKGROUND_COLORS[config.backgroundColor] || BACKGROUND_COLORS.b6e3f4;

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
      {/* Arrière-plan avec gradient */}
      <div className={`
        ${sizeClasses[size]} rounded-2xl overflow-hidden
        bg-gradient-to-br ${bgConfig.gradient}
        border-4 border-white/20 shadow-2xl
        flex items-center justify-center
      `}>
        {/* Glow effect */}
        {showEffects && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        {/* Avatar Image */}
        {!imageError ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-4xl">👤</div>
        )}

        {/* Loading spinner */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50" />
          </div>
        )}
      </div>

      {/* Effet d'étincelles */}
      {showEffects && imageLoaded && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 30],
                y: [0, (Math.random() - 0.5) * 30]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT ITEM SELECTOR
// ==========================================
const ItemSelector = ({
  items,
  selectedId,
  onSelect,
  userStats,
  showColors = false,
  columns = 4
}) => {
  return (
    <div className={`grid grid-cols-${columns} gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Object.values(items).map((item) => {
        const unlocked = isUnlocked(item, userStats);
        const isSelected = selectedId === item.id;
        const progress = getUnlockProgress(item, userStats);

        return (
          <motion.button
            key={item.id}
            onClick={() => unlocked && onSelect(item.id)}
            disabled={!unlocked}
            whileHover={unlocked ? { scale: 1.05 } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            className={`
              relative p-2 rounded-xl border-2 transition-all min-h-[60px]
              ${unlocked
                ? 'border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer'
                : 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-60'
              }
              ${isSelected ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-500/20' : ''}
            `}
          >
            {/* Couleur ou icône */}
            <div className="flex flex-col items-center justify-center gap-1">
              {showColors && item.color ? (
                <div
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                  style={{ backgroundColor: item.color }}
                />
              ) : item.gradient ? (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.gradient}`} />
              ) : (
                <span className="text-xl">{item.icon}</span>
              )}
              <span className={`text-[10px] font-medium text-center truncate w-full ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </div>

            {/* Badge sélection */}
            {isSelected && unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-2.5 h-2.5 text-white" />
              </motion.div>
            )}

            {/* Verrou */}
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                <div className="text-center px-1">
                  <Lock className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                  <p className="text-[8px] text-gray-400">{getUnlockText(item)}</p>
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
// COMPOSANT PRINCIPAL - DICEBEAR AVATAR BUILDER
// ==========================================
const DiceBearAvatarBuilder = ({
  initialConfig = DEFAULT_DICEBEAR_CONFIG,
  userStats = {},
  onSave,
  onCancel,
  saving = false
}) => {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState('style');
  const [showPreview, setShowPreview] = useState(true);

  // Catégories de personnalisation
  const categories = [
    { id: 'style', label: 'Style', icon: User, items: AVATAR_STYLES },
    { id: 'hair', label: 'Cheveux', icon: Crown, items: HAIR_OPTIONS },
    { id: 'hairColor', label: 'Couleur', icon: Palette, items: HAIR_COLORS, showColors: true },
    { id: 'skinColor', label: 'Peau', icon: Smile, items: SKIN_COLORS, showColors: true },
    { id: 'glasses', label: 'Lunettes', icon: Glasses, items: GLASSES_OPTIONS },
    { id: 'earrings', label: 'Boucles', icon: Sparkles, items: EARRINGS_OPTIONS },
    { id: 'backgroundColor', label: 'Fond', icon: Image, items: BACKGROUND_COLORS }
  ];

  // Stats de déblocage
  const unlockStats = useMemo(() => {
    let total = 0;
    let unlocked = 0;

    categories.forEach(cat => {
      const items = Object.values(cat.items);
      total += items.length;
      unlocked += items.filter(item => isUnlocked(item, userStats)).length;
    });

    return { total, unlocked, percentage: Math.round((unlocked / total) * 100) };
  }, [userStats]);

  const handleSelect = (categoryId, itemId) => {
    setConfig(prev => ({
      ...prev,
      [categoryId]: itemId,
      // Générer un nouveau seed pour varier l'avatar
      seed: categoryId === 'style' ? `synergia-${Date.now()}` : prev.seed
    }));
  };

  const handleRandomize = () => {
    const newConfig = { ...config, seed: `synergia-${Date.now()}` };

    categories.forEach(cat => {
      const items = Object.values(cat.items).filter(item => isUnlocked(item, userStats));
      if (items.length > 0) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        newConfig[cat.id] = randomItem.id;
      }
    });

    setConfig(newConfig);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_DICEBEAR_CONFIG, seed: `synergia-${Date.now()}` });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
  };

  const currentCategory = categories.find(c => c.id === activeTab);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne gauche - Preview */}
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
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
            </button>
          </div>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-center py-6"
              >
                <DiceBearAvatarPreview config={config} size="xlarge" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info style */}
          <div className="mt-4 p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{AVATAR_STYLES[config.style]?.icon}</span>
              <div>
                <p className="text-white font-semibold">{AVATAR_STYLES[config.style]?.name}</p>
                <p className="text-xs text-gray-400">{AVATAR_STYLES[config.style]?.description}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <motion.button
              onClick={handleRandomize}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Aléatoire
            </motion.button>

            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Stats de déblocage */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Éléments débloqués</span>
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

          {/* Boutons Save/Cancel */}
          <div className="flex gap-2 mt-4">
            {onCancel && (
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
              >
                Annuler
              </motion.button>
            )}
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Colonne droite - Options */}
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

        {/* Contenu de l'onglet actif */}
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
              Sélection actuelle: {currentCategory?.items[config[activeTab]]?.name || 'Aucun'}
            </span>
          </div>

          <ItemSelector
            items={currentCategory?.items || {}}
            selectedId={config[activeTab]}
            onSelect={(id) => handleSelect(activeTab, id)}
            userStats={userStats}
            showColors={currentCategory?.showColors}
            columns={activeTab === 'style' ? 4 : 6}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DiceBearAvatarBuilder;
export { DiceBearAvatarBuilder };

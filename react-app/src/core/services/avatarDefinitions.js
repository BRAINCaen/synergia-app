// ==========================================
// SYNERGIA v4.0 - Avatar Definitions
// Systeme complet de personnages et accessoires
// Inspire du style pixel art RPG
// ==========================================

// ===================
// CLASSES DE PERSONNAGES
// ===================
export const CHARACTER_CLASSES = {
  wizard: {
    id: 'wizard',
    name: 'Mage',
    description: 'Maitre des arcanes et de la sagesse',
    icon: '🧙',
    baseStats: { wisdom: 10, magic: 15, strength: 3 },
    unlockCondition: { type: 'default' },
    svg: 'wizard'
  },
  warrior: {
    id: 'warrior',
    name: 'Guerrier',
    description: 'Force et honneur au combat',
    icon: '⚔️',
    baseStats: { wisdom: 5, magic: 2, strength: 15 },
    unlockCondition: { type: 'level', value: 5 },
    svg: 'warrior'
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    description: 'Precision et agilite',
    icon: '🏹',
    baseStats: { wisdom: 7, magic: 5, strength: 10 },
    unlockCondition: { type: 'tasks', value: 50 },
    svg: 'archer'
  },
  villager: {
    id: 'villager',
    name: 'Villageois',
    description: 'Travailleur acharne et fiable',
    icon: '👨‍🌾',
    baseStats: { wisdom: 8, magic: 3, strength: 8 },
    unlockCondition: { type: 'default' },
    svg: 'villager'
  },
  knight: {
    id: 'knight',
    name: 'Chevalier',
    description: 'Defenseur de la justice',
    icon: '🛡️',
    baseStats: { wisdom: 6, magic: 4, strength: 12 },
    unlockCondition: { type: 'level', value: 10 },
    svg: 'knight'
  },
  rogue: {
    id: 'rogue',
    name: 'Voleur',
    description: 'Rapide et furtif',
    icon: '🗡️',
    baseStats: { wisdom: 9, magic: 6, strength: 7 },
    unlockCondition: { type: 'streak', value: 7 },
    svg: 'rogue'
  },
  healer: {
    id: 'healer',
    name: 'Soigneur',
    description: 'Gardien de la vie',
    icon: '💚',
    baseStats: { wisdom: 12, magic: 10, strength: 4 },
    unlockCondition: { type: 'badges', value: 10 },
    svg: 'healer'
  },
  ranger: {
    id: 'ranger',
    name: 'Rodeur',
    description: 'Un avec la nature',
    icon: '🌿',
    baseStats: { wisdom: 10, magic: 8, strength: 8 },
    unlockCondition: { type: 'xp', value: 5000 },
    svg: 'ranger'
  },
  necromancer: {
    id: 'necromancer',
    name: 'Necromancien',
    description: 'Maitre des ombres',
    icon: '💀',
    baseStats: { wisdom: 8, magic: 18, strength: 2 },
    unlockCondition: { type: 'level', value: 20 },
    svg: 'necromancer'
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    description: 'Champion de la lumiere',
    icon: '✨',
    baseStats: { wisdom: 10, magic: 8, strength: 10 },
    unlockCondition: { type: 'challenges', value: 10 },
    svg: 'paladin'
  }
};

// ===================
// VARIATIONS DE COULEURS
// ===================
export const COLOR_VARIANTS = {
  // Couleurs de base (debloquees par defaut ou tot)
  default: {
    id: 'default',
    name: 'Classique',
    primary: '#6366f1',
    secondary: '#4f46e5',
    accent: '#818cf8',
    gradient: 'from-indigo-500 to-purple-600',
    unlockCondition: { type: 'default' }
  },
  forest: {
    id: 'forest',
    name: 'Foret',
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#4ade80',
    gradient: 'from-green-500 to-emerald-600',
    unlockCondition: { type: 'level', value: 2 }
  },
  fire: {
    id: 'fire',
    name: 'Flamme',
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f87171',
    gradient: 'from-red-500 to-orange-600',
    unlockCondition: { type: 'level', value: 3 }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#60a5fa',
    gradient: 'from-blue-500 to-cyan-600',
    unlockCondition: { type: 'level', value: 4 }
  },
  shadow: {
    id: 'shadow',
    name: 'Ombre',
    primary: '#6b7280',
    secondary: '#4b5563',
    accent: '#9ca3af',
    gradient: 'from-gray-600 to-slate-700',
    unlockCondition: { type: 'level', value: 5 }
  },

  // Couleurs intermediaires
  sunset: {
    id: 'sunset',
    name: 'Crepuscule',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    gradient: 'from-orange-500 to-amber-600',
    unlockCondition: { type: 'level', value: 7 }
  },
  royal: {
    id: 'royal',
    name: 'Royal',
    primary: '#a855f7',
    secondary: '#9333ea',
    accent: '#c084fc',
    gradient: 'from-purple-500 to-violet-600',
    unlockCondition: { type: 'level', value: 8 }
  },
  ice: {
    id: 'ice',
    name: 'Glace',
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
    gradient: 'from-cyan-500 to-teal-600',
    unlockCondition: { type: 'level', value: 10 }
  },
  blood: {
    id: 'blood',
    name: 'Sang',
    primary: '#be123c',
    secondary: '#9f1239',
    accent: '#e11d48',
    gradient: 'from-rose-700 to-red-800',
    unlockCondition: { type: 'level', value: 12 }
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    primary: '#84cc16',
    secondary: '#65a30d',
    accent: '#a3e635',
    gradient: 'from-lime-500 to-green-600',
    unlockCondition: { type: 'tasks', value: 100 }
  },

  // Couleurs rares
  gold: {
    id: 'gold',
    name: 'Or',
    primary: '#eab308',
    secondary: '#ca8a04',
    accent: '#facc15',
    gradient: 'from-yellow-500 to-amber-500',
    unlockCondition: { type: 'level', value: 15 },
    rarity: 'rare'
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmique',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    gradient: 'from-violet-500 to-purple-700',
    unlockCondition: { type: 'xp', value: 10000 },
    rarity: 'rare'
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    gradient: 'from-amber-500 to-red-500',
    unlockCondition: { type: 'streak', value: 30 },
    rarity: 'rare'
  },

  // Couleurs epiques
  legendary: {
    id: 'legendary',
    name: 'Legendaire',
    primary: '#fbbf24',
    secondary: '#f59e0b',
    accent: '#fcd34d',
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    unlockCondition: { type: 'level', value: 25 },
    rarity: 'epic',
    animated: true
  },
  void: {
    id: 'void',
    name: 'Vide',
    primary: '#1e1b4b',
    secondary: '#312e81',
    accent: '#4338ca',
    gradient: 'from-indigo-950 to-purple-900',
    unlockCondition: { type: 'badges', value: 50 },
    rarity: 'epic'
  },
  celestial: {
    id: 'celestial',
    name: 'Celeste',
    primary: '#e0f2fe',
    secondary: '#bae6fd',
    accent: '#7dd3fc',
    gradient: 'from-sky-200 via-blue-300 to-indigo-400',
    unlockCondition: { type: 'level', value: 30 },
    rarity: 'epic',
    animated: true
  },

  // Couleurs mythiques
  prismatic: {
    id: 'prismatic',
    name: 'Prismatique',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    gradient: 'from-pink-500 via-purple-500 to-cyan-500',
    unlockCondition: { type: 'level', value: 50 },
    rarity: 'mythic',
    animated: true
  },
  ethereal: {
    id: 'ethereal',
    name: 'Etheree',
    primary: '#f0abfc',
    secondary: '#e879f9',
    accent: '#d946ef',
    gradient: 'from-fuchsia-300 via-pink-400 to-purple-500',
    unlockCondition: { type: 'special', event: 'anniversary' },
    rarity: 'mythic',
    animated: true
  }
};

// ===================
// ACCESSOIRES - COUVRE-CHEFS
// ===================
export const HEADGEAR = {
  // Basiques
  none: {
    id: 'none',
    name: 'Aucun',
    icon: '❌',
    unlockCondition: { type: 'default' }
  },
  basic_hat: {
    id: 'basic_hat',
    name: 'Chapeau simple',
    icon: '🎩',
    unlockCondition: { type: 'default' }
  },
  hood: {
    id: 'hood',
    name: 'Capuche',
    icon: '🧥',
    unlockCondition: { type: 'level', value: 2 }
  },
  bandana: {
    id: 'bandana',
    name: 'Bandana',
    icon: '🎀',
    unlockCondition: { type: 'tasks', value: 10 }
  },

  // Magiques
  wizard_hat: {
    id: 'wizard_hat',
    name: 'Chapeau de mage',
    icon: '🧙',
    forClass: ['wizard', 'necromancer'],
    unlockCondition: { type: 'level', value: 5 }
  },
  witch_hat: {
    id: 'witch_hat',
    name: 'Chapeau de sorciere',
    icon: '🪄',
    forClass: ['wizard', 'necromancer', 'healer'],
    unlockCondition: { type: 'level', value: 8 }
  },
  mystic_circlet: {
    id: 'mystic_circlet',
    name: 'Diademe mystique',
    icon: '👑',
    unlockCondition: { type: 'xp', value: 3000 },
    rarity: 'rare'
  },

  // Guerriers
  helmet: {
    id: 'helmet',
    name: 'Casque',
    icon: '⛑️',
    forClass: ['warrior', 'knight', 'paladin'],
    unlockCondition: { type: 'level', value: 6 }
  },
  viking_helm: {
    id: 'viking_helm',
    name: 'Casque viking',
    icon: '🪖',
    forClass: ['warrior', 'knight'],
    unlockCondition: { type: 'streak', value: 14 }
  },
  crown: {
    id: 'crown',
    name: 'Couronne',
    icon: '👑',
    unlockCondition: { type: 'level', value: 20 },
    rarity: 'epic'
  },

  // Speciaux
  halo: {
    id: 'halo',
    name: 'Aureole',
    icon: '😇',
    forClass: ['healer', 'paladin'],
    unlockCondition: { type: 'badges', value: 25 },
    rarity: 'rare'
  },
  horns: {
    id: 'horns',
    name: 'Cornes',
    icon: '😈',
    forClass: ['necromancer', 'rogue'],
    unlockCondition: { type: 'level', value: 15 },
    rarity: 'rare'
  },
  legendary_crown: {
    id: 'legendary_crown',
    name: 'Couronne legendaire',
    icon: '💎',
    unlockCondition: { type: 'level', value: 40 },
    rarity: 'mythic',
    animated: true
  }
};

// ===================
// ACCESSOIRES - ARMES
// ===================
export const WEAPONS = {
  none: {
    id: 'none',
    name: 'Aucune',
    icon: '❌',
    unlockCondition: { type: 'default' }
  },

  // Magiques
  wooden_staff: {
    id: 'wooden_staff',
    name: 'Baton de bois',
    icon: '🪵',
    forClass: ['wizard', 'healer'],
    unlockCondition: { type: 'default' }
  },
  magic_staff: {
    id: 'magic_staff',
    name: 'Baton magique',
    icon: '🪄',
    forClass: ['wizard', 'necromancer', 'healer'],
    unlockCondition: { type: 'level', value: 5 }
  },
  crystal_staff: {
    id: 'crystal_staff',
    name: 'Baton de cristal',
    icon: '💎',
    forClass: ['wizard', 'healer'],
    unlockCondition: { type: 'xp', value: 5000 },
    rarity: 'rare'
  },
  tome: {
    id: 'tome',
    name: 'Grimoire',
    icon: '📖',
    forClass: ['wizard', 'necromancer'],
    unlockCondition: { type: 'tasks', value: 75 }
  },

  // Corps a corps
  sword: {
    id: 'sword',
    name: 'Epee',
    icon: '⚔️',
    forClass: ['warrior', 'knight', 'paladin'],
    unlockCondition: { type: 'level', value: 3 }
  },
  great_sword: {
    id: 'great_sword',
    name: 'Espadon',
    icon: '🗡️',
    forClass: ['warrior', 'knight'],
    unlockCondition: { type: 'level', value: 10 }
  },
  axe: {
    id: 'axe',
    name: 'Hache',
    icon: '🪓',
    forClass: ['warrior', 'villager'],
    unlockCondition: { type: 'tasks', value: 30 }
  },
  hammer: {
    id: 'hammer',
    name: 'Marteau',
    icon: '🔨',
    forClass: ['warrior', 'villager', 'paladin'],
    unlockCondition: { type: 'level', value: 7 }
  },

  // Distance
  bow: {
    id: 'bow',
    name: 'Arc',
    icon: '🏹',
    forClass: ['archer', 'ranger'],
    unlockCondition: { type: 'level', value: 4 }
  },
  crossbow: {
    id: 'crossbow',
    name: 'Arbalete',
    icon: '🎯',
    forClass: ['archer', 'rogue'],
    unlockCondition: { type: 'level', value: 12 }
  },

  // Subtils
  dagger: {
    id: 'dagger',
    name: 'Dague',
    icon: '🔪',
    forClass: ['rogue', 'archer'],
    unlockCondition: { type: 'streak', value: 7 }
  },
  dual_daggers: {
    id: 'dual_daggers',
    name: 'Dagues jumelles',
    icon: '⚔️',
    forClass: ['rogue'],
    unlockCondition: { type: 'level', value: 15 },
    rarity: 'rare'
  },

  // Outils
  scythe: {
    id: 'scythe',
    name: 'Faux',
    icon: '🌾',
    forClass: ['villager', 'necromancer'],
    unlockCondition: { type: 'tasks', value: 50 }
  },
  pickaxe: {
    id: 'pickaxe',
    name: 'Pioche',
    icon: '⛏️',
    forClass: ['villager'],
    unlockCondition: { type: 'level', value: 6 }
  },

  // Legendaires
  holy_sword: {
    id: 'holy_sword',
    name: 'Epee sacree',
    icon: '✨',
    forClass: ['paladin', 'knight'],
    unlockCondition: { type: 'level', value: 25 },
    rarity: 'epic'
  },
  shadow_blade: {
    id: 'shadow_blade',
    name: 'Lame des ombres',
    icon: '🌑',
    forClass: ['rogue', 'necromancer'],
    unlockCondition: { type: 'level', value: 30 },
    rarity: 'epic'
  },
  excalibur: {
    id: 'excalibur',
    name: 'Excalibur',
    icon: '⚡',
    unlockCondition: { type: 'level', value: 50 },
    rarity: 'mythic',
    animated: true
  }
};

// ===================
// ACCESSOIRES - COMPAGNONS
// ===================
export const COMPANIONS = {
  none: {
    id: 'none',
    name: 'Aucun',
    icon: '❌',
    unlockCondition: { type: 'default' }
  },

  // Animaux communs
  cat: {
    id: 'cat',
    name: 'Chat',
    icon: '🐱',
    unlockCondition: { type: 'level', value: 3 }
  },
  dog: {
    id: 'dog',
    name: 'Chien',
    icon: '🐕',
    unlockCondition: { type: 'tasks', value: 20 }
  },
  owl: {
    id: 'owl',
    name: 'Hibou',
    icon: '🦉',
    forClass: ['wizard', 'ranger'],
    unlockCondition: { type: 'level', value: 5 }
  },
  raven: {
    id: 'raven',
    name: 'Corbeau',
    icon: '🐦‍⬛',
    forClass: ['necromancer', 'rogue'],
    unlockCondition: { type: 'level', value: 8 }
  },

  // Animaux speciaux
  wolf: {
    id: 'wolf',
    name: 'Loup',
    icon: '🐺',
    forClass: ['ranger', 'warrior'],
    unlockCondition: { type: 'streak', value: 14 },
    rarity: 'rare'
  },
  hawk: {
    id: 'hawk',
    name: 'Faucon',
    icon: '🦅',
    forClass: ['archer', 'ranger'],
    unlockCondition: { type: 'level', value: 12 }
  },
  fox: {
    id: 'fox',
    name: 'Renard',
    icon: '🦊',
    forClass: ['rogue', 'ranger'],
    unlockCondition: { type: 'badges', value: 15 }
  },

  // Montures
  horse: {
    id: 'horse',
    name: 'Cheval',
    icon: '🐴',
    forClass: ['knight', 'paladin', 'warrior'],
    unlockCondition: { type: 'level', value: 15 },
    rarity: 'rare'
  },
  black_horse: {
    id: 'black_horse',
    name: 'Destrier noir',
    icon: '🐎',
    forClass: ['knight', 'necromancer'],
    unlockCondition: { type: 'level', value: 20 },
    rarity: 'epic'
  },

  // Fantastiques
  fairy: {
    id: 'fairy',
    name: 'Fee',
    icon: '🧚',
    forClass: ['healer', 'wizard'],
    unlockCondition: { type: 'xp', value: 7500 },
    rarity: 'rare'
  },
  spirit: {
    id: 'spirit',
    name: 'Esprit',
    icon: '👻',
    forClass: ['necromancer', 'wizard'],
    unlockCondition: { type: 'level', value: 18 }
  },
  wisp: {
    id: 'wisp',
    name: 'Feu follet',
    icon: '✨',
    unlockCondition: { type: 'challenges', value: 5 },
    rarity: 'rare'
  },

  // Legendaires
  phoenix_pet: {
    id: 'phoenix_pet',
    name: 'Bebe Phoenix',
    icon: '🔥',
    unlockCondition: { type: 'level', value: 30 },
    rarity: 'epic'
  },
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    icon: '🐉',
    unlockCondition: { type: 'level', value: 40 },
    rarity: 'mythic',
    animated: true
  },
  unicorn: {
    id: 'unicorn',
    name: 'Licorne',
    icon: '🦄',
    forClass: ['paladin', 'healer'],
    unlockCondition: { type: 'level', value: 35 },
    rarity: 'mythic'
  }
};

// ===================
// ACCESSOIRES - EFFETS/AURAS
// ===================
export const EFFECTS = {
  none: {
    id: 'none',
    name: 'Aucun',
    icon: '❌',
    cssClass: '',
    unlockCondition: { type: 'default' }
  },

  // Particules basiques
  sparkles: {
    id: 'sparkles',
    name: 'Etincelles',
    icon: '✨',
    cssClass: 'effect-sparkles',
    unlockCondition: { type: 'level', value: 5 }
  },
  glow: {
    id: 'glow',
    name: 'Lueur',
    icon: '💡',
    cssClass: 'effect-glow',
    unlockCondition: { type: 'xp', value: 2000 }
  },

  // Elementaires
  fire_aura: {
    id: 'fire_aura',
    name: 'Aura de feu',
    icon: '🔥',
    cssClass: 'effect-fire',
    unlockCondition: { type: 'level', value: 10 },
    rarity: 'rare'
  },
  ice_aura: {
    id: 'ice_aura',
    name: 'Aura de glace',
    icon: '❄️',
    cssClass: 'effect-ice',
    unlockCondition: { type: 'streak', value: 21 },
    rarity: 'rare'
  },
  lightning: {
    id: 'lightning',
    name: 'Eclairs',
    icon: '⚡',
    cssClass: 'effect-lightning',
    unlockCondition: { type: 'level', value: 15 },
    rarity: 'rare'
  },
  nature_aura: {
    id: 'nature_aura',
    name: 'Aura naturelle',
    icon: '🌿',
    cssClass: 'effect-nature',
    forClass: ['ranger', 'healer'],
    unlockCondition: { type: 'tasks', value: 100 }
  },

  // Mystiques
  shadow_aura: {
    id: 'shadow_aura',
    name: 'Aura sombre',
    icon: '🌑',
    cssClass: 'effect-shadow',
    forClass: ['necromancer', 'rogue'],
    unlockCondition: { type: 'level', value: 20 },
    rarity: 'epic'
  },
  holy_light: {
    id: 'holy_light',
    name: 'Lumiere sacree',
    icon: '🌟',
    cssClass: 'effect-holy',
    forClass: ['paladin', 'healer'],
    unlockCondition: { type: 'badges', value: 30 },
    rarity: 'epic'
  },
  cosmic_dust: {
    id: 'cosmic_dust',
    name: 'Poussiere cosmique',
    icon: '🌌',
    cssClass: 'effect-cosmic',
    unlockCondition: { type: 'level', value: 25 },
    rarity: 'epic'
  },

  // Legendaires
  rainbow: {
    id: 'rainbow',
    name: 'Arc-en-ciel',
    icon: '🌈',
    cssClass: 'effect-rainbow',
    unlockCondition: { type: 'level', value: 35 },
    rarity: 'mythic',
    animated: true
  },
  phoenix_flames: {
    id: 'phoenix_flames',
    name: 'Flammes du phoenix',
    icon: '🔥',
    cssClass: 'effect-phoenix',
    unlockCondition: { type: 'level', value: 45 },
    rarity: 'mythic',
    animated: true
  }
};

// ===================
// ACCESSOIRES - BADGES/EMBLEMES
// ===================
export const EMBLEMS = {
  none: {
    id: 'none',
    name: 'Aucun',
    icon: '❌',
    unlockCondition: { type: 'default' }
  },

  // Basiques
  star: {
    id: 'star',
    name: 'Etoile',
    icon: '⭐',
    unlockCondition: { type: 'level', value: 2 }
  },
  shield: {
    id: 'shield',
    name: 'Bouclier',
    icon: '🛡️',
    unlockCondition: { type: 'tasks', value: 25 }
  },
  heart: {
    id: 'heart',
    name: 'Coeur',
    icon: '❤️',
    unlockCondition: { type: 'streak', value: 7 }
  },

  // Achievements
  first_blood: {
    id: 'first_blood',
    name: 'Premier sang',
    icon: '🩸',
    unlockCondition: { type: 'tasks', value: 1 }
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran',
    icon: '🎖️',
    unlockCondition: { type: 'tasks', value: 100 },
    rarity: 'rare'
  },
  champion: {
    id: 'champion',
    name: 'Champion',
    icon: '🏆',
    unlockCondition: { type: 'level', value: 20 },
    rarity: 'rare'
  },

  // Speciaux
  team_spirit: {
    id: 'team_spirit',
    name: 'Esprit d\'equipe',
    icon: '🤝',
    unlockCondition: { type: 'challenges', value: 5 }
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    icon: '🎓',
    unlockCondition: { type: 'badges', value: 20 },
    rarity: 'rare'
  },
  legend: {
    id: 'legend',
    name: 'Legende',
    icon: '👑',
    unlockCondition: { type: 'level', value: 50 },
    rarity: 'mythic'
  }
};

// ===================
// ARRIERE-PLANS
// ===================
export const BACKGROUNDS = {
  default: {
    id: 'default',
    name: 'Standard',
    gradient: 'from-slate-800 to-slate-900',
    unlockCondition: { type: 'default' }
  },
  forest_bg: {
    id: 'forest_bg',
    name: 'Foret',
    gradient: 'from-green-900 to-emerald-950',
    unlockCondition: { type: 'level', value: 5 }
  },
  castle: {
    id: 'castle',
    name: 'Chateau',
    gradient: 'from-stone-700 to-stone-900',
    unlockCondition: { type: 'level', value: 10 }
  },
  dungeon: {
    id: 'dungeon',
    name: 'Donjon',
    gradient: 'from-zinc-800 to-neutral-950',
    unlockCondition: { type: 'level', value: 15 }
  },
  volcano: {
    id: 'volcano',
    name: 'Volcan',
    gradient: 'from-orange-900 to-red-950',
    unlockCondition: { type: 'streak', value: 30 },
    rarity: 'rare'
  },
  sky: {
    id: 'sky',
    name: 'Ciel',
    gradient: 'from-sky-600 to-blue-900',
    unlockCondition: { type: 'level', value: 20 }
  },
  void_bg: {
    id: 'void_bg',
    name: 'Vide',
    gradient: 'from-purple-950 to-black',
    unlockCondition: { type: 'level', value: 30 },
    rarity: 'epic'
  },
  celestial_bg: {
    id: 'celestial_bg',
    name: 'Celeste',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    unlockCondition: { type: 'level', value: 40 },
    rarity: 'mythic',
    animated: true
  }
};

// ===================
// FONCTIONS UTILITAIRES
// ===================

/**
 * Verifie si un element est debloque selon les stats utilisateur
 */
export const isUnlocked = (item, userStats) => {
  if (!item?.unlockCondition) return true;

  const { type, value, event } = item.unlockCondition;

  switch (type) {
    case 'default':
      return true;
    case 'level':
      return (userStats?.level || 1) >= value;
    case 'xp':
      return (userStats?.totalXp || 0) >= value;
    case 'tasks':
      return (userStats?.tasksCompleted || 0) >= value;
    case 'badges':
      return (userStats?.badgesCount || 0) >= value;
    case 'streak':
      return (userStats?.currentStreak || 0) >= value;
    case 'challenges':
      return (userStats?.challengesCompleted || 0) >= value;
    case 'special':
      // Pour les evenements speciaux
      return userStats?.specialEvents?.includes(event);
    default:
      return false;
  }
};

/**
 * Obtient le texte de condition de deblocage
 */
export const getUnlockText = (item) => {
  if (!item?.unlockCondition) return 'Disponible';

  const { type, value, event } = item.unlockCondition;

  switch (type) {
    case 'default':
      return 'Disponible';
    case 'level':
      return `Niveau ${value} requis`;
    case 'xp':
      return `${value.toLocaleString()} XP requis`;
    case 'tasks':
      return `${value} taches completees`;
    case 'badges':
      return `${value} badges obtenus`;
    case 'streak':
      return `Serie de ${value} jours`;
    case 'challenges':
      return `${value} defis completes`;
    case 'special':
      return `Evenement special: ${event}`;
    default:
      return 'Verrouille';
  }
};

/**
 * Obtient la progression vers le deblocage
 */
export const getUnlockProgress = (item, userStats) => {
  if (!item?.unlockCondition) return 100;

  const { type, value } = item.unlockCondition;

  let current = 0;
  switch (type) {
    case 'default':
      return 100;
    case 'level':
      current = userStats?.level || 1;
      break;
    case 'xp':
      current = userStats?.totalXp || 0;
      break;
    case 'tasks':
      current = userStats?.tasksCompleted || 0;
      break;
    case 'badges':
      current = userStats?.badgesCount || 0;
      break;
    case 'streak':
      current = userStats?.currentStreak || 0;
      break;
    case 'challenges':
      current = userStats?.challengesCompleted || 0;
      break;
    default:
      return 0;
  }

  return Math.min(100, Math.round((current / value) * 100));
};

/**
 * Obtient tous les elements d'une categorie avec leur statut de deblocage
 */
export const getCategoryItems = (category, userStats) => {
  let items = {};

  switch (category) {
    case 'classes':
      items = CHARACTER_CLASSES;
      break;
    case 'colors':
      items = COLOR_VARIANTS;
      break;
    case 'headgear':
      items = HEADGEAR;
      break;
    case 'weapons':
      items = WEAPONS;
      break;
    case 'companions':
      items = COMPANIONS;
      break;
    case 'effects':
      items = EFFECTS;
      break;
    case 'emblems':
      items = EMBLEMS;
      break;
    case 'backgrounds':
      items = BACKGROUNDS;
      break;
    default:
      return [];
  }

  return Object.values(items).map(item => ({
    ...item,
    unlocked: isUnlocked(item, userStats),
    unlockText: getUnlockText(item),
    unlockProgress: getUnlockProgress(item, userStats)
  }));
};

/**
 * Obtient les statistiques de deblocage par categorie
 */
export const getUnlockStats = (userStats) => {
  const categories = ['classes', 'colors', 'headgear', 'weapons', 'companions', 'effects', 'emblems', 'backgrounds'];

  const stats = {};
  categories.forEach(category => {
    const items = getCategoryItems(category, userStats);
    stats[category] = {
      total: items.length,
      unlocked: items.filter(i => i.unlocked).length
    };
  });

  // Total global
  stats.total = {
    total: Object.values(stats).reduce((sum, s) => sum + (s.total || 0), 0),
    unlocked: Object.values(stats).reduce((sum, s) => sum + (s.unlocked || 0), 0)
  };

  return stats;
};

/**
 * Configuration d'avatar par defaut
 */
export const DEFAULT_AVATAR_CONFIG = {
  class: 'wizard',
  color: 'default',
  headgear: 'none',
  weapon: 'wooden_staff',
  companion: 'none',
  effect: 'none',
  emblem: 'none',
  background: 'default'
};

export default {
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
  getUnlockStats,
  DEFAULT_AVATAR_CONFIG
};

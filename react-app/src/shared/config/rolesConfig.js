// ==========================================
// 📁 react-app/src/shared/config/rolesConfig.js
// CONFIGURATION DES RÔLES SYNERGIA - FICHIER MANQUANT CRÉÉ
// ==========================================

/**
 * 🎭 CONFIGURATION COMPLÈTE DES RÔLES SYNERGIA
 * Basée sur les rôles identifiés dans l'analyse métier
 */
export const rolesConfig = {
  // 🕹️ RÔLES ESCAPE GAME
  gamemaster: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🕹️',
    color: 'bg-purple-500',
    description: 'Animateur des sessions de jeu et garant de l\'expérience client',
    difficulty: 'Expert',
    permissions: ['session_management', 'customer_interaction', 'game_animation'],
    taskCount: 120,
    xpMultiplier: 1.5
  },

  // 🛠️ MAINTENANCE ET TECHNIQUE
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🛠️',
    color: 'bg-orange-500',
    description: 'Responsable de l\'état et la sécurité des équipements',
    difficulty: 'Moyen',
    permissions: ['maintenance_access', 'repair_management', 'equipment_control'],
    taskCount: 85,
    xpMultiplier: 1.2
  },

  // ⭐ RÉPUTATION ET AVIS
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Surveillance et amélioration de l\'image de marque',
    difficulty: 'Moyen',
    permissions: ['reputation_management', 'review_response', 'customer_feedback'],
    taskCount: 92,
    xpMultiplier: 1.3
  },

  // 📦 STOCKS ET MATÉRIEL
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires et approvisionnements',
    difficulty: 'Facile',
    permissions: ['inventory_management', 'stock_control', 'supplier_relations'],
    taskCount: 78,
    xpMultiplier: 1.0
  },

  // 🗓️ ORGANISATION INTERNE
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '🗓️',
    color: 'bg-purple-500',
    description: 'Coordination des équipes et gestion RH',
    difficulty: 'Avancé',
    permissions: ['planning_management', 'hr_access', 'team_coordination'],
    taskCount: 110,
    xpMultiplier: 1.4
  },

  // 🎨 CRÉATION DE CONTENU
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichage',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de supports visuels et communication',
    difficulty: 'Moyen',
    permissions: ['content_creation', 'design_access', 'visual_communication'],
    taskCount: 95,
    xpMultiplier: 1.3
  },

  // 🎓 FORMATION ET MENTORAT
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes',
    difficulty: 'Avancé',
    permissions: ['training_access', 'mentoring_rights', 'skill_development'],
    taskCount: 100,
    xpMultiplier: 1.4
  },

  // 🤝 PARTENARIATS
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement des relations extérieures',
    difficulty: 'Expert',
    permissions: ['partnership_management', 'networking_access', 'external_relations'],
    taskCount: 88,
    xpMultiplier: 1.5
  },

  // 📱 COMMUNICATION
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📱',
    color: 'bg-cyan-500',
    description: 'Animation des réseaux sociaux et communication digitale',
    difficulty: 'Moyen',
    permissions: ['social_media_access', 'communication_rights', 'digital_marketing'],
    taskCount: 103,
    xpMultiplier: 1.3
  },

  // 💼 RELATIONS B2B
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gestion des relations entreprises et commerciales',
    difficulty: 'Expert',
    permissions: ['b2b_management', 'quote_generation', 'enterprise_relations'],
    taskCount: 75,
    xpMultiplier: 1.6
  }
};

/**
 * 📊 NIVEAUX DE PROGRESSION DANS LES RÔLES
 */
export const roleLevels = {
  novice: {
    id: 'novice',
    name: 'Novice',
    xpRequired: 0,
    color: 'bg-gray-400',
    description: 'Débutant dans le rôle'
  },
  apprenti: {
    id: 'apprenti',
    name: 'Apprenti',
    xpRequired: 100,
    color: 'bg-green-400',
    description: 'Compétences de base acquises'
  },
  competent: {
    id: 'competent',
    name: 'Compétent',
    xpRequired: 300,
    color: 'bg-blue-400',
    description: 'Maîtrise solide du rôle'
  },
  expert: {
    id: 'expert',
    name: 'Expert',
    xpRequired: 600,
    color: 'bg-purple-400',
    description: 'Expertise reconnue'
  },
  maitre: {
    id: 'maitre',
    name: 'Maître',
    xpRequired: 1000,
    color: 'bg-yellow-400',
    description: 'Maîtrise exceptionnelle'
  }
};

/**
 * 🎯 DIFFICULTÉS DES RÔLES
 */
export const roleDifficulties = {
  'Facile': {
    label: 'Facile',
    color: 'text-green-600',
    xpMultiplier: 1.0,
    description: 'Accessible aux débutants'
  },
  'Moyen': {
    label: 'Moyen',
    color: 'text-yellow-600',
    xpMultiplier: 1.2,
    description: 'Requiert de l\'expérience'
  },
  'Avancé': {
    label: 'Avancé',
    color: 'text-orange-600',
    xpMultiplier: 1.4,
    description: 'Pour utilisateurs expérimentés'
  },
  'Expert': {
    label: 'Expert',
    color: 'text-red-600',
    xpMultiplier: 1.6,
    description: 'Niveau expert requis'
  }
};

/**
 * 🔧 FONCTIONS UTILITAIRES
 */

// Obtenir un rôle par son ID
export const getRoleById = (roleId) => {
  return rolesConfig[roleId] || null;
};

// Obtenir tous les rôles d'une difficulté donnée
export const getRolesByDifficulty = (difficulty) => {
  return Object.values(rolesConfig).filter(role => role.difficulty === difficulty);
};

// Obtenir les rôles ayant une permission spécifique
export const getRolesByPermission = (permission) => {
  return Object.values(rolesConfig).filter(role => 
    role.permissions.includes(permission)
  );
};

// Calculer l'XP total nécessaire pour atteindre un niveau
export const getXPForLevel = (level) => {
  return roleLevels[level]?.xpRequired || 0;
};

// Calculer le niveau d'un rôle selon l'XP
export const calculateRoleLevel = (xp) => {
  const levels = Object.values(roleLevels).sort((a, b) => b.xpRequired - a.xpRequired);
  
  for (const level of levels) {
    if (xp >= level.xpRequired) {
      return level;
    }
  }
  
  return roleLevels.novice;
};

// Obtenir la liste de tous les IDs de rôles
export const getAllRoleIds = () => {
  return Object.keys(rolesConfig);
};

// Obtenir la liste de tous les rôles
export const getAllRoles = () => {
  return Object.values(rolesConfig);
};

/**
 * 📋 EXPORT PAR DÉFAUT
 */
export default rolesConfig;

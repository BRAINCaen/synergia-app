// ==========================================
// 📁 react-app/src/core/services/badgeDefinitions.js
// DÉFINITIONS COMPLÈTES DES BADGES SYNERGIA
// ==========================================

/**
 * 🏆 DÉFINITIONS COMPLÈTES DES BADGES
 * Compatible avec le nouveau système Firebase corrigé
 */
export const BADGE_DEFINITIONS = {
  
  // 🎯 BADGES GÉNÉRAUX & PREMIÈRE UTILISATION
  first_login: {
    id: 'first_login',
    name: 'Bienvenue !',
    description: 'Première connexion à Synergia',
    icon: '👋',
    rarity: 'common',
    category: 'general',
    xpReward: 10,
    autoUnlock: true,
    condition: (stats) => true // Toujours débloquer à la première connexion
  },

  profile_completed: {
    id: 'profile_completed',
    name: 'Profil Complet',
    description: 'Profil utilisateur entièrement rempli',
    icon: '👤',
    rarity: 'common',
    category: 'general',
    xpReward: 25,
    condition: (stats) => {
      return stats.profile?.completeness >= 80;
    }
  },

  // 🚀 BADGES PRODUCTIVITÉ & TÂCHES
  first_task: {
    id: 'first_task',
    name: 'Premier Pas',
    description: 'Première tâche créée',
    icon: '✅',
    rarity: 'common',
    category: 'productivity',
    xpReward: 15,
    condition: (stats) => {
      return stats.tasksCreated >= 1;
    }
  },

  task_completer: {
    id: 'task_completer',
    name: 'Finisseur',
    description: 'Première tâche complétée',
    icon: '🎯',
    rarity: 'common',
    category: 'productivity',
    xpReward: 20,
    condition: (stats) => {
      return stats.tasksCompleted >= 1;
    }
  },

  task_enthusiast: {
    id: 'task_enthusiast',
    name: 'Enthousiaste',
    description: 'Compléter 5 tâches',
    icon: '🔥',
    rarity: 'uncommon',
    category: 'productivity',
    xpReward: 50,
    condition: (stats) => {
      return stats.tasksCompleted >= 5;
    }
  },

  task_expert: {
    id: 'task_expert',
    name: 'Expert',
    description: 'Compléter 25 tâches',
    icon: '⚡',
    rarity: 'rare',
    category: 'productivity',
    xpReward: 100,
    condition: (stats) => {
      return stats.tasksCompleted >= 25;
    }
  },

  task_master: {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Compléter 100 tâches',
    icon: '👑',
    rarity: 'epic',
    category: 'productivity',
    xpReward: 250,
    condition: (stats) => {
      return stats.tasksCompleted >= 100;
    }
  },

  productivity_legend: {
    id: 'productivity_legend',
    name: 'Légende de Productivité',
    description: 'Compléter 500 tâches',
    icon: '🏆',
    rarity: 'legendary',
    category: 'productivity',
    xpReward: 1000,
    condition: (stats) => {
      return stats.tasksCompleted >= 500;
    }
  },

  // 📈 BADGES NIVEAUX & PROGRESSION
  level_5: {
    id: 'level_5',
    name: 'Niveau 5',
    description: 'Atteindre le niveau 5',
    icon: '🌟',
    rarity: 'uncommon',
    category: 'progression',
    xpReward: 75,
    condition: (stats) => {
      return stats.level >= 5;
    }
  },

  level_10: {
    id: 'level_10',
    name: 'Niveau 10',
    description: 'Atteindre le niveau 10',
    icon: '💎',
    rarity: 'rare',
    category: 'progression',
    xpReward: 150,
    condition: (stats) => {
      return stats.level >= 10;
    }
  },

  level_25: {
    id: 'level_25',
    name: 'Expert Synergia',
    description: 'Atteindre le niveau 25',
    icon: '🔥',
    rarity: 'epic',
    category: 'progression',
    xpReward: 400,
    condition: (stats) => {
      return stats.level >= 25;
    }
  },

  level_50: {
    id: 'level_50',
    name: 'Maître Synergia',
    description: 'Atteindre le niveau 50',
    icon: '⚡',
    rarity: 'legendary',
    category: 'progression',
    xpReward: 1500,
    condition: (stats) => {
      return stats.level >= 50;
    }
  },

  // 👥 BADGES COLLABORATION & ÉQUIPE
  team_player: {
    id: 'team_player',
    name: 'Joueur d\'Équipe',
    description: 'Rejoindre sa première équipe',
    icon: '🤝',
    rarity: 'common',
    category: 'collaboration',
    xpReward: 30,
    condition: (stats) => {
      return stats.teamsJoined >= 1;
    }
  },

  collaborator: {
    id: 'collaborator',
    name: 'Collaborateur',
    description: 'Participer à 5 projets collaboratifs',
    icon: '👥',
    rarity: 'uncommon',
    category: 'collaboration',
    xpReward: 80,
    condition: (stats) => {
      return stats.collaborativeProjects >= 5;
    }
  },

  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Aider 10 collègues différents',
    icon: '🎓',
    rarity: 'rare',
    category: 'collaboration',
    xpReward: 150,
    condition: (stats) => {
      return stats.helpedColleagues >= 10;
    }
  },

  // 💬 BADGES COMMUNICATION
  first_comment: {
    id: 'first_comment',
    name: 'Première Voix',
    description: 'Premier commentaire posté',
    icon: '💬',
    rarity: 'common',
    category: 'communication',
    xpReward: 15,
    condition: (stats) => {
      return stats.commentsPosted >= 1;
    }
  },

  communicator: {
    id: 'communicator',
    name: 'Communicateur',
    description: 'Poster 25 commentaires utiles',
    icon: '📢',
    rarity: 'uncommon',
    category: 'communication',
    xpReward: 70,
    condition: (stats) => {
      return stats.commentsPosted >= 25;
    }
  },

  discussion_leader: {
    id: 'discussion_leader',
    name: 'Leader de Discussion',
    description: 'Lancer 10 discussions importantes',
    icon: '🎤',
    rarity: 'rare',
    category: 'communication',
    xpReward: 120,
    condition: (stats) => {
      return stats.discussionsStarted >= 10;
    }
  },

  // 🔥 BADGES ENGAGEMENT & ASSIDUITÉ
  daily_user: {
    id: 'daily_user',
    name: 'Utilisateur Quotidien',
    description: 'Se connecter 7 jours consécutifs',
    icon: '📅',
    rarity: 'uncommon',
    category: 'engagement',
    xpReward: 60,
    condition: (stats) => {
      return stats.consecutiveDays >= 7;
    }
  },

  streak_champion: {
    id: 'streak_champion',
    name: 'Champion de Série',
    description: 'Se connecter 30 jours consécutifs',
    icon: '🔥',
    rarity: 'rare',
    category: 'engagement',
    xpReward: 200,
    condition: (stats) => {
      return stats.consecutiveDays >= 30;
    }
  },

  dedication_master: {
    id: 'dedication_master',
    name: 'Maître du Dévouement',
    description: 'Se connecter 100 jours consécutifs',
    icon: '💪',
    rarity: 'epic',
    category: 'engagement',
    xpReward: 500,
    condition: (stats) => {
      return stats.consecutiveDays >= 100;
    }
  },

  // 🎯 BADGES SYNERGIA SPÉCIALISÉS (ROLES)
  admin_rookie: {
    id: 'admin_rookie',
    name: 'Admin Débutant',
    description: 'Premiers pas en tant qu\'administrateur',
    icon: '🛡️',
    rarity: 'uncommon',
    category: 'synergia_roles',
    xpReward: 100,
    condition: (stats) => {
      return stats.adminActions >= 5;
    }
  },

  manager_expert: {
    id: 'manager_expert',
    name: 'Manager Expert',
    description: 'Gérer efficacement une équipe de 10+ personnes',
    icon: '👔',
    rarity: 'rare',
    category: 'synergia_roles',
    xpReward: 200,
    condition: (stats) => {
      return stats.teamSize >= 10 && stats.managementScore >= 80;
    }
  },

  developer_genius: {
    id: 'developer_genius',
    name: 'Génie du Développement',
    description: 'Excellence technique démontrée',
    icon: '💻',
    rarity: 'epic',
    category: 'synergia_roles',
    xpReward: 300,
    condition: (stats) => {
      return stats.codeQuality >= 90 && stats.projectsDelivered >= 5;
    }
  },

  sales_legend: {
    id: 'sales_legend',
    name: 'Légende de la Vente',
    description: 'Dépasser 200% des objectifs de vente',
    icon: '💰',
    rarity: 'legendary',
    category: 'synergia_roles',
    xpReward: 800,
    condition: (stats) => {
      return stats.salesPerformance >= 200;
    }
  },

  // 🎮 BADGES SPÉCIAUX & ÉVÉNEMENTS
  beta_tester: {
    id: 'beta_tester',
    name: 'Testeur Bêta',
    description: 'Participer à la phase bêta de Synergia',
    icon: '🧪',
    rarity: 'rare',
    category: 'special',
    xpReward: 250,
    condition: (stats) => {
      return stats.betaTester === true;
    }
  },

  bug_hunter: {
    id: 'bug_hunter',
    name: 'Chasseur de Bugs',
    description: 'Signaler 5 bugs critiques',
    icon: '🐛',
    rarity: 'uncommon',
    category: 'special',
    xpReward: 100,
    condition: (stats) => {
      return stats.bugsReported >= 5;
    }
  },

  feature_suggester: {
    id: 'feature_suggester',
    name: 'Suggéreur de Fonctionnalités',
    description: 'Proposer 3 améliorations adoptées',
    icon: '💡',
    rarity: 'rare',
    category: 'special',
    xpReward: 200,
    condition: (stats) => {
      return stats.featuresAdopted >= 3;
    }
  },

  anniversary_year_one: {
    id: 'anniversary_year_one',
    name: 'Un An avec Synergia',
    description: 'Célébrer sa première année sur Synergia',
    icon: '🎂',
    rarity: 'epic',
    category: 'special',
    xpReward: 365,
    condition: (stats) => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return stats.joinedAt && new Date(stats.joinedAt) <= oneYearAgo;
    }
  },

  // 🏆 BADGES ULTRA-RARES & LÉGENDAIRES
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Maintenir un score de qualité de 95%+ sur 50 tâches',
    icon: '✨',
    rarity: 'legendary',
    category: 'excellence',
    xpReward: 1000,
    condition: (stats) => {
      return stats.qualityScore >= 95 && stats.tasksCompleted >= 50;
    }
  },

  synergia_ambassador: {
    id: 'synergia_ambassador',
    name: 'Ambassadeur Synergia',
    description: 'Incarner parfaitement les valeurs de Synergia',
    icon: '🌟',
    rarity: 'legendary',
    category: 'excellence',
    xpReward: 2000,
    condition: (stats) => {
      return stats.ambassadorScore >= 100 && 
             stats.level >= 30 && 
             stats.teamContributions >= 50;
    }
  },

  innovation_pioneer: {
    id: 'innovation_pioneer',
    name: 'Pionnier de l\'Innovation',
    description: 'Révolutionner une méthode de travail de l\'entreprise',
    icon: '🚀',
    rarity: 'legendary',
    category: 'excellence',
    xpReward: 3000,
    condition: (stats) => {
      return stats.innovationImpact >= 95 && stats.adoptedInnovations >= 1;
    }
  }
};

/**
 * 📊 STATISTIQUES DES BADGES
 */
export const BADGE_STATS = {
  total: Object.keys(BADGE_DEFINITIONS).length,
  byRarity: {
    common: Object.values(BADGE_DEFINITIONS).filter(b => b.rarity === 'common').length,
    uncommon: Object.values(BADGE_DEFINITIONS).filter(b => b.rarity === 'uncommon').length,
    rare: Object.values(BADGE_DEFINITIONS).filter(b => b.rarity === 'rare').length,
    epic: Object.values(BADGE_DEFINITIONS).filter(b => b.rarity === 'epic').length,
    legendary: Object.values(BADGE_DEFINITIONS).filter(b => b.rarity === 'legendary').length
  },
  byCategory: {
    general: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'general').length,
    productivity: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'productivity').length,
    progression: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'progression').length,
    collaboration: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'collaboration').length,
    communication: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'communication').length,
    engagement: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'engagement').length,
    synergia_roles: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'synergia_roles').length,
    special: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'special').length,
    excellence: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'excellence').length
  },
  totalXpAvailable: Object.values(BADGE_DEFINITIONS).reduce((total, badge) => total + badge.xpReward, 0)
};

/**
 * 🎨 CONFIGURATION DES COULEURS PAR RARETÉ
 */
export const RARITY_CONFIG = {
  common: {
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    glow: false
  },
  uncommon: {
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    glow: false
  },
  rare: {
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    glow: true
  },
  epic: {
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
    glow: true
  },
  legendary: {
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
    glow: true,
    animation: 'pulse'
  }
};

export default BADGE_DEFINITIONS;

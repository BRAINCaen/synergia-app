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
      // Vérifier les champs essentiels du profil (structure réelle Firebase)
      const hasDisplayName = !!(stats.displayName && stats.displayName.trim());
      const hasEmail = !!(stats.email && stats.email.trim());
      const hasBioOrCompany = !!(stats.bio?.trim() || stats.profile?.bio?.trim() || stats.company?.trim());
      const hasContactInfo = !!(stats.phone?.trim() || stats.location?.trim());

      return hasDisplayName && hasEmail && hasBioOrCompany && hasContactInfo;
    }
  },

  // 🚀 BADGES PRODUCTIVITÉ & QUÊTES
  first_task: {
    id: 'first_task',
    name: 'Premier Pas',
    description: 'Première quête créée',
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
    description: 'Première quête complétée',
    icon: '🎯',
    rarity: 'common',
    category: 'productivity',
    xpReward: 20,
    condition: (stats) => {
      return stats.tasksCompleted >= 1;
    }
  },

  five_tasks: {
    id: 'five_tasks',
    name: '5 Quêtes',
    description: 'Compléter 5 quêtes',
    icon: '📋',
    rarity: 'common',
    category: 'productivity',
    xpReward: 35,
    condition: (stats) => {
      return stats.tasksCompleted >= 5;
    }
  },

  task_enthusiast: {
    id: 'task_enthusiast',
    name: 'Enthousiaste',
    description: 'Compléter 5 quêtes',
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
    description: 'Compléter 25 quêtes',
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
    name: 'Maître des Quêtes',
    description: 'Compléter 100 quêtes',
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
    description: 'Compléter 500 quêtes',
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
    description: 'Responsable d\'un·e stagiaire durant toute la période de stage ! Badge acquis au terme du stage si le·a stagiaire valide le mentorat !',
    icon: '👨‍🏫',
    rarity: 'rare',
    category: 'collaboration',
    xpReward: 300,
    condition: (stats) => {
      return stats.stagiairesValidated >= 1;
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

  // 🔥 BADGES ENGAGEMENT ÉQUILIBRÉ (QVCT)
  balanced_month: {
    id: 'balanced_month',
    name: 'Mois Équilibré',
    description: 'Se connecter au moins 4 jours par semaine pendant 1 mois',
    icon: '🌟',
    rarity: 'uncommon',
    category: 'engagement',
    xpReward: 60,
    condition: (stats) => {
      // 4 jours/semaine x 4 semaines = 16 jours minimum sur le mois
      return (stats.monthlyActiveDays || 0) >= 16;
    }
  },

  regular_analyst: {
    id: 'regular_analyst',
    name: 'Analyste Régulier',
    description: 'Consulter ses statistiques chaque semaine pendant 2 mois',
    icon: '📊',
    rarity: 'rare',
    category: 'engagement',
    xpReward: 200,
    condition: (stats) => {
      // 8 semaines consécutives de consultation des stats
      return (stats.weeklyStatsChecks || 0) >= 8;
    }
  },

  six_months_veteran: {
    id: 'six_months_veteran',
    name: 'Vétéran 6 Mois',
    description: '6 mois d\'ancienneté sur Synergia',
    icon: '🏅',
    rarity: 'epic',
    category: 'engagement',
    xpReward: 250,
    condition: (stats) => {
      if (!stats.joinedAt) return false;
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return new Date(stats.joinedAt) <= sixMonthsAgo;
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
    description: 'Maintenir un score de qualité de 95%+ sur 50 quêtes',
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
  },

  // 💖 BADGES BOOST - ENCOURAGEMENT D'ÉQUIPE
  first_boost: {
    id: 'first_boost',
    name: 'Premier Encouragement',
    description: 'Envoyer son premier Boost à un collègue',
    icon: '💖',
    rarity: 'common',
    category: 'boost',
    xpReward: 15,
    condition: (stats) => {
      return stats.boostsSent >= 1;
    }
  },

  boost_giver: {
    id: 'boost_giver',
    name: 'Donneur d\'Énergie',
    description: 'Envoyer 10 Boosts à ses collègues',
    icon: '⚡',
    rarity: 'uncommon',
    category: 'boost',
    xpReward: 50,
    condition: (stats) => {
      return stats.boostsSent >= 10;
    }
  },

  boost_champion: {
    id: 'boost_champion',
    name: 'Champion du Boost',
    description: 'Envoyer 50 Boosts à ses collègues',
    icon: '🌟',
    rarity: 'rare',
    category: 'boost',
    xpReward: 150,
    condition: (stats) => {
      return stats.boostsSent >= 50;
    }
  },

  boost_legend: {
    id: 'boost_legend',
    name: 'Légende du Boost',
    description: 'Envoyer 100 Boosts - Un vrai motivateur !',
    icon: '👑',
    rarity: 'epic',
    category: 'boost',
    xpReward: 300,
    condition: (stats) => {
      return stats.boostsSent >= 100;
    }
  },

  boost_received_first: {
    id: 'boost_received_first',
    name: 'Première Étoile',
    description: 'Recevoir son premier Boost',
    icon: '✨',
    rarity: 'common',
    category: 'boost',
    xpReward: 10,
    condition: (stats) => {
      return stats.boostsReceived >= 1;
    }
  },

  boost_popular: {
    id: 'boost_popular',
    name: 'Populaire',
    description: 'Recevoir 25 Boosts de ses collègues',
    icon: '🔥',
    rarity: 'rare',
    category: 'boost',
    xpReward: 100,
    condition: (stats) => {
      return stats.boostsReceived >= 25;
    }
  },

  boost_superstar: {
    id: 'boost_superstar',
    name: 'Superstar',
    description: 'Recevoir 100 Boosts - Tout le monde t\'adore !',
    icon: '🌈',
    rarity: 'legendary',
    category: 'boost',
    xpReward: 500,
    condition: (stats) => {
      return stats.boostsReceived >= 100;
    }
  },

  // 🎯 BADGES DÉFIS PERSONNELS
  first_challenge: {
    id: 'first_challenge',
    name: 'Premier Défi',
    description: 'Proposer son premier défi personnel',
    icon: '🎯',
    rarity: 'common',
    category: 'challenges',
    xpReward: 20,
    condition: (stats) => {
      return stats.challengesCreated >= 1;
    }
  },

  challenge_completer: {
    id: 'challenge_completer',
    name: 'Défi Relevé',
    description: 'Compléter son premier défi personnel',
    icon: '🏅',
    rarity: 'uncommon',
    category: 'challenges',
    xpReward: 50,
    condition: (stats) => {
      return stats.challengesCompleted >= 1;
    }
  },

  challenge_warrior: {
    id: 'challenge_warrior',
    name: 'Guerrier des Défis',
    description: 'Compléter 5 défis personnels',
    icon: '⚔️',
    rarity: 'rare',
    category: 'challenges',
    xpReward: 150,
    condition: (stats) => {
      return stats.challengesCompleted >= 5;
    }
  },

  challenge_master: {
    id: 'challenge_master',
    name: 'Maître des Défis',
    description: 'Compléter 15 défis personnels',
    icon: '🏆',
    rarity: 'epic',
    category: 'challenges',
    xpReward: 350,
    condition: (stats) => {
      return stats.challengesCompleted >= 15;
    }
  },

  challenge_legend: {
    id: 'challenge_legend',
    name: 'Légende des Défis',
    description: 'Compléter 50 défis personnels',
    icon: '👑',
    rarity: 'legendary',
    category: 'challenges',
    xpReward: 1000,
    condition: (stats) => {
      return stats.challengesCompleted >= 50;
    }
  },

  hard_challenge_completer: {
    id: 'hard_challenge_completer',
    name: 'Courageux',
    description: 'Compléter un défi difficile',
    icon: '💪',
    rarity: 'rare',
    category: 'challenges',
    xpReward: 100,
    condition: (stats) => {
      return stats.hardChallengesCompleted >= 1;
    }
  },

  // ⚔️ BADGES CAMPAGNES
  first_campaign: {
    id: 'first_campaign',
    name: 'Première Campagne',
    description: 'Participer à sa première campagne',
    icon: '🏰',
    rarity: 'common',
    category: 'campaigns',
    xpReward: 25,
    condition: (stats) => {
      return stats.campaignsJoined >= 1;
    }
  },

  campaign_veteran: {
    id: 'campaign_veteran',
    name: 'Vétéran de Campagne',
    description: 'Participer à 5 campagnes différentes',
    icon: '⚔️',
    rarity: 'uncommon',
    category: 'campaigns',
    xpReward: 100,
    condition: (stats) => {
      return stats.campaignsJoined >= 5;
    }
  },

  campaign_winner: {
    id: 'campaign_winner',
    name: 'Victorieux',
    description: 'Terminer une campagne avec succès',
    icon: '🏆',
    rarity: 'rare',
    category: 'campaigns',
    xpReward: 200,
    condition: (stats) => {
      return stats.campaignsCompleted >= 1;
    }
  },

  campaign_conqueror: {
    id: 'campaign_conqueror',
    name: 'Conquérant',
    description: 'Terminer 5 campagnes avec succès',
    icon: '👑',
    rarity: 'epic',
    category: 'campaigns',
    xpReward: 500,
    condition: (stats) => {
      return stats.campaignsCompleted >= 5;
    }
  },

  campaign_leader: {
    id: 'campaign_leader',
    name: 'Meneur de Campagne',
    description: 'Créer et mener une campagne jusqu\'à la victoire',
    icon: '🎖️',
    rarity: 'epic',
    category: 'campaigns',
    xpReward: 400,
    condition: (stats) => {
      return stats.campaignsLed >= 1;
    }
  },

  campaign_legend: {
    id: 'campaign_legend',
    name: 'Légende des Campagnes',
    description: 'Mener 10 campagnes victorieuses',
    icon: '🌟',
    rarity: 'legendary',
    category: 'campaigns',
    xpReward: 1500,
    condition: (stats) => {
      return stats.campaignsLed >= 10;
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
    excellence: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'excellence').length,
    boost: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'boost').length,
    challenges: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'challenges').length,
    campaigns: Object.values(BADGE_DEFINITIONS).filter(b => b.category === 'campaigns').length
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

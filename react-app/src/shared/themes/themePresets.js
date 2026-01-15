// ==========================================
// shared/themes/themePresets.js
// Configuration des 3 thèmes Synergia
// Gaming RPG | Corporate | Startup Tech
// ==========================================

/**
 * 🎮 THÈME GAMING RPG
 * Style immersif avec vocabulaire de jeu vidéo
 */
export const GAMING_THEME = {
  id: 'gaming',
  name: 'Gaming RPG',
  description: 'Expérience gamifiée avec vocabulaire de jeu vidéo',
  icon: '🎮',

  // Palette de couleurs
  colors: {
    primary: 'purple',
    secondary: 'pink',
    accent: 'yellow',
    background: {
      gradient: 'from-slate-950 via-purple-950/50 to-slate-950',
      card: 'bg-white/5',
      header: 'bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-cyan-500/80'
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-400',
      accent: 'text-purple-400'
    }
  },

  // Vocabulaire
  vocabulary: {
    // Navigation
    dashboard: 'Mon Aventure',
    tasks: 'Quêtes',
    projects: 'Conquêtes',
    team: 'Guilde',
    profile: 'Héros',
    settings: 'Paramètres',
    rewards: 'Butin',
    badges: 'Trophées',
    skills: 'Compétences',
    mentoring: 'Académie',
    pulse: 'Poste de Garde',
    infos: 'Le Crieur',
    tavern: 'Taverne',
    planning: 'Planning',
    hr: 'RH',
    challenges: 'Défis',

    // Actions
    complete: 'Accomplir',
    create: 'Forger',
    edit: 'Modifier',
    delete: 'Détruire',
    validate: 'Valider',
    reject: 'Rejeter',
    start: 'Lancer',
    finish: 'Terminer',

    // Gamification
    xp: 'XP',
    level: 'Niveau',
    rank: 'Rang',
    streak: 'Série',
    achievement: 'Haut fait',
    bonus: 'Bonus',
    multiplier: 'Multiplicateur',
    leaderboard: 'Classement',

    // Entités
    user: 'Aventurier',
    users: 'Aventuriers',
    admin: 'Maître du Jeu',
    manager: 'Chef de Guilde',
    employee: 'Membre',
    mentor: 'Sage',
    mentee: 'Apprenti',

    // Statuts
    pending: 'En attente',
    inProgress: 'En cours',
    completed: 'Accompli',
    failed: 'Échoué',
    active: 'Actif',
    inactive: 'Inactif',

    // Messages
    welcome: 'Bienvenue, Aventurier !',
    congratulations: 'Victoire !',
    levelUp: 'Niveau supérieur !',
    newBadge: 'Nouveau trophée débloqué !',
    questComplete: 'Quête accomplie !',
    xpGained: 'XP gagnés',

    // Sections
    myProgress: 'Ma Progression',
    teamProgress: 'Progression de la Guilde',
    dailyQuests: 'Quêtes du Jour',
    weeklyQuests: 'Quêtes de la Semaine',
    achievements: 'Hauts Faits',
    inventory: 'Inventaire'
  },

  // Emojis
  emojis: {
    task: '⚔️',
    project: '👑',
    badge: '🏆',
    xp: '✨',
    level: '⭐',
    team: '🛡️',
    user: '🎮',
    success: '🎉',
    warning: '⚠️',
    error: '💀',
    info: '📜'
  }
};

/**
 * 🏢 THÈME CORPORATE
 * Style professionnel et sobre
 */
export const CORPORATE_THEME = {
  id: 'corporate',
  name: 'Corporate',
  description: 'Interface professionnelle sobre et efficace',
  icon: '🏢',

  // Palette de couleurs
  colors: {
    primary: 'blue',
    secondary: 'gray',
    accent: 'green',
    background: {
      gradient: 'from-slate-100 via-gray-100 to-slate-200',
      card: 'bg-white',
      header: 'bg-gradient-to-r from-blue-600 to-blue-700'
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      accent: 'text-blue-600'
    }
  },

  // Vocabulaire
  vocabulary: {
    // Navigation
    dashboard: 'Tableau de Bord',
    tasks: 'Tâches',
    projects: 'Projets',
    team: 'Équipe',
    profile: 'Profil',
    settings: 'Paramètres',
    rewards: 'Avantages',
    badges: 'Distinctions',
    skills: 'Compétences',
    mentoring: 'Formation',
    pulse: 'Pointage',
    infos: 'Actualités',
    tavern: 'Espace Détente',
    planning: 'Planning',
    hr: 'Ressources Humaines',
    challenges: 'Objectifs',

    // Actions
    complete: 'Terminer',
    create: 'Créer',
    edit: 'Modifier',
    delete: 'Supprimer',
    validate: 'Approuver',
    reject: 'Refuser',
    start: 'Démarrer',
    finish: 'Finaliser',

    // Gamification
    xp: 'Points',
    level: 'Échelon',
    rank: 'Position',
    streak: 'Régularité',
    achievement: 'Réalisation',
    bonus: 'Prime',
    multiplier: 'Coefficient',
    leaderboard: 'Classement',

    // Entités
    user: 'Collaborateur',
    users: 'Collaborateurs',
    admin: 'Administrateur',
    manager: 'Responsable',
    employee: 'Employé',
    mentor: 'Tuteur',
    mentee: 'Stagiaire',

    // Statuts
    pending: 'En attente',
    inProgress: 'En cours',
    completed: 'Terminé',
    failed: 'Non réalisé',
    active: 'Actif',
    inactive: 'Inactif',

    // Messages
    welcome: 'Bienvenue sur votre espace',
    congratulations: 'Félicitations !',
    levelUp: 'Nouvel échelon atteint !',
    newBadge: 'Nouvelle distinction obtenue !',
    questComplete: 'Tâche terminée !',
    xpGained: 'Points acquis',

    // Sections
    myProgress: 'Mon Suivi',
    teamProgress: 'Performance Équipe',
    dailyQuests: 'Tâches du Jour',
    weeklyQuests: 'Objectifs Hebdomadaires',
    achievements: 'Réalisations',
    inventory: 'Mon Compte'
  },

  // Emojis (minimalistes)
  emojis: {
    task: '📋',
    project: '📁',
    badge: '🎖️',
    xp: '📊',
    level: '📈',
    team: '👥',
    user: '👤',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  }
};

/**
 * 🚀 THÈME STARTUP TECH
 * Style moderne et dynamique
 */
export const STARTUP_THEME = {
  id: 'startup',
  name: 'Startup Tech',
  description: 'Interface moderne et innovante',
  icon: '🚀',

  // Palette de couleurs
  colors: {
    primary: 'indigo',
    secondary: 'cyan',
    accent: 'orange',
    background: {
      gradient: 'from-gray-900 via-indigo-950/30 to-gray-900',
      card: 'bg-gray-800/50',
      header: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500'
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-400',
      accent: 'text-indigo-400'
    }
  },

  // Vocabulaire
  vocabulary: {
    // Navigation
    dashboard: 'Hub',
    tasks: 'Sprints',
    projects: 'Roadmap',
    team: 'Squad',
    profile: 'Mon Profil',
    settings: 'Config',
    rewards: 'Perks',
    badges: 'Achievements',
    skills: 'Stack',
    mentoring: 'Coaching',
    pulse: 'Check-in',
    infos: 'Feed',
    tavern: 'Chill Zone',
    planning: 'Agenda',
    hr: 'People Ops',
    challenges: 'OKRs',

    // Actions
    complete: 'Ship',
    create: 'Launch',
    edit: 'Itérer',
    delete: 'Archiver',
    validate: 'Approve',
    reject: 'Block',
    start: 'Kick-off',
    finish: 'Deliver',

    // Gamification
    xp: 'Points Impact',
    level: 'Grade',
    rank: 'Tier',
    streak: 'Momentum',
    achievement: 'Milestone',
    bonus: 'Bonus',
    multiplier: 'Boost',
    leaderboard: 'Rankings',

    // Entités
    user: 'Talent',
    users: 'Talents',
    admin: 'Super Admin',
    manager: 'Team Lead',
    employee: 'Team Member',
    mentor: 'Coach',
    mentee: 'Coachee',

    // Statuts
    pending: 'Backlog',
    inProgress: 'In Progress',
    completed: 'Shipped',
    failed: 'Blocked',
    active: 'Live',
    inactive: 'Paused',

    // Messages
    welcome: 'Hey ! Ready to ship ?',
    congratulations: 'Awesome work!',
    levelUp: 'Level Up !',
    newBadge: 'Achievement Unlocked !',
    questComplete: 'Sprint Complete !',
    xpGained: 'Impact Points',

    // Sections
    myProgress: 'My Impact',
    teamProgress: 'Squad Performance',
    dailyQuests: 'Daily Standup',
    weeklyQuests: 'Weekly Goals',
    achievements: 'Milestones',
    inventory: 'My Perks'
  },

  // Emojis (modernes)
  emojis: {
    task: '🎯',
    project: '🚀',
    badge: '💎',
    xp: '⚡',
    level: '📈',
    team: '🤝',
    user: '💼',
    success: '🔥',
    warning: '🚨',
    error: '💔',
    info: '💡'
  }
};

// Export de tous les thèmes
export const THEME_PRESETS = {
  gaming: GAMING_THEME,
  corporate: CORPORATE_THEME,
  startup: STARTUP_THEME
};

// Thème par défaut
export const DEFAULT_THEME = 'gaming';

// Liste des thèmes pour le sélecteur
export const THEME_LIST = [
  {
    id: 'gaming',
    name: 'Gaming RPG',
    icon: '🎮',
    description: 'Univers gamifié avec quêtes, XP et trophées',
    preview: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#eab308'
    }
  },
  {
    id: 'corporate',
    name: 'Corporate',
    icon: '🏢',
    description: 'Interface professionnelle sobre et efficace',
    preview: {
      primary: '#2563eb',
      secondary: '#6b7280',
      accent: '#22c55e'
    }
  },
  {
    id: 'startup',
    name: 'Startup Tech',
    icon: '🚀',
    description: 'Style moderne avec vocabulaire tech',
    preview: {
      primary: '#6366f1',
      secondary: '#06b6d4',
      accent: '#f97316'
    }
  }
];

/**
 * Récupérer un thème par son ID
 */
export const getThemeById = (themeId) => {
  return THEME_PRESETS[themeId] || THEME_PRESETS[DEFAULT_THEME];
};

/**
 * Récupérer une traduction du vocabulaire
 */
export const getVocabulary = (themeId, key) => {
  const theme = getThemeById(themeId);
  return theme.vocabulary[key] || key;
};

/**
 * Récupérer un emoji du thème
 */
export const getEmoji = (themeId, key) => {
  const theme = getThemeById(themeId);
  return theme.emojis[key] || '';
};

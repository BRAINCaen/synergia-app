// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS AVEC RÉCLAMATIONS D'OBJECTIFS
// ==========================================

export const ROUTES = {
  // Routes de base
  HOME: '/',
  LOGIN: '/login',
  
  // Pages principales
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  PROJECTS: '/projects',
  ANALYTICS: '/analytics',
  
  // Gamification RECONNECTÉES
  LEADERBOARD: '/leaderboard',
  BADGES: '/badges',
  GAMIFICATION: '/gamification',
  REWARDS: '/rewards',
  
  // 🎯 ROUTES DE PROGRESSION DE RÔLE
  ROLE_PROGRESSION: '/role/progression',
  ROLE_TASKS: '/role/tasks',
  ROLE_BADGES: '/role/badges',
  
  // 🚀 NOUVELLE ROUTE ESCAPE PROGRESSION
  ESCAPE_PROGRESSION: '/escape-progression',
  
  // Équipe & Social RECONNECTÉES
  TEAM: '/team',
  USERS: '/users',
  
  // Profil & Paramètres RECONNECTÉES
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Fonctionnalités spécialisées RECONNECTÉES
  ONBOARDING: '/onboarding',
  TIMETRACK: '/timetrack',
  
  // 🛡️ Routes Admin RECONNECTÉES
  ADMIN_TASK_VALIDATION: '/admin/task-validation',
  ADMIN_PROFILE_TEST: '/admin/profile-test',
  ADMIN_COMPLETE_TEST: '/admin/complete-test',
  
  // 🎁 NOUVELLE ROUTE ADMIN RÉCOMPENSES
  ADMIN_REWARDS: '/admin/rewards',
  
  // 🆕 ROUTES ADMIN COMPLÈTES
  ADMIN_DASHBOARD_TUTEUR: '/admin/dashboard-tuteur',
  ADMIN_ROLE_PERMISSIONS: '/admin/role-permissions',
  ADMIN_BADGES: '/admin/badges',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  
  // 🎯 NOUVELLE ROUTE ADMIN OBJECTIFS
  ADMIN_OBJECTIVE_VALIDATION: '/admin/objective-validation',
  
  // Pages de test et développement
  TEST_DASHBOARD: '/test/dashboard',
  TEST_FIREBASE: '/test/firebase',
  TEST_COMPLETE: '/test/complete',
  TEST_NOTIFICATIONS: '/test/notifications'
};

// 🗂️ COLLECTIONS FIREBASE (MISE À JOUR)
export const COLLECTIONS = {
  // Collections de base
  USERS: 'users',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  
  // Collections gamification
  USER_STATS: 'userStats',
  LEADERBOARD: 'leaderboard',
  BADGES: 'badges',
  USER_BADGES: 'userBadges',
  ACHIEVEMENTS: 'achievements',
  
  // Collections de validation
  TASK_VALIDATIONS: 'taskValidations',
  XP_REQUESTS: 'xpRequests',
  
  // 🎯 NOUVELLES COLLECTIONS OBJECTIFS
  OBJECTIVE_CLAIMS: 'objectiveClaims',
  OBJECTIVE_TEMPLATES: 'objectiveTemplates',
  USER_OBJECTIVES: 'userObjectives',
  
  // Collections système
  NOTIFICATIONS: 'notifications',
  SYSTEM_LOGS: 'systemLogs',
  APP_SETTINGS: 'appSettings',
  
  // Collections administration
  ADMIN_ACTIONS: 'adminActions',
  AUDIT_LOGS: 'auditLogs',
  PERMISSION_ROLES: 'permissionRoles'
};

// 🎯 STATUTS DES RÉCLAMATIONS D'OBJECTIFS
export const OBJECTIVE_CLAIM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// 🎯 TYPES D'OBJECTIFS
export const OBJECTIVE_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  SPECIAL: 'special',
  CHALLENGE: 'challenge'
};

// 🎯 CATÉGORIES D'OBJECTIFS
export const OBJECTIVE_CATEGORIES = {
  INNOVATION: 'innovation',
  FLEXIBILITY: 'flexibility',
  CUSTOMER_SERVICE: 'customer_service',
  TEAMWORK: 'teamwork',
  SECURITY: 'security',
  LEADERSHIP: 'leadership',
  MAINTENANCE: 'maintenance',
  MARKETING: 'marketing',
  RESPONSIBILITY: 'responsibility',
  DEDICATION: 'dedication',
  VERSATILITY: 'versatility',
  CREATIVITY: 'creativity'
};

// 🎯 PRIORITÉS DES RÉCLAMATIONS
export const CLAIM_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// 🏗️ STRUCTURE DE NAVIGATION MISE À JOUR
export const NAVIGATION_STRUCTURE = {
  main: {
    title: 'Principal',
    routes: [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊', priority: 0 },
      { path: ROUTES.TASKS, label: 'Tâches', icon: '✅', priority: 1 },
      { path: ROUTES.PROJECTS, label: 'Projets', icon: '📁', priority: 2 },
      { path: ROUTES.ANALYTICS, label: 'Analytics', icon: '📈', priority: 3 }
    ]
  },
  gamification: {
    title: 'Gamification',
    routes: [
      { path: ROUTES.GAMIFICATION, label: 'Objectifs', icon: '🎯', priority: 0 },
      { path: ROUTES.BADGES, label: 'Badges', icon: '🏆', priority: 1 },
      { path: ROUTES.LEADERBOARD, label: 'Classement', icon: '🏅', priority: 2 },
      { path: ROUTES.REWARDS, label: 'Récompenses', icon: '🎁', priority: 3 }
    ]
  },
  progression: {
    title: 'Progression de Rôle',
    routes: [
      { path: ROUTES.ROLE_PROGRESSION, label: 'Progression Rôle', icon: '🎯', priority: 0 },
      { path: ROUTES.ROLE_TASKS, label: 'Tâches par Rôle', icon: '📋', priority: 1 },
      { path: ROUTES.ROLE_BADGES, label: 'Badges Rôle', icon: '🏆', priority: 2 },
      { path: ROUTES.ESCAPE_PROGRESSION, label: 'Escape Progression', icon: '🚀', priority: 3 }
    ]
  },
  team: {
    title: 'Équipe & Social',
    routes: [
      { path: ROUTES.TEAM, label: 'Équipe', icon: '👥', priority: 0 },
      { path: ROUTES.USERS, label: 'Utilisateurs', icon: '👤', priority: 1 }
    ]
  },
  tools: {
    title: 'Outils',
    routes: [
      { path: ROUTES.ONBOARDING, label: 'Onboarding', icon: '📖', priority: 1 },
      { path: ROUTES.TIMETRACK, label: 'Pointeuse', icon: '⏰', priority: 2 },
      { path: ROUTES.PROFILE, label: 'Profil', icon: '👤', priority: 3 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 4 }
    ]
  },
  admin: {
    title: 'Administration',
    routes: [
      { path: ROUTES.ADMIN_DASHBOARD_TUTEUR, label: 'Dashboard Tuteur', icon: '👨‍🏫', priority: 0 },
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Tâches', icon: '🛡️', priority: 1 },
      { path: ROUTES.ADMIN_OBJECTIVE_VALIDATION, label: 'Validation Objectifs', icon: '🎯', priority: 2 },
      { path: ROUTES.ADMIN_COMPLETE_TEST, label: 'Test Complet', icon: '🧪', priority: 3 },
      { path: ROUTES.ADMIN_ROLE_PERMISSIONS, label: 'Permissions Rôles', icon: '🔐', priority: 4 },
      { path: ROUTES.ADMIN_REWARDS, label: 'Gestion Récompenses', icon: '🎁', priority: 5 },
      { path: ROUTES.ADMIN_BADGES, label: 'Gestion Badges', icon: '🏆', priority: 6 },
      { path: ROUTES.ADMIN_USERS, label: 'Gestion Utilisateurs', icon: '👥', priority: 7 },
      { path: ROUTES.ADMIN_ANALYTICS, label: 'Analytics Admin', icon: '📈', priority: 8 },
      { path: ROUTES.ADMIN_SETTINGS, label: 'Paramètres Admin', icon: '⚙️', priority: 9 }
    ]
  }
}

// 🎯 NAVIGATION PRINCIPALE (ordre d'affichage)
export const MAIN_NAVIGATION = [
  ...NAVIGATION_STRUCTURE.main.routes,
  ...NAVIGATION_STRUCTURE.gamification.routes,
  ...NAVIGATION_STRUCTURE.progression.routes,
  ...NAVIGATION_STRUCTURE.team.routes,
  ...NAVIGATION_STRUCTURE.tools.routes
];

// 🛡️ NAVIGATION ADMIN (ordre d'affichage)
export const ADMIN_NAVIGATION = [
  ...NAVIGATION_STRUCTURE.admin.routes
];

// 🔍 HELPER FUNCTIONS
export const getRouteByPath = (path) => {
  return Object.values(ROUTES).find(route => route === path);
};

export const getNavigationByCategory = (category) => {
  return NAVIGATION_STRUCTURE[category]?.routes || [];
};

export const isAdminRoute = (path) => {
  return path.startsWith('/admin/');
};

export const getRouteCategory = (path) => {
  for (const [category, structure] of Object.entries(NAVIGATION_STRUCTURE)) {
    if (structure.routes.some(route => route.path === path)) {
      return category;
    }
  }
  return 'unknown';
};

// 📊 ROUTES PAR CATÉGORIE (pour faciliter l'organisation)
export const ROUTES_BY_CATEGORY = {
  MAIN: [
    ROUTES.DASHBOARD,
    ROUTES.TASKS,
    ROUTES.PROJECTS,
    ROUTES.ANALYTICS
  ],
  GAMIFICATION: [
    ROUTES.GAMIFICATION,
    ROUTES.BADGES,
    ROUTES.LEADERBOARD,
    ROUTES.REWARDS
  ],
  PROGRESSION: [
    ROUTES.ROLE_PROGRESSION,
    ROUTES.ROLE_TASKS,
    ROUTES.ROLE_BADGES,
    ROUTES.ESCAPE_PROGRESSION
  ],
  TEAM: [
    ROUTES.TEAM,
    ROUTES.USERS
  ],
  TOOLS: [
    ROUTES.ONBOARDING,
    ROUTES.TIMETRACK,
    ROUTES.PROFILE,
    ROUTES.SETTINGS
  ],
  ADMIN: [
    ROUTES.ADMIN_DASHBOARD_TUTEUR,
    ROUTES.ADMIN_TASK_VALIDATION,
    ROUTES.ADMIN_OBJECTIVE_VALIDATION, // 🎯 NOUVEAU
    ROUTES.ADMIN_COMPLETE_TEST,
    ROUTES.ADMIN_ROLE_PERMISSIONS,
    ROUTES.ADMIN_REWARDS,
    ROUTES.ADMIN_BADGES,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_ANALYTICS,
    ROUTES.ADMIN_SETTINGS
  ]
};

// 🎯 CONFIGURATION DES OBJECTIFS
export const OBJECTIVE_CONFIG = {
  // Délais de traitement
  PROCESSING_TIME: {
    TARGET_HOURS: 24,
    WARNING_HOURS: 48,
    CRITICAL_HOURS: 72
  },
  
  // Limites de réclamation
  CLAIM_LIMITS: {
    DAILY_MAX: 5,
    WEEKLY_MAX: 10,
    MONTHLY_MAX: 25
  },
  
  // Bonus XP par catégorie
  CATEGORY_BONUS_XP: {
    [OBJECTIVE_CATEGORIES.INNOVATION]: 15,
    [OBJECTIVE_CATEGORIES.FLEXIBILITY]: 20,
    [OBJECTIVE_CATEGORIES.CUSTOMER_SERVICE]: 25,
    [OBJECTIVE_CATEGORIES.TEAMWORK]: 10,
    [OBJECTIVE_CATEGORIES.SECURITY]: 12,
    [OBJECTIVE_CATEGORIES.LEADERSHIP]: 30,
    [OBJECTIVE_CATEGORIES.MAINTENANCE]: 8,
    [OBJECTIVE_CATEGORIES.MARKETING]: 18,
    [OBJECTIVE_CATEGORIES.RESPONSIBILITY]: 22,
    [OBJECTIVE_CATEGORIES.DEDICATION]: 35,
    [OBJECTIVE_CATEGORIES.VERSATILITY]: 25,
    [OBJECTIVE_CATEGORIES.CREATIVITY]: 20
  }
};

// 🎯 MESSAGES DE NOTIFICATION POUR OBJECTIFS
export const OBJECTIVE_MESSAGES = {
  CLAIM_SUBMITTED: "Votre réclamation d'objectif a été soumise avec succès",
  CLAIM_APPROVED: "Félicitations ! Votre objectif a été validé",
  CLAIM_REJECTED: "Votre réclamation d'objectif a été rejetée",
  CLAIM_EXPIRED: "Votre réclamation d'objectif a expiré",
  INSUFFICIENT_EVIDENCE: "Preuves insuffisantes pour valider l'objectif",
  ALREADY_CLAIMED: "Cet objectif a déjà été réclamé",
  NOT_COMPLETED: "L'objectif n'est pas encore complété"
};

console.log('✅ Constants mis à jour avec système de réclamation d\'objectifs');

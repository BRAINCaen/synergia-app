// ==========================================
// 📁 react-app/src/core/constants.js  
// CONSTANTS AVEC ROUTE GODMOD AJOUTÉE
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
  
  // Gamification
  LEADERBOARD: '/leaderboard',
  BADGES: '/badges',
  GAMIFICATION: '/gamification',
  REWARDS: '/rewards',
  
  // Équipe & Social
  TEAM: '/team',
  USERS: '/users',
  
  // Profil & Paramètres
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Fonctionnalités spécialisées
  ONBOARDING: '/onboarding',
  TIMETRACK: '/timetrack',
  
  // 🆕 MODULE RH & PLANNING
  HR: '/hr',
  PLANNING: '/planning',
  PLANNING_ADVANCED: '/planning-advanced',

  // 👑 GODMOD - ACCÈS EXCLUSIF ADMIN PRINCIPAL
  GODMOD: '/godmod',
  
  // 🛡️ ROUTES ADMIN
  ADMIN: '/admin',
  ADMIN_TASK_VALIDATION: '/admin/task-validation',
  ADMIN_OBJECTIVE_VALIDATION: '/admin/objective-validation',
  ADMIN_COMPLETE_TEST: '/admin/complete-test',
  ADMIN_PROFILE_TEST: '/admin/profile-test',
  ADMIN_ROLE_PERMISSIONS: '/admin/role-permissions',
  ADMIN_REWARDS: '/admin/rewards',
  ADMIN_BADGES: '/admin/badges',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SYNC: '/admin/sync',
  ADMIN_DASHBOARD_TUTEUR: '/admin/dashboard-tuteur',
  ADMIN_DASHBOARD_MANAGER: '/admin/dashboard-manager',
  ADMIN_INTERVIEW: '/admin/interview',
  ADMIN_DEMO_CLEANER: '/admin/demo-cleaner',
  
  // Pages de test
  TEST_DASHBOARD: '/test/dashboard',
  TEST_FIREBASE: '/test/firebase',
  TEST_COMPLETE: '/test/complete',
  TEST_NOTIFICATIONS: '/test/notifications'
};

// 🗂️ COLLECTIONS FIREBASE
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  USER_STATS: 'user_stats',
  USER_BADGES: 'user_badges',
  LEADERBOARD: 'leaderboard',
  NOTIFICATIONS: 'notifications',
  REWARDS: 'rewards',
  BADGES: 'badges',
  ROLE_PERMISSIONS: 'rolePermissions',
  REWARD_REQUESTS: 'rewardRequests',
  TASK_VALIDATIONS: 'taskValidations',
  OBJECTIVE_CLAIMS: 'objectiveClaims',
  INTERVIEWS: 'interviews',
  SYSTEM_SETTINGS: 'systemSettings',
  
  // 🆕 COLLECTIONS RH
  HR_EMPLOYEES: 'hr_employees',
  HR_SCHEDULES: 'hr_schedules',
  HR_TIMESHEETS: 'hr_timesheets',
  HR_DOCUMENTS: 'hr_documents',
  HR_PAYROLL: 'hr_payroll'
};

// 🗂️ STRUCTURE DE NAVIGATION COMPLÈTE
export const NAVIGATION_STRUCTURE = {
  main: {
    label: 'Principal',
    routes: [
      { path: ROUTES.DASHBOARD, label: 'Tableau de bord', icon: '🏠', priority: 1 },
      { path: ROUTES.TASKS, label: 'Quêtes', icon: '⚔️', priority: 2 },
      { path: ROUTES.PROJECTS, label: 'Projets', icon: '📁', priority: 3 },
      { path: ROUTES.ANALYTICS, label: 'Analytics', icon: '📊', priority: 4 }
    ]
  },
  gamification: {
    label: 'Gamification',
    routes: [
      { path: ROUTES.GAMIFICATION, label: 'Vue d\'ensemble', icon: '🎮', priority: 1 },
      { path: ROUTES.BADGES, label: 'Mes Badges', icon: '🏆', priority: 2 },
      { path: ROUTES.LEADERBOARD, label: 'Classement', icon: '👑', priority: 3 },
      { path: ROUTES.REWARDS, label: 'Récompenses', icon: '🎁', priority: 4 }
    ]
  },
  progression: {
    label: 'Progression',
    routes: []
  },
  team: {
    label: 'Équipe',
    routes: [
      { path: ROUTES.TEAM, label: 'Mon Équipe', icon: '👥', priority: 1 }
    ]
  },
  tools: {
    label: 'Outils',
    routes: [
      { path: ROUTES.ONBOARDING, label: 'Formation', icon: '📚', priority: 1 },
      { path: ROUTES.TIMETRACK, label: 'Pointage', icon: '⏰', priority: 2 },
      { path: ROUTES.HR, label: 'RH', icon: '🏢', priority: 3 },
      { path: ROUTES.PLANNING, label: 'Planning', icon: '📅', priority: 4 },
      { path: ROUTES.PROFILE, label: 'Profil', icon: '👤', priority: 5 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 6 }
    ]
  },
  admin: {
    label: 'Administration',
    routes: [
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Quêtes', icon: '✅', priority: 1 },
      { path: ROUTES.ADMIN_OBJECTIVE_VALIDATION, label: 'Validation Objectifs', icon: '🎯', priority: 3 },
      { path: ROUTES.ADMIN_ROLE_PERMISSIONS, label: 'Permissions', icon: '🔐', priority: 4 },
      { path: ROUTES.ADMIN_REWARDS, label: 'Récompenses', icon: '🎁', priority: 5 },
      { path: ROUTES.ADMIN_BADGES, label: 'Badges', icon: '🏆', priority: 6 },
      { path: ROUTES.ADMIN_USERS, label: 'Utilisateurs', icon: '👥', priority: 7 },
      { path: ROUTES.ADMIN_ANALYTICS, label: 'Analytics', icon: '📊', priority: 8 },
      { path: ROUTES.ADMIN_SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 9 },
      { path: ROUTES.ADMIN_SYNC, label: 'Synchronisation', icon: '🔄', priority: 10 },
      { path: ROUTES.ADMIN_DASHBOARD_TUTEUR, label: 'Dashboard Tuteur', icon: '👨‍🏫', priority: 11 },
      { path: ROUTES.ADMIN_DASHBOARD_MANAGER, label: 'Dashboard Manager', icon: '📊', priority: 12 },
      { path: ROUTES.ADMIN_INTERVIEW, label: 'Gestion Entretiens', icon: '💼', priority: 13 },
      { path: ROUTES.ADMIN_DEMO_CLEANER, label: 'Nettoyage Données', icon: '🧹', priority: 14 }
    ]
  },
  // 👑 GODMOD - SECTION SPÉCIALE (visible uniquement pour alan.boehme61@gmail.com)
  godmod: {
    label: 'GODMOD',
    routes: [
      { path: ROUTES.GODMOD, label: 'GODMOD', icon: '👑', priority: 1, godModeOnly: true }
    ]
  }
};

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

// 👑 NAVIGATION GODMOD (ordre d'affichage - uniquement pour l'admin principal)
export const GODMOD_NAVIGATION = [
  ...NAVIGATION_STRUCTURE.godmod.routes
];

// 📊 ROUTES PAR CATÉGORIE
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
  TEAM: [
    ROUTES.TEAM,
    ROUTES.USERS
  ],
  TOOLS: [
    ROUTES.ONBOARDING,
    ROUTES.TIMETRACK,
    ROUTES.HR,
    ROUTES.PLANNING,
    ROUTES.PROFILE,
    ROUTES.SETTINGS
  ],
  ADMIN: [
    ROUTES.ADMIN_TASK_VALIDATION,
    ROUTES.ADMIN_OBJECTIVE_VALIDATION,
    ROUTES.ADMIN_COMPLETE_TEST,
    ROUTES.ADMIN_PROFILE_TEST,
    ROUTES.ADMIN_ROLE_PERMISSIONS,
    ROUTES.ADMIN_REWARDS,
    ROUTES.ADMIN_BADGES,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_ANALYTICS,
    ROUTES.ADMIN_SETTINGS,
    ROUTES.ADMIN_SYNC,
    ROUTES.ADMIN_DASHBOARD_TUTEUR,
    ROUTES.ADMIN_DASHBOARD_MANAGER,
    ROUTES.ADMIN_INTERVIEW,
    ROUTES.ADMIN_DEMO_CLEANER
  ],
  // 👑 GODMOD
  GODMOD: [
    ROUTES.GODMOD
  ]
};

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

export const isGodModRoute = (path) => {
  return path === '/godmod';
};

export const getRouteCategory = (path) => {
  for (const [category, structure] of Object.entries(NAVIGATION_STRUCTURE)) {
    if (structure.routes.some(route => route.path === path)) {
      return category;
    }
  }
  return null;
};

// Export default
export default {
  ROUTES,
  FIREBASE_COLLECTIONS,
  NAVIGATION_STRUCTURE,
  MAIN_NAVIGATION,
  ADMIN_NAVIGATION,
  GODMOD_NAVIGATION,
  ROUTES_BY_CATEGORY
};

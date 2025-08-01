// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS AVEC DASHBOARD TUTEUR
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
  ADMIN_DASHBOARD_TUTEUR: '/admin/dashboard-tuteur', // ← CHANGÉ
  ADMIN_ROLE_PERMISSIONS: '/admin/role-permissions',
  ADMIN_BADGES: '/admin/badges',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Pages test/dev
  TEST_DASHBOARD: '/test-dashboard'
}

// 📊 NAVIGATION STRUCTURE
export const NAVIGATION_STRUCTURE = {
  main: {
    title: 'Principal',
    routes: [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '🏠', priority: 1 },
      { path: ROUTES.TASKS, label: 'Tâches', icon: '✅', priority: 2 },
      { path: ROUTES.PROJECTS, label: 'Projets', icon: '📁', priority: 3 },
      { path: ROUTES.ANALYTICS, label: 'Analytics', icon: '📊', priority: 4 }
    ]
  },
  gamification: {
    title: 'Gamification',
    routes: [
      { path: ROUTES.GAMIFICATION, label: 'Gamification', icon: '🎮', priority: 1 },
      { path: ROUTES.BADGES, label: 'Badges', icon: '🏆', priority: 2 },
      { path: ROUTES.LEADERBOARD, label: 'Classement', icon: '🥇', priority: 3 },
      { path: ROUTES.REWARDS, label: 'Récompenses', icon: '🎁', priority: 4 }
    ]
  },
  progression: {
    title: 'Progression',
    routes: [
      { path: ROUTES.ROLE_PROGRESSION, label: 'Progression Rôles', icon: '🎯', priority: 1 },
      { path: ROUTES.ROLE_TASKS, label: 'Tâches par Rôle', icon: '📋', priority: 2 },
      { path: ROUTES.ROLE_BADGES, label: 'Badges Rôles', icon: '🏅', priority: 3 },
      { path: ROUTES.ESCAPE_PROGRESSION, label: 'Escape Progression', icon: '🔥', priority: 4 }
    ]
  },
  team: {
    title: 'Équipe & Social',
    routes: [
      { path: ROUTES.TEAM, label: 'Équipe', icon: '👥', priority: 1 },
      { path: ROUTES.USERS, label: 'Utilisateurs', icon: '👤', priority: 2 }
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
      { path: ROUTES.ADMIN_DASHBOARD_TUTEUR, label: 'Dashboard Tuteur', icon: '👨‍🏫', priority: 0 }, // ← CHANGÉ
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Tâches', icon: '🛡️', priority: 1 },
      { path: ROUTES.ADMIN_COMPLETE_TEST, label: 'Test Complet', icon: '🧪', priority: 2 },
      { path: ROUTES.ADMIN_ROLE_PERMISSIONS, label: 'Permissions Rôles', icon: '🔐', priority: 3 },
      { path: ROUTES.ADMIN_REWARDS, label: 'Gestion Récompenses', icon: '🎁', priority: 4 },
      { path: ROUTES.ADMIN_BADGES, label: 'Gestion Badges', icon: '🏆', priority: 5 },
      { path: ROUTES.ADMIN_USERS, label: 'Gestion Utilisateurs', icon: '👥', priority: 6 },
      { path: ROUTES.ADMIN_ANALYTICS, label: 'Analytics Admin', icon: '📈', priority: 7 },
      { path: ROUTES.ADMIN_SETTINGS, label: 'Paramètres Admin', icon: '⚙️', priority: 8 }
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
    ROUTES.ADMIN_DASHBOARD_TUTEUR, // ← CHANGÉ
    ROUTES.ADMIN_TASK_VALIDATION,
    ROUTES.ADMIN_COMPLETE_TEST,
    ROUTES.ADMIN_ROLE_PERMISSIONS,
    ROUTES.ADMIN_REWARDS,
    ROUTES.ADMIN_BADGES,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_ANALYTICS,
    ROUTES.ADMIN_SETTINGS
  ]
};

console.log('✅ Constants mis à jour avec Dashboard Tuteur');

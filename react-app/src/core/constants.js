// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS AVEC TOUTES LES ROUTES ADMIN AJOUTÉES
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
  
  // 🎯 ROUTES DE PROGRESSION DE RÔLE
  ROLE_PROGRESSION: '/role/progression',
  ROLE_TASKS: '/role/tasks',
  ROLE_BADGES: '/role/badges',
  
  // 🚀 ROUTE ESCAPE PROGRESSION
  ESCAPE_PROGRESSION: '/escape-progression',
  
  // Équipe & Social
  TEAM: '/team',
  USERS: '/users',
  
  // Profil & Paramètres
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Fonctionnalités spécialisées
  ONBOARDING: '/onboarding',
  TIMETRACK: '/timetrack',
  
  // 🛡️ ROUTES ADMIN COMPLÈTES - TOUTES AJOUTÉES !
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
  
  // Pages de test et développement
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
  SYSTEM_SETTINGS: 'systemSettings'
};

// 🗂️ STRUCTURE DE NAVIGATION COMPLÈTE
export const NAVIGATION_STRUCTURE = {
  main: {
    label: 'Principal',
    routes: [
      { path: ROUTES.DASHBOARD, label: 'Tableau de bord', icon: '🏠', priority: 1 },
      { path: ROUTES.TASKS, label: 'Tâches', icon: '✅', priority: 2 },
      { path: ROUTES.PROJECTS, label: 'Projets', icon: '📁', priority: 3 },
      { path: ROUTES.ANALYTICS, label: 'Analytics', icon: '📊', priority: 4 }
    ]
  },
  gamification: {
    label: 'Gamification',
    routes: [
      { path: ROUTES.GAMIFICATION, label: 'Vue d\'ensemble', icon: '🎮', priority: 1 },
      { path: ROUTES.BADGES, label: 'Mes Badges', icon: '🏆', priority: 2 },
      { path: ROUTES.LEADERBOARD, label: 'Classement', icon: '🏅', priority: 3 },
      { path: ROUTES.REWARDS, label: 'Récompenses', icon: '🎁', priority: 4 }
    ]
  },
  progression: {
    label: 'Progression',
    routes: [
      { path: ROUTES.ROLE_PROGRESSION, label: 'Progression Rôle', icon: '🎯', priority: 1 },
      { path: ROUTES.ESCAPE_PROGRESSION, label: 'Escape Game', icon: '🚀', priority: 2 }
    ]
  },
  team: {
    label: 'Équipe',
    routes: [
      { path: ROUTES.TEAM, label: 'Mon Équipe', icon: '👥', priority: 1 },
      { path: ROUTES.USERS, label: 'Utilisateurs', icon: '👤', priority: 2 }
    ]
  },
  tools: {
    label: 'Outils',
    routes: [
      { path: ROUTES.ONBOARDING, label: 'Intégration', icon: '📚', priority: 1 },
      { path: ROUTES.TIMETRACK, label: 'Pointeuse', icon: '⏰', priority: 2 },
      { path: ROUTES.PROFILE, label: 'Mon Profil', icon: '👨‍💼', priority: 3 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 4 }
    ]
  },
  admin: {
    label: 'Administration',
    routes: [
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Tâches', icon: '🛡️', priority: 1 },
      { path: ROUTES.ADMIN_OBJECTIVE_VALIDATION, label: 'Validation Objectifs', icon: '🎯', priority: 2 },
      { path: ROUTES.ADMIN_COMPLETE_TEST, label: 'Test Complet', icon: '🧪', priority: 3 },
      { path: ROUTES.ADMIN_ROLE_PERMISSIONS, label: 'Permissions Rôles', icon: '🔐', priority: 4 },
      { path: ROUTES.ADMIN_REWARDS, label: 'Gestion Récompenses', icon: '🎁', priority: 5 },
      { path: ROUTES.ADMIN_BADGES, label: 'Gestion Badges', icon: '🏆', priority: 6 },
      { path: ROUTES.ADMIN_USERS, label: 'Gestion Utilisateurs', icon: '👥', priority: 7 },
      { path: ROUTES.ADMIN_ANALYTICS, label: 'Analytics Admin', icon: '📈', priority: 8 },
      { path: ROUTES.ADMIN_SETTINGS, label: 'Paramètres Admin', icon: '⚙️', priority: 9 },
      { path: ROUTES.ADMIN_SYNC, label: 'Synchronisation', icon: '🔄', priority: 10 },
      { path: ROUTES.ADMIN_DASHBOARD_TUTEUR, label: 'Dashboard Tuteur', icon: '🎓', priority: 11 },
      { path: ROUTES.ADMIN_DASHBOARD_MANAGER, label: 'Dashboard Manager', icon: '📊', priority: 12 },
      { path: ROUTES.ADMIN_INTERVIEW, label: 'Gestion Entretiens', icon: '💼', priority: 13 },
      { path: ROUTES.ADMIN_DEMO_CLEANER, label: 'Nettoyage Données', icon: '🧹', priority: 14 }
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

export const getRouteCategory = (path) => {
  for (const [category, structure] of Object.entries(NAVIGATION_STRUCTURE)) {
    if (structure.routes.some(route => route.path === path)) {
      return category;
    }
  }
  return 'unknown';
};

// 🧹 CONFIGURATION NETTOYAGE DONNÉES DÉMO
export const DEMO_CLEANER_CONFIG = {
  DEMO_TASK_PATTERNS: [
    'Gagner votre premier badge',
    'Compléter votre profil',
    'Découvrir le tableau de bord',
    'Bienvenue dans Synergia',
    'onboarding',
    'formation'
  ],
  MAX_ASSIGNEES_THRESHOLD: 10,
  DEMO_USER_NAMES: [
    'Allan le BOSS',
    'Test User',
    'Demo User'
  ],
  INAPPROPRIATE_CONTENT: [
    'Prout'
  ]
};

// 🔐 USER ROLES & PERMISSIONS EXPANDED
export const USER_ROLE_HIERARCHY = {
  GUEST: { level: 0, permissions: ['read_basic'] },
  EMPLOYEE: { level: 1, permissions: ['read_basic', 'create_tasks', 'edit_own_tasks'] },
  MANAGER: { level: 2, permissions: ['read_basic', 'create_tasks', 'edit_tasks', 'assign_tasks', 'view_team_analytics'] },
  ADMIN: { level: 3, permissions: ['all'] }
};

// 🎨 UI THEME CONSTANTS
export const UI_THEMES = {
  LIGHT: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1F2937',
    textSecondary: '#6B7280'
  },
  DARK: {
    primary: '#60A5FA',
    secondary: '#A78BFA',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF'
  }
};

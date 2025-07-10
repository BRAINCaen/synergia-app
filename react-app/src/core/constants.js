// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS COMPLET AVEC TOUTES LES ROUTES FINALES
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
  
  // Gamification COMPLÈTE
  LEADERBOARD: '/leaderboard',
  BADGES: '/badges',
  GAMIFICATION: '/gamification',
  REWARDS: '/rewards',
  SHOP: '/shop', // 🆕 NOUVELLE ROUTE BOUTIQUE
  
  // Équipe & Social COMPLÈTE
  TEAM: '/team',
  USERS: '/users',
  
  // Profil & Paramètres COMPLÈTE
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Fonctionnalités spécialisées COMPLÈTE
  ONBOARDING: '/onboarding',
  TIMETRACK: '/timetrack',
  
  // 🆕 Routes du système de progression par rôles
  ROLE_PROGRESSION: '/role-progression',
  ROLE_TASKS: '/role-tasks',
  ROLE_BADGES: '/role-badges',
  
  // 🛡️ Routes Admin COMPLÈTE
  ADMIN_TASK_VALIDATION: '/admin/task-validation',
  ADMIN_PROFILE_TEST: '/admin/profile-test',
  ADMIN_COMPLETE_TEST: '/admin/complete-test',
  
  // Pages test/dev
  TEST_DASHBOARD: '/test-dashboard'
}

// 📊 NAVIGATION STRUCTURE COMPLÈTE POUR ORGANISATION
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
  progression: {
    title: 'Progression par Rôles',
    routes: [
      { path: ROUTES.ROLE_PROGRESSION, label: 'Vue d\'ensemble', icon: '📈', priority: 1 },
      { path: ROUTES.ROLE_TASKS, label: 'Tâches Spécialisées', icon: '🎯', priority: 2 },
      { path: ROUTES.ROLE_BADGES, label: 'Badges Exclusifs', icon: '🏆', priority: 3 }
    ]
  },
  gamification: {
    title: 'Gamification',
    routes: [
      { path: ROUTES.GAMIFICATION, label: 'Progression', icon: '🎮', priority: 1 },
      { path: ROUTES.BADGES, label: 'Badges', icon: '🏆', priority: 2 },
      { path: ROUTES.LEADERBOARD, label: 'Classement', icon: '🏅', priority: 3 },
      { path: ROUTES.REWARDS, label: 'Récompenses', icon: '🎁', priority: 4 },
      { path: ROUTES.SHOP, label: 'Boutique', icon: '🛍️', priority: 5 } // 🆕 AJOUTÉ
    ]
  },
  team: {
    title: 'Équipe',
    routes: [
      { path: ROUTES.TEAM, label: 'Mon Équipe', icon: '👥', priority: 1 },
      { path: ROUTES.USERS, label: 'Utilisateurs', icon: '👤', priority: 2 }
    ]
  },
  personal: {
    title: 'Personnel',
    routes: [
      { path: ROUTES.PROFILE, label: 'Mon Profil', icon: '👤', priority: 1 },
      { path: ROUTES.TIMETRACK, label: 'Temps', icon: '⏰', priority: 2 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 3 },
      { path: ROUTES.ONBOARDING, label: 'Aide', icon: '❓', priority: 4 }
    ]
  },
  admin: {
    title: 'Administration',
    routes: [
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation', icon: '✅', priority: 1 },
      { path: ROUTES.ADMIN_PROFILE_TEST, label: 'Test Profil', icon: '🧪', priority: 2 },
      { path: ROUTES.ADMIN_COMPLETE_TEST, label: 'Test Complet', icon: '🔧', priority: 3 }
    ]
  }
}

// 🎮 GAMIFICATION CONSTANTS
export const GAMIFICATION = {
  XP_PER_TASK: 50,
  XP_PER_PROJECT: 200,
  XP_PER_LOGIN: 10,
  LEVELS: {
    1: { min: 0, max: 100, title: 'Débutant' },
    2: { min: 100, max: 250, title: 'Apprenti' },
    3: { min: 250, max: 500, title: 'Confirmé' },
    4: { min: 500, max: 1000, title: 'Expert' },
    5: { min: 1000, max: 2000, title: 'Maître' },
    6: { min: 2000, max: 5000, title: 'Légendaire' }
  }
}

// 🛍️ SHOP CONSTANTS
export const SHOP = {
  CURRENCIES: {
    XP: 'xp',
    COINS: 'coins'
  },
  CATEGORIES: {
    COSMETIC: 'cosmetic',
    BOOSTER: 'booster',
    PHYSICAL: 'physical',
    EXCLUSIVE: 'exclusive'
  },
  RARITIES: {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    MYTHIC: 'mythic'
  }
}

// 🏆 BADGES CONSTANTS
export const BADGES = {
  TYPES: {
    ACHIEVEMENT: 'achievement',
    MILESTONE: 'milestone',
    SPECIAL: 'special',
    ROLE: 'role'
  },
  TRIGGERS: {
    TASK_COMPLETION: 'task_completion',
    PROJECT_COMPLETION: 'project_completion',
    LOGIN_STREAK: 'login_streak',
    XP_MILESTONE: 'xp_milestone',
    ROLE_PROGRESSION: 'role_progression'
  }
}

// 👥 ROLES CONSTANTS
export const ROLES = {
  GAME_MASTER: 'game_master',
  MAINTENANCE: 'maintenance',
  REPUTATION: 'reputation',
  LOGISTICS: 'logistics',
  ORGANIZATION: 'organization',
  CONTENT: 'content',
  MENTORING: 'mentoring',
  PARTNERSHIPS: 'partnerships',
  COMMUNICATION: 'communication',
  B2B: 'b2b',
  GAMIFICATION: 'gamification'
}

// 🎯 PERMISSIONS CONSTANTS
export const PERMISSIONS = {
  // Permissions générales
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_TASKS: 'manage_tasks',
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Permissions gamification
  MANAGE_BADGES: 'manage_badges',
  VALIDATE_TASKS: 'validate_tasks',
  MANAGE_XP: 'manage_xp',
  ACCESS_SHOP: 'access_shop',
  
  // Permissions équipe
  MANAGE_TEAM: 'manage_team',
  MANAGE_USERS: 'manage_users',
  ASSIGN_ROLES: 'assign_roles',
  
  // Permissions admin
  ADMIN_ACCESS: 'admin_access',
  SYSTEM_CONFIG: 'system_config',
  USER_MANAGEMENT: 'user_management',
  DATA_EXPORT: 'data_export'
}

// 🎨 UI CONSTANTS
export const UI = {
  COLORS: {
    PRIMARY: '#6366f1',
    SECONDARY: '#8b5cf6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  },
  ANIMATION_DURATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms'
  }
}

// 🔥 FIREBASE COLLECTIONS
export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  BADGES: 'badges',
  TEAMS: 'teams',
  NOTIFICATIONS: 'notifications',
  TASK_VALIDATION_REQUESTS: 'taskValidationRequests',
  SHOP_PURCHASES: 'shopPurchases',
  USER_INVENTORY: 'userInventory'
}

// 📱 APP METADATA
export const APP_INFO = {
  NAME: 'Synergia',
  VERSION: '3.5',
  DESCRIPTION: 'Application de gestion collaborative avec gamification',
  AUTHOR: 'Équipe Synergia',
  BUILD_STATUS: '95%' // Quasi-complet !
}

console.log('✅ Constants complets chargés - Synergia v3.5');

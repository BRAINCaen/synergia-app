// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS COMPLET avec toutes les routes ajoutées
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
  
  // Pages test/dev
  TEST_DASHBOARD: '/test-dashboard'
}

// 📊 NAVIGATION STRUCTURE POUR ORGANISATION
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
  social: {
    title: 'Social & Équipe',
    routes: [
      { path: ROUTES.TEAM, label: 'Équipe', icon: '👥', priority: 1 },
      { path: ROUTES.USERS, label: 'Utilisateurs', icon: '👤', priority: 2 }
    ]
  },
  user: {
    title: 'Utilisateur',
    routes: [
      { path: ROUTES.PROFILE, label: 'Profil', icon: '👤', priority: 1 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 2 },
      { path: ROUTES.ONBOARDING, label: 'Onboarding', icon: '🚀', priority: 3 },
      { path: ROUTES.TIMETRACK, label: 'Time Tracking', icon: '⏱️', priority: 4 }
    ]
  },
  admin: {
    title: 'Administration',
    routes: [
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Tâches', icon: '🛡️', priority: 1 },
      { path: ROUTES.ADMIN_COMPLETE_TEST, label: 'Test Admin', icon: '🔧', priority: 2 }
    ]
  }
}

// 🎯 TASK STATUS CONSTANTS
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  VALIDATION_PENDING: 'validation_pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  PAUSED: 'paused'
}

// 🏆 GAMIFICATION CONSTANTS
export const GAMIFICATION = {
  LEVELS: {
    BRONZE: { min: 0, max: 99, name: 'Bronze', color: '#CD7F32' },
    SILVER: { min: 100, max: 499, name: 'Argent', color: '#C0C0C0' },
    GOLD: { min: 500, max: 999, name: 'Or', color: '#FFD700' },
    PLATINUM: { min: 1000, max: 2499, name: 'Platine', color: '#E5E4E2' },
    DIAMOND: { min: 2500, max: 4999, name: 'Diamant', color: '#B9F2FF' },
    MASTER: { min: 5000, max: 9999, name: 'Maître', color: '#FF6B35' },
    GRANDMASTER: { min: 10000, max: 19999, name: 'Grand Maître', color: '#8B0000' },
    LEGEND: { min: 20000, max: 49999, name: 'Légende', color: '#9932CC' },
    MYTHIC: { min: 50000, max: 99999, name: 'Mythique', color: '#FF1493' },
    GODLIKE: { min: 100000, max: Infinity, name: 'Divin', color: '#00FFFF' }
  },
  
  XP_REWARDS: {
    TASK_EASY: 10,
    TASK_NORMAL: 25,
    TASK_HARD: 50,
    TASK_EXPERT: 100,
    DAILY_LOGIN: 5,
    FIRST_TASK_DAY: 15,
    STREAK_BONUS: 10,
    PERFECT_WEEK: 100,
    HELP_COLLEAGUE: 20,
    INNOVATION: 50
  },
  
  BADGE_TYPES: {
    ACHIEVEMENT: 'achievement',
    MILESTONE: 'milestone',
    SPECIAL: 'special',
    EVENT: 'event',
    SKILL: 'skill'
  }
}

// 🔐 USER ROLES CONSTANTS
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}

// 📱 APP CONSTANTS
export const APP_CONFIG = {
  NAME: 'Synergia',
  VERSION: '3.5.0',
  DESCRIPTION: 'Application de gestion collaborative',
  COMPANY: 'Synergia Team',
  
  // Limites
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  
  // Pagination
  ITEMS_PER_PAGE: 20,
  TASKS_PER_PAGE: 15,
  USERS_PER_PAGE: 25,
  
  // Temps
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  AUTO_SAVE_INTERVAL: 30 * 1000, // 30 secondes
  NOTIFICATION_TIMEOUT: 5000, // 5 secondes
  
  // Firebase Collections
  COLLECTIONS: {
    USERS: 'users',
    TASKS: 'tasks',
    PROJECTS: 'projects',
    TASK_VALIDATIONS: 'task_validations',
    BADGES: 'badges',
    USER_BADGES: 'user_badges',
    NOTIFICATIONS: 'notifications',
    TEAMS: 'teams',
    ANALYTICS: 'analytics',
    ONBOARDING: 'onboarding'
  }
}

// 🎨 UI CONSTANTS
export const UI_CONFIG = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#8B5CF6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4'
  },
  
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  },
  
  ANIMATIONS: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms'
  }
}

// 📊 ANALYTICS CONSTANTS
export const ANALYTICS_EVENTS = {
  // Navigation
  PAGE_VIEW: 'page_view',
  NAVIGATION_CLICK: 'navigation_click',
  
  // Tâches
  TASK_CREATE: 'task_create',
  TASK_UPDATE: 'task_update',
  TASK_COMPLETE: 'task_complete',
  TASK_DELETE: 'task_delete',
  TASK_SUBMIT_VALIDATION: 'task_submit_validation',
  
  // Gamification
  XP_EARNED: 'xp_earned',
  LEVEL_UP: 'level_up',
  BADGE_EARNED: 'badge_earned',
  
  // Admin
  ADMIN_TASK_VALIDATE: 'admin_task_validate',
  ADMIN_TASK_REJECT: 'admin_task_reject',
  ADMIN_BADGE_AWARD: 'admin_badge_award',
  
  // Erreurs
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error'
}

// 🔔 NOTIFICATION TYPES
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  BADGE_EARNED: 'badge_earned',
  TASK_VALIDATED: 'task_validated',
  TASK_REJECTED: 'task_rejected',
  LEVEL_UP: 'level_up',
  MENTION: 'mention'
}

// Export par défaut pour la compatibilité
export default {
  ROUTES,
  NAVIGATION_STRUCTURE,
  TASK_STATUS,
  GAMIFICATION,
  USER_ROLES,
  APP_CONFIG,
  UI_CONFIG,
  ANALYTICS_EVENTS,
  NOTIFICATION_TYPES
}

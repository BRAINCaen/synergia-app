// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS COMPLET avec toutes les routes ajoutées + ROUTES DE PROGRESSION
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
  
  // 🎯 ROUTES DE PROGRESSION DE RÔLE - NOUVELLES ROUTES AJOUTÉES
  ROLE_PROGRESSION: '/role/progression',
  ROLE_TASKS: '/role/tasks',
  ROLE_BADGES: '/role/badges',
  
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
  progression: {
    title: 'Progression de Rôle',
    routes: [
      { path: ROUTES.ROLE_PROGRESSION, label: 'Progression de Rôle', icon: '📈', priority: 1 },
      { path: ROUTES.ROLE_TASKS, label: 'Tâches de Rôle', icon: '🎯', priority: 2 },
      { path: ROUTES.ROLE_BADGES, label: 'Badges de Rôle', icon: '🏅', priority: 3 }
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
    MASTER: { min: 5000, max: 9999, name: 'Maître', color: '#FF6B6B' },
    GRANDMASTER: { min: 10000, max: Infinity, name: 'Grand Maître', color: '#FF0000' }
  },

  XP_REWARDS: {
    TASK_COMPLETION: 25,
    PROJECT_MILESTONE: 100,
    BADGE_EARNED: 50,
    DAILY_LOGIN: 10,
    WEEKLY_STREAK: 75,
    MONTHLY_ACHIEVEMENT: 200
  },

  BADGES: {
    CATEGORIES: {
      ACHIEVEMENT: 'achievement',
      MILESTONE: 'milestone', 
      SOCIAL: 'social',
      SPECIAL: 'special',
      SEASONAL: 'seasonal'
    },
    
    RARITIES: {
      COMMON: { name: 'Commun', color: '#9CA3AF', multiplier: 1 },
      UNCOMMON: { name: 'Peu commun', color: '#10B981', multiplier: 1.5 },
      RARE: { name: 'Rare', color: '#3B82F6', multiplier: 2 },
      EPIC: { name: 'Épique', color: '#8B5CF6', multiplier: 3 },
      LEGENDARY: { name: 'Légendaire', color: '#F59E0B', multiplier: 5 }
    }
  }
}

// 👥 USER ROLES CONSTANTS  
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  USER: 'user',
  GUEST: 'guest'
}

// 🔧 APP CONFIG
export const APP_CONFIG = {
  NAME: 'SYNERGIA',
  VERSION: '3.5',
  DESCRIPTION: 'Application de gestion collaborative avancée',
  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  
  TIMEOUTS: {
    API_REQUEST: 30000, // 30 secondes
    AUTH_TOKEN_REFRESH: 300000, // 5 minutes
    NOTIFICATION_DISPLAY: 5000 // 5 secondes
  },
  
  FEATURES: {
    REAL_TIME_NOTIFICATIONS: true,
    DARK_MODE: true,
    OFFLINE_MODE: false,
    PWA: true,
    ANALYTICS: true,
    
    // Fonctionnalités de gamification
    BADGES: true,
    LEADERBOARD: true,
    XP_SYSTEM: true,
    ACHIEVEMENTS: true,
    
    // Fonctionnalités sociales
    TEAM_CHAT: false,
    USER_PROFILES: true,
    COLLABORATION: true,
    
    // Fonctionnalités avancées
    AI_SUGGESTIONS: false,
    WORKFLOW_AUTOMATION: false,
    ADVANCED_REPORTING: true,
    
    // Fonctionnalités expérimentales
    VOICE_COMMANDS: false,
    AR_FEATURES: false,
    BLOCKCHAIN_INTEGRATION: false
  },
  
  STORAGE: {
    TOKEN_KEY: 'synergia_auth_token',
    USER_PREFERENCES: 'synergia_user_prefs',
    THEME_KEY: 'synergia_theme',
    LANGUAGE_KEY: 'synergia_language'
  },
  
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'https://api.synergia.app',
    VERSION: 'v1',
    ENDPOINTS: {
      AUTH: '/auth',
      USERS: '/users',
      TASKS: '/tasks',
      PROJECTS: '/projects',
      ANALYTICS: '/analytics',
      GAMIFICATION: '/gamification',
      ADMIN: '/admin',
      UPLOADS: '/uploads',
      NOTIFICATIONS: '/notifications',
      TEAMS: '/teams',
      ANALYTICS: '/analytics',
      ONBOARDING: '/onboarding'
    }
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

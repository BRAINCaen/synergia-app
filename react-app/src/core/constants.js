// ==========================================
// 📁 react-app/src/core/constants.js
// Constants COMPLET avec routes admin ajoutées
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
  
  // 🛡️ Routes Admin
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
      { path: ROUTES.LEADERBOARD, label: 'Classement', icon: '🏆', priority: 5 },
      { path: ROUTES.BADGES, label: 'Badges', icon: '🎖️', priority: 6 },
      { path: ROUTES.GAMIFICATION, label: 'Gamification', icon: '🎮', priority: 7 },
      { path: ROUTES.REWARDS, label: 'Récompenses', icon: '🎁', priority: 8 }
    ]
  },
  social: {
    title: 'Équipe',
    routes: [
      { path: ROUTES.TEAM, label: 'Équipe', icon: '👥', priority: 9 },
      { path: ROUTES.USERS, label: 'Utilisateurs', icon: '🧑‍💼', priority: 10 }
    ]
  },
  // 🛡️ SECTION ADMIN
  admin: {
    title: 'Administration',
    routes: [
      { 
        path: ROUTES.ADMIN_TASK_VALIDATION, 
        label: 'Validation Tâches', 
        icon: '✅', 
        priority: 11,
        description: 'Valider les soumissions',
        badge: 'ADMIN'
      },
      { 
        path: ROUTES.ADMIN_PROFILE_TEST, 
        label: 'Test Admin', 
        icon: '🧪', 
        priority: 12,
        description: 'Diagnostics permissions'
      },
      { 
        path: ROUTES.ADMIN_COMPLETE_TEST, 
        label: 'Test Complet', 
        icon: '🔬', 
        priority: 13,
        description: 'Tests système admin'
      }
    ]
  },
  tools: {
    title: 'Outils',
    routes: [
      { path: ROUTES.ONBOARDING, label: 'Intégration', icon: '🎯', priority: 14 },
      { path: ROUTES.TIMETRACK, label: 'Time Track', icon: '⏰', priority: 15 },
      { path: ROUTES.PROFILE, label: 'Profil', icon: '👤', priority: 16 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 17 }
    ]
  }
};

// 🎮 GAMIFICATION CONSTANTS
export const GAMIFICATION = {
  XP_PER_LEVEL: 100,
  STREAK_BONUS_MULTIPLIER: 1.2,
  BADGE_RARITIES: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  
  // Points XP par action
  XP_REWARDS: {
    TASK_COMPLETE: 25,
    PROJECT_CREATE: 50,
    TEAM_COLLABORATION: 15,
    DAILY_LOGIN: 5,
    STREAK_BONUS: 10
  },
  
  // Seuils de badges automatiques
  BADGE_THRESHOLDS: {
    TASKS_COMPLETED: [1, 5, 10, 25, 50, 100],
    PROJECTS_CREATED: [1, 3, 5, 10, 20],
    DAYS_STREAK: [3, 7, 14, 30, 60, 100],
    XP_EARNED: [100, 500, 1000, 2500, 5000, 10000]
  }
};

// 🛡️ ADMIN PERMISSIONS
export const ADMIN_PERMISSIONS = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  
  ACTIONS: {
    MANAGE_USERS: 'manage_users',
    MANAGE_BADGES: 'manage_badges',
    VALIDATE_TASKS: 'validate_tasks',
    VIEW_ANALYTICS: 'view_analytics',
    SYSTEM_CONFIG: 'system_config'
  }
};

// 📱 UI CONSTANTS
export const UI = {
  SIDEBAR_COLLAPSED_WIDTH: 64,
  SIDEBAR_EXPANDED_WIDTH: 256,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  
  COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4'
  },
  
  ANIMATIONS: {
    DURATION_FAST: 150,
    DURATION_NORMAL: 300,
    DURATION_SLOW: 500
  }
};

// 🔥 FIREBASE COLLECTIONS
export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  BADGES: 'badges',
  USER_BADGES: 'user_badges',
  TASK_VALIDATIONS: 'task_validations',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  ONBOARDING: 'onboarding'
};

// 📊 STATUS CONSTANTS
export const STATUS = {
  TASK: {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    VALIDATION_PENDING: 'validation_pending',
    COMPLETED: 'completed',
    REJECTED: 'rejected'
  },
  
  PROJECT: {
    PLANNING: 'planning',
    ACTIVE: 'active',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  USER: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  }
};

// 🎯 TASK DIFFICULTIES
export const TASK_DIFFICULTIES = {
  EASY: { value: 'easy', label: 'Facile', xp: 10, color: 'green' },
  NORMAL: { value: 'normal', label: 'Normal', xp: 25, color: 'blue' },
  HARD: { value: 'hard', label: 'Difficile', xp: 50, color: 'orange' },
  EXPERT: { value: 'expert', label: 'Expert', xp: 100, color: 'red' }
};

// 🏆 BADGE TYPES
export const BADGE_TYPES = {
  ACHIEVEMENT: 'achievement',
  MILESTONE: 'milestone',
  SPECIAL: 'special',
  SEASONAL: 'seasonal',
  CUSTOM: 'custom'
};

// ⚡ NOTIFICATION TYPES
export const NOTIFICATION_TYPES = {
  BADGE_EARNED: 'badge_earned',
  TASK_VALIDATED: 'task_validated',
  TASK_REJECTED: 'task_rejected',
  LEVEL_UP: 'level_up',
  PROJECT_INVITATION: 'project_invitation',
  SYSTEM: 'system'
};

export default {
  ROUTES,
  NAVIGATION_STRUCTURE,
  GAMIFICATION,
  ADMIN_PERMISSIONS,
  UI,
  COLLECTIONS,
  STATUS,
  TASK_DIFFICULTIES,
  BADGE_TYPES,
  NOTIFICATION_TYPES
};

// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS AVEC NOUVELLE ROUTE DEMO CLEANER
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
  
  // 🧹 NOUVELLE ROUTE NETTOYAGE DONNÉES DÉMO
  ADMIN_DEMO_CLEANER: '/admin/demo-cleaner',
  
  // Pages de test et développement
  TEST_DASHBOARD: '/test/dashboard',
  TEST_FIREBASE: '/test/firebase',
  TEST_COMPLETE: '/test/complete',
  TEST_NOTIFICATIONS: '/test/notifications'
};

// 🗂️ COLLECTIONS FIREBASE (MISE À JOUR)
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  USER_STATS: 'user_stats',
  USER_BADGES: 'user_badges',
  LEADERBOARD: 'leaderboard',
  NOTIFICATIONS: 'notifications',
  COMPANIES: 'companies',
  ROLE_PROGRESSION: 'role_progression',
  ROLE_TASKS: 'role_tasks',
  OBJECTIVES: 'objectives',
  REWARDS: 'rewards'
};

// 🎮 GAMIFICATION CONSTANTS
export const GAMIFICATION = {
  XP_PER_LEVEL: 100,
  LEVELS: {
    1: { name: 'Débutant', xp: 0, color: '#gray-500' },
    2: { name: 'Apprenti', xp: 100, color: '#green-500' },
    3: { name: 'Compétent', xp: 250, color: '#blue-500' },
    4: { name: 'Expert', xp: 500, color: '#purple-500' },
    5: { name: 'Maître', xp: 1000, color: '#orange-500' },
    6: { name: 'Légende', xp: 2000, color: '#red-500' },
    7: { name: 'Mythique', xp: 4000, color: '#pink-500' },
    8: { name: 'Divin', xp: 8000, color: '#indigo-500' },
    9: { name: 'Transcendant', xp: 15000, color: '#yellow-500' },
    10: { name: 'Synergia Master', xp: 30000, color: '#rainbow' }
  },
  TASK_XP: {
    LOW: 10,
    MEDIUM: 25,
    HIGH: 50,
    CRITICAL: 100
  },
  BADGE_TYPES: {
    PRODUCTIVITY: 'productivity',
    COLLABORATION: 'collaboration',
    LEADERSHIP: 'leadership',
    INNOVATION: 'innovation',
    SPECIAL: 'special',
    ONBOARDING: 'onboarding'
  }
};

// 🔐 RÔLES ET PERMISSIONS
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  READ_TASKS: 'read_tasks',
  CREATE_TASKS: 'create_tasks',
  EDIT_TASKS: 'edit_tasks',
  DELETE_TASKS: 'delete_tasks',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  ADMIN_ACCESS: 'admin_access'
};

// 📊 STATUTS DE TÂCHES
export const TASK_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  UNDER_REVIEW: 'under_review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// 🎯 PRIORITÉS
export const PRIORITY_LEVELS = {
  LOW: { value: 'low', label: 'Basse', color: 'green', xp: 10 },
  MEDIUM: { value: 'medium', label: 'Moyenne', color: 'yellow', xp: 25 },
  HIGH: { value: 'high', label: 'Haute', color: 'orange', xp: 50 },
  CRITICAL: { value: 'critical', label: 'Critique', color: 'red', xp: 100 }
};

// 🎨 COULEURS DU THÈME
export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#8B5CF6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4'
};

// 📱 BREAKPOINTS RESPONSIVE
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

// 🌐 CONFIGURATION APP
export const APP_CONFIG = {
  NAME: 'Synergia',
  VERSION: '3.5.3',
  DESCRIPTION: 'Application de gestion collaborative',
  DEFAULT_AVATAR: '/assets/default-avatar.png',
  ITEMS_PER_PAGE: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
};

// 🔔 TYPES DE NOTIFICATIONS
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  BADGE_UNLOCKED: 'badge_unlocked',
  LEVEL_UP: 'level_up',
  PROJECT_INVITATION: 'project_invitation',
  SYSTEM_UPDATE: 'system_update'
};

// 📊 NAVIGATION STRUCTURE MISE À JOUR
export const NAVIGATION_STRUCTURE = {
  main: {
    label: 'Principal',
    routes: [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '🏠', priority: 1 },
      { path: ROUTES.TASKS, label: 'Tâches', icon: '✅', priority: 2 },
      { path: ROUTES.PROJECTS, label: 'Projets', icon: '📁', priority: 3 },
      { path: ROUTES.ANALYTICS, label: 'Analytics', icon: '📊', priority: 4 }
    ]
  },
  gamification: {
    label: 'Gamification',
    routes: [
      { path: ROUTES.GAMIFICATION, label: 'Gamification', icon: '🎮', priority: 1 },
      { path: ROUTES.BADGES, label: 'Badges', icon: '🏆', priority: 2 },
      { path: ROUTES.LEADERBOARD, label: 'Classement', icon: '🥇', priority: 3 },
      { path: ROUTES.REWARDS, label: 'Récompenses', icon: '🎁', priority: 4 }
    ]
  },
  progression: {
    label: 'Progression',
    routes: [
      { path: ROUTES.ROLE_PROGRESSION, label: 'Progression Rôle', icon: '🎯', priority: 1 },
      { path: ROUTES.ESCAPE_PROGRESSION, label: 'Escape Progression', icon: '🚀', priority: 2 }
    ]
  },
  team: {
    label: 'Équipe',
    routes: [
      { path: ROUTES.TEAM, label: 'Équipe', icon: '👥', priority: 1 },
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
      { path: ROUTES.ADMIN_DEMO_CLEANER, label: 'Nettoyage Données', icon: '🧹', priority: 10 }
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
    ROUTES.ADMIN_ROLE_PERMISSIONS,
    ROUTES.ADMIN_REWARDS,
    ROUTES.ADMIN_BADGES,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_ANALYTICS,
    ROUTES.ADMIN_SETTINGS,
    ROUTES.ADMIN_DEMO_CLEANER
  ]
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
  MAX_ASSIGNEES_THRESHOLD: 10, // Tâches assignées à plus de 10 personnes = suspectes
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

// 📊 ANALYTICS CONSTANTS
export const ANALYTICS_METRICS = {
  TASK_COMPLETION_RATE: 'task_completion_rate',
  AVERAGE_TASK_TIME: 'average_task_time',
  USER_ENGAGEMENT: 'user_engagement',
  TEAM_PRODUCTIVITY: 'team_productivity',
  XP_GROWTH_RATE: 'xp_growth_rate',
  BADGE_UNLOCK_RATE: 'badge_unlock_rate'
};

// 🔔 NOTIFICATION SETTINGS
export const NOTIFICATION_SETTINGS = {
  TYPES: {
    DESKTOP: 'desktop',
    EMAIL: 'email',
    IN_APP: 'in_app',
    SMS: 'sms'
  },
  FREQUENCY: {
    INSTANT: 'instant',
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    NEVER: 'never'
  }
};

// 🏆 ACHIEVEMENT SYSTEM
export const ACHIEVEMENT_CATEGORIES = {
  PRODUCTIVITY: {
    name: 'Productivité',
    color: '#10B981',
    icon: '⚡',
    description: 'Récompenses liées à l\'efficacité et à la complétion de tâches'
  },
  COLLABORATION: {
    name: 'Collaboration',
    color: '#3B82F6',
    icon: '🤝',
    description: 'Récompenses pour le travail d\'équipe et l\'entraide'
  },
  LEADERSHIP: {
    name: 'Leadership',
    color: '#8B5CF6',
    icon: '👑',
    description: 'Récompenses pour les qualités de leadership'
  },
  INNOVATION: {
    name: 'Innovation',
    color: '#F59E0B',
    icon: '💡',
    description: 'Récompenses pour la créativité et l\'innovation'
  },
  CONSISTENCY: {
    name: 'Régularité',
    color: '#EF4444',
    icon: '🔥',
    description: 'Récompenses pour la constance et l\'assiduité'
  }
};

// 📱 MOBILE RESPONSIVENESS
export const MOBILE_BREAKPOINTS = {
  MOBILE_S: '320px',
  MOBILE_M: '375px',
  MOBILE_L: '425px',
  TABLET: '768px',
  LAPTOP: '1024px',
  LAPTOP_L: '1440px',
  DESKTOP: '2560px'
};

// ⚡ PERFORMANCE CONSTANTS
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  PAGINATION_SIZE: 20,
  MAX_SEARCH_RESULTS: 50,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT: 10000 // 10 seconds
};

// 🌐 INTERNATIONALIZATION
export const SUPPORTED_LANGUAGES = {
  FR: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  EN: { code: 'en', name: 'English', flag: '🇺🇸' },
  ES: { code: 'es', name: 'Español', flag: '🇪🇸' },
  DE: { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
};

// 📊 DATA VALIDATION
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  TASK_TITLE_MAX_LENGTH: 100,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  BIO_MAX_LENGTH: 500
};

// 🔒 SECURITY CONSTANTS
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour
  CSRF_TOKEN_LENGTH: 32
};

// 🎯 DEFAULT VALUES
export const DEFAULT_VALUES = {
  USER_AVATAR: '/assets/images/default-avatar.png',
  PROJECT_COVER: '/assets/images/default-project.png',
  COMPANY_LOGO: '/assets/images/default-company.png',
  TIMEZONE: 'Europe/Paris',
  LANGUAGE: 'fr',
  THEME: 'light',
  NOTIFICATIONS_ENABLED: true,
  EMAIL_NOTIFICATIONS: true
};

// Export par défaut pour compatibilité
export default {
  ROUTES,
  FIREBASE_COLLECTIONS,
  GAMIFICATION,
  ROLES,
  PERMISSIONS,
  TASK_STATUS,
  PRIORITY_LEVELS,
  THEME_COLORS,
  BREAKPOINTS,
  APP_CONFIG,
  NOTIFICATION_TYPES,
  NAVIGATION_STRUCTURE,
  MAIN_NAVIGATION,
  ADMIN_NAVIGATION,
  DEMO_CLEANER_CONFIG
};

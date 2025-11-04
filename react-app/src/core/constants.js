// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS AVEC TOUTES LES ROUTES - VERSION QUÊTES
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

// 🗂️ STRUCTURE DE NAVIGATION COMPLÈTE - VERSION QUÊTES
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
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Quêtes', icon: '🛡️', priority: 1 },
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

// 🧹 CONFIGURATION NETTOYAGE DONNÉES DÉMO - VERSION QUÊTES
export const DEMO_CLEANER_CONFIG = {
  DEMO_QUEST_PATTERNS: [
    'Gagner votre premier badge',
    'Compléter votre profil',
    'Découvrir le tableau de bord',
    'Bienvenue dans Synergia',
    'onboarding',
    'formation',
    'première quête'
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
  EMPLOYEE: { level: 1, permissions: ['read_basic', 'create_quests', 'edit_own_quests'] },
  MANAGER: { level: 2, permissions: ['read_basic', 'create_quests', 'edit_quests', 'assign_quests', 'view_team_analytics'] },
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

// 🎯 STATUTS DE QUÊTES
export const QUEST_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  VALIDATED: 'validated',
  CANCELLED: 'cancelled',
  VALIDATION_PENDING: 'validation_pending'
};

// 🎯 PRIORITÉS DE QUÊTES
export const QUEST_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// 🎮 DIFFICULTÉS DE QUÊTES
export const QUEST_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
};

// 📊 CATÉGORIES DE QUÊTES
export const QUEST_CATEGORIES = {
  GENERAL: 'general',
  MAINTENANCE: 'maintenance',
  CUSTOMER_SERVICE: 'customer_service',
  MARKETING: 'marketing',
  ADMINISTRATIVE: 'administrative',
  INVENTORY: 'inventory',
  CLEANING: 'cleaning'
};

// 🏆 XP ET GAMIFICATION
export const XP_CONFIG = {
  QUEST_COMPLETION_BASE: 50,
  QUEST_VALIDATION_BONUS: 25,
  DIFFICULTY_MULTIPLIERS: {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 3
  },
  PRIORITY_BONUS: {
    low: 0,
    medium: 0,
    high: 10,
    urgent: 20
  }
};

// 🔔 TYPES DE NOTIFICATIONS
export const NOTIFICATION_TYPES = {
  QUEST_ASSIGNED: 'quest_assigned',
  QUEST_COMPLETED: 'quest_completed',
  QUEST_VALIDATED: 'quest_validated',
  QUEST_REJECTED: 'quest_rejected',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  REWARD_APPROVED: 'reward_approved',
  TEAM_INVITATION: 'team_invitation'
};

// 📅 PÉRIODES TEMPORELLES
export const TIME_PERIODS = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  THIS_YEAR: 'this_year',
  ALL_TIME: 'all_time'
};

// 🎯 OBJECTIFS PAR DÉFAUT
export const DEFAULT_OBJECTIVES = {
  DAILY_QUESTS: 3,
  WEEKLY_QUESTS: 15,
  MONTHLY_QUESTS: 60,
  QUARTERLY_QUESTS: 180
};

// 🔢 LIMITES SYSTÈME
export const SYSTEM_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TAGS_PER_QUEST: 10,
  MAX_ASSIGNEES_PER_QUEST: 50,
  MAX_COMMENTS_PER_QUEST: 100,
  MAX_ATTACHMENTS_PER_QUEST: 5
};

// 🌐 LANGUES DISPONIBLES
export const AVAILABLE_LANGUAGES = {
  FR: { code: 'fr', label: 'Français', flag: '🇫🇷' },
  EN: { code: 'en', label: 'English', flag: '🇺🇸' },
  ES: { code: 'es', label: 'Español', flag: '🇪🇸' },
  DE: { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
};

// 📱 RESPONSIVE BREAKPOINTS
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// 🎨 COULEURS PAR STATUT
export const STATUS_COLORS = {
  todo: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  review: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  validated: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
};

// 🎨 COULEURS PAR PRIORITÉ
export const PRIORITY_COLORS = {
  low: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🟢' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟠' },
  urgent: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' }
};

// 🎨 COULEURS PAR DIFFICULTÉ
export const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
  hard: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟠' },
  expert: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' }
};

// 🔄 TYPES DE RÉCURRENCE
export const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom'
};

// 📊 MÉTRIQUES DASHBOARD
export const DASHBOARD_METRICS = {
  TOTAL_QUESTS: 'total_quests',
  COMPLETED_QUESTS: 'completed_quests',
  IN_PROGRESS_QUESTS: 'in_progress_quests',
  PENDING_VALIDATION: 'pending_validation',
  TOTAL_XP: 'total_xp',
  LEVEL: 'level',
  BADGES_EARNED: 'badges_earned',
  COMPLETION_RATE: 'completion_rate'
};

// 🎯 FILTRES PAR DÉFAUT
export const DEFAULT_FILTERS = {
  status: 'all',
  priority: 'all',
  difficulty: 'all',
  category: 'all',
  assignee: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

// Export par défaut
export default {
  ROUTES,
  FIREBASE_COLLECTIONS,
  NAVIGATION_STRUCTURE,
  MAIN_NAVIGATION,
  ADMIN_NAVIGATION,
  ROUTES_BY_CATEGORY,
  DEMO_CLEANER_CONFIG,
  USER_ROLE_HIERARCHY,
  UI_THEMES,
  QUEST_STATUS,
  QUEST_PRIORITY,
  QUEST_DIFFICULTY,
  QUEST_CATEGORIES,
  XP_CONFIG,
  NOTIFICATION_TYPES,
  TIME_PERIODS,
  DEFAULT_OBJECTIVES,
  SYSTEM_LIMITS,
  AVAILABLE_LANGUAGES,
  BREAKPOINTS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  DIFFICULTY_COLORS,
  RECURRENCE_TYPES,
  DASHBOARD_METRICS,
  DEFAULT_FILTERS
};

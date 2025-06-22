// src/core/constants.js - FICHIER COMPLET AVEC GAMIFICATION

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  EMPLOYEE: 'employee',
  GUEST: 'guest'
};

// Statuts utilisateur
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Collections Firebase
export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  NOTIFICATIONS: 'notifications',
  ACTIVITIES: 'activities',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  LEADERBOARD: 'leaderboard',
  BADGES: 'badges',
  ACHIEVEMENTS: 'achievements',
  MESSAGES: 'messages',
  TEAMS: 'teams',
  COMMENTS: 'comments'
};

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LEADERBOARD: '/leaderboard',
  GAMIFICATION: '/gamification',
  TIMETRACKING: '/time',
  MESSAGING: '/messages',
  SHOP: '/shop',
  ANALYTICS: '/analytics',
  ADMIN: '/admin'
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    USER_NOT_FOUND: 'Utilisateur introuvable',
    EMAIL_ALREADY_EXISTS: 'Cette adresse email est déjà utilisée',
    WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
    NETWORK_ERROR: 'Erreur de connexion, veuillez réessayer'
  },
  TASKS: {
    NOT_FOUND: 'Tâche introuvable',
    ALREADY_COMPLETED: 'Tâche déjà terminée',
    PERMISSION_DENIED: 'Vous n\'avez pas les permissions pour cette tâche',
    INVALID_DATA: 'Données de tâche invalides',
    CREATION_FAILED: 'Erreur lors de la création de la tâche'
  },
  GAMIFICATION: {
    INVALID_XP: 'Valeur XP invalide',
    USER_NOT_FOUND: 'Profil utilisateur introuvable',
    BADGE_UNLOCK_FAILED: 'Erreur lors du débloquage du badge',
    LEVEL_UP_FAILED: 'Erreur lors du level up'
  },
  GENERAL: {
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
    PERMISSION_DENIED: 'Vous n\'avez pas les permissions nécessaires',
    NOT_FOUND: 'Ressource introuvable',
    NETWORK_ERROR: 'Erreur de réseau, vérifiez votre connexion',
    VALIDATION_ERROR: 'Données invalides fournies'
  }
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Connexion réussie !',
    LOGOUT_SUCCESS: 'Déconnexion réussie !',
    REGISTER_SUCCESS: 'Compte créé avec succès !',
    PASSWORD_RESET_SENT: 'Email de réinitialisation envoyé'
  },
  TASKS: {
    CREATED: 'Tâche créée avec succès',
    UPDATED: 'Tâche mise à jour',
    DELETED: 'Tâche supprimée',
    COMPLETED: 'Tâche terminée avec succès !'
  },
  GAMIFICATION: {
    XP_GAINED: 'XP gagné !',
    LEVEL_UP: 'Félicitations ! Niveau supérieur atteint !',
    BADGE_UNLOCKED: 'Nouveau badge débloqué !',
    ACHIEVEMENT_UNLOCKED: 'Succès débloqué !'
  },
  GENERAL: {
    SAVE_SUCCESS: 'Modifications sauvegardées',
    DELETE_SUCCESS: 'Suppression réussie',
    UPDATE_SUCCESS: 'Mise à jour réussie',
    OPERATION_SUCCESS: 'Opération réussie'
  }
};

// Configuration de la gamification
export const GAMIFICATION = {
  // Récompenses XP par action
  XP_REWARDS: {
    DAILY_LOGIN: 10,
    FIRST_LOGIN: 50,
    PROFILE_COMPLETE: 100,
    TASK_COMPLETE_EASY: 20,
    TASK_COMPLETE_NORMAL: 40,
    TASK_COMPLETE_HARD: 60,
    TASK_COMPLETE_EXPERT: 100,
    PROJECT_CREATE: 100,
    PROJECT_COMPLETE: 200,
    HELP_COLLEAGUE: 50,
    TUTORIAL_COMPLETE: 25,
    FEEDBACK_GIVEN: 15,
    BUG_REPORT: 30,
    SUGGESTION_ACCEPTED: 75,
    PERFECT_WEEK: 150,
    STREAK_BONUS: 25
  },
  
  // Système de niveaux
  LEVELS: {
    NOVICE: { min: 0, max: 100, name: 'Novice', icon: '🌱' },
    APPRENTI: { min: 101, max: 300, name: 'Apprenti', icon: '🎓' },
    CONFIRME: { min: 301, max: 600, name: 'Confirmé', icon: '🛡️' },
    EXPERT: { min: 601, max: 1000, name: 'Expert', icon: '⭐' },
    MAITRE: { min: 1001, max: 1500, name: 'Maître', icon: '🔮' },
    LEGENDE: { min: 1501, max: Infinity, name: 'Légende', icon: '👑' }
  },
  
  // Configuration des badges
  BADGE_CATEGORIES: {
    PROGRESSION: 'progression',
    TASKS: 'tasks',
    SOCIAL: 'social',
    ACTIVITY: 'activity',
    LEVELS: 'levels',
    SPECIAL: 'special',
    ACHIEVEMENTS: 'achievements'
  },
  
  BADGE_RARITIES: {
    COMMON: { name: 'Commun', color: '#94A3B8', value: 1 },
    UNCOMMON: { name: 'Peu commun', color: '#10B981', value: 2 },
    RARE: { name: 'Rare', color: '#3B82F6', value: 3 },
    EPIC: { name: 'Épique', color: '#8B5CF6', value: 4 },
    LEGENDARY: { name: 'Légendaire', color: '#F59E0B', value: 5 }
  },
  
  // Paliers de niveau pour récompenses spéciales
  LEVEL_MILESTONES: [5, 10, 15, 20, 25, 30, 40, 50, 75, 100],
  
  // Configuration du leaderboard
  LEADERBOARD: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    UPDATE_FREQUENCY: 300000, // 5 minutes en ms
    CACHE_DURATION: 60000 // 1 minute en ms
  }
};

// Statuts des tâches
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived'
};

// Priorités des tâches
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};

// Complexités des tâches
export const TASK_COMPLEXITIES = {
  SIMPLE: 'simple',
  EASY: 'easy',
  MEDIUM: 'medium',
  NORMAL: 'normal',
  COMPLEX: 'complex',
  HARD: 'hard',
  EXPERT: 'expert',
  VERY_COMPLEX: 'very_complex'
};

// Types de tâches
export const TASK_TYPES = {
  TASK: 'task',
  BUG: 'bug',
  FEATURE: 'feature',
  STORY: 'story',
  EPIC: 'epic',
  MILESTONE: 'milestone',
  PROJECT: 'project',
  MAINTENANCE: 'maintenance',
  RESEARCH: 'research',
  DOCUMENTATION: 'documentation'
};

// Catégories de tâches
export const TASK_CATEGORIES = {
  GENERAL: 'general',
  DEVELOPMENT: 'development',
  DESIGN: 'design',
  TESTING: 'testing',
  MARKETING: 'marketing',
  SALES: 'sales',
  SUPPORT: 'support',
  MANAGEMENT: 'management',
  RESEARCH: 'research',
  DOCUMENTATION: 'documentation'
};

// Paramètres de l'application
export const APP_SETTINGS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    TASKS_PER_PAGE: 15,
    COMMENTS_PER_PAGE: 10
  },
  
  NOTIFICATIONS: {
    AUTO_HIDE_DELAY: 5000,
    MAX_NOTIFICATIONS: 5,
    LEVEL_UP_DISPLAY_TIME: 8000,
    XP_NOTIFICATION_TIME: 3000
  },
  
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_FILES_PER_UPLOAD: 10
  },
  
  SEARCH: {
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_RESULTS: 50,
    SEARCH_DEBOUNCE_TIME: 300
  },
  
  CACHE: {
    USER_PROFILE_TTL: 300000, // 5 minutes
    LEADERBOARD_TTL: 300000, // 5 minutes
    TASKS_TTL: 60000, // 1 minute
    BADGES_TTL: 3600000 // 1 heure
  },
  
  REALTIME: {
    RECONNECT_DELAY: 1000,
    MAX_RECONNECT_ATTEMPTS: 5,
    HEARTBEAT_INTERVAL: 30000
  }
};

// Types d'activités pour les logs
export const ACTIVITY_TYPES = {
  // Authentification
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  
  // Tâches
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  TASK_COMPLETED: 'task_completed',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMMENTED: 'task_commented',
  
  // Projets
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_COMPLETED: 'project_completed',
  PROJECT_ARCHIVED: 'project_archived',
  
  // Gamification
  XP_GAINED: 'xp_gained',
  LEVEL_UP: 'level_up',
  BADGE_UNLOCKED: 'badge_unlocked',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  
  // Social
  HELP_PROVIDED: 'help_provided',
  FEEDBACK_GIVEN: 'feedback_given',
  MESSAGE_SENT: 'message_sent',
  
  // Système
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',
  DATA_EXPORTED: 'data_exported'
};

// Configuration des thèmes
export const THEMES = {
  DARK: {
    name: 'dark',
    label: 'Sombre',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB'
    }
  },
  LIGHT: {
    name: 'light',
    label: 'Clair',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827'
    }
  }
};

// Langues supportées
export const SUPPORTED_LANGUAGES = {
  FR: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷'
  },
  EN: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  ES: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸'
  },
  DE: {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪'
  }
};

// Configuration des permissions
export const PERMISSIONS = {
  // Tâches
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  
  // Projets
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE: 'project:manage',
  
  // Utilisateurs
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  
  // Administration
  ADMIN_ACCESS: 'admin:access',
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_ANALYTICS: 'admin:analytics'
};

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  [USER_ROLES.GUEST]: [
    PERMISSIONS.TASK_READ
  ],
  [USER_ROLES.EMPLOYEE]: [
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.USER_READ
  ],
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_MANAGE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE
  ],
  [USER_ROLES.ADMIN]: [
    // Admins ont toutes les permissions
    ...Object.values(PERMISSIONS)
  ]
};

// Configuration de validation
export const VALIDATION_RULES = {
  TASK: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000,
    TAGS_MAX_COUNT: 10,
    TAG_MAX_LENGTH: 50
  },
  
  USER: {
    DISPLAY_NAME_MIN_LENGTH: 2,
    DISPLAY_NAME_MAX_LENGTH: 50,
    BIO_MAX_LENGTH: 500,
    SKILLS_MAX_COUNT: 20
  },
  
  PROJECT: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
    MEMBERS_MAX_COUNT: 50
  }
};

// États de connexion temps réel
export const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

// Types de notifications
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  XP_GAIN: 'xp_gain',
  LEVEL_UP: 'level_up',
  BADGE_UNLOCK: 'badge_unlock',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  PROJECT_INVITATION: 'project_invitation',
  SYSTEM_UPDATE: 'system_update'
};

// Configuration de développement
export const DEV_CONFIG = {
  ENABLE_LOGGING: true,
  MOCK_DELAY: 1000,
  SHOW_DEBUG_INFO: true,
  ENABLE_PERFORMANCE_TRACKING: true
};

// Configuration de production
export const PROD_CONFIG = {
  ENABLE_LOGGING: false,
  MOCK_DELAY: 0,
  SHOW_DEBUG_INFO: false,
  ENABLE_PERFORMANCE_TRACKING: false,
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_REPORTING: true
};

// Export par défaut avec toute la configuration
export default {
  USER_ROLES,
  USER_STATUS,
  COLLECTIONS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  GAMIFICATION,
  TASK_STATUS,
  TASK_PRIORITIES,
  TASK_COMPLEXITIES,
  TASK_TYPES,
  TASK_CATEGORIES,
  APP_SETTINGS,
  ACTIVITY_TYPES,
  THEMES,
  SUPPORTED_LANGUAGES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  VALIDATION_RULES,
  CONNECTION_STATES,
  NOTIFICATION_TYPES,
  DEV_CONFIG,
  PROD_CONFIG
};

// src/core/constants.js

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
  // Futures collections
  QUESTS: 'quests',
  BADGES: 'badges',
  TRANSACTIONS: 'transactions'
};

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  // Futures routes
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
  GENERAL: {
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
    PERMISSION_DENIED: 'Vous n\'avez pas les permissions nécessaires',
    NOT_FOUND: 'Ressource introuvable'
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
  GENERAL: {
    SAVE_SUCCESS: 'Modifications sauvegardées',
    DELETE_SUCCESS: 'Suppression réussie',
    UPDATE_SUCCESS: 'Mise à jour réussie'
  }
};

// Configuration de la gamification (Phase 2)
export const GAMIFICATION = {
  XP_REWARDS: {
    DAILY_LOGIN: 10,
    FIRST_LOGIN: 50,
    PROFILE_COMPLETE: 100,
    TASK_COMPLETE: 25,
    HELP_COLLEAGUE: 50
  },
  LEVELS: {
    NOVICE: { min: 0, max: 100 },
    APPRENTI: { min: 101, max: 300 },
    CONFIRME: { min: 301, max: 600 },
    EXPERT: { min: 601, max: 1000 },
    MAITRE: { min: 1001, max: 1500 },
    LEGENDE: { min: 1501, max: Infinity }
  }
};

// Paramètres de l'application
export const APP_SETTINGS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  NOTIFICATIONS: {
    AUTO_HIDE_DELAY: 5000,
    MAX_NOTIFICATIONS: 5
  },
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword']
  }
};

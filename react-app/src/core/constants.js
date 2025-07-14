// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTS COMPLET - VERSION CORRIGÉE ET COMPLÈTE
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
  social: {
    title: 'Social',
    routes: [
      { path: ROUTES.TEAM, label: 'Équipe', icon: '👥', priority: 1 },
      { path: ROUTES.USERS, label: 'Utilisateurs', icon: '👤', priority: 2 }
    ]
  },
  personal: {
    title: 'Personnel',
    routes: [
      { path: ROUTES.PROFILE, label: 'Profil', icon: '👤', priority: 1 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 2 },
      { path: ROUTES.TIMETRACK, label: 'Temps', icon: '⏰', priority: 3 }
    ]
  },
  admin: {
    title: 'Administration',
    routes: [
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Tâches', icon: '✅', priority: 1 },
      { path: ROUTES.ADMIN_COMPLETE_TEST, label: 'Test Complet', icon: '🧪', priority: 2 }
    ]
  }
}

// 👥 RÔLES UTILISATEURS
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  VISITOR: 'visitor',
  // Nouveaux rôles escape game
  GAMEMASTER: 'gamemaster',
  MAINTENANCE: 'maintenance',
  REPUTATION: 'reputation',
  STOCK: 'stock',
  ORGANIZATION: 'organization',
  CONTENT: 'content',
  MENTORING: 'mentoring',
  PARTNERSHIP: 'partnership'
}

// 🏅 NIVEAUX D'EXPÉRIENCE
export const XP_LEVELS = {
  DEBUTANT: { id: 'debutant', name: 'Débutant', xpMin: 0, xpMax: 500 },
  APPRENTI: { id: 'apprenti', name: 'Apprenti', xpMin: 501, xpMax: 1500 },
  COMPETENT: { id: 'competent', name: 'Compétent', xpMin: 1501, xpMax: 3000 },
  EXPERT: { id: 'expert', name: 'Expert', xpMin: 3001, xpMax: 5000 },
  MAITRE: { id: 'maitre', name: 'Maître', xpMin: 5001, xpMax: 10000 }
}

// 🎮 TYPES DE DIFFICULTÉS
export const DIFFICULTY_LEVELS = {
  FACILE: 'Facile',
  MOYEN: 'Moyen', 
  DIFFICILE: 'Difficile',
  AVANCE: 'Avancé'
}

// 🏆 TYPES DE BADGES
export const BADGE_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic'
}

// 📊 MÉTRIQUES ET STATS
export const METRICS = {
  XP_PER_TASK: 25,
  XP_PER_BADGE: 50,
  XP_PER_PROJECT: 100,
  DAILY_XP_LIMIT: 500,
  WEEKLY_XP_BONUS: 200
}

// 🔔 TYPES DE NOTIFICATIONS
export const NOTIFICATION_TYPES = {
  TASK_COMPLETED: 'task_completed',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  NEW_PROJECT: 'new_project',
  TEAM_UPDATE: 'team_update',
  ADMIN_MESSAGE: 'admin_message'
}

// 🎨 COULEURS THÉMATIQUES
export const THEME_COLORS = {
  PRIMARY: '#6366F1',
  SECONDARY: '#8B5CF6', 
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6'
}

// 📱 RESPONSIVE BREAKPOINTS
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  XXL: '1536px'
}

// 🔐 PERMISSIONS SYSTÈME
export const PERMISSIONS = {
  // Permissions de base
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_TASKS: 'manage_tasks',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Permissions escape game
  GAME_MASTER_ACCESS: 'gamemaster_access',
  MAINTENANCE_ACCESS: 'maintenance_access',
  REPUTATION_MANAGEMENT: 'reputation_management',
  STOCK_MANAGEMENT: 'stock_management',
  ORGANIZATION_ACCESS: 'organization_access',
  CONTENT_CREATION: 'content_creation',
  MENTORING_ACCESS: 'mentoring_access',
  PARTNERSHIP_MANAGEMENT: 'partnership_management',
  COMMUNICATION_ACCESS: 'communication_access',
  
  // Permissions admin
  ADMIN_ACCESS: 'admin_access',
  USER_MANAGEMENT: 'user_management',
  SYSTEM_CONFIG: 'system_config'
}

// 📋 STATUTS DES TÂCHES
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  VALIDATED: 'validated',
  REJECTED: 'rejected'
}

// 📁 TYPES DE PROJETS
export const PROJECT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  SPECIAL: 'special',
  TRAINING: 'training'
}

// 🎪 TYPES D'ÉVÉNEMENTS
export const EVENT_TYPES = {
  TASK_CREATION: 'task_creation',
  TASK_COMPLETION: 'task_completion',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  PROJECT_START: 'project_start',
  PROJECT_END: 'project_end',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout'
}

// ⚙️ CONFIGURATION SYSTÈME
export const SYSTEM_CONFIG = {
  APP_NAME: 'SYNERGIA',
  VERSION: '3.5',
  BUILD_DATE: '2025-01-15',
  ENVIRONMENT: process.env.NODE_ENV || 'production',
  API_VERSION: 'v1',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.pdf', '.doc', '.docx'],
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 heures
  AUTO_SAVE_INTERVAL: 30 * 1000 // 30 secondes
}

// 🌐 URLs ET ENDPOINTS
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.synergia.app',
  AUTH: '/auth',
  USERS: '/users',
  TASKS: '/tasks',
  PROJECTS: '/projects',
  BADGES: '/badges',
  ANALYTICS: '/analytics',
  NOTIFICATIONS: '/notifications',
  UPLOADS: '/uploads'
}

// 📧 CONFIGURATION EMAIL
export const EMAIL_CONFIG = {
  SUPPORT_EMAIL: 'support@synergia.app',
  ADMIN_EMAIL: 'admin@synergia.app',
  NO_REPLY_EMAIL: 'noreply@synergia.app'
}

// 🚀 MESSAGES SYSTÈME
export const SYSTEM_MESSAGES = {
  WELCOME: 'Bienvenue dans Synergia !',
  TASK_COMPLETED: 'Tâche terminée avec succès !',
  BADGE_EARNED: 'Nouveau badge obtenu !',
  LEVEL_UP: 'Félicitations, vous avez atteint un nouveau niveau !',
  ERROR_GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  SUCCESS_SAVE: 'Sauvegarde réussie !',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  LOGIN_SUCCESS: 'Connexion réussie'
}

// 📝 MESSAGES D'ERREUR
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
    EMAIL_IN_USE: 'Cette adresse email est déjà utilisée',
    USER_NOT_FOUND: 'Aucun utilisateur trouvé avec cette adresse email',
    ACCOUNT_DISABLED: 'Ce compte a été désactivé'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Ce champ est obligatoire',
    INVALID_EMAIL: 'Adresse email invalide',
    INVALID_PHONE: 'Numéro de téléphone invalide',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
    FILE_TOO_LARGE: 'Le fichier est trop volumineux (max 10MB)',
    INVALID_FILE_TYPE: 'Type de fichier non supporté'
  },
  NETWORK: {
    CONNECTION_ERROR: 'Erreur de connexion réseau',
    TIMEOUT: 'La requête a expiré',
    SERVER_ERROR: 'Erreur serveur (500)',
    NOT_FOUND: 'Ressource introuvable (404)',
    UNAUTHORIZED: 'Accès non autorisé (401)',
    FORBIDDEN: 'Accès interdit (403)'
  },
  TASKS: {
    CREATE_FAILED: 'Impossible de créer la tâche',
    UPDATE_FAILED: 'Impossible de mettre à jour la tâche',
    DELETE_FAILED: 'Impossible de supprimer la tâche',
    NOT_FOUND: 'Tâche introuvable'
  },
  PROJECTS: {
    CREATE_FAILED: 'Impossible de créer le projet',
    UPDATE_FAILED: 'Impossible de mettre à jour le projet',
    DELETE_FAILED: 'Impossible de supprimer le projet',
    NOT_FOUND: 'Projet introuvable'
  }
}

// 🎯 ESCAPE GAME - STATUTS DE PROGRESSION
export const ESCAPE_PROGRESSION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  TIMEOUT: 'timeout'
}

// 🎮 ESCAPE GAME - TYPES DE DÉFIS
export const ESCAPE_CHALLENGE_TYPES = {
  PUZZLE: 'puzzle',
  RIDDLE: 'riddle',
  CODE_BREAKING: 'code_breaking',
  PHYSICAL_TASK: 'physical_task',
  TEAMWORK: 'teamwork',
  OBSERVATION: 'observation',
  LOGIC: 'logic'
}

// ⭐ ESCAPE GAME - NIVEAUX DE DIFFICULTÉ
export const ESCAPE_DIFFICULTY = {
  BEGINNER: { id: 'beginner', name: 'Débutant', points: 100 },
  INTERMEDIATE: { id: 'intermediate', name: 'Intermédiaire', points: 200 },
  ADVANCED: { id: 'advanced', name: 'Avancé', points: 300 },
  EXPERT: { id: 'expert', name: 'Expert', points: 500 },
  MASTER: { id: 'master', name: 'Maître', points: 1000 }
}

console.log('✅ Constants.js - Version complète et corrigée chargée');
console.log('📊 Routes disponibles:', Object.keys(ROUTES).length);
console.log('🎯 Permissions disponibles:', Object.keys(PERMISSIONS).length);
console.log('🏆 Niveaux XP disponibles:', Object.keys(XP_LEVELS).length);

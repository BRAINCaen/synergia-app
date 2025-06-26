// ==========================================
// 📁 react-app/src/core/constants.js
// Constants ULTRA-COMPLET avec toutes les 17 routes
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
      { path: ROUTES.USERS, label: 'Utilisateurs', icon: '👤', priority: 10 }
    ]
  },
  profile: {
    title: 'Profil',
    routes: [
      { path: ROUTES.PROFILE, label: 'Profil', icon: '👤', priority: 11 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 12 }
    ]
  },
  tools: {
    title: 'Outils',
    routes: [
      { path: ROUTES.ONBOARDING, label: 'Intégration', icon: '🚀', priority: 13 },
      { path: ROUTES.TIMETRACK, label: 'Pointage', icon: '⏰', priority: 14 }
    ]
  },
  dev: {
    title: 'Développement',
    routes: [
      { path: ROUTES.TEST_DASHBOARD, label: 'Test Dashboard', icon: '🧪', priority: 15 }
    ]
  }
}

// 🎯 USER LEVELS
export const USER_LEVELS = {
  1: { min: 0, max: 99, name: 'Débutant', color: '#64748b' },
  2: { min: 100, max: 249, name: 'Novice', color: '#22c55e' },
  3: { min: 250, max: 499, name: 'Intermédiaire', color: '#3b82f6' },
  4: { min: 500, max: 999, name: 'Avancé', color: '#8b5cf6' },
  5: { min: 1000, max: 1999, name: 'Expert', color: '#f59e0b' },
  6: { min: 2000, max: 4999, name: 'Maître', color: '#ef4444' },
  7: { min: 5000, max: 9999, name: 'Légende', color: '#ec4899' },
  8: { min: 10000, max: Infinity, name: 'Divin', color: '#8b5cf6' }
}

// 🏆 BADGES DE BASE
export const BADGES = {
  FIRST_LOGIN: {
    id: 'first_login',
    name: 'Premier pas',
    description: 'Première connexion à Synergia',
    icon: '🎯',
    xp: 10,
    rarity: 'common'
  },
  TASK_COMPLETIONIST: {
    id: 'task_completionist',
    name: 'Completionist',
    description: 'Terminer 10 tâches',
    icon: '✅',
    xp: 50,
    rarity: 'common'
  },
  WEEK_STREAK: {
    id: 'week_streak',
    name: 'Une semaine d\'activité',
    description: 'Connexion quotidienne pendant 7 jours',
    icon: '🔥',
    xp: 100,
    rarity: 'uncommon'
  },
  PROJECT_MASTER: {
    id: 'project_master',
    name: 'Maître des Projets',
    description: 'Terminer 5 projets',
    icon: '📁',
    xp: 200,
    rarity: 'rare'
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Démon de la Vitesse',
    description: 'Terminer 25 tâches avant leur échéance',
    icon: '⚡',
    xp: 300,
    rarity: 'epic'
  }
}

// ⚡ XP REWARDS
export const XP_REWARDS = {
  TASK_COMPLETE: 20,
  HIGH_PRIORITY_TASK: 35,
  PROJECT_COMPLETE: 100,
  DAILY_LOGIN: 5,
  WEEKLY_BONUS: 50,
  BADGE_EARNED: 25,
  STREAK_BONUS: 10,
  COLLABORATION: 15,
  EARLY_COMPLETION: 25
}

// 🎨 BADGE RARITIES
export const BADGE_RARITIES = {
  common: { name: 'Commun', color: '#6b7280', gradient: 'from-gray-400 to-gray-600' },
  uncommon: { name: 'Peu commun', color: '#22c55e', gradient: 'from-green-400 to-green-600' },
  rare: { name: 'Rare', color: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
  epic: { name: 'Épique', color: '#8b5cf6', gradient: 'from-purple-400 to-purple-600' },
  legendary: { name: 'Légendaire', color: '#f59e0b', gradient: 'from-yellow-400 to-orange-600' },
  mythic: { name: 'Mythique', color: '#ec4899', gradient: 'from-pink-400 to-rose-600' }
}

// ⚠️ ERROR MESSAGES
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_EMAIL: 'Adresse email invalide',
    WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
    USER_NOT_FOUND: 'Aucun compte trouvé avec cette adresse email',
    WRONG_PASSWORD: 'Mot de passe incorrect',
    EMAIL_ALREADY_EXISTS: 'Un compte existe déjà avec cette adresse email',
    TOO_MANY_REQUESTS: 'Trop de tentatives. Veuillez réessayer plus tard',
    NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Ce champ est requis',
    INVALID_EMAIL: 'Format d\'email invalide',
    PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas'
  },
  GENERAL: {
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
    NETWORK_ERROR: 'Erreur de connexion',
    PAGE_NOT_FOUND: 'Page introuvable'
  }
}

// ✅ SUCCESS MESSAGES
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Connexion réussie !',
    REGISTER_SUCCESS: 'Compte créé avec succès !',
    LOGOUT_SUCCESS: 'Déconnexion réussie',
    PASSWORD_RESET_SENT: 'Email de réinitialisation envoyé'
  },
  TASKS: {
    CREATED: 'Tâche créée avec succès',
    UPDATED: 'Tâche mise à jour',
    DELETED: 'Tâche supprimée',
    COMPLETED: 'Tâche complétée !'
  },
  PROJECTS: {
    CREATED: 'Projet créé avec succès',
    UPDATED: 'Projet mis à jour',
    DELETED: 'Projet supprimé'
  },
  BADGES: {
    EARNED: 'Nouveau badge débloqué !',
    MILESTONE: 'Étape franchie !'
  }
}

// 📱 APP INFO
export const APP_INFO = {
  NAME: 'Synergia',
  VERSION: '3.5 Ultimate',
  DESCRIPTION: 'Application de gestion collaborative avec gamification',
  TOTAL_PAGES: 17,
  FEATURES: [
    'Gestion de tâches et projets',
    'Système de gamification avancé',
    'Collaboration en équipe',
    'Analytics et rapports',
    'Système de badges et récompenses',
    'Intégration et onboarding',
    'Pointage et suivi du temps'
  ]
}

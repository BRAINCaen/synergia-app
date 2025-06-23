// ==========================================
// 📁 react-app/src/core/constants.js
// Fichier constants.js CORRIGÉ avec Analytics route ajoutée
// ==========================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  PROJECTS: '/projects',
  GAMIFICATION: '/gamification',
  ANALYTICS: '/analytics' // ✅ ROUTE ANALYTICS AJOUTÉE
}

export const USER_LEVELS = {
  1: { min: 0, max: 99, name: 'Débutant' },
  2: { min: 100, max: 249, name: 'Novice' },
  3: { min: 250, max: 499, name: 'Intermédiaire' },
  4: { min: 500, max: 999, name: 'Avancé' },
  5: { min: 1000, max: 1999, name: 'Expert' },
  6: { min: 2000, max: Infinity, name: 'Maître' }
}

export const BADGES = {
  FIRST_LOGIN: {
    id: 'first_login',
    name: 'Premier pas',
    description: 'Première connexion à Synergia',
    icon: '🎯',
    xp: 10
  },
  TASK_COMPLETIONIST: {
    id: 'task_completionist',
    name: 'Completionist',
    description: 'Terminer 10 tâches',
    icon: '✅',
    xp: 50
  },
  WEEK_STREAK: {
    id: 'week_streak',
    name: 'Une semaine d\'activité',
    description: 'Connexion quotidienne pendant 7 jours',
    icon: '🔥',
    xp: 100
  }
}

export const XP_REWARDS = {
  TASK_COMPLETE: 20,
  DAILY_LOGIN: 5,
  WEEKLY_BONUS: 50,
  BADGE_EARNED: 25
}

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
    NETWORK_ERROR: 'Erreur de connexion'
  }
}

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
  }
}

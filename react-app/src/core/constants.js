// Constantes globales de l'application

// Couleurs Synergia
export const COLORS = {
  PRIMARY: '#6366f1',
  SECONDARY: '#8b5cf6', 
  ACCENT: '#06b6d4',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
  GRAY: '#6b7280'
}

// Messages d'erreur
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    USER_NOT_FOUND: 'Utilisateur non trouvé',
    WEAK_PASSWORD: 'Mot de passe trop faible (minimum 6 caractères)',
    EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
    EMAIL_INVALID: 'Format d\'email invalide',
    ACCOUNT_DISABLED: 'Compte désactivé',
    TOO_MANY_ATTEMPTS: 'Trop de tentatives, réessayez plus tard'
  },
  NETWORK: {
    CONNECTION_ERROR: 'Erreur de connexion réseau',
    TIMEOUT: 'Délai d\'attente dépassé',
    SERVER_ERROR: 'Erreur serveur, réessayez plus tard'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Ce champ est requis',
    INVALID_EMAIL: 'Adresse email invalide',
    PASSWORD_TOO_SHORT: 'Mot de passe trop court',
    PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas'
  }
}

// Messages de succès
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Connexion réussie !',
    LOGOUT_SUCCESS: 'Déconnexion réussie',
    REGISTRATION_SUCCESS: 'Compte créé avec succès !',
    PASSWORD_RESET_SENT: 'Email de réinitialisation envoyé'
  },
  PROFILE: {
    UPDATE_SUCCESS: 'Profil mis à jour avec succès',
    AVATAR_UPLOAD_SUCCESS: 'Avatar mis à jour'
  }
}

// Gamification (Phase 2)
export const GAMIFICATION = {
  XP_PER_LEVEL: 1000,
  MAX_LEVEL: 100,
  DAILY_BONUS: 50,
  WEEKLY_BONUS: 200,
  MONTHLY_BONUS: 1000,
  ACTIONS: {
    LOGIN: 10,
    TASK_COMPLETE: 50,
    HELP_COLLEAGUE: 25,
    EARLY_ARRIVAL: 30,
    OVERTIME: 40
  }
}

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  INTERN: 'intern'
}

// Statuts des tâches
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  CANCELLED: 'cancelled'
}

// Types de notifications
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
}

// Durées d'animation (en ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
}

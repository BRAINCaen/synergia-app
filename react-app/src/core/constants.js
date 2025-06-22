export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile'
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

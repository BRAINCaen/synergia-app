import { create } from 'zustand'
import { NOTIFICATION_TYPES, ANIMATION_DURATION } from '../../core/constants'

const useNotificationStore = create((set, get) => ({
  // État
  notifications: [],
  unreadCount: 0,

  // Actions
  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      autoClose: true,
      duration: 5000,
      persistent: false,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    }

    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))

    // Auto-suppression si activée
    if (newNotification.autoClose && !newNotification.persistent) {
      setTimeout(() => {
        get().removeNotification(id)
      }, newNotification.duration)
    }

    return id
  },

  removeNotification: (id) => set(state => {
    const notification = state.notifications.find(n => n.id === id)
    const wasUnread = notification && !notification.read
    
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
    }
  }),

  markAsRead: (id) => set(state => {
    const notification = state.notifications.find(n => n.id === id)
    const wasUnread = notification && !notification.read
    
    return {
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
    }
  }),

  markAllAsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),

  clearAll: () => set({
    notifications: [],
    unreadCount: 0
  }),

  clearRead: () => set(state => ({
    notifications: state.notifications.filter(n => !n.read),
    unreadCount: state.unreadCount // Pas de changement car on garde seulement les non-lues
  })),

  // Raccourcis pour différents types de notifications
  success: (message, options = {}) => get().addNotification({
    type: NOTIFICATION_TYPES.SUCCESS,
    title: 'Succès',
    message,
    duration: 4000,
    ...options
  }),

  error: (message, options = {}) => get().addNotification({
    type: NOTIFICATION_TYPES.ERROR,
    title: 'Erreur',
    message,
    autoClose: false,
    persistent: true,
    ...options
  }),

  warning: (message, options = {}) => get().addNotification({
    type: NOTIFICATION_TYPES.WARNING,
    title: 'Attention',
    message,
    duration: 6000,
    ...options
  }),

  info: (message, options = {}) => get().addNotification({
    type: NOTIFICATION_TYPES.INFO,
    title: 'Information',
    message,
    ...options
  }),

  // Notifications spécialisées pour Synergia
  levelUp: (oldLevel, newLevel) => get().addNotification({
    type: NOTIFICATION_TYPES.SUCCESS,
    title: '🎉 Niveau supérieur !',
    message: `Félicitations ! Vous êtes maintenant niveau ${newLevel} !`,
    duration: 8000,
    persistent: false,
    data: { oldLevel, newLevel, type: 'level_up' }
  }),

  badgeEarned: (badge) => get().addNotification({
    type: NOTIFICATION_TYPES.SUCCESS,
    title: '🏆 Nouveau badge !',
    message: `Vous avez obtenu le badge "${badge.name}" !`,
    duration: 6000,
    persistent: false,
    data: { badge, type: 'badge_earned' }
  }),

  questCompleted: (quest, reward) => get().addNotification({
    type: NOTIFICATION_TYPES.SUCCESS,
    title: '✅ Quête terminée !',
    message: `"${quest.name}" - Récompense: ${reward.xp} XP`,
    duration: 5000,
    data: { quest, reward, type: 'quest_completed' }
  }),

  dailyBonus: (bonus) => get().addNotification({
    type: NOTIFICATION_TYPES.INFO,
    title: '💰 Bonus quotidien !',
    message: `Connexion quotidienne: +${bonus} XP`,
    duration: 4000,
    data: { bonus, type: 'daily_bonus' }
  }),

  teamMessage: (from, message) => get().addNotification({
    type: NOTIFICATION_TYPES.INFO,
    title: `💬 ${from}`,
    message: message,
    duration: 6000,
    persistent: false,
    data: { from, type: 'team_message' }
  }),

  taskAssigned: (task, assignedBy) => get().addNotification({
    type: NOTIFICATION_TYPES.INFO,
    title: '📋 Nouvelle tâche',
    message: `"${task.title}" vous a été assignée par ${assignedBy}`,
    duration: 7000,
    data: { task, assignedBy, type: 'task_assigned' }
  }),

  reminder: (title, message, time) => get().addNotification({
    type: NOTIFICATION_TYPES.WARNING,
    title: `⏰ ${title}`,
    message: message,
    duration: 8000,
    data: { time, type: 'reminder' }
  }),

  // Getters utiles
  getNotificationsByType: (type) => {
    return get().notifications.filter(n => n.type === type)
  },

  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.read)
  },

  getNotificationsByData: (dataType) => {
    return get().notifications.filter(n => n.data?.type === dataType)
  },

  hasUnreadNotifications: () => {
    return get().unreadCount > 0
  },

  // Gestion des permissions de notification du navigateur
  requestPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  },

  // Envoyer une notification native du navigateur
  sendBrowserNotification: (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'synergia',
        ...options
      })
    }
  }
}))

export default useNotificationStore

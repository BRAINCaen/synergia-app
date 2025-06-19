// src/shared/stores/notificationStore.js
import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  // État des notifications
  notifications: [],
  unreadCount: 0,
  
  // Actions
  addNotification: (notification) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      type: 'info', // info, success, warning, error
      title: '',
      message: '',
      timestamp: new Date(),
      read: false,
      autoHide: true,
      duration: 5000,
      ...notification
    };
    
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
    
    // Auto-hide si nécessaire
    if (newNotif.autoHide) {
      setTimeout(() => {
        get().removeNotification(newNotif.id);
      }, newNotif.duration);
    }
    
    return newNotif.id;
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  
  clearAll: () => set({
    notifications: [],
    unreadCount: 0
  }),
  
  // Helpers pour types spécifiques
  success: (message, title = 'Succès') => 
    get().addNotification({ type: 'success', title, message }),
  
  error: (message, title = 'Erreur') => 
    get().addNotification({ type: 'error', title, message, autoHide: false }),
  
  warning: (message, title = 'Attention') => 
    get().addNotification({ type: 'warning', title, message }),
  
  info: (message, title = 'Information') => 
    get().addNotification({ type: 'info', title, message }),
}));

export default useNotificationStore;

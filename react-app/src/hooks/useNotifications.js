// ==========================================
// react-app/src/hooks/useNotifications.js
// HOOK NOTIFICATIONS - SYNERGIA v4.0
// Module: Gestion des notifications React
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../shared/stores/authStore';
import pushNotificationService, {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
} from '../core/services/pushNotificationService';

// ==========================================
// HOOK PRINCIPAL
// ==========================================
export function useNotifications(options = {}) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const unsubscribeRef = useRef(null);

  // ==========================================
  // INITIALISATION
  // ==========================================
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Vérifier le statut des permissions
    setPermissionStatus(pushNotificationService.getPermissionStatus());

    // S'abonner aux notifications en temps réel
    setLoading(true);
    unsubscribeRef.current = pushNotificationService.subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
        setLoading(false);
      },
      options
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.uid, options.includeRead, options.limit]);

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Demander les permissions push
   */
  const requestPermission = useCallback(async () => {
    const granted = await pushNotificationService.requestPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    return granted;
  }, []);

  /**
   * Marquer une notification comme lue
   */
  const markAsRead = useCallback(async (notificationId) => {
    const success = await pushNotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  }, []);

  /**
   * Marquer toutes comme lues
   */
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return false;
    const success = await pushNotificationService.markAllAsRead(user.uid);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
    return success;
  }, [user?.uid]);

  /**
   * Ignorer une notification
   */
  const dismiss = useCallback(async (notificationId) => {
    const success = await pushNotificationService.dismissNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Mettre à jour le compteur si la notification était non lue
      const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
    return success;
  }, [notifications]);

  /**
   * Ignorer toutes les notifications
   */
  const dismissAll = useCallback(async () => {
    if (!user?.uid) return false;
    const success = await pushNotificationService.dismissAll(user.uid);
    if (success) {
      setNotifications([]);
      setUnreadCount(0);
    }
    return success;
  }, [user?.uid]);

  /**
   * Créer une notification (pour tests ou usage interne)
   */
  const createNotification = useCallback(async (notification) => {
    if (!user?.uid) return null;
    return pushNotificationService.createNotification(user.uid, notification);
  }, [user?.uid]);

  /**
   * Programmer un rappel
   */
  const scheduleReminder = useCallback(async (reminder) => {
    if (!user?.uid) return null;
    return pushNotificationService.scheduleReminder(user.uid, reminder);
  }, [user?.uid]);

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Obtenir les notifications par type
   */
  const getByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  /**
   * Obtenir les notifications urgentes
   */
  const urgentNotifications = notifications.filter(
    n => n.priority === NOTIFICATION_PRIORITIES.URGENT && !n.read
  );

  /**
   * Obtenir les notifications d'aujourd'hui
   */
  const todayNotifications = notifications.filter(n => {
    const today = new Date().toDateString();
    return n.createdAt?.toDateString?.() === today;
  });

  // ==========================================
  // RETOUR
  // ==========================================
  return {
    // État
    notifications,
    unreadCount,
    loading,
    permissionStatus,

    // Collections filtrées
    urgentNotifications,
    todayNotifications,

    // Actions
    markAsRead,
    markAllAsRead,
    dismiss,
    dismissAll,
    requestPermission,
    createNotification,
    scheduleReminder,

    // Helpers
    getByType,

    // Types et priorités (pour références)
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES
  };
}

// ==========================================
// HOOK POUR LE CENTRE DE NOTIFICATIONS
// ==========================================
export function useNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const notifications = useNotifications();

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const filteredNotifications = useCallback(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.notifications.filter(n => !n.read);
      case 'urgent':
        return notifications.notifications.filter(
          n => n.priority === NOTIFICATION_PRIORITIES.URGENT
        );
      case 'today':
        return notifications.todayNotifications;
      default:
        return notifications.notifications;
    }
  }, [activeFilter, notifications.notifications, notifications.todayNotifications]);

  return {
    ...notifications,
    isOpen,
    toggle,
    open,
    close,
    activeFilter,
    setActiveFilter,
    filteredNotifications: filteredNotifications()
  };
}

export default useNotifications;

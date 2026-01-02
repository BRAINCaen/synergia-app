// ==========================================
// 📁 react-app/src/shared/hooks/useNotificationToast.js
// HOOK POUR GÉRER LES TOASTS DE NOTIFICATION - MODULE 6
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../../core/services/notificationService.js';

/**
 * 🔔 HOOK POUR GÉRER LES TOASTS DE NOTIFICATION
 * Affiche des toasts en temps réel quand de nouvelles notifications arrivent
 */
const useNotificationToast = (userId, options = {}) => {
  const {
    maxToasts = 5,
    soundEnabled = true,
    soundUrl = '/sounds/notification.mp3'
  } = options;

  const [toasts, setToasts] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousNotifIdsRef = useRef(new Set());
  const audioRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  // Initialiser l'audio
  useEffect(() => {
    if (soundEnabled && typeof Audio !== 'undefined') {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = 0.5;
    }
  }, [soundEnabled, soundUrl]);

  // Jouer le son de notification
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        // Ignorer les erreurs d'autoplay
        console.log('🔇 Son notification bloqué par le navigateur');
      });
    }
  }, [soundEnabled]);

  // Ajouter un toast
  const addToast = useCallback((notification) => {
    setToasts(prev => {
      // Éviter les doublons
      if (prev.some(t => t.id === notification.id)) {
        return prev;
      }

      const newToasts = [notification, ...prev].slice(0, maxToasts);
      return newToasts;
    });
  }, [maxToasts]);

  // Supprimer un toast
  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // Supprimer tous les toasts
  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Écouter les notifications en temps réel
  useEffect(() => {
    if (!userId) return;

    console.log('🔔 [TOAST] Initialisation listener notifications pour:', userId);

    const unsubscribe = notificationService.subscribeToNotifications(userId, (notifications) => {
      // Mettre à jour toutes les notifications
      setAllNotifications(notifications);

      // Compter les non lues
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);

      // Premier chargement - juste stocker les IDs sans afficher de toast
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
        notifications.forEach(n => previousNotifIdsRef.current.add(n.id));
        console.log(`🔔 [TOAST] Premier chargement: ${notifications.length} notifications`);
        return;
      }

      // Détecter les NOUVELLES notifications (pas encore vues)
      const newNotifications = notifications.filter(n => {
        const isNew = !previousNotifIdsRef.current.has(n.id);
        if (isNew) {
          previousNotifIdsRef.current.add(n.id);
        }
        return isNew && !n.read;
      });

      // Afficher les toasts pour les nouvelles notifications
      if (newNotifications.length > 0) {
        console.log(`🔔 [TOAST] ${newNotifications.length} nouvelle(s) notification(s)`);

        // Jouer le son
        playNotificationSound();

        // Ajouter les toasts (les plus récentes en premier)
        newNotifications.slice(0, maxToasts).forEach((notif, index) => {
          setTimeout(() => {
            addToast(notif);
          }, index * 200); // Décalage pour effet cascade
        });
      }
    });

    return () => {
      console.log('🔔 [TOAST] Nettoyage listener');
      unsubscribe();
    };
  }, [userId, addToast, playNotificationSound, maxToasts]);

  // Marquer comme lue
  const markAsRead = useCallback(async (notificationId) => {
    await notificationService.markAsRead(notificationId);
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    if (userId) {
      await notificationService.markAllAsRead(userId);
    }
  }, [userId]);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId) => {
    await notificationService.deleteNotification(notificationId);
    dismissToast(notificationId);
  }, [dismissToast]);

  // Supprimer toutes les notifications
  const deleteAllNotifications = useCallback(async () => {
    if (userId) {
      await notificationService.deleteAllNotifications(userId);
      dismissAllToasts();
      // Réinitialiser le ref des IDs précédents
      previousNotifIdsRef.current.clear();
    }
  }, [userId, dismissAllToasts]);

  // Créer un toast manuel (pour les notifications locales)
  const showToast = useCallback((notification) => {
    const toast = {
      id: `local-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      ...notification
    };
    addToast(toast);
    playNotificationSound();
    return toast.id;
  }, [addToast, playNotificationSound]);

  // Helpers pour différents types de toasts
  const showSuccess = useCallback((title, message, link) => {
    return showToast({
      type: 'success',
      title,
      message,
      icon: '✅',
      link
    });
  }, [showToast]);

  const showError = useCallback((title, message) => {
    return showToast({
      type: 'error',
      title,
      message,
      icon: '❌'
    });
  }, [showToast]);

  const showInfo = useCallback((title, message, link) => {
    return showToast({
      type: 'info',
      title,
      message,
      icon: 'ℹ️',
      link
    });
  }, [showToast]);

  const showWarning = useCallback((title, message) => {
    return showToast({
      type: 'warning',
      title,
      message,
      icon: '⚠️'
    });
  }, [showToast]);

  return {
    // État
    toasts,
    notifications: allNotifications,
    unreadCount,

    // Actions toasts
    dismissToast,
    dismissAllToasts,
    showToast,

    // Helpers
    showSuccess,
    showError,
    showInfo,
    showWarning,

    // Actions notifications
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};

export default useNotificationToast;

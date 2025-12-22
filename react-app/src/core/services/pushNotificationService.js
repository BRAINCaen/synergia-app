// ==========================================
// react-app/src/core/services/pushNotificationService.js
// SERVICE NOTIFICATIONS PUSH - SYNERGIA v4.0
// Module: Notifications, rappels et alertes
// ==========================================

import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// ==========================================
// CONFIGURATION
// ==========================================
export const NOTIFICATION_TYPES = {
  // Tâches
  TASK_ASSIGNED: { id: 'task_assigned', icon: '📋', color: 'bg-blue-500', label: 'Tâche assignée' },
  TASK_DUE_SOON: { id: 'task_due_soon', icon: '⏰', color: 'bg-amber-500', label: 'Tâche bientôt due' },
  TASK_OVERDUE: { id: 'task_overdue', icon: '🚨', color: 'bg-red-500', label: 'Tâche en retard' },
  TASK_COMPLETED: { id: 'task_completed', icon: '✅', color: 'bg-green-500', label: 'Tâche terminée' },

  // Quêtes
  QUEST_AVAILABLE: { id: 'quest_available', icon: '⚔️', color: 'bg-purple-500', label: 'Nouvelle quête' },
  QUEST_PROGRESS: { id: 'quest_progress', icon: '📈', color: 'bg-indigo-500', label: 'Progression quête' },
  QUEST_COMPLETED: { id: 'quest_completed', icon: '🏆', color: 'bg-yellow-500', label: 'Quête terminée' },

  // Gamification
  LEVEL_UP: { id: 'level_up', icon: '⬆️', color: 'bg-gradient-to-r from-purple-500 to-pink-500', label: 'Niveau supérieur' },
  BADGE_EARNED: { id: 'badge_earned', icon: '🎖️', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', label: 'Badge obtenu' },
  XP_BONUS: { id: 'xp_bonus', icon: '✨', color: 'bg-cyan-500', label: 'Bonus XP' },
  STREAK_MILESTONE: { id: 'streak_milestone', icon: '🔥', color: 'bg-orange-500', label: 'Série' },

  // Équipe
  TEAM_MENTION: { id: 'team_mention', icon: '@', color: 'bg-blue-600', label: 'Mention' },
  TEAM_CHALLENGE: { id: 'team_challenge', icon: '🤝', color: 'bg-teal-500', label: 'Défi équipe' },
  TEAM_ACHIEVEMENT: { id: 'team_achievement', icon: '🎉', color: 'bg-pink-500', label: 'Succès équipe' },

  // Parrainage
  SPONSORSHIP_REQUEST: { id: 'sponsorship_request', icon: '🤝', color: 'bg-indigo-600', label: 'Demande parrainage' },
  MENTEE_MILESTONE: { id: 'mentee_milestone', icon: '🌟', color: 'bg-emerald-500', label: 'Étape filleul' },

  // Système
  SYSTEM_ALERT: { id: 'system_alert', icon: '⚠️', color: 'bg-yellow-600', label: 'Alerte système' },
  REMINDER: { id: 'reminder', icon: '🔔', color: 'bg-slate-500', label: 'Rappel' },
  WELCOME: { id: 'welcome', icon: '👋', color: 'bg-green-600', label: 'Bienvenue' }
};

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// ==========================================
// SERVICE PRINCIPAL
// ==========================================
class PushNotificationService {
  constructor() {
    this.permissionGranted = false;
    this.swRegistration = null;
    this.subscriptions = new Map();
  }

  // ==========================================
  // PERMISSION ET CONFIGURATION
  // ==========================================

  /**
   * Demander la permission pour les notifications push
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  /**
   * Vérifier si les notifications sont supportées
   */
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Obtenir le statut des permissions
   */
  getPermissionStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  // ==========================================
  // GESTION DES NOTIFICATIONS
  // ==========================================

  /**
   * Créer une nouvelle notification
   */
  async createNotification(userId, notification) {
    try {
      const notificationData = {
        userId,
        type: notification.type || NOTIFICATION_TYPES.SYSTEM_ALERT.id,
        title: notification.title,
        message: notification.message,
        icon: notification.icon || NOTIFICATION_TYPES[notification.type]?.icon || '🔔',
        color: notification.color || NOTIFICATION_TYPES[notification.type]?.color || 'bg-slate-500',
        priority: notification.priority || NOTIFICATION_PRIORITIES.MEDIUM,
        link: notification.link || null,
        data: notification.data || {},
        read: false,
        dismissed: false,
        createdAt: serverTimestamp(),
        expiresAt: notification.expiresAt || null,
        scheduledFor: notification.scheduledFor || null
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);

      // Afficher notification native si permission accordée et pas programmée
      if (this.permissionGranted && !notification.scheduledFor) {
        this.showNativeNotification(notification);
      }

      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Erreur création notification:', error);
      throw error;
    }
  }

  /**
   * Créer plusieurs notifications en lot
   */
  async createBatchNotifications(notifications) {
    const results = await Promise.all(
      notifications.map(({ userId, notification }) =>
        this.createNotification(userId, notification)
      )
    );
    return results;
  }

  /**
   * Afficher une notification native du navigateur
   */
  showNativeNotification(notification) {
    if (!this.permissionGranted) return;

    const typeInfo = Object.values(NOTIFICATION_TYPES).find(t => t.id === notification.type);

    const nativeNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: notification.id || Date.now().toString(),
      renotify: true,
      requireInteraction: notification.priority === NOTIFICATION_PRIORITIES.URGENT,
      data: notification
    });

    // Clic sur la notification
    nativeNotif.onclick = () => {
      window.focus();
      if (notification.link) {
        window.location.href = notification.link;
      }
      nativeNotif.close();
    };

    // Auto-fermeture après 5 secondes pour les non-urgentes
    if (notification.priority !== NOTIFICATION_PRIORITIES.URGENT) {
      setTimeout(() => nativeNotif.close(), 5000);
    }

    return nativeNotif;
  }

  // ==========================================
  // RÉCUPÉRATION DES NOTIFICATIONS
  // ==========================================

  /**
   * Écouter les notifications d'un utilisateur en temps réel
   */
  subscribeToNotifications(userId, callback, options = {}) {
    const { includeRead = true, limit: maxLimit = 50 } = options;

    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('dismissed', '==', false),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (includeRead || !data.read) {
          notifications.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        }
      });
      callback(notifications);
    });

    this.subscriptions.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Récupérer les notifications non lues
   */
  async getUnreadNotifications(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        where('dismissed', '==', false),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount(userId) {
    try {
      const unread = await this.getUnreadNotifications(userId);
      return unread.length;
    } catch {
      return 0;
    }
  }

  // ==========================================
  // ACTIONS SUR LES NOTIFICATIONS
  // ==========================================

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      return false;
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId) {
    try {
      const unread = await this.getUnreadNotifications(userId);
      await Promise.all(
        unread.map(notif => this.markAsRead(notif.id))
      );
      return true;
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      return false;
    }
  }

  /**
   * Ignorer/supprimer une notification
   */
  async dismissNotification(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        dismissed: true,
        dismissedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      return false;
    }
  }

  /**
   * Ignorer toutes les notifications
   */
  async dismissAll(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('dismissed', '==', false)
      );

      const snapshot = await getDocs(q);
      await Promise.all(
        snapshot.docs.map(d => this.dismissNotification(d.id))
      );
      return true;
    } catch (error) {
      console.error('Erreur suppression toutes notifications:', error);
      return false;
    }
  }

  // ==========================================
  // RAPPELS ET NOTIFICATIONS PROGRAMMÉES
  // ==========================================

  /**
   * Créer un rappel programmé
   */
  async scheduleReminder(userId, reminder) {
    const scheduledTime = reminder.scheduledFor instanceof Date
      ? Timestamp.fromDate(reminder.scheduledFor)
      : reminder.scheduledFor;

    return this.createNotification(userId, {
      type: NOTIFICATION_TYPES.REMINDER.id,
      title: reminder.title || 'Rappel',
      message: reminder.message,
      priority: reminder.priority || NOTIFICATION_PRIORITIES.MEDIUM,
      scheduledFor: scheduledTime,
      data: {
        reminderType: reminder.type,
        relatedId: reminder.relatedId,
        ...reminder.data
      }
    });
  }

  /**
   * Créer un rappel de tâche
   */
  async createTaskReminder(userId, task, reminderTime) {
    const hoursUntilDue = Math.round(
      (new Date(task.dueDate) - reminderTime) / (1000 * 60 * 60)
    );

    return this.scheduleReminder(userId, {
      title: 'Rappel de tâche',
      message: `"${task.title}" est due dans ${hoursUntilDue}h`,
      type: 'task',
      relatedId: task.id,
      scheduledFor: reminderTime,
      priority: hoursUntilDue <= 2 ? NOTIFICATION_PRIORITIES.HIGH : NOTIFICATION_PRIORITIES.MEDIUM
    });
  }

  /**
   * Créer un rappel de quête
   */
  async createQuestReminder(userId, quest, reminderTime) {
    return this.scheduleReminder(userId, {
      title: 'Rappel de quête',
      message: `N'oubliez pas la quête "${quest.title}"`,
      type: 'quest',
      relatedId: quest.id,
      scheduledFor: reminderTime
    });
  }

  // ==========================================
  // NOTIFICATIONS AUTOMATIQUES
  // ==========================================

  /**
   * Notification de niveau supérieur
   */
  async notifyLevelUp(userId, newLevel, xpGained) {
    return this.createNotification(userId, {
      type: NOTIFICATION_TYPES.LEVEL_UP.id,
      title: `🎉 Niveau ${newLevel} atteint !`,
      message: `Félicitations ! Vous avez gagné ${xpGained} XP et atteint le niveau ${newLevel}.`,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      link: '/profile'
    });
  }

  /**
   * Notification de badge obtenu
   */
  async notifyBadgeEarned(userId, badge) {
    return this.createNotification(userId, {
      type: NOTIFICATION_TYPES.BADGE_EARNED.id,
      title: `🎖️ Nouveau badge : ${badge.name}`,
      message: badge.description || 'Vous avez débloqué un nouveau badge !',
      priority: NOTIFICATION_PRIORITIES.HIGH,
      link: '/profile',
      data: { badgeId: badge.id }
    });
  }

  /**
   * Notification de série maintenue
   */
  async notifyStreakMilestone(userId, streakDays) {
    const milestones = [3, 7, 14, 30, 60, 100];
    if (!milestones.includes(streakDays)) return null;

    const bonusXP = streakDays * 5;
    return this.createNotification(userId, {
      type: NOTIFICATION_TYPES.STREAK_MILESTONE.id,
      title: `🔥 Série de ${streakDays} jours !`,
      message: `Incroyable ! Vous avez maintenu votre série pendant ${streakDays} jours. +${bonusXP} XP bonus !`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      data: { streakDays, bonusXP }
    });
  }

  /**
   * Notification de quête terminée
   */
  async notifyQuestCompleted(userId, quest) {
    return this.createNotification(userId, {
      type: NOTIFICATION_TYPES.QUEST_COMPLETED.id,
      title: `⚔️ Quête terminée : ${quest.title}`,
      message: `Vous avez complété la quête et gagné ${quest.xpReward || 0} XP !`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      link: '/quests',
      data: { questId: quest.id, xpReward: quest.xpReward }
    });
  }

  /**
   * Notification de tâche assignée
   */
  async notifyTaskAssigned(userId, task, assignedBy) {
    return this.createNotification(userId, {
      type: NOTIFICATION_TYPES.TASK_ASSIGNED.id,
      title: '📋 Nouvelle tâche assignée',
      message: `${assignedBy} vous a assigné : "${task.title}"`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      link: `/tasks/${task.id}`,
      data: { taskId: task.id }
    });
  }

  /**
   * Notification de mention dans l'équipe
   */
  async notifyMention(userId, mentionedBy, context) {
    return this.createNotification(userId, {
      type: NOTIFICATION_TYPES.TEAM_MENTION.id,
      title: `@${mentionedBy} vous a mentionné`,
      message: context.message || 'Vous avez été mentionné dans une discussion.',
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      link: context.link
    });
  }

  // ==========================================
  // NETTOYAGE
  // ==========================================

  /**
   * Nettoyer les notifications expirées
   */
  async cleanupExpiredNotifications(userId) {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('expiresAt', '<=', now)
      );

      const snapshot = await getDocs(q);
      await Promise.all(
        snapshot.docs.map(d => deleteDoc(d.ref))
      );

      return snapshot.size;
    } catch (error) {
      console.error('Erreur nettoyage notifications:', error);
      return 0;
    }
  }

  /**
   * Se désabonner de toutes les écoutes
   */
  unsubscribeAll() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

// Export singleton
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;

// ==========================================
// react-app/src/core/services/externalNotificationService.js
// SERVICE DE NOTIFICATIONS EXTERNES - EMAIL & PUSH SMARTPHONE
// Synergia v4.1.0
// ==========================================

import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// ==========================================
// CONFIGURATION DES TYPES DE NOTIFICATIONS
// ==========================================
export const NOTIFICATION_CATEGORIES = {
  QUESTS: {
    id: 'quests',
    label: 'Quêtes & Tâches',
    icon: '⚔️',
    description: 'Notifications liées aux quêtes et tâches',
    events: [
      { id: 'quest_assigned', label: 'Nouvelle quête assignée', defaultEmail: true, defaultPush: true },
      { id: 'quest_approved', label: 'Quête validée', defaultEmail: true, defaultPush: true },
      { id: 'quest_rejected', label: 'Quête refusée', defaultEmail: true, defaultPush: true },
      { id: 'quest_due_soon', label: 'Quête bientôt due (rappel)', defaultEmail: false, defaultPush: true }
    ]
  },
  GAMIFICATION: {
    id: 'gamification',
    label: 'Gamification & Progression',
    icon: '🏆',
    description: 'XP, niveaux, badges et achievements',
    events: [
      { id: 'level_up', label: 'Passage de niveau', defaultEmail: true, defaultPush: true },
      { id: 'badge_earned', label: 'Nouveau badge obtenu', defaultEmail: true, defaultPush: true },
      { id: 'xp_bonus', label: 'Bonus XP reçu', defaultEmail: false, defaultPush: true },
      { id: 'leaderboard_change', label: 'Changement de classement', defaultEmail: false, defaultPush: false }
    ]
  },
  TEAM: {
    id: 'team',
    label: 'Équipe & Collaboration',
    icon: '👥',
    description: 'Activités d\'équipe et mentions',
    events: [
      { id: 'boost_received', label: 'Boost reçu d\'un collègue', defaultEmail: false, defaultPush: true },
      { id: 'team_challenge', label: 'Nouveau challenge d\'équipe', defaultEmail: true, defaultPush: true },
      { id: 'team_mention', label: 'Mention dans une discussion', defaultEmail: false, defaultPush: true },
      { id: 'pool_reward', label: 'Récompense d\'équipe débloquée', defaultEmail: true, defaultPush: true }
    ]
  },
  HR: {
    id: 'hr',
    label: 'RH & Planning',
    icon: '📅',
    description: 'Congés, pointages et planning',
    events: [
      { id: 'leave_approved', label: 'Congé approuvé', defaultEmail: true, defaultPush: true },
      { id: 'leave_rejected', label: 'Congé refusé', defaultEmail: true, defaultPush: true },
      { id: 'timesheet_reminder', label: 'Rappel validation pointages', defaultEmail: true, defaultPush: true },
      { id: 'planning_update', label: 'Modification du planning', defaultEmail: true, defaultPush: false }
    ]
  },
  REWARDS: {
    id: 'rewards',
    label: 'Récompenses & Boutique',
    icon: '🎁',
    description: 'Demandes et validation de récompenses',
    events: [
      { id: 'reward_approved', label: 'Récompense approuvée', defaultEmail: true, defaultPush: true },
      { id: 'reward_rejected', label: 'Récompense refusée', defaultEmail: true, defaultPush: true },
      { id: 'new_reward_available', label: 'Nouvelle récompense disponible', defaultEmail: false, defaultPush: true }
    ]
  },
  INFOS: {
    id: 'infos',
    label: 'Actualités & Infos',
    icon: '📢',
    description: 'Nouvelles informations et annonces',
    events: [
      { id: 'new_info', label: 'Nouvelle information publiée', defaultEmail: false, defaultPush: true },
      { id: 'urgent_info', label: 'Information urgente', defaultEmail: true, defaultPush: true },
      { id: 'idea_adopted', label: 'Votre idée a été adoptée', defaultEmail: true, defaultPush: true }
    ]
  },
  MENTORING: {
    id: 'mentoring',
    label: 'Mentorat & Formation',
    icon: '🎓',
    description: 'Sessions de mentorat et formation',
    events: [
      { id: 'mentoring_session', label: 'Nouvelle session de mentorat', defaultEmail: true, defaultPush: true },
      { id: 'mentee_progress', label: 'Progression d\'un filleul', defaultEmail: false, defaultPush: true }
    ]
  }
};

// ==========================================
// PRÉFÉRENCES PAR DÉFAUT
// ==========================================
export const getDefaultPreferences = () => {
  const preferences = {
    enabled: true,
    emailEnabled: true,
    pushEnabled: true,
    emailAddress: null, // Utilise l'email du compte par défaut
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    weekendNotifications: false,
    categories: {}
  };

  // Générer les préférences par défaut pour chaque catégorie
  Object.values(NOTIFICATION_CATEGORIES).forEach(category => {
    preferences.categories[category.id] = {
      enabled: true,
      events: {}
    };
    category.events.forEach(event => {
      preferences.categories[category.id].events[event.id] = {
        email: event.defaultEmail,
        push: event.defaultPush
      };
    });
  });

  return preferences;
};

// ==========================================
// SERVICE PRINCIPAL
// ==========================================
class ExternalNotificationService {
  constructor() {
    this.COLLECTION = 'notification_preferences';
    this.EMAIL_QUEUE_COLLECTION = 'email_queue';
    this.PUSH_QUEUE_COLLECTION = 'push_queue';
    console.log('📧 ExternalNotificationService initialisé');
  }

  // ==========================================
  // GESTION DES PRÉFÉRENCES
  // ==========================================

  /**
   * Récupérer les préférences de notification d'un utilisateur
   */
  async getUserPreferences(userId) {
    try {
      const prefRef = doc(db, this.COLLECTION, userId);
      const prefDoc = await getDoc(prefRef);

      if (prefDoc.exists()) {
        return { ...getDefaultPreferences(), ...prefDoc.data() };
      }

      // Créer les préférences par défaut si elles n'existent pas
      const defaultPrefs = getDefaultPreferences();
      await setDoc(prefRef, defaultPrefs);
      return defaultPrefs;
    } catch (error) {
      console.error('❌ [EXT-NOTIF] Erreur récupération préférences:', error);
      return getDefaultPreferences();
    }
  }

  /**
   * Sauvegarder les préférences de notification
   */
  async saveUserPreferences(userId, preferences) {
    try {
      const prefRef = doc(db, this.COLLECTION, userId);
      await setDoc(prefRef, {
        ...preferences,
        updatedAt: new Date()
      }, { merge: true });

      console.log('✅ [EXT-NOTIF] Préférences sauvegardées pour:', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ [EXT-NOTIF] Erreur sauvegarde préférences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour une préférence spécifique
   */
  async updatePreference(userId, path, value) {
    try {
      const prefRef = doc(db, this.COLLECTION, userId);
      await updateDoc(prefRef, {
        [path]: value,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ [EXT-NOTIF] Erreur mise à jour préférence:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // VÉRIFICATION DES PRÉFÉRENCES
  // ==========================================

  /**
   * Vérifier si un utilisateur doit recevoir une notification
   */
  async shouldNotify(userId, categoryId, eventId, channel = 'push') {
    try {
      const prefs = await this.getUserPreferences(userId);

      // Notifications globalement désactivées
      if (!prefs.enabled) return false;

      // Canal spécifique désactivé
      if (channel === 'email' && !prefs.emailEnabled) return false;
      if (channel === 'push' && !prefs.pushEnabled) return false;

      // Vérifier les heures calmes
      if (prefs.quietHoursEnabled && this.isQuietHours(prefs)) {
        return false;
      }

      // Vérifier le weekend
      if (!prefs.weekendNotifications && this.isWeekend()) {
        return false;
      }

      // Vérifier la catégorie
      const category = prefs.categories?.[categoryId];
      if (!category?.enabled) return false;

      // Vérifier l'événement spécifique
      const event = category.events?.[eventId];
      if (!event) return true; // Par défaut actif si non configuré

      return channel === 'email' ? event.email : event.push;
    } catch (error) {
      console.error('❌ [EXT-NOTIF] Erreur vérification préférences:', error);
      return true; // Par défaut, envoyer
    }
  }

  /**
   * Vérifier si on est en heures calmes
   */
  isQuietHours(prefs) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = prefs.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = prefs.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Gestion du cas où les heures calmes traversent minuit
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Vérifier si on est le weekend
   */
  isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }

  // ==========================================
  // ENVOI DE NOTIFICATIONS
  // ==========================================

  /**
   * Envoyer une notification externe (email et/ou push)
   */
  async sendNotification(userId, notification) {
    const { categoryId, eventId, title, message, data = {} } = notification;

    try {
      // Récupérer les infos utilisateur
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.warn('⚠️ [EXT-NOTIF] Utilisateur non trouvé:', userId);
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      const userData = userDoc.data();
      const results = { email: null, push: null };

      // Vérifier et envoyer par email
      if (await this.shouldNotify(userId, categoryId, eventId, 'email')) {
        const emailAddress = userData.email;
        if (emailAddress) {
          results.email = await this.queueEmail(userId, emailAddress, {
            title,
            message,
            categoryId,
            eventId,
            data,
            userName: userData.displayName || userData.profile?.displayName || 'Utilisateur'
          });
        }
      }

      // Vérifier et envoyer en push
      if (await this.shouldNotify(userId, categoryId, eventId, 'push')) {
        results.push = await this.queuePush(userId, {
          title,
          message,
          categoryId,
          eventId,
          data
        });
      }

      console.log('📧 [EXT-NOTIF] Notification envoyée:', { userId, categoryId, eventId, results });
      return { success: true, results };
    } catch (error) {
      console.error('❌ [EXT-NOTIF] Erreur envoi notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer une notification à plusieurs utilisateurs
   */
  async sendBulkNotification(userIds, notification) {
    const results = await Promise.all(
      userIds.map(userId => this.sendNotification(userId, notification))
    );
    return results;
  }

  /**
   * Envoyer une notification à tous les utilisateurs
   */
  async sendToAll(notification, excludeUserIds = []) {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userIds = usersSnapshot.docs
        .map(doc => doc.id)
        .filter(id => !excludeUserIds.includes(id));

      return this.sendBulkNotification(userIds, notification);
    } catch (error) {
      console.error('❌ [EXT-NOTIF] Erreur envoi à tous:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // FILE D'ATTENTE EMAIL
  // ==========================================

  /**
   * Ajouter un email à la file d'attente
   * (Sera traité par une Cloud Function)
   */
  async queueEmail(userId, emailAddress, emailData) {
    try {
      const emailDoc = {
        userId,
        to: emailAddress,
        subject: `Synergia - ${emailData.title}`,
        template: 'notification',
        data: {
          title: emailData.title,
          message: emailData.message,
          userName: emailData.userName,
          categoryId: emailData.categoryId,
          eventId: emailData.eventId,
          actionUrl: this.getActionUrl(emailData.categoryId, emailData.data),
          ...emailData.data
        },
        status: 'pending',
        createdAt: new Date(),
        attempts: 0
      };

      const docRef = await setDoc(
        doc(collection(db, this.EMAIL_QUEUE_COLLECTION)),
        emailDoc
      );

      console.log('📧 [EMAIL] Email ajouté à la file:', emailAddress);
      return { success: true, queued: true };
    } catch (error) {
      console.error('❌ [EMAIL] Erreur ajout file email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Générer l'URL d'action pour l'email
   */
  getActionUrl(categoryId, data) {
    const baseUrl = 'https://rainbow-caramel-df0320.netlify.app';

    const routes = {
      quests: '/tasks',
      gamification: '/gamification',
      team: '/team',
      hr: '/hr',
      rewards: '/rewards',
      infos: '/infos',
      mentoring: '/mentoring'
    };

    return `${baseUrl}${routes[categoryId] || '/dashboard'}`;
  }

  // ==========================================
  // FILE D'ATTENTE PUSH
  // ==========================================

  /**
   * Ajouter une notification push à la file d'attente
   */
  async queuePush(userId, pushData) {
    try {
      // Récupérer le token FCM de l'utilisateur
      const userDoc = await getDoc(doc(db, 'users', userId));
      const fcmToken = userDoc.data()?.fcmToken;

      if (!fcmToken) {
        console.log('📱 [PUSH] Pas de token FCM pour:', userId);
        return { success: false, reason: 'no_token' };
      }

      const pushDoc = {
        userId,
        token: fcmToken,
        title: pushData.title,
        body: pushData.message,
        data: {
          categoryId: pushData.categoryId,
          eventId: pushData.eventId,
          ...pushData.data
        },
        status: 'pending',
        createdAt: new Date(),
        attempts: 0
      };

      await setDoc(
        doc(collection(db, this.PUSH_QUEUE_COLLECTION)),
        pushDoc
      );

      console.log('📱 [PUSH] Push ajouté à la file pour:', userId);
      return { success: true, queued: true };
    } catch (error) {
      console.error('❌ [PUSH] Erreur ajout file push:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // ENREGISTREMENT FCM TOKEN
  // ==========================================

  /**
   * Enregistrer le token FCM d'un utilisateur
   */
  async registerFCMToken(userId, token) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date()
      });
      console.log('📱 [FCM] Token enregistré pour:', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ [FCM] Erreur enregistrement token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer le token FCM d'un utilisateur
   */
  async unregisterFCMToken(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmToken: null,
        fcmTokenUpdatedAt: new Date()
      });
      console.log('📱 [FCM] Token supprimé pour:', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ [FCM] Erreur suppression token:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // MÉTHODES PRATIQUES PAR TYPE
  // ==========================================

  // Quêtes
  async notifyQuestAssigned(userId, questData) {
    return this.sendNotification(userId, {
      categoryId: 'quests',
      eventId: 'quest_assigned',
      title: '⚔️ Nouvelle quête assignée',
      message: `On vous a assigné la quête "${questData.title}"`,
      data: { questId: questData.id, questTitle: questData.title }
    });
  }

  async notifyQuestApproved(userId, questData) {
    return this.sendNotification(userId, {
      categoryId: 'quests',
      eventId: 'quest_approved',
      title: '✅ Quête validée !',
      message: `Votre quête "${questData.title}" a été approuvée ! +${questData.xpAmount || 25} XP`,
      data: { questId: questData.id, xpAmount: questData.xpAmount }
    });
  }

  async notifyQuestRejected(userId, questData) {
    return this.sendNotification(userId, {
      categoryId: 'quests',
      eventId: 'quest_rejected',
      title: '❌ Quête refusée',
      message: `Votre quête "${questData.title}" n'a pas été validée. Raison: ${questData.reason}`,
      data: { questId: questData.id, reason: questData.reason }
    });
  }

  // Gamification
  async notifyLevelUp(userId, levelData) {
    return this.sendNotification(userId, {
      categoryId: 'gamification',
      eventId: 'level_up',
      title: `🎊 Niveau ${levelData.newLevel} atteint !`,
      message: `Félicitations ! Vous êtes passé au niveau ${levelData.newLevel} !`,
      data: levelData
    });
  }

  async notifyBadgeEarned(userId, badgeData) {
    return this.sendNotification(userId, {
      categoryId: 'gamification',
      eventId: 'badge_earned',
      title: `🏅 Nouveau badge : ${badgeData.name}`,
      message: badgeData.description || `Vous avez débloqué le badge "${badgeData.name}" !`,
      data: badgeData
    });
  }

  // Équipe
  async notifyBoostReceived(userId, boostData) {
    return this.sendNotification(userId, {
      categoryId: 'team',
      eventId: 'boost_received',
      title: `${boostData.emoji} Boost reçu !`,
      message: `${boostData.fromUserName} vous a envoyé un Boost ${boostData.label} !`,
      data: boostData
    });
  }

  // RH
  async notifyLeaveApproved(userId, leaveData) {
    return this.sendNotification(userId, {
      categoryId: 'hr',
      eventId: 'leave_approved',
      title: '✅ Congé approuvé !',
      message: `Votre demande de ${leaveData.type} a été approuvée`,
      data: leaveData
    });
  }

  async notifyLeaveRejected(userId, leaveData) {
    return this.sendNotification(userId, {
      categoryId: 'hr',
      eventId: 'leave_rejected',
      title: '❌ Congé refusé',
      message: `Votre demande de ${leaveData.type} a été refusée${leaveData.reason ? `. Raison: ${leaveData.reason}` : ''}`,
      data: leaveData
    });
  }

  async notifyTimesheetReminder(userId, periodData) {
    return this.sendNotification(userId, {
      categoryId: 'hr',
      eventId: 'timesheet_reminder',
      title: '⏰ Pointages à valider',
      message: `N'oubliez pas de signer vos pointages de ${periodData.monthLabel} ${periodData.year}`,
      data: periodData
    });
  }

  // Récompenses
  async notifyRewardApproved(userId, rewardData) {
    return this.sendNotification(userId, {
      categoryId: 'rewards',
      eventId: 'reward_approved',
      title: '🎉 Récompense approuvée !',
      message: `Votre demande pour "${rewardData.name}" a été approuvée !`,
      data: rewardData
    });
  }

  // Infos
  async notifyUrgentInfo(userId, infoData) {
    return this.sendNotification(userId, {
      categoryId: 'infos',
      eventId: 'urgent_info',
      title: '🚨 Information urgente',
      message: infoData.title,
      data: infoData
    });
  }
}

// Export singleton
export const externalNotificationService = new ExternalNotificationService();
export default externalNotificationService;

console.log('📧 ExternalNotificationService prêt');

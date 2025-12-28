// ==========================================
// 📁 react-app/src/core/services/fcmPushService.js
// SERVICE NOTIFICATIONS PUSH FCM
// Gère les notifications push sur smartphone/navigateur
// ==========================================

import { db, initializeMessaging, getFCMToken, onForegroundMessage } from '../firebase';
import { doc, updateDoc, getDoc, collection, addDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';

// ==========================================
// CONFIGURATION
// ==========================================
const NOTIFICATION_ICONS = {
  quest: '/icons/quest-icon.png',
  boost: '/icons/boost-icon.png',
  badge: '/icons/badge-icon.png',
  level: '/icons/level-icon.png',
  message: '/icons/message-icon.png',
  leave: '/icons/leave-icon.png',
  info: '/icons/info-icon.png',
  default: '/icons/icon-192x192.png'
};

// ==========================================
// SERVICE DE NOTIFICATIONS PUSH
// ==========================================
class FCMPushService {
  constructor() {
    this.isInitialized = false;
    this.currentToken = null;
    this.unsubscribeForeground = null;
  }

  // ==========================================
  // INITIALISATION
  // ==========================================

  /**
   * Initialiser le service de notifications push
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('ℹ️ [FCM] Service déjà initialisé');
      return { success: true };
    }

    try {
      // Vérifier si le navigateur supporte les notifications
      if (!('Notification' in window)) {
        console.log('ℹ️ [FCM] Notifications non supportées par ce navigateur');
        return { success: false, error: 'notifications_not_supported' };
      }

      // Vérifier si les service workers sont supportés
      if (!('serviceWorker' in navigator)) {
        console.log('ℹ️ [FCM] Service Workers non supportés');
        return { success: false, error: 'sw_not_supported' };
      }

      // Vérifier le contexte sécurisé (HTTPS requis pour les notifications push)
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.log('⚠️ [FCM] HTTPS requis pour les notifications push');
        return { success: false, error: 'https_required' };
      }

      // Enregistrer le service worker Firebase
      const registration = await this.registerServiceWorker();
      if (!registration.success) {
        return { success: false, error: registration.error || 'sw_registration_failed' };
      }

      // Initialiser Firebase Messaging
      const messaging = await initializeMessaging();
      if (!messaging) {
        console.log('⚠️ [FCM] Firebase Messaging non disponible sur ce navigateur');
        return { success: false, error: 'fcm_not_supported' };
      }

      // Écouter les messages en premier plan
      this.setupForegroundListener();

      this.isInitialized = true;
      console.log('✅ [FCM] Service de notifications push initialisé');
      return { success: true };

    } catch (error) {
      console.error('❌ [FCM] Erreur initialisation:', error);
      return { success: false, error: error.message || 'init_exception' };
    }
  }

  /**
   * Enregistrer le service worker Firebase
   * @returns {Promise<{success: boolean, registration?: ServiceWorkerRegistration, error?: string}>}
   */
  async registerServiceWorker() {
    try {
      // Vérifier si un SW est déjà enregistré
      let registration = await navigator.serviceWorker.getRegistration('/');

      if (registration) {
        console.log('✅ [FCM] Service Worker existant trouvé:', registration.scope);

        // Attendre que le SW soit actif
        if (registration.installing || registration.waiting) {
          console.log('⏳ [FCM] Attente activation du Service Worker...');
          await this.waitForServiceWorkerActive(registration);
        }

        return { success: true, registration };
      }

      // Enregistrer un nouveau SW
      console.log('📝 [FCM] Enregistrement du Service Worker...');
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });

      console.log('✅ [FCM] Service Worker enregistré:', registration.scope);

      // Attendre que le SW soit actif
      if (registration.installing || registration.waiting) {
        console.log('⏳ [FCM] Attente activation du Service Worker...');
        await this.waitForServiceWorkerActive(registration);
      }

      return { success: true, registration };
    } catch (error) {
      console.error('❌ [FCM] Erreur enregistrement Service Worker:', error);
      return { success: false, error: `sw_error: ${error.message}` };
    }
  }

  /**
   * Attendre que le service worker soit actif
   */
  async waitForServiceWorkerActive(registration) {
    return new Promise((resolve, reject) => {
      const sw = registration.installing || registration.waiting;
      if (!sw) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Timeout activation SW'));
      }, 15000);

      if (sw.state === 'activated') {
        clearTimeout(timeout);
        resolve();
        return;
      }

      sw.addEventListener('statechange', (e) => {
        if (e.target.state === 'activated') {
          clearTimeout(timeout);
          console.log('✅ [FCM] Service Worker activé');
          resolve();
        }
      });
    });
  }

  /**
   * Configurer l'écoute des messages en premier plan
   */
  setupForegroundListener() {
    this.unsubscribeForeground = onForegroundMessage((payload) => {
      console.log('📬 [FCM] Message en premier plan:', payload);

      // Afficher une notification native même si l'app est ouverte
      if (Notification.permission === 'granted') {
        const title = payload.notification?.title || payload.data?.title || 'Synergia';
        const options = {
          body: payload.notification?.body || payload.data?.body,
          icon: NOTIFICATION_ICONS[payload.data?.type] || NOTIFICATION_ICONS.default,
          badge: '/icons/badge-72x72.png',
          tag: payload.data?.tag || 'synergia-foreground',
          data: payload.data,
          vibrate: [100, 50, 100]
        };

        new Notification(title, options);
      }

      // Émettre un événement custom pour l'UI
      window.dispatchEvent(new CustomEvent('fcm-message', { detail: payload }));
    });
  }

  // ==========================================
  // PERMISSIONS
  // ==========================================

  /**
   * Demander la permission pour les notifications
   */
  async requestPermission() {
    try {
      if (!('Notification' in window)) {
        return { granted: false, reason: 'not_supported' };
      }

      const currentPermission = Notification.permission;

      if (currentPermission === 'granted') {
        return { granted: true };
      }

      if (currentPermission === 'denied') {
        return { granted: false, reason: 'denied' };
      }

      // Demander la permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('✅ [FCM] Permission accordée');
        return { granted: true };
      } else {
        console.log('❌ [FCM] Permission refusée');
        return { granted: false, reason: 'rejected' };
      }

    } catch (error) {
      console.error('❌ [FCM] Erreur demande permission:', error);
      return { granted: false, reason: 'error', error };
    }
  }

  /**
   * Vérifier le statut de la permission
   */
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not_supported';
    }
    return Notification.permission;
  }

  // ==========================================
  // GESTION DES TOKENS
  // ==========================================

  /**
   * Obtenir et enregistrer le token FCM pour un utilisateur
   */
  async registerToken(userId) {
    try {
      // Initialiser si nécessaire
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          console.error('❌ [FCM] Initialisation échouée:', initResult.error);
          return { success: false, reason: 'init_failed', error: new Error(initResult.error || 'Initialisation FCM échouée'), initError: initResult.error };
        }
      }

      // Demander la permission si nécessaire
      const permissionResult = await this.requestPermission();
      if (!permissionResult.granted) {
        return { success: false, reason: permissionResult.reason };
      }

      // Obtenir le token (peut lever une exception avec message détaillé)
      let token;
      try {
        token = await getFCMToken();
      } catch (tokenError) {
        console.error('❌ [FCM] Erreur token:', tokenError.message);
        return { success: false, reason: 'token_error', error: tokenError };
      }

      if (!token) {
        return { success: false, reason: 'no_token', error: new Error('Token vide retourné') };
      }

      this.currentToken = token;

      // Enregistrer le token dans Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: serverTimestamp(),
        pushNotificationsEnabled: true
      });

      console.log('✅ [FCM] Token enregistré pour', userId);
      return { success: true, token };

    } catch (error) {
      console.error('❌ [FCM] Erreur enregistrement token:', error);
      return { success: false, reason: 'error', error };
    }
  }

  /**
   * Désactiver les notifications pour un utilisateur
   */
  async unregisterToken(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: null,
        pushNotificationsEnabled: false
      });

      this.currentToken = null;
      console.log('✅ [FCM] Notifications désactivées pour', userId);
      return { success: true };

    } catch (error) {
      console.error('❌ [FCM] Erreur désactivation:', error);
      return { success: false, error };
    }
  }

  // ==========================================
  // ENVOI DE NOTIFICATIONS (via Firestore pour Cloud Functions)
  // ==========================================

  /**
   * Envoyer une notification push à un utilisateur
   * Note: L'envoi réel se fait via Cloud Functions qui lit la collection push_notifications
   */
  async sendPushNotification(targetUserId, notification) {
    try {
      // Vérifier que l'utilisateur a activé les notifications
      const userRef = doc(db, 'users', targetUserId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, reason: 'user_not_found' };
      }

      const userData = userSnap.data();

      if (!userData.fcmToken || !userData.pushNotificationsEnabled) {
        console.log('ℹ️ [FCM] Notifications désactivées pour', targetUserId);
        return { success: false, reason: 'notifications_disabled' };
      }

      // Créer une entrée dans la collection push_notifications
      // Une Cloud Function l'enverra via FCM
      await addDoc(collection(db, 'push_notifications'), {
        targetUserId,
        fcmToken: userData.fcmToken,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          type: notification.type || 'default',
          url: notification.url || '/',
          ...notification.data
        },
        status: 'pending',
        createdAt: serverTimestamp()
      });

      console.log('✅ [FCM] Notification créée pour', targetUserId);
      return { success: true };

    } catch (error) {
      console.error('❌ [FCM] Erreur envoi notification:', error);
      return { success: false, error };
    }
  }

  /**
   * Envoyer une notification à plusieurs utilisateurs
   */
  async sendPushNotificationToMany(userIds, notification) {
    const results = await Promise.all(
      userIds.map(userId => this.sendPushNotification(userId, notification))
    );

    const successful = results.filter(r => r.success).length;
    console.log(`✅ [FCM] ${successful}/${userIds.length} notifications envoyées`);

    return { successful, total: userIds.length, results };
  }

  // ==========================================
  // NOTIFICATIONS PRÉDÉFINIES
  // ==========================================

  /**
   * Notifier une nouvelle quête assignée
   */
  async notifyNewQuest(userId, questTitle, questId) {
    return this.sendPushNotification(userId, {
      title: '🗡️ Nouvelle quête !',
      body: `Tu as été assigné à : ${questTitle}`,
      type: 'quest',
      url: '/quests',
      data: { questId }
    });
  }

  /**
   * Notifier un boost reçu
   */
  async notifyBoostReceived(userId, senderName, boostType) {
    const boostEmojis = {
      encouragement: '💪',
      thanks: '🙏',
      celebration: '🎉',
      support: '🤝'
    };

    return this.sendPushNotification(userId, {
      title: `${boostEmojis[boostType] || '⚡'} Boost reçu !`,
      body: `${senderName} t'a envoyé un boost`,
      type: 'boost',
      url: '/taverne'
    });
  }

  /**
   * Notifier un badge obtenu
   */
  async notifyBadgeEarned(userId, badgeName) {
    return this.sendPushNotification(userId, {
      title: '🏆 Badge débloqué !',
      body: `Tu as obtenu le badge "${badgeName}"`,
      type: 'badge',
      url: '/profile'
    });
  }

  /**
   * Notifier un niveau atteint
   */
  async notifyLevelUp(userId, newLevel) {
    return this.sendPushNotification(userId, {
      title: '🎮 Niveau supérieur !',
      body: `Félicitations ! Tu es maintenant niveau ${newLevel}`,
      type: 'level',
      url: '/profile'
    });
  }

  /**
   * Notifier une demande de congé (pour admin)
   */
  async notifyLeaveRequest(adminId, employeeName, leaveType) {
    return this.sendPushNotification(adminId, {
      title: '📋 Demande de congé',
      body: `${employeeName} a demandé un ${leaveType}`,
      type: 'leave',
      url: '/hr'
    });
  }

  /**
   * Notifier un message reçu
   */
  async notifyMessage(userId, senderName, preview) {
    return this.sendPushNotification(userId, {
      title: `💬 Message de ${senderName}`,
      body: preview.substring(0, 100),
      type: 'message',
      url: '/taverne'
    });
  }

  /**
   * Notifier une nouvelle info
   */
  async notifyNewInfo(userId, infoTitle, category) {
    return this.sendPushNotification(userId, {
      title: '📰 Nouvelle info',
      body: infoTitle,
      type: 'info',
      url: '/infos'
    });
  }

  /**
   * Notifier la validation d'une quête
   */
  async notifyQuestValidated(userId, questTitle, xpGained) {
    return this.sendPushNotification(userId, {
      title: '✅ Quête validée !',
      body: `"${questTitle}" +${xpGained} XP`,
      type: 'quest',
      url: '/quests'
    });
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Afficher une notification locale (sans FCM)
   */
  showLocalNotification(title, options = {}) {
    if (Notification.permission !== 'granted') {
      console.log('ℹ️ [FCM] Permission non accordée pour notification locale');
      return;
    }

    const notification = new Notification(title, {
      icon: NOTIFICATION_ICONS.default,
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.url) {
        window.location.href = options.url;
      }
    };

    return notification;
  }

  /**
   * Nettoyer les ressources
   */
  cleanup() {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
    }
    this.isInitialized = false;
    this.currentToken = null;
  }
}

// Export singleton
const fcmPushService = new FCMPushService();
export default fcmPushService;
export { fcmPushService };

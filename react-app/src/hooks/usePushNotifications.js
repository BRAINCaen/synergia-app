// ==========================================
// 📁 react-app/src/hooks/usePushNotifications.js
// HOOK POUR GÉRER LES NOTIFICATIONS PUSH
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../shared/stores/authStore';
import fcmPushService from '../core/services/fcmPushService';

/**
 * Hook pour gérer les notifications push
 */
export function usePushNotifications() {
  const { user } = useAuthStore();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier le support et le statut initial
  useEffect(() => {
    const checkSupport = async () => {
      setIsLoading(true);

      // Vérifier si les notifications sont supportées
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        setIsEnabled(Notification.permission === 'granted');
      }

      setIsLoading(false);
    };

    checkSupport();
  }, []);

  // Initialiser le service quand l'utilisateur est connecté
  useEffect(() => {
    if (user?.uid && isSupported) {
      fcmPushService.initialize().catch(console.error);
    }
  }, [user?.uid, isSupported]);

  // Demander la permission et activer les notifications
  const enableNotifications = useCallback(async () => {
    if (!user?.uid) {
      setError('Utilisateur non connecté');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fcmPushService.registerToken(user.uid);

      if (result.success) {
        setPermission('granted');
        setIsEnabled(true);
        return true;
      } else {
        // Messages d'erreur détaillés selon la raison d'échec
        const initErrorMessages = {
          'notifications_not_supported': 'Notifications non supportées par ce navigateur.',
          'sw_not_supported': 'Service Workers non supportés.',
          'push_not_supported': 'Push API non supportée par ce navigateur.',
          'https_required': 'HTTPS requis pour les notifications push.',
          'sw_registration_failed': 'Erreur d\'enregistrement du service worker.',
          'fcm_not_supported': 'Firebase Cloud Messaging non disponible sur ce navigateur.',
        };

        const errorMessages = {
          'denied': 'Notifications bloquées. Activez-les dans les paramètres de votre navigateur.',
          'rejected': 'Permission refusée par l\'utilisateur.',
          'no_token': 'Erreur de configuration FCM. Vérifiez la clé VAPID.',
          'token_error': result.error?.message || 'Erreur lors de l\'obtention du token.',
          'not_supported': 'Navigateur non compatible avec les notifications push.',
          'init_failed': result.initError
            ? (initErrorMessages[result.initError] || `Erreur: ${result.initError}`)
            : 'Initialisation du service de notifications échouée.',
          'error': result.error?.message || 'Erreur inconnue.'
        };

        const errorMsg = errorMessages[result.reason] || result.error?.message || 'Impossible d\'activer les notifications';
        console.error('❌ [Push] Erreur activation:', result.reason, result.initError, result.error);
        setError(errorMsg);
        setPermission(Notification.permission);
        return false;
      }
    } catch (err) {
      console.error('Erreur enableNotifications:', err);
      // Messages d'erreur plus descriptifs
      if (err.code === 'messaging/permission-blocked') {
        setError('Notifications bloquées. Autorisez-les dans les paramètres de votre navigateur.');
      } else if (err.code === 'messaging/unsupported-browser') {
        setError('Navigateur non compatible avec les notifications push.');
      } else if (err.code === 'messaging/failed-service-worker-registration') {
        setError('Erreur d\'enregistrement du service worker.');
      } else if (err.message?.includes('VAPID')) {
        setError('Configuration VAPID manquante.');
      } else {
        setError(`Erreur: ${err.message || 'Impossible d\'activer les notifications'}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Désactiver les notifications
  const disableNotifications = useCallback(async () => {
    if (!user?.uid) return false;

    setIsLoading(true);

    try {
      await fcmPushService.unregisterToken(user.uid);
      setIsEnabled(false);
      return true;
    } catch (err) {
      console.error('Erreur disableNotifications:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Tester les notifications
  const testNotification = useCallback(() => {
    fcmPushService.showLocalNotification('Test Synergia', {
      body: 'Les notifications fonctionnent ! 🎉',
      icon: '/icons/icon-192x192.png'
    });
  }, []);

  return {
    isSupported,
    permission,
    isEnabled,
    isLoading,
    error,
    enableNotifications,
    disableNotifications,
    testNotification
  };
}

export default usePushNotifications;

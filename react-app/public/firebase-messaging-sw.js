// ==========================================
// Firebase Cloud Messaging Service Worker
// Gère les notifications push en arrière-plan
// ==========================================
//
// ⚠️ CONFIGURATION REQUISE:
// 1. Remplacez les valeurs ci-dessous par votre configuration Firebase
//    (trouvable dans Firebase Console > Project Settings > Your apps)
// 2. Ajoutez VITE_FIREBASE_VAPID_KEY dans votre .env
//    (trouvable dans Firebase Console > Project Settings > Cloud Messaging > Web Push certificates)
//
// ==========================================

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (valeurs publiques - pas de secrets)
// TODO: Remplacez par vos vraies valeurs Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBxxxxxx", // Remplacez par votre API key
  authDomain: "synergia-app-f27e7.firebaseapp.com",
  projectId: "synergia-app-f27e7",
  storageBucket: "synergia-app-f27e7.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID", // Remplacez par votre Sender ID
  appId: "YOUR_APP_ID" // Remplacez par votre App ID
});

const messaging = firebase.messaging();

// Gestionnaire de messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Message reçu en arrière-plan:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Synergia';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.tag || 'synergia-notification',
    data: payload.data || {},
    vibrate: [100, 50, 100],
    actions: getNotificationActions(payload.data?.type),
    requireInteraction: payload.data?.priority === 'high'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Actions selon le type de notification
function getNotificationActions(type) {
  switch (type) {
    case 'quest':
    case 'task':
      return [
        { action: 'view', title: 'Voir la quête' },
        { action: 'dismiss', title: 'Plus tard' }
      ];
    case 'boost':
      return [
        { action: 'view', title: 'Voir le boost' },
        { action: 'reply', title: 'Répondre' }
      ];
    case 'message':
      return [
        { action: 'reply', title: 'Répondre' },
        { action: 'view', title: 'Voir' }
      ];
    case 'leave':
      return [
        { action: 'approve', title: 'Approuver' },
        { action: 'view', title: 'Voir' }
      ];
    default:
      return [
        { action: 'view', title: 'Voir' }
      ];
  }
}

// Gestionnaire de clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic sur notification:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  // Déterminer l'URL à ouvrir
  let url = '/';

  if (action === 'dismiss') {
    return;
  }

  switch (data.type) {
    case 'quest':
    case 'task':
      url = '/quests';
      break;
    case 'boost':
      url = '/taverne';
      break;
    case 'message':
      url = '/taverne';
      break;
    case 'leave':
      url = '/hr';
      break;
    case 'badge':
    case 'level':
      url = '/profile';
      break;
    case 'info':
      url = '/infos';
      break;
    default:
      url = data.url || '/';
  }

  // Ouvrir ou focus la fenêtre
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher une fenêtre déjà ouverte
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Gestionnaire d'installation
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installé');
  self.skipWaiting();
});

// Gestionnaire d'activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activé');
  event.waitUntil(clients.claim());
});

console.log('[SW] Firebase Messaging Service Worker chargé');

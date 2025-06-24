// ===================================================================
// 📱 SERVICE WORKER CORRIGÉ POUR SYNERGIA v3.5
// Fichier: react-app/public/sw.js
// ===================================================================

const CACHE_NAME = 'synergia-v3.5.1'; // ⭐ VERSION MISE À JOUR
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Ressources statiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Liste des domaines à ignorer pour éviter les erreurs CORS
const IGNORE_DOMAINS = [
  'chrome-extension',
  'moz-extension',
  'firefox',
  'googleapis.com',
  'firebaseapp.com',
  'firebase.com'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('📱 Service Worker v3.5.1: Installation');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('💾 Mise en cache des ressources statiques v3.5.1');
      return cache.addAll(STATIC_ASSETS.filter(asset => asset !== '/offline.html')); // Ignorer si pas disponible
    }).catch(err => {
      console.warn('⚠️ Erreur mise en cache statique:', err);
      // Ne pas faire échouer l'installation pour des erreurs de cache
      return Promise.resolve();
    })
  );
  
  // ⭐ FORCER l'activation immédiate pour écraser l'ancien SW
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('📱 Service Worker v3.5.1: Activation');
  
  event.waitUntil(
    Promise.all([
      // Supprimer TOUS les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Supprimer TOUT cache qui n'est pas la version actuelle
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // ⭐ FORCER la prise de contrôle immédiate
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker v3.5.1 activé et nettoyage terminé');
      // ⭐ FORCER le rechargement de toutes les pages ouvertes
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: '3.5.1',
            message: 'Service Worker mis à jour, rechargement recommandé'
          });
        });
      });
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorer les domaines problématiques
  if (IGNORE_DOMAINS.some(domain => url.hostname.includes(domain))) {
    return;
  }
  
  // ⭐ STRATÉGIE : Network First pour le HTML (toujours chercher la dernière version)
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si la requête réseau réussit, mettre en cache et retourner
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si pas de réseau, utiliser le cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }
  
  // ⭐ STRATÉGIE : Cache First pour les assets statiques MAIS vérifier la fraîcheur
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' || 
      event.request.destination === 'image') {
    
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Si on a une version en cache ET qu'elle est récente (< 1h), l'utiliser
        if (cachedResponse) {
          const cacheDate = cachedResponse.headers.get('date');
          const cacheTime = cacheDate ? new Date(cacheDate).getTime() : 0;
          const now = Date.now();
          const oneHour = 60 * 60 * 1000;
          
          // Si le cache est récent (< 1h), l'utiliser
          if (now - cacheTime < oneHour) {
            return cachedResponse;
          }
        }
        
        // Sinon, aller chercher sur le réseau
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Si pas de réseau, utiliser le cache même s'il est vieux
          return cachedResponse;
        });
      })
    );
    return;
  }
  
  // Pour toutes les autres requêtes : Network First avec fallback cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// ⭐ AJOUT : Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('📱 Message reçu: SKIP_WAITING');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('📱 Message reçu: CLEAR_CACHE');
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('🗑️ Tous les caches supprimés');
      event.ports[0].postMessage({ success: true });
    });
  }
});

// ⭐ AJOUT : Notification de mise à jour disponible
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Vérifier s'il y a une nouvelle version
    fetch('/version.json', { cache: 'no-cache' })
      .then(response => response.json())
      .then(data => {
        if (data.version !== '3.5.1') {
          event.ports[0].postMessage({
            type: 'UPDATE_AVAILABLE',
            version: data.version
          });
        }
      })
      .catch(() => {
        // Ignorer les erreurs de vérification
      });
  }
});

console.log('📱 Service Worker v3.5.1 chargé');

// ===================================================================
// 📱 SERVICE WORKER CORRIGÉ POUR SYNERGIA v3.5.2
// Fichier: react-app/public/sw.js
// ===================================================================

const CACHE_NAME = 'synergia-v3.5.2';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Ressources statiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// 🚀 FONCTION POUR FILTRER LES REQUÊTES PROBLÉMATIQUES
function shouldIgnoreRequest(request) {
  const url = new URL(request.url);
  
  // Ignorer les extensions navigateur
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'ms-browser-extension:') {
    return true;
  }
  
  // Ignorer les domaines externes problématiques
  const ignoreDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.com',
    'doubleclick.net'
  ];
  
  if (ignoreDomains.some(domain => url.hostname.includes(domain))) {
    return true;
  }
  
  // Ignorer les requêtes non-HTTP
  if (!url.protocol.startsWith('http')) {
    return true;
  }
  
  return false;
}

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('📱 Service Worker v3.5.2: Installation');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('💾 Mise en cache des ressources statiques v3.5.2');
      // 🚀 CACHE SEULEMENT LES RESSOURCES SÛRES
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('⚠️ Erreur mise en cache de certains assets:', err);
        // Continuer même si certains assets échouent
        return Promise.resolve();
      });
    })
  );
  
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('📱 Service Worker v3.5.2: Activation');
  
  event.waitUntil(
    Promise.all([
      // Supprimer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre contrôle immédiatement
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker v3.5.2 activé et nettoyage terminé');
    })
  );
});

// 🚀 INTERCEPTION DES REQUÊTES AVEC FILTRAGE AMÉLIORÉ
self.addEventListener('fetch', (event) => {
  // 🛡️ IGNORER LES REQUÊTES PROBLÉMATIQUES
  if (shouldIgnoreRequest(event.request)) {
    return; // Laisser le navigateur gérer
  }
  
  const url = new URL(event.request.url);
  
  // Pour les assets statiques de l'app
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Si on a une version en cache, vérifier si elle est récente
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
          // 🚀 VÉRIFIER LA VALIDITÉ DE LA RÉPONSE AVANT DE CACHER
          if (response && 
              response.status === 200 && 
              response.type === 'basic') {
            
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              // 🛡️ CACHE SEULEMENT SI PAS D'ERREUR
              cache.put(event.request, responseClone).catch(err => {
                console.warn('⚠️ Erreur mise en cache:', err.message);
              });
            });
          }
          return response;
        }).catch(() => {
          // Si pas de réseau, utiliser le cache même s'il est vieux
          return cachedResponse || new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }
  
  // 🚀 POUR LES REQUÊTES EXTERNES : Network First simple
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 🛡️ CACHE SEULEMENT LES RÉPONSES VALIDES
        if (response && 
            response.status === 200 && 
            response.type === 'basic' &&
            url.origin === location.origin) {
          
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone).catch(err => {
              // Ignorer silencieusement les erreurs de cache
            });
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback vers le cache
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || new Response('Offline', { status: 503 });
        });
      })
  );
});

// 🚀 GESTION DES MESSAGES
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
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    }).catch(err => {
      console.warn('⚠️ Erreur nettoyage cache:', err);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: false, error: err.message });
      }
    });
  }
});

// 🚀 GESTION D'ERREURS GLOBALES
self.addEventListener('error', (event) => {
  console.warn('⚠️ SW Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.warn('⚠️ SW Unhandled Rejection:', event.reason);
  // Empêcher l'erreur de remonter
  event.preventDefault();
});

console.log('📱 Service Worker v3.5.2 chargé - Filtrage chrome-extension activé');

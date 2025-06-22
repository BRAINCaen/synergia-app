const CACHE_NAME = 'synergia-v3.1.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Ressources à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('💾 Cache des ressources statiques');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
      console.error('Erreur mise en cache:', err);
    })
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes - CORRIGÉ pour éviter les erreurs chrome-extension
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes problématiques
  if (event.request.url.includes('chrome-extension') ||
      event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis')) {
    return;
  }
  
  // Ignorer les requêtes non-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then(fetchResponse => {
        // Mettre en cache seulement les requêtes GET valides
        if (event.request.method === 'GET' && fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone).catch(err => {
              // Ignorer silencieusement les erreurs de cache
              console.debug('Cache ignoré pour:', event.request.url);
            });
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Page offline si pas de connexion
        if (event.request.mode === 'navigate') {
          return new Response('Mode hors ligne', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        }
      });
    })
  );
});

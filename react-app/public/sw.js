// ===================================================================
// 📱 SERVICE WORKER CORRIGÉ POUR SYNERGIA
// Fichier: react-app/public/sw.js
// ===================================================================

const CACHE_NAME = 'synergia-v3.1.0';
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
  console.log('📱 Service Worker: Installation');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('💾 Mise en cache des ressources statiques');
      return cache.addAll(STATIC_ASSETS.filter(asset => asset !== '/offline.html')); // Ignorer si pas disponible
    }).catch(err => {
      console.warn('⚠️ Erreur mise en cache statique:', err);
      // Ne pas faire échouer l'installation pour des erreurs de cache
      return Promise.resolve();
    })
  );
  
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('📱 Service Worker: Activation');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Supprimer les anciens caches
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activé et nettoyage terminé');
    })
  );
  
  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Fonction pour vérifier si une URL doit être ignorée
function shouldIgnoreRequest(request) {
  const url = request.url;
  
  // Ignorer les extensions de navigateur
  if (IGNORE_DOMAINS.some(domain => url.includes(domain))) {
    return true;
  }
  
  // Ignorer les requêtes non-HTTP
  if (!url.startsWith('http')) {
    return true;
  }
  
  // Ignorer les requêtes vers Firebase (gérées par Firebase SDK)
  if (url.includes('firestore.googleapis.com') || 
      url.includes('identitytoolkit.googleapis.com') ||
      url.includes('securetoken.googleapis.com')) {
    return true;
  }
  
  return false;
}

// Interception des requêtes - CORRIGÉ pour éviter les erreurs
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes problématiques
  if (shouldIgnoreRequest(event.request)) {
    return;
  }
  
  // Ignorer les requêtes POST/PUT/DELETE (ne pas les mettre en cache)
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Retourner la version en cache si disponible
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Sinon, faire la requête réseau
      return fetch(event.request.clone()).then(networkResponse => {
        // Vérifier que la réponse est valide
        if (!networkResponse || 
            networkResponse.status !== 200 || 
            networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Mettre en cache seulement les ressources de notre domaine
        const responseToCache = networkResponse.clone();
        
        caches.open(DYNAMIC_CACHE).then(cache => {
          // Éviter les erreurs de mise en cache
          try {
            cache.put(event.request, responseToCache);
          } catch (error) {
            console.debug('Cache ignoré pour:', event.request.url);
          }
        });
        
        return networkResponse;
        
      }).catch(error => {
        console.debug('Erreur réseau pour:', event.request.url);
        
        // Retourner une page offline pour les navigations
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html').then(offlineResponse => {
            return offlineResponse || new Response(
              `<!DOCTYPE html>
              <html>
              <head>
                <title>Synergia - Mode Hors Ligne</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px;
                    background: #f3f4f6;
                  }
                  .container {
                    max-width: 400px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  }
                  h1 { color: #374151; margin-bottom: 20px; }
                  p { color: #6b7280; margin-bottom: 20px; }
                  button {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                  }
                  button:hover { background: #2563eb; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>📱 Mode Hors Ligne</h1>
                  <p>Vous êtes actuellement hors ligne. Synergia sera disponible dès que votre connexion sera rétablie.</p>
                  <button onclick="window.location.reload()">🔄 Réessayer</button>
                </div>
              </body>
              </html>`,
              {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' }
              }
            );
          });
        }
        
        // Pour les autres requêtes, retourner une erreur
        return new Response('Ressource non disponible hors ligne', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Nettoyage périodique du cache dynamique
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open(DYNAMIC_CACHE).then(cache => {
      return cache.keys().then(requests => {
        // Garder seulement les 50 dernières entrées
        if (requests.length > 50) {
          const toDelete = requests.slice(0, requests.length - 50);
          return Promise.all(
            toDelete.map(request => cache.delete(request))
          );
        }
      });
    })
  );
});

// Log de démarrage
console.log('📱 Synergia Service Worker v3.1.0 - Chargé');
console.log('🔧 Fonctionnalités: Cache intelligent, Mode offline, Auto-nettoyage');

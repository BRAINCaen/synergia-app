const CACHE_NAME = 'synergia-v3.0'
const STATIC_CACHE = `${CACHE_NAME}-static`
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`

const STATIC_ASSETS = [
  '/',
  '/manifest.json'
]

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('💾 Cache statique')
      return cache.addAll(STATIC_ASSETS)
    }).catch(err => {
      console.error('❌ Erreur cache:', err)
    })
  )
  self.skipWaiting()
})

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Suppression cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Interception requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer Firebase et extensions
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('chrome-extension') ||
      !event.request.url.startsWith('http')) {
    return
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response
      
      return fetch(event.request).then(fetchResponse => {
        if (event.request.method === 'GET' && fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone()
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone).catch(() => {
              // Ignorer erreurs cache
            })
          })
        }
        return fetchResponse
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return new Response('Mode hors ligne', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          })
        }
      })
    })
  )
})

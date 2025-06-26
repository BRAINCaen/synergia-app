// ===================================================================
// 🚨 SERVICE WORKER D'URGENCE - SE DÉSINSTALLE AUTOMATIQUEMENT
// Fichier: react-app/public/sw.js
// ===================================================================

console.log('🚨 SERVICE WORKER D\'URGENCE v3.5.3 - DÉSINSTALLATION AUTOMATIQUE');

// Installation : se désinstaller immédiatement
self.addEventListener('install', (event) => {
  console.log('🚨 SW d\'urgence: Installation et désinstallation immédiate');
  
  event.waitUntil(
    Promise.all([
      // Vider TOUS les caches
      caches.keys().then(cacheNames => {
        console.log('🗑️ Suppression de tous les caches...');
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Suppression cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Se désinstaller
      self.registration.unregister().then(() => {
        console.log('🚨 Service Worker désinstallé avec succès');
      })
    ])
  );
  
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activation : nettoyer et se retirer
self.addEventListener('activate', (event) => {
  console.log('🚨 SW d\'urgence: Activation et nettoyage final');
  
  event.waitUntil(
    Promise.all([
      // Vider tous les caches restants
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }),
      // Prendre contrôle de toutes les pages
      self.clients.claim()
    ]).then(() => {
      console.log('🚨 Nettoyage terminé, rechargement des pages...');
      
      // Envoyer message à toutes les pages ouvertes
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_EMERGENCY_RELOAD',
            message: 'Service Worker d\'urgence - rechargement forcé'
          });
        });
      });
    })
  );
});

// NE PAS intercepter les requêtes - laisser le navigateur gérer
self.addEventListener('fetch', (event) => {
  // Ne rien faire - laisser passer toutes les requêtes
  return;
});

// Gestion des messages : forcer rechargement
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'EMERGENCY_RELOAD') {
    console.log('🚨 Message d\'urgence reçu - rechargement...');
    
    // Désinstaller immédiatement
    self.registration.unregister().then(() => {
      console.log('🚨 SW d\'urgence désinstallé');
    });
  }
});

// Supprimer tous les event listeners problématiques
self.removeEventListener = () => {};

console.log('🚨 Service Worker d\'urgence chargé - Mode désinstallation active');

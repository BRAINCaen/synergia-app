// ===================================================================
// 🚨 SERVICE WORKER D'URGENCE - FORCE LA MISE À JOUR IMMÉDIATE
// Fichier: react-app/public/sw.js (REMPLACER COMPLÈTEMENT)
// ===================================================================

console.log('🚨 SERVICE WORKER D\'URGENCE - FORCE UPDATE v3.5.3');

// ==========================================
// 🧹 NETTOYAGE IMMÉDIAT À L'INSTALLATION
// ==========================================
self.addEventListener('install', (event) => {
  console.log('🚨 SW Urgence: Nettoyage immédiat en cours...');
  
  event.waitUntil(
    Promise.all([
      // Supprimer TOUS les caches existants
      caches.keys().then(cacheNames => {
        console.log('🗑️ Suppression de', cacheNames.length, 'caches...');
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Suppression cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      
      // Forcer l'activation immédiate
      self.skipWaiting()
    ]).then(() => {
      console.log('✅ Nettoyage terminé - SW d\'urgence installé');
    })
  );
});

// ==========================================
// 🔄 ACTIVATION ET PRISE DE CONTRÔLE
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('🚨 SW Urgence: Activation et prise de contrôle...');
  
  event.waitUntil(
    Promise.all([
      // Vider tous les caches restants
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }),
      
      // Prendre contrôle immédiat de toutes les pages
      self.clients.claim()
    ]).then(() => {
      console.log('🚨 SW d\'urgence: Contrôle pris, rechargement des pages...');
      
      // Forcer le rechargement de toutes les pages ouvertes
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          console.log('📱 Rechargement page:', client.url);
          client.postMessage({
            type: 'FORCE_RELOAD',
            message: 'Mise à jour forcée - rechargement immédiat'
          });
        });
      });
    })
  );
});

// ==========================================
// 🚫 AUCUNE INTERCEPTION - TOUJOURS DU RÉSEAU
// ==========================================
self.addEventListener('fetch', (event) => {
  // NE RIEN METTRE EN CACHE - Toujours chercher sur le réseau
  console.log('🌐 Requête réseau direct:', event.request.url);
  
  event.respondWith(
    fetch(event.request.clone())
      .then(response => {
        console.log('✅ Réponse réseau:', response.status, event.request.url);
        return response;
      })
      .catch(error => {
        console.error('❌ Erreur réseau:', error, event.request.url);
        // En cas d'erreur, ne pas servir de cache - laisser l'erreur passer
        throw error;
      })
  );
});

// ==========================================
// 📨 GESTION DES MESSAGES D'URGENCE
// ==========================================
self.addEventListener('message', (event) => {
  console.log('📨 Message SW reçu:', event.data);
  
  if (event.data && event.data.type === 'EMERGENCY_UPDATE') {
    console.log('🚨 Message d\'urgence - nettoyage et rechargement...');
    
    // Supprimer tous les caches
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(name => caches.delete(name)));
    }).then(() => {
      console.log('🧹 Tous les caches supprimés');
      
      // Forcer le rechargement de la page
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'RELOAD_NOW' });
        });
      });
    });
  }
});

// ==========================================
// 🔄 AUTO-DÉSINSTALLATION APRÈS 1 HEURE
// ==========================================
setTimeout(() => {
  console.log('🚨 SW d\'urgence: Auto-désinstallation après 1h');
  
  self.registration.unregister().then(() => {
    console.log('✅ Service Worker d\'urgence désinstallé automatiquement');
  });
}, 60 * 60 * 1000); // 1 heure

console.log('🚨 Service Worker d\'urgence activé - Mode force update');
console.log('🗑️ Aucun cache utilisé - Toujours réseau direct');
console.log('🔄 Auto-désinstallation dans 1h');

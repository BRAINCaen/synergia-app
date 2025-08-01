// ===================================================================
// 🔧 SERVICE WORKER SIMPLE - SANS RECHARGEMENT AUTOMATIQUE
// Fichier: react-app/public/sw.js (REMPLACER COMPLÈTEMENT)
// ===================================================================

console.log('🔧 Service Worker Simple v3.5.3 - Pas de rechargement auto');

// ==========================================
// 📦 INSTALLATION SIMPLE
// ==========================================
self.addEventListener('install', (event) => {
  console.log('📦 SW: Installation simple...');
  
  event.waitUntil(
    // Nettoyer les anciens caches uniquement
    caches.keys().then(cacheNames => {
      const oldCaches = cacheNames.filter(name => 
        name.includes('workbox') || 
        name.includes('runtime-') || 
        name.includes('static-')
      );
      
      if (oldCaches.length > 0) {
        console.log('🗑️ Suppression', oldCaches.length, 'anciens caches');
        return Promise.all(oldCaches.map(name => caches.delete(name)));
      }
    }).then(() => {
      console.log('✅ Installation terminée - Activation en attente');
    })
  );
  
  // PAS de skipWaiting() - Laisser l'utilisateur contrôler
});

// ==========================================
// ⚡ ACTIVATION CONTRÔLÉE
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('⚡ SW: Activation...');
  
  event.waitUntil(
    // Nettoyer les caches une dernière fois
    caches.keys().then(cacheNames => {
      const cachesToDelete = cacheNames.filter(name => 
        name.includes('old') || name.includes('temp')
      );
      
      return Promise.all(cachesToDelete.map(name => caches.delete(name)));
    }).then(() => {
      console.log('✅ SW activé - Prêt à servir');
      // PAS de clients.claim() - Pas de prise de contrôle forcée
    })
  );
});

// ==========================================
// 🌐 STRATÉGIE RÉSEAU SIMPLE
// ==========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Pour les fichiers de l'app, toujours vérifier le réseau d'abord
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Si le réseau fonctionne, utiliser la réponse réseau
          if (response && response.status === 200) {
            console.log('🌐 Réseau OK:', url.pathname);
            return response;
          }
          throw new Error('Réponse réseau invalide');
        })
        .catch(error => {
          // En cas d'erreur réseau, essayer le cache
          console.log('📦 Tentative cache pour:', url.pathname);
          return caches.match(request).then(cached => {
            if (cached) {
              console.log('✅ Trouvé en cache:', url.pathname);
              return cached;
            }
            throw error;
          });
        })
    );
  }
});

// ==========================================
// 📨 MESSAGES MANUELS UNIQUEMENT
// ==========================================
self.addEventListener('message', (event) => {
  console.log('📨 Message SW reçu:', event.data);
  
  if (event.data && event.data.type === 'MANUAL_RELOAD') {
    console.log('🔄 Rechargement manuel demandé');
    
    // Nettoyer et informer, mais ne pas recharger automatiquement
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(name => caches.delete(name)));
    }).then(() => {
      // Informer la page que le nettoyage est terminé
      event.ports[0].postMessage({ type: 'CLEANUP_DONE' });
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Activation forcée demandée');
    self.skipWaiting();
  }
});

// ==========================================
// ❌ PLUS D'AUTO-DÉSINSTALLATION
// ==========================================
// Service Worker reste actif jusqu'à désinstallation manuelle

console.log('✅ Service Worker simple initialisé');
console.log('🌐 Stratégie: Réseau d\'abord, cache en fallback');
console.log('🔧 Contrôle: Manuel uniquement, pas d\'automatismes');

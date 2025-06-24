// ===================================================================
// 🧹 CACHE BUSTER POUR SYNERGIA v3.5
// Fichier: react-app/src/utils/cacheBuster.js
// ===================================================================

class CacheBuster {
  constructor() {
    this.version = '3.5.1';
    this.storageKey = 'synergia_version';
    this.init();
  }

  init() {
    // Vérifier si c'est la première fois ou une nouvelle version
    const storedVersion = localStorage.getItem(this.storageKey);
    
    if (!storedVersion || storedVersion !== this.version) {
      console.log('🧹 Nouvelle version détectée, nettoyage cache...');
      this.clearAllCaches();
      localStorage.setItem(this.storageKey, this.version);
    }

    // Écouter les messages du Service Worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_UPDATED') {
        console.log('📱 Service Worker mis à jour:', event.data.version);
        this.showUpdateNotification();
      }
    });
  }

  // Méthode principale pour forcer le refresh
  async forceRefresh() {
    console.log('🚀 FORCE REFRESH: Début du processus...');
    
    try {
      // 1. Vider tous les caches navigateur
      await this.clearBrowserCaches();
      
      // 2. Nettoyer le Service Worker
      await this.clearServiceWorkerCaches();
      
      // 3. Vider le localStorage/sessionStorage
      this.clearWebStorage();
      
      // 4. Forcer le rechargement complet
      await this.performHardReload();
      
      console.log('✅ FORCE REFRESH: Terminé');
    } catch (error) {
      console.error('❌ Erreur durant le force refresh:', error);
      // Fallback: rechargement simple
      window.location.reload(true);
    }
  }

  // Vider tous les caches navigateur
  async clearBrowserCaches() {
    console.log('🧹 Vidage des caches navigateur...');
    
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`🗑️ Suppression cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        console.log('✅ Caches navigateur vidés');
      } catch (error) {
        console.warn('⚠️ Erreur vidage caches:', error);
      }
    }
  }

  // Nettoyer le Service Worker
  async clearServiceWorkerCaches() {
    console.log('🧹 Nettoyage Service Worker...');
    
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          // Envoyer message pour vider les caches
          if (registration.active) {
            const messageChannel = new MessageChannel();
            registration.active.postMessage(
              { type: 'CLEAR_CACHE' },
              [messageChannel.port2]
            );
            
            // Attendre la confirmation
            await new Promise((resolve) => {
              messageChannel.port1.onmessage = () => resolve();
              setTimeout(resolve, 1000); // Timeout après 1s
            });
          }
          
          // Forcer la mise à jour du SW
          await registration.update();
        }
        
        console.log('✅ Service Worker nettoyé');
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage Service Worker:', error);
      }
    }
  }

  // Vider le stockage web
  clearWebStorage() {
    console.log('🧹 Vidage du stockage web...');
    
    try {
      // Garder seulement les données essentielles
      const essentialKeys = [
        'synergia_version',
        'firebase:authUser',
        'firebase:persistence'
      ];
      
      // Vider localStorage en gardant l'essentiel
      const itemsToKeep = {};
      essentialKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) itemsToKeep[key] = value;
      });
      
      localStorage.clear();
      
      Object.entries(itemsToKeep).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      // Vider sessionStorage
      sessionStorage.clear();
      
      console.log('✅ Stockage web nettoyé');
    } catch (error) {
      console.warn('⚠️ Erreur nettoyage stockage:', error);
    }
  }

  // Effectuer un rechargement dur
  async performHardReload() {
    console.log('🚀 Rechargement dur de la page...');
    
    // Ajouter un timestamp pour éviter le cache
    const timestamp = Date.now();
    const url = new URL(window.location);
    url.searchParams.set('_t', timestamp);
    url.searchParams.set('_v', this.version);
    
    // Technique 1: location.replace avec cache-busting
    window.location.replace(url.toString());
  }

  // Afficher une notification de mise à jour
  showUpdateNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Synergia mis à jour', {
        body: 'Une nouvelle version est disponible. Rechargement...',
        icon: '/favicon.ico',
        tag: 'synergia-update'
      });
    }
    
    // Fallback: console
    console.log('🎉 Synergia mis à jour vers la version', this.version);
  }

  // Méthode utilitaire pour vérifier les mises à jour
  async checkForUpdates() {
    try {
      const response = await fetch('/version.json', { 
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.version !== this.version) {
          console.log('🆕 Nouvelle version disponible:', data.version);
          return data.version;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur vérification mise à jour:', error);
    }
    
    return null;
  }

  // Méthode pour debugger le cache
  async debugCacheStatus() {
    console.log('🔍 DEBUG: État des caches');
    
    // Caches API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('📦 Caches disponibles:', cacheNames);
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        console.log(`📂 Cache "${cacheName}": ${requests.length} entrées`);
      }
    }
    
    // Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('👷 Service Workers:', registrations.length);
      registrations.forEach((reg, index) => {
        console.log(`SW ${index}:`, {
          scope: reg.scope,
          state: reg.active?.state,
          scriptURL: reg.active?.scriptURL
        });
      });
    }
    
    // Stockage
    console.log('💾 localStorage:', Object.keys(localStorage));
    console.log('🔄 sessionStorage:', Object.keys(sessionStorage));
  }
}

// Instance globale
const cacheBuster = new CacheBuster();

// Exposer les méthodes en global pour utilisation console
window.forceDashboardReload = () => cacheBuster.forceRefresh();
window.debugCache = () => cacheBuster.debugCacheStatus();
window.checkUpdates = () => cacheBuster.checkForUpdates();

// Auto-vérification périodique (toutes les 5 minutes)
setInterval(() => {
  cacheBuster.checkForUpdates().then(newVersion => {
    if (newVersion) {
      console.log('🔄 Mise à jour automatique vers', newVersion);
      setTimeout(() => cacheBuster.forceRefresh(), 2000);
    }
  });
}, 5 * 60 * 1000);

export default cacheBuster;

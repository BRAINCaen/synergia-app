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
      console.log('🧹 Nouvelle version détectée, préparation nettoyage...');
      localStorage.setItem(this.storageKey, this.version);
    }

    // Écouter les messages du Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          console.log('📱 Service Worker mis à jour:', event.data.version);
          this.showUpdateNotification();
        }
      });
    }
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
        console.log(`📦 Trouvé ${cacheNames.length} caches:`, cacheNames);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`🗑️ Suppression cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        console.log('✅ Tous les caches navigateur vidés');
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
        console.log(`👷 Trouvé ${registrations.length} Service Workers`);
        
        for (const registration of registrations) {
          // Envoyer message pour vider les caches
          if (registration.active) {
            console.log('📨 Envoi message CLEAR_CACHE au SW...');
            const messageChannel = new MessageChannel();
            registration.active.postMessage(
              { type: 'CLEAR_CACHE' },
              [messageChannel.port2]
            );
            
            // Attendre la confirmation
            await new Promise((resolve) => {
              messageChannel.port1.onmessage = (event) => {
                console.log('✅ SW a confirmé le nettoyage cache');
                resolve();
              };
              setTimeout(() => {
                console.log('⏰ Timeout SW cache clear');
                resolve();
              }, 2000);
            });
          }
          
          // Forcer la mise à jour du SW
          console.log('🔄 Forcer mise à jour SW...');
          await registration.update();
        }
        
        console.log('✅ Service Worker nettoyé et mis à jour');
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage Service Worker:', error);
      }
    }
  }

  // Vider le stockage web (en préservant Firebase Auth)
  clearWebStorage() {
    console.log('🧹 Vidage du stockage web...');
    
    try {
      // Identifier et sauvegarder les clés Firebase essentielles
      const firebaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('firebase:authUser') || 
        key.includes('firebase:persistence') ||
        key === 'synergia_app_version' ||
        key === 'synergia_version'
      );
      
      console.log('🔐 Clés Firebase préservées:', firebaseKeys.length);
      
      // Sauvegarder les valeurs importantes
      const preservedData = {};
      firebaseKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          preservedData[key] = value;
        }
      });
      
      // Vider tout
      localStorage.clear();
      sessionStorage.clear();
      
      // Restaurer les données importantes
      Object.entries(preservedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      console.log('✅ Stockage web nettoyé (auth Firebase préservée)');
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
    
    // Nettoyer les anciens paramètres de cache busting
    url.searchParams.delete('_t');
    url.searchParams.delete('_v');
    url.searchParams.delete('_cacheBust');
    url.searchParams.delete('emergency_clean');
    
    // Ajouter les nouveaux
    url.searchParams.set('_cacheBust', timestamp);
    url.searchParams.set('_version', this.version);
    url.searchParams.set('_forceReload', 'true');
    
    console.log('🔗 Rechargement vers:', url.toString());
    
    // Technique: location.replace avec cache-busting
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
    
    console.log('🎉 Synergia mis à jour vers la version', this.version);
  }

  // Méthode pour debugger le cache
  async debugCacheStatus() {
    console.log('%c🔍 DEBUG: État des caches Synergia v3.5.1', 'color: #3b82f6; font-size: 14px; font-weight: bold;');
    console.log('═'.repeat(50));
    
    // Caches API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`📦 Caches disponibles: ${cacheNames.length}`);
      
      if (cacheNames.length === 0) {
        console.log('   ✅ Aucun cache (c\'est normal après force refresh)');
      } else {
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          console.log(`📂 Cache "${cacheName}": ${requests.length} entrées`);
          
          // Afficher quelques URLs d'exemple
          if (requests.length > 0) {
            const examples = requests.slice(0, 3).map(req => 
              req.url.replace(window.location.origin, '')
            );
            console.log(`   └─ Exemples: ${examples.join(', ')}`);
          }
        }
      }
    }
    
    console.log('─'.repeat(30));
    
    // Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`👷 Service Workers: ${registrations.length}`);
      
      registrations.forEach((reg, index) => {
        console.log(`SW ${index + 1}:`, {
          scope: reg.scope.replace(window.location.origin, ''),
          state: reg.active?.state,
          scriptURL: reg.active?.scriptURL?.split('/').pop()
        });
      });
    }
    
    console.log('─'.repeat(30));
    
    // Stockage
    const localStorageKeys = Object.keys(localStorage);
    const sessionStorageKeys = Object.keys(sessionStorage);
    
    console.log(`💾 localStorage: ${localStorageKeys.length} entrées`);
    if (localStorageKeys.length > 0) {
      const firebaseKeys = localStorageKeys.filter(k => k.includes('firebase'));
      const synergiaKeys = localStorageKeys.filter(k => k.includes('synergia'));
      const otherKeys = localStorageKeys.filter(k => !k.includes('firebase') && !k.includes('synergia'));
      
      if (firebaseKeys.length > 0) console.log(`   🔐 Firebase: ${firebaseKeys.length}`);
      if (synergiaKeys.length > 0) console.log(`   🚀 Synergia: ${synergiaKeys.length}`);
      if (otherKeys.length > 0) console.log(`   📄 Autres: ${otherKeys.length}`);
    }
    
    console.log(`🔄 sessionStorage: ${sessionStorageKeys.length} entrées`);
    
    console.log('─'.repeat(30));
    
    // Infos navigateur
    console.log('🌐 Navigateur:', navigator.userAgent.match(/Chrome|Firefox|Safari|Edge/)?.[0] || 'Unknown');
    console.log('🔗 URL actuelle:', window.location.pathname + window.location.search);
    console.log('⏰ Timestamp debug:', new Date().toLocaleTimeString());
    console.log('📱 Version app:', window.SYNERGIA_VERSION || 'non définie');
    
    console.log('═'.repeat(50));
  }

  // Méthode pour forcer un refresh simple
  simpleRefresh() {
    console.log('🔄 Simple refresh...');
    window.location.reload(true);
  }

  // Méthode d'urgence pour tout nettoyer
  emergencyClean() {
    console.log('🚨 NETTOYAGE D\'URGENCE EN COURS...');
    
    try {
      // 1. Vider tout le storage sans exception
      console.log('🗑️ Vidage storage complet...');
      localStorage.clear();
      sessionStorage.clear();
      
      // 2. Désinstaller tous les service workers
      if ('serviceWorker' in navigator) {
        console.log('👷 Désinstallation Service Workers...');
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
            console.log('🗑️ SW désinstallé:', registration.scope);
          });
        });
      }
      
      // 3. Vider tous les caches
      if ('caches' in window) {
        console.log('📦 Suppression tous les caches...');
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
            console.log('🗑️ Cache supprimé:', name);
          });
        });
      }
      
      console.log('💥 Nettoyage d\'urgence terminé');
      console.log('🔄 Redirection dans 2 secondes...');
      
      // 4. Redirection complète
      setTimeout(() => {
        const cleanUrl = window.location.origin + '/?emergency_clean=' + Date.now();
        console.log('🚀 Redirection vers:', cleanUrl);
        window.location.href = cleanUrl;
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur nettoyage d\'urgence:', error);
      console.log('🔄 Fallback: rechargement simple...');
      window.location.reload(true);
    }
  }

  // Méthode pour vérifier la santé du cache
  async checkCacheHealth() {
    console.log('🏥 Vérification santé du cache...');
    
    const issues = [];
    
    try {
      // Vérifier les caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        
        // Chercher des caches anciens
        const oldCaches = cacheNames.filter(name => 
          name.includes('v3.1') || 
          name.includes('v3.2') || 
          name.includes('v3.3') || 
          name.includes('v3.4')
        );
        
        if (oldCaches.length > 0) {
          issues.push(`📦 ${oldCaches.length} anciens caches détectés`);
        }
      }
      
      // Vérifier localStorage
      const oldVersions = Object.keys(localStorage).filter(key => 
        key.includes('synergia') && !localStorage.getItem(key)?.includes('3.5')
      );
      
      if (oldVersions.length > 0) {
        issues.push(`💾 ${oldVersions.length} anciennes données localStorage`);
      }
      
      // Rapport
      if (issues.length === 0) {
        console.log('✅ Cache en bonne santé');
      } else {
        console.log('⚠️ Problèmes détectés:');
        issues.forEach(issue => console.log(`   ${issue}`));
        console.log('💡 Recommandation: forceDashboardReload()');
      }
      
      return issues;
      
    } catch (error) {
      console.error('❌ Erreur vérification cache:', error);
      return ['❌ Erreur lors de la vérification'];
    }
  }
}

// Instance globale
const cacheBuster = new CacheBuster();

// Exposer les méthodes en global pour utilisation console
if (typeof window !== 'undefined') {
  window.forceDashboardReload = () => {
    console.log('🚀 Lancement Force Dashboard Reload...');
    return cacheBuster.forceRefresh();
  };
  
  window.debugCache = () => {
    return cacheBuster.debugCacheStatus();
  };
  
  window.simpleRefresh = () => {
    return cacheBuster.simpleRefresh();
  };
  
  window.emergencyClean = () => {
    return cacheBuster.emergencyClean();
  };
  
  window.checkCacheHealth = () => {
    return cacheBuster.checkCacheHealth();
  };
  
  // Raccourcis utiles
  window.clearCache = window.forceDashboardReload;
  window.hardRefresh = window.forceDashboardReload;
}

export default cacheBuster;

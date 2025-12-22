// ==========================================
// react-app/src/hooks/useOffline.js
// HOOK OFFLINE/PWA - SYNERGIA v4.0
// Module: Gestion hors ligne React
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import offlineService from '../core/services/offlineService';

// ==========================================
// HOOK STATUT CONNEXION
// ==========================================
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!wasOffline) {
        setWasOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// ==========================================
// HOOK OFFLINE SERVICE
// ==========================================
export function useOffline() {
  const [stats, setStats] = useState({
    isOnline: navigator.onLine,
    pendingActions: 0,
    cachedItems: 0,
    syncInProgress: false
  });
  const [initialized, setInitialized] = useState(false);

  // Initialiser le service
  useEffect(() => {
    const init = async () => {
      await offlineService.init();
      const initialStats = await offlineService.getStats();
      setStats(initialStats);
      setInitialized(true);
    };

    init();

    // Ecouter les evenements
    const unsubscribe = offlineService.addListener(async (event) => {
      const newStats = await offlineService.getStats();
      setStats(newStats);
    });

    return () => unsubscribe();
  }, []);

  // Mettre en cache des donnees
  const cacheData = useCallback(async (key, data, ttlMinutes) => {
    return offlineService.cacheData(key, data, ttlMinutes);
  }, []);

  // Recuperer du cache
  const getCachedData = useCallback(async (key) => {
    return offlineService.getCachedData(key);
  }, []);

  // Ajouter une action en attente
  const queueAction = useCallback(async (action) => {
    return offlineService.queueAction(action);
  }, []);

  // Forcer la sync
  const syncNow = useCallback(async () => {
    return offlineService.syncPendingActions();
  }, []);

  // Sauvegarder parametres
  const saveSetting = useCallback(async (key, value) => {
    return offlineService.saveSetting(key, value);
  }, []);

  // Charger parametres
  const getSetting = useCallback(async (key) => {
    return offlineService.getSetting(key);
  }, []);

  return {
    ...stats,
    initialized,
    cacheData,
    getCachedData,
    queueAction,
    syncNow,
    saveSetting,
    getSetting
  };
}

// ==========================================
// HOOK PWA INSTALL
// ==========================================
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Verifier si deja installe
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Ecouter l'evenement beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // Ecouter l'evenement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Declencher l'installation
  const install = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur installation PWA:', error);
      return false;
    }
  }, [installPrompt]);

  return {
    isInstalled,
    isInstallable,
    install
  };
}

// ==========================================
// HOOK SERVICE WORKER
// ==========================================
export function useServiceWorker() {
  const [registration, setRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        // Verifier les mises a jour
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            setInstalling(true);
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                setInstalling(false);
              }
            });
          }
        });
      } catch (error) {
        console.error('Erreur enregistrement SW:', error);
      }
    };

    registerSW();
  }, []);

  // Appliquer la mise a jour
  const applyUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return {
    registration,
    updateAvailable,
    installing,
    applyUpdate
  };
}

export default useOffline;

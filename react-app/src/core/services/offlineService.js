// ==========================================
// react-app/src/core/services/offlineService.js
// SERVICE OFFLINE/PWA - SYNERGIA v4.0
// Module: Support hors ligne et sync
// ==========================================

import { openDB } from 'idb';

// ==========================================
// CONFIGURATION
// ==========================================
const DB_NAME = 'synergia-offline-db';
const DB_VERSION = 1;

const STORES = {
  PENDING_ACTIONS: 'pendingActions',
  CACHED_DATA: 'cachedData',
  USER_DATA: 'userData',
  SETTINGS: 'settings'
};

// ==========================================
// INITIALISATION IndexedDB
// ==========================================
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store pour actions en attente de sync
      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const store = db.createObjectStore(STORES.PENDING_ACTIONS, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('type', 'type');
      }

      // Store pour donnees en cache
      if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
        const store = db.createObjectStore(STORES.CACHED_DATA, {
          keyPath: 'key'
        });
        store.createIndex('expiresAt', 'expiresAt');
      }

      // Store pour donnees utilisateur hors ligne
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'id' });
      }

      // Store pour parametres
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    }
  });
};

// ==========================================
// SERVICE PRINCIPAL
// ==========================================
class OfflineService {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.listeners = new Set();

    // Ecouter les changements de connexion
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  // ==========================================
  // INITIALISATION
  // ==========================================
  async init() {
    try {
      this.db = await initDB();
      console.log('[OFFLINE] Base IndexedDB initialisee');

      // Nettoyer les donnees expirees
      await this.cleanExpiredCache();

      // Tenter une sync si en ligne
      if (this.isOnline) {
        await this.syncPendingActions();
      }

      return true;
    } catch (error) {
      console.error('[OFFLINE] Erreur init:', error);
      return false;
    }
  }

  // ==========================================
  // GESTION CONNEXION
  // ==========================================
  handleOnline() {
    console.log('[OFFLINE] Connexion retablie');
    this.isOnline = true;
    this.notifyListeners({ type: 'online' });
    this.syncPendingActions();
  }

  handleOffline() {
    console.log('[OFFLINE] Connexion perdue');
    this.isOnline = false;
    this.notifyListeners({ type: 'offline' });
  }

  // Ajouter un listener
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(cb => cb(event));
  }

  // ==========================================
  // ACTIONS EN ATTENTE
  // ==========================================

  /**
   * Ajouter une action a synchroniser plus tard
   */
  async queueAction(action) {
    if (!this.db) await this.init();

    const pendingAction = {
      type: action.type,
      collection: action.collection,
      docId: action.docId,
      data: action.data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: action.maxRetries || 3
    };

    try {
      const tx = this.db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
      await tx.store.add(pendingAction);
      await tx.done;

      console.log('[OFFLINE] Action mise en file:', action.type);
      this.notifyListeners({ type: 'action_queued', action: pendingAction });

      return true;
    } catch (error) {
      console.error('[OFFLINE] Erreur queue action:', error);
      return false;
    }
  }

  /**
   * Obtenir les actions en attente
   */
  async getPendingActions() {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction(STORES.PENDING_ACTIONS, 'readonly');
      return await tx.store.getAll();
    } catch (error) {
      console.error('[OFFLINE] Erreur get pending:', error);
      return [];
    }
  }

  /**
   * Synchroniser les actions en attente
   */
  async syncPendingActions() {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    console.log('[OFFLINE] Debut synchronisation...');

    try {
      const actions = await this.getPendingActions();

      for (const action of actions) {
        try {
          // Executer l'action (a implementer selon le type)
          await this.executeAction(action);

          // Supprimer l'action si reussie
          const tx = this.db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
          await tx.store.delete(action.id);
          await tx.done;

          console.log('[OFFLINE] Action synchronisee:', action.type);
          this.notifyListeners({ type: 'action_synced', action });
        } catch (error) {
          console.error('[OFFLINE] Erreur sync action:', error);

          // Incrementer le compteur de retries
          if (action.retries < action.maxRetries) {
            action.retries++;
            const tx = this.db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
            await tx.store.put(action);
            await tx.done;
          } else {
            // Supprimer apres trop d'echecs
            const tx = this.db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
            await tx.store.delete(action.id);
            await tx.done;
            this.notifyListeners({ type: 'action_failed', action });
          }
        }
      }

      console.log('[OFFLINE] Synchronisation terminee');
      this.notifyListeners({ type: 'sync_complete' });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Executer une action en attente
   */
  async executeAction(action) {
    // Import dynamique pour eviter les problemes de deps circulaires
    const { db } = await import('../firebase');
    const { doc, setDoc, updateDoc, deleteDoc, addDoc, collection } = await import('firebase/firestore');

    switch (action.type) {
      case 'create':
        if (action.docId) {
          await setDoc(doc(db, action.collection, action.docId), action.data);
        } else {
          await addDoc(collection(db, action.collection), action.data);
        }
        break;

      case 'update':
        await updateDoc(doc(db, action.collection, action.docId), action.data);
        break;

      case 'delete':
        await deleteDoc(doc(db, action.collection, action.docId));
        break;

      default:
        console.warn('[OFFLINE] Type action inconnu:', action.type);
    }
  }

  // ==========================================
  // CACHE DE DONNEES
  // ==========================================

  /**
   * Mettre en cache des donnees
   */
  async cacheData(key, data, ttlMinutes = 60) {
    if (!this.db) await this.init();

    try {
      const cacheEntry = {
        key,
        data,
        cachedAt: Date.now(),
        expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
      };

      const tx = this.db.transaction(STORES.CACHED_DATA, 'readwrite');
      await tx.store.put(cacheEntry);
      await tx.done;

      return true;
    } catch (error) {
      console.error('[OFFLINE] Erreur cache:', error);
      return false;
    }
  }

  /**
   * Recuperer des donnees du cache
   */
  async getCachedData(key) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction(STORES.CACHED_DATA, 'readonly');
      const entry = await tx.store.get(key);

      if (!entry) return null;

      // Verifier expiration
      if (entry.expiresAt < Date.now()) {
        await this.removeCachedData(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('[OFFLINE] Erreur get cache:', error);
      return null;
    }
  }

  /**
   * Supprimer du cache
   */
  async removeCachedData(key) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction(STORES.CACHED_DATA, 'readwrite');
      await tx.store.delete(key);
      await tx.done;
      return true;
    } catch (error) {
      console.error('[OFFLINE] Erreur remove cache:', error);
      return false;
    }
  }

  /**
   * Nettoyer le cache expire
   */
  async cleanExpiredCache() {
    if (!this.db) return;

    try {
      const tx = this.db.transaction(STORES.CACHED_DATA, 'readwrite');
      const index = tx.store.index('expiresAt');
      const range = IDBKeyRange.upperBound(Date.now());

      let cursor = await index.openCursor(range);
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }

      await tx.done;
      console.log('[OFFLINE] Cache nettoye');
    } catch (error) {
      console.error('[OFFLINE] Erreur clean cache:', error);
    }
  }

  // ==========================================
  // DONNEES UTILISATEUR
  // ==========================================

  /**
   * Sauvegarder les donnees utilisateur localement
   */
  async saveUserData(userId, data) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction(STORES.USER_DATA, 'readwrite');
      await tx.store.put({ id: userId, ...data, savedAt: Date.now() });
      await tx.done;
      return true;
    } catch (error) {
      console.error('[OFFLINE] Erreur save user data:', error);
      return false;
    }
  }

  /**
   * Recuperer les donnees utilisateur locales
   */
  async getUserData(userId) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction(STORES.USER_DATA, 'readonly');
      return await tx.store.get(userId);
    } catch (error) {
      console.error('[OFFLINE] Erreur get user data:', error);
      return null;
    }
  }

  // ==========================================
  // PARAMETRES
  // ==========================================

  async saveSetting(key, value) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction(STORES.SETTINGS, 'readwrite');
      await tx.store.put({ key, value });
      await tx.done;
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSetting(key) {
    if (!this.db) await this.init();

    try {
      const tx = this.db.transaction(STORES.SETTINGS, 'readonly');
      const entry = await tx.store.get(key);
      return entry?.value;
    } catch (error) {
      return null;
    }
  }

  // ==========================================
  // STATISTIQUES
  // ==========================================

  async getStats() {
    if (!this.db) await this.init();

    try {
      const pending = await this.getPendingActions();
      const cachedTx = this.db.transaction(STORES.CACHED_DATA, 'readonly');
      const cachedCount = await cachedTx.store.count();

      return {
        isOnline: this.isOnline,
        pendingActions: pending.length,
        cachedItems: cachedCount,
        syncInProgress: this.syncInProgress
      };
    } catch (error) {
      return {
        isOnline: this.isOnline,
        pendingActions: 0,
        cachedItems: 0,
        syncInProgress: false
      };
    }
  }
}

// Export singleton
export const offlineService = new OfflineService();
export default offlineService;

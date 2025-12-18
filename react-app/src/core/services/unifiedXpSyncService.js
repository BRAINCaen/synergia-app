// ==========================================
// 📁 react-app/src/core/services/unifiedXpSyncService.js
// SERVICE DE SYNCHRONISATION XP UNIFIÉ - CODE COMPLET
// ==========================================

import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  collection,
  query,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { calculateLevel } from './levelService.js';

/**
 * 🚀 SERVICE DE SYNCHRONISATION XP UNIFIÉ - VERSION COMPLÈTE
 * Garantit que TOUTES les pages affichent les mêmes données XP en temps réel
 */
class UnifiedXpSyncService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    this.subscribers = new Map();
    this.syncQueue = new Set();
    this.isInitialized = false;
    this.globalUnsubscribe = null;
  }

  /**
   * 🎯 INITIALISATION DU SERVICE
   */
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 [XP-SYNC] Initialisation service synchronisation unifié');
    
    try {
      // Démarrer la surveillance globale
      this.startGlobalMonitoring();
      
      // Programmer les vérifications périodiques
      this.scheduleHealthChecks();
      
      this.isInitialized = true;
      console.log('✅ [XP-SYNC] Service initialisé avec succès');
      
    } catch (error) {
      console.error('❌ [XP-SYNC] Erreur initialisation:', error);
      throw error;
    }
  }

  /**
   * 📡 S'ABONNER AUX DONNÉES D'UN UTILISATEUR
   */
  subscribeToUser(userId, callbacks = {}) {
    if (!userId) {
      console.warn('⚠️ [XP-SYNC] UserID manquant pour subscription');
      return null;
    }

    // Éviter les doublons
    if (this.listeners.has(userId)) {
      console.log(`🔄 [XP-SYNC] Subscription existante pour ${userId}`);
      return this.listeners.get(userId);
    }

    console.log(`📡 [XP-SYNC] Nouvelle subscription pour ${userId}`);

    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const gamificationData = userData.gamification || this.getDefaultGamificationData();
        
        // Valider et corriger les données
        const validatedData = this.validateGamificationData(gamificationData);
        
        // Mettre à jour le cache
        this.cache.set(userId, {
          ...userData,
          gamification: validatedData,
          lastSync: new Date(),
          source: 'realtime'
        });

        // Notifier tous les abonnés
        this.notifySubscribers(userId, validatedData);
        
        // Callback spécifique si fourni
        if (callbacks.onDataUpdate) {
          callbacks.onDataUpdate({
            ...userData,
            gamification: validatedData
          });
        }

        console.log(`📊 [XP-SYNC] Données mises à jour pour ${userId}:`, {
          totalXp: validatedData.totalXp,
          level: validatedData.level,
          source: 'firebase_realtime'
        });
      }
    }, (error) => {
      console.error(`❌ [XP-SYNC] Erreur subscription ${userId}:`, error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * 📊 OBTENIR LES DONNÉES UTILISATEUR (AVEC CACHE)
   */
  getUserData(userId) {
    if (!userId) return null;
    
    const cachedData = this.cache.get(userId);
    if (cachedData) {
      return cachedData;
    }
    
    // Si pas en cache, déclencher une récupération
    this.fetchUserDataAsync(userId);
    return null;
  }

  /**
   * 🔄 RÉCUPÉRATION ASYNCHRONE DONNÉES UTILISATEUR
   */
  async fetchUserDataAsync(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const validatedGamification = this.validateGamificationData(
          userData.gamification || this.getDefaultGamificationData()
        );
        
        const fullData = {
          ...userData,
          gamification: validatedGamification,
          lastSync: new Date(),
          source: 'async_fetch'
        };
        
        this.cache.set(userId, fullData);
        this.notifySubscribers(userId, validatedGamification);
        
        return fullData;
      }
    } catch (error) {
      console.error(`❌ [XP-SYNC] Erreur fetch async ${userId}:`, error);
    }
    return null;
  }

  /**
   * 🎯 AJOUTER XP AVEC SYNCHRONISATION GARANTIE
   */
  async addXpWithSync(userId, xpAmount, source = 'action', metadata = {}) {
    try {
      console.log(`🎯 [XP-SYNC] Ajout XP: ${xpAmount} pour ${userId} (${source})`);
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userSnap.data();
      const currentGamification = userData.gamification || this.getDefaultGamificationData();
      
      // Calculer les nouvelles valeurs avec le nouveau système de niveaux
      const newTotalXp = currentGamification.totalXp + xpAmount;
      const newLevel = calculateLevel(newTotalXp);
      const newWeeklyXp = (currentGamification.weeklyXp || 0) + xpAmount;
      const newMonthlyXp = (currentGamification.monthlyXp || 0) + xpAmount;
      
      // Préparer l'historique XP
      const xpEntry = {
        amount: xpAmount,
        source: source,
        metadata: metadata,
        timestamp: new Date().toISOString(),
        totalAfter: newTotalXp
      };
      
      const currentHistory = currentGamification.xpHistory || [];
      const newXpHistory = [
        ...currentHistory.slice(-19), // Garder les 19 derniers
        xpEntry
      ];
      
      // Préparer les updates
      const updates = {
        'gamification.totalXp': newTotalXp,
        'gamification.weeklyXp': newWeeklyXp,
        'gamification.monthlyXp': newMonthlyXp,
        'gamification.level': newLevel,
        'gamification.xpHistory': newXpHistory,
        'gamification.lastActivityAt': new Date().toISOString(),
        'syncMetadata.lastXpSync': serverTimestamp(),
        'syncMetadata.lastXpSource': source,
        'syncMetadata.lastXpAmount': xpAmount,
        updatedAt: serverTimestamp()
      };
      
      // Si level up, ajouter à l'historique
      if (newLevel > currentGamification.level) {
        const levelEntry = {
          level: newLevel,
          timestamp: new Date().toISOString(),
          xpAtLevelUp: newTotalXp
        };
        
        const currentLevelHistory = currentGamification.levelHistory || [];
        updates['gamification.levelHistory'] = [
          ...currentLevelHistory.slice(-9), // Garder les 9 derniers
          levelEntry
        ];
        
        console.log(`🎉 [XP-SYNC] Level UP! ${currentGamification.level} → ${newLevel}`);
      }
      
      // Effectuer la mise à jour Firebase
      await updateDoc(userRef, updates);
      
      // Mettre à jour le cache immédiatement
      const updatedGamification = {
        ...currentGamification,
        totalXp: newTotalXp,
        weeklyXp: newWeeklyXp,
        monthlyXp: newMonthlyXp,
        level: newLevel,
        xpHistory: newXpHistory,
        lastActivityAt: new Date().toISOString()
      };
      
      const cacheData = this.cache.get(userId) || { gamification: {} };
      this.cache.set(userId, {
        ...cacheData,
        gamification: updatedGamification,
        lastSync: new Date(),
        source: 'xp_update'
      });
      
      // Notifier immédiatement tous les abonnés
      this.notifySubscribers(userId, updatedGamification);
      
      console.log(`✅ [XP-SYNC] XP ajouté avec succès. Total: ${newTotalXp} (Niveau ${newLevel})`);
      
      return {
        success: true,
        newTotalXp,
        newLevel,
        leveledUp: newLevel > currentGamification.level,
        xpAdded: xpAmount
      };
      
    } catch (error) {
      console.error(`❌ [XP-SYNC] Erreur ajout XP:`, error);
      throw error;
    }
  }

  /**
   * 📢 NOTIFIER TOUS LES ABONNÉS
   */
  notifySubscribers(userId, gamificationData) {
    const subscribers = this.subscribers.get(userId) || new Set();
    
    subscribers.forEach(callback => {
      try {
        callback(gamificationData);
      } catch (error) {
        console.error('❌ [XP-SYNC] Erreur notification callback:', error);
      }
    });
    
    // Émettre un événement global
    const event = new CustomEvent('xpDataUpdated', {
      detail: {
        userId,
        gamificationData,
        timestamp: new Date()
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * 🔔 S'ABONNER AUX CHANGEMENTS (POUR COMPOSANTS)
   */
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    
    this.subscribers.get(userId).add(callback);
    
    // Retourner la fonction de désabonnement
    return () => {
      const userSubscribers = this.subscribers.get(userId);
      if (userSubscribers) {
        userSubscribers.delete(callback);
        if (userSubscribers.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }

  /**
   * ✅ VALIDER ET CORRIGER LES DONNÉES GAMIFICATION
   */
  validateGamificationData(data) {
    const validated = {
      // Valeurs par défaut
      ...this.getDefaultGamificationData(),
      // Données existantes
      ...data
    };
    
    // Corriger le niveau basé sur l'XP (nouveau système calibré)
    const calculatedLevel = calculateLevel(validated.totalXp);
    if (validated.level !== calculatedLevel) {
      validated.level = calculatedLevel;
    }
    
    // S'assurer que les arrays sont bien des arrays
    if (!Array.isArray(validated.xpHistory)) {
      validated.xpHistory = [];
    }
    if (!Array.isArray(validated.levelHistory)) {
      validated.levelHistory = [];
    }
    if (!Array.isArray(validated.badges)) {
      validated.badges = [];
    }
    
    return validated;
  }

  /**
   * 📊 DONNÉES GAMIFICATION PAR DÉFAUT
   */
  getDefaultGamificationData() {
    return {
      totalXp: 0,
      weeklyXp: 0,
      monthlyXp: 0,
      level: 1,
      tasksCompleted: 0,
      tasksCreated: 0,
      projectsCompleted: 0,
      projectsCreated: 0,
      badges: [],
      badgesUnlocked: 0,
      loginStreak: 1,
      currentStreak: 0,
      maxStreak: 0,
      xpHistory: [],
      levelHistory: [],
      lastActivityAt: new Date().toISOString()
    };
  }

  /**
   * 📡 SURVEILLANCE GLOBALE
   */
  startGlobalMonitoring() {
    console.log('📡 [XP-SYNC] Démarrage surveillance globale');
    
    // Surveiller tous les utilisateurs actifs
    const usersQuery = query(collection(db, 'users'));
    
    const unsubscribeGlobal = onSnapshot(usersQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const userId = change.doc.id;
          const userData = change.doc.data();
          
          // Si gamification a changé, mettre à jour le cache
          if (userData.gamification) {
            const validatedData = this.validateGamificationData(userData.gamification);
            
            this.cache.set(userId, {
              ...userData,
              gamification: validatedData,
              lastSync: new Date(),
              source: 'global_monitoring'
            });
            
            this.notifySubscribers(userId, validatedData);
          }
        }
      });
    });
    
    this.globalUnsubscribe = unsubscribeGlobal;
  }

  /**
   * 🔧 VÉRIFICATIONS PÉRIODIQUES DE SANTÉ
   */
  scheduleHealthChecks() {
    // Vérification toutes les 2 minutes
    setInterval(() => {
      this.performHealthCheck();
    }, 2 * 60 * 1000);
    
    console.log('⏰ [XP-SYNC] Vérifications périodiques programmées (2min)');
  }

  /**
   * 🏥 VÉRIFICATION DE SANTÉ
   */
  async performHealthCheck() {
    try {
      const cacheSize = this.cache.size;
      const listenersCount = this.listeners.size;
      const subscribersCount = this.subscribers.size;
      
      console.log(`🏥 [XP-SYNC] Health check: Cache=${cacheSize}, Listeners=${listenersCount}, Subscribers=${subscribersCount}`);
      
      // Nettoyer les entrées expirées (plus de 30 minutes)
      const now = new Date();
      for (const [userId, data] of this.cache.entries()) {
        if (data.lastSync && (now - data.lastSync) > 30 * 60 * 1000) {
          this.cache.delete(userId);
          console.log(`🧹 [XP-SYNC] Cache expiré supprimé pour ${userId}`);
        }
      }
      
    } catch (error) {
      console.error('❌ [XP-SYNC] Erreur health check:', error);
    }
  }

  /**
   * 🔄 FORCER LA SYNCHRONISATION COMPLÈTE
   */
  async forceSyncUser(userId) {
    try {
      console.log(`🔄 [XP-SYNC] Synchronisation forcée pour ${userId}`);
      
      // Supprimer du cache pour forcer la récupération
      this.cache.delete(userId);
      
      // Récupérer les données fraîches
      const freshData = await this.fetchUserDataAsync(userId);
      
      if (freshData) {
        console.log(`✅ [XP-SYNC] Synchronisation forcée réussie pour ${userId}`);
        return freshData;
      } else {
        throw new Error('Impossible de récupérer les données');
      }
      
    } catch (error) {
      console.error(`❌ [XP-SYNC] Erreur sync forcée ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 🧹 NETTOYER LES RESSOURCES
   */
  cleanup() {
    // Nettoyer tous les listeners
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    
    // Nettoyer le listener global
    if (this.globalUnsubscribe) {
      this.globalUnsubscribe();
    }
    
    // Vider les caches
    this.cache.clear();
    this.subscribers.clear();
    
    console.log('🧹 [XP-SYNC] Service nettoyé');
  }
}

// Export de l'instance singleton
export const unifiedXpSyncService = new UnifiedXpSyncService();

// Export par défaut
export default unifiedXpSyncService;

console.log('✅ [XP-SYNC] Service de synchronisation XP unifié chargé');

// ==========================================
// 📁 react-app/src/core/services/xpDashboardSyncFix.js
// SERVICE DE SYNCHRONISATION XP DASHBOARD - CORRECTION CRITIQUE
// ==========================================

import {
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { calculateLevel } from './levelService.js';

/**
 * 🚨 SERVICE DE SYNCHRONISATION XP DASHBOARD
 * Corrige le problème des XP qui n'apparaissent pas après validation d'intégration
 */
class XpDashboardSyncFix {
  constructor() {
    this.listeners = new Map();
    this.syncQueue = new Set();
    this.isProcessing = false;
  }

  /**
   * 🔄 SYNCHRONISATION FORCÉE APRÈS VALIDATION INTÉGRATION
   */
  async forceUserDataSync(userId) {
    try {
      console.log(`🔄 [XP-SYNC] Synchronisation forcée pour ${userId}...`);
      
      // 1. Récupérer données utilisateur actuelles
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      console.log('📊 [XP-SYNC] Données utilisateur actuelles:', userData.gamification);
      
      // 2. Vérifier et corriger les données de gamification
      const correctedGamification = this.validateAndCorrectGamificationData(userData.gamification || {});
      
      // 3. Mettre à jour avec horodatage de synchronisation
      const updates = {
        gamification: correctedGamification,
        'syncMetadata.lastDashboardSync': serverTimestamp(),
        'syncMetadata.lastSyncReason': 'integration_validation',
        'syncMetadata.forcedSync': true,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updates);
      
      console.log('✅ [XP-SYNC] Synchronisation forcée réussie:', correctedGamification);
      
      // 4. Notifier les composants de la mise à jour
      this.notifyComponentsUpdate(userId, correctedGamification);
      
      return {
        success: true,
        gamification: correctedGamification,
        syncedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ [XP-SYNC] Erreur synchronisation forcée:', error);
      throw error;
    }
  }

  /**
   * ✅ VALIDER ET CORRIGER LES DONNÉES DE GAMIFICATION
   */
  validateAndCorrectGamificationData(gamificationData) {
    const corrected = {
      // Valeurs par défaut sécurisées
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
      lastActivityAt: new Date().toISOString(),
      
      // Préserver les données existantes
      ...gamificationData
    };
    
    // Recalculer le niveau basé sur l'XP total (système calibré)
    const calculatedLevel = calculateLevel(corrected.totalXp);
    if (corrected.level !== calculatedLevel) {
      console.log(`🔧 [XP-SYNC] Niveau recalculé: ${corrected.level} → ${calculatedLevel}`);
      corrected.level = calculatedLevel;
    }
    
    // Recalculer le nombre de badges
    const badgeCount = Array.isArray(corrected.badges) ? corrected.badges.length : 0;
    if (corrected.badgesUnlocked !== badgeCount) {
      console.log(`🔧 [XP-SYNC] Badges recalculés: ${corrected.badgesUnlocked} → ${badgeCount}`);
      corrected.badgesUnlocked = badgeCount;
    }
    
    // S'assurer que les arrays sont bien des arrays
    if (!Array.isArray(corrected.badges)) {
      corrected.badges = [];
    }
    if (!Array.isArray(corrected.xpHistory)) {
      corrected.xpHistory = [];
    }
    if (!Array.isArray(corrected.levelHistory)) {
      corrected.levelHistory = [];
    }
    
    return corrected;
  }

  /**
   * 📢 NOTIFIER LES COMPOSANTS DE LA MISE À JOUR
   */
  notifyComponentsUpdate(userId, gamificationData) {
    // Émettre un événement global pour notifier tous les composants
    const event = new CustomEvent('userDataSynced', {
      detail: {
        userId,
        gamificationData,
        source: 'integration_validation',
        timestamp: new Date()
      }
    });
    
    window.dispatchEvent(event);
    
    // Log pour debug
    console.log('📢 [XP-SYNC] Notification émise pour composants:', {
      userId,
      totalXp: gamificationData.totalXp,
      level: gamificationData.level
    });
  }

  /**
   * 🎯 SYNCHRONISATION SPÉCIFIQUE APRÈS VALIDATION INTÉGRATION
   */
  async syncAfterIntegrationValidation(userId, integrationTasksCompleted = 78) {
    try {
      console.log(`🎯 [XP-SYNC] Sync après validation intégration pour ${userId}...`);
      
      // 1. Vérifier les données actuelles
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const currentGamification = userData.gamification || {};
      
      // 2. Calculer les XP d'intégration (78 tâches = 590 XP + bonus)
      const integrationXp = 590;
      const totalXp = (currentGamification.totalXp || 0) + integrationXp;
      const newLevel = calculateLevel(totalXp);
      
      // 3. Mise à jour complète
      const updates = {
        'gamification.totalXp': totalXp,
        'gamification.weeklyXp': (currentGamification.weeklyXp || 0) + integrationXp,
        'gamification.monthlyXp': (currentGamification.monthlyXp || 0) + integrationXp,
        'gamification.level': newLevel,
        'gamification.tasksCompleted': integrationTasksCompleted,
        'gamification.lastActivityAt': new Date().toISOString(),
        'syncMetadata.lastDashboardSync': serverTimestamp(),
        'syncMetadata.integrationCompleted': true,
        'syncMetadata.lastSyncReason': 'integration_validation_complete',
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updates);
      
      console.log('✅ [XP-SYNC] Synchronisation intégration réussie:', {
        totalXp,
        level: newLevel,
        tasksCompleted: integrationTasksCompleted
      });
      
      // 4. Forcer la synchronisation dashboard
      await this.forceUserDataSync(userId);
      
      return {
        success: true,
        totalXp,
        level: newLevel,
        xpGained: integrationXp
      };
      
    } catch (error) {
      console.error('❌ [XP-SYNC] Erreur sync après intégration:', error);
      throw error;
    }
  }

  /**
   * 🔄 ÉCOUTE TEMPS RÉEL POUR SYNCHRONISATION AUTO
   */
  setupRealtimeSync(userId) {
    if (this.listeners.has(userId)) {
      return; // Déjà configuré
    }
    
    console.log(`📡 [XP-SYNC] Configuration écoute temps réel pour ${userId}...`);
    
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const gamification = userData.gamification || {};
        
        // Notifier les composants des changements
        this.notifyComponentsUpdate(userId, gamification);
        
        console.log('📊 [XP-SYNC] Données mises à jour en temps réel:', {
          totalXp: gamification.totalXp,
          level: gamification.level
        });
      }
    }, (error) => {
      console.error('❌ [XP-SYNC] Erreur écoute temps réel:', error);
    });
    
    this.listeners.set(userId, unsubscribe);
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup(userId = null) {
    if (userId) {
      const unsubscribe = this.listeners.get(userId);
      if (unsubscribe) {
        unsubscribe();
        this.listeners.delete(userId);
        console.log(`🧹 [XP-SYNC] Listener nettoyé pour ${userId}`);
      }
    } else {
      // Nettoyer tous les listeners
      this.listeners.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this.listeners.clear();
      console.log('🧹 [XP-SYNC] Tous les listeners nettoyés');
    }
  }

  /**
   * 🔍 DIAGNOSTIC DONNÉES UTILISATEUR
   */
  async diagnoseUserData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { error: 'Utilisateur non trouvé' };
      }
      
      const userData = userDoc.data();
      const gamification = userData.gamification || {};
      
      const diagnostic = {
        userExists: true,
        hasGamificationData: !!userData.gamification,
        totalXp: gamification.totalXp || 0,
        level: gamification.level || 1,
        tasksCompleted: gamification.tasksCompleted || 0,
        lastActivity: gamification.lastActivityAt || 'Jamais',
        lastSync: userData.syncMetadata?.lastDashboardSync || 'Jamais',
        integrationCompleted: userData.syncMetadata?.integrationCompleted || false,
        dataStructure: {
          profile: !!userData.profile,
          gamification: !!userData.gamification,
          syncMetadata: !!userData.syncMetadata
        }
      };
      
      console.log('🔍 [XP-SYNC] Diagnostic utilisateur:', diagnostic);
      return diagnostic;
      
    } catch (error) {
      console.error('❌ [XP-SYNC] Erreur diagnostic:', error);
      return { error: error.message };
    }
  }
}

// Export singleton
export const xpDashboardSyncFix = new XpDashboardSyncFix();

/**
 * 🎯 FONCTIONS UTILITAIRES POUR INTÉGRATION FACILE
 */

// Hook pour composants React
export const useXpSync = (userId) => {
  useEffect(() => {
    if (userId) {
      xpDashboardSyncFix.setupRealtimeSync(userId);
      
      // Écouter les événements de sync
      const handleSyncEvent = (event) => {
        if (event.detail.userId === userId) {
          console.log('📢 [XP-SYNC] Événement reçu dans composant:', event.detail);
          // Le composant peut réagir ici
        }
      };
      
      window.addEventListener('userDataSynced', handleSyncEvent);
      
      return () => {
        window.removeEventListener('userDataSynced', handleSyncEvent);
        xpDashboardSyncFix.cleanup(userId);
      };
    }
  }, [userId]);
};

// Fonction directe pour forcer la sync
export const forceSyncAfterIntegration = async (userId) => {
  return await xpDashboardSyncFix.syncAfterIntegrationValidation(userId);
};

// Fonction de diagnostic
export const diagnoseUserXpData = async (userId) => {
  return await xpDashboardSyncFix.diagnoseUserData(userId);
};

console.log('✅ [XP-SYNC] Service de synchronisation XP Dashboard initialisé');

// ==========================================
// 📁 react-app/src/core/services/xpSyncService.js
// SERVICE SYNCHRONISATION XP GLOBAL - GARANTIT LA COHÉRENCE
// ==========================================

import { 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  getDoc, 
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔄 SERVICE DE SYNCHRONISATION XP GLOBAL
 * Garantit que tous les gains d'XP sont correctement synchronisés
 * et visibles partout dans l'application en temps réel
 */
class XpSyncService {
  constructor() {
    this.listeners = new Map(); // Listeners actifs
    this.syncQueue = []; // Queue de synchronisation
    this.isProcessing = false;
    this.lastSyncCheck = null;
    
    console.log('🔄 XpSyncService initialisé');
  }

  /**
   * 🚀 INITIALISER LA SYNCHRONISATION GLOBALE
   */
  async initializeGlobalSync() {
    try {
      console.log('🚀 Initialisation synchronisation XP globale...');
      
      // 1. Vérifier la cohérence des données XP
      await this.verifyXpConsistency();
      
      // 2. Démarrer le monitoring en temps réel
      this.startGlobalMonitoring();
      
      // 3. Programmer les vérifications périodiques
      this.schedulePeriodicChecks();
      
      console.log('✅ Synchronisation XP globale initialisée');
      
    } catch (error) {
      console.error('❌ Erreur initialisation sync XP:', error);
    }
  }

  /**
   * 📊 VÉRIFIER LA COHÉRENCE DES DONNÉES XP
   */
  async verifyXpConsistency() {
    try {
      console.log('🔍 Vérification cohérence données XP...');
      
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const batch = writeBatch(db);
      let correctedCount = 0;
      let issuesFound = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        // Vérifier et corriger les données de gamification
        const issues = this.detectXpIssues(userData);
        
        if (issues.length > 0) {
          console.log(`🔧 Correction utilisateur ${userId}:`, issues);
          
          const corrections = this.generateXpCorrections(userData, issues);
          
          if (Object.keys(corrections).length > 0) {
            const userRef = doc(db, 'users', userId);
            batch.update(userRef, {
              ...corrections,
              'syncMetadata.lastXpSync': serverTimestamp(),
              'syncMetadata.correctedAt': serverTimestamp()
            });
            
            correctedCount++;
            issuesFound.push({ userId, issues, corrections });
          }
        }
      }
      
      if (correctedCount > 0) {
        await batch.commit();
        console.log(`✅ ${correctedCount} utilisateurs corrigés pour cohérence XP`);
      }
      
      return {
        totalUsers: usersSnapshot.size,
        correctedUsers: correctedCount,
        issues: issuesFound
      };
      
    } catch (error) {
      console.error('❌ Erreur vérification cohérence XP:', error);
      return { error: error.message };
    }
  }

  /**
   * 🕵️ DÉTECTER LES PROBLÈMES XP
   */
  detectXpIssues(userData) {
    const issues = [];
    const gamification = userData.gamification || {};
    
    // 1. Vérifier structure gamification
    if (!gamification.totalXp && gamification.totalXp !== 0) {
      issues.push('missing_totalXp');
    }
    
    if (!gamification.level) {
      issues.push('missing_level');
    }
    
    if (!gamification.weeklyXp && gamification.weeklyXp !== 0) {
      issues.push('missing_weeklyXp');
    }
    
    if (!gamification.monthlyXp && gamification.monthlyXp !== 0) {
      issues.push('missing_monthlyXp');
    }
    
    // 2. Vérifier cohérence level/XP
    const expectedLevel = Math.floor((gamification.totalXp || 0) / 100) + 1;
    if (gamification.level !== expectedLevel) {
      issues.push('incorrect_level');
    }
    
    // 3. Vérifier historique XP
    if (!Array.isArray(gamification.xpHistory)) {
      issues.push('missing_xpHistory');
    }
    
    // 4. Vérifier données de base
    if (!gamification.tasksCompleted && gamification.tasksCompleted !== 0) {
      issues.push('missing_tasksCompleted');
    }
    
    if (!gamification.lastActivityAt) {
      issues.push('missing_lastActivityAt');
    }
    
    return issues;
  }

  /**
   * 🔧 GÉNÉRER LES CORRECTIONS XP
   */
  generateXpCorrections(userData, issues) {
    const corrections = {};
    const gamification = userData.gamification || {};
    
    issues.forEach(issue => {
      switch (issue) {
        case 'missing_totalXp':
          corrections['gamification.totalXp'] = 0;
          break;
          
        case 'missing_level':
          const totalXp = gamification.totalXp || 0;
          corrections['gamification.level'] = Math.floor(totalXp / 100) + 1;
          break;
          
        case 'incorrect_level':
          const correctLevel = Math.floor((gamification.totalXp || 0) / 100) + 1;
          corrections['gamification.level'] = correctLevel;
          break;
          
        case 'missing_weeklyXp':
          corrections['gamification.weeklyXp'] = 0;
          break;
          
        case 'missing_monthlyXp':
          corrections['gamification.monthlyXp'] = 0;
          break;
          
        case 'missing_xpHistory':
          corrections['gamification.xpHistory'] = [];
          break;
          
        case 'missing_tasksCompleted':
          corrections['gamification.tasksCompleted'] = 0;
          break;
          
        case 'missing_lastActivityAt':
          corrections['gamification.lastActivityAt'] = new Date().toISOString();
          break;
      }
    });
    
    return corrections;
  }

  /**
   * 📡 DÉMARRER MONITORING GLOBAL
   */
  startGlobalMonitoring() {
    console.log('📡 Démarrage monitoring XP global...');
    
    // Écouter tous les changements sur la collection users
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const userData = change.doc.data();
          const userId = change.doc.id;
          
          // Vérifier si c'est un changement lié à XP
          if (this.isXpRelatedChange(userData)) {
            console.log(`📊 Changement XP détecté pour utilisateur ${userId}`);
            this.notifyXpUpdate(userId, userData.gamification);
          }
        }
      });
    }, (error) => {
      console.error('❌ Erreur monitoring XP:', error);
    });
    
    this.listeners.set('global_monitoring', unsubscribe);
  }

  /**
   * 🔍 VÉRIFIER SI C'EST UN CHANGEMENT XP
   */
  isXpRelatedChange(userData) {
    const gamification = userData.gamification || {};
    const syncMetadata = userData.syncMetadata || {};
    
    // 🛡️ GESTION SÉCURISÉE DES TIMESTAMPS
    if (syncMetadata.lastXpSync) {
      try {
        let lastSync;
        if (syncMetadata.lastXpSync.toDate) {
          lastSync = syncMetadata.lastXpSync.toDate();
        } else if (syncMetadata.lastXpSync instanceof Date) {
          lastSync = syncMetadata.lastXpSync;
        } else if (typeof syncMetadata.lastXpSync === 'string') {
          lastSync = new Date(syncMetadata.lastXpSync);
        } else {
          return false; // Pas de timestamp valide
        }
        
        const tenSecondsAgo = new Date(Date.now() - 10000);
        return lastSync > tenSecondsAgo;
      } catch (error) {
        console.warn('⚠️ [XP-SYNC] Erreur vérification timestamp:', error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * 📢 NOTIFIER MISE À JOUR XP
   */
  notifyXpUpdate(userId, gamificationData) {
    // Émettre un événement personnalisé pour notifier les composants
    const event = new CustomEvent('xpUpdated', {
      detail: {
        userId,
        gamificationData,
        timestamp: new Date()
      }
    });
    
    window.dispatchEvent(event);
    
    console.log(`📢 Notification XP émise pour ${userId}`);
  }

  /**
   * ⏰ PROGRAMMER VÉRIFICATIONS PÉRIODIQUES
   */
  schedulePeriodicChecks() {
    // Vérification toutes les 5 minutes
    setInterval(async () => {
      console.log('⏰ Vérification périodique cohérence XP...');
      await this.verifyXpConsistency();
    }, 5 * 60 * 1000);
    
    console.log('⏰ Vérifications périodiques programmées (5min)');
  }

  /**
   * 🎯 AJOUTER XP AVEC GARANTIE DE SYNCHRONISATION
   */
  async addXpWithSync(userId, xpAmount, source = 'action') {
    try {
      console.log(`🎯 Ajout XP avec sync: ${xpAmount} pour ${userId}`);
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userSnap.data();
      const currentXp = userData.gamification?.totalXp || 0;
      const currentLevel = userData.gamification?.level || 1;
      const newTotalXp = currentXp + xpAmount;
      const newLevel = Math.floor(newTotalXp / 100) + 1;
      
      // Préparer la mise à jour avec métadonnées de sync
      const updates = {
        'gamification.totalXp': newTotalXp,
        'gamification.weeklyXp': (userData.gamification?.weeklyXp || 0) + xpAmount,
        'gamification.monthlyXp': (userData.gamification?.monthlyXp || 0) + xpAmount,
        'gamification.level': newLevel,
        'gamification.lastActivityAt': new Date().toISOString(),
        'syncMetadata.lastXpSync': serverTimestamp(),
        'syncMetadata.lastXpSource': source,
        'syncMetadata.lastXpAmount': xpAmount,
        updatedAt: serverTimestamp()
      };
      
      // Ajouter à l'historique XP
      const xpEntry = {
        amount: xpAmount,
        source: source,
        timestamp: new Date().toISOString(),
        totalAfter: newTotalXp
      };
      
      const currentHistory = userData.gamification?.xpHistory || [];
      updates['gamification.xpHistory'] = [
        ...currentHistory.slice(-19), // Garder les 19 derniers
        xpEntry
      ];
      
      // Si level up, ajouter à l'historique
      if (newLevel > currentLevel) {
        const currentLevelHistory = userData.gamification?.levelHistory || [];
        updates['gamification.levelHistory'] = [
          ...currentLevelHistory.slice(-9), // Garder les 9 derniers
          {
            oldLevel: currentLevel,
            newLevel: newLevel,
            timestamp: new Date().toISOString(),
            xpAtLevelUp: newTotalXp
          }
        ];
      }
      
      await updateDoc(userRef, updates);
      
      console.log(`✅ XP ajouté avec sync: +${xpAmount} → ${newTotalXp} XP total`);
      
      // Déclencher notification immédiate
      this.notifyXpUpdate(userId, {
        ...userData.gamification,
        totalXp: newTotalXp,
        level: newLevel
      });
      
      return {
        success: true,
        leveledUp: newLevel > currentLevel,
        newLevel,
        newTotalXp,
        xpGained: xpAmount
      };
      
    } catch (error) {
      console.error('❌ Erreur ajout XP avec sync:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    console.log('🧹 Nettoyage XP Sync Service...');
    
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    
    this.listeners.clear();
  }

  /**
   * 🔄 FORCER SYNCHRONISATION UTILISATEUR
   */
  async forceSyncUser(userId) {
    try {
      console.log(`🔄 Synchronisation forcée utilisateur: ${userId}`);
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'syncMetadata.lastForceSync': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur sync forcée:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const xpSyncService = new XpSyncService();

export default xpSyncService;

// Initialiser automatiquement
if (typeof window !== 'undefined') {
  // Initialiser après un court délai pour laisser Firebase se connecter
  setTimeout(() => {
    xpSyncService.initializeGlobalSync();
  }, 2000);
}

// ==========================================
// 📁 react-app/src/core/services/globalSyncService.js
// SYSTÈME DE SYNCHRONISATION GLOBALE AUTOMATIQUE
// Firebase = Source unique de vérité pour TOUS les utilisateurs
// ==========================================

import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  serverTimestamp,
  collection,
  getDocs,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🌐 SERVICE DE SYNCHRONISATION GLOBALE
 * Firebase comme source unique de vérité pour TOUS les utilisateurs
 */
class GlobalSyncService {
  constructor() {
    this.listeners = new Map(); // Listeners par utilisateur
    this.globalData = new Map(); // Cache global des données
    this.syncCallbacks = new Map(); // Callbacks de synchronisation
    this.isInitialized = false;
    
    console.log('🌐 GlobalSyncService initialisé');
  }

  /**
   * 🚀 INITIALISATION GLOBALE DU SYSTÈME
   * À appeler une seule fois au démarrage de l'app
   */
  async initializeGlobalSync() {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 Initialisation synchronisation globale...');
      
      // 1. Synchroniser tous les utilisateurs existants
      await this.syncAllExistingUsers();
      
      // 2. Marquer comme initialisé
      this.isInitialized = true;
      
      console.log('✅ Synchronisation globale initialisée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur initialisation globale:', error);
    }
  }

  /**
   * 📡 SYNCHRONISATION TEMPS RÉEL POUR UN UTILISATEUR
   * S'abonne aux changements Firebase et met à jour tous les composants
   */
  subscribeToUser(userId, callbacks = {}) {
    // Si déjà abonné, retourner l'existing listener
    if (this.listeners.has(userId)) {
      console.log('📡 Réutilisation listener existant pour:', userId);
      return this.listeners.get(userId);
    }

    console.log('📡 Création listener temps réel pour:', userId);
    
    const userRef = doc(db, 'users', userId);
    
    // Créer le listener Firebase
    const unsubscribe = onSnapshot(userRef, async (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        
        // 1. Valider et réparer les données si nécessaire
        const validatedData = await this.validateAndRepairUserData(userId, userData);
        
        // 2. Mettre à jour le cache global
        this.globalData.set(userId, validatedData);
        
        // 3. Notifier tous les composants abonnés
        this.notifySubscribers(userId, validatedData);
        
        // 4. Exécuter les callbacks personnalisés
        if (callbacks.onDataUpdate) {
          callbacks.onDataUpdate(validatedData);
        }
        
        console.log('📊 Données synchronisées pour:', userId, {
          level: validatedData.gamification?.level,
          totalXp: validatedData.gamification?.totalXp,
          tasksCompleted: validatedData.gamification?.tasksCompleted
        });
        
      } else {
        console.warn('⚠️ Document utilisateur inexistant:', userId);
        await this.createUserDocument(userId);
      }
    }, (error) => {
      console.error('❌ Erreur listener Firebase:', error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    });
    
    // Stocker le listener
    this.listeners.set(userId, unsubscribe);
    
    return unsubscribe;
  }

  /**
   * 🔄 VALIDATION ET RÉPARATION AUTOMATIQUE
   * Vérifie et corrige les données à chaque synchronisation
   */
  async validateAndRepairUserData(userId, userData) {
    const issues = [];
    let needsUpdate = false;
    
    // Structure de données standardisée
    const standardData = {
      uid: userId,
      email: userData.email || '',
      displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
      photoURL: userData.photoURL || null,
      
      // Métadonnées
      createdAt: userData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: userData.lastLoginAt || serverTimestamp(),
      
      // Profil standardisé
      profile: {
        displayName: userData.profile?.displayName || userData.displayName || 'Utilisateur',
        bio: userData.profile?.bio || '',
        department: userData.profile?.department || 'Non défini',
        role: userData.profile?.role || 'employee',
        preferences: {
          notifications: userData.profile?.preferences?.notifications !== false,
          publicProfile: userData.profile?.preferences?.publicProfile || false,
          emailUpdates: userData.profile?.preferences?.emailUpdates !== false,
          theme: userData.profile?.preferences?.theme || 'light'
        }
      },
      
      // Gamification unifiée - SOURCE UNIQUE DE VÉRITÉ
      gamification: {
        totalXp: userData.gamification?.totalXp || 0,
        weeklyXp: userData.gamification?.weeklyXp || 0,
        monthlyXp: userData.gamification?.monthlyXp || 0,
        level: 0, // Sera calculé automatiquement
        
        tasksCompleted: userData.gamification?.tasksCompleted || 0,
        tasksCreated: userData.gamification?.tasksCreated || 0,
        projectsCreated: userData.gamification?.projectsCreated || 0,
        projectsCompleted: userData.gamification?.projectsCompleted || 0,
        
        badges: userData.gamification?.badges || [],
        badgesUnlocked: 0, // Sera calculé automatiquement
        achievements: userData.gamification?.achievements || [],
        
        loginStreak: userData.gamification?.loginStreak || 1,
        currentStreak: userData.gamification?.currentStreak || 0,
        maxStreak: userData.gamification?.maxStreak || 0,
        lastLoginDate: userData.gamification?.lastLoginDate || new Date().toISOString().split('T')[0],
        
        xpHistory: userData.gamification?.xpHistory || [],
        levelHistory: userData.gamification?.levelHistory || [],
        
        // Statistiques calculées
        completionRate: 0, // Sera calculé
        averageTaskXp: 0,  // Sera calculé
        productivity: 'normal',
        lastActivityAt: userData.gamification?.lastActivityAt || new Date().toISOString()
      }
    };
    
    // ✅ CALCULS AUTOMATIQUES (logique unifiée)
    const totalXp = standardData.gamification.totalXp;
    const calculatedLevel = Math.floor(totalXp / 100) + 1;
    const tasksCompleted = standardData.gamification.tasksCompleted;
    const tasksCreated = standardData.gamification.tasksCreated;
    const badgesCount = (standardData.gamification.badges || []).length;
    
    // Appliquer les calculs
    standardData.gamification.level = calculatedLevel;
    standardData.gamification.badgesUnlocked = badgesCount;
    standardData.gamification.completionRate = tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;
    standardData.gamification.averageTaskXp = tasksCompleted > 0 ? Math.round(totalXp / tasksCompleted) : 0;
    
    // ❌ DÉTECTION DES INCOHÉRENCES
    if (userData.gamification?.level !== calculatedLevel) {
      issues.push(`Niveau incohérent: ${userData.gamification?.level} → ${calculatedLevel}`);
      needsUpdate = true;
    }
    
    if (userData.gamification?.badgesUnlocked !== badgesCount) {
      issues.push(`Badges incohérents: ${userData.gamification?.badgesUnlocked} → ${badgesCount}`);
      needsUpdate = true;
    }
    
    if (!userData.gamification) {
      issues.push('Structure gamification manquante');
      needsUpdate = true;
    }
    
    if (!userData.profile) {
      issues.push('Structure profile manquante');
      needsUpdate = true;
    }
    
    // 🛠️ RÉPARATION AUTOMATIQUE
    if (needsUpdate) {
      console.log(`🛠️ Réparation automatique pour ${userId}:`, issues);
      
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, standardData);
        
        console.log('✅ Données réparées automatiquement pour:', userId);
        
      } catch (error) {
        console.error('❌ Erreur réparation automatique:', error);
      }
    }
    
    return standardData;
  }

  /**
   * 🔔 NOTIFICATION DES ABONNÉS
   * Informe tous les composants des changements de données
   */
  notifySubscribers(userId, userData) {
    const callbacks = this.syncCallbacks.get(userId) || [];
    
    callbacks.forEach(callback => {
      try {
        callback(userData);
      } catch (error) {
        console.error('❌ Erreur callback sync:', error);
      }
    });
  }

  /**
   * 📝 ABONNEMENT COMPOSANT
   * Permet aux composants de s'abonner aux changements
   */
  subscribeToDataChanges(userId, callback) {
    if (!this.syncCallbacks.has(userId)) {
      this.syncCallbacks.set(userId, []);
    }
    
    this.syncCallbacks.get(userId).push(callback);
    
    // Retourner la fonction de désabonnement
    return () => {
      const callbacks = this.syncCallbacks.get(userId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * 📊 OBTENIR LES DONNÉES UTILISATEUR
   * Source unique de vérité depuis le cache synchronisé
   */
  getUserData(userId) {
    return this.globalData.get(userId) || null;
  }

  /**
   * 💾 MISE À JOUR DES DONNÉES
   * Met à jour Firebase et propage automatiquement
   */
  async updateUserData(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Ajouter timestamp
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      
      console.log('💾 Données mises à jour pour:', userId);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🌐 SYNCHRONISATION DE TOUS LES UTILISATEURS
   * Vérifie et corrige tous les utilisateurs existants
   */
  async syncAllExistingUsers() {
    try {
      console.log('🌐 Synchronisation de tous les utilisateurs...');
      
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      
      const batch = writeBatch(db);
      let correctedCount = 0;
      
      for (const userDoc of snapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Valider et obtenir les données corrigées
        const correctedData = await this.validateAndRepairUserData(userId, userData);
        
        // Comparer avec les données existantes
        const needsCorrection = this.needsCorrection(userData, correctedData);
        
        if (needsCorrection) {
          batch.set(doc(db, 'users', userId), correctedData, { merge: true });
          correctedCount++;
          
          console.log(`🔧 Programmé correction pour: ${userId}`);
        }
      }
      
      // Exécuter toutes les corrections en lot
      if (correctedCount > 0) {
        await batch.commit();
        console.log(`✅ ${correctedCount} utilisateurs corrigés globalement`);
      } else {
        console.log('✅ Tous les utilisateurs sont déjà synchronisés');
      }
      
      return { success: true, correctedCount };
      
    } catch (error) {
      console.error('❌ Erreur synchronisation globale:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 VÉRIFIER SI CORRECTION NÉCESSAIRE
   */
  needsCorrection(originalData, correctedData) {
    // Vérifications clés
    const originalGamification = originalData.gamification || {};
    const correctedGamification = correctedData.gamification || {};
    
    return (
      originalGamification.level !== correctedGamification.level ||
      originalGamification.badgesUnlocked !== correctedGamification.badgesUnlocked ||
      !originalData.gamification ||
      !originalData.profile
    );
  }

  /**
   * 👤 CRÉER DOCUMENT UTILISATEUR MANQUANT
   */
  async createUserDocument(userId) {
    try {
      console.log('👤 Création document utilisateur manquant:', userId);
      
      const defaultUserData = {
        uid: userId,
        email: userId, // Utiliser l'ID comme email temporaire
        displayName: 'Utilisateur',
        photoURL: null,
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        
        profile: {
          displayName: 'Utilisateur',
          bio: '',
          department: 'Non défini',
          role: 'employee',
          preferences: {
            notifications: true,
            publicProfile: false,
            emailUpdates: true,
            theme: 'light'
          }
        },
        
        gamification: {
          totalXp: 0,
          weeklyXp: 0,
          monthlyXp: 0,
          level: 1,
          tasksCompleted: 0,
          tasksCreated: 0,
          projectsCreated: 0,
          projectsCompleted: 0,
          badges: [],
          badgesUnlocked: 0,
          achievements: [],
          loginStreak: 1,
          currentStreak: 0,
          maxStreak: 0,
          lastLoginDate: new Date().toISOString().split('T')[0],
          xpHistory: [],
          levelHistory: [],
          completionRate: 0,
          averageTaskXp: 0,
          productivity: 'normal',
          lastActivityAt: new Date().toISOString()
        }
      };
      
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, defaultUserData);
      
      console.log('✅ Document utilisateur créé:', userId);
      
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
    }
  }

  /**
   * 🧹 NETTOYAGE DES LISTENERS
   */
  unsubscribeUser(userId) {
    const unsubscribe = this.listeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(userId);
      this.globalData.delete(userId);
      this.syncCallbacks.delete(userId);
      
      console.log('🧹 Listener nettoyé pour:', userId);
    }
  }

  /**
   * 🧹 NETTOYAGE GLOBAL
   */
  cleanup() {
    this.listeners.forEach((unsubscribe, userId) => {
      unsubscribe();
    });
    
    this.listeners.clear();
    this.globalData.clear();
    this.syncCallbacks.clear();
    
    console.log('🧹 Nettoyage global effectué');
  }
}

// Instance singleton globale
const globalSyncService = new GlobalSyncService();

export default globalSyncService;

// Export des méthodes principales
export const {
  initializeGlobalSync,
  subscribeToUser,
  subscribeToDataChanges,
  getUserData,
  updateUserData,
  syncAllExistingUsers,
  unsubscribeUser,
  cleanup
} = globalSyncService;

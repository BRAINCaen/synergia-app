// ==========================================
// 📁 react-app/src/core/services/validationSyncService.js
// SERVICE SYNCHRONISATION VALIDATION TEMPS RÉEL - CORRECTION DÉFINITIVE
// ==========================================

import { 
  collection, 
  doc,
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔄 SERVICE DE SYNCHRONISATION VALIDATION TEMPS RÉEL
 * Corrige définitivement le problème de désynchronisation des validations
 */
class ValidationSyncService {
  constructor() {
    this.listeners = new Map();
    this.validationCache = new Map();
    this.callbacks = new Map();
    this.initialized = false;
    
    console.log('🔄 ValidationSyncService initialisé');
  }

  /**
   * 🚀 INITIALISER LA SYNCHRONISATION TEMPS RÉEL
   */
  async initializeSync() {
    if (this.initialized) {
      console.log('⚠️ [VALIDATION-SYNC] Déjà initialisé');
      return;
    }

    try {
      console.log('🚀 [VALIDATION-SYNC] Initialisation synchronisation validation...');
      
      // 1. Écouter les tâches avec statut validation_pending
      this.setupTasksListener();
      
      // 2. Écouter la collection task_validations
      this.setupValidationsListener();
      
      this.initialized = true;
      console.log('✅ [VALIDATION-SYNC] Synchronisation temps réel activée');
      
    } catch (error) {
      console.error('❌ [VALIDATION-SYNC] Erreur initialisation:', error);
    }
  }

  /**
   * 📋 LISTENER POUR LES TÂCHES EN VALIDATION_PENDING
   */
  setupTasksListener() {
    try {
      // Écouter toutes les tâches avec status = validation_pending
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'validation_pending'),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        console.log('🔄 [TASKS-LISTENER] Changement détecté dans les tâches en validation');
        
        const pendingTasks = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          pendingTasks.push({
            id: doc.id,
            ...data,
            type: 'task_submission',
            source: 'tasks_collection'
          });
        });

        console.log(`📊 [TASKS-LISTENER] ${pendingTasks.length} tâches en validation_pending`);
        
        // Mettre à jour le cache
        this.validationCache.set('pending_tasks', pendingTasks);
        
        // Notifier tous les callbacks
        this.notifyCallbacks('pending_tasks_updated', pendingTasks);
        
      }, (error) => {
        console.error('❌ [TASKS-LISTENER] Erreur:', error);
      });

      this.listeners.set('tasks_pending', unsubscribe);
      
    } catch (error) {
      console.error('❌ [TASKS-LISTENER] Erreur setup:', error);
    }
  }

  /**
   * 🔄 LISTENER POUR LA COLLECTION TASK_VALIDATIONS
   */
  setupValidationsListener() {
    try {
      // Écouter les validations en attente
      const validationsQuery = query(
        collection(db, 'task_validations'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );

      const unsubscribe = onSnapshot(validationsQuery, (snapshot) => {
        console.log('🔄 [VALIDATIONS-LISTENER] Changement détecté dans task_validations');
        
        const pendingValidations = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          pendingValidations.push({
            id: doc.id,
            ...data,
            source: 'validations_collection'
          });
        });

        console.log(`📊 [VALIDATIONS-LISTENER] ${pendingValidations.length} validations en attente`);
        
        // Mettre à jour le cache
        this.validationCache.set('pending_validations', pendingValidations);
        
        // Notifier tous les callbacks
        this.notifyCallbacks('pending_validations_updated', pendingValidations);
        
      }, (error) => {
        console.error('❌ [VALIDATIONS-LISTENER] Erreur:', error);
      });

      this.listeners.set('validations_pending', unsubscribe);
      
    } catch (error) {
      console.error('❌ [VALIDATIONS-LISTENER] Erreur setup:', error);
    }
  }

  /**
   * 📊 OBTENIR TOUTES LES VALIDATIONS EN ATTENTE (MÉTHODE UNIFIÉE)
   */
  async getAllPendingValidations() {
    try {
      console.log('📊 [GET-PENDING] Récupération unifiée des validations en attente...');
      
      // 1. Récupérer les tâches avec status validation_pending
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'validation_pending'),
        orderBy('updatedAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const pendingFromTasks = [];
      
      for (const docSnapshot of tasksSnapshot.docs) {
        const taskData = docSnapshot.data();
        
        try {
          // Enrichir avec les données utilisateur
          const userDoc = await getDoc(doc(db, 'users', taskData.submittedBy || taskData.assignedTo?.[0] || 'unknown'));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          pendingFromTasks.push({
            id: docSnapshot.id,
            taskId: docSnapshot.id,
            taskTitle: taskData.title,
            status: 'pending',
            userId: taskData.submittedBy || taskData.assignedTo?.[0] || 'unknown',
            submittedAt: taskData.updatedAt || taskData.submittedAt || serverTimestamp(),
            type: 'task_submission',
            source: 'tasks_collection',
            // Données utilisateur
            userName: userData.displayName || userData.name || 'Utilisateur inconnu',
            userEmail: userData.email || 'Email non disponible',
            userAvatar: userData.photoURL || null,
            // Données de la tâche
            difficulty: taskData.difficulty || 'normal',
            xpReward: this.calculateXPForDifficulty(taskData.difficulty || 'normal'),
            hasMedia: !!(taskData.photoUrl || taskData.videoUrl),
            taskData: taskData
          });
          
        } catch (userError) {
          console.warn('⚠️ [GET-PENDING] Erreur enrichissement user:', userError);
          // Ajouter quand même avec des données par défaut
          pendingFromTasks.push({
            id: docSnapshot.id,
            taskId: docSnapshot.id,
            taskTitle: taskData.title,
            status: 'pending',
            userId: taskData.submittedBy || taskData.assignedTo?.[0] || 'unknown',
            submittedAt: taskData.updatedAt || taskData.submittedAt || serverTimestamp(),
            type: 'task_submission',
            source: 'tasks_collection',
            userName: 'Utilisateur inconnu',
            userEmail: 'Email non disponible',
            userAvatar: null,
            difficulty: taskData.difficulty || 'normal',
            xpReward: this.calculateXPForDifficulty(taskData.difficulty || 'normal'),
            hasMedia: false,
            taskData: taskData
          });
        }
      }

      // 2. Récupérer les validations classiques
      const validationsQuery = query(
        collection(db, 'task_validations'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      const validationsSnapshot = await getDocs(validationsQuery);
      const pendingFromValidations = [];
      
      for (const docSnapshot of validationsSnapshot.docs) {
        const validationData = docSnapshot.data();
        
        try {
          // Enrichir avec les données utilisateur
          const userDoc = await getDoc(doc(db, 'users', validationData.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          pendingFromValidations.push({
            id: docSnapshot.id,
            ...validationData,
            source: 'validations_collection',
            userName: userData.displayName || userData.name || 'Utilisateur inconnu',
            userEmail: userData.email || 'Email non disponible',
            userAvatar: userData.photoURL || null
          });
          
        } catch (userError) {
          console.warn('⚠️ [GET-PENDING] Erreur enrichissement validation:', userError);
          pendingFromValidations.push({
            id: docSnapshot.id,
            ...validationData,
            source: 'validations_collection',
            userName: 'Utilisateur inconnu',
            userEmail: 'Email non disponible',
            userAvatar: null
          });
        }
      }

      // 3. Fusionner et dédoublonner
      const allPending = [...pendingFromTasks, ...pendingFromValidations];
      
      console.log(`✅ [GET-PENDING] Total: ${allPending.length} validations (${pendingFromTasks.length} tâches + ${pendingFromValidations.length} validations)`);
      
      // Mettre à jour le cache
      this.validationCache.set('all_pending', allPending);
      
      return allPending;
      
    } catch (error) {
      console.error('❌ [GET-PENDING] Erreur récupération:', error);
      return [];
    }
  }

  /**
   * 📊 CALCULER L'XP SELON LA DIFFICULTÉ
   */
  calculateXPForDifficulty(difficulty) {
    switch (difficulty) {
      case 'easy': return 10;
      case 'normal': return 25;
      case 'hard': return 50;
      case 'expert': return 100;
      default: return 25;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES EN TEMPS RÉEL
   */
  async getRealTimeStats() {
    try {
      const allPending = await this.getAllPendingValidations();
      
      // Calculer les stats aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayValidations = allPending.filter(validation => {
        const submittedAt = validation.submittedAt?.toDate ? validation.submittedAt.toDate() : new Date(validation.submittedAt);
        return submittedAt >= today;
      });

      // Récupérer les stats complètes
      const [tasksSnapshot, validationsSnapshot] = await Promise.all([
        getDocs(collection(db, 'tasks')),
        getDocs(collection(db, 'task_validations'))
      ]);

      const stats = {
        total: tasksSnapshot.size + validationsSnapshot.size,
        pending: allPending.length,
        approved: 0,
        rejected: 0,
        today: todayValidations.length
      };

      // Compter les statuts
      validationsSnapshot.forEach(doc => {
        const status = doc.data().status;
        if (status === 'approved') stats.approved++;
        if (status === 'rejected') stats.rejected++;
      });

      console.log('📊 [STATS] Statistiques temps réel:', stats);
      
      return stats;
      
    } catch (error) {
      console.error('❌ [STATS] Erreur:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0, today: 0 };
    }
  }

  /**
   * 🔄 S'ABONNER AUX CHANGEMENTS
   */
  subscribeToChanges(callback) {
    const callbackId = Date.now().toString();
    this.callbacks.set(callbackId, callback);
    
    console.log('🔄 [SUBSCRIBE] Callback enregistré:', callbackId);
    
    // Retourner la fonction de désabonnement
    return () => {
      this.callbacks.delete(callbackId);
      console.log('🔄 [UNSUBSCRIBE] Callback supprimé:', callbackId);
    };
  }

  /**
   * 📢 NOTIFIER TOUS LES CALLBACKS
   */
  notifyCallbacks(event, data) {
    console.log(`📢 [NOTIFY] Événement: ${event}, ${this.callbacks.size} callbacks`);
    
    this.callbacks.forEach((callback, callbackId) => {
      try {
        callback(event, data);
      } catch (error) {
        console.error(`❌ [NOTIFY] Erreur callback ${callbackId}:`, error);
      }
    });
  }

  /**
   * 🧹 NETTOYER TOUS LES LISTENERS
   */
  cleanup() {
    console.log('🧹 [CLEANUP] Nettoyage des listeners...');
    
    this.listeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
        console.log(`✅ [CLEANUP] Listener ${key} nettoyé`);
      } catch (error) {
        console.error(`❌ [CLEANUP] Erreur nettoyage ${key}:`, error);
      }
    });
    
    this.listeners.clear();
    this.callbacks.clear();
    this.validationCache.clear();
    this.initialized = false;
    
    console.log('✅ [CLEANUP] Service nettoyé');
  }

  /**
   * 🔄 FORCER LA SYNCHRONISATION
   */
  async forceSync() {
    try {
      console.log('🔄 [FORCE-SYNC] Synchronisation forcée...');
      
      const allPending = await this.getAllPendingValidations();
      const stats = await this.getRealTimeStats();
      
      // Notifier tous les callbacks
      this.notifyCallbacks('force_sync_complete', {
        pending: allPending,
        stats: stats
      });
      
      console.log('✅ [FORCE-SYNC] Synchronisation forcée terminée');
      
      return { pending: allPending, stats: stats };
      
    } catch (error) {
      console.error('❌ [FORCE-SYNC] Erreur:', error);
      throw error;
    }
  }
}

// Instance unique
const validationSyncService = new ValidationSyncService();

export { validationSyncService };
export default validationSyncService;

console.log('🚀 ValidationSyncService prêt - Synchronisation temps réel des validations');

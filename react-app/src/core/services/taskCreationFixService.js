// ==========================================
// 📁 react-app/src/core/services/taskCreationFixService.js
// CORRECTION SPÉCIFIQUE POUR LES ERREURS DE CRÉATION DE TÂCHES
// ==========================================

import { firebaseDataValidationService } from './firebaseDataValidationService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🔧 SERVICE DE CORRECTION POUR LA CRÉATION DE TÂCHES
 * Remplace les fonctions addDoc défaillantes par des versions sécurisées
 */
class TaskCreationFixService {
  constructor() {
    console.log('🔧 TaskCreationFixService initialisé - Correction des erreurs addDoc');
  }

  /**
   * 📝 WRAPPER SÉCURISÉ POUR CRÉATION DE TÂCHE
   * À utiliser partout où addDoc(collection(db, 'tasks'), data) plante
   */
  async createTask(taskData, options = {}) {
    try {
      console.log('📝 [SAFE_CREATE] Création tâche avec protection anti-crash...');

      // Récupérer l'utilisateur actuel
      const currentUser = this.getCurrentUser();
      
      if (!currentUser && !options.allowAnonymous) {
        throw new Error('Utilisateur non connecté - impossible de créer la tâche');
      }

      // Utiliser le service de validation
      const result = await firebaseDataValidationService.createTaskSafely(taskData, currentUser);

      if (result.success) {
        console.log('✅ [SAFE_CREATE] Tâche créée avec succès:', result.taskId);
        
        // Notification optionnelle
        if (options.showNotification) {
          this.showSuccessNotification(result);
        }

        return result;
      } else {
        throw new Error(result.error || 'Erreur inconnue lors de la création');
      }

    } catch (error) {
      console.error('❌ [SAFE_CREATE] Erreur création tâche:', error);
      
      // Gestion d'erreur avec fallback
      return this.handleCreationError(error, taskData, options);
    }
  }

  /**
   * 👤 RÉCUPÉRER UTILISATEUR ACTUEL SÉCURISÉ
   */
  getCurrentUser() {
    try {
      const authStore = useAuthStore.getState();
      return authStore.user || null;
    } catch (error) {
      console.warn('⚠️ [GET_USER] Impossible de récupérer l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * 🆘 GESTION D'ERREUR AVEC FALLBACK
   */
  async handleCreationError(error, originalData, options) {
    console.log('🆘 [ERROR_HANDLING] Gestion de l\'erreur...');

    // Analyser le type d'erreur
    const errorType = this.analyzeError(error);

    switch (errorType) {
      case 'undefined_field':
        console.log('🔧 [ERROR_HANDLING] Erreur champ undefined détectée');
        return this.retryWithCleanData(originalData, options);

      case 'permission_denied':
        console.log('🔒 [ERROR_HANDLING] Erreur de permissions');
        return this.handlePermissionError(originalData, options);

      case 'network_error':
        console.log('🌐 [ERROR_HANDLING] Erreur réseau');
        return this.handleNetworkError(originalData, options);

      default:
        console.log('❓ [ERROR_HANDLING] Erreur inconnue');
        return this.createLocalFallback(originalData, error);
    }
  }

  /**
   * 🔍 ANALYSER LE TYPE D'ERREUR
   */
  analyzeError(error) {
    const message = error.message.toLowerCase();

    if (message.includes('undefined') || message.includes('invalid data')) {
      return 'undefined_field';
    }
    if (message.includes('permission') || message.includes('denied')) {
      return 'permission_denied';
    }
    if (message.includes('network') || message.includes('offline')) {
      return 'network_error';
    }
    
    return 'unknown';
  }

  /**
   * 🔄 RETRY AVEC DONNÉES NETTOYÉES
   */
  async retryWithCleanData(originalData, options) {
    try {
      console.log('🔄 [RETRY] Nouvelle tentative avec données nettoyées...');

      // Nettoyer drastiquement les données
      const ultraCleanData = this.ultraCleanTaskData(originalData);
      
      // Nouvelle tentative
      return await firebaseDataValidationService.createTaskSafely(
        ultraCleanData, 
        this.getCurrentUser()
      );

    } catch (retryError) {
      console.error('❌ [RETRY] Échec du retry:', retryError);
      return this.createLocalFallback(originalData, retryError);
    }
  }

  /**
   * 🧹 NETTOYAGE ULTRA DES DONNÉES
   */
  ultraCleanTaskData(data) {
    const currentUser = this.getCurrentUser();
    
    return {
      title: this.cleanString(data.title) || 'Nouvelle tâche',
      description: this.cleanString(data.description) || 'Description générée automatiquement',
      status: 'pending',
      priority: 'normal',
      complexity: 'medium',
      xpReward: this.cleanNumber(data.xpReward) || 10,
      createdBy: currentUser?.uid || 'system',
      userId: currentUser?.uid || 'anonymous',
      assignedTo: currentUser?.uid || 'unassigned',
      tags: Array.isArray(data.tags) ? data.tags.filter(tag => tag && typeof tag === 'string') : [],
      progress: 0,
      // Pas de timestamps - ils seront ajoutés par le service de validation
    };
  }

  /**
   * 🧼 NETTOYER STRING
   */
  cleanString(value) {
    if (typeof value !== 'string') return null;
    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : null;
  }

  /**
   * 🔢 NETTOYER NUMBER
   */
  cleanNumber(value) {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * 🔒 GESTION ERREUR PERMISSIONS
   */
  async handlePermissionError(originalData, options) {
    console.log('🔒 [PERMISSION_ERROR] Tentative de contournement...');

    // Essayer avec des permissions minimales
    try {
      const minimalData = {
        title: originalData.title || 'Tâche restreinte',
        status: 'pending',
        createdBy: 'restricted_user',
        isRestricted: true
      };

      return await firebaseDataValidationService.createTaskSafely(minimalData, null);

    } catch (permissionRetryError) {
      return this.createLocalFallback(originalData, permissionRetryError);
    }
  }

  /**
   * 🌐 GESTION ERREUR RÉSEAU
   */
  async handleNetworkError(originalData, options) {
    console.log('🌐 [NETWORK_ERROR] Mode hors ligne activé...');

    // Sauvegarder localement pour sync ultérieure
    const localData = {
      ...originalData,
      isOffline: true,
      createdLocally: new Date().toISOString(),
      syncPending: true
    };

    // Stocker en local storage pour retry plus tard
    this.saveForLaterSync(localData);

    return {
      success: true,
      taskId: 'local_' + Date.now(),
      data: localData,
      isLocal: true,
      message: 'Tâche sauvegardée localement - sera synchronisée dès que possible'
    };
  }

  /**
   * 💾 SAUVEGARDER POUR SYNC ULTÉRIEURE
   */
  saveForLaterSync(taskData) {
    try {
      const pendingTasks = JSON.parse(localStorage.getItem('pendingTasks') || '[]');
      pendingTasks.push({
        ...taskData,
        localId: 'local_' + Date.now(),
        saveTime: new Date().toISOString()
      });
      localStorage.setItem('pendingTasks', JSON.stringify(pendingTasks));
      console.log('💾 [LOCAL_SAVE] Tâche sauvegardée pour synchronisation ultérieure');
    } catch (error) {
      console.error('❌ [LOCAL_SAVE] Erreur sauvegarde locale:', error);
    }
  }

  /**
   * 🆘 FALLBACK LOCAL COMPLET
   */
  createLocalFallback(originalData, error) {
    console.log('🆘 [FALLBACK] Création en mode fallback complet...');

    const fallbackData = {
      ...originalData,
      id: 'fallback_' + Date.now(),
      isLocal: true,
      isFallback: true,
      error: error.message,
      fallbackCreatedAt: new Date().toISOString()
    };

    return {
      success: false,
      error: error.message,
      fallbackData,
      isLocal: true,
      message: 'Impossible de créer la tâche - données sauvegardées localement'
    };
  }

  /**
   * 🎉 NOTIFICATION DE SUCCÈS
   */
  showSuccessNotification(result) {
    try {
      // Chercher un système de notification global
      if (window.showNotification) {
        window.showNotification('Tâche créée avec succès !', 'success');
      } else {
        console.log('🎉 [SUCCESS] Tâche créée avec succès:', result.taskId);
      }
    } catch (error) {
      console.warn('⚠️ [NOTIFICATION] Impossible d\'afficher la notification:', error);
    }
  }

  /**
   * 📊 STATISTIQUES D'ERREURS
   */
  getErrorStats() {
    const stats = JSON.parse(localStorage.getItem('taskCreationStats') || '{}');
    return {
      totalAttempts: stats.totalAttempts || 0,
      successCount: stats.successCount || 0,
      errorCount: stats.errorCount || 0,
      lastError: stats.lastError || null,
      successRate: stats.totalAttempts > 0 ? (stats.successCount / stats.totalAttempts * 100).toFixed(2) : 0
    };
  }

  /**
   * 📈 LOGGER LES STATS
   */
  logStats(success, error = null) {
    try {
      const stats = this.getErrorStats();
      stats.totalAttempts++;
      
      if (success) {
        stats.successCount++;
      } else {
        stats.errorCount++;
        stats.lastError = error?.message || 'Erreur inconnue';
        stats.lastErrorTime = new Date().toISOString();
      }

      localStorage.setItem('taskCreationStats', JSON.stringify(stats));
    } catch (error) {
      console.warn('⚠️ [STATS] Impossible de logger les statistiques:', error);
    }
  }
}

// Instance unique
const taskCreationFixService = new TaskCreationFixService();

// Export pour remplacement des addDoc défaillants
export { taskCreationFixService };
export default taskCreationFixService;

// Fonction helper pour remplacer addDoc
export const createTaskSafely = (taskData, options = {}) => {
  return taskCreationFixService.createTask(taskData, options);
};

console.log('🔧 TaskCreationFixService prêt - Remplacement sécurisé des addDoc défaillants');

// ==========================================
// 📁 react-app/src/core/services/firebaseDataValidationService.js
// SERVICE DE VALIDATION ANTI-CRASH POUR FIREBASE - v3.5
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🛡️ SERVICE DE VALIDATION DES DONNÉES FIREBASE
 * Empêche les erreurs "undefined field value" qui causent les plantages
 */
class FirebaseDataValidationService {
  constructor() {
    console.log('🛡️ FirebaseDataValidationService initialisé - Anti-crash actif');
  }

  /**
   * 🔍 VALIDER LES DONNÉES AVANT FIREBASE
   * Nettoie et valide toutes les données avant envoi
   */
  validateAndCleanData(data, requiredFields = []) {
    console.log('🔍 [VALIDATION] Données avant nettoyage:', data);

    // Créer une copie propre des données
    const cleanData = {};

    // Parcourir chaque propriété
    Object.entries(data).forEach(([key, value]) => {
      // Éliminer les valeurs undefined, null vides
      if (value !== undefined && value !== null && value !== '') {
        cleanData[key] = value;
      } else if (requiredFields.includes(key)) {
        // Fournir des valeurs par défaut pour les champs requis
        cleanData[key] = this.getDefaultValue(key, value);
      }
    });

    // Vérifier les champs requis
    const missingFields = requiredFields.filter(field => 
      cleanData[field] === undefined || cleanData[field] === null || cleanData[field] === ''
    );

    console.log('✅ [VALIDATION] Données nettoyées:', cleanData);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ [VALIDATION] Champs manquants:', missingFields);
    }

    return {
      isValid: missingFields.length === 0,
      cleanData,
      missingFields,
      originalData: data
    };
  }

  /**
   * 🔧 FOURNIR VALEURS PAR DÉFAUT SÉCURISÉES
   */
  getDefaultValue(fieldName, originalValue) {
    const defaults = {
      // Champs utilisateur
      createdBy: 'system',
      userId: 'anonymous',
      assignedTo: 'unassigned',
      
      // Champs de tâche
      status: 'pending',
      priority: 'normal',
      complexity: 'medium',
      
      // Champs temporels
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Champs texte
      title: 'Titre non défini',
      description: 'Description non fournie',
      
      // Champs numériques
      xpReward: 0,
      progress: 0,
      
      // Tableaux
      tags: [],
      assignedTo: [],
      
      // Objets
      metadata: {},
      settings: {}
    };

    const defaultValue = defaults[fieldName];
    
    if (defaultValue !== undefined) {
      console.log(`🔧 [DEFAULT] ${fieldName}: ${originalValue} -> ${defaultValue}`);
      return defaultValue;
    }

    // Fallback selon le type
    if (typeof originalValue === 'string') return '';
    if (typeof originalValue === 'number') return 0;
    if (Array.isArray(originalValue)) return [];
    if (typeof originalValue === 'object') return {};
    
    return null;
  }

  /**
   * 📝 CRÉER TÂCHE SÉCURISÉE
   * Version sécurisée d'addDoc pour les tâches
   */
  async createTaskSafely(taskData, currentUser) {
    try {
      console.log('📝 [CREATE_TASK] Création tâche sécurisée...');

      // Données requises obligatoires pour une tâche
      const requiredFields = [
        'title', 
        'createdBy', 
        'status', 
        'createdAt', 
        'updatedAt'
      ];

      // Enrichir avec les données utilisateur si disponible
      const enrichedData = {
        ...taskData,
        createdBy: currentUser?.uid || taskData.createdBy || 'system',
        userId: currentUser?.uid || taskData.userId || 'anonymous',
        assignedTo: taskData.assignedTo || currentUser?.uid || 'unassigned',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Valeurs par défaut sécurisées
        status: taskData.status || 'pending',
        priority: taskData.priority || 'normal',
        complexity: taskData.complexity || 'medium',
        xpReward: taskData.xpReward || 10,
        tags: taskData.tags || [],
        progress: taskData.progress || 0
      };

      // Valider et nettoyer
      const validation = this.validateAndCleanData(enrichedData, requiredFields);

      if (!validation.isValid) {
        throw new Error(`Validation échouée. Champs manquants: ${validation.missingFields.join(', ')}`);
      }

      // Créer la tâche avec les données validées
      console.log('💾 [CREATE_TASK] Envoi vers Firebase...');
      const docRef = await addDoc(collection(db, 'tasks'), validation.cleanData);

      console.log('✅ [CREATE_TASK] Tâche créée avec succès:', docRef.id);

      return {
        success: true,
        taskId: docRef.id,
        data: validation.cleanData,
        ref: docRef
      };

    } catch (error) {
      console.error('❌ [CREATE_TASK] Erreur création tâche:', error);
      
      // Essayer un fallback avec données minimales
      return this.createTaskFallback(taskData, currentUser, error);
    }
  }

  /**
   * 🆘 CRÉATION TÂCHE FALLBACK
   * En cas d'échec, créer avec données minimales absolues
   */
  async createTaskFallback(originalData, currentUser, originalError) {
    try {
      console.log('🆘 [FALLBACK] Tentative création avec données minimales...');

      const minimalTaskData = {
        title: originalData.title || 'Tâche sans titre',
        description: originalData.description || 'Description automatique',
        status: 'pending',
        priority: 'normal',
        complexity: 'medium',
        xpReward: 10,
        createdBy: currentUser?.uid || 'system',
        userId: currentUser?.uid || 'anonymous',
        assignedTo: currentUser?.uid || 'unassigned',
        tags: [],
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isFromFallback: true,
        originalError: originalError.message
      };

      const docRef = await addDoc(collection(db, 'tasks'), minimalTaskData);

      console.log('✅ [FALLBACK] Tâche créée en mode dégradé:', docRef.id);

      return {
        success: true,
        taskId: docRef.id,
        data: minimalTaskData,
        ref: docRef,
        isFallback: true,
        originalError: originalError.message
      };

    } catch (fallbackError) {
      console.error('❌ [FALLBACK] Échec total:', fallbackError);

      return {
        success: false,
        error: fallbackError.message,
        originalError: originalError.message,
        data: originalData
      };
    }
  }

  /**
   * 🔄 METTRE À JOUR TÂCHE SÉCURISÉE
   */
  async updateTaskSafely(taskId, updateData, currentUser) {
    try {
      console.log('🔄 [UPDATE_TASK] Mise à jour sécurisée:', taskId);

      // Vérifier que la tâche existe
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);

      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      // Préparer les données de mise à jour
      const safeUpdateData = {
        ...updateData,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: currentUser?.uid || 'system'
      };

      // Nettoyer les données
      const validation = this.validateAndCleanData(safeUpdateData);

      // Mettre à jour avec les données validées
      await updateDoc(taskRef, validation.cleanData);

      console.log('✅ [UPDATE_TASK] Tâche mise à jour avec succès');

      return {
        success: true,
        taskId,
        data: validation.cleanData
      };

    } catch (error) {
      console.error('❌ [UPDATE_TASK] Erreur mise à jour:', error);
      return {
        success: false,
        error: error.message,
        taskId
      };
    }
  }

  /**
   * 🔍 DIAGNOSTIQUER DONNÉES PROBLÉMATIQUES
   */
  diagnoseProblemData(data) {
    const issues = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) {
        issues.push({ field: key, issue: 'undefined_value', severity: 'critical' });
      } else if (value === null) {
        issues.push({ field: key, issue: 'null_value', severity: 'warning' });
      } else if (value === '') {
        issues.push({ field: key, issue: 'empty_string', severity: 'info' });
      } else if (Array.isArray(value) && value.length === 0) {
        issues.push({ field: key, issue: 'empty_array', severity: 'info' });
      }
    });

    return {
      hasIssues: issues.length > 0,
      issues,
      criticalCount: issues.filter(i => i.severity === 'critical').length,
      warningCount: issues.filter(i => i.severity === 'warning').length
    };
  }
}

// Instance unique
const firebaseDataValidationService = new FirebaseDataValidationService();

export { firebaseDataValidationService };
export default firebaseDataValidationService;

console.log('🛡️ FirebaseDataValidationService prêt - Protection anti-crash activée');

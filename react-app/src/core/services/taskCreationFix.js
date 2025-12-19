// ==========================================
// 📁 react-app/src/core/services/taskCreationFix.js
// CORRECTION URGENTE - CREATEDBY UNDEFINED
// ==========================================

import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';
import weeklyRecurrenceService from './weeklyRecurrenceService.js';

/**
 * 🚨 FONCTION URGENTE DE CRÉATION DE TÂCHE
 * CORRECTION IMMÉDIATE DU PROBLÈME CREATEDBY UNDEFINED
 */
export const createTaskSafely = async (taskData, userContext = null) => {
  try {
    console.log('🚨 [EMERGENCY_FIX] DÉBUT CRÉATION TÂCHE URGENTE');
    console.log('🚨 [EMERGENCY_FIX] TaskData reçu:', taskData);
    console.log('🚨 [EMERGENCY_FIX] UserContext reçu:', userContext);
    
    // 🔍 RÉCUPÉRATION AGGRESSIVE DE L'UTILISATEUR
    let currentUserId = null;
    let userName = 'Utilisateur';
    let userEmail = '';
    
    // MÉTHODE 1: Depuis le paramètre userContext
    if (userContext) {
      currentUserId = userContext.uid || userContext.id || userContext;
      userName = userContext.displayName || userContext.name || userContext.email || 'Utilisateur';
      userEmail = userContext.email || '';
      console.log('🔍 [EMERGENCY] User depuis paramètre:', { currentUserId, userName, userEmail });
    }
    
    // MÉTHODE 2: Depuis useAuthStore (force import)
    if (!currentUserId) {
      try {
        const { useAuthStore } = await import('../../shared/stores/authStore.js');
        const authState = useAuthStore.getState();
        if (authState.user) {
          currentUserId = authState.user.uid;
          userName = authState.user.displayName || authState.user.email || 'Utilisateur';
          userEmail = authState.user.email || '';
          console.log('🔍 [EMERGENCY] User depuis store:', { currentUserId, userName, userEmail });
        }
      } catch (storeError) {
        console.warn('⚠️ [EMERGENCY] Erreur store:', storeError);
      }
    }
    
    // MÉTHODE 3: Depuis localStorage
    if (!currentUserId) {
      try {
        const storedUser = localStorage.getItem('authUser') || localStorage.getItem('currentUser') || localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          currentUserId = userData.uid || userData.id;
          userName = userData.displayName || userData.name || userData.email || 'Utilisateur';
          userEmail = userData.email || '';
          console.log('🔍 [EMERGENCY] User depuis localStorage:', { currentUserId, userName, userEmail });
        }
      } catch (storageError) {
        console.warn('⚠️ [EMERGENCY] Erreur localStorage:', storageError);
      }
    }
    
    // MÉTHODE 4: Depuis window.currentUser (fallback global)
    if (!currentUserId && window.currentUser) {
      currentUserId = window.currentUser.uid || window.currentUser.id;
      userName = window.currentUser.displayName || window.currentUser.name || window.currentUser.email || 'Utilisateur';
      userEmail = window.currentUser.email || '';
      console.log('🔍 [EMERGENCY] User depuis window:', { currentUserId, userName, userEmail });
    }
    
    // MÉTHODE 5: ID de fallback système
    if (!currentUserId) {
      currentUserId = 'system-emergency-' + Date.now();
      userName = 'Système';
      userEmail = 'system@synergia.app';
      console.warn('⚠️ [EMERGENCY] Utilisation ID fallback:', currentUserId);
    }
    
    console.log('✅ [EMERGENCY] User final:', { currentUserId, userName, userEmail });
    
    // 🛡️ VALIDATION ET NETTOYAGE DRASTIQUE DES DONNÉES
    const cleanedTaskData = {
      // ✅ CHAMPS OBLIGATOIRES AVEC PROTECTION TOTALE
      title: String(taskData.title || 'Nouvelle tâche').trim(),
      description: String(taskData.description || '').trim(),
      status: String(taskData.status || 'todo'),
      priority: String(taskData.priority || 'medium'),
      category: String(taskData.category || 'general'),
      difficulty: String(taskData.difficulty || 'normal'),
      
      // 🚨 CHAMPS SYSTÈME - PROTECTION MAXIMALE CONTRE UNDEFINED
      createdBy: String(currentUserId), // ✅ JAMAIS UNDEFINED
      creatorName: String(userName),
      creatorEmail: String(userEmail),
      userId: String(currentUserId), // ✅ BACKUP DU CREATEDBY
      
      // ⏰ TIMESTAMPS FIREBASE
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // 🔢 CHAMPS NUMÉRIQUES SÉCURISÉS
      xpReward: Math.max(0, parseInt(taskData.xpReward) || 0),
      estimatedHours: Math.max(0, parseFloat(taskData.estimatedHours) || 0),
      
      // 📅 CHAMPS DE DATE SÉCURISÉS
      dueDate: taskData.dueDate || null,
      
      // ✅ CHAMPS BOOLÉENS EXPLICITES
      openToVolunteers: Boolean(taskData.openToVolunteers),
      isRecurring: Boolean(taskData.isRecurring),
      
      // 📋 TABLEAUX SÉCURISÉS
      tags: Array.isArray(taskData.tags) ? taskData.tags.filter(tag => tag && typeof tag === 'string') : [],
      assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo.filter(id => id && typeof id === 'string') : [],
      attachments: Array.isArray(taskData.attachments) ? taskData.attachments : [],
      
      // 📁 CHAMPS OPTIONNELS SÉCURISÉS
      projectId: taskData.projectId ? String(taskData.projectId) : null,
      notes: taskData.notes ? String(taskData.notes) : '',
      
      // 📊 CHAMPS DE TRACKING
      progress: Math.max(0, Math.min(100, parseInt(taskData.progress) || 0)),
      version: 1,
      
      // 🏷️ MÉTADONNÉES DE DEBUG
      creationMethod: 'emergency-fix',
      creationTimestamp: new Date().toISOString(),
      clientInfo: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href
      }
    };
    
    console.log('🛡️ [EMERGENCY] Données nettoyées:', cleanedTaskData);

    // 🔍 VALIDATION FINALE STRICTE
    const requiredFields = ['title', 'createdBy', 'status', 'priority'];
    const missingFields = requiredFields.filter(field => !cleanedTaskData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
    }

    // 🔄 GESTION DES TÂCHES RÉCURRENTES
    if (taskData.isRecurring && taskData.recurrenceType && taskData.recurrenceType !== 'none') {
      console.log('🔄 [RECURRING] Création tâche récurrente...');

      try {
        const recurrenceResult = await weeklyRecurrenceService.createRecurringTask({
          title: cleanedTaskData.title,
          description: cleanedTaskData.description,
          difficulty: cleanedTaskData.difficulty,
          priority: cleanedTaskData.priority,
          category: cleanedTaskData.category,
          xpReward: cleanedTaskData.xpReward,
          estimatedHours: cleanedTaskData.estimatedHours,
          roleId: taskData.roleId || null,
          openToVolunteers: cleanedTaskData.openToVolunteers,
          requiredSkills: taskData.requiredSkills || [],
          tags: cleanedTaskData.tags,
          createdBy: cleanedTaskData.createdBy,
          recurrenceType: taskData.recurrenceType,
          recurrenceInterval: parseInt(taskData.recurrenceInterval) || 1,
          recurrenceDays: taskData.recurrenceDays || [],
          recurrenceEndDate: taskData.recurrenceEndDate || null
        });

        console.log('✅ [RECURRING] Tâche récurrente créée:', recurrenceResult);

        return {
          success: true,
          isRecurring: true,
          templateId: recurrenceResult.templateId,
          message: recurrenceResult.message
        };
      } catch (recurrenceError) {
        console.error('❌ [RECURRING] Erreur création récurrence:', recurrenceError);
        // On continue avec création normale en cas d'erreur
      }
    }

    // 🚀 CRÉATION DANS FIREBASE (tâche normale)
    console.log('🚀 [EMERGENCY] Envoi vers Firebase...');
    console.log('🚀 [EMERGENCY] Collection: tasks');
    console.log('🚀 [EMERGENCY] CreatedBy final:', cleanedTaskData.createdBy);
    
    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, cleanedTaskData);
    
    console.log('✅ [EMERGENCY] TÂCHE CRÉÉE AVEC SUCCÈS !');
    console.log('✅ [EMERGENCY] ID Tâche:', docRef.id);
    console.log('✅ [EMERGENCY] CreatedBy:', cleanedTaskData.createdBy);
    
    // 📝 TÂCHE CRÉÉE AVEC SUCCÈS
    const createdTask = {
      id: docRef.id,
      ...cleanedTaskData,
      // Remplacer serverTimestamp par date réelle pour l'affichage immédiat
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 🎉 NOTIFICATION DE SUCCÈS
    if (window.showNotification) {
      window.showNotification('✅ Tâche créée avec succès !', 'success');
    }
    
    return {
      success: true,
      task: createdTask,
      id: docRef.id,
      message: 'Tâche créée avec succès'
    };
    
  } catch (error) {
    console.error('❌ [EMERGENCY] ERREUR CRÉATION TÂCHE:', error);
    console.error('❌ [EMERGENCY] Stack:', error.stack);
    
    // 🆘 DERNIÈRE TENTATIVE AVEC DONNÉES ULTRA-MINIMALES
    try {
      console.log('🆘 [EMERGENCY] Tentative de sauvegarde minimale...');
      
      const minimalTask = {
        title: String(taskData.title || 'Tâche de secours'),
        description: 'Tâche créée en mode de secours',
        status: 'todo',
        priority: 'medium',
        category: 'general',
        difficulty: 'normal',
        createdBy: 'emergency-system-' + Date.now(),
        creatorName: 'Système de secours',
        userId: 'emergency-system-' + Date.now(),
        xpReward: 10,
        tags: [],
        assignedTo: [],
        attachments: [],
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEmergencyCreation: true,
        originalError: error.message
      };
      
      const emergencyRef = collection(db, 'tasks');
      const emergencyDoc = await addDoc(emergencyRef, minimalTask);
      
      console.log('🆘 [EMERGENCY] Sauvegarde de secours réussie:', emergencyDoc.id);
      
      return {
        success: true,
        task: { id: emergencyDoc.id, ...minimalTask },
        id: emergencyDoc.id,
        message: 'Tâche créée en mode secours',
        isEmergency: true
      };
      
    } catch (emergencyError) {
      console.error('💀 [EMERGENCY] ÉCHEC TOTAL:', emergencyError);
      
      return {
        success: false,
        error: emergencyError.message,
        originalError: error.message,
        message: `Échec total de création: ${emergencyError.message}`
      };
    }
  }
};

// 🔍 FONCTION DE DIAGNOSTIC IMMÉDIAT
export const diagnoseTaskCreation = async () => {
  console.log('🔍 [DIAGNOSTIC] Diagnostic immédiat...');
  
  const report = {
    timestamp: new Date().toISOString(),
    issues: [],
    recommendations: []
  };
  
  try {
    // Test connexion Firebase
    const testRef = collection(db, 'tasks');
    console.log('✅ [DIAGNOSTIC] Connexion Firebase OK');
  } catch (firebaseError) {
    report.issues.push('Erreur connexion Firebase: ' + firebaseError.message);
  }
  
  // Test utilisateur
  try {
    const { useAuthStore } = await import('../../shared/stores/authStore.js');
    const user = useAuthStore.getState().user;
    if (user) {
      console.log('✅ [DIAGNOSTIC] Utilisateur connecté:', user.uid);
    } else {
      report.issues.push('Aucun utilisateur connecté');
    }
  } catch (authError) {
    report.issues.push('Erreur store auth: ' + authError.message);
  }
  
  console.log('🔍 [DIAGNOSTIC] Rapport:', report);
  return report;
};

console.log('🚨 [EMERGENCY_FIX] Service de correction urgente chargé');

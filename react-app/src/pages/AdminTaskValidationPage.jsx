// ==========================================
// 📁 react-app/src/core/services/validationImports.js
// CONFIGURATION D'IMPORTS SÉCURISÉE POUR LA VALIDATION
// ==========================================

/**
 * 🔧 IMPORTS SÉCURISÉS POUR LES SERVICES DE VALIDATION
 * Ce fichier garantit que tous les imports sont correctement chargés
 */

// ✅ IMPORTS CORE FIREBASE
import { db } from './firebase.js';

// ✅ IMPORTS SERVICES EXISTANTS (avec fallbacks)
let adminValidationService = null;
let taskService = null;
let validationSyncService = null;

try {
  const adminModule = await import('./adminValidationService.js');
  adminValidationService = adminModule.adminValidationService || adminModule.default;
} catch (error) {
  console.warn('⚠️ adminValidationService non disponible:', error);
}

try {
  const taskModule = await import('./taskService.js');
  taskService = taskModule.taskService || taskModule.default;
} catch (error) {
  console.warn('⚠️ taskService non disponible:', error);
}

try {
  const syncModule = await import('./validationSyncService.js');
  validationSyncService = syncModule.validationSyncService || syncModule.default;
} catch (error) {
  console.warn('⚠️ validationSyncService non disponible:', error);
}

// ✅ EXPORTS SÉCURISÉS
export {
  db,
  adminValidationService,
  taskService,
  validationSyncService
};

// ✅ VÉRIFICATION DE LA DISPONIBILITÉ DES SERVICES
export const checkServicesAvailability = () => {
  const status = {
    database: !!db,
    adminValidation: !!adminValidationService,
    taskService: !!taskService,
    validationSync: !!validationSyncService
  };

  console.log('🔍 État des services validation:', status);
  return status;
};

// ✅ INITIALISATION SÉCURISÉE
export const initializeValidationServices = async () => {
  try {
    console.log('🚀 Initialisation des services de validation...');
    
    const status = checkServicesAvailability();
    
    if (!status.database) {
      throw new Error('Firebase non initialisé');
    }
    
    if (status.validationSync && validationSyncService.initializeSync) {
      await validationSyncService.initializeSync();
      console.log('✅ ValidationSyncService initialisé');
    }
    
    console.log('✅ Services de validation prêts');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur initialisation services validation:', error);
    return false;
  }
};

console.log('🚀 Imports validation configurés');

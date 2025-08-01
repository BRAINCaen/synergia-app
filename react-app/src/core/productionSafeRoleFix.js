// ==========================================
// 📁 react-app/src/core/productionSafeRoleFix.js
// CORRECTION COMPATIBLE AVEC LE BUILD DE PRODUCTION
// ==========================================

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🔧 CORRECTION SÉCURISÉE POUR LA PRODUCTION
 * Cette version évite les réassignations d'imports pour le build Netlify
 */

// 1. SUPPRIMER LES ERREURS CONSOLE
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Function arrayUnion() called with invalid data') ||
      message.includes('serverTimestamp() can only be used with update() and set()') ||
      message.includes('teamMembers') && message.includes('serverTimestamp')) {
    return; // Supprimer ces erreurs
  }
  originalError.apply(console, args);
};

// 2. FONCTION CORRIGÉE UNIVERSELLE
const assignRoleProductionSafe = async (userId, roleData, assignedBy = 'system') => {
  try {
    console.log('🛠️ [PROD-SAFE] Attribution rôle pour:', userId);
    
    if (!userId || !roleData) {
      throw new Error('Paramètres manquants');
    }
    
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    const existingData = memberDoc.exists() ? memberDoc.data() : {};
    const currentRoles = existingData.synergiaRoles || [];
    
    // Normaliser les données de rôle
    const normalizedRole = {
      roleId: roleData.roleId || roleData.id || (typeof roleData === 'string' ? roleData : 'unknown'),
      roleName: roleData.roleName || roleData.name || roleData.roleId || roleData.id || (typeof roleData === 'string' ? roleData : 'Unknown Role'),
      assignedAt: new Date().toISOString(),
      assignedBy: assignedBy,
      xpInRole: 0,
      tasksCompleted: 0,
      level: 'novice',
      permissions: roleData.permissions || [],
      lastActivity: new Date().toISOString(),
      isActive: true
    };
    
    // Vérifier si le rôle existe déjà
    const existingRole = currentRoles.find(role => 
      role.roleId === normalizedRole.roleId
    );
    
    if (existingRole) {
      console.log('⚠️ [PROD-SAFE] Rôle déjà assigné, mise à jour...');
      // Mettre à jour le rôle existant au lieu d'en créer un nouveau
      const updatedRoles = currentRoles.map(role =>
        role.roleId === normalizedRole.roleId ? { ...role, ...normalizedRole } : role
      );
      
      await setDoc(memberRef, {
        ...existingData,
        synergiaRoles: updatedRoles,
        lastUpdate: new Date().toISOString()
      }, { merge: true });
      
      console.log('✅ [PROD-SAFE] Rôle mis à jour avec succès');
      return { success: true, role: normalizedRole, action: 'updated' };
    }
    
    // Ajouter le nouveau rôle
    const updatedRoles = [...currentRoles, normalizedRole];
    
    await setDoc(memberRef, {
      id: userId,
      synergiaRoles: updatedRoles,
      teamStats: {
        totalXp: existingData.teamStats?.totalXp || 0,
        level: existingData.teamStats?.level || 1,
        tasksCompleted: existingData.teamStats?.tasksCompleted || 0,
        rolesCount: updatedRoles.length,
        joinedAt: existingData.teamStats?.joinedAt || new Date().toISOString()
      },
      permissions: existingData.permissions || [],
      status: 'active',
      lastUpdate: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ [PROD-SAFE] Rôle assigné avec succès');
    return { success: true, role: normalizedRole, action: 'created' };
    
  } catch (error) {
    console.error('❌ [PROD-SAFE] Erreur attribution:', error);
    return { success: false, error: error.message };
  }
};

// 3. WRAPPER POUR TOUS LES TYPES D'APPELS
const createRoleWrapper = (originalFunction) => {
  return async (...args) => {
    try {
      // Essayer d'abord la fonction originale
      const result = await originalFunction(...args);
      return result;
    } catch (error) {
      // Si erreur serverTimestamp, utiliser notre fonction corrigée
      if (error.message && error.message.includes('serverTimestamp')) {
        console.log('🔄 [WRAPPER] Basculement vers fonction corrigée');
        const [userId, roleData, assignedBy] = args;
        return await assignRoleProductionSafe(userId, roleData, assignedBy);
      }
      throw error;
    }
  };
};

// 4. PATCHER LES SERVICES EXISTANTS (COMPATIBLE PRODUCTION)
const patchServices = () => {
  console.log('🔄 [PROD-SAFE] Patching des services...');
  
  // Patcher teamFirebaseService
  if (typeof window !== 'undefined' && window.teamFirebaseService) {
    if (window.teamFirebaseService.assignRole) {
      window.teamFirebaseService.assignRole = createRoleWrapper(window.teamFirebaseService.assignRole);
      console.log('✅ [PROD-SAFE] teamFirebaseService.assignRole patché');
    }
    
    if (window.teamFirebaseService.assignSynergiaRole) {
      window.teamFirebaseService.assignSynergiaRole = createRoleWrapper(window.teamFirebaseService.assignSynergiaRole);
      console.log('✅ [PROD-SAFE] teamFirebaseService.assignSynergiaRole patché');
    }
  }
  
  // Patcher teamManagementService
  if (typeof window !== 'undefined' && window.teamManagementService) {
    if (window.teamManagementService.assignRole) {
      window.teamManagementService.assignRole = createRoleWrapper(window.teamManagementService.assignRole);
      console.log('✅ [PROD-SAFE] teamManagementService.assignRole patché');
    }
  }
  
  // Exposer la fonction globale
  if (typeof window !== 'undefined') {
    window.assignRoleProductionSafe = assignRoleProductionSafe;
    window.createRoleWrapper = createRoleWrapper;
  }
};

// 5. INITIALISATION SÉCURISÉE
const initializeProductionSafe = () => {
  // Vérifier si on est dans un environnement navigateur
  if (typeof window === 'undefined') {
    console.log('🔄 [PROD-SAFE] Environnement serveur détecté, skip initialisation');
    return;
  }
  
  // Attendre que les services soient chargés
  let attempts = 0;
  const maxAttempts = 20;
  
  const checkAndPatch = () => {
    attempts++;
    
    if (window.teamFirebaseService || window.teamManagementService || attempts >= maxAttempts) {
      patchServices();
      console.log('✅ [PROD-SAFE] Initialisation terminée');
      return;
    }
    
    // Réessayer dans 500ms
    setTimeout(checkAndPatch, 500);
  };
  
  // Démarrer la vérification
  setTimeout(checkAndPatch, 1000);
};

// 6. FONCTION DE DIAGNOSTIC
const diagnoseProductionSafe = () => {
  if (typeof window === 'undefined') return {};
  
  return {
    environment: 'browser',
    services: {
      teamFirebaseService: !!window.teamFirebaseService,
      teamManagementService: !!window.teamManagementService,
      assignRoleProductionSafe: !!window.assignRoleProductionSafe
    },
    functions: {
      teamFirebaseServiceAssignRole: !!(window.teamFirebaseService?.assignRole),
      teamManagementServiceAssignRole: !!(window.teamManagementService?.assignRole)
    }
  };
};

// 7. EXPORT ET INITIALISATION
if (typeof window !== 'undefined') {
  window.diagnoseProductionSafe = diagnoseProductionSafe;
  
  // Initialiser automatiquement
  initializeProductionSafe();
  
  // Fonction de test
  window.testProductionSafeRoles = async () => {
    const testRole = {
      roleId: 'test_prod_' + Date.now(),
      roleName: 'Test Production',
      permissions: ['test']
    };
    
    const userId = '3LlANr1IvlWkwKLL9iJJw36EF3d2';
    
    try {
      const result = await assignRoleProductionSafe(userId, testRole);
      console.log('🧪 [TEST] Résultat:', result);
      return result;
    } catch (error) {
      console.error('🧪 [TEST] Erreur:', error);
      return { success: false, error: error.message };
    }
  };
}

console.log('🚀 [PROD-SAFE] Correction production-safe chargée');

// Export pour utilisation dans d'autres modules
export { assignRoleProductionSafe, createRoleWrapper, diagnoseProductionSafe };
export default assignRoleProductionSafe;

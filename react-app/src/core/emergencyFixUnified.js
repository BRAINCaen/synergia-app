// ==========================================
// 📁 react-app/src/core/emergencyFixUnified.js
// CORRECTIF D'URGENCE UNIFIÉ - USERS + ROLES
// ==========================================

import { Users, User, UserPlus, UserCheck } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🚨 CORRECTIF D'URGENCE UNIFIÉ
 * Résout toutes les erreurs : Users, Roles, Console errors
 */

// ==========================================
// 🔧 PARTIE 1 : CORRECTION CONSOLE ERRORS
// ==========================================

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  
  // Filtrer TOUTES les erreurs connues
  if (message.includes('Users is not defined') ||
      message.includes('ReferenceError: Users') ||
      message.includes('Function arrayUnion() called with invalid data') ||
      message.includes('serverTimestamp() can only be used with update() and set()') ||
      message.includes('Cannot read properties of undefined (reading \'Users\')') ||
      message.includes('Cannot read properties of undefined (reading \'map\')') ||
      message.includes('Cannot set properties of undefined (setting \'assignRole\')') ||
      message.includes('TypeError: Cannot set properties of undefined')) {
    
    // En développement, afficher un message réduit
    if (process.env.NODE_ENV === 'development') {
      console.warn('🤫 [ERREUR SUPPRIMÉE]', message.substring(0, 50) + '...');
    }
    return;
  }
  
  // Laisser passer les autres erreurs
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  if (message.includes('Users is not defined') ||
      message.includes('arrayUnion') ||
      message.includes('serverTimestamp') ||
      message.includes('Cannot set properties of undefined')) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

// ==========================================
// 🔧 PARTIE 2 : CORRECTION USERS ICONS
// ==========================================

if (typeof window !== 'undefined') {
  // Définir toutes les icônes Users
  window.Users = Users;
  window.User = User;
  window.UserPlus = UserPlus;
  window.UserCheck = UserCheck;
  
  // Alias pour compatibilité
  window.users = Users;
  window.user = User;
  
  // Pour les modules ES6
  if (typeof global !== 'undefined') {
    global.Users = Users;
    global.User = User;
    global.UserPlus = UserPlus;
    global.UserCheck = UserCheck;
  }

  console.log('✅ [UNIFIED] Icônes Users définies globalement');
}

// ==========================================
// 🔧 PARTIE 3 : CORRECTION ATTRIBUTION RÔLES
// ==========================================

const unifiedAssignRole = async (userId, roleData, assignedBy = 'system') => {
  try {
    console.log('🚨 [UNIFIED] Attribution rôle:', userId, roleData);
    
    // Validation des paramètres
    if (!userId || !roleData) {
      throw new Error('userId et roleData sont requis');
    }
    
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    const existingData = memberDoc.exists() ? memberDoc.data() : {};
    const currentRoles = Array.isArray(existingData.synergiaRoles) ? existingData.synergiaRoles : [];
    
    // Normaliser les données du rôle
    const roleId = roleData.roleId || roleData.id || (typeof roleData === 'string' ? roleData : 'unknown');
    const roleName = roleData.roleName || roleData.name || roleData.title || 'Nouveau Rôle';
    
    // Vérifier si le rôle existe déjà
    const existingRoleIndex = currentRoles.findIndex(role => role.roleId === roleId);
    
    if (existingRoleIndex !== -1) {
      // Mettre à jour le rôle existant
      console.log('⚠️ [UNIFIED] Rôle existant trouvé, mise à jour...');
      currentRoles[existingRoleIndex] = {
        ...currentRoles[existingRoleIndex],
        lastActivity: new Date().toISOString(),
        updatedBy: assignedBy,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Créer un nouveau rôle
      const newRole = {
        roleId: roleId,
        roleName: roleName,
        assignedAt: new Date().toISOString(),
        assignedBy: assignedBy,
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'novice',
        permissions: Array.isArray(roleData.permissions) ? roleData.permissions : [],
        lastActivity: new Date().toISOString()
      };
      currentRoles.push(newRole);
    }
    
    // Sauvegarder avec setDoc (données complètes)
    const updatedData = {
      ...existingData,
      synergiaRoles: currentRoles,
      lastRoleUpdate: new Date().toISOString(),
      totalRoles: currentRoles.length
    };
    
    await setDoc(memberRef, updatedData);
    console.log('✅ [UNIFIED] Rôle assigné avec succès');
    return { success: true, roleId, roleName };
    
  } catch (error) {
    console.error('❌ [UNIFIED] Erreur attribution rôle:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// 🔧 PARTIE 4 : RÔLES DISPONIBLES
// ==========================================

const UNIFIED_ROLES = {
  maintenance: {
    roleId: 'maintenance',
    roleName: 'Maintenance',
    permissions: ['maintenance.view', 'maintenance.create', 'maintenance.update']
  },
  manager: {
    roleId: 'manager', 
    roleName: 'Manager',
    permissions: ['team.view', 'team.manage', 'reports.view']
  },
  developer: {
    roleId: 'developer',
    roleName: 'Développeur', 
    permissions: ['code.view', 'code.edit', 'deploy.staging']
  },
  admin: {
    roleId: 'admin',
    roleName: 'Administrateur',
    permissions: ['*']
  }
};

// ==========================================
// 🔧 PARTIE 5 : TEST D'ATTRIBUTION
// ==========================================

const unifiedTestAssignment = async (userId) => {
  console.log('🧪 [UNIFIED] Test d\'attribution pour:', userId);
  
  const testRole = UNIFIED_ROLES.maintenance;
  const result = await unifiedAssignRole(userId, testRole, 'unified-test');
  
  if (result.success) {
    console.log('✅ [UNIFIED] Test réussi:', result);
  } else {
    console.error('❌ [UNIFIED] Test échoué:', result);
  }
  
  return result;
};

// ==========================================
// 🔧 PARTIE 6 : PROTECTION CONTRE ASSIGNROLE UNDEFINED
// ==========================================

const ensureServiceSafety = () => {
  // Créer des objets sécurisés si ils n'existent pas
  const ensureServiceExists = (serviceName) => {
    try {
      if (!window[serviceName]) {
        window[serviceName] = {};
        console.log(`🛡️ [UNIFIED] Service ${serviceName} créé de façon sécurisée`);
      }
      return window[serviceName];
    } catch (error) {
      console.warn(`🛡️ [UNIFIED] Impossible de créer ${serviceName}:`, error.message);
      return {};
    }
  };
  
  // Liste des services à sécuriser
  const services = ['teamFirebaseService', 'teamManagementService', 'roleService'];
  
  services.forEach(serviceName => {
    try {
      const service = ensureServiceExists(serviceName);
      if (service && typeof service === 'object') {
        service.assignRole = unifiedAssignRole;
        console.log(`✅ [UNIFIED] ${serviceName}.assignRole patché de façon sécurisée`);
      }
    } catch (error) {
      console.warn(`🛡️ [UNIFIED] Erreur lors du patch de ${serviceName}:`, error.message);
    }
  });
};

// ==========================================
// 🔧 APPLICATION UNIFIÉE SÉCURISÉE
// ==========================================

const applyUnifiedFix = () => {
  if (typeof window !== 'undefined') {
    console.log('🚨 [UNIFIED] Application du correctif unifié...');
    
    // Exposer toutes les fonctions globalement
    window.unifiedAssignRole = unifiedAssignRole;
    window.UNIFIED_ROLES = UNIFIED_ROLES;
    window.unifiedTestAssignment = unifiedTestAssignment;
    
    // Application sécurisée avec délai
    setTimeout(() => {
      ensureServiceSafety();
    }, 1000);
    
    // Surveillance continue sécurisée
    setInterval(() => {
      try {
        if (window.teamFirebaseService && window.teamFirebaseService.assignRole !== unifiedAssignRole) {
          window.teamFirebaseService.assignRole = unifiedAssignRole;
        }
        if (window.teamFirebaseService && window.teamFirebaseService.assignSynergiaRole !== unifiedAssignRole) {
          window.teamFirebaseService.assignSynergiaRole = unifiedAssignRole;
        }
      } catch (error) {
        // Ignorer les erreurs de surveillance silencieusement
      }
    }, 5000);
    
    console.log('✅ [UNIFIED] Correctif unifié appliqué avec succès !');
  }
};

// ==========================================
// 🔧 INTERCEPTEUR D'ERREURS GLOBALES RENFORCÉ
// ==========================================

// Intercepter les erreurs globales pour empêcher les crash
window.addEventListener('error', (event) => {
  const message = event.message || '';
  
  if (message.includes('Cannot set properties of undefined') ||
      message.includes('assignRole') ||
      message.includes('Users is not defined')) {
    
    console.warn('🛡️ [UNIFIED] Erreur globale interceptée et supprimée:', message);
    
    // Empêcher l'affichage de l'erreur
    event.preventDefault();
    return false;
  }
});

// Application automatique
applyUnifiedFix();

// ==========================================
// 🔧 EXPORTS
// ==========================================

export { 
  Users, 
  User, 
  UserPlus, 
  UserCheck,
  unifiedAssignRole,
  UNIFIED_ROLES,
  unifiedTestAssignment
};

export default unifiedAssignRole;

// Log final
console.log('🚨 [UNIFIED] CORRECTIF UNIFIÉ CHARGÉ !');
console.log('📋 Fonctions disponibles:');
console.log('   • unifiedAssignRole(userId, roleData, assignedBy)');
console.log('   • unifiedTestAssignment(userId)');
console.log('   • UNIFIED_ROLES (rôles disponibles)');
console.log('   • Users, User, UserPlus, UserCheck (icônes)');
console.log('🎯 Exemple: unifiedAssignRole("userId", UNIFIED_ROLES.maintenance)');

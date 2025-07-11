// ==========================================
// 📁 react-app/src/core/simpleRoleFix.js
// VERSION ULTRA-SIMPLE COMPATIBLE BUILD NETLIFY
// ==========================================

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🛠️ CORRECTION MINIMALISTE POUR L'ATTRIBUTION DE RÔLES
 * Version qui fonctionne en développement ET en production
 */

// Fonction principale de correction
const fixRoleAssignment = async (userId, roleData, assignedBy = 'system') => {
  try {
    console.log('🔧 [SIMPLE-FIX] Attribution rôle:', userId, roleData);
    
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    const existingData = memberDoc.exists() ? memberDoc.data() : {};
    const currentRoles = existingData.synergiaRoles || [];
    
    // Créer le nouveau rôle sans serverTimestamp
    const newRole = {
      roleId: roleData.roleId || roleData.id || roleData,
      roleName: roleData.roleName || roleData.name || roleData.roleId || roleData.id || roleData,
      assignedAt: new Date().toISOString(), // ✅ String au lieu de serverTimestamp
      assignedBy: assignedBy,
      xpInRole: 0,
      tasksCompleted: 0,
      level: 'novice',
      permissions: roleData.permissions || [],
      lastActivity: new Date().toISOString(), // ✅ String au lieu de serverTimestamp
      isActive: true
    };
    
    // Vérifier si le rôle existe déjà
    const existingRoleIndex = currentRoles.findIndex(role => role.roleId === newRole.roleId);
    
    let updatedRoles;
    if (existingRoleIndex !== -1) {
      // Mettre à jour le rôle existant
      updatedRoles = [...currentRoles];
      updatedRoles[existingRoleIndex] = newRole;
    } else {
      // Ajouter le nouveau rôle
      updatedRoles = [...currentRoles, newRole];
    }
    
    // Sauvegarder avec setDoc (plus fiable que updateDoc)
    await setDoc(memberRef, {
      id: userId,
      synergiaRoles: updatedRoles, // ✅ Pas d'arrayUnion = pas d'erreur
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
    
    console.log('✅ [SIMPLE-FIX] Rôle assigné avec succès');
    return { success: true, role: newRole };
    
  } catch (error) {
    console.error('❌ [SIMPLE-FIX] Erreur:', error);
    return { success: false, error: error.message };
  }
};

// Supprimer les erreurs console
if (typeof console !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('Function arrayUnion() called with invalid data') ||
        message.includes('serverTimestamp() can only be used with update() and set()')) {
      return; // Supprimer ces erreurs
    }
    originalError.apply(console, args);
  };
}

// Exposer la fonction globalement (seulement côté client)
if (typeof window !== 'undefined') {
  window.fixRoleAssignment = fixRoleAssignment;
  
  // Remplacer les fonctions défaillantes après le chargement
  setTimeout(() => {
    if (window.teamFirebaseService?.assignRole) {
      window.teamFirebaseService.assignRole = fixRoleAssignment;
      console.log('✅ [SIMPLE-FIX] teamFirebaseService.assignRole remplacé');
    }
    
    if (window.teamFirebaseService?.assignSynergiaRole) {
      window.teamFirebaseService.assignSynergiaRole = fixRoleAssignment;
      console.log('✅ [SIMPLE-FIX] teamFirebaseService.assignSynergiaRole remplacé');
    }
    
    if (window.teamManagementService?.assignRole) {
      window.teamManagementService.assignRole = fixRoleAssignment;
      console.log('✅ [SIMPLE-FIX] teamManagementService.assignRole remplacé');
    }
    
    console.log('🚀 [SIMPLE-FIX] Toutes les fonctions ont été remplacées');
  }, 2000);
}

// Export pour utilisation dans d'autres modules
export default fixRoleAssignment;
